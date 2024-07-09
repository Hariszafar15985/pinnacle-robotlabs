import csv
import decimal
import os
import time

import numpy
import pendulum
from celery import shared_task, states
from celery.result import AsyncResult

from base_api import logger
from portfolio import s3
from .constants import ALL_TRADE, SHORT_TRADE, LONG_TRADE, \
    TRADE_MAP, LIST_ATTR, COMMISSION_LEVEL, DEFAULT_COMMISSION_VALUE, MICRO_MAP, SUM_ATTR
from .models import Robot, BackTest, Trade, DataBackTest
from .serializer import SimulatedReturnSerializer, AllDataSerializer
from .utils import read_df, calculate_single_robot, calculate_multiple_robot, \
    get_data_with_months, process_drawdown, get_monthly_data_multiple


def get_commission(instrument: str, levels: dict):
    commission_in = COMMISSION_LEVEL.get(instrument)
    level = levels.get(instrument, 1)
    if not commission_in:
        commission = DEFAULT_COMMISSION_VALUE.get(level)
    else:
        commission = commission_in.get(level)
    return round(decimal.Decimal(commission), 2)


def store_calculated_data(data: dict, config: list | dict, months: int):
    for group, trades in data.items():
        if trades:
            bt: BackTest = BackTest.objects.filter(config=config,
                                                   months=months,
                                                   group=group).first()
            if not bt:
                bt = BackTest(config=config,
                              months=months,
                              group=group)
            for prop, trade_value in trades.items():
                if trade_value in [numpy.inf, -numpy.inf, numpy.NaN] or str(trade_value) in ['nan', 'NaN', 'NAN']:
                    trade_value = 0
                if hasattr(BackTest, prop):
                    setattr(bt, prop, round(decimal.Decimal(trade_value), 2))
            bt.save()


def fix_store_value(data: list[list]):
    for trade_value in data:
        if trade_value[1] in [numpy.inf, -numpy.inf, numpy.NaN] or str(trade_value[1]) in ['nan', 'NaN', 'NAN']:
            trade_value[1] = 0
    return data


def store_backtest_data(backtest: BackTest, cum_monthly: list, monthly_net: list,
                        weekly_net: list, daily_net: list):
    if not hasattr(backtest, 'databacktest'):
        databacktest = DataBackTest(backtest=backtest)
    else:
        databacktest = backtest.databacktest
    databacktest.monthly_data = cum_monthly
    databacktest.net_monthly = monthly_net
    databacktest.net_weekly = weekly_net
    databacktest.net_daily = daily_net
    databacktest.save()
    return databacktest


def store_drawdown_data(backtest: BackTest, drawdown_monthly: list, drawdown_weekly: list,
                        drawdown_daily: list):
    if not hasattr(backtest, 'databacktest'):
        databacktest = DataBackTest(backtest=backtest)
    else:
        databacktest = backtest.databacktest
    databacktest.drawdown_monthly = fix_store_value(drawdown_monthly)
    databacktest.drawdown_weekly = fix_store_value(drawdown_weekly)
    databacktest.drawdown_daily = fix_store_value(drawdown_daily)
    databacktest.drawdown_daily = fix_store_value(drawdown_daily)
    databacktest.drawdown_cum_monthly = fix_store_value(drawdown_monthly)
    databacktest.save()
    return databacktest


def store_data(group, trades, months, check_date, **kwargs):
    if trades:
        bt = BackTest.objects.filter(months=months, group=group, **kwargs).first()
        if not bt:
            bt = BackTest(group=group, months=months, check_date=check_date, **kwargs)
        for prop, trade_value in trades.items():
            if (trade_value in [numpy.inf, -numpy.inf, numpy.NaN]
                    or str(trade_value) in ['nan', 'NaN', 'NAN']):
                trade_value = 0
            if hasattr(BackTest, prop):
                setattr(bt, prop, round(decimal.Decimal(trade_value), 2))
        bt.save()
        return bt
    else:
        logger.info(f"======= NO DATA {kwargs} {group} - {months} ")


