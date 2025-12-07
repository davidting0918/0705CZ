import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import Checkout from './components/Checkout';
import { carouselImages, products } from './data/demoData';
import './App.css';

function HomePage() {
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;

