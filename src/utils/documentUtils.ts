import CryptoJS from 'crypto-js';

export const generateDocumentHash = (content: string): string => {
  return CryptoJS.SHA256(content).toString();
};

export const generateDocumentId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `doc_${timestamp}_${random}`;
};

export const createVerificationUrl = (documentId: string): string => {
  return `${window.location.origin}/verify?id=${documentId}`;
};

export const validateDocumentId = (documentId: string): boolean => {
  const regex = /^doc_\d+_[a-z0-9]+$/;
  return regex.test(documentId);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};