def multiple_dd(base, adding, number):
    for i in adding:
        value = i[1] * number
        if i[0] not in base:
            base[i[0]] = []
        base[i[0]].append(value)
    return base


def multiple_and_add(base, adding, number):
    for i in adding:
        value = i[1] * number
        if i[0] not in base:
            base[i[0]] = value
        else:
            base[i[0]] += value
    return base


@shared_task()
def calculate_multiple_task(query_config_all: list[dict], months: int, contracts):
    sorted_contracts = sorted(contracts.items())
    all_bt = BackTest.objects.filter(contracts=sorted_contracts,
                                     months=months,
                                     group=ALL_TRADE,
                                     config=query_config_all).first()

    if not all_bt:
        cal_all_data, cal_long_data, cal_short_data, df = calculate_multiple_robot(config=query_config_all,
                                                                                   months=months,
                                                                                   contracts=contracts)
        monthly = get_monthly_data_multiple(df)
        all_bt = store_data(ALL_TRADE,
                            cal_all_data,
                            months,
                            config=query_config_all,
                            check_date=None,
                            contracts=sorted_contracts)
        DataBackTest.objects.create(backtest=all_bt, monthly_data=monthly)
        long_bt = store_data(LONG_TRADE, cal_long_data,
                             months,
                             config=query_config_all,
                             check_date=None,
                             contracts=sorted_contracts)
        short_bt = store_data(SHORT_TRADE, cal_short_data,
                              months,
                              config=query_config_all,
                              check_date=None,
                              contracts=sorted_contracts)
    else:
        long_bt = BackTest.objects.filter(contracts=sorted_contracts,
                                          months=months,
                                          group=LONG_TRADE,
                                          config=query_config_all).first()
        short_bt = BackTest.objects.filter(contracts=sorted_contracts,
                                           months=months,
                                           group=SHORT_TRADE,
                                           config=query_config_all).first()

    monthly = all_bt.databacktest.monthly_data

    all_bt = AllDataSerializer(all_bt).data
    long_bt = AllDataSerializer(long_bt).data
    short_bt = AllDataSerializer(short_bt).data

    return all_bt, long_bt, short_bt, monthly


