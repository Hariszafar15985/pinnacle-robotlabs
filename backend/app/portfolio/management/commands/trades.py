from django.core.management.base import BaseCommand

from portfolio.tasks import get_trades_from_csv, sync_trades_from_s3


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            "--s3",
            action="store_true",
            help="Delete poll instead of closing it",
        )

    def handle(self, *args, **options):
        s3 = options.get('s3')
        if s3:
            sync_trades_from_s3()
        else:
            get_trades_from_csv()
