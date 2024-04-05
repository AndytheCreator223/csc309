from django.urls import path
from .views import (PendingMeetingList,
                    FinalizedMeetingList,
                    PendingMeetingCreateView,
                    TimeSlotCreateView,
                    ParticipantCreateView,
                    ParticipantDeleteView,
                    PendingMeetingUpdateView,
                    TimeSlotDeleteView,
                    ParticipantUpdateView,
                    get_pending_meeting,
                    get_meeting_participants,
                    get_participant_response,
                    post_finalized_meetings,
                    get_suggested_meetings_order,
                    get_suggested_meetings_priority,
                    delete_pending_meeting,
                    notify_not_responded_invitees,
                    send_email_view,
                    list_participant_meetings)

urlpatterns = [
    path('pending-meeting/list/', PendingMeetingList.as_view(), name='pending-meetings'),
    path('pending-meeting/detail/<int:meeting_id>/', get_pending_meeting, name='get_pending_meetings'),
    path('pending-meeting/create/', PendingMeetingCreateView.as_view(), name='create-pending-meeting'),


    path('pending-meeting/delete/<int:meeting_id>/', delete_pending_meeting, name='delete_pending_meeting'),
    path('pending-meeting/update/<int:meeting_id>/', PendingMeetingUpdateView.as_view(), name='update-pending-meeting'),
    path('pending-meeting/notify/', notify_not_responded_invitees, name='notify_not_responded_invitees'),

    path('time-slots/create/', TimeSlotCreateView.as_view(), name='create-time-slot'),
    path('time-slots/delete/<int:meeting_id>/', TimeSlotDeleteView.as_view(), name='delete-time-slot'),

    # Delete cascade? i.e. user delete contact
    path('participant/list/<int:meeting_id>/', get_meeting_participants, name='get_meeting_participants'),
    path('participant/detail/<int:meeting_id>/<int:user_id>/', get_participant_response, name='get_participant_response'),

    path('participant/create/', ParticipantCreateView.as_view(), name='create-participant'),
    path('participant/delete/<int:meeting_id>/<int:user_id>/', ParticipantDeleteView.as_view(), name='delete-participant'),
    path('participant/update/<int:meeting_id>/<int:user_id>/', ParticipantUpdateView.as_view(), name='update-participant'),


    path('finalized-meeting/list/', FinalizedMeetingList.as_view(), name='finalized-meetings'),
    path('finalized-meeting/create/', post_finalized_meetings, name='post_finalized_meetings'),


    path('suggested-meeting/get-order/<int:meeting_id>/', get_suggested_meetings_order, name='get_suggested_meetings_order'),
    path('suggested-meeting/get-priority/<int:meeting_id>/', get_suggested_meetings_priority, name='get_suggested_meetings_priority'),

    path('send-email/', send_email_view, name='send-email'),
    path('pending-meeting/participant-meetings/', list_participant_meetings, name='list-participant-meetings'),
]