@shared_task
def calculate_and_save_bot_data_new(robots: list[dict], levels: dict, months: int):
    # logger.info(f"Proccessing Config {robots} {levels} {months}--")
    # base_monthly = {}
    skus = [robot.get('sku') for robot in robots]
    logger.info(f"Proccessing Config {skus} | {months}--")
    contracts = {}

    main_all = {i: 0 for i in LIST_ATTR}
    main_long = {i: 0 for i in LIST_ATTR}
    main_short = {i: 0 for i in LIST_ATTR}

    base_drawdown_monthly = {}
    base_drawdown_cum_monthly = {}
    base_drawdown_weekly = {}
    base_drawdown_daily = {}

    base_monthly_net = {}
    base_weekly_net = {}
    base_daily_net = {}

    query_config_all = []

    robots_cum_data = {}
    robots_cum_drawdown = {}

    robots = sorted(robots, key=lambda xro: xro['sku'])

    latest_trades = []
    oldest_trades = []

    month_to_date = pendulum.now().subtract(months=months)

    for r in robots:
        instruments = r.get('instruments')
        sku = r.get('sku')
        contracts[sku] = {}
        for instrument, number_of_contract in instruments.items():
            query_config = {sku: instrument}
            query_config_all.append(query_config)
            contracts[sku][instrument] = number_of_contract
            if instrument in MICRO_MAP:
                robot = Robot.objects.get(sku=sku, regular=instrument)
            else:
                robot = Robot.objects.get(sku=sku, micro=instrument)

            lt = robot.trade_set.filter(instrument=instrument).order_by('exit_time').last()
            if lt:
                latest_trades.append(lt.exit_time)
            et = robot.trade_set.filter(instrument=instrument, exit_time__gt=month_to_date).order_by(
                'exit_time').first()
            if et:
                oldest_trades.append(et.exit_time)

    task_result: AsyncResult = calculate_multiple_task.delay(query_config_all, months, contracts=contracts)

    # get list month from latest trade.
    start_date = pendulum.instance(max(latest_trades))
    end_date = pendulum.instance(min(oldest_trades))

    list_month = []
    for i in range(months + 1):
        m = start_date.subtract(months=i)
        if m < end_date:
            break
        list_month.append(m.format('MM/01/YYYY'))

    for r in robots:
        instruments = r.get('instruments')
        sku = r.get('sku')
        for instrument, number_of_contract in instruments.items():
            query_config = {sku: instrument}
            if instrument in MICRO_MAP:
                robot = Robot.objects.get(sku=sku, regular=instrument)
            else:
                robot = Robot.objects.get(sku=sku, micro=instrument)
            all_bt, long_bt, short_bt = None, None, None
            robot_monthly = []
            old_ = robot.trade_set.filter(instrument=instrument).order_by('exit_time').first()
            if not old_:
                continue
            check_exit_time = pendulum.instance(old_.exit_time)
            store_check_date = None

            if month_to_date < check_exit_time:
                logger.info('Getting nearest calculated backtest instead if calculate again')
                store_check_date = check_exit_time
                all_bt, long_bt, short_bt = BackTest.get_by_check_date(query_config, check_date=store_check_date)

            if all_bt:
                logger.info(f"Found cached data for: {store_check_date} {all_bt}")
            else:
                all_bt, long_bt, short_bt = BackTest.get_by_config(query_config, months=months)

            if not all_bt:
                all_trades, long_trades, short_trades, df = calculate_single_robot(robot, instrument, months)
                if not all_trades:
                    logger.error(f"There is no trades for {robot}")
                    continue
                cum_monthly, net_monthly, net_weekly, net_daily = get_data_with_months(df, list_month)

                all_bt = store_data(ALL_TRADE, all_trades, months, robot=robot, check_date=store_check_date,
                                    config=query_config)
                long_bt = store_data(LONG_TRADE, long_trades, months, robot=robot, check_date=store_check_date,
                                     config=query_config)
                short_bt = store_data(SHORT_TRADE, short_trades, months, robot=robot, check_date=store_check_date,
                                      config=query_config)

                store_backtest_data(all_bt, cum_monthly, net_monthly, net_weekly, net_daily)
                drawdown_monthly, drawdown_weekly, drawdown_daily = process_drawdown(df, list_month)
                store_drawdown_data(all_bt, drawdown_monthly, drawdown_weekly, drawdown_daily)

            databacktest = all_bt.databacktest

            for m in databacktest.monthly_data:
                m_value = decimal.Decimal(m[1]) * number_of_contract
                robot_monthly.append([m[0], m_value])

            robots_cum_data[robot.id] = robot_monthly

            all_bt.commission = get_commission(instrument, levels) * all_bt.total_of_trades
            if long_bt:
                long_bt.commission = get_commission(instrument, levels) * long_bt.total_of_trades
            if short_bt:
                short_bt.commission = get_commission(instrument, levels) * short_bt.total_of_trades

            for i in SUM_ATTR:
                main_all[i] += round(getattr(all_bt, i) * number_of_contract, 2)
                if long_bt:
                    main_long[i] += round(getattr(long_bt, i) * number_of_contract, 2)
                if short_bt:
                    main_short[i] += round(getattr(short_bt, i) * number_of_contract, 2)

            base_drawdown_monthly = multiple_dd(base_drawdown_monthly, databacktest.drawdown_monthly,
                                                number_of_contract)
            base_drawdown_weekly = multiple_dd(base_drawdown_weekly, databacktest.drawdown_weekly, number_of_contract)
            base_drawdown_daily = multiple_dd(base_drawdown_daily, databacktest.drawdown_daily, number_of_contract)

            base_drawdown_cum_monthly = multiple_dd(base_drawdown_cum_monthly, databacktest.drawdown_monthly,
                                                    number_of_contract)
            robots_cum_drawdown[robot.id] = databacktest.drawdown_monthly

            base_monthly_net = multiple_and_add(base_monthly_net, databacktest.net_monthly, number_of_contract)
            base_weekly_net = multiple_and_add(base_weekly_net, databacktest.net_weekly, number_of_contract)
            base_daily_net = multiple_and_add(base_daily_net, databacktest.net_daily, number_of_contract)

    base_drawdown_monthly = sorted(base_drawdown_monthly.items(),
                                   key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))
    drawdown_monthly = []
    for key, value in base_drawdown_monthly:
        drawdown_monthly.append([key, min(value)])

    # re-sort
    base_drawdown_weekly_sorted = sorted(base_drawdown_weekly.items(),
                                         key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))
    base_drawdown_daily_sorted = sorted(base_drawdown_daily.items(),
                                        key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))
    base_weekly_net = sorted(base_weekly_net.items(), key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))
    base_daily_net = sorted(base_daily_net.items(), key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))
    base_monthly_net = sorted(base_monthly_net.items(), key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))

    # base_monthly = sorted(base_monthly.items(), key=lambda b: pendulum.from_format(b[0], 'MM/DD/YYYY'))

    map_dd_weekly = {}
    new_dd_weekly = {}

    for d in base_drawdown_weekly_sorted:
        the_day = pendulum.from_format(d[0], 'MM/DD/YYYY')
        week = f"{the_day.week_of_year}-{the_day.year}"
        if week not in map_dd_weekly:
            map_dd_weekly[week] = {"day": d[0], "data": []}
        map_dd_weekly[week]['day'] = d[0]
        map_dd_weekly[week]['data'].append(min(d[1]))

    for key, val in map_dd_weekly.items():
        new_dd_weekly[val.get('day')] = min(val.get('data'))

    map_net_weekly = {}
    new_net_weekly = {}

    for key, value in base_weekly_net:
        the_day = pendulum.from_format(key, 'MM/DD/YYYY')
        week = f"{the_day.week_of_year}-{the_day.year}"
        if week not in map_net_weekly:
            map_net_weekly[week] = {"day": key, "data": []}
        map_net_weekly[week]['day'] = key
        map_net_weekly[week]['data'].append(value)

    for key, val in map_net_weekly.items():
        new_net_weekly[val.get('day')] = sum(val.get('data'))

    drawdown = {
        'drawdown_monthly': drawdown_monthly,
        'drawdown_cum_monthly': [[key, min(value)] for key, value in base_drawdown_cum_monthly.items()],
        'drawdown_weekly': [[key, value] for key, value in new_dd_weekly.items()],
        'drawdown_daily': [[key, min(value)] for key, value in base_drawdown_daily_sorted],
        'individual': robots_cum_drawdown
    }

    net_profit = {
        'monthly_net': [[key, value] for key, value in base_monthly_net],
        'weekly_net': [[key, value] for key, value in new_net_weekly.items()],
        'daily_net': [[key, value] for key, value in base_daily_net],
    }

    # monthly = [[key, round(val, 2)] for key, val in base_monthly]

    final_all = {}
    final_long = {}
    final_short = {}
    monthly = []
    resp_all, resp_long, resp_short = None, None, None
    for i in range(100):
        if task_result.status in [states.FAILURE, states.REVOKED, states.REJECTED]:
            return None
        if task_result.status == 'SUCCESS':
            resp_all, resp_long, resp_short, monthly = task_result.result
            final_all, final_long, final_short = merge_dict(resp_all, resp_long, resp_short,
                                                            main_all, main_long, main_short)
        else:
            time.sleep(1)

    final_all['max_drawdown'] = resp_all.get('max_drawdown')
    final_long['max_drawdown'] = resp_long.get('max_drawdown')
    final_short['max_drawdown'] = resp_short.get('max_drawdown')

    data = {
        "all_trades": SimulatedReturnSerializer(final_all).data,
        "long_trades": SimulatedReturnSerializer(final_long).data,
        "short_trades": SimulatedReturnSerializer(final_short).data,
        "cum_profit": {
            "monthly": monthly,
            "individual": robots_cum_data
        },
        "net_profit": net_profit,
        "drawdown": drawdown,
    }

    return data


