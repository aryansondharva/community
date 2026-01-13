"""Unit tests for the REST API."""

import pytest
import httpx

from info_hunter.api import create_app
from info_hunter.manager import DataSourceManager
from info_hunter.scheduler import Scheduler
from info_hunter.search import SearchEngine
from info_hunter.storage import ConfigStore
from info_hunter.scheduler import ScheduleStore, JobStore


@pytest.fixture
def temp_storage(tmp_path):
    """Create temporary storage directories."""
    config_dir = tmp_path / "configs"
    schedule_dir = tmp_path / "schedules"
    job_dir = tmp_path / "jobs"
    config_dir.mkdir()
    schedule_dir.mkdir()
    job_dir.mkdir()
    return {
        "config_dir": str(config_dir),
        "schedule_dir": str(schedule_dir),
        "job_dir": str(job_dir),
    }


@pytest.fixture
def test_app(temp_storage):
    """Create a test app with isolated storage."""
    config_store = ConfigStore(storage_dir=temp_storage["config_dir"])
    schedule_store = ScheduleStore(storage_dir=temp_storage["schedule_dir"])
    job_store = JobStore(storage_dir=temp_storage["job_dir"])
    
    manager = DataSourceManager(config_store=config_store)
    scheduler = Scheduler(
        schedule_store=schedule_store,
        job_store=job_store,
        config_store=config_store,
    )
    search_engine = SearchEngine()
    
    return create_app(
        manager=manager,
        scheduler=scheduler,
        search_engine=search_engine,
    )


