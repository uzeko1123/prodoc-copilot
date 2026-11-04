from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Chat, ChatMessage, Comment, Discussion, Document, Task


def is_task_member(user, task: Task):
    return task.creator_id == user.id or task.reviewer_id == user.id


def get_task_stage_user(task: Task):
    if task.stage in (Task.Stage.EDITING, Task.Stage.REVISION):
        return task.creator
    if task.stage == Task.Stage.REVIEW:
        return task.reviewer
    return None


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return bool(request.user.is_staff)


class TaskPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Task):
        if view.action in ("submit", "resubmit"):
            return obj.creator_id == request.user.id
        if view.action in ("send_back", "approve"):
            return obj.reviewer_id == request.user.id
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj)
        if request.method == "DELETE":
            return obj.creator_id == request.user.id and obj.stage != Task.Stage.FINAL
        return get_task_stage_user(obj) == request.user


class DocumentPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Document):
        return is_task_member(request.user, obj.task)


class DiscussionPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Discussion):
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj.document.task)
        return obj.user_id == request.user.id


class CommentPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Comment):
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj.discussion.document.task)
        return obj.user_id == request.user.id


class ChatPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Chat):
        return obj.user_id == request.user.id


class ChatMessagePermission(BasePermission):
    def has_object_permission(self, request, view, obj: ChatMessage):
        return obj.chat.user_id == request.user.id
