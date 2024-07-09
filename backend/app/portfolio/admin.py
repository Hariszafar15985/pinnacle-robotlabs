from django.contrib import admin
from .models import Robot, Portfolio, Addon, BackTest, Trade, ConfigMapper
from django.db import models
from django_json_widget.widgets import JSONEditorWidget


@admin.register(Robot)
class RobotAdmin(admin.ModelAdmin):
    list_filter = ('sku', 'group', 'active')
    search_fields = ('name', 'sku')


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    pass


@admin.register(Addon)
class AddonAdmin(admin.ModelAdmin):
    pass


@admin.register(BackTest)
class BackTestAdmin(admin.ModelAdmin):
    pass


@admin.register(ConfigMapper)
class ConfigMapperAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.JSONField: {'widget': JSONEditorWidget},
    }


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(robot__active=True)

    list_filter = ('signal_name', 'product_sku', 'instrument')

    list_display = ['__str__', 'product_sku', 'created']
