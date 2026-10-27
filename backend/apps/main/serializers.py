from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from apps.auth.serializers import UserSerializer

from .models import Comment, Discussion, Document, Task, Template


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ("id", "name", "value", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    reviewer = UserSerializer(read_only=True, allow_null=True)
    template = TemplateSerializer(read_only=True, allow_null=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.all(),
        source="template",
        write_only=True,
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "name",
            "document",
            "template",
            "template_id",
            "stage",
            "creator",
            "reviewer",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "document",
            "stage",
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


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

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
        read_only_fields = ("id", "is_edited", "created_at", "updated_at")

    def update(self, instance, validated_data):
        validated_data.pop("key", None)
        validated_data.pop("discussion", None)
        if "content_rich" in validated_data:
            validated_data["is_edited"] = True
        return super().update(instance, validated_data)


class CommentInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("key", "content_rich")


class DiscussionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_inline = CommentInlineSerializer(write_only=True)

    class Meta:
        model = Discussion
        fields = (
            "id",
            "key",
            "document",
            "document_content",
            "comments",
            "comment_inline",
            "is_resolved",
            "user",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        comment_inline = validated_data.pop("comment_inline")
        with transaction.atomic():
            discussion = Discussion.objects.create(**validated_data)
            Comment.objects.create(
                discussion=discussion, user=discussion.user, **comment_inline
            )
        return discussion

    def update(self, instance, validated_data):
        validated_data.pop("key", None)
        validated_data.pop("document", None)
        return super().update(instance, validated_data)
