# %%

# https://ninjatrader.com/support/forum/forum/ninjatrader-8/platform-technical-support-aa/1140048-sortino-ratio-not-calculated-correctly
# -> http://www.redrockcapital.com/Sortino__A__Sharper__Ratio_Red_Rock_Capital.pdf


# https://www.codearmo.com/blog/sharpe-sortino-and-calmar-ratios-python


# Import math Library
import math
from datetime import timedelta
import numpy as np
import pandas as pd
import pendulum
from scipy.stats import linregress
from portfolio.constants import POINT_VALUE_MAP

np.seterr(divide='ignore', invalid='ignore')

MARKET_POS = "market_pos"
LONG = 'Long'
SHORT = 'Short'
PROFIT = 'profit'
COMMISSION = 'commission'
EXIT_TIME = 'exit_time'
ENTRY_TIME = 'entry_time'
INSTRUMENT = 'instrument'
CUM_NET_PROFIT = 'cum_net_profit'
PROFIT_PERCENT = 'profit_percent'
POINTS = 'profit_points'
ENTRY_PRICE = 'entry_price'
EXIT_PRICE = 'exit_price'
QUANTITY = 'quantity'
CUM_PROFIT_PERCENT = 'cum_profit_percent'
GROSS_PROFIT_PERCENT = 'gross_profit_percent'
BARS = 'bars'
GROSS_LOSS_PERCENT = 'gross_loss_percent'
MAE = "mae"
MFE = "mfe"
ETD = "etd"
TRADE = "etd"
CONTRACT = "contract"
MAX_CUM_PROFIT = 'max_cum_profit'
CUM_PERCENT_PER_MONTH = 'cum_percent_per_month'
MAX_CUM_NET_PROFIT = 'max_cum_net_profit'
POINT_VALUE = 'Point value'
MONTH = 'Month'
MAX_DD_VALUE = 'max_dd_value'
CUM_MAX_DD = 'cum_max_dd'
MAX_DD = 'max_dd'
DRAWDOWN = 'dd'
DRAWDOWN_VALUE = 'dd_value'
FLAT_PERIOD = 'fp'
TRADE_PERIOD_DIFF = 'trade_period_diff'


