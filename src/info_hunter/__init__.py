"""Info Hunter - A data aggregation platform for web intelligence."""

__version__ = "0.1.0"

from info_hunter.aggregator import Aggregator, IndexResult, BulkIndexResult

__all__ = [
    "Aggregator",
    "IndexResult",
    "BulkIndexResult",
]
