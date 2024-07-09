import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robotlab.settings')

from django.conf import settings  # noqa
app = Celery('robotlab')
app.config_from_object('django.conf:settings')
app.autodiscover_tasks()

app.conf.update(
    worker_max_tasks_per_child=1,
    broker_pool_limit=None
)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
