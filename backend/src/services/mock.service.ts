// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Comprehensive Dynamic Mock Data Service
// Provides rich, realistic, target-seeded OSINT data so every email
// target receives unique and consistent scan findings.
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
} from '../types';

// Deterministic seed generator for a target string
function getSeed(target: string): number {
  let hash = 0;
  const str = target.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Master breach pool
const ALL_BREACHES: Omit<BreachRecord, 'id'>[] = [
  {
    name: 'Adobe',
    domain: 'adobe.com',
    breachDate: '2013-10-04',
    addedDate: '2013-12-04',
    modifiedDate: '2022-05-15',
    pwnCount: 152_445_165,
    description:
      'In October 2013, 153 million Adobe accounts were breached. The attack exposed ' +
      'customer IDs, usernames, emails, encrypted passwords and password hints in plaintext.',
    dataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames'],
    isVerified: true,
    isSensitive: false,
    severity: 'HIGH',
    logoUrl: 'https://logo.clearbit.com/adobe.com',
  },
  {
    name: 'Canva',
    domain: 'canva.com',
    breachDate: '2019-05-24',
    addedDate: '2019-06-18',
    modifiedDate: '2023-01-12',
    pwnCount: 137_272_116,
    description:
      'In May 2019, graphic design platform Canva suffered a breach impacting 137 million users. ' +
      'Exposed data included email addresses, usernames, names, and bcrypt-hashed passwords.',
    dataClasses: ['Email addresses', 'Geographic locations', 'Names', 'Passwords', 'Usernames'],
    isVerified: true,
    isSensitive: false,
    severity: 'HIGH',
    logoUrl: 'https://logo.clearbit.com/canva.com',
  },
  {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    breachDate: '2021-06-22',
    addedDate: '2021-06-29',
    modifiedDate: '2023-08-05',
    pwnCount: 700_000_000,
    description:
      'In June 2021, data associated with 700 million LinkedIn users was scraped and posted for sale. ' +
      'Data included emails, phone numbers, geolocation records, and employment info.',
    dataClasses: ['Email addresses', 'Phone numbers', 'Geographic locations', 'Job titles', 'Professional skills'],
    isVerified: true,
    isSensitive: false,
    severity: 'MEDIUM',
    logoUrl: 'https://logo.clearbit.com/linkedin.com',
  },
  {
    name: 'Dropbox',
    domain: 'dropbox.com',
    breachDate: '2012-07-01',
    addedDate: '2016-08-31',
    modifiedDate: '2022-11-20',
    pwnCount: 68_648_009,
    description:
      'In mid-2012, Dropbox suffered a breach exposing 68 million unique email addresses alongside ' +
      'bcrypt and SHA-1 hashes of passwords.',
    dataClasses: ['Email addresses', 'Passwords'],
    isVerified: true,
    isSensitive: false,
    severity: 'HIGH',
    logoUrl: 'https://logo.clearbit.com/dropbox.com',
  },
  {
    name: 'Twitter (X)',
    domain: 'twitter.com',
    breachDate: '2023-01-04',
    addedDate: '2023-01-06',
    modifiedDate: '2023-05-10',
    pwnCount: 220_000_000,
    description:
      'In January 2023, 220 million Twitter user records were leaked on hacker forums containing ' +
      'email addresses, account handles, creation dates, and follower metrics.',
    dataClasses: ['Email addresses', 'Usernames', 'Account creation dates', 'Follower counts'],
    isVerified: true,
    isSensitive: false,
    severity: 'MEDIUM',
    logoUrl: 'https://logo.clearbit.com/twitter.com',
  },
  {
    name: 'Wattpad',
    domain: 'wattpad.com',
    breachDate: '2020-06-29',
    addedDate: '2020-07-25',
    modifiedDate: '2022-04-18',
    pwnCount: 268_745_252,
    description:
      'In June 2020, storytelling platform Wattpad suffered a breach exposing 268 million records ' +
      'including credentials, names, IP addresses, and birth dates.',
    dataClasses: ['Email addresses', 'Passwords', 'IP addresses', 'Dates of birth', 'Usernames'],
    isVerified: true,
    isSensitive: false,
    severity: 'HIGH',
    logoUrl: 'https://logo.clearbit.com/wattpad.com',
  },
  {
    name: 'MyFitnessPal',
    domain: 'myfitnesspal.com',
    breachDate: '2018-02-01',
    addedDate: '2018-03-29',
    modifiedDate: '2021-10-12',
    pwnCount: 143_612_450,
    description:
      'In February 2018, Under Armour revealed 150 million MyFitnessPal accounts were compromised, ' +
      'exposing usernames, email addresses, and SHA-1 password hashes.',
    dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
    isVerified: true,
    isSensitive: false,
    severity: 'MEDIUM',
    logoUrl: 'https://logo.clearbit.com/myfitnesspal.com',
  },
  {
    name: 'Zynga',
    domain: 'zynga.com',
    breachDate: '2019-09-01',
    addedDate: '2019-12-19',
    modifiedDate: '2022-03-01',
    pwnCount: 172_869_721,
    description:
      'In September 2019, game developer Zynga was breached, exposing 173 million account details ' +
      'including salted SHA-1 password hashes.',
    dataClasses: ['Email addresses', 'Passwords', 'Usernames', 'Phone numbers'],
    isVerified: true,
    isSensitive: false,
    severity: 'HIGH',
    logoUrl: 'https://logo.clearbit.com/zynga.com',
  },
  {
    name: 'Ticketmaster',
    domain: 'ticketmaster.com',
    breachDate: '2024-05-27',
    addedDate: '2024-06-01',
    modifiedDate: '2024-06-15',
    pwnCount: 560_000_000,
    description:
      'In May 2024, ShinyHunters posted 560 million Ticketmaster customer records stolen from ' +
      'Snowflake cloud databases containing customer contacts and partial payment card info.',
    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Payment history', 'Partial credit cards'],
    isVerified: true,
    isSensitive: true,
    severity: 'CRITICAL',
    logoUrl: 'https://logo.clearbit.com/ticketmaster.com',
  },
  {
    name: 'AT&T Data Leak',
    domain: 'att.com',
    breachDate: '2024-03-30',
    addedDate: '2024-04-05',
    modifiedDate: '2024-05-20',
    pwnCount: 73_000_000,
    description:
      'In March 2024, AT&T confirmed data from 73 million current and former account holders ' +
      'was released on the dark web, containing SSNs, passcodes, emails, and home addresses.',
    dataClasses: ['Email addresses', 'Social Security Numbers', 'Passcodes', 'Physical addresses'],
    isVerified: true,
    isSensitive: true,
    severity: 'CRITICAL',
    logoUrl: 'https://logo.clearbit.com/att.com',
  },
];

// ── Breach Database (Seeded) ─────────────────────────────────

export function getMockBreaches(target: string): BreachRecord[] {
  const seed = getSeed(target);
  const count = (seed % 4) + 2; // 2 to 5 breaches per target
  const result: BreachRecord[] = [];
  const pool = [...ALL_BREACHES];

  let currentSeed = seed;
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = currentSeed % pool.length;
    const breach = pool.splice(index, 1)[0];
    result.push({
      ...breach,
      id: uuid(),
    });
    currentSeed = Math.floor(currentSeed / 3) + 11;
  }

  return result;
}

