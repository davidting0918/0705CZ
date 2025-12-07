import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('訂單已送出！感謝您的購買。');
    clearCart();
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <Link to="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回購物
        </Link>

        <h1 className="checkout-title">結帳</h1>

        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>配送資訊</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">電子郵件</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">電話</label>
                <input type="tel" id="phone" name="phone" required />
              </div>
              <div className="form-group">
                <label htmlFor="address">配送地址</label>
                <input type="text" id="address" name="address" required />
              </div>

              <button type="submit" className="submit-btn" disabled={cartItems.length === 0}>
                確認訂購
              </button>
            </form>
          </div>

          <div className="checkout-summary-section">
            <h2>訂單摘要</h2>
            {cartItems.length === 0 ? (
              <p className="empty-cart-message">購物車是空的</p>
            ) : (
              <>
                <ul className="summary-items">
                  {cartItems.map((item) => (
                    <li key={item.id} className="summary-item">
                      <div className="summary-item-info">
                        <span className="summary-item-name">{item.name}</span>
                        <span className="summary-item-qty">x {item.quantity}</span>
                      </div>
                      <span className="summary-item-price">
                        NT${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="summary-total">
                  <span>總計</span>
                  <span className="total-price">NT${getCartTotal().toFixed(2)}</span>
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