class CalculationDF:
    df = None
    risk_free_rate = 0
    month_df = None

    _start_date = None
    _days = 0
    days_in_month = 30.5
    _total_net_profit = 0
    _profit = 0
    _total_net_profit_percent = 0
    _cum_profit = 0
    _cum_profit_percent = 0
    _gross_profit = 0
    _gross_profit_percent = 0
    _gross_loss = 0
    _gross_loss_percent = 0
    _profit_per_month_percent = 0
    _commission = 0
    _profit_factor = 0
    _max_drawdown = 0
    _sharpe_ratio = 0
    _sortino_ratio = 0
    _cum_percent_month = 0
    _monthly_down_target = 0
    _monthly_std_dev = 0
    _ulcer_index = 0  # avg this from csv files directly
    _r_squared = 0
    _total_slippage = 0
    _avg_mae = 0
    _total_of_trades = 0
    _even_trades = 0
    _avg_trade_percent = 0
    _percent_profitable = 0
    _winning_trades = 0
    _losing_trades = 0
    _avg_trade = 0
    _avg_winning_trade = 0
    _avg_losing_trade = 0
    _ratio_win_loss = 0
    _max_consec_winners = 0
    _max_consec_losers = 0
    _largest_winning_trade = 0
    _largest_losing_trade = 0
    _avg_trades_per_day = 0
    _avg_trades_per_quarter = 0
    _avg_time_in_market = 0  # avg this from csv files directly
    _avg_bars_in_trade = 0  # avg this from csv files directly
    _profit_per_month = 0
    _profit_per_quarter = 0
    _max_time_to_recover = 0
    _longest_flat_period = 0
    _avg_mae_ = 0
    _avg_mfe = 0
    _avg_etd = 0

    _sums = 0

    _number_of_trading_days = 0
    # Vars
    v_max_lose_consec = 0
    v_current_lose_consec = 0

    v_max_win_consec = 0
    v_current_win_consec = 0

    v_time_to_rec = 0
    start_date = None
    v_max_time_to_rec = 0
    _profit_percent = None
    _max_profit = 0
    _cum_net_profit = 0
    _max_cum_profit = 0

    def __init__(self, dfs, market_pos: str = None):
        self.end_date = 0
        sum_columns = [PROFIT, COMMISSION]
        self.days_in_month = 30.5
        self.risk_free_rate = 0
        self._sharpe_ratio = 0
        self._sortino_ratio = 0

        for key, value in self.__dict__.items():
            setattr(self, key, 0)

        self.market_pos = market_pos
        self.dfs = dfs
        self.df = pd.DataFrame([])
        self.merge_dfs(self.dfs)
        self.fix_numbers()
        self.fix_dates()
        if self.market_pos:
            self.df = self.df.loc[self.df[MARKET_POS] == self.market_pos]
            self.df.reset_index(inplace=True)
        end = self.df.at[len(self.df) - 1, EXIT_TIME]
        start = self.df.at[0, ENTRY_TIME] - timedelta(1)
        days = (end - start).days
        self._number_of_trading_days = days
        self._monthly_multiplier = 30.5 / days
        self._start_date = self.df.at[0, ENTRY_TIME]
        self.month_df = pd.DataFrame([])
        self._sums = self.df[sum_columns].apply(self.sums, axis=0)

        self.recover_time_pairs = []

        self.long = self.market_pos == LONG
        self.short = self.market_pos == SHORT

    @staticmethod
    def get_instrument_point_value(instrument):
        return POINT_VALUE_MAP.get(instrument, 50)

    def fix_numbers(self):
        typedict = {
            CUM_NET_PROFIT: float,
            PROFIT: float,
            ENTRY_PRICE: float,
            EXIT_PRICE: float,
            QUANTITY: int
        }
        self.df = self.df.astype(typedict)

    def fix_dates(self, dates=None):
        if dates is None:
            dates = [EXIT_TIME, ENTRY_TIME]
        for date in dates:
            self.df[date] = pd.to_datetime(self.df[date])

    def merge_dfs(self, dfs):
        for d in dfs:
            instrument = d.at[0, INSTRUMENT].split(' ')[0]
            point_value = self.get_instrument_point_value(instrument)
            d.loc[:, POINT_VALUE] = point_value

            # com = 8.0  # default commission
            # com_level = COMMISSION_LEVEL.get(instrument)
            # if com_level:
            #     com = com_level.get(level, 0)
            # d.loc[:, COMMISSION] = com * d.at[0, QUANTITY]
            self.df = pd.concat([self.df, d], ignore_index=True).sort_values(by=EXIT_TIME).reset_index(drop=True)

    @staticmethod
    def sums(rets):
        return rets.sum()

    def cum_net_profit(self, row):
        contract = row.get(CONTRACT)
        if row.name == 0:
            self.df.at[0, CUM_PROFIT_PERCENT] = row.get(PROFIT_PERCENT)
            self.df.at[0, CUM_NET_PROFIT] = row.get(PROFIT)
            self.df.at[0, MAX_CUM_NET_PROFIT] = 0
        else:
            self.df.at[row.name, CUM_NET_PROFIT] = self.df.at[row.name - 1, CUM_NET_PROFIT] + row.get(PROFIT) * contract
            self.df.at[row.name, CUM_PROFIT_PERCENT] = \
                ((1 + self.df.at[row.name - 1, CUM_PROFIT_PERCENT]) * (1 + row.get(PROFIT_PERCENT))) - 1
            if self.df.at[row.name, CUM_NET_PROFIT] > self.df.at[row.name - 1, CUM_NET_PROFIT]:
                self.df.at[row.name, MAX_CUM_NET_PROFIT] = self.df.at[row.name, CUM_NET_PROFIT]
            else:
                self.df.at[row.name, MAX_CUM_NET_PROFIT] = self.df.at[row.name - 1, CUM_NET_PROFIT]

    def total_net_profit(self):
        net_p = self.df.at[len(self.df) - 1, CUM_NET_PROFIT]
        # logger.info(net_p)
        return net_p

    def profit_percent(self):
        profit_long = self.df.loc[self.df[MARKET_POS] == LONG, PROFIT]
        quantity_long = self.df.loc[self.df[MARKET_POS] == LONG, QUANTITY]

        point_value_long = self.df.loc[self.df[MARKET_POS] == LONG, POINT_VALUE]
        entry_price_long = self.df.loc[self.df[MARKET_POS] == LONG, ENTRY_PRICE]
        exit_price_long = self.df.loc[self.df[MARKET_POS] == LONG, EXIT_PRICE]

        profit_short = self.df.loc[self.df[MARKET_POS] == SHORT, PROFIT]
        quantity_short = self.df.loc[self.df[MARKET_POS] == SHORT, QUANTITY]

        point_value_short = self.df.loc[self.df[MARKET_POS] == SHORT, POINT_VALUE]
        entry_price_short = self.df.loc[self.df[MARKET_POS] == SHORT, ENTRY_PRICE]
        exit_price_short = self.df.loc[self.df[MARKET_POS] == SHORT, EXIT_PRICE]

        self.df.loc[self.df[MARKET_POS] == LONG, POINTS] = exit_price_long - entry_price_long
        self.df.loc[self.df[MARKET_POS] == SHORT, POINTS] = entry_price_short - exit_price_short

        self.df.loc[self.df[MARKET_POS] == LONG, PROFIT_PERCENT] \
            = profit_long / quantity_long / point_value_long / entry_price_long
        self.df.loc[self.df[MARKET_POS] == SHORT, PROFIT_PERCENT] \
            = profit_short / quantity_short / point_value_short / entry_price_short

        self._profit_percent = self.df.at[len(self.df) - 1, PROFIT_PERCENT]
        return self._profit_percent

    def cum_percent(self, row):
        if row.name > 0:
            # =(1+S10)*(1+Q11)-1
            self.df.at[row.name, CUM_PROFIT_PERCENT] = (1 + self.df.at[row.name - 1, CUM_PROFIT_PERCENT]) * (
                    1 + row.get(PROFIT_PERCENT)) - 1

            if row.get(PROFIT_PERCENT) > 0:
                self.df.at[row.name, GROSS_PROFIT_PERCENT] = (1 + self.df.at[row.name - 1, GROSS_PROFIT_PERCENT]) * (
                        1 + row.get(PROFIT_PERCENT)) - 1
                self.df.at[row.name, GROSS_LOSS_PERCENT] = self.df.at[row.name - 1, GROSS_LOSS_PERCENT]
            elif row.get(PROFIT_PERCENT) <= 0:
                self.df.at[row.name, GROSS_PROFIT_PERCENT] = self.df.at[row.name - 1, GROSS_PROFIT_PERCENT]
                self.df.at[row.name, GROSS_LOSS_PERCENT] = (1 + self.df.at[row.name - 1, GROSS_LOSS_PERCENT]) * (
                        1 + row.get(PROFIT_PERCENT)) - 1

        elif row.name == 0:
            self.df.at[0, CUM_PROFIT_PERCENT] = row.get(PROFIT_PERCENT)
            self.df.at[0, GROSS_PROFIT_PERCENT] = row.get(PROFIT_PERCENT) if row.get(PROFIT_PERCENT) > 0 else 0
            self.df.at[0, GROSS_LOSS_PERCENT] = row.get(PROFIT_PERCENT) if row.get(PROFIT_PERCENT) <= 0 else 0

    def gross_profit(self):
        result = self.df[[PROFIT]].apply(self.a_gross_profit, axis=0)
        return result.iloc[0]

    @staticmethod
    def a_gross_profit(rets):
        return rets[rets > 0].sum()

    @staticmethod
    def a_gross_loss(df):
        return df[df < 0].sum()

    def gross_loss(self):
        result = self.df[[PROFIT]].apply(self.a_gross_loss, axis=0)
        return result.iloc[0]

    # def commission(self):
    #     self._commission = self._sums[COMMISSION]
    #     return self._commission

    def profit(self):
        self._profit = self._sums[PROFIT]
        return self._profit

    def profit_factor(self):
        if not self._gross_loss:
            return 0
        return self._gross_profit / (-self._gross_loss)

    def get_max_drawdown(self, row):
        # Keep track of the max cum profit up until this row (row.name)
        max_cum_profit = self.df.loc[0:row.name, CUM_NET_PROFIT].max()
        self.df.at[row.name, MAX_CUM_PROFIT] = max_cum_profit

        # Calculate dd in percent of the current maximum since last_dd_index up until now
        self.df.at[row.name, DRAWDOWN] = (self.df.at[row.name, CUM_NET_PROFIT] - max_cum_profit) / max_cum_profit

        # Get the current dd_value in $ from the largest peak
        self.df.at[row.name, DRAWDOWN_VALUE] = self.df.at[row.name, DRAWDOWN] * self.df.loc[row.name, MAX_CUM_PROFIT] \
            if self.df.at[row.name, PROFIT] < 0 else 0
        if row.name > 0:
            max_dd_ = self.df.at[row.name - 1, MAX_DD]
            dd = (1 + self.df.at[row.name, CUM_PROFIT_PERCENT]) / (
                    1 + self.df.loc[0:row.name - 1, CUM_PROFIT_PERCENT].max()) - 1
            self.df.at[row.name, MAX_DD] = min(max_dd_, dd)
        else:
            self.df.at[row.name, MAX_DD] = 0.0
            self.df.at[row.name, CUM_MAX_DD] = 0.0
        # Log the max dd value in $
        self.df.at[row.name, MAX_DD_VALUE] = self.df.loc[0:row.name, DRAWDOWN_VALUE].min()

    def calcs(self, row):
        if row.name > 0:
            prev_cum_net = self.df.at[row.name - 1, CUM_NET_PROFIT]
            self.df.at[row.name, 'Profit Change %'] = (row.get(CUM_NET_PROFIT) - prev_cum_net) / prev_cum_net

    def sharpe_ratio(self):
        return self._profit_per_month_percent / self._monthly_std_dev

    def sortino_ratio(self):
        if not self._monthly_down_target:
            return 0
        return self._profit_per_month_percent / self._monthly_down_target

    def total_number_of_trades(self):
        return int(len(self.df))

    def percent_profitable(self):
        return self._winning_trades / self._total_of_trades

    def number_of_winning_trades(self):
        return len(self.df[self.df.profit > 0])

    def number_of_loosing_trades(self):
        return len(self.df[self.df.profit < 0])

    def number_of_even_trades(self):
        return len(self.df[self.df.profit == 0])

    @staticmethod
    def total_slippage():
        return 0

    def avg_trade(self):
        return self._total_net_profit / self._total_of_trades

    def avg_trade_percent(self):
        return self.df.loc[:, PROFIT_PERCENT].mean()

    def avg_winning_trade(self):
        return self._gross_profit / self._winning_trades

    def avg_loosing_trade(self):
        if not self._losing_trades:
            return 0
        return self._gross_loss / self._losing_trades

    def ratio_avg_win_avg_loss(self):
        if not self._avg_losing_trade:
            return 0
        return abs(self._avg_winning_trade / self._avg_losing_trade)

    def a_max_consec_winners(self, row):
        profit = row.get(PROFIT_PERCENT)
        if profit > 0:
            self.v_current_win_consec += 1
            if self.v_current_win_consec > self.v_max_win_consec:
                self.v_max_win_consec = self.v_current_win_consec
        if profit < 0:
            self.v_current_win_consec = 0

    def max_consec_winners(self):
        return self.v_max_win_consec

    def a_max_consec_losers(self, row):
        profit = row.get(PROFIT_PERCENT)
        if profit < 0:
            self.v_current_lose_consec += 1
            if self.v_current_lose_consec > self.v_max_lose_consec:
                self.v_max_lose_consec = self.v_current_lose_consec
        if profit > 0:
            self.v_current_lose_consec = 0

    def max_consec_loosers(self):
        return self.v_max_lose_consec

    def largest_winning_trade(self):
        return self.df.loc[:, PROFIT].max()

    def max_cum_profit(self):
        return self.df.at[len(self.df) - 1, MAX_CUM_NET_PROFIT]

    def largest_losing_trade(self):
        return self.df.loc[:, PROFIT].min()

    def avg_trades_per_day(self):
        return self._total_of_trades / (self._number_of_trading_days * 252 / 365)

    def avg_time_in_market(self):
        self.df.loc[:, 'time_in_market'] = self.df.loc[:, EXIT_TIME] - self.df.loc[:, ENTRY_TIME]
        self.df.loc[:, 'time_in_market'] = self.df.loc[:, 'time_in_market'].dt.total_seconds()/60
        return self.df.loc[:, 'time_in_market'].mean()

    def avg_bars_in_trade(self):
        return self.df[BARS].sum() / len(self.df) - 1

    def profit_per_month_percent(self):
        try:
            m = math.pow(1 + self._total_net_profit_percent, self._monthly_multiplier) - 1
            return m
        except ValueError:
            return 0

    def profit_per_month(self):
        return self._total_net_profit * self._monthly_multiplier

    def profit_per_quarter(self):
        return self.profit_per_month() * 3

    def same_month(self, this, last):
        if self.df.at[this, EXIT_TIME].month == self.df.at[last, EXIT_TIME].month:
            return True
        return False

    def cum_percent_month(self, row):
        exit_time_period = row.get(EXIT_TIME).tz_localize(None).to_period('M')
        start_date_period = self._start_date.tz_localize(None).to_period('M')
        self.df.at[row.name, MONTH] = (exit_time_period - start_date_period).n
        # logger.info(self.df.at[row.name, MONTH])
        if row.name == 0:
            self.df.at[row.name, CUM_PERCENT_PER_MONTH] = self.df.at[row.name, PROFIT_PERCENT]
        else:
            if self.same_month(row.name, row.name - 1):
                self.df.at[row.name, CUM_PERCENT_PER_MONTH] = (1 + self.df.at[row.name - 1, CUM_PERCENT_PER_MONTH]) \
                                                              * (1 + self.df.at[row.name, PROFIT_PERCENT]) - 1
            else:
                self.df.at[row.name, CUM_PERCENT_PER_MONTH] = self.df.at[row.name, PROFIT_PERCENT]

    def monthly_percent(self):
        months = pd.Series([], dtype=pd.Float64Dtype())
        counter = 0
        total_months = len(self.df)
        for i in range(0, total_months):
            month = self.df.loc[self.df.Month == i, CUM_PERCENT_PER_MONTH]
            last_index = month.index
            month = month.reset_index(drop=True)
            self.df.loc[self.df.Month == i, ENTRY_TIME].reset_index(drop=True)
            self.df.loc[self.df.Month == i, PROFIT_PERCENT].reset_index(drop=True)

            if not month.empty:
                months[counter] = month[len(month) - 1]
                self.month_df = pd.concat([self.month_df, self.df.loc[last_index.values[-1:]]])
                counter += 1
        return months

    def t_recover(self, row):
        if self.df.at[row.name, CUM_NET_PROFIT] < self.df.at[row.name, MAX_CUM_PROFIT]:
            self.v_time_to_rec += 1
            self.recover_time_pairs[-1][1] = row.get(EXIT_TIME)
        else:
            # start new pair
            self.recover_time_pairs.append([row.get(EXIT_TIME), None])
            self.v_time_to_rec = 0

    # check which's longest datetime pair
    def max_time_to_recover(self):
        v_max_time_to_rec = 0
        for p in self.recover_time_pairs:
            if not p[1]:
                continue
            start = pendulum.instance(p[0])
            end = pendulum.instance(p[1])
            days = (end - start).days
            if days > v_max_time_to_rec:
                v_max_time_to_rec = days
        return v_max_time_to_rec

    # def t_time(self, row):
    #     if row.name > 0:
    #         diff = (self.df.at[row.name - 1, EXIT_TIME] - row.get(ENTRY_TIME)).total_seconds() / 60
    #         self.df.at[row.name, TRADE_PERIOD_DIFF] = diff
    #     else:
    #         self.df.at[row.name, TRADE_PERIOD_DIFF] = 0

    def avg_mae(self):
        return self.df.loc[:, MAE].mean()

    def avg_mfe(self):
        return self.df.loc[:, MFE].mean()

    def avg_etd(self):
        return self.df.loc[:, ETD].mean()

    # Polynomial Regression
    @staticmethod
    def r_squared(x, y):
        """ Return R^2 where x and y are array-like."""
        x = np.array(x)
        y = np.array(y)
        slope, intercept, r_value, p_value, std_err = linregress(x, y)
        return r_value ** 2

    def flat_period(self, row):
        if row.name > 0:
            self.df.at[row.name, FLAT_PERIOD] = (row.get(ENTRY_TIME) - self.df.at[row.name - 1, EXIT_TIME]).total_seconds()
        else:
            self.df.at[row.name, FLAT_PERIOD] = 0

    @staticmethod
    def convert_to_date(value):
        DATA_MAP = {
            'Days': 24 * 60 * 60,
            'Hours': 60 * 60,
            'Minutes': 60,
        }
        for label, m in DATA_MAP.items():
            res = value / m
            if res > 1:
                return round(float(res), 2)
        return 0

    def longest_flat_period(self):
        flat_period = self.df.loc[:, FLAT_PERIOD].max()
        # return round(flat_period / 60, 2)  # return this in minutes
        return self.convert_to_date(flat_period)  # return this in days


    def apply_row(self, row):
        self.cum_net_profit(row)
        self.get_max_drawdown(row)
        self.flat_period(row)
        self.t_recover(row)
        self.cum_percent(row)
        self.cum_percent_month(row)
        self.a_max_consec_losers(row)
        self.a_max_consec_winners(row)
    #

    def apply_axis(self):
        self.df.apply(lambda row: self.apply_row(row), axis=1)

    def process(self):
        # Total Trades ##1
        self._total_of_trades = self.total_number_of_trades()  # This gets added to dashboard futher below

        # Sums
        sum_columns = [PROFIT, COMMISSION]
        self._sums.index = sum_columns

        # Total Net Profit
        self.profit_percent()
        self.apply_axis()
        self._total_net_profit = self.total_net_profit()
        self._cum_net_profit = self._total_net_profit

        # self.commission()
        # Cum. profit percent (Gross Loss, Gross Profit, Cum profit %)
        self._cum_profit_percent = self.df.at[len(self.df) - 1, CUM_PROFIT_PERCENT]
        self._gross_loss_percent = self.df.at[len(self.df) - 1, GROSS_LOSS_PERCENT]
        self._gross_profit_percent = self.df.at[len(self.df) - 1, GROSS_PROFIT_PERCENT]

        # Total Net profit_percent
        self._total_net_profit_percent = self._cum_profit_percent

        # Gross Profit
        self._gross_profit = self.gross_profit()
        # logger.info("Gross Profit: %r" % self._gross_profit)

        # Gross Loss
        self._gross_loss = self.gross_loss()

        # See Under Sums above
        # Profit Factor
        self._profit_factor = self.profit_factor()

        # Max dd
        self.df.loc[:, 'maxdd_input'] = 0
        self.df.loc[:, MAX_DD] = 0.0

        self._max_drawdown = self.df.at[len(self.df) - 1, MAX_DD_VALUE]

        self._profit_per_month_percent = self.profit_per_month_percent()

        # Cum profit_percent / Month

        months = self.monthly_percent()
        self._monthly_std_dev = months.std()

        downside = months[months < 0]

        # MonthlyDownTarget
        # Downside ^2
        squared = downside.pow(2)
        self._monthly_down_target = np.sqrt(squared.sum() / len(months))  # mean squared

        # Sharpe Ratio
        self._sharpe_ratio = self.sharpe_ratio()

        # Sortino Ratio
        self._sortino_ratio = self.sortino_ratio()
        # R squared
        self._r_squared = self.r_squared(self.df.index.values, self.df.loc[:, CUM_PROFIT_PERCENT].values)

        # # winning trades
        self._winning_trades = self.number_of_winning_trades()

        # Percent profitable
        self._percent_profitable = self.percent_profitable()

        # # loosing trades
        self._losing_trades = self.number_of_loosing_trades()

        # # even trades
        self._even_trades = self.number_of_even_trades()

        # even trades
        self._total_slippage = 0

        # Avg. trade
        self._avg_trade = self.avg_trade()

        # Avg. trade %
        self._avg_trade_percent = self.avg_trade_percent()

        # Avg. winning trade
        self._avg_winning_trade = self.avg_winning_trade()
        # logger.info("_avg_winning_trade: %r" % (self._avg_winning_trade))

        # Avg. loosing trade
        self._avg_losing_trade = self.avg_loosing_trade()

        # Ratio avg. win / avg. loss
        self._ratio_win_loss = self.ratio_avg_win_avg_loss()

        # Max. consec. winners
        self._max_consec_winners = self.max_consec_winners()

        # Max. consec. loosers
        self._max_consec_losers = self.max_consec_loosers()

        # Largest winning trade
        self._largest_winning_trade = self.largest_winning_trade()

        # largest losing trade
        self._largest_losing_trade = self.largest_losing_trade()

        # Avg. # trades per day
        self._avg_trades_per_day = self.avg_trades_per_day()

        self._avg_trades_per_quarter = self._avg_trades_per_day * 91.5

        # Avg. time in market
        self._avg_time_in_market = self.avg_time_in_market()

        # Profit per month
        self._profit_per_month = self.profit_per_month()

        # Profit per quarter
        self._profit_per_quarter = self._profit_per_month * 3

        # Avg. bars in trade
        self._avg_bars_in_trade = self.avg_bars_in_trade()

        # Max. time to recover
        self._max_time_to_recover = self.max_time_to_recover()

        # Longest flat period
        # Avg. MAE
        self._avg_mae = self.avg_mae()
        # Avg. MFE
        self._avg_mfe = self.avg_mfe()
        # Avg. ETD
        self._avg_etd = self.avg_etd()
        self._max_cum_profit = self.max_cum_profit()
        self._longest_flat_period = self.longest_flat_period()


