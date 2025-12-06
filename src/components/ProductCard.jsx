import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <button className="add-to-cart-btn">加入購物車</button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">NT${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