// ── Social Profiles (Seeded) ─────────────────────────────────

export function getMockSocialProfiles(target: string): SocialProfile[] {
  const seed = getSeed(target);
  const username = target.split('@')[0] || target;
  const domain = target.split('@')[1] || 'dev';

  const locations = [
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Seattle, WA',
    'London, UK',
    'Berlin, Germany',
    'Toronto, Canada',
  ];

  return [
    {
      platform: 'GitHub',
      username: username,
      url: `https://github.com/${username}`,
      bio: `Software engineer & OSINT explorer • Building web applications`,
      followers: 50 + (seed % 950),
      following: 30 + (seed % 300),
      posts: 40 + (seed % 600),
      isVerified: seed % 7 === 0,
      lastActive: new Date(Date.now() - (seed % 14) * 86400000).toISOString(),
      profileImageUrl: `https://avatars.githubusercontent.com/u/${1000000 + (seed % 8000000)}`,
      metadata: {
        publicRepos: 12 + (seed % 45),
        publicGists: 2 + (seed % 15),
        joinedDate: `${2016 + (seed % 7)}-0${(seed % 8) + 1}-15`,
        company: seed % 2 === 0 ? 'Tech Corp' : 'Freelance',
        location: locations[seed % locations.length],
        hireable: seed % 2 === 0,
      },
    },
    {
      platform: 'LinkedIn',
      username: username,
      url: `https://linkedin.com/in/${username}`,
      bio: `Professional in Technology | ${domain}`,
      followers: 250 + (seed % 2800),
      following: 150 + (seed % 600),
      posts: 5 + (seed % 40),
      isVerified: false,
      lastActive: new Date(Date.now() - (seed % 5) * 86400000).toISOString(),
      metadata: {
        connections: `${300 + (seed % 700)}+`,
        industry: 'Information Technology',
        location: locations[seed % locations.length],
      },
    },
    {
      platform: 'Twitter / X',
      username: username,
      url: `https://x.com/${username}`,
      bio: `Tech, security, and digital identity.`,
      followers: 70 + (seed % 1200),
      following: 120 + (seed % 500),
      posts: 80 + (seed % 800),
      isVerified: seed % 5 === 0,
      lastActive: new Date(Date.now() - (seed % 3) * 86400000).toISOString(),
    },
  ];
}