@pytest.fixture
async def test_client(test_app):
    """Create an async test client."""
    transport = httpx.ASGITransport(app=test_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


class TestDataSourceEndpoints:
    """Tests for data source CRUD endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_data_source(self, test_client):
        """Test creating a new data source."""
        response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {
                        "field_name": "title",
                        "selector": "h1.title",
                        "selector_type": "css",
                        "required": True,
                    }
                ],
                "rate_limit_ms": 1000,
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Source"
        assert data["url_pattern"] == "https://example.com/page"
        assert data["source_type"] == "scholarship"
        assert len(data["extraction_rules"]) == 1
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_create_data_source_invalid_url(self, test_client):
        """Test creating a data source with invalid URL."""
        response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "not-a-valid-url",
                "source_type": "scholarship",
                "extraction_rules": [
                    {
                        "field_name": "title",
                        "selector": "h1.title",
                        "selector_type": "css",
                    }
                ],
            },
        )
        
        assert response.status_code == 422
        data = response.json()
        assert "errors" in data
    
    @pytest.mark.asyncio
    async def test_list_data_sources(self, test_client):
        """Test listing data sources."""
        # Create a source first
        await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        
        response = await test_client.get("/api/sources")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_list_data_sources_filter_by_type(self, test_client):
        """Test listing data sources filtered by type."""
        # Create sources of different types
        await test_client.post(
            "/api/sources",
            json={
                "name": "Scholarship Source",
                "url_pattern": "https://example.com/scholarships",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        await test_client.post(
            "/api/sources",
            json={
                "name": "Internship Source",
                "url_pattern": "https://example.com/internships",
                "source_type": "internship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        
        response = await test_client.get("/api/sources?source_type=scholarship")
        
        assert response.status_code == 200
        data = response.json()
        assert all(s["source_type"] == "scholarship" for s in data)
    
    @pytest.mark.asyncio
    async def test_get_data_source(self, test_client):
        """Test getting a data source by ID."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.get(f"/api/sources/{source_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == source_id
        assert data["name"] == "Test Source"
    
    @pytest.mark.asyncio
    async def test_get_data_source_not_found(self, test_client):
        """Test getting a non-existent data source."""
        response = await test_client.get("/api/sources/non-existent-id")
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_data_source(self, test_client):
        """Test updating a data source."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.put(
            f"/api/sources/{source_id}",
            json={
                "name": "Updated Source",
                "url_pattern": "https://example.com/updated",
                "source_type": "internship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h2", "selector_type": "css"}
                ],
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Source"
        assert data["source_type"] == "internship"
    
    @pytest.mark.asyncio
    async def test_update_data_source_not_found(self, test_client):
        """Test updating a non-existent data source."""
        response = await test_client.put(
            "/api/sources/non-existent-id",
            json={
                "name": "Updated Source",
                "url_pattern": "https://example.com/updated",
                "source_type": "internship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h2", "selector_type": "css"}
                ],
            },
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_data_source(self, test_client):
        """Test deleting a data source."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.delete(f"/api/sources/{source_id}")
        
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = await test_client.get(f"/api/sources/{source_id}")
        assert get_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_data_source_not_found(self, test_client):
        """Test deleting a non-existent data source."""
        response = await test_client.delete("/api/sources/non-existent-id")
        
        assert response.status_code == 404


class TestJobEndpoints:
    """Tests for job endpoints."""
    
    @pytest.mark.asyncio
    async def test_trigger_job(self, test_client):
        """Test triggering a scrape job."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.post(f"/api/jobs/trigger/{source_id}")
        
        assert response.status_code == 201
        data = response.json()
        assert data["source_id"] == source_id
        assert "id" in data
        assert "status" in data
    
    @pytest.mark.asyncio
    async def test_trigger_job_source_not_found(self, test_client):
        """Test triggering a job for non-existent source."""
        response = await test_client.post("/api/jobs/trigger/non-existent-id")
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_list_jobs(self, test_client):
        """Test listing jobs."""
        # Create a source and trigger a job
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        await test_client.post(f"/api/jobs/trigger/{source_id}")
        
        response = await test_client.get("/api/jobs")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_list_jobs_filter_by_source(self, test_client):
        """Test listing jobs filtered by source."""
        # Create a source and trigger a job
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        await test_client.post(f"/api/jobs/trigger/{source_id}")
        
        response = await test_client.get(f"/api/jobs?source_id={source_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert all(j["source_id"] == source_id for j in data)
    
    @pytest.mark.asyncio
    async def test_get_job(self, test_client):
        """Test getting a job by ID."""
        # Create a source and trigger a job
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        trigger_response = await test_client.post(f"/api/jobs/trigger/{source_id}")
        job_id = trigger_response.json()["id"]
        
        response = await test_client.get(f"/api/jobs/{job_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == job_id
    
    @pytest.mark.asyncio
    async def test_get_job_not_found(self, test_client):
        """Test getting a non-existent job."""
        response = await test_client.get("/api/jobs/non-existent-id")
        
        assert response.status_code == 404


class TestScheduleEndpoints:
    """Tests for schedule endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_schedule(self, test_client):
        """Test creating a schedule."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.post(
            "/api/schedules",
            json={
                "source_id": source_id,
                "cron_expression": "0 0 * * *",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["source_id"] == source_id
        assert data["cron_expression"] == "0 0 * * *"
        assert "id" in data
        assert "next_run" in data
    
    @pytest.mark.asyncio
    async def test_create_schedule_invalid_cron(self, test_client):
        """Test creating a schedule with invalid cron expression."""
        # Create a source first
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        
        response = await test_client.post(
            "/api/schedules",
            json={
                "source_id": source_id,
                "cron_expression": "invalid cron",
            },
        )
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_schedule_source_not_found(self, test_client):
        """Test creating a schedule for non-existent source."""
        response = await test_client.post(
            "/api/schedules",
            json={
                "source_id": "non-existent-id",
                "cron_expression": "0 0 * * *",
            },
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_list_schedules(self, test_client):
        """Test listing schedules."""
        # Create a source and schedule
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        await test_client.post(
            "/api/schedules",
            json={
                "source_id": source_id,
                "cron_expression": "0 0 * * *",
            },
        )
        
        response = await test_client.get("/api/schedules")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_delete_schedule(self, test_client):
        """Test deleting a schedule."""
        # Create a source and schedule
        create_response = await test_client.post(
            "/api/sources",
            json={
                "name": "Test Source",
                "url_pattern": "https://example.com/page",
                "source_type": "scholarship",
                "extraction_rules": [
                    {"field_name": "title", "selector": "h1", "selector_type": "css"}
                ],
            },
        )
        source_id = create_response.json()["id"]
        schedule_response = await test_client.post(
            "/api/schedules",
            json={
                "source_id": source_id,
                "cron_expression": "0 0 * * *",
            },
        )
        schedule_id = schedule_response.json()["id"]
        
        response = await test_client.delete(f"/api/schedules/{schedule_id}")
        
        assert response.status_code == 204
    
    @pytest.mark.asyncio
    async def test_delete_schedule_not_found(self, test_client):
        """Test deleting a non-existent schedule."""
        response = await test_client.delete("/api/schedules/non-existent-id")
        
        assert response.status_code == 404


class TestSearchEndpoints:
    """Tests for search endpoints."""
    
    @pytest.mark.asyncio
    async def test_search_post_no_elasticsearch(self, test_client):
        """Test search POST endpoint without ElasticSearch configured."""
        response = await test_client.post(
            "/api/search",
            json={
                "text": "test query",
                "page": 1,
                "page_size": 20,
            },
        )
        
        # Should return 503 since ElasticSearch is not configured
        assert response.status_code == 503
    
    @pytest.mark.asyncio
    async def test_search_get_no_elasticsearch(self, test_client):
        """Test search GET endpoint without ElasticSearch configured."""
        response = await test_client.get("/api/search?text=test+query")
        
        # Should return 503 since ElasticSearch is not configured
        assert response.status_code == 503
