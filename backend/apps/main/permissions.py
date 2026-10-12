from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Comment, Discussion, Document, Task


def is_task_member(user, task: Task):
    return task.creator_id == user.id or task.reviewer_id == user.id


def get_task_stage_user(task: Task):
    if task.stage in (Task.Stage.EDITING, Task.Stage.REVISION):
        return task.creator
    if task.stage == Task.Stage.REVIEW:
        return task.reviewer
    return None


class TaskPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Task):
        if view.action in ("submit", "resubmit"):
            return obj.creator_id == request.user.id
        if view.action in ("send_back", "approve"):
            return obj.reviewer_id == request.user.id
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj)
        return obj.creator_id == request.user.id


class DocumentPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Document):
        return is_task_member(request.user, obj.task)


class DiscussionPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Discussion):
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj.document.task)
        return (
            obj.user_id == request.user.id
            or obj.document.task.reviewer_id == request.user.id
        )


class CommentPermission(BasePermission):
    def has_object_permission(self, request, view, obj: Comment):
        if request.method in SAFE_METHODS:
            return is_task_member(request.user, obj.discussion.document.task)
        return (
            obj.user_id == request.user.id
            or obj.discussion.document.task.reviewer_id == request.user.id
        )
