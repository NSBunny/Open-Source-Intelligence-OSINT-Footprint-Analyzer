"""
TraceGuard 2.0 — Configuration
Loads API keys from environment variables and controls mock-data fallback.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Centralised settings pulled from .env or environment variables."""

    # ── API Keys ────────────────────────────────────────────────────────
    LEAKCHECK_API_KEY: str = os.getenv("LEAKCHECK_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SHODAN_API_KEY: str = os.getenv("SHODAN_API_KEY", "")
    HUNTER_API_KEY: str = os.getenv("HUNTER_API_KEY", "")

    # ── AI Config ───────────────────────────────────────────────────────
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq").lower()

    # ── Feature flags ──────────────────────────────────────────────────
    USE_MOCK_DATA: bool = os.getenv("USE_MOCK_DATA", "false").lower() in (
        "true",
        "1",
        "yes",
    )

    # ── Server ─────────────────────────────────────────────────────────
    HOST: str = os.getenv("PYTHON_ENGINE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PYTHON_ENGINE_PORT", "8000"))

    # ── Helpers ────────────────────────────────────────────────────────
    @property
    def has_leakcheck(self) -> bool:
        return bool(self.LEAKCHECK_API_KEY)

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)

    @property
    def has_groq(self) -> bool:
        return bool(self.GROQ_API_KEY)

    @property
    def has_ai(self) -> bool:
        if self.AI_PROVIDER == "groq":
            return self.has_groq
        elif self.AI_PROVIDER == "gemini":
            return self.has_gemini
        elif self.AI_PROVIDER == "openai":
            return bool(self.OPENAI_API_KEY)
        return self.has_groq or self.has_gemini or bool(self.OPENAI_API_KEY)


settings = Settings()
