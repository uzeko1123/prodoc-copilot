from django.contrib import admin

from .models import (
    Chat,
    ChatMessage,
    Comment,
    Discussion,
    Document,
    Guide,
    Task,
    Template,
)


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "updated_at")
    list_filter = ()
    search_fields = ("name",)
    ordering = ("-updated_at",)


@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = ("name", "updated_at")
    list_filter = ()
    search_fields = ("name",)
    ordering = ("-updated_at",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "template",
        "guide",
        "stage",
        "creator",
        "reviewer",
        "updated_at",
    )
    list_filter = ("template", "guide", "stage", "creator", "reviewer")
    search_fields = ("name",)
    ordering = ("-updated_at",)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("task", "title", "updated_at")
    list_filter = ("task",)
    search_fields = ("title",)
    ordering = ("-updated_at",)


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ("document", "is_resolved", "user", "updated_at", "key")
    list_filter = ("document", "is_resolved", "user")
    search_fields = ()
    ordering = ("-updated_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "discussion",
        "is_edited",
        "created_by_ai",
        "user",
        "updated_at",
        "key",
    )
    list_filter = ("discussion", "is_edited", "created_by_ai", "user")
    search_fields = ()
    ordering = ("-updated_at",)


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("task", "name", "user", "updated_at")
    list_filter = ("task", "user")
    search_fields = ("name",)
    ordering = ("-updated_at",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("chat", "role", "updated_at", "key")
    list_filter = ("chat", "role")
    search_fields = ()
    ordering = ("-updated_at",)
