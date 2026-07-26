import type { ScanResult } from "@/types";

// Comprehensive mock data for demo@traceguard.io
// Used when backend is unavailable (standalone frontend mode)
export function getMockScanResult(scanId: string, targetEmail?: string): ScanResult {
  const email = targetEmail || "demo@traceguard.io";
  const username = email.split("@")[0] || "user";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return {
    id: scanId,
    query: {
      email: email,
      name: displayName,
      username: username,
    },
    status: "complete",
    progress: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),

    riskScore: {
      score: 72,
      category: "HIGH",
      breakdown: {
        breachSeverity: 82,
        sensitiveData: 70,
        publicMentions: 65,
        profileCorrelation: 58,
        confidence: 75,
      },
      methodology: "Score = 0.35×Breach + 0.25×Data + 0.20×Mentions + 0.10×Correlation + 0.10×Confidence",
    },

    breaches: [
      {
        id: "b1",
        name: "Adobe",
        date: "2013-10-04",
        severity: "high",
        dataClasses: ["Email addresses", "Passwords", "Password hints", "Usernames"],
        pwnCount: 152445165,
        description: "153 million Adobe accounts exposed including poorly encrypted passwords and password hints.",
      },
      {
        id: "b2",
        name: "LinkedIn",
        date: "2021-06-22",
        severity: "high",
        dataClasses: ["Email addresses", "Passwords", "Phone numbers", "Professional info"],
        pwnCount: 700000000,
        description: "700 million LinkedIn records scraped and sold including emails, phone numbers, and professional data.",
      },
      {
        id: "b3",
        name: "Canva",
        date: "2019-05-24",
        severity: "medium",
        dataClasses: ["Email addresses", "Usernames", "Names", "Passwords"],
        pwnCount: 137272116,
        description: "137 million Canva user accounts exposed including bcrypt-hashed passwords.",
      },
      {
        id: "b4",
        name: "Dropbox",
        date: "2012-07-01",
        severity: "medium",
        dataClasses: ["Email addresses", "Passwords"],
        pwnCount: 68648009,
        description: "68 million Dropbox accounts exposed with bcrypt and SHA-1 hashed passwords.",
      },
    ],

    socialProfiles: [
      {
        id: "sp1",
        platform: "GitHub",
        username: username,
        profileUrl: `https://github.com/${username}`,
        displayName: displayName,
        bio: "Full-stack developer | Open source contributor",
        followers: 342,
        confidence: 92,
      },
      {
        id: "sp2",
        platform: "LinkedIn",
        username: username,
        profileUrl: `https://linkedin.com/in/${username}`,
        displayName: displayName,
        bio: "Software Engineer at Tech Corp | B.Tech CS",
        followers: 500,
        confidence: 88,
      },
      {
        id: "sp3",
        platform: "Personal Blog",
        username: username,
        profileUrl: `https://${username}.dev`,
        displayName: `${displayName}'s Blog`,
        bio: "Tech blog with tutorials and project showcases",
        confidence: 75,
      },
    ],

    webMentions: [
      {
        id: "wm1",
        title: `${displayName}_Resume_2024.pdf`,
        url: `https://${username}.dev/resume.pdf`,
        snippet: "Public resume PDF containing email, phone number, and address.",
        source: "University",
        type: "pdf",
        foundDate: "2024-01-15",
      },
      {
        id: "wm2",
        title: "Forum Discussion — Stack Overflow",
        url: `https://stackoverflow.com/users/${username}`,
        snippet: "Active Stack Overflow profile linked to same email address.",
        source: "Stack Overflow",
        type: "forum",
        foundDate: "2020-03-10",
      },
      {
        id: "wm3",
        title: "Tech Conference Speaker List",
        url: "https://techconf.io/speakers/2023",
        snippet: "Listed as conference speaker with bio and contact information.",
        source: "Conference",
        type: "news",
        foundDate: "2023-09-05",
      },
      {
        id: "wm4",
        title: "Academic Paper — IEEE",
        url: "https://ieee.org/papers/doe-2022",
        snippet: "Co-authored paper with university email and affiliation disclosed.",
        source: "IEEE",
        type: "academic",
        foundDate: "2022-06-20",
      },
      {
        id: "wm5",
        title: "Pastebin Dump",
        url: "https://pastebin.com/raw/abc123",
        snippet: "Email found in a credential dump paste alongside hashed passwords.",
        source: "Pastebin",
        type: "social",
        foundDate: "2023-11-01",
      },
    ],

    timeline: [
      {
        id: "t1",
        date: "2012-07-01",
        title: "Dropbox Breach",
        description: "Email and hashed password exposed in Dropbox data breach",
        type: "breach",
        severity: "medium",
        icon: "🔓",
      },
      {
        id: "t2",
        date: "2013-10-04",
        title: "Adobe Breach",
        description: "Account compromised in massive Adobe breach — encrypted passwords leaked",
        type: "breach",
        severity: "high",
        icon: "🔓",
      },
      {
        id: "t3",
        date: "2019-05-24",
        title: "Canva Breach",
        description: "Account data exposed including username and hashed password",
        type: "breach",
        severity: "medium",
        icon: "🔓",
      },
      {
        id: "t4",
        date: "2020-03-10",
        title: "GitHub Profile Created",
        description: "Public GitHub profile created with matching username 'johndoe'",
        type: "profile",
        severity: "low",
        icon: "👤",
      },
      {
        id: "t5",
        date: "2020-06-15",
        title: "Stack Overflow Account",
        description: "Stack Overflow profile linked with same email address",
        type: "profile",
        severity: "low",
        icon: "👤",
      },
      {
        id: "t6",
        date: "2021-06-22",
        title: "LinkedIn Breach",
        description: "700M records scraped — professional data, email, and phone exposed",
        type: "breach",
        severity: "high",
        icon: "🔓",
      },
      {
        id: "t7",
        date: "2022-06-20",
        title: "IEEE Paper Published",
        description: "Academic paper published with university email and affiliation",
        type: "mention",
        severity: "low",
        icon: "🔍",
      },
      {
        id: "t8",
        date: "2023-11-01",
        title: "Pastebin Credential Dump",
        description: "Email found in credential dump on Pastebin",
        type: "mention",
        severity: "high",
        icon: "📋",
      },
      {
        id: "t9",
        date: "2024-01-15",
        title: "Public Resume Found",
        description: "PDF resume with personal details found indexed by search engines",
        type: "mention",
        severity: "medium",
        icon: "📄",
      },
    ],

    graph: {
      nodes: [
        // Identity (center)
        {
          id: "identity",
          type: "custom",
          position: { x: 400, y: 300 },
          data: { label: email, nodeType: "identity", risk: "high", details: "Primary Identity" },
        },
        // Breaches (left)
        {
          id: "breach-adobe",
          type: "custom",
          position: { x: 80, y: 120 },
          data: { label: "Adobe (2013)", nodeType: "breach", risk: "high", details: "152M records", platform: "breach" },
        },
        {
          id: "breach-linkedin",
          type: "custom",
          position: { x: 80, y: 260 },
          data: { label: "LinkedIn (2021)", nodeType: "breach", risk: "critical", details: "700M records", platform: "breach" },
        },
        {
          id: "breach-canva",
          type: "custom",
          position: { x: 80, y: 400 },
          data: { label: "Canva (2019)", nodeType: "breach", risk: "moderate", details: "137M records", platform: "breach" },
        },
        {
          id: "breach-dropbox",
          type: "custom",
          position: { x: 80, y: 520 },
          data: { label: "Dropbox (2012)", nodeType: "breach", risk: "moderate", details: "68M records", platform: "breach" },
        },
        // Social (right)
        {
          id: "social-github",
          type: "custom",
          position: { x: 720, y: 140 },
          data: { label: "GitHub", nodeType: "platform", risk: "safe", details: `@${username} · 342 followers`, platform: "github" },
        },
        {
          id: "social-linkedin",
          type: "custom",
          position: { x: 720, y: 300 },
          data: { label: "LinkedIn", nodeType: "platform", risk: "moderate", details: `${username} · 500+ connections`, platform: "linkedin" },
        },
        {
          id: "social-blog",
          type: "custom",
          position: { x: 720, y: 460 },
          data: { label: "Personal Blog", nodeType: "platform", risk: "safe", details: `${username}.dev`, platform: "blog" },
        },
        // Mentions (bottom)
        {
          id: "mention-resume",
          type: "custom",
          position: { x: 250, y: 560 },
          data: { label: "Public Resume", nodeType: "document", risk: "high", details: "PDF with PII", platform: "document" },
        },
        {
          id: "mention-stackoverflow",
          type: "custom",
          position: { x: 420, y: 550 },
          data: { label: "Stack Overflow", nodeType: "mention", risk: "safe", details: "Active profile", platform: "mention" },
        },
        {
          id: "mention-pastebin",
          type: "custom",
          position: { x: 570, y: 560 },
          data: { label: "Pastebin Dump", nodeType: "mention", risk: "critical", details: "Credential dump", platform: "mention" },
        },
      ],
      edges: [
        // Identity → Breaches
        { id: "e1", source: "identity", target: "breach-adobe", label: "🔓 password leaked", animated: true, style: { stroke: "#ef4444", strokeWidth: 2 } },
        { id: "e2", source: "identity", target: "breach-linkedin", label: "📧 email + phone", animated: true, style: { stroke: "#dc2626", strokeWidth: 2 } },
        { id: "e3", source: "identity", target: "breach-canva", label: "📧 email found", animated: false, style: { stroke: "#f59e0b", strokeWidth: 1.5 } },
        { id: "e4", source: "identity", target: "breach-dropbox", label: "🔓 password leaked", animated: false, style: { stroke: "#f59e0b", strokeWidth: 1.5 } },
        // Identity → Social
        { id: "e5", source: "identity", target: "social-github", label: "👤 username match", animated: false, style: { stroke: "#10b981", strokeWidth: 1.5 } },
        { id: "e6", source: "identity", target: "social-linkedin", label: "📧 email match", animated: false, style: { stroke: "#f59e0b", strokeWidth: 1.5 } },
        { id: "e7", source: "identity", target: "social-blog", label: "👤 username match", animated: false, style: { stroke: "#10b981", strokeWidth: 1.5 } },
        // Identity → Mentions
        { id: "e8", source: "identity", target: "mention-resume", label: "📄 PII exposed", animated: true, style: { stroke: "#ef4444", strokeWidth: 2 } },
        { id: "e9", source: "identity", target: "mention-stackoverflow", label: "📧 email linked", animated: false, style: { stroke: "#10b981", strokeWidth: 1 } },
        { id: "e10", source: "identity", target: "mention-pastebin", label: "🔓 credentials dumped", animated: true, style: { stroke: "#dc2626", strokeWidth: 2 } },
        // Cross-references
        { id: "e11", source: "social-github", target: "social-blog", label: "same username", animated: false, style: { stroke: "#06b6d4", strokeWidth: 1 } },
        { id: "e12", source: "breach-linkedin", target: "social-linkedin", label: "profile correlation", animated: false, style: { stroke: "#8b5cf6", strokeWidth: 1 } },
      ],
    },

    threatSummary: {
      summary: "Your digital footprint reveals significant exposure across 4 data breaches, 3 public profiles, and multiple web mentions. The combination of leaked credentials from Adobe and LinkedIn, along with a publicly indexed resume containing personal contact information, creates a high-risk scenario for credential stuffing and targeted phishing attacks.",
      criticalRisks: [
        "Email and encrypted password exposed in Adobe breach (2013) — passwords may have been decrypted",
        "Phone number and professional data scraped in LinkedIn breach (2021) — 700M records",
        "Credentials found in Pastebin dump — indicating active credential trading",
        "Public resume PDF contains email, phone, and physical address",
        "LinkedIn profile publicly exposes contact information and employment history",
      ],
      attackVectors: [
        { name: "Credential Stuffing", probability: "HIGH" as const, description: "Leaked passwords from Adobe and Dropbox could be reused across accounts" },
        { name: "Targeted Phishing", probability: "HIGH" as const, description: "Detailed personal info enables highly convincing spear-phishing emails" },
        { name: "Social Engineering", probability: "MEDIUM" as const, description: "Professional details from LinkedIn enable impersonation attacks" },
        { name: "Account Takeover", probability: "MEDIUM" as const, description: "Combined credential + personal data enables password reset attacks" },
        { name: "Identity Theft", probability: "LOW" as const, description: "Resume with full contact details could be used for identity fraud" },
      ],
    },

    remediationSteps: [
      {
        id: "r1",
        step: 1,
        title: "Enable MFA on all accounts",
        description: "Add two-factor authentication to GitHub, LinkedIn, email, and all accounts using a hardware key or authenticator app.",
        priority: "critical",
      },
      {
        id: "r2",
        step: 2,
        title: "Change all passwords immediately",
        description: "Generate unique, strong passwords for Adobe, Canva, Dropbox, LinkedIn, and any accounts sharing the same credentials.",
        priority: "critical",
      },
      {
        id: "r3",
        step: 3,
        title: "Remove public resume PDF",
        description: "Contact university.edu to remove the indexed resume PDF that exposes your email, phone, and address.",
        priority: "high",
      },
      {
        id: "r4",
        step: 4,
        title: "Restrict LinkedIn public profile",
        description: "Remove phone number and email from public LinkedIn profile. Limit profile visibility to connections only.",
        priority: "high",
      },
      {
        id: "r5",
        step: 5,
        title: "Audit GitHub repositories",
        description: "Review public GitHub repos for exposed API keys, credentials, or sensitive configuration files. Delete or make private any sensitive repos.",
        priority: "medium",
      },
      {
        id: "r6",
        step: 6,
        title: "Request data removal from breach databases",
        description: "Submit removal requests to HaveIBeenPwned and other breach notification services.",
        priority: "medium",
      },
      {
        id: "r7",
        step: 7,
        title: "Set up breach monitoring",
        description: "Register for breach notification services to be alerted if your credentials appear in future breaches.",
        priority: "low",
      },
    ],
  };
}
