import ProductCard from './ProductCard';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <section className="max-w-container mx-auto px-8 py-20 lg:px-6 lg:py-16 md:px-6 md:py-12 sm:px-4 sm:py-8">
      <div className="text-center mb-16 md:mb-10 sm:mb-10">
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-light tracking-[0.15em] m-0 mb-4 text-black uppercase">精選醬料</h2>
        <p className="text-base sm:text-sm text-gray font-light tracking-[0.05em] m-0">嚴選頂級醬料，為您的料理增添風味</p>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-12 lg:gap-x-6 lg:gap-y-10 sm:gap-y-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;

