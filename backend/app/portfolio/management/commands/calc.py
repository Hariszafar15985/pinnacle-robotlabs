from django.core.management import BaseCommand
from portfolio.tasks import calculate_and_save_bot_data_new
from portfolio.constants import NAME_MAPPING


class Command(BaseCommand):
    help = "Add Table Data For Production"

    def handle(self, *args, **options):
        body = {
            "months": 300,
            "robots": [{'sku': '123279', 'instruments': {'MYM': 4}}, {'sku': '123295', 'instruments': {'GC': 1}},
                       {'sku': '123290', 'instruments': {'CL': 1}}, {'sku': '123291', 'instruments': {'ES': 1}},
                       {'sku': '123198', 'instruments': {'MES': 3}}, {'sku': '123273', 'instruments': {'MGC': 3}},
                       {'sku': '123296', 'instruments': {'NQ': 1}}, {'sku': '123294', 'instruments': {'6J': 1}},
                       {'sku': '123235', 'instruments': {'MCL': 3}}, {'sku': '123219', 'instruments': {'MGC': 2}},
                       {'sku': '123208', 'instruments': {'MNQ': 1}}, {'sku': '123254', 'instruments': {'MYM': 2}},
                       {'sku': '123301', 'instruments': {'MNQ': 2}}, {'sku': '123280', 'instruments': {'MCL': 5}},
                       {'sku': '123253', 'instruments': {'MES': 1}}, {'sku': '123211', 'instruments': {'MNQ': 1}},
                       {'sku': '123303', 'instruments': {'MNQ': 3}}],
            "levels": {"ES": 1, "MES": 1, "NQ": 1, "MNQ": 1, "YM": 1, "MYM": 1, "M2K": 1, '6J': 1}
        }

        res = calculate_and_save_bot_data_new(body.get("robots"),
                                              body.get("levels"),
                                              body.get("months"))

        all_trades = res.get('all_trades')
        for key, value in NAME_MAPPING.items():
            if key in all_trades:
                print(value, all_trades[key])

        # print('------------- LONG ---------------')
        # long_trades = res.get('long_trades')
        # for key, value in NAME_MAPPING.items():
        #     if key in long_trades:
        #         print(value, long_trades[key])
        #
        # print('------------- SHORT ---------------')
        # short_trades = res.get('short_trades')
        # for key, value in NAME_MAPPING.items():
        #     if key in short_trades:
        #         print(value, short_trades[key])

        # for key, val in res.get('drawdown').get('individual').items():
        #     print(key)
        #     for i in val:
        #         print(i)
        # for i in res.get('drawdown').get('drawdown_monthly'):
        #     print(i)
        # for i in res.get('cum_profit').get('monthly'):
        #     print(i)
        # print(res.get('cum_profit').get('individual'))
