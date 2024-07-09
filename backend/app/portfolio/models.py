from decimal import Decimal

from pendulum import DateTime
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from portfolio.constants import *


class Market(models.Model):
    short_name = models.CharField(max_length=255)
    long_name = models.CharField(max_length=255)
    regular = models.CharField(max_length=10, null=True, blank=True)
    micro = models.CharField(max_length=10, null=True, blank=True)
    point_value = models.FloatField(default=50)

    def __str__(self):
        return self.short_name

    def save(self, *args, **kwargs):
        if not self.long_name:
            self.long_name = self.short_name
        super().save(*args, **kwargs)


class Category(models.Model):
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=64)
    index = models.IntegerField(default=0)
    config = models.JSONField(default=dict)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'
        db_table = 'categories'


class PortfolioCategory(models.Model):
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=64)
    index = models.IntegerField(default=0)
    config = models.JSONField(default=dict)

    class Meta:
        verbose_name_plural = 'Portfolio Categories'
        db_table = 'portfolio_categories'

    def __str__(self):
        return self.name


class Robot(models.Model):
    name = models.CharField(max_length=255)
    crm_name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    tags = ArrayField(models.CharField(max_length=64), default=list, blank=True)
    group = models.CharField(max_length=255, choices=GROUP_CHOICES, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    regular = models.CharField(max_length=10, null=True, blank=True)
    micro = models.CharField(max_length=10, null=True, blank=True)
    instruments = models.JSONField(default=list)
    markets = models.ManyToManyField(Market, related_name='robots', blank=True)
    markets_long = models.CharField(max_length=255, null=True, blank=True)
    sku = models.CharField(max_length=255, default='', null=True)
    market_type = models.CharField(max_length=255, null=True, blank=True)
    edge_ratio = models.DecimalField(verbose_name=_("edge ratio"), default=Decimal(0), max_digits=24,
                                     decimal_places=4, db_index=True, null=True, blank=True)
    quarter = models.DecimalField(verbose_name=_("Billed Quarterly"), default=Decimal(0), max_digits=24,
                                  decimal_places=15, validators=[MinValueValidator(0)], db_index=True, null=True,
                                  blank=True)
    active = models.BooleanField(default=True)
    has_new_data = models.BooleanField(default=False)
    pro = models.BooleanField(default=False)
    normal = models.BooleanField(default=True)
    year = models.DecimalField(verbose_name=_("Billed Yearly"), default=Decimal(0), max_digits=24,
                               decimal_places=15, validators=[MinValueValidator(0)], db_index=True, null=True,
                               blank=True)
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True, null=True, blank=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.id} {self.name} - {self.sku} [{self.regular}|{self.micro}] {'Pro' if self.pro else ''}"

    @classmethod
    def get_robot_by_instrument(cls, sku, instrument):
        if instrument in MICRO_MAP:
            robot = cls.objects.filter(sku=sku, regular=instrument).first()
        else:
            robot = cls.objects.filter(sku=sku, micro=instrument).first()
        return robot

    @classmethod
    def get(cls, **kwargs) -> 'Robot':
        sku = kwargs.get('sku')
        name = kwargs.get('name')
        if sku:
            return cls.objects.filter(sku=sku).first()
        if name:
            return cls.objects.filter(name=name).first()

    class Meta:
        ordering = ['name']
        verbose_name = _('Robot')
        verbose_name_plural = _('Robots')
        db_table = 'robots'


class PortfolioRobot(models.Model):
    portfolio = models.ForeignKey('Portfolio', on_delete=models.SET_NULL, null=True, blank=True)
    robot = models.ForeignKey('Robot', on_delete=models.SET_NULL, null=True, blank=True)
    market = models.CharField(max_length=10, null=True, blank=True)
    number_of_contract = models.IntegerField(default=1)
    config = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.robot.name} - {self.number_of_contract} {self.market}"

    class Meta:
        verbose_name = _('Portfolio Robot')
        verbose_name_plural = _('Portfolio Robot')
        db_table = 'portfolio_robot'


