from django.urls import path
from .views import create_user_view, profile_edit_view, get_active_notifications, get_notification_by_id, \
    list_contacts_view, add_contact_view, create_group_view, list_groups_view, view_group, delete_group, remove_member, \
    add_member, change_group_name, delete_contact_view, get_all_users, mark_all_notifications_as_seen, \
    delete_notification, delete_read_notifications


urlpatterns = [
    path('register/', create_user_view, name='register'),
    path('profile/', profile_edit_view, name='profile'),
    path('notifications/', get_active_notifications, name='active_notifications'),
    path('notifications/<int:notification_id>/', get_notification_by_id, name='notification-by-id'),
    path('contacts/', list_contacts_view, name='list-contacts'),
    path('contacts/add/', add_contact_view, name='add-contact'),
    path('contacts/delete/<str:username>/', delete_contact_view, name='delete-contact'),
    path('group/create/', create_group_view, name='create-group'),
    path('group/', list_groups_view, name='list-groups'),
    path('group/<int:group_id>/', view_group, name='view-group'),
    path('group/<int:group_id>/delete/', delete_group, name='delete-group'),
    path('group/<int:group_id>/remove/<str:username>/', remove_member, name='remove-member'),
    path('group/<int:group_id>/add/<str:username>/', add_member, name='add-member'),
    path('group/<int:group_id>/change-name/', change_group_name, name='change-group-name'),
    path('user/user_list/', get_all_users, name='user-list'),
    path('notifications/mark-all-seen/', mark_all_notifications_as_seen, name='mark-all-notifications-as-seen'),
    path('notifications/delete/<int:notification_id>/', delete_notification, name='delete-notification'),
    path('notifications/delete-read/', delete_read_notifications, name='delete-read-notifications'),
]