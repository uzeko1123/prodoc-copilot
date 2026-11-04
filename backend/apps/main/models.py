import uuid

from django.conf import settings
from django.db import models


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("created_at",)


class Guide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("created_at",)


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

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("created_at",)


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="document")
    title = models.CharField(max_length=255, blank=True, default="")
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or f"{self.task}"

    class Meta:
        ordering = ("created_at",)


class Discussion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.UUIDField()
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="discussions"
    )
    document_content = models.TextField(blank=True, default="")
    is_resolved = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="discussions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.document}-{self.key}"

    class Meta:
        ordering = ("created_at",)
        constraints = (
            models.UniqueConstraint(
                fields=("document", "key"),
                name="unique_discussion",
            ),
        )


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.UUIDField()
    discussion = models.ForeignKey(
        Discussion, on_delete=models.CASCADE, related_name="comments"
    )
    content_rich = models.JSONField()
    is_edited = models.BooleanField(default=False)
    created_by_ai = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="comments"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.discussion}-{self.user}"

    class Meta:
        ordering = ("created_at",)


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

    def __str__(self):
        return f"{self.discussion}-{self.guide}-{self.block_id}"

    class Meta:
        ordering = ("created_at",)
        constraints = (
            models.UniqueConstraint(
                fields=("discussion", "guide", "block_id"),
                name="unique_discussion_guide_clause",
            ),
        )


class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="chat")
    name = models.CharField(max_length=255, blank=True, default="")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="chat"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or f"{self.task}-{self.user}"

    class Meta:
        ordering = ("created_at",)


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user"
        ASSISTANT = "assistant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=64)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=15, choices=Role.choices)
    parts = models.JSONField()
    metadata = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.chat}-{self.role}-{self.key}"

    class Meta:
        ordering = ("created_at",)
        constraints = (
            models.UniqueConstraint(fields=("chat", "key"), name="unique_chat_message"),
        )
