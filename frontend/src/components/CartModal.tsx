import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartModal = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('cart-modal-overlay')) {
      closeCart();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex justify-end animate-[fadeIn_0.3s_ease] cart-modal-overlay" onClick={handleBackdropClick}>
      <div className="w-1/3 min-w-[320px] h-full bg-white flex flex-col animate-[slideIn_0.3s_ease] md:w-1/2 sm:w-full">
        <div className="flex justify-between items-center py-6 px-8 border-b border-[#e5e5e5] sm:px-6">
          <h2 className="text-xl font-normal tracking-[0.1em] m-0">購物車</h2>
          <button className="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-black transition-opacity duration-300 hover:opacity-60" onClick={closeCart} aria-label="關閉購物車">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-8 sm:px-6">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray text-[0.95rem]">
              <p>購物車是空的</p>
            </div>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-6">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 pb-6 border-b border-[#e5e5e5] last:border-0 last:pb-0">
                  <div className="w-20 h-20 sm:w-[60px] sm:h-[60px] flex-shrink-0 overflow-hidden bg-gray-light">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[0.95rem] font-normal m-0 mb-2 text-black">{item.name}</h3>
                    <p className="text-sm text-gray m-0">NT${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-3">
                    <div className="flex items-center gap-2 border border-[#e5e5e5]">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer text-lg text-black transition-colors duration-200 hover:bg-gray-light"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="減少數量"
                      >
                        −
                      </button>
                      <span className="min-w-[30px] text-center text-sm">{item.quantity}</span>
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer text-lg text-black transition-colors duration-200 hover:bg-gray-light"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="增加數量"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bg-transparent border-0 cursor-pointer p-1 text-[#999999] transition-colors duration-300 hover:text-[#cc0000]"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="移除商品"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="py-6 px-8 border-t border-[#e5e5e5] bg-white sm:px-6">
          <div className="flex justify-between items-center mb-6 text-base">
            <span>總計</span>
            <span className="text-xl font-medium">NT${getCartTotal().toFixed(2)}</span>
          </div>
          <button
            className="w-full py-4 bg-black text-white border-0 text-[0.95rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-300 hover:bg-[#333333] disabled:bg-[#cccccc] disabled:cursor-not-allowed"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            前往結帳
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;

