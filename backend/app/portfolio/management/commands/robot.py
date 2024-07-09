from django.core.management.base import BaseCommand

from base_api.tool import generate_string
from portfolio.constants import (MICRO_MAP, REGULAR_MARKET, LONG_MAP, SKUS_MAP, PROS, category_map, ROBOT_NORMAL,
                                 COMMISSION_LEVELS,
                                 CASHFLOW_AGGRESSIVE, CASHFLOW_AGGRESSIVE_BOTS, WARCHEST_AGGRESSIVE,
                                 WARCHEST_AGGRESSIVE_BOTS, WARCHEST_CONSERVATIVE_BOTS, MIXED_US_INDEX_FUTURES,
                                 MIXED_US_INDEX_FUTURES_BOTS)
from portfolio.data import categories
from portfolio.models import Robot, PortfolioRobot, Portfolio, Category, CommissionLevel

CONSERVATIVE = 'War Chest Conservative'
MODERATE = 'War Chest Moderate'
CASH = 'Cash Flow Moderate'


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    @staticmethod
    def create_category():
        for c in categories:
            cate, created = Category.objects.get_or_create(**c, defaults={'name': c.get('name')})
            if created:
                print(f"======= CREATED {cate.name}")
            else:
                print(f"======= Existed {cate.name}")

    @staticmethod
    def create_commission_level():
        for commission in COMMISSION_LEVELS:
            comm = CommissionLevel.objects.create(
                name=commission.get('name'),
                long_name=commission.get('long_name'),
                high=commission.get('3'),
                medium=commission.get('2'),
                low=commission.get('1'),
            )
            print(comm)

    @staticmethod
    def change_robot_to_pro():
        data = [
            "Aggression Referee",
            "Break Dancer",
            "Inventory Auditor",
            "Metal Maniac",
            "Volume Spiker",
            "Uncle Sam's Bookie"
        ]

        robot = Robot.objects.filter(name__in=data)
        print(robot.update(pro=False))

    @staticmethod
    def create_robot():
        Robot.objects.all().delete()
        for r in PROS:
            category_id = category_map.get(r[0].strip())
            name = r[1].strip()
            instrument = r[2].strip()
            instruments = instrument.split('/')
            regular = None
            micro = None
            pro = False
            market_long = LONG_MAP.get(instrument)
            if name not in ROBOT_NORMAL:
                pro = True
            if len(instruments) == 2:
                regular = instruments[0].strip()
                micro = instruments[1].strip()
            else:
                i = instruments[0]
                if i in REGULAR_MARKET:
                    regular = i.strip()
                elif i in MICRO_MAP.values():
                    micro = i.strip()
                else:
                    print(f"--------- Can't process {name} | {i}")
                    continue

            robots = Robot.objects.filter(name=name)
            if robots.count() == 1:
                robot = robots.first()
                robot.regular = regular
                robot.micro = micro
                robot.pro = pro
                robot.sku = SKUS_MAP.get(robot.name)
                robot.category_id = category_id
                robot.markets_long = market_long
                robot.save()
                print(f"---- Updated {robot} -----")
            elif robots.count() == 0:
                robot = Robot.objects.create(
                    name=name, regular=regular, category_id=category_id,
                    micro=micro, markets_long=market_long,
                    sku=SKUS_MAP.get(name, generate_string(6)), pro=pro,
                )
                print(f"Created {robot}")
            else:
                for robot in robots:
                    print(f" ERROR: {robot}")

        for robot in Robot.objects.all():
            instruments = []
            if SKUS_MAP.get(robot.name):
                robot.sku = SKUS_MAP.get(robot.name)
            else:
                print(f"---- No sku : {robot.name} ----")
            if robot.regular:
                instruments.append({'type': 'reglar', 'name': robot.regular})
            if robot.micro:
                instruments.append({'type': 'micro', 'name': robot.micro})
            robot.instruments = instruments
            robot.save()


    def handle(self, *args, **options):
        self.create_category()
        self.create_robot()
        self.create_commission_level()
        self.change_robot_to_pro()
