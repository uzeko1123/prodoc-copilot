from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import (
    ChatMessageViewSet,
    ChatViewSet,
    CommentViewSet,
    DiscussionViewSet,
    DocumentViewSet,
    GuideViewSet,
    TaskViewSet,
    TemplateViewSet,
)

router = DefaultRouter()
router.register("templates", TemplateViewSet)
router.register("guides", GuideViewSet)
router.register("tasks", TaskViewSet)
router.register("documents", DocumentViewSet)
router.register("discussions", DiscussionViewSet)
router.register("comments", CommentViewSet)
router.register("chats", ChatViewSet)
router.register("chat-messages", ChatMessageViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
