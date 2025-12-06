import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="section-title">精選系列</h2>
        <p className="section-subtitle">探索我們精心策劃的臻選商品</p>
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
