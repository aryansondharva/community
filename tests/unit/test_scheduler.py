"""Unit tests for the Scheduler module."""

import tempfile
import time
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from info_hunter.models import (
    DataSourceConfig,
    ExtractionRule,
    JobStatus,
    Schedule,
    ScrapeJob,
    SelectorType,
    SourceType,
)
from info_hunter.scheduler import (
    InvalidCronExpressionError,
    JobStore,
    ScheduleNotFoundError,
    ScheduleStore,
    Scheduler,
    SourceNotFoundError,
)
from info_hunter.storage import ConfigStore


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test storage."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture
def config_store(temp_dir):
    """Create a ConfigStore with temporary storage."""
    return ConfigStore(storage_dir=f"{temp_dir}/configs")


@pytest.fixture
def schedule_store(temp_dir):
    """Create a ScheduleStore with temporary storage."""
    return ScheduleStore(storage_dir=f"{temp_dir}/schedules")


@pytest.fixture
def job_store(temp_dir):
    """Create a JobStore with temporary storage."""
    return JobStore(storage_dir=f"{temp_dir}/jobs")


@pytest.fixture
def sample_config():
    """Create a sample DataSourceConfig for testing."""
    return DataSourceConfig(
        name="Test Source",
        url_pattern="https://example.com/data",
        source_type=SourceType.SCHOLARSHIP,
        extraction_rules=[
            ExtractionRule(
                field_name="title",
                selector=".title",
                selector_type=SelectorType.CSS,
            )
        ],
    )


@pytest.fixture
def scheduler(config_store, schedule_store, job_store):
    """Create a Scheduler with test stores."""
    return Scheduler(
        config_store=config_store,
        schedule_store=schedule_store,
        job_store=job_store,
    )


class TestScheduleStore:
    """Tests for ScheduleStore."""

    def test_save_and_get_schedule(self, schedule_store):
        """Test saving and retrieving a schedule."""
        schedule = Schedule(
            id="test-schedule-1",
            source_id="source-1",
            cron_expression="0 * * * *",
            enabled=True,
            last_run=None,
            next_run=datetime.now() + timedelta(hours=1),
        )
        
        schedule_store.save(schedule)
        retrieved = schedule_store.get("test-schedule-1")
        
        assert retrieved is not None
        assert retrieved.id == schedule.id
        assert retrieved.source_id == schedule.source_id
        assert retrieved.cron_expression == schedule.cron_expression
        assert retrieved.enabled == schedule.enabled

    def test_get_nonexistent_schedule(self, schedule_store):
        """Test getting a schedule that doesn't exist."""
        result = schedule_store.get("nonexistent")
        assert result is None

    def test_list_schedules(self, schedule_store):
        """Test listing all schedules."""
        for i in range(3):
            schedule = Schedule(
                id=f"schedule-{i}",
                source_id=f"source-{i}",
                cron_expression="0 * * * *",
                enabled=True,
                last_run=None,
                next_run=datetime.now() + timedelta(hours=1),
            )
            schedule_store.save(schedule)
        
        schedules = schedule_store.list()
        assert len(schedules) == 3

    def test_delete_schedule(self, schedule_store):
        """Test deleting a schedule."""
        schedule = Schedule(
            id="to-delete",
            source_id="source-1",
            cron_expression="0 * * * *",
            enabled=True,
            last_run=None,
            next_run=datetime.now() + timedelta(hours=1),
        )
        schedule_store.save(schedule)
        
        result = schedule_store.delete("to-delete")
        assert result is True
        assert schedule_store.get("to-delete") is None

    def test_delete_nonexistent_schedule(self, schedule_store):
        """Test deleting a schedule that doesn't exist."""
        result = schedule_store.delete("nonexistent")
        assert result is False


class TestJobStore:
    """Tests for JobStore."""

    def test_save_and_get_job(self, job_store):
        """Test saving and retrieving a job."""
        job = ScrapeJob(
            id="test-job-1",
            source_id="source-1",
            status=JobStatus.PENDING,
        )
        
        job_store.save(job)
        retrieved = job_store.get("test-job-1")
        
        assert retrieved is not None
        assert retrieved.id == job.id
        assert retrieved.source_id == job.source_id
        assert retrieved.status == job.status

    def test_list_jobs_by_source(self, job_store):
        """Test listing jobs filtered by source."""
        for i in range(3):
            job = ScrapeJob(
                id=f"job-{i}",
                source_id="source-1" if i < 2 else "source-2",
                status=JobStatus.COMPLETED,
            )
            job_store.save(job)
        
        source_1_jobs = job_store.list_by_source("source-1")
        assert len(source_1_jobs) == 2
        
        source_2_jobs = job_store.list_by_source("source-2")
        assert len(source_2_jobs) == 1


