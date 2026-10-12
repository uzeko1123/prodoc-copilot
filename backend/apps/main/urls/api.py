from django.urls import include, path
from rest_framework import routers

from ..views import CommentViewSet, DiscussionViewSet, DocumentViewSet, TaskViewSet

router = routers.DefaultRouter()
router.register("tasks", TaskViewSet)
router.register("documents", DocumentViewSet)
router.register("discussions", DiscussionViewSet)
router.register("comments", CommentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
