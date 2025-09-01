import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Issuer, Document } from '../../types';
import { Plus, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import IssueDocumentForm from './IssueDocumentForm';
import DocumentDetailsModal from './DocumentDetailsModal';

const IssuerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      // Fetch issuer profile
      const issuerQuery = query(
        collection(db, 'issuers'),
        where('userId', '==', currentUser.uid)
      );
      const issuerSnapshot = await getDocs(issuerQuery);
      
      if (!issuerSnapshot.empty) {
        const data = issuerSnapshot.docs[0].data();
        const issuerData = {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : data.approvedAt ? new Date(data.approvedAt) : undefined,
        } as Issuer;
        setIssuer(issuerData);

        // Fetch documents if issuer is verified
        if (issuerData.status === 'verified') {
          const docsQuery = query(
            collection(db, 'documents'),
            where('issuerId', '==', issuerData.id)
          );
          const docsSnapshot = await getDocs(docsQuery);
          const docsData = docsSnapshot.docs.map(doc => {
            const docData = doc.data();
            return {
              ...docData,
              id: doc.id,
              issuedAt: docData.issuedAt?.toDate ? docData.issuedAt.toDate() : new Date(docData.issuedAt),
              revokedAt: docData.revokedAt?.toDate ? docData.revokedAt.toDate() : docData.revokedAt ? new Date(docData.revokedAt) : undefined,
            } as Document;
          });
          setDocuments(docsData);
        }
      }
    } catch (error) {
      console.error('Error fetching issuer data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!issuer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Issuer Profile Found</h2>
          <p className="text-gray-600">Please complete your organization registration.</p>
        </div>
      </div>
    );
  }

  if (issuer.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Pending</h2>
          <p className="text-gray-600 mb-6">
            Your organization registration is under review by our admin team. 
            You'll be able to issue documents once your account is verified.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Organization:</strong> {issuer.organizationName}<br />
              <strong>Type:</strong> {issuer.type}<br />
              <strong>Status:</strong> Pending Verification
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (issuer.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Rejected</h2>
          <p className="text-gray-600 mb-6">
            Your organization registration has been rejected. Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and issue documents for {issuer.organizationName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Verified Organization</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Documents</h3>
            <p className="text-3xl font-bold text-blue-600">{documents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">
              {documents.filter(doc => doc.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revoked</h3>
            <p className="text-3xl font-bold text-red-600">
              {documents.filter(doc => doc.status === 'revoked').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setShowIssueForm(true)}
              className="w-full h-full flex flex-col items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 transition-colors"
            >
              <Plus className="h-8 w-8 mb-2" />
              <span className="font-medium">Issue Document</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Document Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{document.title}</div>
                          <div className="text-sm text-gray-500">{document.documentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{document.recipientName}</div>
                      <div className="text-sm text-gray-500">{document.recipientEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.issuedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedDocument(document)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents issued yet</p>
                <button
                  onClick={() => setShowIssueForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Issue your first document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showIssueForm && (
        <IssueDocumentForm
          issuer={issuer}
          onClose={() => setShowIssueForm(false)}
          onSuccess={() => {
            setShowIssueForm(false);
            fetchData();
          }}
        />
      )}

      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default IssuerDashboard;