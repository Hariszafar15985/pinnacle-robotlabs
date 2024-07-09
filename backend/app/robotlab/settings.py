import os
from pathlib import Path
import socket

HOSTNAME = socket.gethostname()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'wg*$t(6jfmpq&_d*&u+g-t-(5#xxqhfk*xp+mq8$-(hds82cbe'

DEBUG = True
envi = os.environ.get('PRODUCTION', 0)
if not envi:
    envi = 0
PRODUCTION = bool(int(envi))

APIKEY = os.environ.get('APIKEY')
APISECRET = os.environ.get('APISECRET')

ALLOWED_HOSTS = ["*"]
CSRF_TRUSTED_ORIGINS = ['https://*.robotportfoliolab.com', 'http://*.robotportfoliolab.com',
                        'https://robotportfoliolab.com', 'http://robotportfoliolab.com']
CORS_ALLOW_ALL_ORIGINS = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # user apps
    'users',
    'portfolio',

    # third party
    'django_filters',
    'corsheaders',
    'rest_framework',
    # 'rest_framework.authtoken',
    # 'django_celery_beat',
    # 'django_json_widget',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'robotlab.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'robotlab.wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

STATIC_URL = '/static/'
MEDIA_URL = '/media/'

MONEY_MAX_DIGITS = 24
MONEY_DECIMAL_PLACES = 2
XRATE_MAX_DIGITS = 15
XRATE_DECIMAL_PLACES = 0

REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ]
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

CELERY_BROKER_URL = "redis://redis:6379/0"
BROKER_URL = 'redis://redis:6379'
CELERY_RESULT_BACKEND = 'redis://redis:6379'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

WP_TOKEN = 'R08zUFUycllCM1d3RUtHUmtZT2NLbjlUU2ZZTXNJUGNuUHhlM1hrZTp' \
           '5ekZ4Njd6akZndmZVckRsdVFTQWZrdXRoSnU1QjBnQkJnVDlnOE5n '

DATA_VERSION_NAME = 'BackTest Data Version'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '[{levelname} | {asctime} | {filename}:{lineno}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'formatter': 'simple',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'formatter': 'simple',
            'filename': 'backend.log',
        },
        'file_error': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'formatter': 'simple',
            'filename': 'error.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        "root": {
            "handlers": ["file_error"],
            "level": "ERROR",
            'propagate': True,
        },
    },
}

AWS_STORAGE_BUCKET_NAME = "robotlab"
AWS_S3_ACCESS_KEY_ID = os.getenv('S3_ACCESS_KEY')
AWS_S3_SECRET_ACCESS_KEY = os.getenv('S3_SECRET')

DEFAULT_HOST_LIST_DAYS = 30

if PRODUCTION:
    DEBUG = False
    # DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    # STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

    STORAGES = {"default": {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"},
                "staticfiles": {"BACKEND": "storages.backends.s3boto3.S3StaticStorage"}}

AUTH_USER_MODEL = 'users.User'
