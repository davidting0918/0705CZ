import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import { carouselImages, products } from './data/demoData';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <HeroCarousel images={carouselImages} />
        <ProductGrid products={products} />
      </main>
    </div>
  );
}

export default App;
