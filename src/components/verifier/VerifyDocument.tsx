import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Document, VerificationLog } from '../../types';
import { Shield, Upload, QrCode, CheckCircle, XCircle, AlertTriangle, FileText, Calendar, Building } from 'lucide-react';
import QRScanner from './QRScanner';
import FileUploadVerifier from './FileUploadVerifier';

const VerifyDocument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationMethod, setVerificationMethod] = useState<'qr' | 'upload' | 'link'>('link');
  const [verificationResult, setVerificationResult] = useState<{
    document: Document | null;
    isValid: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const documentId = searchParams.get('id');
    if (documentId) {
      verifyDocumentById(documentId);
    }
  }, [searchParams]);

  const verifyDocumentById = async (documentId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const document = {
          ...data,
          issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : new Date(data.issuedAt),
          revokedAt: data.revokedAt?.toDate ? data.revokedAt.toDate() : data.revokedAt ? new Date(data.revokedAt) : undefined,
        } as Document;
        
        // Log verification attempt
        await logVerification(documentId, document.status === 'active' ? 'valid' : 'revoked');

        setVerificationResult({
          document,
          isValid: document.status === 'active',
          message: document.status === 'active' 
            ? 'Document is valid and authentic' 
            : 'Document has been revoked by the issuer'
        });
      } else {
        await logVerification(documentId, 'invalid');
        setVerificationResult({
          document: null,
          isValid: false,
          message: 'Document not found in our database'
        });
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationResult({
        document: null,
        isValid: false,
        message: 'Error occurred during verification'
      });
    } finally {
      setLoading(false);
    }
  };

  const logVerification = async (documentId: string, result: 'valid' | 'invalid' | 'revoked') => {
    try {
      const log: VerificationLog = {
        id: `log_${Date.now()}`,
        documentId,
        timestamp: new Date(),
        result,
        ipAddress: 'Unknown', // In a real app, you'd get this from the request
      };

      await addDoc(collection(db, 'verificationLogs'), log);
    } catch (error) {
      console.error('Error logging verification:', error);
    }
  };

  const renderVerificationResult = () => {
    if (!verificationResult) return null;

    const { document, isValid, message } = verificationResult;

    return (
      <div className="max-w-7xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center">
            {isValid ? (
              <>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 shadow-lg">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-4 shadow-lg">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              </>
            )}
          </div>
          <h1 className={`text-4xl font-bold mt-6 mb-3 ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            {isValid ? '✅ Document Verified' : '❌ Verification Failed'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{message}</p>
          {isValid && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <Shield className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 font-medium text-sm">Cryptographically Secure</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Information Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                Document Information
              </h2>
            </div>
            <div className="p-6">
              {document && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Document Title</label>
                      <p className="text-lg font-bold text-gray-900">{document.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Type</label>
                        <p className="text-gray-900 font-medium capitalize">{document.documentType}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                          document.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {document.status === 'active' ? '🟢 Active' : '🔴 Revoked'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        Issued By
                      </label>
                      <p className="text-lg font-bold text-gray-900">{document.issuerName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-green-600 uppercase tracking-wide mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Issue Date
                        </label>
                        <p className="text-gray-900 font-medium">{document.issuedAt.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Recipient</label>
                        <p className="text-gray-900 font-medium">{document.recipientName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {document.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                      <p className="text-gray-700 leading-relaxed">{document.description}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-indigo-500">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Security Hash</label>
                    <p className="text-xs text-gray-600 font-mono break-all bg-white px-2 py-1 rounded border">
                      {document.hash}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setVerificationResult(null);
                    setVerificationMethod('link');
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Verify Another Document
                </button>
                <a
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>

          {/* Document Display - Right Side */}
          {document && document.documentUrl && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FileText className="h-6 w-6 mr-2" />
                    Document Preview
                  </h3>
                  <div className="flex space-x-2">
                    <a
                      href={document.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium border border-white/20"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open Full
                    </a>
                    <a
                      href={document.documentUrl}
                      download={document.originalFileName || `${document.title}.pdf`}
                      className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium shadow-sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="relative bg-gray-100" style={{ height: '700px' }}>
                <iframe
                  src={`${document.documentUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-0"
                  title="Document Preview"
                  onError={(e) => {
                    // Fallback to Google Docs viewer if direct PDF viewing fails
                    const iframe = e.target as HTMLIFrameElement;
                    iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(document.documentUrl!)}&embedded=true`;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <p className="text-white text-sm font-medium text-center">
                    📄 {document.originalFileName || `${document.title}.pdf`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying document...</p>
        </div>
      </div>
    );
  }

  if (verificationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {renderVerificationResult()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">LegitCheck</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Document Verification</h1>
            <p className="text-xl text-gray-600">
              Verify the authenticity of educational and healthcare documents
            </p>
          </div>

          {/* Verification Methods */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => setVerificationMethod('upload')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  verificationMethod === 'upload'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Upload Document</h3>
                <p className="text-sm text-gray-600">Drag and drop or click to upload your document</p>
              </button>

              <button
                onClick={() => setVerificationMethod('qr')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  verificationMethod === 'qr'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <QrCode className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                <p className="text-sm text-gray-600">Use your camera to scan the document's QR code</p>
              </button>

              <button
                onClick={() => setVerificationMethod('link')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  verificationMethod === 'link'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Enter Document ID</h3>
                <p className="text-sm text-gray-600">Enter the unique document identifier</p>
              </button>
            </div>

            {/* Verification Interface */}
            <div className="border-t pt-8">
              {verificationMethod === 'upload' && (
                <FileUploadVerifier onVerificationComplete={setVerificationResult} />
              )}
              
              {verificationMethod === 'qr' && (
                <QRScanner onScan={verifyDocumentById} />
              )}
              
              {verificationMethod === 'link' && (
                <DocumentIdVerifier onVerify={verifyDocumentById} />
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Verification Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Document Identification</h3>
                <p className="text-sm text-gray-600">
                  Each verified document contains a unique identifier and QR code for instant verification.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Cryptographic Verification</h3>
                <p className="text-sm text-gray-600">
                  Documents are cryptographically hashed to detect any tampering or modifications.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">
                  Get immediate verification results with detailed issuer information and document status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentIdVerifier: React.FC<{ onVerify: (id: string) => void }> = ({ onVerify }) => {
  const [documentId, setDocumentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId.trim()) {
      onVerify(documentId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document ID
        </label>
        <input
          type="text"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter document ID (e.g., doc_1234567890_abc123)"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Verify Document
      </button>
    </form>
  );
};

export default VerifyDocument;