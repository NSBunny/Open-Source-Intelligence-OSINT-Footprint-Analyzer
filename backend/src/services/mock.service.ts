// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Comprehensive Mock Data Service
// Provides rich, realistic OSINT data when the Python engine
// is unavailable.  Everything here is fictional but plausible.
// ─────────────────────────────────────────────────────────────

import { v4 as uuid } from 'uuid';
import {
  BreachRecord,
  SocialProfile,
  WebMention,
  DataExposure,
  AttackVector,
  RemediationStep,
  TimelineEvent,
  SeverityLevel,
} from '../types';

// ── Breach Database ──────────────────────────────────────────

export function getMockBreaches(target: string): BreachRecord[] {
  const isDemo = target.toLowerCase().includes('demo') ||
                 target.toLowerCase().includes('traceguard');

  const breaches: BreachRecord[] = [
    {
      id: uuid(),
      name: 'Adobe',
      domain: 'adobe.com',
      breachDate: '2013-10-04',
      addedDate: '2013-12-04',
      modifiedDate: '2022-05-15',
      pwnCount: 152_445_165,
      description:
        'In October 2013, 153 million Adobe accounts were breached. The attack exposed ' +
        'customer IDs, usernames, emails, encrypted passwords and password hints in ' +
        'plaintext. The password cryptography was poorly implemented (3DES, ECB mode) ' +
        'enabling many passwords to be recovered.',
      dataClasses: [
        'Email addresses',
        'Password hints',
        'Passwords',
        'Usernames',
      ],
      isVerified: true,
      isSensitive: false,
      severity: 'HIGH',
      logoUrl: 'https://logo.clearbit.com/adobe.com',
    },
    {
      id: uuid(),
      name: 'Canva',
      domain: 'canva.com',
      breachDate: '2019-05-24',
      addedDate: '2019-06-18',
      modifiedDate: '2023-01-12',
      pwnCount: 137_272_116,
      description:
        'In May 2019, the graphic design tool Canva suffered a data breach that impacted ' +
        '137 million users. The exposed data included email addresses, usernames, names, ' +
        'cities of residence and bcrypt-hashed passwords. Canva prompted users to change ' +
        'passwords and revoked all OAuth tokens.',
      dataClasses: [
        'Email addresses',
        'Geographic locations',
        'Names',
        'Passwords',
        'Usernames',
      ],
      isVerified: true,
      isSensitive: false,
      severity: 'HIGH',
      logoUrl: 'https://logo.clearbit.com/canva.com',
    },
    {
      id: uuid(),
      name: 'LinkedIn',
      domain: 'linkedin.com',
      breachDate: '2021-06-22',
      addedDate: '2021-06-29',
      modifiedDate: '2023-08-05',
      pwnCount: 700_000_000,
      description:
        'In June 2021, data associated with 700 million LinkedIn users was scraped and ' +
        'posted for sale. While LinkedIn maintained this was not a breach but rather ' +
        'aggregation of publicly-available data, the dataset included email addresses, ' +
        'phone numbers, geolocation records, and inferred salaries.',
      dataClasses: [
        'Email addresses',
        'Phone numbers',
        'Geographic locations',
        'Job titles',
        'Professional skills',
        'Inferred salaries',
      ],
      isVerified: true,
      isSensitive: false,
      severity: 'MEDIUM',
      logoUrl: 'https://logo.clearbit.com/linkedin.com',
    },
    {
      id: uuid(),
      name: 'Dropbox',
      domain: 'dropbox.com',
      breachDate: '2012-07-01',
      addedDate: '2016-08-31',
      modifiedDate: '2022-11-20',
      pwnCount: 68_648_009,
      description:
        'In mid-2012, Dropbox suffered a data breach which was not publicly disclosed ' +
        'until 2016. The breach exposed 68 million unique email addresses alongside ' +
        'bcrypt and SHA-1 hashes of passwords. Dropbox forced password resets on all ' +
        'accounts that had not changed their credentials since 2012.',
      dataClasses: [
        'Email addresses',
        'Passwords',
      ],
      isVerified: true,
      isSensitive: false,
      severity: 'HIGH',
      logoUrl: 'https://logo.clearbit.com/dropbox.com',
    },
  ];

  // For non-demo targets, randomly include 1–3 of the breaches
  if (!isDemo) {
    const count = Math.floor(Math.random() * 3) + 1;
    return breaches.sort(() => Math.random() - 0.5).slice(0, count);
  }

  return breaches;
}

// ── Social Profiles ──────────────────────────────────────────