// ── Web Mentions (Seeded) ────────────────────────────────────

export function getMockWebMentions(target: string): WebMention[] {
  const seed = getSeed(target);
  const username = target.split('@')[0] || target;

  return [
    {
      id: uuid(),
      title: `Developer Profile & Activity: ${username}`,
      url: `https://dev.to/${username}`,
      source: 'DEV Community',
      snippet: `${username} has published developer writeups and contributions in open-source security topics.`,
      publishedDate: new Date(Date.now() - (seed % 40) * 86400000).toISOString(),
      sentiment: 'positive',
      relevanceScore: 0.88 + ((seed % 10) / 100),
      category: 'Professional',
    },
    {
      id: uuid(),
      title: `Data Breach Archive Listing`,
      url: 'https://haveibeenpwned.com/PwnedWebsites',
      source: 'Have I Been Pwned',
      snippet: `Target email ${target} was indexed in public credential leak databases.`,
      publishedDate: new Date(Date.now() - (seed % 90) * 86400000).toISOString(),
      sentiment: 'negative',
      relevanceScore: 0.96,
      category: 'Security',
    },
  ];
}

// ── Sensitive Data Exposures (Seeded) ────────────────────────

export function getMockDataExposures(target: string): DataExposure[] {
  const seed = getSeed(target);
  const breaches = getMockBreaches(target);

  const exposures: DataExposure[] = [
    {
      type: 'Email Address',
      value: target,
      source: breaches.map((b) => b.name).join(', ') || 'Breach Database',
      severity: 'MEDIUM',
      firstSeen: breaches[0]?.breachDate || '2016-01-01',
      lastSeen: breaches[breaches.length - 1]?.breachDate || '2023-01-01',
      isRedacted: false,
    },
  ];

  if (breaches.some((b) => b.dataClasses.includes('Passwords'))) {
    const hashType = seed % 2 === 0 ? 'bcrypt' : 'SHA-1';
    exposures.push({
      type: `Password Hash (${hashType})`,
      value: `$2b$12$${(seed.toString(16) + '0123456789abcdef').slice(0, 24)}████████`,
      source: (breaches.find((b) => b.dataClasses.includes('Passwords'))?.name || 'Breach') + ' data leak',
      severity: 'HIGH',
      firstSeen: breaches[0]?.breachDate || '2018-05-10',
      lastSeen: '2023-01-01',
      isRedacted: true,
    });
  }

  if (seed % 2 === 0 || breaches.some((b) => b.dataClasses.includes('Phone numbers'))) {
    exposures.push({
      type: 'Phone Number',
      value: `+1 (${200 + (seed % 700)}) ${200 + (seed % 700)}-████`,
      source: 'Scraped Directory / Breach Records',
      severity: 'HIGH',
      firstSeen: '2021-06-22',
      lastSeen: '2024-01-10',
      isRedacted: true,
    });
  }

  if (seed % 3 === 0 || breaches.some((b) => b.dataClasses.includes('Geographic locations'))) {
    const cities = [
      'San Francisco, CA, United States',
      'New York, NY, United States',
      'Austin, TX, United States',
      'Seattle, WA, United States',
      'London, United Kingdom',
    ];
    exposures.push({
      type: 'Geographic Location',
      value: cities[seed % cities.length],
      source: 'Social Profile Scraping & Breach Data',
      severity: 'LOW',
      firstSeen: '2019-05-24',
      lastSeen: '2024-02-15',
      isRedacted: false,
    });
  }

  return exposures;
}

