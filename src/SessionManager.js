// Session Management Utility for Cross-Device Onboarding
class SessionManager {
  constructor() {
    this.sessionKey = 'alhambra_onboarding_session';
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Generate unique session ID
  generateSessionId() {
    return 'abt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Save session data to localStorage and cloud backup
  saveSession(sessionData) {
    const sessionWithTimestamp = {
      ...sessionData,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout,
      deviceInfo: this.getDeviceInfo()
    };

    // Save to localStorage
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionWithTimestamp));
    
    // Simulate cloud backup (in real implementation, this would be an API call)
    this.backupToCloud(sessionWithTimestamp);
    
    return sessionWithTimestamp;
  }

  // Load session data
  loadSession(sessionId = null) {
    try {
      // Try to load from URL parameter first (for device transfers)
      if (sessionId) {
        return this.loadFromTransfer(sessionId);
      }

      // Load from localStorage
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const parsed = JSON.parse(sessionData);
      
      // Check if session has expired
      if (Date.now() > parsed.expiresAt) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Load session from transfer URL
  loadFromTransfer(encodedData) {
    try {
      const decoded = atob(encodedData);
      const transferData = JSON.parse(decoded);
      
      // Validate transfer data
      if (!transferData.sessionId || !transferData.timestamp) {
        throw new Error('Invalid transfer data');
      }

      // Check if transfer link has expired (24 hours)
      if (Date.now() - transferData.timestamp > this.sessionTimeout) {
        throw new Error('Transfer link has expired');
      }

      // Save to new device
      this.saveSession(transferData);
      
      return transferData;
    } catch (error) {
      console.error('Error loading transfer session:', error);
      return null;
    }
  }

  // Update session with new step data
  updateSession(updates) {
    const currentSession = this.loadSession();
    if (!currentSession) return null;

    const updatedSession = {
      ...currentSession,
      ...updates,
      lastUpdated: Date.now()
    };

    return this.saveSession(updatedSession);
  }

  // Clear session data
  clearSession() {
    localStorage.removeItem(this.sessionKey);
    // Also clear from cloud backup in real implementation
  }

  // Get device information
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceType = 'Desktop';
    let browser = 'Unknown';

    // Detect device type
    if (/Android/i.test(userAgent)) {
      deviceType = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = 'iOS';
    } else if (/Windows Phone/i.test(userAgent)) {
      deviceType = 'Windows Phone';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type: deviceType,
      browser: browser,
      userAgent: userAgent,
      timestamp: Date.now()
    };
  }

  // Simulate cloud backup (replace with actual API in production)
  backupToCloud(sessionData) {
    // In a real implementation, this would make an API call to save session data
    console.log('Session backed up to cloud:', sessionData.sessionId);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, sessionId: sessionData.sessionId });
      }, 100);
    });
  }

  // Validate session integrity
  validateSession(sessionData) {
    const requiredFields = ['sessionId', 'timestamp', 'currentStep'];
    return requiredFields.every(field => sessionData.hasOwnProperty(field));
  }

  // Get session status
  getSessionStatus() {
    const session = this.loadSession();
    if (!session) {
      return { status: 'none', message: 'No active session' };
    }

    const timeRemaining = session.expiresAt - Date.now();
    if (timeRemaining <= 0) {
      return { status: 'expired', message: 'Session has expired' };
    }

    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    return { 
      status: 'active', 
      message: `Session active (${hoursRemaining}h remaining)`,
      session: session
    };
  }

  // Resume session from another device
  resumeFromDevice(transferUrl) {
    try {
      const url = new URL(transferUrl);
      const sessionParam = url.searchParams.get('session');
      
      if (!sessionParam) {
        throw new Error('No session data in URL');
      }

      return this.loadFromTransfer(sessionParam);
    } catch (error) {
      console.error('Error resuming from device:', error);
      return null;
    }
  }
}

export default SessionManager;
