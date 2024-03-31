from django.contrib import admin
from .models import PendingMeeting, TimeSlot, Participant, FinalizedMeeting, SuggestedSchedule, SuggestedTimeSlot

# Register your models here.
admin.site.register(PendingMeeting)
admin.site.register(TimeSlot)
admin.site.register(Participant)
admin.site.register(FinalizedMeeting)
admin.site.register(SuggestedSchedule)
admin.site.register(SuggestedTimeSlot)