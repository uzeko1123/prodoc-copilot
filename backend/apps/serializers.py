from rest_framework import serializers


class MessageResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField(read_only=True, default=200)
    message = serializers.CharField(read_only=True)
