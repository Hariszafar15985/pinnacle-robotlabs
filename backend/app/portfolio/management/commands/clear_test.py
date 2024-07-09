from django.core.management import BaseCommand

from base_api import logger
from portfolio.models import BackTest, DataBackTest


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    @staticmethod
    def clear():
        logger.info(BackTest.objects.all().delete())
        logger.info(DataBackTest.objects.all().delete())

    def handle(self, *args, **options):
        self.clear()