class TestSchedulerCreateSchedule:
    """Tests for Scheduler.create_schedule()."""

    def test_create_schedule_success(self, scheduler, config_store, sample_config):
        """Test creating a schedule for an existing source."""
        # First create a data source
        source = config_store.save(sample_config)
        
        # Create a schedule
        schedule = scheduler.create_schedule(source.id, "0 * * * *")
        
        assert schedule is not None
        assert schedule.source_id == source.id
        assert schedule.cron_expression == "0 * * * *"
        assert schedule.enabled is True
        assert schedule.next_run > datetime.now()

    def test_create_schedule_source_not_found(self, scheduler):
        """Test creating a schedule for a nonexistent source."""
        with pytest.raises(SourceNotFoundError) as exc_info:
            scheduler.create_schedule("nonexistent-source", "0 * * * *")
        
        assert exc_info.value.source_id == "nonexistent-source"

    def test_create_schedule_invalid_cron(self, scheduler, config_store, sample_config):
        """Test creating a schedule with an invalid cron expression."""
        source = config_store.save(sample_config)
        
        with pytest.raises(InvalidCronExpressionError) as exc_info:
            scheduler.create_schedule(source.id, "invalid cron")
        
        assert "invalid cron" in exc_info.value.cron_expression


class TestSchedulerTriggerJob:
    """Tests for Scheduler.trigger_job()."""

    def test_trigger_job_creates_pending_job(self, scheduler, config_store, sample_config):
        """Test that trigger_job creates a job in pending state."""
        source = config_store.save(sample_config)
        
        job = scheduler.trigger_job(source.id)
        
        assert job is not None
        assert job.source_id == source.id
        assert job.status == JobStatus.PENDING

    def test_trigger_job_source_not_found(self, scheduler):
        """Test triggering a job for a nonexistent source."""
        with pytest.raises(SourceNotFoundError) as exc_info:
            scheduler.trigger_job("nonexistent-source")
        
        assert exc_info.value.source_id == "nonexistent-source"

    def test_trigger_job_with_executor(self, config_store, schedule_store, job_store, sample_config):
        """Test triggering a job with a custom executor."""
        # Create a mock executor
        mock_executor = MagicMock(return_value=ScrapeJob(
            id="result-job",
            source_id="test",
            status=JobStatus.COMPLETED,
            documents_scraped=5,
            errors=[],
        ))
        
        scheduler = Scheduler(
            config_store=config_store,
            schedule_store=schedule_store,
            job_store=job_store,
            job_executor=mock_executor,
        )
        
        source = config_store.save(sample_config)
        job = scheduler.trigger_job(source.id)
        
        # Executor should have been called
        mock_executor.assert_called_once_with(source.id)
        
        # Job should be completed with results
        assert job.status == JobStatus.COMPLETED
        assert job.documents_scraped == 5

    def test_trigger_job_executor_failure(self, config_store, schedule_store, job_store, sample_config):
        """Test that executor failures are recorded."""
        # Create a failing executor
        mock_executor = MagicMock(side_effect=Exception("Scrape failed"))
        
        scheduler = Scheduler(
            config_store=config_store,
            schedule_store=schedule_store,
            job_store=job_store,
            job_executor=mock_executor,
        )
        
        source = config_store.save(sample_config)
        job = scheduler.trigger_job(source.id)
        
        # Job should be marked as failed
        assert job.status == JobStatus.FAILED
        assert len(job.errors) > 0
        assert "Scrape failed" in job.errors[0]


