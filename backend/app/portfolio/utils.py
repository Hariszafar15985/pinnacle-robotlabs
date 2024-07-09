import os
from datetime import datetime

import pandas as pd
import pendulum
from django.conf import settings
from pandas import DataFrame

from base_api import logger
from portfolio.constants import BOT_NAMES, LIST_ATTR, CRM_TO_STL_MAP, LONG, SHORT, TRADE_MAP
from portfolio.models import Trade, Robot
from portfolio.nt8_new import CalculationDF, DfCalculationLite
from portfolio.serializer import SimulatedReturnSerializer

ALL = 'All'
WP_CACHE_KEY = 'WP_TOKEN'

MOCK = False


def excel_to_csv():
    folder_path = os.path.join(settings.BASE_DIR, 'portfolio', 'ChartData')
    for name in BOT_NAMES:
        file_path = f'{folder_path}/{name}.xlsx'
        try:
            df = pd.read_excel(file_path)
            df.to_csv(f'{folder_path}/{name}.csv', encoding='utf-8', index=False)
        except Exception as e:
            logger.info(e)


def return_backtest_format(calculator):
    data = {}
    for key in LIST_ATTR:
        if hasattr(calculator, f'_{key}'):
            value = round(getattr(calculator, f'_{key}'), 2)
            data[key] = round(getattr(calculator, f'_{key}'), 2)
    return data


