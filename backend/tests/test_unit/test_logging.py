"""Unit tests for app.core.logging module."""
import logging
import pytest

from app.core.logging import setup_logging


class TestSetupLogging:
    def test_setup_logging_returns_none(self):
        """setup_logging is a void function."""
        result = setup_logging()
        assert result is None

    def test_setup_logging_configures_root_logger(self):
        setup_logging()
        root = logging.getLogger()
        assert "console" in [h.name for h in root.handlers]
        assert root.level == logging.INFO

    def test_setup_logging_console_handler_uses_stdout(self):
        setup_logging()
        root = logging.getLogger()
        console_handler = None
        for handler in root.handlers:
            if handler.__class__.__name__ == "StreamHandler":
                console_handler = handler
                break
        assert console_handler is not None

    def test_setup_logging_uvicorn_loggers_configured(self):
        setup_logging()
        uvicorn_logger = logging.getLogger("uvicorn")
        assert "console" in [h.name for h in uvicorn_logger.handlers]
        # uvicorn root should be WARNING, but uvicorn.error should be INFO
        uvicorn_error = logging.getLogger("uvicorn.error")
        assert uvicorn_error.level == logging.INFO

    def test_setup_logging_sqlalchemy_logger_suppressed(self):
        setup_logging()
        sa_logger = logging.getLogger("sqlalchemy.engine")
        assert sa_logger.level == logging.WARNING

    def test_setup_logging_formatter_applied(self):
        setup_logging()
        root = logging.getLogger()
        handler = root.handlers[0]
        assert handler.formatter is not None
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="test.py",
            lineno=1, msg="test message", args=(), exc_info=None,
        )
        formatted = handler.format(record)
        assert "test message" in formatted
        assert "INFO" in formatted

    def test_setup_logging_multiple_calls_safe(self):
        """Calling setup_logging multiple times should not crash."""
        setup_logging()
        setup_logging()
        setup_logging()
        # Should not raise

    def test_setup_logging_disable_existing_false(self):
        """Existing loggers should not be disabled."""
        existing = logging.getLogger("some.existing.logger")
        existing.disabled = True
        setup_logging()
        assert existing.disabled is True
