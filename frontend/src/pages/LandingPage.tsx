import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Using lucide-react for icons as per your original LandingPage.tsx
import { ArrowRight, CheckCircle, Zap, Brain, Calendar } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    // Animate header on mount
    setTimeout(() => setHeaderVisible(true), 100);
    // Animate hero section shortly after
    setTimeout(() => setHeroVisible(true), 300);

    // Intersection Observer for features and CTA sections
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Trigger when 10% of the element is visible
    };

    const featuresSection = document.getElementById('features-section');
    const ctaSection = document.getElementById('cta-section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'features-section') {
            setFeaturesVisible(true);
          } else if (entry.target.id === 'cta-section') {
            setCtaVisible(true);
          }
        }
      });
    }, observerOptions);

    if (featuresSection) observer.observe(featuresSection);
    if (ctaSection) observer.observe(ctaSection);

    // Cleanup observer on unmount
    return () => {
      if (featuresSection) observer.unobserve(featuresSection);
      if (ctaSection) observer.unobserve(ctaSection);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white font-sans">
      {/* Navigation */}
      <header className={`py-4 border-b border-[#3A3A3A] transition-all duration-700 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-7 w-7 text-[#FF8C00]" />
            <span className="font-bold text-2xl text-white">FocusFlow AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <button className="px-4 py-2 rounded-md text-white hover:bg-[#3A3A3A] transition duration-200 ease-in-out">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-2 rounded-md bg-[#FF8C00] text-white font-semibold hover:bg-[#E67E00] transition duration-200 ease-in-out">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`flex-grow py-20 flex items-center justify-center text-center bg-gradient-to-b from-[#1A1A1A] to-[#282828] transition-all duration-1000 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up">
            Unlock Your Peak <span className="text-[#FF8C00]">Productivity</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Harness the power of AI to effortlessly manage tasks, enhance focus, and streamline your workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-400">
            <Link to="/signup">
              <button className="px-8 py-4 text-lg bg-[#FF8C00] text-white rounded-md font-semibold hover:bg-[#E67E00] transition duration-300 ease-in-out flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 text-lg border border-[#FF8C00] text-[#FF8C00] rounded-md font-semibold hover:bg-[#FF8C00] hover:text-white transition duration-300 ease-in-out">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Designed for <span className="text-[#FF8C00]">High Performance</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-6 bg-[#282828] rounded-lg shadow-lg border border-[#3A3A3A] transform transition-all duration-700 ease-out ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-7 w-7 text-[#FF8C00]" />
                <h3 className="text-xl font-semibold text-white">Smart Task Management</h3>
              </div>
              <p className="text-gray-400">
                Prioritize and organize tasks efficiently with AI-powered suggestions
                based on your working patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 bg-[#282828] rounded-lg shadow-lg border border-[#3A3A3A] transform transition-all duration-700 ease-out delay-100 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-7 w-7 text-[#FF8C00]" />
                <h3 className="text-xl font-semibold text-white">Focus Sessions</h3>
              </div>
              <p className="text-gray-400">
                Boost productivity with customized focus sessions that adapt to your
                optimal work rhythms and minimize distractions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-6 bg-[#282828] rounded-lg shadow-lg border border-[#3A3A3A] transform transition-all duration-700 ease-out delay-200 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-7 w-7 text-[#FF8C00]" />
                <h3 className="text-xl font-semibold text-white">Smart Scheduling</h3>
              </div>
              <p className="text-gray-400">
                Let AI help you plan your day with intelligent calendar management
                that respects your energy levels and priorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className={`py-20 bg-[#282828] text-white text-center transition-all duration-700 ease-out ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to boost your productivity?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Join thousands of professionals who are getting more done with less stress.
          </p>
          <Link to="/signup">
            <button className="px-8 py-4 text-lg bg-[#FF8C00] text-white rounded-md font-semibold hover:bg-[#E67E00] transition duration-300 ease-in-out">
              Start Your Free Trial
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12 border-t border-[#3A3A3A]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-7 w-7 text-[#FF8C00]" />
                <span className="font-bold text-2xl text-white">FocusFlow AI</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Your AI-powered productivity partner for better focus and results.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-white">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition duration-200">Features</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Integrations</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-white">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition duration-200">About</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Blog</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-white">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition duration-200">Privacy</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Terms</Link></li>
                  <li><Link to="/" className="hover:text-white transition duration-200">Security</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-[#3A3A3A] mt-12 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} FocusFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
