import React, { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';

const InstallPrompter = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Check if installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone) return null; // Already installed

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2'>
      {deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className='flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all font-semibold mobile-install-btn'
        >
          <Download size={20} />
          Install App
        </button>
      )}

      {isIOS && (
        <div className='bg-white p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs animate-in fade-in slide-in-from-bottom-5'>
          <div className='flex items-start gap-3'>
            <Share className='text-blue-500 mt-1' />
            <div>
              <p className='font-semibold text-gray-800 text-sm'>Install on iOS</p>
              <p className='text-xs text-gray-600 mt-1'>
                Tap the <span className='font-bold'>Share</span> button and select <span className='font-bold'>'Add to Home Screen'</span>
              </p>
            </div>
            <button onClick={() => setIsIOS(false)} className='text-gray-400 hover:text-gray-600'>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallPrompter;
