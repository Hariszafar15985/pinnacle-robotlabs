# Import math Library
import math
from datetime import timedelta
import numpy as np
import pandas
import pandas as pd
from scipy.stats import linregress

MARKET_POS = "Market pos."
LONG = 'Long'
SHORT = 'Short'

POINT_VALUE_MAP = {
    '6A': 100000,
    '6B': 62500,
    '6C': 100000,
    '6E': 125000,
    '6J': 12500000,
    '6S': 125000,
    'B': 40,
    'CL': 1000.0,
    'E7': 62500,
    'ES': 50.0,
    'GC': 100.0,
    'GE': 2500,
    'GF': 500,
    'HE': 400,
    'HG': 25000.0,
    'LE': 400,
    'M2K': 5.0,
    'MCL': 100.0,
    'MES': 5.0,
    'MGC': 10.0,
    'MNQ': 2.0,
    'MYM': 0.5,
    'NG': 10000.0,
    'NKD': 5.0,
    'NQ': 20.0,
    'QG': 2500.0,
    'QM': 500.0,
    'RB': 21,
    'RTY': 50.0,
    'SI': 5000,
    'TN': 1000,
    'UB': 1000,
    'YM': 5.0,
    'ZB': 1000,
    'ZC': 50,
    'ZF': 1000,
    'ZL': 600,
    'ZM': 100,
    'ZN': 1000,
    'ZS': 50,
    'ZT': 2000
}


