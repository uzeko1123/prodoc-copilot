import asyncio
import datetime
import json

from django.conf import settings
from django.http import HttpRequest, JsonResponse, StreamingHttpResponse


def api_healthz(request: HttpRequest):
    return JsonResponse(
        {
            "version": settings.VERSION,
            "status": "ok",
            "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
        }
    )


async def events_healthz(request: HttpRequest):
    async def event_stream():
        for i in range(3):
            event = {
                "version": settings.VERSION,
                "status": "ok",
                "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
                "i": i,
            }
            payload = f"event: healthz\ndata: {json.dumps(event)}\n\n"
            yield payload
            await asyncio.sleep(1)

    return StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
