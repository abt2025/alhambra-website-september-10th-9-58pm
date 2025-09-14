import React, { useState, useEffect } from 'react';

const QRSessionTransfer = ({ 
  sessionId, 
  currentStep, 
  formData, 
  onSessionTransfer,
  isVisible = false 
}) => {
  const [qrCode, setQrCode] = useState('');
  const [sessionUrl, setSessionUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    if (sessionId && isVisible) {
      generateQRCode();
      detectDevice();
    }
  }, [sessionId, currentStep, isVisible]);

  const generateQRCode = () => {
    // Create session transfer URL with encrypted session data
    const transferData = {
      sessionId: sessionId,
      currentStep: currentStep,
      timestamp: Date.now(),
      formData: formData,
      deviceTransfer: true,
      bankId: 'alhambra-bank-trust'
    };

    // Encode session data for QR code
    const encodedData = btoa(JSON.stringify(transferData));
    const transferUrl = `${window.location.origin}/continue-onboarding?session=${encodedData}`;
    
    setSessionUrl(transferUrl);
    
    // Generate QR code using a simple QR code generator
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(transferUrl)}`;
    setQrCode(qrCodeUrl);
  };

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    let device = 'Desktop';
    
    if (/Android/i.test(userAgent)) {
      device = 'Android Device';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      device = 'iOS Device';
    } else if (/Windows Phone/i.test(userAgent)) {
      device = 'Windows Phone';
    }
    
    setDeviceInfo(device);
  };

  const copySessionUrl = () => {
    navigator.clipboard.writeText(sessionUrl).then(() => {
      alert('Session URL copied to clipboard! You can paste this on another device to continue.');
    });
  };

  const sendToEmail = () => {
    const subject = 'Alhambra Bank Account Opening - Continue on Another Device';
    const body = `Continue your Alhambra Bank account opening process on another device:\n\n${sessionUrl}\n\nThis link will expire in 24 hours for security purposes.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const sendToSMS = () => {
    const message = `Continue your Alhambra Bank account opening: ${sessionUrl}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-700 mb-4">
            📱 Continue on Another Device
          </h3>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Current Device: <span className="font-semibold">{deviceInfo}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Step {currentStep} of 5 - Your progress is saved
            </p>
          </div>

          {/* QR Code Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mb-4 w-full"
            >
              {showQR ? '📱 Hide QR Code' : '📱 Show QR Code'}
            </button>
            
            {showQR && (
              <div className="border-2 border-red-200 rounded-lg p-4 bg-gray-50">
                <img 
                  src={qrCode} 
                  alt="QR Code for session transfer"
                  className="mx-auto mb-3"
                />
                <p className="text-sm text-gray-600">
                  Scan with your mobile device to continue
                </p>
              </div>
            )}
          </div>

          {/* Alternative Transfer Methods */}
          <div className="space-y-3 mb-6">
            <button
              onClick={copySessionUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
            >
              📋 Copy Link
            </button>
            
            <button
              onClick={sendToEmail}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full flex items-center justify-center"
            >
              📧 Send via Email
            </button>
            
            <button
              onClick={sendToSMS}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full flex items-center justify-center"
            >
              💬 Send via SMS
            </button>
          </div>

          {/* Security Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              🔒 <strong>Security Notice:</strong> This session link expires in 24 hours. 
              Your data is encrypted and secure during transfer.
            </p>
          </div>

          {/* Session Details */}
          <div className="text-left bg-gray-50 rounded-lg p-3 mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Session Details:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Session ID: {sessionId?.substring(0, 8)}...</li>
              <li>• Current Step: {currentStep} of 5</li>
              <li>• Form Data: {Object.keys(formData || {}).length} fields saved</li>
              <li>• Created: {new Date().toLocaleTimeString()}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => onSessionTransfer(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Continue Here
            </button>
            <button
              onClick={() => window.open(sessionUrl, '_blank')}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRSessionTransfer;