// ── Attack Vectors (Seeded) ──────────────────────────────────

export function getMockAttackVectors(target: string): AttackVector[] {
  const seed = getSeed(target);
  const breaches = getMockBreaches(target);
  const breachNames = breaches.map((b) => b.name);

  return [
    {
      name: 'Credential Stuffing',
      severity: 'HIGH',
      likelihood: Math.min(95, 65 + (seed % 30)),
      description:
        `Automated testing of compromised credentials from ${breachNames.join(', ')} ` +
        `across web services to exploit password reuse.`,
      mitigations: [
        'Enable unique passwords for all services using a password manager',
        'Activate multi-factor authentication (MFA) across all accounts',
        'Monitor login alerts for unauthorized location access',
      ],
      relatedBreaches: breachNames,
    },
    {
      name: 'Spear Phishing & Social Engineering',
      severity: 'MEDIUM',
      likelihood: Math.min(90, 50 + (seed % 35)),
      description:
        `Targeted phishing campaigns leveraging public profile data and exposed email address ${target}.`,
      mitigations: [
        'Verify unexpected requests through an independent channel',
        'Enable anti-phishing protections in your email workspace',
      ],
      relatedBreaches: breachNames.slice(0, 2),
    },
    {
      name: 'Account Takeover (ATO)',
      severity: seed % 2 === 0 ? 'HIGH' : 'MEDIUM',
      likelihood: 40 + (seed % 35),
      description:
        `Combines exposed password hashes and personal data to attempt unauthorized session takeover.`,
      mitigations: [
        'Enforce biometric or FIDO2 hardware passkeys',
        'Revoke active sessions periodically across all platforms',
      ],
      relatedBreaches: breachNames,
    },
  ];
}

// ── Remediation Steps ────────────────────────────────────────

export function getMockRemediationSteps(): RemediationStep[] {
  return [
    {
      id: 1,
      priority: 'CRITICAL',
      title: 'Rotate All Breached Passwords',
      description:
        'Change passwords for any accounts associated with compromised breaches immediately. Generate 16+ character unique passwords.',
      effort: 'moderate',
      impact: 'high',
      category: 'Credential Hygiene',
      actionUrl: 'https://haveibeenpwned.com/',
    },
    {
      id: 2,
      priority: 'HIGH',
      title: 'Enable Two-Factor Authentication (2FA)',
      description:
        'Activate 2FA using an authenticator app (e.g. Google Authenticator, Bitwarden) on critical email and banking accounts.',
      effort: 'minimal',
      impact: 'high',
      category: 'Authentication Hardening',
    },
    {
      id: 3,
      priority: 'MEDIUM',
      title: 'Set Up Continuous Breach Monitoring',
      description:
        'Monitor your email address for new data breaches using Have I Been Pwned or Firefox Monitor.',
      effort: 'minimal',
      impact: 'medium',
      category: 'Ongoing Monitoring',
      actionUrl: 'https://haveibeenpwned.com/NotifyMe',
    },
  ];
}

// ── Timeline Events (Seeded) ─────────────────────────────────

export function getMockTimeline(target: string): TimelineEvent[] {
  const seed = getSeed(target);
  const breaches = getMockBreaches(target);
  const username = target.split('@')[0] || target;

  const events: TimelineEvent[] = breaches.map((b) => ({
    date: b.breachDate,
    type: 'breach',
    title: `${b.name} Data Breach`,
    description: `Credentials exposed in ${b.name} breach (${b.pwnCount.toLocaleString()} total accounts).`,
    severity: b.severity,
    source: b.name,
  }));

  events.push({
    date: `${2017 + (seed % 5)}-0${(seed % 8) + 1}-10`,
    type: 'profile_update',
    title: 'Developer Profile Indexed',
    description: `Public activity indexed for handle "${username}".`,
    severity: 'INFO',
    source: 'GitHub',
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