class Portfolio(models.Model):
    NORMAL = 'normal'
    PRO = 'pro'
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=255)
    group = models.CharField(max_length=255, choices=GROUP_CHOICES, default='')
    category = models.ForeignKey(PortfolioCategory, on_delete=models.SET_NULL, null=True, blank=True)
    crm_name = models.CharField(max_length=255, null=True, blank=True)
    number_of_bot = models.IntegerField(default=1)
    robot = models.ManyToManyField(Robot, related_name='portfolios', blank=True, through=PortfolioRobot)
    tab = models.CharField(max_length=255, null=True, blank=True, default=None)
    quarter = models.DecimalField(verbose_name=_("Billed Quarterly"), default=Decimal(0),
                                  max_digits=24,
                                  decimal_places=15,
                                  validators=[MinValueValidator(0)],
                                  db_index=True, null=True, blank=True)
    active = models.BooleanField(default=False)
    year = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15)
    tags = ArrayField(models.CharField(max_length=64), default=list, blank=True)
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True, null=True, blank=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.number_of_bot} Bots)"

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.year:
            self.quarter = Decimal(self.year / 4)
        super().save(force_insert=False, force_update=False, using=None,
                     update_fields=None)

    class Meta:
        ordering = ['name']
        verbose_name = _('portfolio')
        verbose_name_plural = _('portfolios')
        db_table = 'portfolios'


class Addon(models.Model):
    name = models.CharField(max_length=255)
    crm_name = models.CharField(max_length=255, null=True, blank=True)
    sku = models.CharField(max_length=255)
    quarter = models.DecimalField(verbose_name=_("Billed Quarterly"), default=Decimal(0),
                                  max_digits=24, decimal_places=15, validators=[MinValueValidator(0)],
                                  db_index=True, null=True, blank=True)
    year = models.DecimalField(verbose_name=_("Billed Yearly "), default=Decimal(0),
                               max_digits=24, decimal_places=15, validators=[MinValueValidator(0)], db_index=True)
    robots = models.ManyToManyField(Robot)
    tags = ArrayField(models.CharField(max_length=64), default=list, blank=True)

    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True, null=True, blank=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.year and not self.quarter:
            self.quarter = Decimal(self.year / 4)

        super().save(force_insert=False, force_update=False, using=None,
                     update_fields=None)

    class Meta:
        ordering = ['name']
        verbose_name = _('addon')
        verbose_name_plural = _('addons')
        db_table = 'addons'