def merge_dict(bt_all, bt_long, bt_short, main_all, main_long, main_short):
    final_all = {}
    final_long = {}
    final_short = {}
    for key, val in main_all.items():
        if key not in SUM_ATTR:
            final_all[key] = round(decimal.Decimal(bt_all.get(key, 0)), 2)
        else:
            final_all[key] = val

    if bt_long:
        for key, val in main_long.items():
            if key not in SUM_ATTR:
                final_long[key] = round(decimal.Decimal(bt_long.get(key, 0)), 2)
            else:
                final_long[key] = val
    else:
        final_long = main_long

    if bt_short:
        for key, val in main_short.items():
            if key not in SUM_ATTR:
                final_short[key] = round(decimal.Decimal(bt_short.get(key, 0) or 0), 2) #added or 0 after bt_short.get to fix issue if the data is null(non integer)
            else:
                final_short[key] = val
    else:
        final_short = main_short
    return final_all, final_long, final_short


def merge_result(bt_all, bt_long, bt_short, main_all, main_long, main_short):
    final_all = {}
    final_long = {}
    final_short = {}
    for key, val in main_all.items():
        if key not in SUM_ATTR:
            final_all[key] = round(getattr(bt_all, key), 2)
        else:
            final_all[key] = val

    if bt_long:
        for key, val in main_long.items():
            if key not in SUM_ATTR:
                final_long[key] = round(getattr(bt_long, key), 2)
            else:
                final_long[key] = val
    else:
        final_long = main_long

    if bt_short:
        for key, val in main_short.items():
            if key not in SUM_ATTR:
                final_short[key] = round(getattr(bt_short, key), 2)
            else:
                final_short[key] = val
    else:
        final_short = main_short
    return final_all, final_long, final_short


