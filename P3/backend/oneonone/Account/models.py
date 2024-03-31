from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)


class Notification(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    show_time= models.DateTimeField()
    expire_time= models.DateTimeField()
    is_seen = models.BooleanField(default=False)


class Contacts(models.Model):
    owner = models.ForeignKey(User, related_name='owner', on_delete=models.CASCADE)
    contact = models.ForeignKey(User, related_name='contact', on_delete=models.CASCADE)


class Group(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(User, related_name='members')