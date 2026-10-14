from django.contrib import admin

from .models import Comment, Discussion, Document, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("name", "stage", "creator", "reviewer", "updated_at")
    list_filter = ("stage",)
    search_fields = ("name", "creator__username", "reviewer__username")
    ordering = ("-updated_at",)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("task", "title", "updated_at")
    search_fields = ("title", "task__name")
    ordering = ("-updated_at",)
    readonly_fields = ("value",)


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ("document", "user", "is_resolved", "created_at", "key")
    list_filter = ("is_resolved",)
    search_fields = ("document__task__name",)
    ordering = ("-created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("discussion", "user", "is_edited", "created_at", "key")
    search_fields = ("discussion__document__task__name",)
    ordering = ("-created_at",)
    readonly_fields = ("content_rich",)
