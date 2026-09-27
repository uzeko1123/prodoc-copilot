from rest_framework import serializers


class UploadFileSerializer(serializers.Serializer):
    file = serializers.FileField()


class UploadFileUrlSerializer(serializers.Serializer):
    url = serializers.URLField()