# bt mean all
def merge_dict_result(bt_all, bt_long, bt_short, main_all, main_long, main_short):
    for key, val in main_all.items():
        if key in SUM_ATTR:
            bt_all[key] = val

    for key, val in main_long.items():
        if key in SUM_ATTR:
            bt_long[key] = val

    for key, val in main_short.items():
        if key in SUM_ATTR:
            bt_short[key] = val

    return bt_all, bt_long, bt_short


def map_data(data, bot: Robot) -> list:
    list_trades = []
    obj = {}
    defaults = {}
    for i in data:
        for key, value in i.items():
            if not key:
                continue
            obj[TRADE_MAP[key]] = value
            try:
                defaults["entry_time"] = pendulum.from_format(i['Entry time'], 'M/D/YYYY H:mm:ss A')
            except Exception:
                defaults["entry_time"] = pendulum.from_format(i['Entry time'], 'M/D/YYYY HH:mm')
            defaults["instrument"] = i['Instrument'].split(' ')[0]
            defaults["signal_name"] = i['Strategy']
            defaults["raw_instrument"] = i['Instrument']
            if "$" in value or key in ["Entry price", "Exit price"]:
                obj[TRADE_MAP[key]] = fix_number(value)

        obj["raw_instrument"] = defaults["raw_instrument"]
        obj["instrument"] = defaults["instrument"]
        obj["entry_time"] = defaults["entry_time"]
        try:
            obj["exit_time"] = pendulum.from_format(i['Exit time'], 'M/D/YYYY H:mm:ss A')
        except Exception:
            obj["exit_time"] = pendulum.from_format(i['Exit time'], 'M/D/YYYY HH:mm')

        list_trades.append(Trade(**obj, robot_id=bot.id, product_sku=bot.sku))
    return list_trades


def get_from_s3(file_name, bot: Robot):
    logger.info(f'---- GETTING FILE [{file_name}]-----')
    data = read_df(s3.get_file_data(file_name))
    if not data:
        logger.warn(f'------- ERROR [{file_name}]-----')
        return []
    list_trades = map_data(data, bot)
    return list_trades


M = {
    'Period': 'period',
    'Cum. net profit': 'cum_net_profit',
    'Net profit': 'net_profit'
}

NORMALIZE_NAME = {
    'Standard _ Rich_s': "Standard & Rich's",
    'Mother Nature_s Hedge': "Mother Nature's Hedge",
    'Uncle Sam_s Bookie': "Uncle Sam's Bookie"
}