export function getMockSocialProfiles(target: string): SocialProfile[] {
  const username = target.split('@')[0] || target;

  return [
    {
      platform: 'GitHub',
      username: `${username}`,
      url: `https://github.com/${username}`,
      bio: 'Full-stack developer • Open source enthusiast • Building things that matter',
      followers: 342,
      following: 128,
      posts: 847,
      isVerified: false,
      lastActive: '2026-07-10T14:23:00Z',
      profileImageUrl: `https://avatars.githubusercontent.com/u/12345678`,
      metadata: {
        publicRepos: 47,
        publicGists: 12,
        joinedDate: '2018-03-15',
        company: 'Freelance',
        location: 'San Francisco, CA',
        hireable: true,
      },
    },
    {
      platform: 'LinkedIn',
      username: `${username}`,
      url: `https://linkedin.com/in/${username}`,
      bio: 'Senior Software Engineer | Cloud Architecture | DevSecOps',
      followers: 1_254,
      following: 430,
      posts: 23,
      isVerified: false,
      lastActive: '2026-07-08T09:15:00Z',
      profileImageUrl: `https://media.licdn.com/dms/image/placeholder.jpg`,
      metadata: {
        connections: '500+',
        endorsements: 38,
        recommendations: 7,
        industry: 'Information Technology',
        currentRole: 'Senior Software Engineer at TechCorp',
      },
    },
    {
      platform: 'Personal Blog',
      username: `${username}`,
      url: `https://${username}.dev`,
      bio: 'Writing about security, privacy, and the modern web',
      followers: 89,
      following: 0,
      posts: 156,
      isVerified: false,
      lastActive: '2026-06-28T18:40:00Z',
      metadata: {
        engine: 'Hugo',
        theme: 'PaperMod',
        totalPosts: 156,
        categories: 'security, privacy, web-dev, devops',
        rssSubscribers: 89,
      },
    },
  ];
}

// ── Web Mentions ─────────────────────────────────────────────

export function getMockWebMentions(target: string): WebMention[] {
  const username = target.split('@')[0] || target;

  return [
    {
      id: uuid(),
      title: `Open-Source Contribution Spotlight: ${username}`,
      url: 'https://dev.to/community/oss-spotlight-2026',
      source: 'DEV Community',
      snippet:
        `${username} has made significant contributions to several security-focused ` +
        'open-source projects, including a widely-adopted CSRF protection middleware ' +
        'and a secrets-scanning pre-commit hook.',
      publishedDate: '2026-05-14T10:00:00Z',
      sentiment: 'positive',
      relevanceScore: 0.92,
      category: 'Professional',
    },
    {
      id: uuid(),
      title: 'Conference Speaker List — SecureCon 2025',
      url: 'https://securecon.io/speakers/2025',
      source: 'SecureCon',
      snippet:
        `Talk: "Beyond Passwords — Passkeys in Production" by ${username}. ` +
        'A deep-dive into migrating legacy authentication systems to WebAuthn ' +
        'without breaking existing user flows.',
      publishedDate: '2025-11-02T08:00:00Z',
      sentiment: 'positive',
      relevanceScore: 0.87,
      category: 'Public Speaking',
    },
    {
      id: uuid(),
      title: 'Data Breach Notification Archive',
      url: 'https://haveibeenpwned.com/PwnedWebsites',
      source: 'Have I Been Pwned',
      snippet:
        `The email address associated with ${username} was found in 4 known data ` +
        'breaches spanning from 2012 to 2021, including the Adobe and LinkedIn incidents.',
      publishedDate: '2024-03-18T12:00:00Z',
      sentiment: 'negative',
      relevanceScore: 0.95,
      category: 'Security',
    },
    {
      id: uuid(),
      title: `GitHub Stars: Trending Repos This Week`,
      url: 'https://github.com/trending',
      source: 'GitHub',
      snippet:
        `A security utility authored by ${username} trended on GitHub this week, ` +
        'receiving 340+ stars in 7 days. The tool automates SSL certificate rotation ' +
        'for Kubernetes clusters.',
      publishedDate: '2026-06-20T16:30:00Z',
      sentiment: 'positive',
      relevanceScore: 0.78,
      category: 'Professional',
    },
    {
      id: uuid(),
      title: 'Paste Archive — Credential Dump #4821',
      url: 'https://pastebin.com/archive/4821',
      source: 'Pastebin Archive',
      snippet:
        `An email address matching ${username}\'s known aliases appeared in a combo ` +
        'list posted to an underground paste site. The list contained email:password ' +
        'pairs likely sourced from the 2019 Canva breach.',
      publishedDate: '2023-08-05T03:12:00Z',
      sentiment: 'negative',
      relevanceScore: 0.98,
      category: 'Threat Intelligence',
    },
  ];
}

