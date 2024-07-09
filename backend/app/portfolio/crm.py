import requests
from django.conf import settings
from django.core.cache import cache

DEFAULT_FILTER_TYPE = 'brand_name'
DEFAULT_FILTER_VALUE = 'EminiBots'

DATA_CACHE_KEY = 'crm_token'


class CrmRequest:
    token = None
    headers = {
        'X-LCNS-APIKEY': settings.APIKEY,
        'X-LCNS-APISECRET': settings.APISECRET,
        'Content-Type': 'application/json'
    }

    refresh_token = None

    def __init__(self):
        if not self.refresh_token or self.token:
            json_data = cache.get(DATA_CACHE_KEY)
            if json_data:
                self.token = json_data.get('access_token')
                self.refresh_token = json_data.get('refresh_token')
            else:
                self.get_token()
        self.prefix = 'apistage'
        if settings.PRODUCTION:
            self.prefix = 'apido'

    @staticmethod
    def build_filter(filter_type: str = None, value: str = None):
        return {
            "filters": [{"id": filter_type if filter_type else DEFAULT_FILTER_TYPE,
                         "value": value if value else DEFAULT_FILTER_VALUE}]
        }

    def get_token(self):

        url = f"https://{self.prefix}.tradinglicenses.com/api/v1.0/get_token?oauth=token&expiration=631138519"
        data = requests.post(url, headers=self.headers)
        if data.status_code == 200:
            json_data = data.json()
            self.token = json_data['access_token']
            self.refresh_token = json_data['refresh_token']
            cache.set(DATA_CACHE_KEY, json_data)
        else:
            print(data.json())
            return data.json()

    def get_product(self):
        body = self.build_filter()
        url = f'https://{self.prefix}.tradinglicenses.com/api/v1.0/get_products?token=' + self.token
        data = requests.post(url, json=body, headers=self.headers)
        if data.status_code == 200:
            json_data = data.json()
            return json_data['result']['records']
        return data.json()
