from django.core.management import BaseCommand

from portfolio.constants import NAME_MAPPING
from portfolio.utils import calculate_multiple_robot


class Command(BaseCommand):
    help = 'Add Table Data For Production'

    def handle(self, *args, **options):
        # contracts = {'123198': {'MES': 5}, '123199': {'MES': 1}, '123201': {'MNQ': 1}, '123203': {'MNQ': 2},
        #              '123208': {'MNQ': 1}, '123211': {'MNQ': 2}, '123213': {'MNQ': 1}, '123234': {'MGC': 4},
        #              '123235': {'MCL': 3}, '123252': {'MGC': 3}, '123253': {'MES': 1}, '123254': {'MYM': 2},
        #              '123273': {'MGC': 3}, '123279': {'MYM': 4}, '123280': {'MCL': 5}, '123290': {'CL': 1},
        #              '123291': {'ES': 1}, '123295': {'GC': 1}, '123296': {'NQ': 1}, '123301': {'MNQ': 3},
        #              '123303': {'MNQ': 4}}
        # config = [{'123198': 'MES'}, {'123199': 'MES'}, {'123201': 'MNQ'}, {'123203': 'MNQ'}, {'123208': 'MNQ'},
        #           {'123211': 'MNQ'}, {'123213': 'MNQ'}, {'123234': 'MGC'}, {'123235': 'MCL'}, {'123252': 'MGC'},
        #           {'123253': 'MES'}, {'123254': 'MYM'}, {'123273': 'MGC'}, {'123279': 'MYM'}, {'123280': 'MCL'},
        #           {'123290': 'CL'}, {'123291': 'ES'}, {'123295': 'GC'}, {'123296': 'NQ'}, {'123301': 'MNQ'},
        #           {'123303': 'MNQ'}]

        config = [{'123209': 'ES'}]
        contracts = {'123209': {'ES': 1}}
        all_data, long_data, short_data, monthly_data = calculate_multiple_robot(config, months=120,
                                                                                 contracts=contracts)

        print(all_data)
        for key, value in NAME_MAPPING.items():
            if key in all_data:
                print(value, all_data.get(key))

        # for key, value in NAME_MAPPING.items():
        #     if key in long_data:
        #         print(value, long_data.get(key))

        # for key, value in NAME_MAPPING.items():
        #     if key in short_data:
        #         print(value, short_data.get(key))
