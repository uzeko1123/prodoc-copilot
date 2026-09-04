from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets

from . import serializers


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = serializers.UserSerializer
    permission_classes = (permissions.IsAuthenticated,)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = serializers.GroupSerializer
    permission_classes = (permissions.IsAuthenticated,)
