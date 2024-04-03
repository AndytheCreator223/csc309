from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .models import Notification, Contacts, Group, User
from .serializers import UserSerializer, NotificationSerializer, \
    ContactSerializer, GroupSerializer, GroupDetailSerializer, GroupMemberUpdateSerializer, GroupNameChangeSerializer


####################################################################################################################################################################################
# View for user creation, only takes post request
@extend_schema(
    summary="Create/Registers a New User",
    description="Creates a new user with the provided information.",
    request=UserSerializer,
    responses={
        201: UserSerializer,
        400: {"description": "Bad Request - Incorrect or incomplete data provided."}
    },
)
@api_view(['POST'])
def create_user_view(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


####################################################################################################################################################################################
# View for user profile retrieval and update, only takes get and patch request
@extend_schema(
    methods=['GET'],  
    summary="Retrieve User Profile",
    description="Retrieves the profile information for the currently authenticated user.",
    responses={200: UserSerializer},
)
@extend_schema(
    methods=['PATCH'],  
    summary="Update User Profile",
    description="Updates the profile information for the currently authenticated user",
    request=UserSerializer,
    responses={
        200: UserSerializer,
        400: {"description": "Bad Request - Incorrect or incomplete data provided."},
    },
)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_edit_view(request):
    if request.method == 'GET':
        # Retrieve the profile for the current user
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Update the profile for the current user
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ################################################################################################################################################################################### View for active notifications by filtering appropriately, only takes get request
@extend_schema(
    summary="Get Active Notifications",
    description="Retrieves all active notifications for the currently authenticated user. " +
                "Active notifications are those whose show time has passed but have not yet expired. " +
                "Expired notifications are automatically deleted.",
    responses={
        200: NotificationSerializer(many=True),
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_notifications(request):
    current_time = timezone.now()

    Notification.objects.filter(expire_time__lt=current_time).delete()

    notifications = Notification.objects.filter(
        owner=request.user,
        show_time__lte=current_time,
        expire_time__gt=current_time
    )
    serializer = NotificationSerializer(notifications, many=True, context={'show_content': False})
    return Response(serializer.data)

####################################################################################################################################################################################
# View for getting a single notification by id, only takes get request
@extend_schema(
    summary="Get Notification by ID",
    description="Retrieves a specific notification for the currently authenticated user by its ID. " +
                "The notification must be active (its show time has passed but it hasn't expired). " +
                "If the notification is retrieved successfully and it hasn't been marked as seen, " +
                "it will be marked as seen.",
    parameters=[
        {
            "name": "notification_id",
            "in": "path",
            "required": True,
            "description": "The ID of the notification to retrieve.",
            "schema": {
                "type": "integer"
            }
        }
    ],
    responses={
        200: NotificationSerializer,
        404: {"description": "Not Found - The notification does not exist, or it's not active, or does not belong to the user."},
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_by_id(request, notification_id):
    current_time = timezone.now()

    # Retrieve the notification, ensuring it belongs to the logged-in user
    # and its show_time has passed but it hasn't expired yet
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        owner=request.user, 
        show_time__lte=current_time, 
        expire_time__gte=current_time
    )
    
    # Set is_seen to True and save the notification
    if not notification.is_seen:
        notification.is_seen = True
        notification.save()

    serializer = NotificationSerializer(notification, context={'show_content': True})
    return Response(serializer.data)

####################################################################################################################################################################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_contact_view(request):
    # Instantiate the serializer with request data and context
    serializer = ContactSerializer(data=request.data, context={'request': request})
    
    # Validate the serializer
    if serializer.is_valid():
        # If valid, save the new contact instance
        serializer.save()
        # Return a success response with custom detail message
        return Response({'detail': 'Contact added successfully.'}, status=status.HTTP_201_CREATED)
    else:
        # If validation fails, return a detailed error response
        detailed_errors = {field: error for field, error in serializer.errors.items()}
        return Response({'errors': detailed_errors, 'detail': 'Failed to add contact.'}, status=status.HTTP_400_BAD_REQUEST)

####################################################################################################################################################################################

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_contact_view(request, username):
    # Retrieve the contact_user by username
    contact_user = get_object_or_404(User, username=username)
    
    # Try to get the contact instance where the contact_user is the contact
    try:
        contact = Contacts.objects.get(owner=request.user, contact=contact_user)
    except Contacts.DoesNotExist:
        return Response({'detail': 'Contact not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Delete the contact
    contact.delete()
    return Response({'detail': 'Contact deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

####################################################################################################################################################################################
@extend_schema(
    summary="List Contacts",
    description="Retrieves a list of all contacts owned by the authenticated user.",
    responses={
        200: ContactSerializer(many=True),
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_contacts_view(request):
    contacts = Contacts.objects.filter(owner=request.user)
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data)

####################################################################################################################################################################################
@extend_schema(
    summary="Create Group",
    description="Allows authenticated users to create a new group with specified details.",
    request=GroupSerializer,
    responses={
        201: {"description": "Group created successfully.", "content": {"application/json": {"example": {"detail": "Group created successfully.", "group_id": 1}}}},
        400: {"description": "Bad Request - Incorrect or incomplete data provided."},
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_view(request):
    serializer = GroupSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        group = serializer.save()
        return Response({'detail': 'Group created successfully.', 'group_id': group.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

####################################################################################################################################################################################
@extend_schema(
    summary="List Groups",
    description="Retrieves a list of all groups owned by the authenticated user.",
    responses={
        200: GroupSerializer(many=True),
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_groups_view(request):
    groups = Group.objects.filter(owner=request.user)
    serializer = GroupSerializer(groups, many=True)
    return Response(serializer.data)

####################################################################################################################################################################################
@extend_schema(
    summary="View Group Details",
    description="Retrieves detailed information about a specific group owned by the authenticated user, identified by its ID.",
    parameters=[
        {
            "name": "group_id",
            "in": "path",
            "required": True,
            "description": "The ID of the group to retrieve details for.",
            "schema": {
                "type": "integer"
            }
        }
    ],
    responses={
        200: GroupDetailSerializer,
        404: {"description": "Group not found."},
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_group(request, group_id):
    group = get_object_or_404(Group, id=group_id, owner=request.user)
    serializer = GroupDetailSerializer(group)
    return Response(serializer.data)

####################################################################################################################################################################################
@extend_schema(
    summary="Delete Group",
    description="Allows authenticated users to delete a specific group owned by them, identified by its ID.",
    parameters=[
        {
            "name": "group_id",
            "in": "path",
            "required": True,
            "description": "The ID of the group to be deleted.",
            "schema": {
                "type": "integer"
            }
        }
    ],
    responses={
        204: {"description": "Group deleted successfully."},
        404: {"description": "Group not found."},
    },
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request, group_id):
    group = get_object_or_404(Group, id=group_id, owner=request.user)
    group.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

####################################################################################################################################################################################
@extend_schema(
    summary="Remove Group Member",
    description="Allows the owner of a group to remove a member from the group by their username. The operation is only successful if the specified user is currently a member of the group.",
    parameters=[
        {
            "name": "group_id",
            "in": "path",
            "required": True,
            "description": "The ID of the group from which the member is to be removed.",
            "schema": {
                "type": "integer"
            }
        },
        {
            "name": "username",
            "in": "path",
            "required": True,
            "description": "The username of the member to remove from the group.",
            "schema": {
                "type": "string"
            }
        }
    ],
    responses={
        200: {"description": "User removed from the group."},
        400: {"description": "Bad Request - The specified user is not a member of the group, or other validation error."},
        404: {"description": "Group not found."},
    },
    request=None,  # This is set to None as the username is passed directly in the URL path, not in the request body.
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member(request, group_id, username):
    group = get_object_or_404(Group, id=group_id, owner=request.user)
    serializer = GroupMemberUpdateSerializer(data={'username': username}, context={'request': request})
    if serializer.is_valid():
        user_to_remove = User.objects.get(username=username)
        if group.members.filter(id=user_to_remove.id).exists():
            group.members.remove(user_to_remove)
            return Response({'detail': f'{username} removed from the group.'})
        else:
            return Response({'detail': f'{username} is not in the group.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

####################################################################################################################################################################################
@extend_schema(
    summary="Add Group Member",
    description="Allows the owner of a group to add a new member to the group by their username. The operation will not proceed if the specified user is already a member of the group.",
    parameters=[
        {
            "name": "group_id",
            "in": "path",
            "required": True,
            "description": "The ID of the group to which the member is to be added.",
            "schema": {
                "type": "integer"
            }
        },
        {
            "name": "username",
            "in": "path",
            "required": True,
            "description": "The username of the member to add to the group.",
            "schema": {
                "type": "string"
            }
        }
    ],
    responses={
        200: {"description": "User added to the group."},
        400: {"description": "Bad Request - The specified user is already a member of the group, or other validation error."},
        404: {"description": "Group not found or User not found."},
    },
    request=None,  # Indicating that the request body is not used for passing the member username, as it's included in the URL path.
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member(request, group_id, username):
    group = get_object_or_404(Group, id=group_id, owner=request.user)
    serializer = GroupMemberUpdateSerializer(data={'username': username}, context={'request': request})
    if serializer.is_valid():
        user_to_add = User.objects.get(username=username)
        if not group.members.filter(id=user_to_add.id).exists():
            group.members.add(user_to_add)
            return Response({'detail': f'{username} added to the group.'})
        else:
            return Response({'detail': f'{username} is already in the group.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

####################################################################################################################################################################################
@extend_schema(
    summary="Change Group Name",
    description="Allows the owner of a group to change its name. The new name is provided in the request body.",
    parameters=[
        {
            "name": "group_id",
            "in": "path",
            "required": True,
            "description": "The ID of the group whose name is to be changed.",
            "schema": {
                "type": "integer"
            }
        }
    ],
    request=GroupNameChangeSerializer,
    responses={
        200: {"description": "Group name changed successfully."},
        400: {"description": "Bad Request - Incorrect or incomplete data provided."},
        404: {"description": "Group not found."},
    },
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_group_name(request, group_id):
    group = get_object_or_404(Group, id=group_id, owner=request.user)
    serializer = GroupNameChangeSerializer(group, data=request.data, context={'request': request, 'view': request.parser_context['view']})
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Group name changed successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

