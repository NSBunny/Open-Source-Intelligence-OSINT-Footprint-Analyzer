"""
TraceGuard 2.0 — Dynamic Intelligence Data Generator
Generates email-specific, deterministic but varied OSINT data.
Different emails produce genuinely different results — different breaches,
different profiles, different risk scores.

Uses a hash of the email to seed selections so the same email always
returns consistent results, but different emails return different data.
"""

from __future__ import annotations
import hashlib
from typing import Any


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BREACH DATABASE — 12 real-world breaches to pick from
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL_BREACHES: list[dict[str, Any]] = [
    {
        "id": "breach-adobe-2013",
        "name": "Adobe",
        "domain": "adobe.com",
        "date": "2013-10-04",
        "severity": "HIGH",
        "pwnCount": 152_445_165,
        "dataClasses": ["Email addresses", "Password hints", "Passwords", "Usernames"],
        "description": "In October 2013, 153 million Adobe accounts were breached with encrypted passwords and password hints in plain text.",
        "logoUrl": "https://logo.clearbit.com/adobe.com",
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
        "dataClasses": ["Email addresses", "Passwords", "Phone numbers", "Professional details"],
        "description": "In June 2021, data scraped from 700M LinkedIn profiles was put up for sale including emails, phone numbers, and professional information.",
        "logoUrl": "https://logo.clearbit.com/linkedin.com",
        "isVerified": True,
        "isSensitive": True,
    },
    {
        "id": "breach-canva-2019",
        "name": "Canva",
        "domain": "canva.com",
        "date": "2019-05-24",
        "severity": "MEDIUM",
        "pwnCount": 137_272_116,
        "dataClasses": ["Email addresses", "Usernames", "Names", "Geographic locations"],
        "description": "In May 2019, Canva suffered a data breach impacting 137 million users with exposed emails, usernames, and bcrypt password hashes.",
        "logoUrl": "https://logo.clearbit.com/canva.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-dropbox-2012",
        "name": "Dropbox",
        "domain": "dropbox.com",
        "date": "2012-07-01",
        "severity": "MEDIUM",
        "pwnCount": 68_648_009,
        "dataClasses": ["Email addresses", "Passwords"],
        "description": "In mid-2012, Dropbox suffered a data breach exposing 68 million email addresses and salted hashes of passwords.",
        "logoUrl": "https://logo.clearbit.com/dropbox.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-twitter-2023",
        "name": "Twitter / X",
        "domain": "twitter.com",
        "date": "2023-01-05",
        "severity": "HIGH",
        "pwnCount": 209_595_668,
        "dataClasses": ["Email addresses", "Names", "Usernames", "Phone numbers"],
        "description": "In early 2023, over 200 million Twitter user records were leaked including email addresses, names, and usernames scraped via an API vulnerability.",
        "logoUrl": "https://logo.clearbit.com/twitter.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-myspace-2016",
        "name": "MySpace",
        "domain": "myspace.com",
        "date": "2016-05-31",
        "severity": "HIGH",
        "pwnCount": 359_420_698,
        "dataClasses": ["Email addresses", "Passwords", "Usernames"],
        "description": "In 2016, data from MySpace appeared with 360 million accounts including email addresses, usernames, and SHA-1 hashed passwords without salt.",
        "logoUrl": "https://logo.clearbit.com/myspace.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-zynga-2019",
        "name": "Zynga",
        "domain": "zynga.com",
        "date": "2019-09-12",
        "severity": "HIGH",
        "pwnCount": 172_869_660,
        "dataClasses": ["Email addresses", "Passwords", "Phone numbers", "Usernames"],
        "description": "In September 2019, game developer Zynga had 173 million records breached from Words With Friends players including emails and SHA-1 hashed passwords.",
        "logoUrl": "https://logo.clearbit.com/zynga.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-dubsmash-2019",
        "name": "Dubsmash",
        "domain": "dubsmash.com",
        "date": "2018-12-01",
        "severity": "MEDIUM",
        "pwnCount": 161_749_950,
        "dataClasses": ["Email addresses", "Names", "Passwords", "Usernames"],
        "description": "In December 2018, video messaging service Dubsmash had 162 million records exposed including email addresses and bcrypt password hashes.",
        "logoUrl": "https://logo.clearbit.com/dubsmash.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-marriott-2018",
        "name": "Marriott International",
        "domain": "marriott.com",
        "date": "2018-11-30",
        "severity": "CRITICAL",
        "pwnCount": 500_000_000,
        "dataClasses": ["Email addresses", "Passport numbers", "Credit cards", "Phone numbers", "Physical addresses"],
        "description": "In 2018, Marriott disclosed a breach of Starwood guest reservation database exposing up to 500 million guests' personal data including passport numbers.",
        "logoUrl": "https://logo.clearbit.com/marriott.com",
        "isVerified": True,
        "isSensitive": True,
    },
    {
        "id": "breach-facebook-2019",
        "name": "Facebook",
        "domain": "facebook.com",
        "date": "2019-04-03",
        "severity": "HIGH",
        "pwnCount": 533_000_000,
        "dataClasses": ["Email addresses", "Phone numbers", "Names", "Dates of birth", "Locations"],
        "description": "In April 2019, 533 million Facebook records were found exposed including phone numbers, names, and email addresses scraped via a platform vulnerability.",
        "logoUrl": "https://logo.clearbit.com/facebook.com",
        "isVerified": True,
        "isSensitive": True,
    },
    {
        "id": "breach-wattpad-2020",
        "name": "Wattpad",
        "domain": "wattpad.com",
        "date": "2020-06-29",
        "severity": "MEDIUM",
        "pwnCount": 270_784_079,
        "dataClasses": ["Email addresses", "Names", "Passwords", "Usernames", "IP addresses"],
        "description": "In June 2020, storytelling platform Wattpad had 271 million records exposed including email addresses, bcrypt hashed passwords, and IP addresses.",
        "logoUrl": "https://logo.clearbit.com/wattpad.com",
        "isVerified": True,
        "isSensitive": False,
    },
    {
        "id": "breach-cashapp-2022",
        "name": "Cash App",
        "domain": "cash.app",
        "date": "2022-04-04",
        "severity": "CRITICAL",
        "pwnCount": 8_200_000,
        "dataClasses": ["Financial data", "Names", "Brokerage account numbers", "Stock trading activity"],
        "description": "In April 2022, Block disclosed a breach of Cash App Investing by a former employee who downloaded reports containing customer names and brokerage data.",
        "logoUrl": "https://logo.clearbit.com/cash.app",
        "isVerified": True,
        "isSensitive": True,
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SOCIAL PROFILE TEMPLATES — 8 platforms to pick from
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL_SOCIAL_TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "social-github",
        "platform": "GitHub",
        "profileUrlTemplate": "https://github.com/{username}",
        "bio": "Developer • Open source contributor",
        "confidence": 92,
        "matchType": "username_exact",
    },
    {
        "id": "social-linkedin",
        "platform": "LinkedIn",
        "profileUrlTemplate": "https://linkedin.com/in/{username}",
        "bio": "Software Engineer | Tech Professional",
        "confidence": 88,
        "matchType": "email_verified",
    },
    {
        "id": "social-twitter",
        "platform": "Twitter / X",
        "profileUrlTemplate": "https://x.com/{username}",
        "bio": "Tweeting about tech & life",
        "confidence": 78,
        "matchType": "username_partial",
    },
    {
        "id": "social-instagram",
        "platform": "Instagram",
        "profileUrlTemplate": "https://instagram.com/{username}",
        "bio": "📸 Life through my lens",
        "confidence": 72,
        "matchType": "username_fuzzy",
    },
    {
        "id": "social-reddit",
        "platform": "Reddit",
        "profileUrlTemplate": "https://reddit.com/user/{username}",
        "bio": "Redditor since 2019",
        "confidence": 65,
        "matchType": "username_partial",
    },
    {
        "id": "social-stackoverflow",
        "platform": "Stack Overflow",
        "profileUrlTemplate": "https://stackoverflow.com/users/{username}",
        "bio": "Active contributor • Problem solver",
        "confidence": 85,
        "matchType": "email_match",
    },
    {
        "id": "social-medium",
        "platform": "Medium",
        "profileUrlTemplate": "https://medium.com/@{username}",
        "bio": "Writing about technology and innovation",
        "confidence": 70,
        "matchType": "username_fuzzy",
    },
    {
        "id": "social-devto",
        "platform": "DEV Community",
        "profileUrlTemplate": "https://dev.to/{username}",
        "bio": "Sharing knowledge with the dev community",
        "confidence": 82,
        "matchType": "username_exact",
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WEB MENTION TEMPLATES — 10 mention types to pick from
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL_WEB_MENTION_TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "mention-resume",
        "type": "document",
        "titleTemplate": "{name} — Resume (PDF)",
        "urlTemplate": "https://{username}.dev/resume.pdf",
        "source": "Personal Website",
        "snippetTemplate": "Resume contains full name, phone number, email address, and employment history for {name}.",
        "riskLevel": "HIGH",
        "sensitiveData": ["phone_number", "home_address", "email", "employment_history"],
        "confidence": 95,
    },
    {
        "id": "mention-hackernews",
        "type": "mention",
        "titleTemplate": "Discussion thread mentioning {username}",
        "urlTemplate": "https://news.ycombinator.com/user?id={username}",
        "source": "Hacker News",
        "snippetTemplate": "User '{username}' has active discussions about infrastructure setup and security configurations.",
        "riskLevel": "MEDIUM",
        "sensitiveData": ["network_config", "infrastructure_details"],
        "confidence": 82,
    },
    {
        "id": "mention-stackoverflow",
        "type": "mention",
        "titleTemplate": "Stack Overflow contributions by {username}",
        "urlTemplate": "https://stackoverflow.com/users/{username}",
        "source": "Stack Overflow",
        "snippetTemplate": "Active contributor with questions about cloud configuration, database tuning, and authentication patterns revealing technical stack.",
        "riskLevel": "LOW",
        "sensitiveData": ["tech_stack"],
        "confidence": 88,
    },
    {
        "id": "mention-pastebin",
        "type": "paste",
        "titleTemplate": "Credential dump containing {email}",
        "urlTemplate": "https://pastebin.com/REDACTED",
        "source": "Pastebin",
        "snippetTemplate": "Email '{email}' found in a credential dump with hashed password. Dump contains ~50k entries from an unknown breach.",
        "riskLevel": "CRITICAL",
        "sensitiveData": ["email", "password_hash"],
        "confidence": 97,
    },
    {
        "id": "mention-github-gist",
        "type": "document",
        "titleTemplate": "Public Gist by {username}",
        "urlTemplate": "https://gist.github.com/{username}",
        "source": "GitHub Gists",
        "snippetTemplate": "Public code gist contains configuration file with database connection strings and API endpoint references.",
        "riskLevel": "HIGH",
        "sensitiveData": ["api_keys", "database_config"],
        "confidence": 90,
    },
    {
        "id": "mention-court-records",
        "type": "document",
        "titleTemplate": "Public records search for {name}",
        "urlTemplate": "https://www.publicrecords.com/search/{username}",
        "source": "Public Records",
        "snippetTemplate": "Public records database lists address history, property records, and associated names for this identity.",
        "riskLevel": "HIGH",
        "sensitiveData": ["home_address", "property_records", "full_name"],
        "confidence": 75,
    },
    {
        "id": "mention-wayback",
        "type": "mention",
        "titleTemplate": "Archived web presence of {username}",
        "urlTemplate": "https://web.archive.org/web/*/{username}.com",
        "source": "Wayback Machine",
        "snippetTemplate": "Internet Archive has captured 47 snapshots of personal website between 2018-2026 showing evolution of online presence.",
        "riskLevel": "LOW",
        "sensitiveData": ["historical_data"],
        "confidence": 85,
    },
    {
        "id": "mention-telegram",
        "type": "mention",
        "titleTemplate": "Telegram channel mentioning {email}",
        "urlTemplate": "https://t.me/leaked_databases",
        "source": "Telegram",
        "snippetTemplate": "Email '{email}' referenced in a Telegram channel distributing leaked credential databases.",
        "riskLevel": "CRITICAL",
        "sensitiveData": ["email", "credentials"],
        "confidence": 93,
    },
    {
        "id": "mention-forum",
        "type": "mention",
        "titleTemplate": "Forum post by {username}",
        "urlTemplate": "https://forum.example.com/users/{username}",
        "source": "Tech Forum",
        "snippetTemplate": "User posted questions about home network setup revealing ISP, router model, and local network topology.",
        "riskLevel": "MEDIUM",
        "sensitiveData": ["network_config", "isp_info"],
        "confidence": 73,
    },
    {
        "id": "mention-academic",
        "type": "document",
        "titleTemplate": "Research paper co-authored by {name}",
        "urlTemplate": "https://scholar.google.com/citations?user={username}",
        "source": "Google Scholar",
        "snippetTemplate": "Academic publication lists institutional affiliation, co-author network, and research interests.",
        "riskLevel": "LOW",
        "sensitiveData": ["academic_affiliation", "co_authors"],
        "confidence": 91,
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DETERMINISTIC EMAIL-BASED SELECTOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _email_hash_int(email: str) -> int:
    """Get a deterministic integer from an email for seeding selections."""
    return int(hashlib.sha256(email.lower().strip().encode()).hexdigest(), 16)


def _pick_items(items: list, email: str, min_count: int, max_count: int) -> list:
    """Deterministically pick a subset of items based on email hash."""
    h = _email_hash_int(email)
    count = min_count + (h % (max_count - min_count + 1))
    # Shuffle deterministically based on email
    scored = [(item, (hash(email + str(i)) & 0xFFFFFFFF) % 10000) for i, item in enumerate(items)]
    scored.sort(key=lambda x: x[1])
    return [item for item, _ in scored[:count]]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PUBLIC API
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_mock_breaches(email: str = "") -> list[dict[str, Any]]:
    """Return email-specific breach data. Different emails get different breaches."""
    email = email or "demo@traceguard.io"
    selected = _pick_items(ALL_BREACHES, email, 2, 6)
    breaches = []
    for b in selected:
        entry = b.copy()
        entry["affectedEmail"] = email
        breaches.append(entry)
    return breaches


def get_mock_social_profiles(username: str = "", email: str = "") -> list[dict[str, Any]]:
    """Return email-specific social profile data."""
    handle = username or (email.split("@")[0] if email else "user")
    email = email or f"{handle}@gmail.com"
    selected = _pick_items(ALL_SOCIAL_TEMPLATES, email, 2, 5)
    
    h = _email_hash_int(email)
    profiles = []
    for i, tmpl in enumerate(selected):
        profile = {
            "id": tmpl["id"],
            "platform": tmpl["platform"],
            "username": handle,
            "profileUrl": tmpl["profileUrlTemplate"].format(username=handle),
            "avatarUrl": None,
            "bio": tmpl["bio"],
            "followers": 50 + ((h >> (i * 4)) % 2000),
            "following": 20 + ((h >> (i * 3)) % 500),
            "joinDate": f"20{15 + (h >> i) % 10}-{1 + (h >> (i+1)) % 12:02d}-{1 + (h >> (i+2)) % 28:02d}",
            "lastActive": "2026-07-15",
            "confidence": tmpl["confidence"],
            "matchType": tmpl["matchType"],
        }
        profiles.append(profile)
    return profiles


def get_mock_web_mentions(email: str = "", username: str = "") -> list[dict[str, Any]]:
    """Return email-specific web mention data."""
    email = email or "demo@traceguard.io"
    handle = username or email.split("@")[0]
    name = handle.replace(".", " ").replace("_", " ").replace("-", " ").title()
    
    selected = _pick_items(ALL_WEB_MENTION_TEMPLATES, email, 3, 7)
    
    mentions = []
    for tmpl in selected:
        mention = {
            "id": tmpl["id"],
            "type": tmpl["type"],
            "title": tmpl["titleTemplate"].format(name=name, username=handle, email=email),
            "url": tmpl["urlTemplate"].format(name=name, username=handle, email=email),
            "source": tmpl["source"],
            "snippet": tmpl["snippetTemplate"].format(name=name, username=handle, email=email),
            "dateFound": "2026-07-01",
            "riskLevel": tmpl["riskLevel"],
            "sensitiveData": tmpl["sensitiveData"],
            "confidence": tmpl["confidence"],
        }
        mentions.append(mention)
    return mentions


def get_mock_correlations(email: str = "", username: str = "") -> dict[str, Any]:
    """Return email-specific correlation data."""
    email = email or "demo@traceguard.io"
    handle = username or email.split("@")[0]
    
    breaches = get_mock_breaches(email)
    profiles = get_mock_social_profiles(handle, email)
    
    breach_events = [
        {"date": b["date"], "event": f"{b['name']} breach", "severity": b["severity"]}
        for b in breaches
    ]
    profile_events = [
        {"date": p.get("joinDate", "2020-01-01"), "event": f"{p['platform']} account created", "severity": "LOW"}
        for p in profiles
    ]
    
    timeline = sorted(breach_events + profile_events, key=lambda x: x["date"])
    
    cross_refs = []
    platform_names = [p["platform"] for p in profiles]
    for i in range(len(platform_names)):
        for j in range(i + 1, min(i + 2, len(platform_names))):
            cross_refs.append({
                "source": platform_names[i],
                "target": platform_names[j],
                "link_type": "username_similarity",
                "confidence": 70 + (_email_hash_int(email + str(i)) % 25),
                "evidence": f"Username '{handle}' found on both platforms",
            })
    
    return {
        "identity_cluster": {
            "primary_email": email,
            "aliases": [handle],
            "linked_emails": [],
            "linked_phones": [],
        },
        "cross_references": cross_refs,
        "timeline": timeline,
    }
