import React from 'react';
import { Issuer } from '../../types';
import { X, Building, Calendar, FileText, CheckCircle, XCircle, Eye, Download, ExternalLink } from 'lucide-react';

// PDF Preview Component
const PDFPreview: React.FC<{ url: string }> = ({ url }) => {
  const [showFallback, setShowFallback] = React.useState(false);

  if (showFallback) {
    return (
      <div 
        className="w-full h-full cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
        onClick={() => window.open(url, '_blank')}
      >
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">PDF Document</p>
          <p className="text-xs text-gray-500 mt-1">Click to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full h-full border-0"
        onError={() => setShowFallback(true)}
        onLoad={(e) => {
          const iframe = e.target as HTMLIFrameElement;
          // Check if iframe loaded successfully
          try {
            if (iframe.contentDocument === null) {
              setShowFallback(true);
            }
          } catch (error) {
            // Cross-origin error is expected, but iframe might still work
          }
        }}
      />
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => window.open(url, '_blank')}
        title="Click to open in new tab"
      />
    </div>
  );
};

// Document Preview Component
const DocumentPreview: React.FC<{ url: string }> = ({ url }) => {
  const [showFallback, setShowFallback] = React.useState(false);
  const isWordDoc = url.toLowerCase().includes('.doc');

  if (showFallback || !isWordDoc) {
    return (
      <div 
        className="w-full h-full cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
        onClick={() => window.open(url, '_blank')}
      >
        <div className="text-center">
          <FileText className="h-16 w-16 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {isWordDoc ? 'Word Document' : 'Document'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Click to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full h-full border-0"
        onError={() => setShowFallback(true)}
      />
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => window.open(url, '_blank')}
        title="Click to open in new tab"
      />
    </div>
  );
};

interface IssuerApprovalModalProps {
  issuer: Issuer;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const IssuerApprovalModal: React.FC<IssuerApprovalModalProps> = ({
  issuer,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Review Issuer Application</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Organization Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Building className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Organization Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-medium">{issuer.organizationName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900 capitalize">{issuer.type}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{issuer.description}</p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Application Date</label>
                <p className="text-gray-900">{issuer.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Current Status</label>
                <p className="text-gray-900 capitalize">{issuer.status}</p>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
            </div>
            {issuer.supportingDocuments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {issuer.supportingDocuments.map((doc, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {doc.split('/').pop()?.split('_').slice(1).join('_') || `Document ${index + 1}`}
                        </h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <a
                            href={doc}
                            download
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {/* Document Preview */}
                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                      {doc.toLowerCase().includes('.pdf') ? (
                        <PDFPreview url={doc} />
                      ) : doc.toLowerCase().match(/\.(jpg|jpeg|png)$/i) ? (
                        <img
                          src={doc}
                          alt={`Document ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(doc, '_blank')}
                        />
                      ) : (
                        <DocumentPreview url={doc} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No supporting documents uploaded</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {issuer.status === 'pending' && (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={onReject}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </button>
              <button
                onClick={onApprove}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Verify
              </button>
            </div>
          )}

          {(issuer.status === 'verified' || issuer.status === 'rejected') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Status:</strong> This application has been {issuer.status}
                {issuer.approvedAt && (
                  <span> on {issuer.approvedAt.toLocaleDateString()}</span>
                )}
                {issuer.approvedBy && (
                  <span> by {issuer.approvedBy}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuerApprovalModal;