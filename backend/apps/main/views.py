from copy import deepcopy

from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, MethodNotAllowed, NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_409_CONFLICT
from rest_framework.viewsets import ModelViewSet

from .models import Comment, Discussion, Document, Guide, Task, Template
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
    GuideSerializer,
    TaskSerializer,
    TaskSubmitSerializer,
    TemplateSerializer,
)


class Conflict(APIException):
    status_code = HTTP_409_CONFLICT


def ensure_task_member(user, task: Task) -> None:
    if not is_task_member(user, task):
        raise NotFound


def ensure_task_stage_user(user, task: Task) -> None:
    if get_task_stage_user(task) != user:
        raise Conflict


class TemplateViewSet(ModelViewSet):
    queryset = Template.objects.all().order_by("name")
    serializer_class = TemplateSerializer
    filter_backends = (SearchFilter,)
    search_fields = ("name",)


class GuideViewSet(ModelViewSet):
    queryset = Guide.objects.all().order_by("name")
    serializer_class = GuideSerializer
    filter_backends = (SearchFilter,)
    search_fields = ("name",)


class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated, TaskPermission)
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_fields = ("creator", "reviewer", "stage")
    ordering_fields = ("updated_at", "created_at")
    ordering = ("-updated_at",)

    def get_queryset(self):
        return Task.objects.filter(
            Q(creator=self.request.user) | Q(reviewer=self.request.user)
        ).select_related("template", "guide", "creator__profile", "reviewer__profile")

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(creator=self.request.user)
            Document.objects.create(
                task=task,
                value=deepcopy(task.template.value) if task.template else [],
            )

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


class DocumentViewSet(ModelViewSet):
    queryset = Document.objects.select_related("task")
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated, DocumentPermission)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("task",)

    def get_queryset(self):
        return Document.objects.filter(
            Q(task__creator=self.request.user) | Q(task__reviewer=self.request.user)
        ).select_related("task")

    def perform_create(self, serializer):
        raise MethodNotAllowed("POST")

    def perform_update(self, serializer):
        ensure_task_stage_user(self.request.user, serializer.instance.task)
        serializer.save()

    def perform_destroy(self, instance):
        raise MethodNotAllowed("DELETE")


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.select_related(
        "discussion__document__task", "user__profile"
    )
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated, CommentPermission)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("discussion",)

    def get_queryset(self):
        return Comment.objects.filter(
            Q(discussion__document__task__creator=self.request.user)
            | Q(discussion__document__task__reviewer=self.request.user)
        ).select_related("discussion__document__task", "user__profile")

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


class DiscussionViewSet(ModelViewSet):
    queryset = Discussion.objects.select_related(
        "document__task", "user__profile"
    ).prefetch_related("guide_clauses")
    serializer_class = DiscussionSerializer
    permission_classes = (IsAuthenticated, DiscussionPermission)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("document",)

    def get_queryset(self):
        return (
            Discussion.objects.filter(
                Q(document__task__creator=self.request.user)
                | Q(document__task__reviewer=self.request.user)
            )
            .select_related("document__task", "user__profile")
            .prefetch_related("guide_clauses")
        )

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
