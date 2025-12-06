import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="section-title">新鮮食材</h2>
        <p className="section-subtitle">嚴選當季優質食材，新鮮直送到府</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
