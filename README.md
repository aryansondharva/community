# Info Hunter

A data aggregation platform that builds intelligence from the web. The system scrapes, processes, and consolidates data from various sources including scholarships, internships, price listings, and learning resources.

## Features

- Configurable data source extraction rules (CSS selectors, XPath)
- Web scraping with Selenium
- ElasticSearch-powered storage and search
- Scheduled scrape jobs with cron expressions
- REST API for integration

## Installation

```bash
pip install -e ".[dev]"
```

## Running Tests

```bash
pytest
```

## Project Structure

```
src/info_hunter/
├── api/          # REST API endpoints
├── models/       # Data models (Pydantic)
├── scraper/      # Web scraping components
├── search/       # Search engine
├── scheduler/    # Job scheduling
└── storage/      # Data storage and indexing

tests/
├── unit/         # Unit tests
├── property/     # Property-based tests (Hypothesis)
└── integration/  # Integration tests
```
