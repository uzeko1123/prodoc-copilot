from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import Comment, Discussion, Document, Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "name",
            "stage",
            "creator",
            "reviewer",
            "document",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "stage",
            "creator",
            "reviewer",
            "created_at",
            "updated_at",
        )


class TaskSubmitSerializer(serializers.Serializer):
    reviewer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ("id", "task", "title", "value", "created_at", "updated_at")
        read_only_fields = ("id", "task", "created_at", "updated_at")


class CommentInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("key", "content_rich")


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = (
            "id",
            "key",
            "discussion",
            "content_rich",
            "is_edited",
            "user",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_edited", "user", "created_at", "updated_at")

    def update(self, instance, validated_data):
        validated_data.pop("key", None)
        validated_data.pop("discussion", None)
        if "content_rich" in validated_data:
            validated_data["is_edited"] = True
        return super().update(instance, validated_data)


class DiscussionSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    comment = CommentInlineSerializer(write_only=True)

    class Meta:
        model = Discussion
        fields = (
            "id",
            "key",
            "document",
            "document_content",
            "is_resolved",
            "user",
            "comments",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def create(self, validated_data):
        comment_data = validated_data.pop("comment")
        with transaction.atomic():
            discussion = Discussion.objects.create(**validated_data)
            Comment.objects.create(
                discussion=discussion, user=discussion.user, **comment_data
            )
        return discussion

    def update(self, instance, validated_data):
        validated_data.pop("key", None)
        validated_data.pop("document", None)
        return super().update(instance, validated_data)
