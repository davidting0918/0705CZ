import { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm text-gray mb-2 tracking-[0.05em]">配送地址</label>
                <input type="text" id="address" name="address" className="w-full py-3 px-4 border border-[#e5e5e5] text-[0.95rem] font-inherit transition-colors duration-300 focus:outline-none focus:border-black" required />
              </div>

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

