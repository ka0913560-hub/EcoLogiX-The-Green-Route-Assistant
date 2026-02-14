import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-bold mb-4">
                Eco<span className="gradient-text">LogiX</span>
              </h1>
              <p className="text-2xl text-gray-600 font-medium">
                The Green Route Assistant
              </p>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-powered route optimization that reduces fuel consumption, minimizes carbon emissions,
              and saves time for delivery trucks across India. Track live, optimize continuously, drive greener.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-6 justify-center mb-16">
              <Link href="/driver" className="btn-primary text-lg px-10 py-4">
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Driver Dashboard
                </span>
              </Link>

              <Link href="/admin" className="btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-10 py-4">
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Admin Dashboard
                </span>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="glass-card p-8 hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Live GPS Tracking</h3>
                <p className="text-gray-600">Real-time location updates with dynamic route recalculation based on live traffic conditions.</p>
              </div>

              <div className="glass-card p-8 hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">AI Route Optimizer</h3>
                <p className="text-gray-600">Multi-factor optimization considering traffic, weather, and ML predictions for maximum efficiency.</p>
              </div>

              <div className="glass-card p-8 hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Emission Tracking</h3>
                <p className="text-gray-600">Monitor fuel savings, CO₂ reduction, and time saved with comprehensive analytics dashboards.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">30%</div>
                <div className="text-gray-600 font-medium">Fuel Saved</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">40%</div>
                <div className="text-gray-600 font-medium">CO₂ Reduced</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">25%</div>
                <div className="text-gray-600 font-medium">Time Saved</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                <div className="text-gray-600 font-medium">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-8 text-center text-gray-600">
        <p>&copy; 2026 EcoLogiX. Making logistics greener, one route at a time. 🌱</p>
      </div>
    </div>
  );
}