class NT8Dashboard:
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
    _uicer_index = 0  # avg this from csv files directly
    _r_squared = 0
    _total_slippage = 0
    _avg_mae = 0
    _total_of_trades = 0
    _largest_losing_trade = 0
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
    _largest_loosing_trade = 0
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
    v_max_consec = 0
    v_current_consec = 0
    v_time_to_rec = 0
    v_max_time_to_rec = 0

    def __init__(self, dfs, trade: str = None):
        sum_columns = ['Profit', 'Commission']
        self.days_in_month = 30.5
        self.risk_free_rate = 0
        self._sharpe_ratio = 0
        self._sortino_ratio = 0

        for key, value in self.__dict__.items():
            setattr(self, key, 0)

        self.trade = trade
        self.dfs = dfs
        self.df = pd.DataFrame([])
        self.merge_dfs(dfs)
        self.fix_numbers()
        self.fix_dates()
        # filter data by trade
        if self.trade:
            self.df = self.df.loc[self.df[MARKET_POS] == self.trade]
            self.df.reset_index(inplace=True)

        days = ((self.df.at[len(self.df) - 1, 'Exit time']) - (self.df.at[0, 'Entry time'] - timedelta(1))).days
        self._number_of_trading_days = days
        self.df.loc[:, 'trade'] = 1
        self._monthly_multiplier = 30.5 / days
        self._start_date = self.df.at[0, 'Entry time']
        self.month_df = pd.DataFrame([])
        self._sums = self.df[sum_columns].apply(self.sums, axis=0)

    @staticmethod
    def clean_feed(x):
        """ If the value is a string, then remove currency symbol and delimiters
        otherwise, the value is numeric and can be converted
        """
        if isinstance(x, str):
            x = x.replace('$', '').replace(',', '')
            x = x.replace(' min', '').replace(" %", "")
            x = x.replace(' days', '').replace(" %", "")
            x = x.replace("%", "")
            if "(" in x:
                x = x.replace('(', '').replace(')', '')
                return f"-{x}"
            return x
        return x

    @staticmethod
    def get_instrument_point_value(instrument):
        return POINT_VALUE_MAP.get(instrument, 50)

    def fix_numbers(self):
        typedict = {
            'Cum. net profit': float,
            'Profit': float,
            'Entry price': float,
            'Exit price': float,
            'Qty': float
        }
        self.df = self.df.astype(typedict)

    def fix_dates(self, dates=None):
        if dates is None:
            dates = ["Exit time", "Entry time"]
        for date in dates:
            self.df[date] = pd.to_datetime(self.df[date])

    def merge_dfs(self, dfs):
        for d in dfs:
            d.loc[:, 'Point value'] = self.get_instrument_point_value(d.at[0, 'Instrument'].split(' ')[0])
            self.df = pd.concat([self.df, d], ignore_index=True).sort_values(by="Exit time").reset_index(drop=True)

    @staticmethod
    def sums(rets):
        return rets.sum()

    def cum_net_profit(self, row):
        if row.name == 0:
            self.df.at[row.name, 'Cum. profit percent'] = row.get('Profit percent')
            self.df.at[row.name, 'Cum. net profit'] = row.get('Profit')
        else:
            self.df.at[row.name, 'Cum. net profit'] = self.df.at[row.name - 1, 'Cum. net profit'] + row.get('Profit')
            self.df.at[row.name, 'Cum. profit percent'] = \
                ((1 + self.df.at[row.name - 1, 'Cum. profit percent']) * (1 + row.get('Profit percent'))) - 1
            if self.df.at[row.name, 'Cum. net profit'] > self.df.at[row.name - 1, 'Cum. net profit']:
                self.df.at[row.name, 'Max Cum. net profit'] = self.df.at[row.name, 'Cum. net profit']
            else:
                self.df.at[row.name, 'Max Cum. net profit'] = self.df.at[row.name - 1, 'Cum. net profit']

    def total_net_profit(self):
        return self.df.at[len(self.df) - 1, 'Cum. net profit']

    def profit_percent(self):
        self.df.loc[self.df[MARKET_POS] == LONG, 'Points'] = \
            (self.df.loc[self.df[MARKET_POS] == LONG, 'Exit price'] -
             self.df.loc[self.df[MARKET_POS] == LONG, 'Entry price'])
        self.df.loc[self.df[MARKET_POS] == SHORT, 'Points'] = \
            (self.df.loc[self.df[MARKET_POS] == SHORT, 'Entry price'] -
             self.df.loc[self.df[MARKET_POS] == SHORT, 'Exit price'])

        self.df.loc[self.df[MARKET_POS] == LONG, 'Profit percent'] = \
            self.df.loc[self.df[MARKET_POS] == LONG, 'Profit'] / \
            self.df.loc[self.df[MARKET_POS] == LONG, 'Qty'] / \
            self.df.loc[self.df[MARKET_POS] == LONG, 'Point value'] / \
            self.df.loc[self.df[MARKET_POS] == LONG, 'Entry price']
        self.df.loc[self.df[MARKET_POS] == SHORT, 'Profit percent'] = self.df.loc[self.df[MARKET_POS] == SHORT, 'Profit'] \
            / self.df.loc[self.df[MARKET_POS] == SHORT, 'Qty'] \
            / self.df.loc[self.df[MARKET_POS] == SHORT, 'Point value'] \
            / self.df.loc[self.df[MARKET_POS] == SHORT, 'Entry price']
        # (self.df.loc[self.df[MARKET_POS] == SHORT, 'Entry price'] - self.df.loc[self.df[MARKET_POS] == SHORT, 'Exit price']) / self.df.loc[self.df[MARKET_POS] == SHORT, 'Entry price']

        return self.df.at[len(self.df) - 1, 'Profit percent']

    def cum_percent(self, row):
        if row.name > 0:
            # =(1+S10)*(1+Q11)-1
            self.df.at[row.name, 'Cum. profit percent'] = (1 + self.df.at[row.name - 1, 'Cum. profit percent']) * (
                    1 + row.get('Profit percent')) - 1

            if row.get('Profit percent') > 0:
                self.df.at[row.name, 'Gross profit %'] = (1 + self.df.at[row.name - 1, 'Gross profit %']) * (
                        1 + row.get('Profit percent')) - 1
                self.df.at[row.name, 'Gross loss %'] = self.df.at[row.name - 1, 'Gross loss %']
            elif row.get('Profit percent') <= 0:
                self.df.at[row.name, 'Gross profit %'] = self.df.at[row.name - 1, 'Gross profit %']
                self.df.at[row.name, 'Gross loss %'] = (1 + self.df.at[row.name - 1, 'Gross loss %']) * (
                        1 + row.get('Profit percent')) - 1

        elif row.name == 0:
            self.df.at[0, 'Cum. profit percent'] = row.get('Profit percent')
            self.df.at[0, 'Gross profit %'] = row.get('Profit percent') if row.get('Profit percent') > 0 else 0
            self.df.at[0, 'Gross loss %'] = row.get('Profit percent') if row.get('Profit percent') <= 0 else 0

    def gross_profit(self):
        result = self.df[['Profit']].apply(self.a_gross_profit, axis=0)
        return result[0]

    @staticmethod
    def a_gross_profit(rets):
        return rets[rets > 0].sum()

    @staticmethod
    def a_gross_loss(df):
        return df[df < 0].sum()

    def gross_loss(self):
        result = self.df[['Profit']].apply(self.a_gross_loss, axis=0)
        return result[0]

    def commission(self):
        self._commission = self._sums['Commission']
        return self._commission

    def profit(self):
        self._profit = self._sums['Profit']
        return self._profit

    def profit_factor(self):
        return self._gross_profit / (-self._gross_loss)

    def get_max_drawdown(self, row):
        # Keep track of the max cum profit up until this row (row.name)
        max_cum_profit = self.df.loc[0:row.name, 'Cum. net profit'].max()
        self.df.at[row.name, 'max_cum_profit'] = max_cum_profit

        # Calculate dd in percent of the current maximum since last_dd_index up until now
        self.df.at[row.name, 'dd'] = (self.df.at[row.name, 'Cum. net profit'] - max_cum_profit) / max_cum_profit

        # Get the current dd_value in $ from the largest peak
        self.df.at[row.name, 'dd_value'] = self.df.at[row.name, 'dd'] * self.df.loc[row.name, 'max_cum_profit'] if \
            self.df.at[row.name, 'Profit'] < 0 else 0

        # Log the max dd
        # self.df.at[row.name, 'max_dd'] =  self.df.loc[0:row.name, 'dd'].min()
        # =MIN($Y$1:Y9, (1 + S10) / (1 + MAX($S$1:S10)) - 1)

        if row.name > 0:
            max_dd_ = self.df.at[row.name - 1, 'max_dd']
            dd = (1 + self.df.at[row.name, 'Cum. profit percent']) / (
                    1 + self.df.loc[0:row.name - 1, 'Cum. profit percent'].max()) - 1
            self.df.at[row.name, 'max_dd'] = min(max_dd_, dd)
            # cump = self.df.at[row.name, 'Cum. profit percent']
            # print("max_dd: %r, dd: %r, cump: %r" % (max_dd_,dd,cump))
        else:
            self.df.at[
                row.name, 'max_dd'] = 0.0  # (1 + df.at[0, 'Cum. profit percent']) / (1 + df.at[0, 'Cum. profit percent']) - 1
        # Log the max dd value in $
        self.df.at[row.name, 'max_dd_value'] = self.df.loc[0:row.name, 'dd_value'].min()

        # Keep track of the minimum profit made in a trade
        # self.df.at[row.name, 'min_profit'] = self.df.loc[0:row.name, 'Profit'].min()

    def max_drawdown(self):
        return self._max_drawdown

    def calcs(self, row):
        if row.name > 0:
            prev_cum_net = self.df.at[row.name - 1, 'Cum. net profit']
            self.df.at[row.name, 'Profit Change %'] = (row.get('Cum. net profit') - prev_cum_net) / prev_cum_net

    def sharpe_ratio(self):
        return self._profit_per_month_percent / self._monthly_std_dev

    def sortino_ratio(self):
        return self._profit_per_month_percent / self._monthly_down_target

    first = True
    idx = 0

    @staticmethod
    def uicer_index():
        return 0  # Not working right now

    @staticmethod
    def probability():
        return 0

    def total_number_of_trades(self):
        return int(len(self.df))

    def percent_profitable(self):
        return self._winning_trades / self._total_of_trades

    def number_of_winning_trades(self):
        return len(self.df[self.df.Profit > 0])

    def number_of_loosing_trades(self):
        return len(self.df[self.df.Profit < 0])

    def number_of_even_trades(self):
        return len(self.df[self.df.Profit == 0])

    @staticmethod
    def total_slippage():
        return 0

    def avg_trade(self):
        return self._total_net_profit / self._total_of_trades

    def avg_trade_percent(self):
        return self.df.loc[:, 'Profit percent'].mean()

    def avg_winning_trade(self):
        return self._gross_profit / self._winning_trades

    def avg_loosing_trade(self):
        return self._gross_loss / self._losing_trades

    def ratio_avg_win_avg_loss(self):
        return abs(self._avg_winning_trade / self._avg_losing_trade)

    def a_max_consec_winners(self, row):
        self.v_current_consec = 0
        self.v_max_consec = 0
        profit = row.get('Profit percent')
        if profit > 0:
            self.v_current_consec += 1
        if profit < 0:
            self.v_current_consec = 0

        if self.v_current_consec > self.v_max_consec:
            self.v_max_consec = self.v_current_consec

    def max_consec_winners(self):
        return self.v_max_consec

    def a_max_consec_loosers(self, row):
        self.v_current_consec = 0
        self.v_max_consec = 0
        profit = row.get('Profit percent')
        if profit < 0:
            self.v_current_consec += 1
        if profit > 0:
            self.v_current_consec = 0

        if self.v_current_consec > self.v_max_consec:
            self.v_max_consec = self.v_current_consec

    def max_consec_loosers(self):
        return self.v_max_consec

    def largest_winning_trade(self):

        return self.df.loc[:, 'Profit'].max()

    def largest_losing_trade(self):
        return self.df.loc[:, 'Profit'].min()

    def avg_trades_per_day(self):
        return self._total_of_trades / (self._number_of_trading_days * 252 / 365)

    def avg_time_in_market(self):
        self.df.loc[:, 'time_in_market'] = self.df.loc[:, 'Exit time'] - self.df.loc[:, 'Entry time']
        self.df.loc[:, 'time_in_market'] = self.df.loc[:, 'time_in_market'].astype('timedelta64[m]')
        return self.df.loc[:, 'time_in_market'].mean()

    def avg_bars_in_trade(self):
        return self.df['Bars'].sum() / len(self.df) - 1

    def profit_per_month_percent(self):
        return math.pow(1 + self._total_net_profit_percent, self._monthly_multiplier) - 1

    def profit_per_month(self):
        return self._total_net_profit * self._monthly_multiplier

    def profit_per_quarter(self):
        return self.profit_per_month() * 3

    def same_month(self, this, last):
        if self.df.at[this, 'Exit time'].month == self.df.at[last, 'Exit time'].month:
            return True
        return False

    def cum_percent_month(self, row):
        n = 'Cum % / Monthly'
        # self.df.at[row.name, 'Exit time'].month
        self.df.at[row.name, 'Month'] = (row.get('Exit time').to_period('M') - self._start_date.to_period('M')).n
        # print(self.df.at[row.name, 'Month'])
        if row.name == 0:
            self.df.at[row.name, n] = self.df.at[row.name, 'Profit percent']
        else:
            if self.same_month(row.name, row.name - 1):
                self.df.at[row.name, n] = (1 + self.df.at[row.name - 1, n]) * (
                        1 + self.df.at[row.name, 'Profit percent']) - 1
            else:
                self.df.at[row.name, n] = self.df.at[row.name, 'Profit percent']

    def monthly_percent(self):
        months = pd.Series([], dtype=pd.Float64Dtype())
        counter = 0
        # self.df.groupby(self.df['Monthly'],sort=False)['Monthly %'].sum().reset_index() #
        total_months = len(self.df)
        for i in range(0, total_months):
            month = self.df.loc[self.df.Month == i, 'Cum % / Monthly']
            last_index = month.index

            month = month.reset_index(drop=True)
            self.df.loc[self.df.Month == i, 'Entry time'].reset_index(drop=True)
            self.df.loc[self.df.Month == i, 'Profit percent'].reset_index(drop=True)
            if not month.empty:
                months[counter] = month[len(month) - 1]
                self.month_df = pd.concat(
                    [self.month_df, self.df.loc[last_index.values[-1:]]])  # save monthly values for later
                counter += 1
        return months

    def t_recover(self, row):
        if row.get('Cum. net profit') < self.df.at[row.name, 'max_cum_profit']:
            self.v_time_to_rec += 1
            if self.v_time_to_rec > self.v_max_time_to_rec:
                self.v_max_time_to_rec = self.v_time_to_rec
        else:
            self.v_time_to_rec = 0

    def max_time_to_recover(self):
        return self.v_max_time_to_rec

    def t_time(self, row):
        if row.name > 0:
            self.df.at[row.name, 'trade_period_diff'] = \
                (self.df.at[row.name - 1, 'Exit time'] - row.get('Entry time')).total_seconds() / 60
        else:
            self.df.at[row.name, 'trade_period_diff'] = 0

    # pnl = exit - entry / entry
    def longest_flat_period(self):
        return self._longest_flat_period

    def avg_mae(self):
        return self.df.loc[:, 'MAE'].mean()

    def avg_mfe(self):
        return self.df.loc[:, 'MFE'].mean()

    def avg_etd(self):
        return self.df.loc[:, 'ETD'].mean()

    # Polynomial Regression`
    @staticmethod
    def r_squared(x, y):
        """ Return R^2 where x and y are array-like."""
        x = np.array(x)
        y = np.array(y)
        slope, intercept, r_value, p_value, std_err = linregress(x, y)
        return r_value ** 2

    def apply_row(self, row):
        self.cum_net_profit(row)
        self.get_max_drawdown(row)
        self.t_recover(row)
        self.t_time(row)
        self.cum_percent(row)
        self.cum_percent_month(row)
        self.a_max_consec_loosers(row)
        self.a_max_consec_winners(row)

    def apply_axis(self):
        self.df.apply(lambda row: self.apply_row(row), axis=1)

    def process(self):
        # Total Trades ##1
        self._total_of_trades = self.total_number_of_trades()  # This gets added to dashboard futher below

        # Sums
        sum_columns = ['Profit', 'Commission']
        self._sums.index = sum_columns

        # Total Net Profit
        self.profit_percent()
        self.apply_axis()
        self._total_net_profit = self.total_net_profit()
        self.commission()
        # Cum. profit percent (Gross Loss, Gross Profit, Cum profit %)
        self._cum_profit_percent = self.df.at[len(self.df) - 1, 'Cum. profit percent']
        self._gross_loss_percent = self.df.at[len(self.df) - 1, 'Gross loss %']
        self._gross_profit_percent = self.df.at[len(self.df) - 1, 'Gross profit %']

        # Total Net Profit percent
        self._total_net_profit_percent = self._cum_profit_percent

        # Gross Profit
        self._gross_profit = self.gross_profit()
        # print("Gross Profit: %r" % self._gross_profit)

        # Gross Loss
        self._gross_loss = self.gross_loss()

        # See Under Sums above
        # Profit Factor
        self._profit_factor = self.profit_factor()

        # Max dd
        self.df.loc[:, 'maxdd_input'] = 0
        self.df.loc[:, 'max_dd'] = 0.0

        self._max_drawdown = self.df.at[len(self.df) - 1, 'max_dd_value']

        self._profit_per_month_percent = self.profit_per_month_percent()

        # Cum Profit percent / Month

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

        # UIcer Index
        self._uicer_index = self.uicer_index()

        # R squared
        self._r_squared = self.r_squared(self.df.index.values, self.df.loc[:, 'Cum. profit percent'].values)

        # # winning trades
        self._winning_trades = self.number_of_winning_trades()

        # Percent profitable
        self._percent_profitable = self.percent_profitable()

        # # loosing trades
        self._losing_trades = self.number_of_loosing_trades()

        # # even trades
        self._even_trades = self.number_of_even_trades()

        # even trades
        self._total_slippage = self.total_slippage()

        # Avg. trade
        self._avg_trade = self.avg_trade()

        # Avg. trade %
        self._avg_trade_percent = self.avg_trade_percent()

        # Avg. winning trade
        self._avg_winning_trade = self.avg_winning_trade()
        # print("_avg_winning_trade: %r" % (self._avg_winning_trade))

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


def remove_dollar_sign(d: pandas.DataFrame, columns: list = None):
    if columns is None:
        columns = ['Profit', 'Cum. net profit', 'Commission', 'MAE', 'MFE', 'ETD']
    convert_dict = {}
    for c in columns:
        d.loc[:, c] = d.loc[:, c].str.strip()\
            .str.replace('(', '-', regex=False)\
            .str.replace(')', '', regex=False)\
            .str.replace('$', '', regex=False)\
            .str.replace(',', '', regex=False)
        convert_dict[c] = float

    d = d.astype(convert_dict)
    if 'Unnamed: 19' in d.columns:
        d.drop('Unnamed: 19', axis='columns', inplace=True)
    return d


def fix_dates(d: pandas.DataFrame, date: str = "Exit time"):
    d[date] = pd.to_datetime(d[date])
    return d


if __name__ == '__main__':
    df = pandas.read_csv('./NQ.csv')
    df = remove_dollar_sign(df)
    df = fix_dates(df)
    dashboard = NT8Dashboard([df])
    dashboard.process()
    print(dashboard.df[''])

