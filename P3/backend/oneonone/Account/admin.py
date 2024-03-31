from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Notification, Group, Contacts

admin.site.register(get_user_model(), UserAdmin)
admin.site.register(Notification)
admin.site.register(Group)
admin.site.register(Contacts)

