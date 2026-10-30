import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import { Hero, Services, ServiceArea, Financing, Reviews, Contact } from './components/sections';
import { WhopPixelEvents } from './components/tracking';
import CheckoutPage from './pages/Checkout';
import CheckoutSuccessPage from './pages/CheckoutSuccess';

function App() {
  return (
    <BrowserRouter>
      <WhopPixelEvents />
      <Header />
      <main className="pt-16 md:pt-20">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Services />
                <ServiceArea />
                <Financing />
                <Reviews />
                <Contact />
              </>
            }
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
