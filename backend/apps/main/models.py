import uuid

from django.conf import settings
from django.db import models


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Guide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Task(models.Model):
    class Stage(models.TextChoices):
        EDITING = "editing"
        REVIEW = "review"
        REVISION = "revision"
        FINAL = "final"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    template = models.ForeignKey(
        Template,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasks",
    )
    guide = models.ForeignKey(
        Guide,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasks",
    )
    stage = models.CharField(
        max_length=15, choices=Stage.choices, default=Stage.EDITING
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="tasks_created",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="tasks_reviewed",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="document")
    title = models.CharField(max_length=255, blank=True, default="")
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Discussion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.UUIDField()
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="discussions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="discussions"
    )
    document_content = models.TextField(blank=True, default="")
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.UUIDField()
    discussion = models.ForeignKey(
        Discussion, on_delete=models.CASCADE, related_name="comments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="comments"
    )
    content_rich = models.JSONField()
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DiscussionGuideClause(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discussion = models.ForeignKey(
        Discussion,
        on_delete=models.CASCADE,
        related_name="guide_clauses",
    )
    guide = models.ForeignKey(
        Guide,
        on_delete=models.CASCADE,
        related_name="discussion_clauses",
    )
    block_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = (
            models.UniqueConstraint(
                fields=("discussion", "guide", "block_id"),
                name="unique_discussion_guide_clause",
            ),
        )
