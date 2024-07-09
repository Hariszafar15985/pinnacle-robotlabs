from django.core.management import BaseCommand
from portfolio.models import PortfolioRobot, Portfolio
from portfolio.tasks import calculate_and_save_bot_data_new


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    def handle(self, *args, **options):
        ports = Portfolio.objects.all()
        ports_data = []
        list_months = [*(i for i in range(10, 130, 10)), 12]

        for port in ports:
            port_robots = PortfolioRobot.objects.filter(portfolio=port)
            robots = []
            for rp in port_robots:
                robots.append({
                    'sku': rp.robot.sku, 'instruments': {rp.market: rp.number_of_contract}
                })
            for months in list_months:
                ports_data.append(
                    {
                        "months": months,
                        "robots": robots,
                        "levels": {"ES": 1, "MES": 1, "NQ": 1, "MNQ": 1, "YM": 1, "MYM": 1, "M2K": 1, '6J': 1}
                    }
                )
        for body in ports_data:
            calculate_and_save_bot_data_new(body.get("robots"),
                                            body.get("levels"),
                                            body.get("months"))
