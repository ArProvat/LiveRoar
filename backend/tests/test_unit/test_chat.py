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
        # Ensure room doesn't exist
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
        manager.disconnect("nonexistent", ws)  # should not raise

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
        # Should not raise
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
        # ws1 should be removed
        assert ws1 not in manager.connections.get("match-1", set())


# ---------------------------------------------------------------------------
# WebSocket chat endpoint — token validation
# ---------------------------------------------------------------------------

class TestWebSocketChatTokenValidation:
    @pytest.mark.asyncio
    async def test_websocket_accepts_without_token(self):
        """Anonymous connections should be allowed."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.chat import manager as chat_manager

        original_manager = chat_manager
        test_manager = ConnectionManager()

        with patch("app.api.chat.manager", test_manager):
            client = TestClient(app)
            # Should connect without error (no token)
            with client.websocket_connect("/api/v1/chat/match-abc?token=") as ws:
                # Send a message
                ws.send_json({"message": "hello"})
                response = ws.receive_text()
                data = json.loads(response)
                assert data["username"] == "Anonymous"
                assert data["message"] == "hello"

    @pytest.mark.asyncio
    async def test_websocket_identifies_with_valid_token(self, _mock_jwt_secret):
        """WebSocket should parse token and identify user."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.chat import manager as chat_manager

        token = create_access_token({"sub": "user-12345abc", "role": "USER"})
        original_manager = chat_manager
        test_manager = ConnectionManager()

        with patch("app.api.chat.manager", test_manager):
            with patch("app.api.chat.async_session") as mock_session:
                mock_session_instance = AsyncMock()
                mock_session_instance.__aenter__ = AsyncMock(return_value=mock_session_instance)
                mock_session_instance.__aexit__ = AsyncMock(return_value=None)
                mock_session_instance.add = MagicMock()
                mock_session_instance.commit = AsyncMock()
                mock_session_instance.refresh = AsyncMock()

                msg_id = "msg-123"
                msg_created = "2026-01-01T12:00:00Z"

                async def mock_refresh(msg_obj):
                    msg_obj.id = msg_id
                    msg_obj.created_at = MagicMock()
                    msg_obj.created_at.isoformat.return_value = msg_created

                mock_session_instance.refresh.side_effect = mock_refresh

                with patch.dict("app.api.chat.__dict__", {"async_session": mock_session}):
                    client = TestClient(app)
                    with client.websocket_connect(f"/api/v1/chat/match-abc?token={token}") as ws:
                        ws.send_json({"message": "hello"})
                        response = ws.receive_text()
                        data = json.loads(response)
                        assert data["username"] == "User_user-1234"
                        assert data["user_id"] == "user-12345abc"

    @pytest.mark.asyncio
    async def test_websocket_ignores_empty_message(self, _mock_jwt_secret):
        """Empty messages should be silently ignored."""
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.chat import manager as chat_manager

        token = create_access_token({"sub": "user-12345abc", "role": "USER"})
        test_manager = ConnectionManager()

        with patch("app.api.chat.manager", test_manager):
            with patch("app.api.chat.async_session") as mock_session:
                mock_session_instance = AsyncMock()
                mock_session_instance.__aenter__ = AsyncMock(return_value=mock_session_instance)
                mock_session_instance.__aexit__ = AsyncMock(return_value=None)
                mock_session_instance.commit = AsyncMock()

                async def mock_refresh(msg_obj):
                    msg_obj.id = "msg-1"
                    msg_obj.created_at = MagicMock()
                    msg_obj.created_at.isoformat.return_value = "2026-01-01T12:00:00Z"

                mock_session_instance.refresh.side_effect = mock_refresh

                with patch.dict("app.api.chat.__dict__", {"async_session": mock_session}):
                    client = TestClient(app)
                    with client.websocket_connect(f"/api/v1/chat/match-abc?token={token}") as ws:
                        ws.send_json({"message": ""})
                        # No broadcast should arrive for empty messages
                        ws.send_json({"message": "valid"})
                        response = ws.receive_text()
                        data = json.loads(response)
                        assert data["message"] == "valid"