# re-map
S3_NAME = {
    "Standard & Rich's": 'Standard _ Rich_s',
    "Uncle Sam's Bookie": 'Uncle Sam_s Bookie',
    "Mother Nature's Hedge": 'Mother Nature_s Hedge',
}


@shared_task
def sync_trades_from_s3():
    count = Trade.objects.all().delete()
    BackTest.objects.all().delete()
    logger.info(f"----- DELETED {count[0]} records")
    list_files = s3.list_files()
    robots = []
    for bot in Robot.objects.all():
        robot_name = bot.name
        if robot_name in S3_NAME:
            robot_name = S3_NAME.get(robot_name)
        if bot.regular:
            regular = f'{bot.regular} {robot_name} - Trades.csv'
            if regular in list_files:
                list_trades = get_from_s3(regular, bot)
                trades = Trade.objects.bulk_create(list_trades)
                logger.info(f"[{bot.name} | {regular}] Imported {len(trades)}")
                robots.append(bot.id)
        if bot.micro:
            micro = f'{bot.micro} {robot_name} - Trades.csv'
            if micro in list_files:
                list_trades = get_from_s3(micro, bot)
                trades = Trade.objects.bulk_create(list_trades)
                logger.info(f"[{bot.name} | {micro}] Imported {len(trades)}")
                robots.append(bot.id)
    for r in Robot.objects.filter(active=True).exclude(id__in=list(set(robots))):
        print(r.name)


def get_from_file(file, bot):
    with open(file, 'r') as f:
        data = csv.DictReader(f)
        list_trades = map_data(data, bot)
        return list_trades


@shared_task
def get_trades_from_csv():
    for bot in Robot.objects.all():
        robot_name = bot.name
        if robot_name in S3_NAME:
            robot_name = S3_NAME.get(robot_name)
        if bot.regular:
            regular_name = f'{bot.regular} {robot_name} - Trades.csv'
            path = os.path.join('portfolio/Trades/', regular_name)
            if os.path.exists(path):
                print(regular_name)
                list_trades = get_from_file(path, bot)
                trades = Trade.objects.bulk_create(list_trades)
                if len(list_trades) != len(trades):
                    logger.warning(f"-------- Invalid Trades {bot.name}--------")
            else:
                logger.warning(f'No Trades found ---{regular_name}')
        if bot.micro:
            micro = f'{bot.micro} {robot_name} - Trades.csv'
            path = os.path.join('portfolio/Trades/', micro)
            if os.path.exists(path):
                print(micro)
                list_trades = get_from_file(path, bot)
                trades = Trade.objects.bulk_create(list_trades)
                if len(list_trades) != len(trades):
                    logger.warning(f"-------- Invalid Trades {bot.name}--------")
            else:
                logger.warning(f'No Trades found --- {micro}')


@shared_task
def sync_single_robot_trades_from_s3(name: str, regular: str = None, micro: str = None):
    if regular:
        bot = Robot.objects.filter(name=name, regular=regular).first()
        file_name = f'{bot.regular} {name} - Trades.csv'
        list_trades = get_from_s3(file_name, bot)
        trades = Trade.objects.bulk_create(list_trades)
        logger.info(f"[{bot.name} | {regular}] Imported {len(trades)}")
    if micro:
        bot = Robot.objects.filter(name=name, micro=micro).first()
        file_name = f'{bot.micro} {name} - Trades.csv'
        list_trades = get_from_s3(file_name, bot)
        trades = Trade.objects.bulk_create(list_trades)
        logger.info(f"[{bot.name} | {micro}] Imported {len(trades)}")


def get_robot_from_file_name(file_name: str) -> tuple:
    # filename = 'Monthly/6E Lazy River - Monthly Cumulative Net Profit.csv'
    combine = file_name.split('/')[1].split('-')[0].strip()
    _split = combine.split(' ')
    instrument = _split[0]
    robot_name = " ".join(_split[1:])
    return instrument.strip(), robot_name.strip()


def fix_number(text: str) -> decimal.Decimal:
    text = text.replace('(', '-')
    text = text.replace(')', '')
    text = text.replace('$', '')
    text = text.replace(',', '')
    text = text.replace("'", ".")
    return decimal.Decimal(text)
