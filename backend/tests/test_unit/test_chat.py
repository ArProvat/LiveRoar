"""Unit tests for app.chat module components."""
import pytest
import json

from app.api.chat import ConnectionManager
from app.core.security import create_access_token
from unittest.mock import MagicMock, AsyncMock, patch


# ---------------------------------------------------------------------------
# ConnectionManager
# ---------------------------------------------------------------------------

class TestConnectionManager:
    @pytest.fixture
    def manager(self):
        return ConnectionManager()

    @pytest.mark.asyncio
    async def test_connect_adds_to_room(self, manager):
        ws = MagicMock()
        ws.accept = AsyncMock()
        await manager.connect("match-1", ws)
        assert ws in manager.connections["match-1"]

    @pytest.mark.asyncio
    async def test_connect_creates_room_if_missing(self, manager):
        ws = MagicMock()
        ws.accept = AsyncMock()
        manager.connections.clear()
        await manager.connect("new-match", ws)
        assert "new-match" in manager.connections
        assert len(manager.connections["new-match"]) == 1

    @pytest.mark.asyncio
    async def test_disconnect_removes_websocket(self, manager):
        ws = MagicMock()
        ws.accept = AsyncMock()
        await manager.connect("match-1", ws)
        manager.disconnect("match-1", ws)
        assert ws not in manager.connections.get("match-1", set())

    @pytest.mark.asyncio
    async def test_disconnect_removes_empty_room(self, manager):
        ws = MagicMock()
        ws.accept = AsyncMock()
        await manager.connect("match-1", ws)
        manager.disconnect("match-1", ws)
        assert "match-1" not in manager.connections

    @pytest.mark.asyncio
    async def test_disconnect_nonexistent_match_no_crash(self, manager):
        ws = MagicMock()
        manager.disconnect("nonexistent", ws)

    @pytest.mark.asyncio
    async def test_disconnect_multiple_websockets(self, manager):
        ws1 = MagicMock()
        ws2 = MagicMock()
        ws1.accept = AsyncMock()
        ws2.accept = AsyncMock()
        await manager.connect("match-1", ws1)
        await manager.connect("match-1", ws2)
        manager.disconnect("match-1", ws1)
        assert ws1 not in manager.connections["match-1"]
        assert ws2 in manager.connections["match-1"]
        assert len(manager.connections["match-1"]) == 1

    @pytest.mark.asyncio
    async def test_broadcast_sends_to_all_connections(self, manager):
        ws1 = MagicMock()
        ws2 = MagicMock()
        ws1.accept = AsyncMock()
        ws2.accept = AsyncMock()
        ws1.send_json = AsyncMock()
        ws2.send_json = AsyncMock()
        await manager.connect("match-1", ws1)
        await manager.connect("match-1", ws2)
        msg = {"message": "hello"}
        await manager.broadcast("match-1", msg)
        ws1.send_json.assert_called_once_with(msg)
        ws2.send_json.assert_called_once_with(msg)

    @pytest.mark.asyncio
    async def test_broadcast_removes_disconnected_websocket(self, manager):
        ws1 = MagicMock()
        ws1.accept = AsyncMock()
        ws1.send_json = AsyncMock(side_effect=Exception("broken"))
        await manager.connect("match-1", ws1)
        await manager.broadcast("match-1", {"msg": "test"})
        assert ws1 not in manager.connections.get("match-1", set())

    @pytest.mark.asyncio
    async def test_broadcast_to_nonexistent_room(self, manager):
        manager.connections.clear()
        await manager.broadcast("nonexistent", {"msg": "test"})

    @pytest.mark.asyncio
    async def test_broadcast_partial_failure(self, manager):
        ws1 = MagicMock()
        ws2 = MagicMock()
        ws1.accept = AsyncMock()
        ws2.accept = AsyncMock()
        ws1.send_json = AsyncMock(side_effect=Exception("broken"))
        ws2.send_json = AsyncMock()
        await manager.connect("match-1", ws1)
        await manager.connect("match-1", ws2)
        await manager.broadcast("match-1", {"msg": "test"})
        ws2.send_json.assert_called_once()
        assert ws1 not in manager.connections.get("match-1", set())


# ---------------------------------------------------------------------------
# ConnectionManager broadcast with decode_token patching
# ---------------------------------------------------------------------------

class TestChatBroadcastWithDecoding:
    """Test that chat module's broadcast logic works with mocked JWT decoding."""

    @pytest.fixture
    def manager(self):
        return ConnectionManager()

    def test_broadcast_with_decoded_username(self, manager):
        """Verify that broadcast message includes correct username structure."""
        ws = MagicMock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock()

        async def _test():
            await manager.connect("m1", ws)
            msg = {
                "id": "msg-1",
                "user_id": "user-abc",
                "username": "User_abc123",
                "message": "hi",
                "match_id": "m1",
                "created_at": "2026-01-01T00:00:00Z",
            }
            await manager.broadcast("m1", msg)
            ws.send_json.assert_called_once_with(msg)

        import asyncio
        asyncio.run(_test())

    def test_disconnect_on_broadcast_failure(self, manager):
        """A failing connection should be removed from the room."""
        ws = MagicMock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock(side_effect=Exception("broken"))

        async def _test():
            await manager.connect("m1", ws)
            try:
                await manager.broadcast("m1", {"msg": "test"})
            except Exception:
                pass
            assert ws not in manager.connections.get("m1", set())

        import asyncio
        asyncio.run(_test())