# Back Test Data
class BackTest(models.Model):
    ALL_TRADES = 'All trades'
    LONG_TRADES = 'Long trades'
    SHORT_TRADES = 'Short trades'

    TYPE_CHOICES = (
        (ALL_TRADES, _('All Trades Test')),
        (LONG_TRADES, _('Long Trades Test')),
        (SHORT_TRADES, _('Short Trades Test'))
    )

    name = models.CharField(max_length=255)
    robot = models.ForeignKey(Robot, null=True, blank=True, on_delete=models.CASCADE)
    group = models.CharField(max_length=255, choices=TYPE_CHOICES, null=True, blank=True)
    contract_type = models.CharField(max_length=255, default=REGULAR)
    period = models.DateField(null=True, blank=True)
    monthly = models.BooleanField(default=False)

    total_net_profit = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                           verbose_name="Total net profit")
    gross_profit = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                       verbose_name="Gross profit")
    gross_loss = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Gross loss")
    commission = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Commission")
    profit_factor = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                        verbose_name="Profit factor")
    max_drawdown = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                       verbose_name="Max. drawdown")
    sharpe_ratio = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                       verbose_name="Sharpe ratio")
    sortino_ratio = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                        verbose_name="Sortino ratio")
    ulcer_index = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Ulcer index")
    r_squared = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="R squared")
    probability = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Probability")
    total_of_trades = models.IntegerField(default=0, verbose_name="Total # of trades")
    percent_profitable = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                             verbose_name="Percent profitable")
    winning_trades = models.IntegerField(default=0, verbose_name="# of winning trades")
    losing_trades = models.IntegerField(default=0, verbose_name="# of losing trades")
    even_trades = models.IntegerField(default=0, verbose_name="# of even trades")
    total_slippage = models.IntegerField(default=0, verbose_name="# of even trades")
    avg_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Avg. trade")
    avg_winning_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                            verbose_name="Avg. winning trade")
    avg_losing_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                           verbose_name="Avg. losing trade")
    ratio_win_loss = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                         verbose_name="Ratio avg. win / avg. loss")
    max_consec_winners = models.IntegerField(default=0, verbose_name="Max. consec. winners")
    max_consec_losers = models.IntegerField(default=0, verbose_name="Ratio avg. win / avg. loss")
    largest_winning_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                                verbose_name="Largest winning trade")
    largest_losing_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                               verbose_name="Largest losing trade")
    avg_trades_per_day = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                             verbose_name="Avg. # of trades per day")
    avg_time_in_market = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                             verbose_name="Avg. time in market")
    avg_bars_in_trade = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                            verbose_name="Avg. bars in trade")
    profit_per_month = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                           verbose_name="Profit per month")
    max_time_to_recover = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                              verbose_name="Max. time to recover")
    longest_flat_period = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                              verbose_name="Longest flat period")
    avg_mae = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Avg. MAE")
    avg_mfe = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Avg. MFE")
    avg_etd = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0), verbose_name="Avg. MFE")
    avg_trades_per_quarter = models.IntegerField(default=0)
    profit_per_quarter = models.DecimalField(max_digits=24, decimal_places=15, default=Decimal(0),
                                             verbose_name="Profit per quarter")

    month = models.DateTimeField(verbose_name=_("modified"), auto_now=True)
    years = models.IntegerField(verbose_name='years', default=None, null=True, blank=True)
    months = models.IntegerField(verbose_name='months', default=None, null=True, blank=True)
    version = models.CharField(max_length=255, null=True, blank=True)

    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True)
    check_date = models.DateTimeField(default=None, null=True, blank=True)
    config = models.JSONField(verbose_name="config", default=dict)
    contracts = models.JSONField(verbose_name="contracts", default=dict)

    @classmethod
    def get_performances(cls, config, months=None) -> tuple['BackTest', 'BackTest', 'BackTest']:
        all_test = cls.objects.filter(config=config, group=BackTest.ALL_TRADES, months=months).first()
        long_test = cls.objects.filter(config=config, group=BackTest.LONG_TRADES, months=months).first()
        short_test = cls.objects.filter(config=config, group=BackTest.SHORT_TRADES, months=months).first()
        return all_test, long_test, short_test

    @classmethod
    def get_by_robot(cls, robot: Robot, months: int = None) -> tuple['BackTest', 'BackTest', 'BackTest']:
        all_test = cls.objects.filter(robot=robot, group=BackTest.ALL_TRADES, months=months).first()
        long_test = cls.objects.filter(robot=robot, group=BackTest.LONG_TRADES, months=months).first()
        short_test = cls.objects.filter(robot=robot, group=BackTest.SHORT_TRADES, months=months).first()
        return all_test, long_test, short_test

    @classmethod
    def get_by_check_date(cls, query_config: dict, check_date: DateTime = None) -> tuple['BackTest', 'BackTest', 'BackTest']:
        all_test = cls.objects.filter(config=query_config,
                                      group=BackTest.ALL_TRADES,
                                      check_date__lte=check_date).order_by('-check_date').first()
        long_test = cls.objects.filter(config=query_config,
                                       group=BackTest.LONG_TRADES,
                                       check_date__lte=check_date).order_by('-check_date').first()
        short_test = cls.objects.filter(config=query_config,
                                        group=BackTest.SHORT_TRADES,
                                        check_date__lte=check_date).order_by('-check_date').first()
        return all_test, long_test, short_test

    @classmethod
    def get_by_config(cls, query_config, months) -> tuple['BackTest', 'BackTest', 'BackTest']:
        all_test = cls.objects.filter(config=query_config, group=BackTest.ALL_TRADES,
                                      months=months).first()
        long_test = cls.objects.filter(config=query_config, group=BackTest.LONG_TRADES,
                                       months=months).first()
        short_test = cls.objects.filter(config=query_config, group=BackTest.SHORT_TRADES,
                                        months=months).first()
        return all_test, long_test, short_test

    @classmethod
    def get(cls, config, months) -> tuple['BackTest', 'BackTest', 'BackTest']:
        all_test = cls.objects.filter(config=config, group=BackTest.ALL_TRADES,
                                      months=months).first()
        long_test = cls.objects.filter(config=config, group=BackTest.LONG_TRADES,
                                       months=months).first()
        short_test = cls.objects.filter(config=config, group=BackTest.SHORT_TRADES,
                                        months=months).first()
        return all_test, long_test, short_test

    def __str__(self):
        return f"{str(self.config) if self.config else self.robot.sku} - {self.group} - {self.months}"

    class Meta:
        ordering = ['-created']
        verbose_name = _('Back Test')
        verbose_name_plural = _('Back Test')
        db_table = 'back_test'


class DataBackTest(models.Model):
    backtest = models.OneToOneField(BackTest, null=True, blank=True, on_delete=models.CASCADE)
    monthly_data = models.JSONField(default=dict)
    net_monthly = models.JSONField(default=dict)
    net_daily = models.JSONField(default=dict)
    net_weekly = models.JSONField(default=dict)
    drawdown_monthly = models.JSONField(default=dict)
    drawdown_cum_monthly = models.JSONField(default=dict)
    drawdown_weekly = models.JSONField(default=dict)
    drawdown_daily = models.JSONField(default=dict)
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True)

    def __str__(self):
        return str(self.backtest)

    class Meta:
        ordering = ['-created']
        verbose_name = _('Back Test Data')
        verbose_name_plural = _('Back Test Data')
        db_table = 'back_test_data'


