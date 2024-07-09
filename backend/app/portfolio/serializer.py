import decimal

from rest_framework import serializers
from .models import Robot, Portfolio, Addon, BackTest, Trade, Category, PortfolioRobot


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'name', 'sku', 'instruments', 'category',
                  'edge_ratio', 'pro')
        model = Robot


class PortRobotMiniSerializer(serializers.ModelSerializer):
    sku = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    pro = serializers.SerializerMethodField()

    @staticmethod
    def get_sku(pr: PortfolioRobot):
        return pr.robot.sku

    @staticmethod
    def get_id(pr: PortfolioRobot):
        return pr.robot.id

    @staticmethod
    def get_name(pr: PortfolioRobot):
        return pr.robot.name

    @staticmethod
    def get_pro(pr: PortfolioRobot):
        return pr.robot.pro

    class Meta:
        fields = ('name', 'sku', 'market', 'id', 'number_of_contract', 'pro')
        model = PortfolioRobot


class PortfolioSerializer(serializers.ModelSerializer):
    robots = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(slug_field='name', read_only=True)

    @staticmethod
    def get_robots(port: Portfolio) -> list[dict]:
        robots = PortfolioRobot.objects.filter(portfolio=port)
        data = PortRobotMiniSerializer(robots, many=True).data
        return data

    class Meta:
        fields = ('id', 'name', 'category', 'robots', 'tab')
        model = Portfolio


class AddonSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Addon


class SimulatedSerializer(serializers.Serializer):
    number_of_contract = serializers.IntegerField(default=1, required=False)
    contract_type = serializers.CharField(default='ES', allow_blank=True)
    column = serializers.CharField(required=False, default="Cum. net profit", allow_blank=True)
    addon = serializers.ListField(required=False)
    years = serializers.IntegerField(default=None, allow_null=True, required=False)


class RobotSimulatedSerializer(serializers.Serializer):
    robots = serializers.ListField()
    levels = serializers.JSONField(default=dict)
    months = serializers.IntegerField(default=12)


class SimulatedReturnSerializer(serializers.Serializer):
    avg_usd_per_trade = serializers.SerializerMethodField()
    avg_trades_per_quarter = serializers.SerializerMethodField()
    profit_per_quarter = serializers.SerializerMethodField()
    profit_per_year = serializers.SerializerMethodField()

    total_net_profit = serializers.DecimalField(decimal_places=2, max_digits=24)
    gross_profit = serializers.DecimalField(decimal_places=2, max_digits=24)
    gross_loss = serializers.DecimalField(decimal_places=2, max_digits=24)
    commission = serializers.DecimalField(decimal_places=2, max_digits=24)
    profit_factor = serializers.DecimalField(decimal_places=2, max_digits=24)
    profit_per_month = serializers.DecimalField(decimal_places=2, max_digits=24)
    # profit_per_quarter = serializers.DecimalField(decimal_places=2, max_digits=24)
    max_drawdown = serializers.DecimalField(decimal_places=2, max_digits=24)
    sharpe_ratio = serializers.DecimalField(decimal_places=2, max_digits=24)
    sortino_ratio = serializers.DecimalField(decimal_places=2, max_digits=24)
    ulcer_index = serializers.DecimalField(decimal_places=2, max_digits=24)
    # r_squared = serializers.DecimalField(decimal_places=2, max_digits=24)
    # probability = serializers.DecimalField(decimal_places=2, max_digits=24)
    total_of_trades = serializers.DecimalField(decimal_places=2, max_digits=24)
    percent_profitable = serializers.DecimalField(decimal_places=2, max_digits=24)
    winning_trades = serializers.DecimalField(decimal_places=2, max_digits=24)
    losing_trades = serializers.DecimalField(decimal_places=2, max_digits=24)
    even_trades = serializers.DecimalField(decimal_places=2, max_digits=24)
    # total_slippage = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_winning_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_losing_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    ratio_win_loss = serializers.DecimalField(decimal_places=2, max_digits=24)
    max_consec_winners = serializers.DecimalField(decimal_places=2, max_digits=24)
    max_consec_losers = serializers.DecimalField(decimal_places=2, max_digits=24)
    largest_winning_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    largest_losing_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_trades_per_day = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_time_in_market = serializers.DecimalField(decimal_places=2, max_digits=24)
    # avg_bars_in_trade = serializers.DecimalField(decimal_places=2, max_digits=24)
    max_time_to_recover = serializers.DecimalField(decimal_places=2, max_digits=24)
    longest_flat_period = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_mae = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_mfe = serializers.DecimalField(decimal_places=2, max_digits=24)
    avg_etd = serializers.DecimalField(decimal_places=2, max_digits=24)
    # avg_trades_per_quarter = serializers.IntegerField(default=0)

    class Meta:
        fields = '__all__'

    @staticmethod
    def get_profit_per_quarter(obj: dict):
        return round(obj.get('profit_per_month') * 3, 2)  # change from month to quarter

    @staticmethod
    def get_avg_trades_per_quarter(obj: dict):
        val = obj.get('total_of_trades')
        if val > 0:
            return round(obj.get('total_of_trades') / 40)
        return 0

    @staticmethod
    def get_profit_per_year(obj: dict) -> float:
        val = obj.get('total_net_profit')
        if val > 0:
            return round(val / 10, 2)
        return 0

    @staticmethod
    def get_avg_usd_per_trade(obj: dict) -> float:
        total_net_profit = obj.get('total_net_profit')
        total_of_trades = obj.get('total_of_trades')
        if total_of_trades > 0 and total_net_profit > 0:
            return round(total_net_profit / total_of_trades, 2)
        return 0


class AllDataSerializer(serializers.ModelSerializer):
    avg_usd_per_trade = serializers.SerializerMethodField()
    avg_trades_per_quarter = serializers.SerializerMethodField()
    profit_per_quarter = serializers.SerializerMethodField()
    profit_per_year = serializers.SerializerMethodField()
    sortino_ratio = serializers.DecimalField(decimal_places=2, max_digits=24)

    class Meta:
        model = BackTest
        fields = '__all__'

    @staticmethod
    def get_profit_per_quarter(obj: BackTest) -> float:
        return round(obj.total_net_profit / 40, 2)

    @staticmethod
    def get_profit_per_year(obj: BackTest) -> float:
        return round(obj.total_net_profit / 10, 2)

    @staticmethod
    def get_avg_trades_per_quarter(obj: BackTest) -> float:
        return round(decimal.Decimal(obj.total_of_trades / 40))

    @staticmethod
    def get_avg_usd_per_trade(obj: BackTest) -> float:
        return round(obj.total_net_profit / obj.total_of_trades, 2)


class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
