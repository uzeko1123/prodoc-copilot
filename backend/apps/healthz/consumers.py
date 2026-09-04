import datetime
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings


class HealthzWebsocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        payload = json.dumps(
            {
                "version": settings.VERSION,
                "status": "ok",
                "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
            }
        )
        await self.send(payload)

    async def receive(self, text_data=None, bytes_data=None):
        payload = json.dumps(
            {
                "version": settings.VERSION,
                "status": "ok",
                "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
                "echo": text_data,
            }
        )
        await self.send(payload)