def process_monthly_data(df: DataFrame, field: str = 'cum_net_profit'):
    data = {}
    result = [(x, y) for x, y in zip(df['exit_time'], df[field])]
    for r in result:
        exit_time = pendulum.instance(r[0])
        month_text = f'{0 if exit_time.month < 10 else ""}{exit_time.month}/01/{exit_time.year}'
        if month_text not in data:
            data[month_text] = []
        data[month_text].append(r[1])

    ordered_data = sorted(data.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    response = []
    for key in ordered_data:
        calculcated_data = key[1][-1]
        response.append([key[0], calculcated_data])
    return response


def get_monthly_data_multiple(df: DataFrame):
    cum_data = {}
    result = [(x, y) for x, y in zip(df['exit_time'], df['cum_net_profit'])]
    for r in result:
        pen_instance = pendulum.instance(r[0])
        month_text = pen_instance.format('MM/01/YYYY')
        day_text = pen_instance.format('MM/DD/YYYY')
        if month_text not in cum_data:
            cum_data[month_text] = []
        cum_data[month_text].append(r[1])

    new_cum_data = {}

    for key, val in cum_data.items():
        new_cum_data[key] = val[-1]

    ordered_data = sorted(new_cum_data.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    return ordered_data


def get_data_with_months(df: DataFrame, list_month: list[str]):
    cum_data = {}
    daily_net_data = {}
    mothly_net_data = {}
    result = [(x, y, z) for x, y, z in zip(df['exit_time'], df['cum_net_profit'], df['profit'])]

    # Notes : Using Sum for day/week/month
    for r in result:
        pen_instance = pendulum.instance(r[0])
        month_text = pen_instance.format('MM/01/YYYY')
        day_text = pen_instance.format('MM/DD/YYYY')
        if month_text not in cum_data:
            cum_data[month_text] = []

        if day_text not in daily_net_data:
            daily_net_data[day_text] = []
        cum_data[month_text].append(r[1])
        if month_text not in mothly_net_data:
            mothly_net_data[month_text] = []
            mothly_net_data[month_text].append(r[2])
        else:
            mothly_net_data[month_text].append(r[2])
        daily_net_data[day_text].append(r[2])

    new_cum_data = {}
    for month, value in cum_data.items():
        new_cum_data[month] = value[-1]  # get latest calculated for month

    # try to set default value for missing trade data.
    for index, value in enumerate(list_month):
        if index + 1 < len(list_month):
            prev = list_month[index + 1]
            new_data = 0
            if value not in new_cum_data:
                if prev in new_cum_data:
                    new_data = new_cum_data[prev]
                # logger.warning(f'[Cum net profit] No trades in [{value}] -> set to {new_data} [{prev}]')
                new_cum_data[value] = new_data

    new_day_net_data = {}
    for day, value in daily_net_data.items():
        new_day_net_data[day] = sum(value)

    new_month_net_data = {}
    for day, value in mothly_net_data.items():
        new_month_net_data[day] = sum(value)

    ordered_data = sorted(new_cum_data.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    ordered_month_net_data = sorted(new_month_net_data.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    ordered_day_net_data = sorted(new_day_net_data.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    cum_monthly = []

    net_monthly = []
    net_weekly = []
    net_daily = []
    added_week = {}

    for key in ordered_data:
        cum_monthly.append([key[0], float(key[1])])

    for key in ordered_month_net_data:
        net_monthly.append([key[0], float(key[1])])

    for d in ordered_day_net_data:
        value = float(d[1])
        if value != 0:
            the_day = pendulum.from_format(d[0], 'MM/DD/YYYY')
            week = f"{the_day.week_of_year}-{the_day.year}"
            if week not in added_week:
                added_week[week] = {"day": d[0], "data": []}
                added_week[week]["day"] = d[0]
                added_week[week]["data"].append(value)
                net_daily.append([d[0], value])

    for key, val in added_week.items():
        net_weekly.append([val.get("day"), sum(val.get('data'))])

    return cum_monthly, net_monthly, net_weekly, net_daily


def calculate_multiple_robot(config: list[dict],
                             months: int = None,
                             contracts: dict = None) -> tuple[dict, dict, dict, DataFrame]:
    dfs = []
    start_date = None
    if months:
        start_date = pendulum.now().subtract(months=months).set(day=1, hour=0, minute=0, second=0, microsecond=0)

    # -------------------------------- hard coded for testing purpose ---------------------------------------
    if MOCK:
        start_date = pendulum.now().set(year=2008, month=1, day=1).set(hour=0, minute=0, second=0, microsecond=0)
        print(start_date)
    # -------------------------------------------------------------------------------------------------------

    list_market_pos = []
    for data in config:
        for sku, instrument in data.items():
            if contracts:
                sku_contr = contracts.get(sku)
                if not sku_contr:
                    number_of_contract = 1
                else:
                    number_of_contract = sku_contr.get(instrument)
            else:
                number_of_contract = 1
            df = pd.DataFrame()
            robot = Robot.get_robot_by_instrument(sku, instrument)
            if not robot:
                print(f"------- INVALID ROBOT {sku} - {instrument} ------")
                continue
            if start_date:
                trades = robot.trade_set.filter(instrument=instrument, exit_time__gt=start_date)
            else:
                trades = robot.trade_set.filter(instrument=instrument)
            list_market_pos += list(set(trades.values_list('market_pos', flat=True)))
            if trades.count() == 0:
                print(f"*** There are no trade for: {sku} | {instrument} | {months} ***")
                continue
            trade_data = list(trades.values())
            for i in trade_data:
                i['contract'] = number_of_contract
            df = df.from_dict(trade_data)
            dfs.append(df)

    if len(dfs) > 0:
        calculator = CalculationDF(dfs, None)
        calculator.process()
    else:
        return {}, {}, {}, []

    long_data = {}
    short_data = {}
    all_data = return_backtest_format(calculator)

    if LONG in list_market_pos:
        calculator_long = CalculationDF(dfs, LONG)
        calculator_long.process()
        long_data = return_backtest_format(calculator_long)
    if SHORT in list_market_pos:
        calculator_short = CalculationDF(dfs, SHORT)
        calculator_short.process()
        short_data = return_backtest_format(calculator_short)

    return all_data, long_data, short_data, calculator.df


# noinspection PyTypeChecker
def calculate_single_robot(robot: Robot, instrument: str, months: int = None):
    start_date = None
    long_data = {}
    short_data = {}

    if months:
        start_date = pendulum.now().subtract(months=months).set(day=1, hour=0, minute=0, second=0, microsecond=0)

    if MOCK:
        # -------------------------------- hard coded
        start_date = pendulum.now().set(year=2019, month=5, day=6)
        # ---------------------------------

    list_market_pos = []
    df = pd.DataFrame()

    if start_date:
        trades = robot.trade_set.filter(instrument=instrument, exit_time__gte=start_date)
    else:
        trades = robot.trade_set.filter(instrument=instrument)

    list_market_pos += list(set(trades.values_list('market_pos', flat=True)))
    if trades.count() == 0:
        print(f"*** There are no trade for: {robot} | {instrument} | {months} ***")
        return {}, {}, {}, []
    trade_data = list(trades.values())
    for trade in trade_data:
        trade['contract'] = 1
    df = df.from_dict(trade_data)
    calculator = DfCalculationLite([df], None)
    calculator.process()

    all_data = return_backtest_format(calculator)

    if LONG in list_market_pos:
        calculator_long = DfCalculationLite([df], market_pos=LONG)
        calculator_long.process()
        long_data = return_backtest_format(calculator_long)
    if SHORT in list_market_pos:
        calculator_short = DfCalculationLite([df], market_pos=SHORT)
        calculator_short.process()
        short_data = return_backtest_format(calculator_short)

    return all_data, long_data, short_data, calculator.df


def return_serializer(all_trades, long_trades, short_trades):
    return {
        'all_trades': SimulatedReturnSerializer(all_trades).data,
        'long_trades': SimulatedReturnSerializer(long_trades).data,
        'short_trades': SimulatedReturnSerializer(short_trades).data,
    }


def reformat_trade_data(data: list[dict], model):
    processed = []
    list_datetime = ["entry_time", "exit_time"]
    if not isinstance(data, list):
        raise RuntimeError("Invalid data type")
    for d in data:
        m = {}
        for key, value in d.items():
            if not type(value) is str:
                value = round(value, 15)
            if key in CRM_TO_STL_MAP:
                key = CRM_TO_STL_MAP[key]
            if key in list_datetime:
                value = pendulum.parse(value)
            if key in ['instant_calc', 'clean_data']:
                m.update({key: value})
            else:
                key = key.removeprefix("trade_")
                if hasattr(model, key):
                    m.update({key: value})
        processed.append(m)
    return processed


def remove_dollar_sign(df: DataFrame, columns: list = None):
    if columns is None:
        columns = ['Profit', 'Cum. net profit', 'Commission', 'MAE', 'MFE', 'ETD']
    convert_dict = {}
    for c in columns:
        df.loc[:, c] = df.loc[:, c].str.strip() \
            .str.replace('(', '-', regex=False) \
            .str.replace(')', '', regex=False) \
            .str.replace('$', '', regex=False) \
            .str.replace(',', '', regex=False)
        convert_dict[c] = float

    df = df.astype(convert_dict)
    if 'Unnamed: 19' in df.columns:
        df.drop('Unnamed: 19', axis='columns', inplace=True)

    return df


def fix_dates(df: DataFrame, date: str = "Exit time"):
    df[date] = pd.to_datetime(df[date])
    return df


def get_bot_trade_data_df(file_path) -> list[dict]:
    logger.info(file_path)
    if os.path.isfile(file_path):
        return read_df(file_path)


def read_df(f) -> list[dict]:
    df = pd.read_csv(f)
    df = remove_dollar_sign(df)
    df = fix_dates(df)
    return df.to_dict(orient='records')


def get_trade_from_csv():
    folder_path = os.path.join(settings.BASE_DIR, 'portfolio', 'Trades')
    list_files = os.listdir(folder_path)
    for bot in Robot.objects.filter(name='Henry Hubber'):
        list_trades = []
        for f in list_files:
            if f == "Monthly":
                continue
            if bot.name in f:
                data = get_bot_trade_data_df(os.path.join(folder_path, f))
                if not data:
                    continue
                for i in data:
                    obj = {}
                    defaults = {}
                    for key, value in i.items():
                        if key == 'Account':
                            continue
                        obj[TRADE_MAP[key]] = value
                        try:
                            defaults["entry_time"] = pendulum.from_format(i['Entry time'], 'M/D/YYYY H:mm:ss A')
                        except Exception as e:
                            print(e)
                            defaults["entry_time"] = pendulum.from_format(i['Entry time'], 'M/D/YYYY HH:mm')
                        defaults["instrument"] = i['Instrument'].split(' ')[0]
                        defaults["signal_name"] = i['Strategy']
                        defaults["raw_instrument"] = i['Instrument']

                    obj["raw_instrument"] = defaults["raw_instrument"]
                    obj["instrument"] = defaults["instrument"]
                    obj["entry_time"] = defaults["entry_time"]
                    obj['exit_time'] = pendulum.instance(i['Exit time'].to_pydatetime())
                    list_trades.append(Trade(**obj, robot_id=bot.id, product_sku=bot.sku))

        Trade.objects.bulk_create(list_trades)


def process_drawdown(df: DataFrame, list_month: list[str]) -> tuple[list, list, list]:
    result = [(x, y) for x, y in zip(df['exit_time'], df['dd_value'])]

    dd_monthly = {}
    dd_daily = {}

    for r in result:
        pen_instance = pendulum.instance(r[0])
        month_text = pen_instance.format('MM/01/YYYY')
        day_text = pen_instance.format('MM/DD/YYYY')
        if month_text not in dd_monthly:
            dd_monthly[month_text] = []

        if day_text not in dd_daily:
            dd_daily[day_text] = []
        dd_monthly[month_text].append(r[1])
        dd_daily[day_text].append(r[1])

    new_dd_monthly = {}

    for i in list_month:
        if i not in dd_monthly:
            new_dd_monthly[i] = 0
            # logger.warning(f'[Drawdown] No trades in [{i}] -> set to 0')
        else:
            new_dd_monthly[i] = min(dd_monthly[i])

    new_dd_daily = {}
    for day, value in dd_daily.items():
        val = min(value)
        if val < 0:
            new_dd_daily[day] = val

    # drawdown
    ordered_dd_monthly = sorted(new_dd_monthly.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))
    ordered_dd_daily = sorted(new_dd_daily.items(), key=lambda x: pendulum.from_format(x[0], 'MM/DD/YYYY'))

    map_dd_weekly = {}
    new_dd_weekly = {}

    dd_daily = []
    for d in ordered_dd_daily:
        the_day = pendulum.from_format(d[0], 'MM/DD/YYYY')
        week = f"{the_day.week_of_year}-{the_day.year}"
        if week not in map_dd_weekly:
            map_dd_weekly[week] = {"day": d[0], "data": []}
        map_dd_weekly[week]['day'] = d[0]
        map_dd_weekly[week]['data'].append(d[1])
        dd_daily.append([d[0], d[1]])

    for key, val in map_dd_weekly.items():
        new_dd_weekly[val.get('day')] = min(val.get('data'))

    dd_monthly = []
    for key in ordered_dd_monthly:
        dd_monthly.append([key[0], key[1]])

    dd_weekly = []

    for key, value in new_dd_weekly.items():
        dd_weekly.append([key, value])

    return dd_monthly, dd_weekly, dd_daily


def get_period_month(d: datetime):
    now = pendulum.now()
    return (now - pendulum.instance(d)).years * 12