class Trade(models.Model):
    robot = models.ForeignKey(Robot, null=True, blank=True, on_delete=models.SET_NULL)

    signal_name = models.CharField(max_length=64, null=True, blank=True)
    account = models.CharField(max_length=255, null=True, blank=True)
    brand = models.CharField(max_length=64, null=True, blank=True)
    product_sku = models.CharField(max_length=64, null=True, blank=True)
    bars_period_type = models.CharField(max_length=64, null=True, blank=True)
    bars_period_value = models.IntegerField(default=0, null=True)

    number = models.IntegerField(default=0, verbose_name='Trade number', null=True)
    instrument = models.CharField(max_length=64, null=True, blank=True, verbose_name='Instrument')
    raw_instrument = models.CharField(max_length=64, null=True, blank=True, verbose_name='Raw Instrument')
    market_pos = models.CharField(max_length=64, null=True, blank=True, verbose_name='Market pos', )
    quantity = models.IntegerField(default=0, verbose_name='Qty', null=True)
    entry_price = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15,
                                      verbose_name='Entry price', null=True)
    exit_price = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15,
                                     verbose_name='Exit price', null=True)
    entry_time = models.DateTimeField(default=None, null=True, verbose_name='Entry time')
    exit_time = models.DateTimeField(default=None, null=True, verbose_name='Exit time')
    entry_name = models.CharField(default=None, null=True, max_length=255, verbose_name='Entry name')
    exit_name = models.CharField(default=None, null=True, max_length=255, verbose_name='Exit name')
    profit = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='Profit', null=True)
    cum_net_profit = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15,
                                         verbose_name='Cum. net profit', null=True)
    commission = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='Commission',
                                     null=True)
    mae = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='MAE', null=True)
    mfe = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='MFE', null=True)
    etd = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='ETD', null=True)
    bars = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, verbose_name='Bars', null=True)
    entry_efficiency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15)
    exit_efficiency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15)
    mae_currency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mae_percent = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mae_pips = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mae_points = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mae_ticks = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mfe_currency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mfe_percent = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mfe_pips = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mfe_points = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    mfe_ticks = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    profit_currency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    profit_percent = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    profit_pips = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    profit_points = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    profit_ticks = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15, null=True)
    total_efficiency = models.DecimalField(default=Decimal(0), max_digits=24, decimal_places=15)
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True)

    def __str__(self):
        return f"{self.signal_name} -- {self.quantity} x " \
               f"{self.instrument} -- {self.market_pos} -- " \
               f"{self.exit_time.strftime('%m/%d/%Y, %H:%M:%S')}"

    class Meta:
        db_table = 'trades'
        ordering = ['-created']

    @classmethod
    def get_robot_trades(cls, sku, start_years=None, instrument=None, count=False):
        trades = cls.objects.filter(product_sku=sku).order_by('exit_time')
        if instrument:
            trades = trades.filter(instrument=instrument)
        if count:
            return trades.count()
        if start_years:
            trades = trades.filter(exit_time__gt=start_years)
        return trades

    @classmethod
    def get_trades(cls, sku, start_years=None, instruments=None, count=False):
        trades = cls.objects.filter(product_sku=sku).order_by('exit_time')
        if instruments:
            trades = trades.filter(instrument__in=instruments)
        if count:
            return trades.count()
        if start_years:
            trades = trades.filter(exit_time__gt=start_years)
        return trades

    def save(self, *args, **kwargs):
        if not self.robot and self.product_sku:
            self.robot = Robot.objects.filter(sku__iexact=self.product_sku).first()
        if not self.robot and self.signal_name and self.product_sku:
            # create robot if needed.
            self.robot = Robot.objects.create(name=self.signal_name.strip(),
                                              crm_name=self.signal_name.strip(),
                                              sku=self.product_sku)
        for point in POINT_VALUE_MAP.keys():
            if self.instrument.startswith(point):
                self.instrument = point
        return super().save(*args, **kwargs)


class ConfigMapper(models.Model):
    version = models.CharField(null=True, max_length=255)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True, null=True, blank=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'config_mapper'


class CommissionLevel(models.Model):
    created = models.DateTimeField(verbose_name=_("created"), auto_now_add=True, null=True, blank=True)
    modified = models.DateTimeField(verbose_name=_("modified"), auto_now=True, null=True, blank=True)

    name = models.CharField(max_length=64)
    long_name = models.CharField(max_length=255)
    low = models.FloatField(default=0)
    medium = models.FloatField(default=0)
    high = models.FloatField(default=0)

    def __str__(self):
        return f"{self.name} | {self.long_name}"

    class Meta:
        db_table = 'commission_level'
        ordering = ['name']
