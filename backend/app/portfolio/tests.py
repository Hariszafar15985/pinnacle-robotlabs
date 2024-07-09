from rest_framework import status
from rest_framework.test import APITestCase

from portfolio.data import categories
from portfolio.models import Category


class CategoryTests(APITestCase):
    CATEGORIES = [{
        "id": 1,
        "name": "Active",
        "color": "#37BB8F",
        "index": 1,
        "config": {}
    }, {
        "id": 2,
        "name": "Ambitious",
        "color": "#9465BC",
        "index": 2,
        "config": {}
    }, {
        "id": 3,
        "name": "Aggressive",
        "color": "#E86367",
        "index": 3,
        "config": {}
    }
    ]

    def setUp(self) -> None:
        for c in categories:
            Category.objects.get_or_create(**c)

    def test_create_account(self):
        """
        Ensure we can create a new account object.
        """
        url = '/robot/categories/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, self.CATEGORIES)
