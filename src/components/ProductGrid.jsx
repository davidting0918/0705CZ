import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="section-title">Featured Collection</h2>
        <p className="section-subtitle">Discover our carefully curated selection</p>
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
