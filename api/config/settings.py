# API Configuration
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # FastAPI settings
    app_name: str = "EaaS Python Worker API"
    debug: bool = True
    
    # Database settings
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    
    # Redis settings for Celery
    redis_url: str = "redis://localhost:6379/0"
    
    # File processing settings
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: list = [".csv"]
    
    # Evaluation settings
    max_batch_size: int = 1000
    default_timeout: int = 300  # 5 minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()