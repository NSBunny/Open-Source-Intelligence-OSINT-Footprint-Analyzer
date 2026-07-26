"""
TraceGuard 2.0 — Mock Data
Rich, realistic mock data used when API keys are absent or for demo purposes.
Primary demo identity: demo@traceguard.io / johndoe
"""

from typing import Any

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BREACHES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOCK_BREACHES: list[dict[str, Any]] = [
    {
        "id": "breach-adobe-2013",
        "name": "Adobe",
        "domain": "adobe.com",
        "date": "2013-10-04",
        "severity": "HIGH",
        "pwnCount": 152_445_165,
        "dataClasses": [
            "Email addresses",
            "Password hints",
            "Passwords",
            "Usernames",
        ],
        "description": (
            "In October 2013, 153 million Adobe accounts were breached. "
            "Each record contained an internal ID, username, email, encrypted "
            "password, and a password hint in plain text."
        ),
        "logoUrl": "https://logo.clearbit.com/adobe.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-canva-2019",
        "name": "Canva",
        "domain": "canva.com",
        "date": "2019-05-24",
        "severity": "MEDIUM",
        "pwnCount": 137_272_116,
        "dataClasses": [
            "Email addresses",
            "Usernames",
            "Names",
            "Geographic locations",
        ],
        "description": (
            "In May 2019, the graphic design tool Canva suffered a data breach "
            "that impacted 137 million users. Exposed data included email "
            "addresses, usernames, names, cities of residence, and bcrypt "
            "password hashes."
        ),
        "logoUrl": "https://logo.clearbit.com/canva.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-linkedin-2021",
        "name": "LinkedIn",
        "domain": "linkedin.com",
        "date": "2021-06-22",
        "severity": "HIGH",
        "pwnCount": 700_000_000,
        "dataClasses": [
            "Email addresses",
            "Passwords",
            "Phone numbers",
            "Physical addresses",
            "Usernames",
            "Professional details",
        ],
        "description": (
            "In June 2021, data scraped from 700M LinkedIn profiles was put up "
            "for sale. Records included email addresses, phone numbers, "
            "geolocation data, and professional information."
        ),
        "logoUrl": "https://logo.clearbit.com/linkedin.com",
        "isVerified": True,
        "isSensitive": True,
    },
    {
        "id": "breach-dropbox-2012",
        "name": "Dropbox",
        "domain": "dropbox.com",
        "date": "2012-07-01",
        "severity": "MEDIUM",
        "pwnCount": 68_648_009,
        "dataClasses": [
            "Email addresses",
            "Passwords",
        ],
        "description": (
            "In mid-2012, Dropbox suffered a data breach which exposed the "
            "stored credentials of 68 million users. The exposed data included "
            "email addresses and salted hashes of passwords (bcrypt and SHA-1)."
        ),
        "logoUrl": "https://logo.clearbit.com/dropbox.com",
        "isVerified": True,
        "isSensitive": False,
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SOCIAL PROFILES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOCK_SOCIAL_PROFILES: list[dict[str, Any]] = [
    {
        "id": "social-github",
        "platform": "GitHub",
        "username": "johndoe",
        "profileUrl": "https://github.com/johndoe",
        "avatarUrl": "https://avatars.githubusercontent.com/u/12345678",
        "bio": "Full-stack developer | Open-source enthusiast",
        "followers": 342,
        "following": 128,
        "publicRepos": 15,
        "joinDate": "2018-03-15",
        "lastActive": "2026-07-10",
        "confidence": 92,
        "matchType": "username_exact",
        "metadata": {
            "topLanguages": ["TypeScript", "Python", "Go"],
            "totalStars": 487,
            "organizations": ["osint-tools", "react-community"],
        },
    },
    {
        "id": "social-linkedin",
        "platform": "LinkedIn",
        "username": "john-doe",
        "profileUrl": "https://linkedin.com/in/john-doe",
        "avatarUrl": None,
        "bio": "Senior Software Engineer at TechCorp | Ex-Google",
        "connections": "500+",
        "joinDate": "2015-06-20",
        "lastActive": "2026-07-12",
        "confidence": 88,
        "matchType": "email_verified",
        "metadata": {
            "company": "TechCorp Inc.",
            "position": "Senior Software Engineer",
            "location": "San Francisco, CA",
            "skills": ["Python", "Cloud Architecture", "Machine Learning"],
            "education": "M.S. Computer Science, Stanford University",
        },
    },
    {
        "id": "social-twitter",
        "platform": "Twitter / X",
        "username": "johndoe_dev",
        "profileUrl": "https://x.com/johndoe_dev",
        "avatarUrl": None,
        "bio": "Building things on the internet 🚀 | Tweets about tech & security",
        "followers": 1_243,
        "following": 567,
        "tweetCount": 3_890,
        "joinDate": "2017-01-08",
        "lastActive": "2026-07-11",
        "confidence": 78,
        "matchType": "username_partial",
        "metadata": {
            "verified": False,
            "location": "SF Bay Area",
        },
    },
    {
        "id": "social-blog",
        "platform": "Personal Blog",
        "username": "johndoe",
        "profileUrl": "https://johndoe.dev",
        "avatarUrl": None,
        "bio": "Personal tech blog — security, programming, and open-source",
        "posts": 47,
        "joinDate": "2019-09-01",
        "lastActive": "2026-06-28",
        "confidence": 75,
        "matchType": "domain_whois",
        "metadata": {
            "techStack": ["Next.js", "MDX", "Vercel"],
            "monthlyVisitors": "~2.3k",
            "topics": ["cybersecurity", "web development", "OSINT"],
        },
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WEB MENTIONS / DOCUMENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOCK_WEB_MENTIONS: list[dict[str, Any]] = [
    {
        "id": "mention-resume-pdf",
        "type": "document",
        "title": "John Doe — Resume (PDF)",
        "url": "https://johndoe.dev/resume.pdf",
        "source": "Personal Website",
        "snippet": (
            "Contains full name, phone number (+1-555-0142), email address, "
            "home address (123 Tech Lane, San Francisco, CA 94107), education "
            "history, and employment records."
        ),
        "dateFound": "2026-07-01",
        "riskLevel": "HIGH",
        "sensitiveData": [
            "phone_number",
            "home_address",
            "email",
            "employment_history",
        ],
        "confidence": 95,
    },
    {
        "id": "mention-forum-post",
        "type": "mention",
        "title": "Security Discussion on HackerNews",
        "url": "https://news.ycombinator.com/item?id=38291742",
        "source": "Hacker News",
        "snippet": (
            "User 'johndoe' commented: 'I've been running my home lab at "
            "192.168.1.0/24 with a public-facing Nginx reverse proxy. "
            "Here's my Cloudflare setup…'"
        ),
        "dateFound": "2026-05-18",
        "riskLevel": "MEDIUM",
        "sensitiveData": ["network_config", "infrastructure_details"],
        "confidence": 82,
    },
    {
        "id": "mention-stackoverflow",
        "type": "mention",
        "title": "Stack Overflow Profile — johndoe",
        "url": "https://stackoverflow.com/users/7654321/johndoe",
        "source": "Stack Overflow",
        "snippet": (
            "Active contributor with 12.4k reputation. Questions about AWS "
            "Lambda configuration, PostgreSQL performance tuning, and "
            "FastAPI authentication patterns reveal technical stack."
        ),
        "dateFound": "2026-06-03",
        "riskLevel": "LOW",
        "sensitiveData": ["tech_stack"],
        "confidence": 88,
    },
    {
        "id": "mention-news-article",
        "type": "mention",
        "title": "TechCorp Announces New Engineering Team",
        "url": "https://techcrunch.com/2025/09/15/techcorp-engineering/",
        "source": "TechCrunch",
        "snippet": (
            "Article mentions 'John Doe, Senior Software Engineer' as part "
            "of the new platform security team at TechCorp, confirming "
            "employer and role."
        ),
        "dateFound": "2025-09-15",
        "riskLevel": "LOW",
        "sensitiveData": ["employer", "role"],
        "confidence": 91,
    },
    {
        "id": "mention-academic-paper",
        "type": "document",
        "title": "Automated OSINT Collection Framework (IEEE)",
        "url": "https://ieeexplore.ieee.org/document/9876543",
        "source": "IEEE Xplore",
        "snippet": (
            "Co-authored paper: 'An Automated Framework for Open-Source "
            "Intelligence Collection and Analysis' — lists Stanford "
            "affiliation and co-author network."
        ),
        "dateFound": "2024-11-20",
        "riskLevel": "LOW",
        "sensitiveData": ["academic_affiliation", "co_authors"],
        "confidence": 96,
    },
    {
        "id": "mention-paste-leak",
        "type": "paste",
        "title": "Pastebin Credential Dump (redacted)",
        "url": "https://pastebin.com/REDACTED",
        "source": "Pastebin",
        "snippet": (
            "Email 'demo@traceguard.io' found in a credential dump alongside "
            "a SHA-256 hashed password. Dump dated 2024-03-12, contains "
            "~50k entries from an unknown breach."
        ),
        "dateFound": "2024-03-12",
        "riskLevel": "CRITICAL",
        "sensitiveData": ["email", "password_hash"],
        "confidence": 97,
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CORRELATION DATA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOCK_CORRELATIONS: dict[str, Any] = {
    "identity_cluster": {
        "primary_email": "demo@traceguard.io",
        "aliases": ["johndoe", "john-doe", "johndoe_dev"],
        "linked_emails": [
            "john.doe@gmail.com",
            "jdoe@techcorp.com",
        ],
        "linked_phones": ["+1-555-0142"],
    },
    "cross_references": [
        {
            "source": "GitHub",
            "target": "LinkedIn",
            "link_type": "username_similarity",
            "confidence": 85,
            "evidence": "Username 'johndoe' ↔ 'john-doe' (Levenshtein distance 1)",
        },
        {
            "source": "GitHub",
            "target": "Personal Blog",
            "link_type": "domain_match",
            "confidence": 92,
            "evidence": "GitHub profile links to johndoe.dev",
        },
        {
            "source": "LinkedIn",
            "target": "TechCrunch Article",
            "link_type": "employer_match",
            "confidence": 94,
            "evidence": "Both reference 'Senior Software Engineer at TechCorp'",
        },
        {
            "source": "Resume PDF",
            "target": "LinkedIn",
            "link_type": "data_overlap",
            "confidence": 97,
            "evidence": "Identical employment history and education records",
        },
        {
            "source": "Twitter / X",
            "target": "GitHub",
            "link_type": "bio_link",
            "confidence": 80,
            "evidence": "Twitter bio contains link to GitHub profile",
        },
        {
            "source": "Pastebin Dump",
            "target": "Adobe Breach",
            "link_type": "credential_reuse",
            "confidence": 72,
            "evidence": "Same email found in both; password hash pattern similar",
        },
    ],
    "timeline": [
        {"date": "2012-07-01", "event": "Dropbox breach", "severity": "MEDIUM"},
        {"date": "2013-10-04", "event": "Adobe breach", "severity": "HIGH"},
        {"date": "2015-06-20", "event": "LinkedIn profile created", "severity": "LOW"},
        {"date": "2017-01-08", "event": "Twitter account created", "severity": "LOW"},
        {"date": "2018-03-15", "event": "GitHub account created", "severity": "LOW"},
        {"date": "2019-05-24", "event": "Canva breach", "severity": "MEDIUM"},
        {"date": "2019-09-01", "event": "Personal blog launched", "severity": "LOW"},
        {"date": "2021-06-22", "event": "LinkedIn data scrape", "severity": "HIGH"},
        {"date": "2024-03-12", "event": "Pastebin credential dump", "severity": "CRITICAL"},
        {"date": "2024-11-20", "event": "IEEE paper published", "severity": "LOW"},
        {"date": "2026-07-01", "event": "Resume PDF indexed", "severity": "HIGH"},
    ],
}


def get_mock_breaches(email: str = "") -> list[dict[str, Any]]:
    """Return mock breach data, optionally filtering/customising by email."""
    breaches = [b.copy() for b in MOCK_BREACHES]
    for b in breaches:
        b["affectedEmail"] = email or "demo@traceguard.io"
    return breaches


def get_mock_social_profiles(username: str = "") -> list[dict[str, Any]]:
    """Return mock social profile data, customizing handles with target username."""
    handle = username or "johndoe"
    profiles = [p.copy() for p in MOCK_SOCIAL_PROFILES]
    for p in profiles:
        p["username"] = handle
        if p.get("profileUrl"):
            p["profileUrl"] = p["profileUrl"].replace("johndoe", handle).replace("john-doe", handle)
    return profiles


def get_mock_web_mentions() -> list[dict[str, Any]]:
    """Return mock web-mention / document data."""
    return [m.copy() for m in MOCK_WEB_MENTIONS]


def get_mock_correlations() -> dict[str, Any]:
    """Return mock correlation data."""
    import copy
    return copy.deepcopy(MOCK_CORRELATIONS)
