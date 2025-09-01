import React, { useState, useRef } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Document } from '../../types';
import { Upload, FileText, X } from 'lucide-react';
import CryptoJS from 'crypto-js';

interface FileUploadVerifierProps {
  onVerificationComplete: (result: { document: Document | null; isValid: boolean; message: string }) => void;
}

const FileUploadVerifier: React.FC<FileUploadVerifierProps> = ({ onVerificationComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a PDF or image file');
    }
  };

  const verifyDocument = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // First try to extract document ID from PDF
      let documentId = await extractDocumentIdFromPDF(selectedFile);
      let document: Document | null = null;
      

      if (documentId) {
        // If we found document ID, fetch it directly
        const docRef = doc(db, 'documents', documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const documentData = docSnap.data();
          document = {
            ...documentData,
            issuedAt: documentData.issuedAt?.toDate ? documentData.issuedAt.toDate() : new Date(documentData.issuedAt),
            revokedAt: documentData.revokedAt?.toDate ? documentData.revokedAt.toDate() : documentData.revokedAt ? new Date(documentData.revokedAt) : undefined,
          } as Document;
        }
      }
      
      // If no document found by ID, try hash-based verification
      if (!document) {
        document = await verifyByContentHash(selectedFile);
      }

      if (!document) {
        onVerificationComplete({
          document: null,
          isValid: false,
          message: 'Document not found in verification database. This document may not be issued through our platform or may have been tampered with.'
        });
        return;
      }

      // Verify document status
      const isValid = document.status === 'active';
      const message = isValid 
        ? 'Document is valid and authentic' 
        : 'Document has been revoked by the issuer';

      onVerificationComplete({
        document,
        isValid,
        message
      });

    } catch (error) {
      console.error('Verification error:', error);
      onVerificationComplete({
        document: null,
        isValid: false,
        message: 'Error processing file for verification. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyByContentHash = async (file: File): Promise<Document | null> => {
    try {
      // Generate hash of the PDF content excluding metadata
      const fileHash = await generatePDFContentHash(file);
      
      // Get all documents and compare hashes
      const documentsQuery = query(collection(db, 'documents'));
      const documentsSnapshot = await getDocs(documentsQuery);
      
      for (const docSnap of documentsSnapshot.docs) {
        const documentData = docSnap.data();
        
        // Compare with stored document hash
        if (documentData.hash === fileHash) {
          return {
            ...documentData,
            id: docSnap.id,
            issuedAt: documentData.issuedAt?.toDate ? documentData.issuedAt.toDate() : new Date(documentData.issuedAt),
            revokedAt: documentData.revokedAt?.toDate ? documentData.revokedAt.toDate() : documentData.revokedAt ? new Date(documentData.revokedAt) : undefined,
          } as Document;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in hash-based verification:', error);
      return null;
    }
  };

  const generatePDFContentHash = async (file: File): Promise<string> => {
    try {
      const fileContent = await readFileAsArrayBuffer(file);
      const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileContent)).toString();
      return hash;
    } catch (error) {
      console.error('Error generating PDF content hash:', error);
      throw error;
    }
  };

  const extractDocumentIdFromPDF = async (file: File): Promise<string | null> => {
    try {
      const fileContent = await readFileAsArrayBuffer(file);
      
      // Look for verification URL pattern in the PDF
      const pdfText = new TextDecoder().decode(fileContent);
      
      // Look for verification URL pattern
      const urlPattern = /\/verify\?id=(doc_\d+_[a-z0-9]+)/g;
      const match = urlPattern.exec(pdfText);
      
      if (match && match[1]) {
        return match[1];
      }
      
      // Alternative: look for document ID pattern directly
      const idPattern = /doc_\d+_[a-z0-9]+/g;
      const idMatch = idPattern.exec(pdfText);
      
      if (idMatch) {
        return idMatch[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting document ID from PDF:', error);
      return null;
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileSelection(files[0]);
            }
          }}
        />

        {!selectedFile ? (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your document here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-2">Supports PDF and image files</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={verifyDocument}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Document'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadVerifier;