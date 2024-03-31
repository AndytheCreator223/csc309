from django.db import models
from Account.models import User
from enumfields import EnumField
from enum import Enum


class PendingMeeting(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    time_limit = models.IntegerField()
    message = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=255)
    deadline = models.DateTimeField()

    def __str__(self):
        return f"{self.pk}: {self.title}, {self.owner.username}"


class TimeSlot(models.Model):
    meeting = models.ForeignKey(PendingMeeting, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    priority = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.meeting.title}, {self.user.username}, {self.start_time}"


class Participant(models.Model):
    meeting = models.ForeignKey(PendingMeeting, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    response = models.BooleanField()
    response_time = models.DateTimeField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.meeting.title}, {self.user.username}"


class FinalizedMeeting(models.Model):
    title = models.CharField(max_length=255)
    time = models.DateTimeField()
    time_limit = models.IntegerField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="finalized_meeting_owner")
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="finalized_meeting_participant")

    def __str__(self):
        return f"{self.title}, {self.owner.username}"


class Priority(Enum):
    INVITEE_ORDER = 0
    INVITEE_PRIORITIES = 1


class SuggestedSchedule(models.Model):
    meeting = models.ForeignKey(PendingMeeting, on_delete=models.CASCADE)
    priority = EnumField(Priority, default=Priority.INVITEE_ORDER)
    n_scheduled = models.IntegerField()
    def __str__(self):
        return f"{self.meeting.title} ({self.pk})"


class SuggestedTimeSlot(models.Model):
    meeting = models.ForeignKey(SuggestedSchedule, on_delete=models.CASCADE)
    time = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.meeting.meeting.title}, ({self.meeting.pk}), {self.user.username}, {self.time}"
