"""Pytest configuration for the LiveRoar backend test suite."""
import sys
import os

# Ensure the backend directory is on sys.path so 'app' imports work
_BACKEND_ROOT = os.path.join(os.path.dirname(__file__))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)
