"""Job scheduling components for Info Hunter."""

import json
import logging
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, List, Optional

from croniter import croniter

from info_hunter.models import (
    JobStatus,
    Schedule,
    ScrapeJob,
    ValidationResult,
)
from info_hunter.storage import ConfigStore, DataSource
from info_hunter.validation import validate_cron_expression


logger = logging.getLogger(__name__)


class SchedulerError(Exception):
    """Base exception for Scheduler errors."""
    pass


class ScheduleNotFoundError(SchedulerError):
    """Raised when a schedule is not found."""
    
    def __init__(self, schedule_id: str):
        self.schedule_id = schedule_id
        super().__init__(f"Schedule not found: {schedule_id}")


class SourceNotFoundError(SchedulerError):
    """Raised when a data source is not found."""
    
    def __init__(self, source_id: str):
        self.source_id = source_id
        super().__init__(f"Data source not found: {source_id}")


class InvalidCronExpressionError(SchedulerError):
    """Raised when a cron expression is invalid."""
    
    def __init__(self, cron_expression: str, errors: List[str]):
        self.cron_expression = cron_expression
        self.errors = errors
        super().__init__(f"Invalid cron expression '{cron_expression}': {'; '.join(errors)}")


class ScheduleStore:
    """File-based JSON storage for Schedule objects.
    
    Stores each schedule as a separate JSON file in the configured
    storage directory.
    """
    
    def __init__(self, storage_dir: str = ".info_hunter/schedules"):
        """Initialize the ScheduleStore.
        
        Args:
            storage_dir: Directory path where schedule files will be stored.
        """
        self._storage_dir = Path(storage_dir)
        self._ensure_storage_dir()
    
    def _ensure_storage_dir(self) -> None:
        """Create the storage directory if it doesn't exist."""
        self._storage_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, schedule_id: str) -> Path:
        """Get the file path for a given schedule ID."""
        return self._storage_dir / f"{schedule_id}.json"
    
    def save(self, schedule: Schedule) -> Schedule:
        """Save a Schedule to the store.
        
        Args:
            schedule: The Schedule to save.
            
        Returns:
            The saved Schedule.
        """
        file_path = self._get_file_path(schedule.id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(schedule.model_dump(mode='json'), f, indent=2, default=str)
        return schedule
    
    def get(self, schedule_id: str) -> Optional[Schedule]:
        """Retrieve a Schedule by ID.
        
        Args:
            schedule_id: The ID of the schedule to retrieve.
            
        Returns:
            The Schedule if found, None otherwise.
        """
        file_path = self._get_file_path(schedule_id)
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return Schedule.model_validate(data)
    
    def list(self) -> List[Schedule]:
        """List all stored Schedules.
        
        Returns:
            List of all Schedule objects in the store.
        """
        schedules: List[Schedule] = []
        
        if not self._storage_dir.exists():
            return schedules
        
        for file_path in self._storage_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                schedules.append(Schedule.model_validate(data))
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to load schedule from {file_path}: {e}")
                continue
        
        return schedules
    
    def delete(self, schedule_id: str) -> bool:
        """Delete a Schedule by ID.
        
        Args:
            schedule_id: The ID of the schedule to delete.
            
        Returns:
            True if the schedule was deleted, False if it didn't exist.
        """
        file_path = self._get_file_path(schedule_id)
        
        if not file_path.exists():
            return False
        
        file_path.unlink()
        return True


class JobStore:
    """File-based JSON storage for ScrapeJob objects.
    
    Stores each job as a separate JSON file in the configured
    storage directory.
    """
    
    def __init__(self, storage_dir: str = ".info_hunter/jobs"):
        """Initialize the JobStore.
        
        Args:
            storage_dir: Directory path where job files will be stored.
        """
        self._storage_dir = Path(storage_dir)
        self._ensure_storage_dir()
    
    def _ensure_storage_dir(self) -> None:
        """Create the storage directory if it doesn't exist."""
        self._storage_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, job_id: str) -> Path:
        """Get the file path for a given job ID."""
        return self._storage_dir / f"{job_id}.json"
    
    def save(self, job: ScrapeJob) -> ScrapeJob:
        """Save a ScrapeJob to the store.
        
        Args:
            job: The ScrapeJob to save.
            
        Returns:
            The saved ScrapeJob.
        """
        file_path = self._get_file_path(job.id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(job.model_dump(mode='json'), f, indent=2, default=str)
        return job
    
    def get(self, job_id: str) -> Optional[ScrapeJob]:
        """Retrieve a ScrapeJob by ID.
        
        Args:
            job_id: The ID of the job to retrieve.
            
        Returns:
            The ScrapeJob if found, None otherwise.
        """
        file_path = self._get_file_path(job_id)
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return ScrapeJob.model_validate(data)
    
    def list(self) -> List[ScrapeJob]:
        """List all stored ScrapeJobs.
        
        Returns:
            List of all ScrapeJob objects in the store.
        """
        jobs: List[ScrapeJob] = []
        
        if not self._storage_dir.exists():
            return jobs
        
        for file_path in self._storage_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                jobs.append(ScrapeJob.model_validate(data))
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to load job from {file_path}: {e}")
                continue
        
        return jobs
    
    def list_by_source(self, source_id: str) -> List[ScrapeJob]:
        """List all ScrapeJobs for a specific source.
        
        Args:
            source_id: The ID of the data source.
            
        Returns:
            List of ScrapeJob objects for the source.
        """
        return [job for job in self.list() if job.source_id == source_id]


# Type alias for job executor callback
JobExecutor = Callable[[str], ScrapeJob]


class Scheduler:
    """Manages scheduled scrape jobs.
    
    This class provides functionality for:
    - Creating and managing scrape schedules with cron expressions
    - Manual triggering of scrape jobs
    - Background job runner for scheduled execution
    - Recording job status and statistics
    
    Attributes:
        schedule_store: Storage for schedule configurations.
        job_store: Storage for job records.
        config_store: Storage for data source configurations.
    """
    
    def __init__(
        self,
        schedule_store: Optional[ScheduleStore] = None,
        job_store: Optional[JobStore] = None,
        config_store: Optional[ConfigStore] = None,
        job_executor: Optional[JobExecutor] = None,
    ):
        """Initialize the Scheduler.
        
        Args:
            schedule_store: Optional ScheduleStore instance.
            job_store: Optional JobStore instance.
            config_store: Optional ConfigStore for data source configs.
            job_executor: Optional callback function to execute scrape jobs.
                         Receives source_id and returns ScrapeJob with results.
        """
        self._schedule_store = schedule_store or ScheduleStore()
        self._job_store = job_store or JobStore()
        self._config_store = config_store or ConfigStore()
        self._job_executor = job_executor
        
        # Background runner state
        self._runner_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._runner_interval = 60  # Check schedules every 60 seconds
    
    def _generate_id(self) -> str:
        """Generate a unique ID."""
        return str(uuid.uuid4())
    
    def _calculate_next_run(self, cron_expression: str, base_time: Optional[datetime] = None) -> datetime:
        """Calculate the next run time for a cron expression.
        
        Args:
            cron_expression: Valid cron expression string.
            base_time: Base time to calculate from (defaults to now).
            
        Returns:
            datetime of the next scheduled run.
        """
        if base_time is None:
            base_time = datetime.now()
        
        cron = croniter(cron_expression, base_time)
        return cron.get_next(datetime)
    
    def create_schedule(self, source_id: str, cron_expression: str) -> Schedule:
        """Create a new scrape schedule.
        
        Validates the cron expression and creates a schedule for the
        specified data source.
        
        Args:
            source_id: The ID of the data source to schedule.
            cron_expression: Cron expression defining the schedule.
            
        Returns:
            The created Schedule.
            
        Raises:
            SourceNotFoundError: If the data source doesn't exist.
            InvalidCronExpressionError: If the cron expression is invalid.
        """
        # Validate that the source exists
        source = self._config_store.get(source_id)
        if source is None:
            raise SourceNotFoundError(source_id)
        
        # Validate the cron expression (Requirement 5.1)
        validation_result = validate_cron_expression(cron_expression)
        if not validation_result.valid:
            raise InvalidCronExpressionError(cron_expression, validation_result.errors)
        
        # Calculate next run time
        next_run = self._calculate_next_run(cron_expression)
        
        # Create the schedule
        schedule = Schedule(
            id=self._generate_id(),
            source_id=source_id,
            cron_expression=cron_expression,
            enabled=True,
            last_run=None,
            next_run=next_run,
        )
        
        # Save and return
        return self._schedule_store.save(schedule)
    
    def get_schedule(self, schedule_id: str) -> Optional[Schedule]:
        """Retrieve a schedule by ID.
        
        Args:
            schedule_id: The ID of the schedule to retrieve.
            
        Returns:
            The Schedule if found, None otherwise.
        """
        return self._schedule_store.get(schedule_id)
    
    def list_schedules(self, enabled_only: bool = False) -> List[Schedule]:
        """List all schedules.
        
        Args:
            enabled_only: If True, only return enabled schedules.
            
        Returns:
            List of Schedule objects.
        """
        schedules = self._schedule_store.list()
        
        if enabled_only:
            schedules = [s for s in schedules if s.enabled]
        
        return schedules
    
    def update_schedule(
        self,
        schedule_id: str,
        cron_expression: Optional[str] = None,
        enabled: Optional[bool] = None,
    ) -> Schedule:
        """Update an existing schedule.
        
        Args:
            schedule_id: The ID of the schedule to update.
            cron_expression: Optional new cron expression.
            enabled: Optional new enabled state.
            
        Returns:
            The updated Schedule.
            
        Raises:
            ScheduleNotFoundError: If the schedule doesn't exist.
            InvalidCronExpressionError: If the new cron expression is invalid.
        """
        schedule = self._schedule_store.get(schedule_id)
        if schedule is None:
            raise ScheduleNotFoundError(schedule_id)
        
        # Update cron expression if provided
        if cron_expression is not None:
            validation_result = validate_cron_expression(cron_expression)
            if not validation_result.valid:
                raise InvalidCronExpressionError(cron_expression, validation_result.errors)
            
            schedule = Schedule(
                id=schedule.id,
                source_id=schedule.source_id,
                cron_expression=cron_expression,
                enabled=schedule.enabled if enabled is None else enabled,
                last_run=schedule.last_run,
                next_run=self._calculate_next_run(cron_expression),
            )
        elif enabled is not None:
            schedule = Schedule(
                id=schedule.id,
                source_id=schedule.source_id,
                cron_expression=schedule.cron_expression,
                enabled=enabled,
                last_run=schedule.last_run,
                next_run=schedule.next_run,
            )
        
        return self._schedule_store.save(schedule)
    
    def delete_schedule(self, schedule_id: str) -> bool:
        """Remove a schedule.
        
        Args:
            schedule_id: The ID of the schedule to delete.
            
        Returns:
            True if the schedule was deleted, False if it didn't exist.
        """
        return self._schedule_store.delete(schedule_id)
    
    def trigger_job(self, source_id: str) -> ScrapeJob:
        """Manually trigger a scrape job for a data source.
        
        Creates a new ScrapeJob and optionally executes it if a job
        executor is configured.
        
        Args:
            source_id: The ID of the data source to scrape.
            
        Returns:
            The created ScrapeJob.
            
        Raises:
            SourceNotFoundError: If the data source doesn't exist.
        """
        # Validate that the source exists
        source = self._config_store.get(source_id)
        if source is None:
            raise SourceNotFoundError(source_id)
        
        # Create the job
        job = ScrapeJob(
            id=self._generate_id(),
            source_id=source_id,
            status=JobStatus.PENDING,
            started_at=None,
            completed_at=None,
            documents_scraped=0,
            errors=[],
        )
        
        # Save the initial job state
        self._job_store.save(job)
        
        # Execute the job if an executor is configured
        if self._job_executor is not None:
            try:
                # Update job to running
                job = ScrapeJob(
                    id=job.id,
                    source_id=job.source_id,
                    status=JobStatus.RUNNING,
                    started_at=datetime.now(),
                    completed_at=None,
                    documents_scraped=0,
                    errors=[],
                )
                self._job_store.save(job)
                
                # Execute and get results
                result_job = self._job_executor(source_id)
                
                # Update job with results (Requirement 5.3)
                job = ScrapeJob(
                    id=job.id,
                    source_id=job.source_id,
                    status=result_job.status,
                    started_at=job.started_at,
                    completed_at=datetime.now(),
                    documents_scraped=result_job.documents_scraped,
                    errors=result_job.errors,
                )
                self._job_store.save(job)
                
            except Exception as e:
                # Record failure
                job = ScrapeJob(
                    id=job.id,
                    source_id=job.source_id,
                    status=JobStatus.FAILED,
                    started_at=job.started_at,
                    completed_at=datetime.now(),
                    documents_scraped=0,
                    errors=[str(e)],
                )
                self._job_store.save(job)
                logger.error(f"Job execution failed for source {source_id}: {e}")
        
        return job
    
    def get_job(self, job_id: str) -> Optional[ScrapeJob]:
        """Retrieve a job by ID.
        
        Args:
            job_id: The ID of the job to retrieve.
            
        Returns:
            The ScrapeJob if found, None otherwise.
        """
        return self._job_store.get(job_id)
    
    def list_jobs(self, source_id: Optional[str] = None) -> List[ScrapeJob]:
        """List all jobs, optionally filtered by source.
        
        Args:
            source_id: Optional source ID to filter by.
            
        Returns:
            List of ScrapeJob objects.
        """
        if source_id is not None:
            return self._job_store.list_by_source(source_id)
        return self._job_store.list()
    
    def _check_and_run_schedules(self) -> None:
        """Check all schedules and run any that are due.
        
        This method is called by the background runner to check if any
        schedules need to be executed.
        """
        now = datetime.now()
        schedules = self.list_schedules(enabled_only=True)
        
        for schedule in schedules:
            if schedule.next_run <= now:
                try:
                    logger.info(f"Triggering scheduled job for source {schedule.source_id}")
                    
                    # Trigger the job (Requirement 5.2)
                    self.trigger_job(schedule.source_id)
                    
                    # Update schedule with last run and next run times
                    updated_schedule = Schedule(
                        id=schedule.id,
                        source_id=schedule.source_id,
                        cron_expression=schedule.cron_expression,
                        enabled=schedule.enabled,
                        last_run=now,
                        next_run=self._calculate_next_run(schedule.cron_expression, now),
                    )
                    self._schedule_store.save(updated_schedule)
                    
                except Exception as e:
                    logger.error(f"Failed to run scheduled job for source {schedule.source_id}: {e}")
    
    def _runner_loop(self) -> None:
        """Background runner loop that checks and executes schedules."""
        logger.info("Scheduler background runner started")
        
        while not self._stop_event.is_set():
            try:
                self._check_and_run_schedules()
            except Exception as e:
                logger.error(f"Error in scheduler runner loop: {e}")
            
            # Wait for the next check interval or until stopped
            self._stop_event.wait(self._runner_interval)
        
        logger.info("Scheduler background runner stopped")
    
    def start(self, interval: int = 60) -> None:
        """Start the background job runner.
        
        Args:
            interval: Seconds between schedule checks (default: 60).
        """
        if self._runner_thread is not None and self._runner_thread.is_alive():
            logger.warning("Scheduler runner is already running")
            return
        
        self._runner_interval = interval
        self._stop_event.clear()
        self._runner_thread = threading.Thread(target=self._runner_loop, daemon=True)
        self._runner_thread.start()
        logger.info(f"Scheduler started with {interval}s check interval")
    
    def stop(self, timeout: float = 5.0) -> None:
        """Stop the background job runner.
        
        Args:
            timeout: Maximum seconds to wait for the runner to stop.
        """
        if self._runner_thread is None or not self._runner_thread.is_alive():
            logger.warning("Scheduler runner is not running")
            return
        
        self._stop_event.set()
        self._runner_thread.join(timeout=timeout)
        
        if self._runner_thread.is_alive():
            logger.warning("Scheduler runner did not stop within timeout")
        else:
            logger.info("Scheduler stopped")
        
        self._runner_thread = None
    
    def is_running(self) -> bool:
        """Check if the background runner is active.
        
        Returns:
            True if the runner is running, False otherwise.
        """
        return self._runner_thread is not None and self._runner_thread.is_alive()


__all__ = [
    "Scheduler",
    "SchedulerError",
    "ScheduleNotFoundError",
    "SourceNotFoundError",
    "InvalidCronExpressionError",
    "ScheduleStore",
    "JobStore",
    "JobExecutor",
]
