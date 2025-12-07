import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="section-title">精選醬料</h2>
        <p className="section-subtitle">嚴選頂級醬料，為您的料理增添風味</p>
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

