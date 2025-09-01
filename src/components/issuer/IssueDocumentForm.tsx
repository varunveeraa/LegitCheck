import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Issuer, Document } from '../../types';
import { X, Upload, FileText } from 'lucide-react';
import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import { PDFDocument, rgb } from 'pdf-lib';

interface IssueDocumentFormProps {
  issuer: Issuer;
  onClose: () => void;
  onSuccess: () => void;
}

const IssueDocumentForm: React.FC<IssueDocumentFormProps> = ({ issuer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recipientName: '',
    recipientEmail: '',
    documentType: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    } else {
      setError('Please upload a PDF file only');
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please upload a PDF file only');
    }
  };

  const generateDocumentHash = (content: string): string => {
    return CryptoJS.SHA256(content).toString();
  };

  const generateQRCode = async (verificationUrl: string): Promise<Uint8Array> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Convert data URL to Uint8Array
      const base64Data = qrCodeDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const embedQRCodeInPDF = async (pdfFile: File, verificationUrl: string): Promise<Uint8Array> => {
    try {
      // Read the PDF file
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Generate QR code
      const qrCodeBytes = await generateQRCode(verificationUrl);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);
      
      // Get the last page (or you can modify to add to all pages)
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();
      
      // Position QR code in bottom right corner
      const qrSize = 80;
      const margin = 20;
      const qrX = margin;
      const qrY = margin + 40; // Move QR code 40 pixels higher
      
      // Draw QR code
      lastPage.drawImage(qrCodeImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });
      
      // Add verification URL text below QR code
      lastPage.drawText('Verify at:', {
        x: qrX,
        y: qrY - 15,
        size: 8,
        color: rgb(0, 0, 0),
      });
      
      lastPage.drawText(verificationUrl, {
        x: qrX,
        y: qrY - 25,
        size: 6,
        color: rgb(0, 0, 1),
      });
      
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Error embedding QR code in PDF:', error);
      throw error;
    }
  };

  const uploadModifiedPDF = async (pdfBytes: Uint8Array, documentId: string): Promise<string> => {
    try {
      const fileName = `${documentId}_${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filePath = `issued_docs/${issuer.userId}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading modified PDF:', error);
      throw error;
    }
  };

  const generatePDFContentHash = async (pdfBytes: Uint8Array): Promise<string> => {
    try {
      const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(pdfBytes)).toString();
      return hash;
    } catch (error) {
      console.error('Error generating PDF content hash:', error);
      return CryptoJS.SHA256(CryptoJS.lib.WordArray.create(pdfBytes)).toString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a PDF file to issue');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const verificationUrl = `${window.location.origin}/verify?id=${documentId}`;
      
      // Embed QR code in PDF
      const modifiedPdfBytes = await embedQRCodeInPDF(selectedFile, verificationUrl);
      
      // Upload modified PDF to storage
      const documentUrl = await uploadModifiedPDF(modifiedPdfBytes, documentId);
      
      // Generate QR code data URL for storage
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      
      // Generate hash of the modified PDF content for verification (excluding metadata)
      const documentHash = await generatePDFContentHash(modifiedPdfBytes);

      const document: Document = {
        id: documentId,
        issuerId: issuer.id,
        issuerName: issuer.organizationName,
        title: formData.title,
        description: formData.description,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        documentType: formData.documentType,
        hash: documentHash,
        status: 'active',
        issuedAt: new Date(),
        verificationUrl,
        qrCodeData: qrCodeDataUrl,
        documentUrl, // Store the URL of the modified PDF
        originalFileName: selectedFile.name,
      };

      await setDoc(doc(db, 'documents', documentId), document);
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Issue New Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF Document</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleFileSelection(files[0]);
                    }
                  }}
                  className="hidden"
                  id="pdf-upload"
                />
                
                {!selectedFile ? (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDF Document</h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your PDF here, or click to browse
                    </p>
                    <label
                      htmlFor="pdf-upload"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Browse Files
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDF files only</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-green-600">
                      QR code and verification link will be embedded in the bottom right corner
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bachelor of Science Degree"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type</option>
                  {issuer.type === 'education' ? (
                    <>
                      <option value="degree">Degree</option>
                      <option value="diploma">Diploma</option>
                      <option value="certificate">Certificate</option>
                      <option value="transcript">Transcript</option>
                    </>
                  ) : (
                    <>
                      <option value="medical_report">Medical Report</option>
                      <option value="discharge_summary">Discharge Summary</option>
                      <option value="lab_result">Lab Result</option>
                      <option value="prescription">Prescription</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional details about the document"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name of recipient"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="recipient@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing & Issuing...' : 'Issue Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueDocumentForm;