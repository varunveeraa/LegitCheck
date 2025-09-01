import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Document } from '../../types';
import { X, QrCode, ExternalLink, Ban, Download, FileText } from 'lucide-react';

interface DocumentDetailsModalProps {
  document: Document;
  onClose: () => void;
  onUpdate: () => void;
}

const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  document,
  onClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this document? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'documents', document.id);
      await updateDoc(docRef, {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: 'issuer', // In a real app, this would be the issuer's ID
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error revoking document:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (document.qrCodeData) {
      const link = document.createElement('a');
      link.download = `${document.title}-qr-code.png`;
      link.href = document.qrCodeData;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                <p className="text-gray-900 font-medium">{document.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                <p className="text-gray-900 capitalize">{document.documentType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Recipient Name</label>
                <p className="text-gray-900">{document.recipientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Recipient Email</label>
                <p className="text-gray-900">{document.recipientEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  document.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {document.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Issued Date</label>
                <p className="text-gray-900">{document.issuedAt.toLocaleDateString()}</p>
              </div>
            </div>
            
            {document.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <p className="text-gray-900">{document.description}</p>
              </div>
            )}

            {document.documentUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Issued Document</label>
                <div className="flex items-center space-x-4">
                  <a
                    href={document.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Document
                  </a>
                  <a
                    href={document.documentUrl}
                    download={document.originalFileName || `${document.title}.pdf`}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {document.status === 'revoked' && document.revokedAt && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>Revoked on:</strong> {document.revokedAt.toLocaleDateString()}
                  {document.revokedBy && <span> by {document.revokedBy}</span>}
                </p>
              </div>
            )}
          </div>

          {/* Verification Links */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Verification Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={document.verificationUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(document.verificationUrl)}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                  <a
                    href={document.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Document Hash</label>
                <input
                  type="text"
                  value={document.hash}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                />
              </div>

              {document.qrCodeData && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">QR Code</label>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={document.qrCodeData} 
                      alt="QR Code" 
                      className="w-24 h-24 border border-gray-300 rounded"
                    />
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {document.status === 'active' && (
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Ban className="h-4 w-4 mr-2" />
                {loading ? 'Revoking...' : 'Revoke Document'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsModal;