from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, MethodNotAllowed, NotFound
from rest_framework.response import Response

from .models import Comment, Discussion, Document, Task
from .permissions import (
    CommentPermission,
    DiscussionPermission,
    DocumentPermission,
    TaskPermission,
    get_task_stage_user,
    is_task_member,
)
from .serializers import (
    CommentSerializer,
    DiscussionSerializer,
    DocumentSerializer,
    TaskSerializer,
    TaskSubmitSerializer,
)


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT


def ensure_task_member(user, task: Task) -> None:
    if not is_task_member(user, task):
        raise NotFound


def ensure_task_stage_user(user, task: Task) -> None:
    if get_task_stage_user(task) != user:
        raise Conflict


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (TaskPermission,)

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(creator=user) | Q(reviewer=user))

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(creator=self.request.user)
            Document.objects.create(task=task, value=[])

    @extend_schema(request=TaskSubmitSerializer, responses={200: TaskSerializer})
    @action(detail=True, methods=["post"])
    def submit(self, request, *args, **kwargs):
        serializer = TaskSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self._set_stage(
            Task.Stage.EDITING,
            Task.Stage.REVIEW,
            reviewer=serializer.validated_data["reviewer"],
        )

    @extend_schema(request=None, responses={200: TaskSerializer})
    @action(detail=True, methods=["post"])
    def send_back(self, request, *args, **kwargs):
        return self._set_stage(Task.Stage.REVIEW, Task.Stage.REVISION)

    @extend_schema(request=None, responses={200: TaskSerializer})
    @action(detail=True, methods=["post"])
    def resubmit(self, request, *args, **kwargs):
        return self._set_stage(Task.Stage.REVISION, Task.Stage.REVIEW)

    @extend_schema(request=None, responses={200: TaskSerializer})
    @action(detail=True, methods=["post"])
    def approve(self, request, *args, **kwargs):
        return self._set_stage(Task.Stage.REVIEW, Task.Stage.FINAL)

    def _set_stage(self, expected: str, target: str, reviewer=None):
        task = self.get_object()
        with transaction.atomic():
            task = Task.objects.select_for_update().get(pk=task.pk)
            if task.stage != expected:
                raise Conflict
            task.stage = target
            if reviewer is not None:
                task.reviewer = reviewer
            task.save()
        return Response(self.get_serializer(task).data)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related("task")
    serializer_class = DocumentSerializer
    permission_classes = (DocumentPermission,)

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.filter(
            Q(task__creator=user) | Q(task__reviewer=user)
        ).select_related("task")
        if task_id := self.request.query_params.get("task"):
            queryset = queryset.filter(task_id=task_id)
        return queryset

    def perform_create(self, serializer):
        raise MethodNotAllowed("POST")

    def perform_update(self, serializer):
        ensure_task_stage_user(self.request.user, serializer.instance.task)
        serializer.save()

    def perform_destroy(self, instance):
        raise MethodNotAllowed("DELETE")


class DiscussionViewSet(viewsets.ModelViewSet):
    queryset = Discussion.objects.select_related("document__task")
    serializer_class = DiscussionSerializer
    permission_classes = (DiscussionPermission,)

    def get_queryset(self):
        user = self.request.user
        queryset = Discussion.objects.filter(
            Q(document__task__creator=user) | Q(document__task__reviewer=user)
        ).select_related("document__task")
        if document_id := self.request.query_params.get("document"):
            queryset = queryset.filter(document_id=document_id)
        return queryset

    def perform_create(self, serializer):
        document = serializer.validated_data["document"]
        ensure_task_member(self.request.user, document.task)
        ensure_task_stage_user(self.request.user, document.task)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        ensure_task_stage_user(self.request.user, serializer.instance.document.task)
        serializer.save()

    def perform_destroy(self, instance):
        ensure_task_stage_user(self.request.user, instance.document.task)
        instance.delete()


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related("discussion__document__task")
    serializer_class = CommentSerializer
    permission_classes = (CommentPermission,)

    def get_queryset(self):
        user = self.request.user
        queryset = Comment.objects.filter(
            Q(discussion__document__task__creator=user)
            | Q(discussion__document__task__reviewer=user)
        ).select_related("discussion__document__task")
        if discussion_id := self.request.query_params.get("discussion"):
            queryset = queryset.filter(discussion_id=discussion_id)
        return queryset

    def perform_create(self, serializer):
        discussion = serializer.validated_data["discussion"]
        ensure_task_member(self.request.user, discussion.document.task)
        ensure_task_stage_user(self.request.user, discussion.document.task)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        ensure_task_stage_user(
            self.request.user, serializer.instance.discussion.document.task
        )
        serializer.save()

    def perform_destroy(self, instance):
        ensure_task_stage_user(self.request.user, instance.discussion.document.task)
        with transaction.atomic():
            discussion = instance.discussion
            instance.delete()
            if not discussion.comments.exists():
                discussion.delete()
