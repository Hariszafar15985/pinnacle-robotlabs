from django.core.management.base import BaseCommand

from portfolio.constants import (CASHFLOW_AGGRESSIVE, CASHFLOW_AGGRESSIVE_BOTS, WARCHEST_AGGRESSIVE,
                                 WARCHEST_AGGRESSIVE_BOTS, WARCHEST_CONSERVATIVE_BOTS, MIXED_US_INDEX_FUTURES,
                                 MIXED_US_INDEX_FUTURES_BOTS, WARCHEST_CONSERVATIVE,
                                 DIVERSIFIED_BOTS, DIVERSIFIED, MINI_HEDGE_FUND_BOTS, MINI_HEDGE_FUND)
from portfolio.models import Robot, PortfolioRobot, Portfolio


def create_port(name: str, tab: str, robots: list):
    port = Portfolio.objects.filter(name=name, tab=tab, active=True).first()
    if not port:
        port = Portfolio.objects.create(name=name, tab=tab, active=True)
    for data in robots:
        name = data[0].strip()
        robot = Robot.objects.filter(name=name)
        number_of_contract = data[1]
        market = data[2].strip()
        if robot.count() > 1:
            robot = robot.filter(micro=market).first()
        else:
            robot = robot.first()
        if not robot:
            print(f'--- ERROR {name} {market}')
        pr = PortfolioRobot.objects.create(robot=robot,
                                           portfolio=port,
                                           number_of_contract=number_of_contract,
                                           market=market)
        print(pr)


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    def handle(self, *args, **options):
        PortfolioRobot.objects.all().delete()
        Portfolio.objects.all().delete()

        print("------ CASHFLOW_AGGRESSIVE ------")
        create_port(name=CASHFLOW_AGGRESSIVE,
                    tab=Portfolio.NORMAL,
                    robots=CASHFLOW_AGGRESSIVE_BOTS)

        print("------ WARCHEST_CONSERVATIVE ------")
        create_port(name=WARCHEST_CONSERVATIVE,
                    tab=Portfolio.NORMAL,
                    robots=WARCHEST_CONSERVATIVE_BOTS)

        print("------ WARCHEST_AGGRESSIVE -----")
        create_port(name=WARCHEST_AGGRESSIVE,
                    tab=Portfolio.NORMAL,
                    robots=WARCHEST_AGGRESSIVE_BOTS)

        print("------ MIXED_US_INDEX_FUTURES -----")
        create_port(name=MIXED_US_INDEX_FUTURES, tab=Portfolio.NORMAL,
                    robots=MIXED_US_INDEX_FUTURES_BOTS)

        print("------ ADDITION_OF_DIVERSIFIED_FUTURES -----")
        create_port(name=DIVERSIFIED,
                    tab=Portfolio.NORMAL,
                    robots=DIVERSIFIED_BOTS)

        print("------ MINI_HEDGE_FUND -----")
        create_port(name=MINI_HEDGE_FUND,
                    tab=Portfolio.NORMAL,
                    robots=MINI_HEDGE_FUND_BOTS)
