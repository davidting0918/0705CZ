import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';
import './Header.css';

const Header = () => {
  const { getCartCount, openCart } = useCart();
  const cartCount = getCartCount();

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <h1>0705CZ</h1>
          </Link>

          <nav className="nav-menu">
            <button className="nav-btn">商店</button>
            <button className="nav-btn">關於</button>
            <button className="nav-btn">聯絡我們</button>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" aria-label="搜尋">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            <Link to="/login" className="icon-btn" aria-label="會員帳號">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            <button className="icon-btn cart-btn" aria-label="購物車" onClick={openCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
      <CartModal />
    </>
  );
};

export default Header;
