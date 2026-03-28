import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotId, format = 'auto', responsive = true }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full my-4 flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2 min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-YOUR_PUBLISHER_ID'}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
};
