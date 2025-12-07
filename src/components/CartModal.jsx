import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartModal.css';

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

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('cart-modal-overlay')) {
      closeCart();
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={handleBackdropClick}>
      <div className="cart-modal">
        <div className="cart-modal-header">
          <h2>購物車</h2>
          <button className="close-btn" onClick={closeCart} aria-label="關閉購物車">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-modal-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>購物車是空的</p>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">NT${item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="減少數量"
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="增加數量"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
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

        <div className="cart-modal-footer">
          <div className="cart-total">
            <span>總計</span>
            <span className="total-amount">NT${getCartTotal().toFixed(2)}</span>
          </div>
          <button
            className="checkout-btn"
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

