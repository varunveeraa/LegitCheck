export interface User {
  uid: string;
  email: string;
  role: 'issuer' | 'admin';
  createdAt: Date;
}

export interface Issuer {
  id: string;
  userId: string;
  organizationName: string;
  type: 'education' | 'healthcare';
  description: string;
  supportingDocuments: string[];
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface Document {
  id: string;
  issuerId: string;
  issuerName: string;
  title: string;
  description: string;
  recipientName: string;
  recipientEmail: string;
  documentType: string;
  hash: string;
  status: 'active' | 'revoked';
  issuedAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
  verificationUrl: string;
  qrCodeData: string;
  documentUrl?: string;
  originalFileName?: string;
}

export interface VerificationLog {
  id?: string;
  documentId: string;
  timestamp: Date;
  result: 'valid' | 'invalid' | 'revoked';
  ipAddress?: string;
  userAgent?: string;
}