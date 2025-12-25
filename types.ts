
export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface KeyAnalysis {
  keyId: string;
  owner?: string;
  summary: string;
  technicalProperties: string;
  historicalContext?: string;
}

export interface PgpPacket {
  tag: string;
  description: string;
  length?: string;
}

export interface DecoderResult {
  type: string;
  packets: PgpPacket[];
  securityNote: string;
  extractedContent?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
