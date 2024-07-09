# from django.db import models
# from django.utils.translation import gettext as _
# from django.contrib.postgres.fields import ArrayField

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Meta:
        db_table = 'auth_user'


# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='profile')
#     tags = ArrayField(default=list, base_field=models.CharField(max_length=255))
#     phone_number = models.CharField(null=True, blank=True, max_length=64,)
#     code = models.CharField(null=True, blank=True, max_length=10)
#     address = models.TextField(blank=True)
#     country = models.CharField(null=True, blank=True, max_length=50)
#
#     class Meta:
#         verbose_name = _('User Profile')
#         verbose_name_plural = _('User Profiles')
#         db_table = 'user_profiles'
