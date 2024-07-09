import decimal
import json

from celery.result import AsyncResult
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, views, permissions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from base_api.paging import TinySetPagination
from base_api.permissions import IsAdminOrReadOnly
from base_api.tool import success_response, error_response
from .constants import NAME_MAPPING, MICRO_MARKET, REGULAR_MARKET
from .models import Robot, Portfolio, BackTest, Trade, ConfigMapper, Category, CommissionLevel
from .serializer import RobotSerializer, PortfolioSerializer, \
    RobotSimulatedSerializer, SimulatedSerializer, TradeSerializer, CategorySerializer
from .tasks import calculate_and_save_bot_data_new


class PortfolioAPIView(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer
    permissions = [IsAdminOrReadOnly]
    queryset = Portfolio.objects.filter(active=True).order_by('id')

    @action(detail=False, serializer_class=SimulatedSerializer, permissions=[], methods=['GET'])
    def mapping(self, request, *args, **kwargs):
        return success_response(NAME_MAPPING)


class RobotAPIView(viewsets.ModelViewSet):
    serializer_class = RobotSerializer
    permissions = [IsAdminOrReadOnly]
    queryset = Robot.objects.filter(active=True, pro=False).order_by('id')
    lookup_field = 'id'
    filter_backends = (SearchFilter, DjangoFilterBackend)
    filterset_fields = ('name', 'group')

    def get_queryset(self):
        pro = self.request.query_params.get('pro')
        if pro:
            return Robot.objects.filter(active=True).order_by('id')
        return Robot.objects.filter(active=True, pro=False).order_by('id')

    @action(detail=False, serializer_class=RobotSimulatedSerializer, permissions=[], methods=['POST'])
    def simulate(self, request, *args, **kwargs):
        months = self.request.data.get('months')
        levels = self.request.data.get('levels')
        robots = self.request.data.get('robots')

        if not levels or not robots:
            return error_response("Invalid post data, missing levels or robots")
        resp = calculate_and_save_bot_data_new(robots, levels, months)
        return success_response(resp)

    @method_decorator(cache_page(60 * 60 * 8))
    @action(methods=['GET'], permissions=[], detail=False)
    def instruments(self, *args, **kwargs):
        mini = ConfigMapper.objects.filter(name='mini').first()
        if not mini:
            mini = ConfigMapper.objects.create(name='mini', config=REGULAR_MARKET)
        micro = ConfigMapper.objects.filter(name='micro').first()
        if not micro:
            micro = ConfigMapper.objects.create(name='micro', config=MICRO_MARKET)
        res = {"regular": [], "micro": []}

        for m in mini.config:
            res['regular'].append({
                "name": m,
                "signals": Robot.objects.filter(regular=m, active=True).count()
            })

        for n in micro.config:
            res['micro'].append({
                "name": n,
                "signals": Robot.objects.filter(micro=n, active=True).count()
            })
        return success_response(res)

    @method_decorator(cache_page(60 * 60 * 12))
    @action(methods=['GET'], permissions=[], detail=False)
    def categories(self, *args, **kwargs):
        cates = Category.objects.all()
        return success_response(CategorySerializer(cates, many=True).data)

    @action(methods=['GET'], permissions=[], detail=False)
    def trend(self, *args, **kwargs):
        order = '-total_net_profit'
        if self.request.query_params.get('bad', False):
            order = 'total_net_profit'
        trades = BackTest.objects.filter(months=1, skus__len=1).order_by(order)
        robots = []
        for trade in trades:
            if len(robots) == 5:
                break
            if trade.robot and trade.robot not in robots:
                robots.append(trade.robot)
        serializer = RobotSerializer(robots, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], permissions=[], detail=False)
    def groups(self, *args, **kwargs):
        return success_response({})

    @action(methods=['GET'], permissions=[], detail=False)
    def commission(self, *args, **kwargs):
        data = []
        for commission in CommissionLevel.objects.all():
            data.append({
                "name": commission.name,
                "long_name": commission.long_name,
                "1": commission.low,
                "2": commission.medium,
                "3": commission.high,
            })
        return Response(data)

    @action(methods=['GET'], permissions=[], detail=False)
    def test(self, *args, **kwargs):
        Robot.objects.get(sku__icontains=1)
        return success_response()

    @action(methods=['GET'], permissions=[], detail=False)
    def error(self, *args, **kwargs):
        Robot.objects.get(sku__icontains=1123123)
        return success_response()


class TaskResultView(views.APIView):
    permission_classes = []
    authentication_classes = []

    @staticmethod
    def get_object(pk) -> AsyncResult:
        try:
            task = AsyncResult(pk)
            return task
        except Exception as e:
            print(e)

    def get(self, request, pk, *args, **kwargs):
        task: AsyncResult = self.get_object(pk)
        if task.status == 'SUCCESS':
            result = task.result
            number = result.get('number', 1)
            chart = []
            for d in result['chart_data']:
                chart.append([d[0], round(float(d[1]), 2)])
            all_trades = {key: decimal.Decimal(value) * number for key, value in result['all_trades'].items()}
            long_trades = {key: decimal.Decimal(value) * number for key, value in result['long_trades'].items()}
            short_trades = {key: decimal.Decimal(value) * number for key, value in result['short_trades'].items()}
            data = {
                'all_trades': all_trades,
                'long_trades': long_trades,
                'short_trades': short_trades,
                'chart_data': chart,
            }
            return success_response(data)
        else:
            return success_response()


class TradeAPIView(viewsets.ModelViewSet):
    serializer_class = TradeSerializer
    queryset = Trade.objects.all().order_by('-created')
    pagination_class = TinySetPagination
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ('robot', 'signal_name', 'product_sku')
