function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Apex Roofing</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#services" className="text-gray-600 hover:text-gray-900">Services</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <section className="relative bg-gray-900 text-white py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Quality Roofing Solutions</h2>
            <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl">
              Professional roofing services for residential and commercial properties. 
              Licensed, insured, and committed to excellence.
            </p>
            <div className="mt-8">
              <a href="#contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500">
                Get a Free Estimate
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">&copy; 2024 Apex Roofing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;