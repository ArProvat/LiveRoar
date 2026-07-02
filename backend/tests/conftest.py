"""Pytest configuration for the LiveRoar backend test suite.

All integration tests share one SQLite in-memory database.
"""
import sys, os

_BACKEND_ROOT = os.path.join(os.path.dirname(__file__))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)
