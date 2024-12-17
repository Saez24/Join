from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(
        max_length=15, default=None, null=True, blank=True)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
