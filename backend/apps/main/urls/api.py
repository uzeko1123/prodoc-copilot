from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import (
    CommentViewSet,
    DiscussionViewSet,
    DocumentViewSet,
    GuideViewSet,
    TaskViewSet,
    TemplateViewSet,
)

router = DefaultRouter()
router.register("tasks", TaskViewSet)
router.register("documents", DocumentViewSet)
router.register("discussions", DiscussionViewSet)
router.register("comments", CommentViewSet)
router.register("templates", TemplateViewSet)
router.register("guides", GuideViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