class TestSchedulerListAndGet:
    """Tests for Scheduler list and get operations."""

    def test_list_schedules(self, scheduler, config_store, sample_config):
        """Test listing all schedules."""
        source = config_store.save(sample_config)
        
        scheduler.create_schedule(source.id, "0 * * * *")
        scheduler.create_schedule(source.id, "0 0 * * *")
        
        schedules = scheduler.list_schedules()
        assert len(schedules) == 2

    def test_list_schedules_enabled_only(self, scheduler, config_store, sample_config):
        """Test listing only enabled schedules."""
        source = config_store.save(sample_config)
        
        schedule1 = scheduler.create_schedule(source.id, "0 * * * *")
        scheduler.create_schedule(source.id, "0 0 * * *")
        
        # Disable one schedule
        scheduler.update_schedule(schedule1.id, enabled=False)
        
        enabled_schedules = scheduler.list_schedules(enabled_only=True)
        assert len(enabled_schedules) == 1

    def test_get_schedule(self, scheduler, config_store, sample_config):
        """Test getting a specific schedule."""
        source = config_store.save(sample_config)
        created = scheduler.create_schedule(source.id, "0 * * * *")
        
        retrieved = scheduler.get_schedule(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id

    def test_list_jobs(self, scheduler, config_store, sample_config):
        """Test listing all jobs."""
        source = config_store.save(sample_config)
        
        scheduler.trigger_job(source.id)
        scheduler.trigger_job(source.id)
        
        jobs = scheduler.list_jobs()
        assert len(jobs) == 2

    def test_list_jobs_by_source(self, scheduler, config_store, sample_config):
        """Test listing jobs filtered by source."""
        source1 = config_store.save(sample_config)
        
        # Create another source
        config2 = DataSourceConfig(
            name="Test Source 2",
            url_pattern="https://example.com/other",
            source_type=SourceType.INTERNSHIP,
            extraction_rules=[
                ExtractionRule(
                    field_name="title",
                    selector=".title",
                    selector_type=SelectorType.CSS,
                )
            ],
        )
        source2 = config_store.save(config2)
        
        scheduler.trigger_job(source1.id)
        scheduler.trigger_job(source1.id)
        scheduler.trigger_job(source2.id)
        
        source1_jobs = scheduler.list_jobs(source_id=source1.id)
        assert len(source1_jobs) == 2


class TestSchedulerUpdateAndDelete:
    """Tests for Scheduler update and delete operations."""

    def test_update_schedule_cron(self, scheduler, config_store, sample_config):
        """Test updating a schedule's cron expression."""
        source = config_store.save(sample_config)
        schedule = scheduler.create_schedule(source.id, "0 * * * *")
        
        updated = scheduler.update_schedule(schedule.id, cron_expression="0 0 * * *")
        
        assert updated.cron_expression == "0 0 * * *"

    def test_update_schedule_enabled(self, scheduler, config_store, sample_config):
        """Test updating a schedule's enabled state."""
        source = config_store.save(sample_config)
        schedule = scheduler.create_schedule(source.id, "0 * * * *")
        
        updated = scheduler.update_schedule(schedule.id, enabled=False)
        
        assert updated.enabled is False

    def test_update_nonexistent_schedule(self, scheduler):
        """Test updating a schedule that doesn't exist."""
        with pytest.raises(ScheduleNotFoundError):
            scheduler.update_schedule("nonexistent", enabled=False)

    def test_update_schedule_invalid_cron(self, scheduler, config_store, sample_config):
        """Test updating a schedule with an invalid cron expression."""
        source = config_store.save(sample_config)
        schedule = scheduler.create_schedule(source.id, "0 * * * *")
        
        with pytest.raises(InvalidCronExpressionError):
            scheduler.update_schedule(schedule.id, cron_expression="invalid")

    def test_delete_schedule(self, scheduler, config_store, sample_config):
        """Test deleting a schedule."""
        source = config_store.save(sample_config)
        schedule = scheduler.create_schedule(source.id, "0 * * * *")
        
        result = scheduler.delete_schedule(schedule.id)
        
        assert result is True
        assert scheduler.get_schedule(schedule.id) is None

    def test_delete_nonexistent_schedule(self, scheduler):
        """Test deleting a schedule that doesn't exist."""
        result = scheduler.delete_schedule("nonexistent")
        assert result is False


class TestSchedulerBackgroundRunner:
    """Tests for Scheduler background runner."""

    def test_start_and_stop(self, scheduler):
        """Test starting and stopping the background runner."""
        assert scheduler.is_running() is False
        
        scheduler.start(interval=1)
        assert scheduler.is_running() is True
        
        scheduler.stop()
        assert scheduler.is_running() is False

    def test_start_already_running(self, scheduler):
        """Test starting when already running."""
        scheduler.start(interval=1)
        scheduler.start(interval=1)  # Should not raise
        
        assert scheduler.is_running() is True
        scheduler.stop()

    def test_stop_not_running(self, scheduler):
        """Test stopping when not running."""
        scheduler.stop()  # Should not raise
        assert scheduler.is_running() is False
