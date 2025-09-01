import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (documentId: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const startScanner = async () => {
    setIsInitializing(true);
    setIsScanning(true); // Set scanning state immediately to render DOM element
    setError('');
    setPermissionDenied(false);

    try {
      // First check if we can access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // Wait for DOM to update, then initialize scanner
      setTimeout(() => {
        initializeScanner();
      }, 100);
    } catch (err: any) {
      setIsInitializing(false);
      setIsScanning(false);
      console.error('Camera access error:', err);
      
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser. Try Chrome or Firefox.');
      } else {
        setError('Unable to access camera. Please check your browser settings.');
      }
    }
  };

  const initializeScanner = () => {
    // Clear any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      rememberLastUsedCamera: true,
      supportedScanTypes: [],
    };

    const scanner = new Html5QrcodeScanner('qr-reader', config, false);

    scanner.render(
      (decodedText) => {
        console.log('QR Code scanned:', decodedText);
        
        // Try to extract document ID from URL
        let documentId = null;
        
        try {
          if (decodedText.includes('/verify?id=')) {
            const url = new URL(decodedText);
            documentId = url.searchParams.get('id');
          } else if (decodedText.match(/^doc_\d+_[a-z0-9]+$/)) {
            // Direct document ID
            documentId = decodedText;
          }
          
          if (documentId) {
            scanner.clear().then(() => {
              setIsInitializing(false);
              setIsScanning(false);
              onScan(documentId);
            }).catch(console.error);
          } else {
            setError('Invalid QR code format. Please scan a valid document verification code.');
          }
        } catch (e) {
          console.error('QR scan error:', e);
          setError('Invalid QR code - not a valid verification link');
        }
      },
      (error) => {
        // Only log errors, don't show them to user unless critical
        if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access and try again.');
          setIsScanning(false);
          setIsInitializing(false);
        }
      }
    );

    scannerRef.current = scanner;
    setIsInitializing(false);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
    setError('');
    setPermissionDenied(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  // Check if we're on HTTPS or localhost
  const isSecureContext = window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

  if (!isSecureContext) {
    return (
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">HTTPS Required</h3>
        <p className="text-gray-600 mb-4">
          Camera access requires a secure connection (HTTPS). Please use HTTPS to enable QR scanning.
        </p>
      </div>
    );
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return (
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Not Supported</h3>
        <p className="text-gray-600 mb-4">
          Your browser doesn't support camera access. Please try a different browser.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {!isScanning && !isInitializing ? (
        <>
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
          <p className="text-gray-600 mb-4">
            Click the button below to start scanning the QR code on your document
          </p>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            onClick={startScanner}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Camera
          </button>
        </>
      ) : isInitializing ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Camera...</h3>
          <p className="text-gray-600">Please allow camera access when prompted</p>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scanning QR Code</h3>
            <button
              onClick={stopScanner}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div id="qr-reader" className="mx-auto max-w-sm"></div>
          {isInitializing ? (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Please allow camera access when prompted</p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                  <button
                    onClick={() => {
                      setError('');
                      stopScanner();
                    }}
                    className="ml-2 text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Point your camera at the QR code on the document
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRScanner;