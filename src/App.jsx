import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import Login from './components/Login';
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
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
