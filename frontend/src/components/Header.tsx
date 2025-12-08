import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartModal from './CartModal';
import LoginModal from './LoginModal';

const Header = () => {
  const { getCartCount, openCart } = useCart();
  const { openLogin } = useAuth();
  const cartCount = getCartCount();

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-[#e5e5e5] z-[1000]">
        <div className="max-w-container mx-auto px-8 py-6 flex justify-between items-center lg:px-6 lg:py-4 md:px-4 md:py-3">
          <Link to="/" className="logo">
            <h1 className="text-2xl md:text-xl font-normal tracking-[0.3em] m-0 text-black">0705CZ</h1>
          </Link>

          <nav className="hidden lg:flex gap-10">
            <button className="bg-transparent border-0 text-[0.95rem] tracking-[0.05em] cursor-pointer text-black transition-opacity duration-300 p-0 uppercase hover:opacity-60">商店</button>
            <button className="bg-transparent border-0 text-[0.95rem] tracking-[0.05em] cursor-pointer text-black transition-opacity duration-300 p-0 uppercase hover:opacity-60">關於</button>
            <button className="bg-transparent border-0 text-[0.95rem] tracking-[0.05em] cursor-pointer text-black transition-opacity duration-300 p-0 uppercase hover:opacity-60">聯絡我們</button>
          </nav>

          <div className="flex gap-6 items-center">
            <button className="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-black transition-opacity duration-300 relative hover:opacity-60" aria-label="搜尋">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            <button className="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-black transition-opacity duration-300 relative hover:opacity-60" aria-label="會員帳號" onClick={openLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            <button className="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-black transition-opacity duration-300 relative hover:opacity-60" aria-label="購物車" onClick={openCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="absolute top-0 right-0 bg-black text-white text-[0.7rem] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
      <CartModal />
      <LoginModal />
    </>
  );
};

export default Header;

