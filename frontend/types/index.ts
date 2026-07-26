export interface ScanRequest {
  email: string;
  name?: string;
  username?: string;
  phone?: string;
}

export interface ScanProgress {
  step: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  message: string;
}

export interface Breach {
  id: string;
  name: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataClasses: string[];
  pwnCount: number;
  description: string;
}

export interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  confidence: number;
}

export interface WebMention {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  type: 'pdf' | 'forum' | 'news' | 'academic' | 'social' | 'blog';
  foundDate: string;
}

export interface AttackVector {
  name: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface RemediationStep {
  id: string;
  step: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskBreakdown {
  breachSeverity: number;
  sensitiveData: number;
  publicMentions: number;
  profileCorrelation: number;
  confidence: number;
}

export interface RiskScore {
  score: number;
  category: 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  breakdown: RiskBreakdown;
  methodology: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'breach' | 'profile' | 'mention' | 'document';
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: 'identity' | 'platform' | 'breach' | 'document' | 'mention';
    risk: 'safe' | 'moderate' | 'high' | 'critical';
    details?: string;
    [key: string]: unknown;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, string | number>;
}

export interface ExposureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ThreatSummary {
  criticalRisks: string[];
  attackVectors: AttackVector[];
  summary: string;
}

export interface ScanResult {
  id: string;
  query: ScanRequest;
  status: 'pending' | 'scanning' | 'complete' | 'error';
  progress: ScanProgress[];
  riskScore: RiskScore;
  breaches: Breach[];
  socialProfiles: SocialProfile[];
  webMentions: WebMention[];
  timeline: TimelineEvent[];
  graph: ExposureGraph;
  threatSummary: ThreatSummary;
  remediationSteps: RemediationStep[];
  createdAt: string;
  expiresAt: string;
}
