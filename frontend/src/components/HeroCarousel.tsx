import { useState, useEffect } from 'react';
import type { CarouselImage } from '../types';

interface HeroCarouselProps {
  images: CarouselImage[];
}

const HeroCarousel = ({ images }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[70vh] max-h-[800px] min-h-[500px] overflow-hidden bg-gray-light md:h-[50vh] md:min-h-[400px]">
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={image.url} alt={image.alt} className="w-full h-full object-cover object-center" />
          </div>
        ))}
      </div>

      <button
        className="absolute top-1/2 -translate-y-1/2 left-8 md:left-4 bg-white/90 border-0 w-[50px] h-[50px] md:w-10 md:h-10 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 hover:bg-black hover:text-white"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hover:stroke-white">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        className="absolute top-1/2 -translate-y-1/2 right-8 md:right-4 bg-white/90 border-0 w-[50px] h-[50px] md:w-10 md:h-10 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 hover:bg-black hover:text-white"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hover:stroke-white">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className="absolute bottom-8 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 p-0 ${
              index === currentIndex
                ? 'bg-white border-white/80 scale-125'
                : 'bg-white/50 border-white/80 hover:bg-white hover:scale-125'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

