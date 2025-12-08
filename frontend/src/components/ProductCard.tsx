import { type MouseEvent } from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-light mb-4 group">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
        <button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black border border-black py-3 px-8 text-sm tracking-[0.1em] cursor-pointer opacity-0 md:opacity-100 transition-all duration-300 uppercase hover:bg-black hover:text-white group-hover:opacity-100 md:text-xs md:py-2.5 md:px-6"
          onClick={handleAddToCart}
        >
          加入購物車
        </button>
      </div>
      <div className="text-center">
        <h3 className="text-base font-normal m-0 mb-2 text-black tracking-[0.05em]">{product.name}</h3>
        <p className="text-[0.95rem] text-gray m-0 font-light">NT${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;