// ── Sensitive Data Exposures ─────────────────────────────────

export function getMockDataExposures(target: string): DataExposure[] {
  return [
    {
      type: 'Email Address',
      value: target,
      source: 'Multiple breach databases',
      severity: 'MEDIUM',
      firstSeen: '2012-07-01',
      lastSeen: '2021-06-22',
      isRedacted: false,
    },
    {
      type: 'Password Hash (bcrypt)',
      value: '$2b$12$████████████████████████████████████████████',
      source: 'Dropbox breach (2012)',
      severity: 'HIGH',
      firstSeen: '2016-08-31',
      lastSeen: '2016-08-31',
      isRedacted: true,
    },
    {
      type: 'Password Hint',
      value: 'favorite pet + birth year',
      source: 'Adobe breach (2013)',
      severity: 'MEDIUM',
      firstSeen: '2013-12-04',
      lastSeen: '2013-12-04',
      isRedacted: false,
    },
    {
      type: 'IP Address',
      value: '198.51.███.███',
      source: 'LinkedIn scrape (2021)',
      severity: 'LOW',
      firstSeen: '2021-06-22',
      lastSeen: '2021-06-22',
      isRedacted: true,
    },
    {
      type: 'Phone Number',
      value: '+1 (███) ███-4827',
      source: 'LinkedIn scrape (2021)',
      severity: 'HIGH',
      firstSeen: '2021-06-22',
      lastSeen: '2021-06-22',
      isRedacted: true,
    },
    {
      type: 'Geographic Location',
      value: 'San Francisco, CA, United States',
      source: 'Canva breach + LinkedIn scrape',
      severity: 'LOW',
      firstSeen: '2019-05-24',
      lastSeen: '2021-06-22',
      isRedacted: false,
    },
  ];
}

// ── Attack Vectors ───────────────────────────────────────────

export function getMockAttackVectors(target: string): AttackVector[] {
  return [
    {
      name: 'Credential Stuffing',
      severity: 'HIGH',
      likelihood: 82,
      description:
        'Attackers use automated tools to test breached email/password combinations ' +
        'across hundreds of services. With 4 known breaches, there is a high probability ' +
        'that at least one credential pair has been reused on other platforms.',
      mitigations: [
        'Enable unique, strong passwords via a password manager',
        'Activate multi-factor authentication on all accounts',
        'Monitor login attempts for anomalous geolocation',
      ],
      relatedBreaches: ['Adobe', 'Dropbox', 'Canva'],
    },
    {
      name: 'Spear Phishing',
      severity: 'MEDIUM',
      likelihood: 65,
      description:
        'The combination of professional details (job title, company, location) from ' +
        'LinkedIn scrapes and personal interests from the blog creates a rich profile ' +
        'for crafting highly targeted phishing emails.',
      mitigations: [
        'Implement email authentication (SPF, DKIM, DMARC)',
        'Train on identifying social engineering tactics',
        'Use browser-based phishing detection extensions',
      ],
      relatedBreaches: ['LinkedIn'],
    },
    {
      name: 'Social Engineering',
      severity: 'MEDIUM',
      likelihood: 58,
      description:
        'Public social profiles and conference appearances provide enough personal ' +
        'context for an attacker to impersonate a colleague, recruiter, or conference ' +
        'organizer in a vishing (voice phishing) or pretexting attack.',
      mitigations: [
        'Limit publicly-shared personal information',
        'Verify unexpected contacts through a separate channel',
        'Establish out-of-band verification codes with key contacts',
      ],
    },
    {
      name: 'Account Takeover',
      severity: 'LOW',
      likelihood: 35,
      description:
        'If password hints (Adobe) or partial passwords are combined with OSINT about ' +
        'the target, an attacker may be able to reconstruct credentials or bypass ' +
        'knowledge-based authentication (KBA) security questions.',
      mitigations: [
        'Replace security questions with hardware tokens',
        'Monitor for unauthorized session creation',
        'Enable login notification alerts on all services',
      ],
      relatedBreaches: ['Adobe'],
    },
  ];
}

// ── Remediation Steps ────────────────────────────────────────