class DfCalculationLite(CalculationDF):
    def apply_row(self, row):
        self.cum_net_profit(row)
        self.cum_percent(row)
        self.cum_percent_month(row)
        self.get_max_drawdown(row)

    def apply_axis(self):
        self.df.apply(lambda row: self.apply_row(row), axis=1)

    def process(self):
        # Sums
        sum_columns = [PROFIT, COMMISSION]
        self._sums.index = sum_columns
        self._total_of_trades = self.total_number_of_trades()
        # Total Net Profit
        self.profit_percent()
        self.apply_axis()
        self._total_net_profit = self.total_net_profit()
        self._cum_profit_percent = self.df.at[len(self.df) - 1, CUM_PROFIT_PERCENT]
        self._gross_loss_percent = self.df.at[len(self.df) - 1, GROSS_LOSS_PERCENT]
        self._gross_profit_percent = self.df.at[len(self.df) - 1, GROSS_PROFIT_PERCENT]
        self._total_net_profit_percent = self._cum_profit_percent
        self._gross_profit = self.gross_profit()
        self._gross_loss = self.gross_loss()
        self._profit_per_month_percent = self.profit_per_month_percent()
        self._profit_per_month = self.profit_per_month()
        self._profit_per_quarter = self._profit_per_month * 3
        self._max_cum_profit = self.max_cum_profit()
        self._max_drawdown = self.df.at[len(self.df) - 1, MAX_DD_VALUE]
