from django.utils import timezone
from rest_framework import serializers
from .models import PendingMeeting, Participant, FinalizedMeeting, TimeSlot
from Account.models import Contacts
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from Account.serializers import UserSerializer
from datetime import timedelta
from django.db.models import Q


class ParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Participant
        fields = ('user', 'response')


class ParticipantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['meeting', 'user', 'content']

    def validate(self, data):
        # Check if the provided user is a contact of the current request user
        request_user = self.context['request'].user
        user_id = data['user']
        meeting = data['meeting']

        # Check if the request user is the owner of the meeting
        if meeting.owner != request_user:
            raise serializers.ValidationError("Only the meeting owner can add participants.")

        if not Contacts.objects.filter(owner=request_user, contact_id=user_id).exists():
            raise serializers.ValidationError("The provided user is not a contact of the current user.")

        # Check for duplicates
        if Participant.objects.filter(meeting=meeting, user_id=user_id).exists():
            raise serializers.ValidationError("This user is already a participant in the meeting.")

        return data

    def create(self, validated_data):
        validated_data['response'] = False  # Automatically set response to False
        if 'content' not in validated_data or not validated_data['content']:
            validated_data['content'] = ""  # Set content to empty
        return Participant.objects.create(**validated_data)


class PendingMeetingSerializer(serializers.ModelSerializer):
    has_passed_deadline = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = PendingMeeting
        fields = ('id', 'title', 'deadline', 'has_passed_deadline', 'participants')

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_has_passed_deadline(self, obj):
        return obj.deadline < timezone.now()

    @extend_schema_field(serializers.ListField(child=ParticipantSerializer()))
    def get_participants(self, obj):
        participants = Participant.objects.filter(meeting=obj)
        return ParticipantSerializer(participants, many=True).data

class CustomPendingMeetingSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    class Meta:
        model = PendingMeeting
        fields = ('id', 'title', 'deadline', 'time_limit', 'participants')

    def get_participants(self, obj):
        user = self.context['request'].user  # Obtain the current user from the context
        # Filter the Participant objects to include only the current user for the specific meeting
        participant = Participant.objects.filter(meeting=obj, user=user)
        # Assuming ParticipantSerializer is already defined and properly structured
        return ParticipantSerializer(participant, many=True).data


class PendingMeetingDetailSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()

    class Meta:
        model = PendingMeeting
        fields = '__all__'

    @extend_schema_field(serializers.ListField(child=ParticipantSerializer()))
    def get_participants(self, obj):
        participants = Participant.objects.filter(meeting=obj)
        return ParticipantSerializer(participants, many=True).data


class PendingMeetingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingMeeting
        fields = ['title', 'message', 'deadline', 'time_limit']

    def validate_time_limit(self, value):
        # Check if the time_limit can be evenly divided by 30
        if value % 30 != 0:
            raise serializers.ValidationError("The time limit must be divisible by 30 minutes.")
        return value

    def validate_deadline(self, value):
        # Check if the deadline is not earlier than now
        if value < timezone.now():
            raise serializers.ValidationError("The deadline cannot be earlier than the current time.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        return PendingMeeting.objects.create(owner=user, **validated_data)


class PendingMeetingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingMeeting
        fields = ['title', 'message', 'deadline', 'time_limit']

    def validate_time_limit(self, value):
        # Check if the time_limit can be evenly divided by 30
        if value % 30 != 0:
            raise serializers.ValidationError("The time limit must be divisible by 30 minutes.")
        return value

    def validate_deadline(self, value):
        # Check if the deadline is not earlier than now
        if value < timezone.now():
            raise serializers.ValidationError("The deadline cannot be earlier than the current time.")
        return value

    def update(self, instance, validated_data):
        # Check if 'deadline' or 'time_limit' is being updated
        deadline_changed = 'deadline' in validated_data and instance.deadline != validated_data['deadline']
        time_limit_changed = 'time_limit' in validated_data and instance.time_limit != validated_data['time_limit']

        if deadline_changed or time_limit_changed:
            # Remove all related TimeSlot instances
            TimeSlot.objects.filter(meeting=instance).delete()

        # Update the instance with the new values
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class ParticipantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['response', 'response_time', 'content']

    def validate_response_time(self, value):
        # Ensure the response_time is not later than the meeting's deadline
        meeting = self.instance.meeting  # Get the meeting from the instance being updated
        if value > meeting.deadline:
            raise serializers.ValidationError("Response time must not be later than the meeting's deadline.")
        return value

    def validate(self, data):
        request_user = self.context['request'].user
        participant_user = self.instance.user

        # Check if the request user is the participant (user_id on the instance)
        if request_user != participant_user:
            raise serializers.ValidationError("The request user must be the participant being updated.")

        return data


class FinalizedMeetingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    participant = UserSerializer(read_only=True)

    class Meta:
        model = FinalizedMeeting
        fields = ('id', 'title', 'time', 'time_limit', 'owner', 'participant')


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['meeting', 'start_time', 'priority']

    def validate_priority(self, value):
        try:
            int_value = int(value)
        except ValueError:
            raise serializers.ValidationError("Priority must be an integer.")

        # Check if the integer value is either 0 or 1
        if int_value not in [0, 1]:
            raise serializers.ValidationError("Priority must be either 0 or 1.")

        return int_value

    def validate_start_time(self, value):
        # Check that the start_time is at a 00 or 30 minute mark
        if value.minute not in [0, 30]:
            raise serializers.ValidationError("The start time must be at a 00 or 30 minute mark.")
        return value

    def validate(self, data):
        start_time = data.get('start_time')
        meeting = data.get('meeting')
        user = self.context['request'].user

        time_limit = meeting.time_limit

        # Calculate the end time of the new time slot
        end_time = start_time + timedelta(minutes=time_limit)

        # Check if the user is not the meeting owner and enforce additional constraints
        if meeting and user != meeting.owner:
            if not Participant.objects.filter(meeting=meeting, user=user).exists():
                raise serializers.ValidationError("User is not the owner of the meeting and is not a participant.")

            # Check that the provided slot is within the range of the owner's slots for the meeting
            owner_slots = TimeSlot.objects.filter(meeting=meeting, user=meeting.owner)
            if not owner_slots.exists():
                raise serializers.ValidationError("There are no existing slots by the meeting owner to align with.")

            # Check alignment with owner's slots
            matching_owner_slot = owner_slots.filter(start_time=start_time).exists()

            if not matching_owner_slot:
                raise serializers.ValidationError(
                    "The provided slot's start time does not match any of the meeting owner's slots.")

        # Check for overlap with existing time slots for the current pending meeting
        if TimeSlot.objects.filter(
            Q(meeting=meeting),
            Q(user=user),
            (
                Q(start_time__lt=end_time, start_time__gte=start_time) |
                Q(start_time__lte=start_time, start_time__range=(start_time, end_time))
            )
        ).exists():
            raise serializers.ValidationError("The new time slot overlaps with an existing time slot for the current pending meeting.")

        # Check for overlap with any finalized meeting time slots
        if FinalizedMeeting.objects.filter(
            Q(owner=user) | Q(participant=user),
            (
                Q(time__lt=end_time, time__gte=start_time) |
                Q(time__lte=start_time, time__range=(start_time, end_time))
            )
        ).exists():
            raise serializers.ValidationError("The new time slot overlaps with an existing finalized meeting time slot.")

        return data


    def create(self, validated_data):
        user = self.context['request'].user
        return TimeSlot.objects.create(user=user, **validated_data)