export function getMockRemediationSteps(): RemediationStep[] {
  return [
    {
      id: 1,
      priority: 'CRITICAL',
      title: 'Rotate All Breached Credentials Immediately',
      description:
        'Change passwords for Adobe, Canva, LinkedIn, and Dropbox accounts. ' +
        'Generate unique 20+ character passwords using a password manager. ' +
        'If any of these passwords were reused elsewhere, change those too.',
      effort: 'moderate',
      impact: 'high',
      category: 'Credential Hygiene',
      actionUrl: 'https://haveibeenpwned.com/',
    },
    {
      id: 2,
      priority: 'HIGH',
      title: 'Enable Multi-Factor Authentication Everywhere',
      description:
        'Activate MFA on all accounts, prioritizing email, financial, and cloud ' +
        'services. Prefer hardware security keys (FIDO2/WebAuthn) or authenticator ' +
        'apps over SMS-based 2FA, which is vulnerable to SIM-swapping.',
      effort: 'moderate',
      impact: 'high',
      category: 'Authentication Hardening',
    },
    {
      id: 3,
      priority: 'MEDIUM',
      title: 'Audit & Minimize Public Data Exposure',
      description:
        'Review LinkedIn privacy settings to restrict profile visibility. Remove or ' +
        'redact sensitive details (phone number, precise location) from public profiles. ' +
        'Consider using a dedicated "public" email address for conferences and open source.',
      effort: 'minimal',
      impact: 'medium',
      category: 'Privacy Hardening',
    },
    {
      id: 4,
      priority: 'MEDIUM',
      title: 'Set Up Continuous Breach Monitoring',
      description:
        'Subscribe to breach notification services (Have I Been Pwned, Firefox Monitor) ' +
        'for all known email addresses. Configure alerts for instant notification when ' +
        'new exposures are detected.',
      effort: 'minimal',
      impact: 'medium',
      category: 'Ongoing Monitoring',
      actionUrl: 'https://haveibeenpwned.com/NotifyMe',
    },
    {
      id: 5,
      priority: 'LOW',
      title: 'Request Data Deletion from Breached Services',
      description:
        'Exercise your right to erasure (GDPR Art. 17 / CCPA) with Adobe, Canva, and ' +
        'Dropbox to ensure legacy data is purged from their systems. Document your ' +
        'requests and follow up after 30 days.',
      effort: 'significant',
      impact: 'low',
      category: 'Data Minimization',
    },
  ];
}

// ── Timeline Events ──────────────────────────────────────────

export function getMockTimeline(target: string): TimelineEvent[] {
  const username = target.split('@')[0] || target;

  const timeline: TimelineEvent[] = [
    {
      date: '2012-07-01',
      type: 'breach',
      title: 'Dropbox Data Breach',
      description: '68 million accounts compromised. Target email found in dataset.',
      severity: 'HIGH',
      source: 'Dropbox',
    },
    {
      date: '2013-10-04',
      type: 'breach',
      title: 'Adobe Data Breach',
      description: '152 million accounts exposed including password hints in plaintext.',
      severity: 'HIGH',
      source: 'Adobe',
    },
    {
      date: '2018-03-15',
      type: 'profile_update',
      title: 'GitHub Account Created',
      description: `${username} created a GitHub profile and began contributing to open-source projects.`,
      severity: 'INFO',
      source: 'GitHub',
    },
    {
      date: '2019-05-24',
      type: 'breach',
      title: 'Canva Data Breach',
      description: '137 million accounts exposed. Target email found with bcrypt hashed password.',
      severity: 'MEDIUM',
      source: 'Canva',
    },
    {
      date: '2020-09-10',
      type: 'profile_update',
      title: 'LinkedIn Profile Created',
      description: 'Public profile registered under name matching target footprint.',
      severity: 'INFO',
      source: 'LinkedIn',
    },
    {
      date: '2021-06-22',
      type: 'breach',
      title: 'LinkedIn Scraped Dataset',
      description: '700 million users scraped. Data contains target email, phone number, and employer info.',
      severity: 'HIGH',
      source: 'LinkedIn Scraper',
    },
    {
      date: '2024-11-12',
      type: 'exposure',
      title: 'Sensitive PDF Indexed',
      description: 'Resume PDF containing personal contact details indexed by search engine crawler.',
      severity: 'MEDIUM',
      source: 'Google Search',
    },
    {
      date: '2025-02-28',
      type: 'mention',
      title: 'Conference Speaker Profile Published',
      description: `${username} listed as speaker at SecureCon 2025, increasing public profile visibility.`,
      severity: 'LOW',
      source: 'SecureCon',
    },
    {
      date: '2026-05-14',
      type: 'mention',
      title: 'Open-Source Contribution Spotlight',
      description: 'DEV Community published article highlighting security contributions.',
      severity: 'INFO',
      source: 'DEV Community',
    },
    {
      date: '2026-06-20',
      type: 'mention',
      title: 'Repository Trending on GitHub',
      description: `Security utility by ${username} received 340+ stars in one week.`,
      severity: 'INFO',
      source: 'GitHub',
    },
  ];

  return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
