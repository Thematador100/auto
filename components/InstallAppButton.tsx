import React, { useState, useEffect } from 'react';

/**
 * Install App Button - PWA Installation Prompt
 * Shows when app can be installed on user's device
 */
export const InstallAppButton: React.FC = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    // Listen for custom event from index.html
    window.addEventListener('showInstallPrompt', handleBeforeInstall as EventListener);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => {
      window.removeEventListener('showInstallPrompt', handleBeforeInstall as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ User accepted install');
    } else {
      console.log('❌ User dismissed install');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    // Set a cookie or localStorage to not show again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (within 7 days)
  const dismissedAt = localStorage.getItem('installPromptDismissed');
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7 && showInstall) {
      return null;
    }
  }

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl p-4 border border-purple-400">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📱</div>
            <div>
              <div className="font-bold text-white text-lg">Install AI Auto Pro</div>
              <div className="text-purple-100 text-sm">
                Access faster, work offline, get notifications
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-purple-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 text-white font-semibold hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            Not Now
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-purple-100">
          <span>✓ Works offline</span>
          <span>✓ Faster loading</span>
          <span>✓ Home screen access</span>
        </div>
      </div>
    </div>
  );
};

// CSS for animation (add to index.css)
/*
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out;
}
*/
