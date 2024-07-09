from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RobotAPIView, PortfolioAPIView, TaskResultView, TradeAPIView

router = DefaultRouter()

router.register('robot', RobotAPIView, basename='Robot API')
router.register('portfolio', PortfolioAPIView, basename='Portfolio API')
router.register('trade', TradeAPIView, basename='Trade API')

urlpatterns = router.urls

urlpatterns += [
    # path('all_data', AllDataAPI.as_view(), name='all_data'),
    path('task/<str:pk>/', TaskResultView.as_view(), name='result')
]
