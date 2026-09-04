import json
from typing import cast

import pytest
from channels.testing import WebsocketCommunicator
from django.http import JsonResponse, StreamingHttpResponse
from django.test import AsyncClient, Client

from . import consumers


def test_api_healthz_view(client: Client):
    response = client.get("/api/healthz")
    assert isinstance(response, JsonResponse)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_events_healthz_view(async_client: AsyncClient):
    response = await async_client.get("/events/healthz")
    assert isinstance(response, StreamingHttpResponse)
    assert response.status_code == 200
    assert response.streaming
    async for chunk in response.streaming_content:
        content = cast(bytes, chunk).decode("utf-8")
        assert content.startswith("event: healthz\ndata: ")
        assert content.endswith("\n\n")
        data = json.loads(content.replace("event: healthz\ndata:", "").strip())
        assert data["status"] == "ok"
        assert data["i"] == 0
        break


@pytest.mark.asyncio
async def test_websocket_healthz_view():
    communicator = WebsocketCommunicator(
        consumers.HealthzWebsocketConsumer.as_asgi(), "/ws/healthz"
    )
    connected, _ = await communicator.connect(timeout=5)
    assert connected
    response = await communicator.receive_json_from()
    assert response["status"] == "ok"
    await communicator.send_to("test")
    response = await communicator.receive_json_from()
    assert response["echo"] == "test"
    await communicator.disconnect()
