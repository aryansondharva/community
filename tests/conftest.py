"""Pytest configuration and shared fixtures for Info Hunter tests."""

import pytest
from hypothesis import settings

# Configure Hypothesis for property-based tests
settings.register_profile("default", max_examples=100, deadline=5000)
settings.register_profile("ci", max_examples=200, deadline=10000)
settings.load_profile("default")
