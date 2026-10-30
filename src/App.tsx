import { Header, Footer } from './components/layout';
import { Hero, Services, ServiceArea, Financing, Reviews, Contact } from './components/sections';
import { WhopPixelEvents } from './components/tracking';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <WhopPixelEvents />
      <Header />
      <main className="pt-16 md:pt-20">
        <Hero />
        <Services />
        <ServiceArea />
        <Financing />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
