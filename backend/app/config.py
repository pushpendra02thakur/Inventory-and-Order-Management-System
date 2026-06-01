import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Security Configurations
    SECRET_KEY: str = "tracehub_jwt_secret_key_super_secret_1234567890"
    REFRESH_SECRET_KEY: str = "tracehub_jwt_refresh_secret_key_super_secret_0987654321"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Configurations
    DATABASE_URL: str = ""
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "tracehub_db"

    # CORS Configurations
    CORS_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            # SQLAlchemy requires postgresql:// instead of postgres://
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
