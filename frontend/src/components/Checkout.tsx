import { type FormEvent, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { DeliveryMethod, ConvenienceStoreChain, StoreSelection } from '../types';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('home');
  const [storeChain, setStoreChain] = useState<ConvenienceStoreChain>('FAMI');
  const [selectedStore, setSelectedStore] = useState<StoreSelection | null>(null);
  const [isECPayReady, setIsECPayReady] = useState(false);
  const [isLoadingECPay, setIsLoadingECPay] = useState(false);
  const [ecpayError, setEcpayError] = useState<string | null>(null);
  const callbackIframeRef = useRef<HTMLIFrameElement>(null);
  const loadECPaySDKRef = useRef<(() => Promise<void>) | null>(null);

  // Load ECPay SDK dynamically
  useEffect(() => {
    const loadECPaySDK = (): Promise<void> => {
      setEcpayError(null);
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.ECPay && window.ECPay.Logistics && window.ECPay.Logistics.Map) {
          console.log('ECPay SDK already loaded');
          setIsECPayReady(true);
          resolve();
          return;
        }

        // Check if script is already in the DOM (from index.html)
        const existingScript = document.querySelector('script[src*="logistics-stage.ecpay.com.tw"]');
        if (existingScript) {
          console.log('ECPay script found in DOM, waiting for initialization...');
          // Wait for it to load
          let attempts = 0;
          const maxAttempts = 100; // 10 seconds total
          const checkInterval = setInterval(() => {
            attempts++;
            // Check various possible ECPay object structures
            if (window.ECPay && window.ECPay.Logistics && window.ECPay.Logistics.Map) {
              console.log('ECPay SDK initialized successfully');
              clearInterval(checkInterval);
              setIsECPayReady(true);
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.error('ECPay SDK loading timeout. Window.ECPay:', window.ECPay);
              reject(new Error('ECPay SDK loading timeout'));
            }
          }, 100);
          return;
        }

        // Load the script dynamically
        console.log('Loading ECPay SDK dynamically...');
        setIsLoadingECPay(true);
        const script = document.createElement('script');
        script.src = 'https://logistics-stage.ecpay.com.tw/Express/map/sdk/Map.js';
        script.async = true;
        script.onload = () => {
          console.log('ECPay script loaded, waiting for initialization...');
          // Wait a bit for ECPay to initialize
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds total
          const checkInterval = setInterval(() => {
            attempts++;
            if (window.ECPay && window.ECPay.Logistics && window.ECPay.Logistics.Map) {
              console.log('ECPay SDK initialized successfully');
              clearInterval(checkInterval);
              setIsECPayReady(true);
              setIsLoadingECPay(false);
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.error('ECPay SDK initialization timeout. Window.ECPay:', window.ECPay);
              setIsLoadingECPay(false);
              reject(new Error('ECPay SDK initialization timeout'));
            }
          }, 100);
        };
        script.onerror = (error) => {
          console.error('Failed to load ECPay SDK script:', error);
          setIsLoadingECPay(false);
          reject(new Error('Failed to load ECPay SDK'));
        };
        document.head.appendChild(script);
      });
    };

    // Store the function reference for retry
    loadECPaySDKRef.current = loadECPaySDK;

    loadECPaySDK().catch((error) => {
      console.error('Error loading ECPay SDK:', error);
      setIsLoadingECPay(false);
      setEcpayError('SDK 載入失敗，請檢查瀏覽器控制台或重新整理頁面');
    });
  }, []);

  const retryLoadECPay = () => {
    if (loadECPaySDKRef.current) {
      setIsECPayReady(false);
      setIsLoadingECPay(true);
      setEcpayError(null);
      loadECPaySDKRef.current().catch((error) => {
        console.error('Error retrying ECPay SDK load:', error);
        setIsLoadingECPay(false);
        setEcpayError('SDK 載入失敗，請檢查網路連線或重新整理頁面');
      });
    }
  };

  useEffect(() => {
    // Listen for postMessage from ECPay callback
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin for security
      if (event.data && event.data.type === 'ECPAY_STORE_SELECTED') {
        setSelectedStore(event.data.data);
        // Close the iframe if it exists
        if (callbackIframeRef.current) {
          callbackIframeRef.current.style.display = 'none';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const openStoreMap = async () => {
    // Wait for SDK to be ready
    if (!isECPayReady) {
      if (isLoadingECPay) {
        alert('ECPay SDK 正在載入中，請稍候...');
      } else {
        alert('ECPay SDK 尚未載入，請重新整理頁面後再試');
      }
      return;
    }

    // Double check before calling
    if (!window.ECPay) {
      console.error('window.ECPay is not available');
      alert('ECPay SDK 尚未載入，請重新整理頁面後再試');
      return;
    }

    if (!window.ECPay.Logistics) {
      console.error('window.ECPay.Logistics is not available');
      alert('ECPay SDK 尚未載入，請重新整理頁面後再試');
      return;
    }

    if (!window.ECPay.Logistics.Map) {
      console.error('window.ECPay.Logistics.Map is not available');
      console.log('Available ECPay object:', window.ECPay);
      alert('ECPay SDK Map 功能尚未載入，請重新整理頁面後再試');
      return;
    }

    const baseUrl = window.location.origin;
    // Use the iframe name as target, ECPay will POST to this iframe
    const callbackUrl = `${baseUrl}/ecpay-callback`;

    try {
      // Show the iframe before opening map
      if (callbackIframeRef.current) {
        callbackIframeRef.current.style.display = 'block';
      }

      window.ECPay.Logistics.Map({
        MerchantID: '2000933',
        LogisticsType: 'CVS',
        LogisticsSubType: storeChain,
        IsCollection: 'N',
        ServerReplyURL: callbackUrl,
        ExtraData: '',
        Device: 0, // 0 for desktop, 1 for mobile
      });
    } catch (error) {
      console.error('Error opening ECPay store map:', error);
      alert('無法開啟門市地圖，請稍候再試');
      if (callbackIframeRef.current) {
        callbackIframeRef.current.style.display = 'none';
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (deliveryMethod === 'convenience_store' && !selectedStore) {
      alert('請選擇取貨門市');
      return;
    }

    if (deliveryMethod === 'home') {
      const formData = new FormData(e.currentTarget);
      const address = formData.get('address');
      if (!address) {
        alert('請填寫配送地址');
        return;
      }
    }

    alert('訂單已送出！感謝您的購買。');
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-8 sm:p-4">
      <div className="max-w-[1000px] mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray text-sm mb-8 transition-colors duration-300 hover:text-black">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回購物
        </Link>

        <h1 className="text-3xl font-normal tracking-[0.1em] mb-8">結帳</h1>

        <div className="grid grid-cols-[1fr_400px] gap-12 lg:grid-cols-1 lg:gap-0">
          <div className="bg-white p-8 border border-[#e5e5e5] lg:order-2 sm:p-6">
            <h2 className="text-xl font-normal tracking-[0.05em] mb-6 pb-4 border-b border-[#e5e5e5]">配送資訊</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm text-gray mb-2 tracking-[0.05em]">姓名</label>
                <input type="text" id="name" name="name" className="w-full py-3 px-4 border border-[#e5e5e5] text-[0.95rem] font-inherit transition-colors duration-300 focus:outline-none focus:border-black" required />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm text-gray mb-2 tracking-[0.05em]">電子郵件</label>
                <input type="email" id="email" name="email" className="w-full py-3 px-4 border border-[#e5e5e5] text-[0.95rem] font-inherit transition-colors duration-300 focus:outline-none focus:border-black" required />
              </div>
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm text-gray mb-2 tracking-[0.05em]">電話</label>
                <input type="tel" id="phone" name="phone" className="w-full py-3 px-4 border border-[#e5e5e5] text-[0.95rem] font-inherit transition-colors duration-300 focus:outline-none focus:border-black" required />
              </div>

              {/* Delivery Method Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray mb-3 tracking-[0.05em]">配送方式</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="home"
                      checked={deliveryMethod === 'home'}
                      onChange={(e) => {
                        setDeliveryMethod(e.target.value as DeliveryMethod);
                        setSelectedStore(null);
                      }}
                      className="w-4 h-4 text-black border-[#e5e5e5] focus:ring-black focus:ring-2"
                    />
                    <span className="text-[0.95rem]">宅配到府</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="convenience_store"
                      checked={deliveryMethod === 'convenience_store'}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                      className="w-4 h-4 text-black border-[#e5e5e5] focus:ring-black focus:ring-2"
                    />
                    <span className="text-[0.95rem]">超商取貨</span>
                  </label>
                </div>
              </div>

              {/* Home Delivery Address */}
              {deliveryMethod === 'home' && (
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm text-gray mb-2 tracking-[0.05em]">配送地址</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="w-full py-3 px-4 border border-[#e5e5e5] text-[0.95rem] font-inherit transition-colors duration-300 focus:outline-none focus:border-black"
                    required
                  />
                </div>
              )}

              {/* Convenience Store Selection */}
              {deliveryMethod === 'convenience_store' && (
                <div className="mb-6">
                  <label className="block text-sm text-gray mb-2 tracking-[0.05em]">選擇超商</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storeChain"
                        value="FAMI"
                        checked={storeChain === 'FAMI'}
                        onChange={(e) => {
                          setStoreChain(e.target.value as ConvenienceStoreChain);
                          setSelectedStore(null);
                        }}
                        className="w-4 h-4 text-black border-[#e5e5e5] focus:ring-black focus:ring-2"
                      />
                      <span className="text-[0.95rem]">全家便利商店</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storeChain"
                        value="UNIMART"
                        checked={storeChain === 'UNIMART'}
                        onChange={(e) => {
                          setStoreChain(e.target.value as ConvenienceStoreChain);
                          setSelectedStore(null);
                        }}
                        className="w-4 h-4 text-black border-[#e5e5e5] focus:ring-black focus:ring-2"
                      />
                      <span className="text-[0.95rem]">7-ELEVEN</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={openStoreMap}
                      disabled={!isECPayReady || isLoadingECPay}
                      className="w-full py-3 px-4 border-2 border-black text-black bg-white text-[0.95rem] tracking-[0.05em] cursor-pointer transition-colors duration-300 hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
                    >
                      {isLoadingECPay
                        ? '載入中...'
                        : !isECPayReady
                        ? 'SDK 載入中...'
                        : selectedStore
                        ? '重新選擇門市'
                        : '選擇取貨門市'}
                    </button>
                    {ecpayError && (
                      <div className="text-sm text-red-600 text-center">
                        <p>{ecpayError}</p>
                        <button
                          type="button"
                          onClick={retryLoadECPay}
                          className="mt-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          重試載入 SDK
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedStore && (
                    <div className="mt-4 p-4 bg-[#f9f9f9] border border-[#e5e5e5]">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-[0.95rem] font-medium">{selectedStore.CVSStoreName}</h3>
                        <button
                          type="button"
                          onClick={() => setSelectedStore(null)}
                          className="text-gray hover:text-black transition-colors"
                          aria-label="清除選擇"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray mb-1">門市編號：{selectedStore.CVSStoreID}</p>
                      <p className="text-sm text-gray">{selectedStore.CVSAddress}</p>
                      {selectedStore.CVSTelephone && (
                        <p className="text-sm text-gray mt-1">電話：{selectedStore.CVSTelephone}</p>
                      )}
                      {selectedStore.CVSOpenTime && (
                        <p className="text-sm text-gray mt-1">營業時間：{selectedStore.CVSOpenTime}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hidden iframe for ECPay callback */}
              <iframe
                ref={callbackIframeRef}
                name="ecpayResponseFrame"
                src="about:blank"
                style={{ display: 'none', width: '100%', height: '400px', border: 'none' }}
                title="ECPay Callback"
              />

              <button type="submit" className="w-full py-4 bg-black text-white border-0 text-[0.95rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-300 mt-4 hover:bg-[#333333] disabled:bg-[#cccccc] disabled:cursor-not-allowed" disabled={cartItems.length === 0}>
                確認訂購
              </button>
            </form>
          </div>

          <div className="bg-white p-8 border border-[#e5e5e5] lg:order-1 lg:mb-8 sm:p-6">
            <h2 className="text-xl font-normal tracking-[0.05em] mb-6 pb-4 border-b border-[#e5e5e5]">訂單摘要</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray text-center py-8">購物車是空的</p>
            ) : (
              <>
                <ul className="list-none p-0 m-0">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center py-4 border-b border-[#e5e5e5]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.95rem]">{item.name}</span>
                        <span className="text-sm text-gray">x {item.quantity}</span>
                      </div>
                      <span className="text-[0.95rem]">
                        NT${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center pt-6 mt-2 text-lg">
                  <span>總計</span>
                  <span className="text-xl font-medium">NT${getCartTotal().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

