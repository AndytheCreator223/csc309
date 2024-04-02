from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from .models import User, Notification, Contacts, Group


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}, 'required': True},
            'email': {'required': True, 'allow_blank': False},
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
        }

    def validate(self, data):
        # Validate password match
        if 'password' in data:
            password = data.get('password')
            password2 = data.pop('password2', None)
            if password != password2:
                raise serializers.ValidationError({"password2": "Passwords must match."})

            # Validate the password against Django's password validation rules
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({'password': e.messages})

        return data

    def create(self, validated_data):
        # 'password2' has already been removed by validate
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if password:
            # Validate the new password against Django's password validators
            try:
                validate_password(password, instance)
            except ValidationError as e:
                raise serializers.ValidationError({'password': e.messages})

            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'content',"is_seen"]

    def __init__(self, *args, **kwargs):
        # Pop 'context' from kwargs to access it directly
        context = kwargs.pop('context', {})
        super(NotificationSerializer, self).__init__(*args, **kwargs)

        # Check if 'show_content' is in the context and adjust fields accordingly
        if not context.get('show_content', False):
            self.fields.pop('content', None)

    def get_content(self, obj):
        return obj.content

class ContactSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)

    contact_email = serializers.EmailField(source='contact.email', read_only=True)
    contact_first_name = serializers.CharField(source='contact.first_name', read_only=True)
    contact_last_name = serializers.CharField(source='contact.last_name', read_only=True)
    contact_username = serializers.CharField(source='contact.username', read_only=True)
    

    class Meta:
        model = Contacts
        fields = ['id', 'username', 'contact_email', 'contact_first_name', 'contact_last_name','contact_username']

    def create(self, validated_data):
        requesting_user = self.context['request'].user
        username = validated_data.pop('username', None)
        contact_user = get_object_or_404(User, username=username)

        if requesting_user == contact_user:
            raise serializers.ValidationError({"username": "You cannot add yourself as a contact."})
        if Contacts.objects.filter(owner=requesting_user, contact=contact_user).exists():
            raise serializers.ValidationError({"username": "This user is already in your contacts."})

        contact = Contacts.objects.create(owner=requesting_user, contact=contact_user)
        return contact


class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), many=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'members']

    def validate_name(self, value):
        # Check if the group name is unique for this user
        user = self.context['request'].user
        if Group.objects.filter(owner=user, name=value).exists():
            raise serializers.ValidationError("A group with this name already exists.")
        return value

    def validate_members(self, value):
        # Ensure all members are in the user's contacts
        user = self.context['request'].user
        contacts = Contacts.objects.filter(owner=user).values_list('contact', flat=True)
        for member in value:
            if member.id not in contacts:
                raise serializers.ValidationError("All members must be from the user's contacts.")
            # This checks if each member is in the user's contact list.
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        members = validated_data.pop('members')
        group = Group.objects.create(owner=user, **validated_data)
        group.members.set(members)  # Ensures no duplicate members within the group
        return group


class GroupDetailSerializer(serializers.ModelSerializer):
    # Serialize the members field to show detailed user information
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'members']


class GroupNameChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']

    def validate_name(self, value):
        user = self.context['request'].user
        group_id = self.context['view'].kwargs['group_id']
        if Group.objects.filter(owner=user, name=value).exclude(id=group_id).exists():
            raise serializers.ValidationError("A group with this name already exists.")
        return value


class GroupMemberUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)

    def validate_username(self, value):
        user = self.context['request'].user
        if not Contacts.objects.filter(owner=user, contact__username=value).exists():
            raise serializers.ValidationError("This user is not in your contacts.")
        return value
