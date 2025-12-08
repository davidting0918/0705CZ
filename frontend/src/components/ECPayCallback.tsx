import { useEffect, useRef } from 'react';
import type { StoreSelection } from '../types';

const ECPayCallback = () => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // ECPay redirects to ServerReplyURL with store selection data
    // The data can come as URL query parameters (GET) or form POST data
    const extractStoreData = () => {
      // Check if we're in an iframe
      const isInIframe = window.self !== window.top;
      
      // Try to get data from URL parameters (ECPay typically redirects with GET params)
      const urlParams = new URLSearchParams(window.location.search);
      
      // Also check hash fragment (some implementations use this)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Try to read from form inputs if POST was used
      const formStoreId = (document.getElementById('CVSStoreID') as HTMLInputElement)?.value;
      const formStoreName = (document.getElementById('CVSStoreName') as HTMLInputElement)?.value;
      const formAddress = (document.getElementById('CVSAddress') as HTMLInputElement)?.value;
      
      // Priority: URL params > Hash params > Form inputs
      const cvStoreId = urlParams.get('CVSStoreID') || hashParams.get('CVSStoreID') || formStoreId;
      const cvStoreName = urlParams.get('CVSStoreName') || hashParams.get('CVSStoreName') || formStoreName;
      const cvAddress = urlParams.get('CVSAddress') || hashParams.get('CVSAddress') || formAddress;
      const cvTelephone = urlParams.get('CVSTelephone') || hashParams.get('CVSTelephone') || (document.getElementById('CVSTelephone') as HTMLInputElement)?.value;
      const cvOpenTime = urlParams.get('CVSOpenTime') || hashParams.get('CVSOpenTime') || (document.getElementById('CVSOpenTime') as HTMLInputElement)?.value;
      const logisticsSubType = (urlParams.get('LogisticsSubType') || hashParams.get('LogisticsSubType') || (document.getElementById('LogisticsSubType') as HTMLInputElement)?.value) as 'FAMI' | 'UNIMART' | null;
      
      if (cvStoreId && cvStoreName && cvAddress) {
        const selection: StoreSelection = {
          CVSStoreID: cvStoreId,
          CVSStoreName: cvStoreName,
          CVSAddress: cvAddress,
          CVSTelephone: cvTelephone || undefined,
          CVSOpenTime: cvOpenTime || undefined,
          LogisticsSubType: logisticsSubType || 'FAMI',
        };
        
        // Send data to parent window
        if (isInIframe && window.parent) {
          window.parent.postMessage(
            {
              type: 'ECPAY_STORE_SELECTED',
              data: selection,
            },
            '*'
          );
        } else if (window.opener) {
          // If opened in popup, send to opener
          window.opener.postMessage(
            {
              type: 'ECPAY_STORE_SELECTED',
              data: selection,
            },
            '*'
          );
          // Close the popup after sending
          setTimeout(() => {
            window.close();
          }, 500);
        }
      }
    };

    // Try immediately and also after a short delay to handle async redirects
    extractStoreData();
    const timer = setTimeout(extractStoreData, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <form ref={formRef} method="post" style={{ display: 'none' }}>
        {/* Hidden inputs to capture POST data if ECPay sends it */}
        <input type="hidden" id="CVSStoreID" name="CVSStoreID" />
        <input type="hidden" id="CVSStoreName" name="CVSStoreName" />
        <input type="hidden" id="CVSAddress" name="CVSAddress" />
        <input type="hidden" id="CVSTelephone" name="CVSTelephone" />
        <input type="hidden" id="CVSOpenTime" name="CVSOpenTime" />
        <input type="hidden" id="LogisticsSubType" name="LogisticsSubType" />
      </form>
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-normal mb-2">門市選擇成功</h2>
        <p className="text-gray text-sm">正在處理您的選擇...</p>
      </div>
    </div>
  );
};

export default ECPayCallback;

