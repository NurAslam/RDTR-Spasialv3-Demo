"""Common dependencies for API routes."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.services.data_service import DataService, get_data_service


async def get_data_service_dep() -> DataService:
    """Dependency to get data service instance."""
    return get_data_service()


# Type alias for dependency injection
DataServiceDep = Annotated[DataService, Depends(get_data_service_dep)]
