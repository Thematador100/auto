import React, { useState } from 'react';
import { SEO } from './SEO';
import { useFeatureFlag } from '../services/featureFlags';

interface InspectionQuoteForm {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  location: string;
  name: string;
  email: string;
  phone: string;
}

export const PublicLandingPage: React.FC = () => {
  const aiSeoEnabled = useFeatureFlag('aiSeoOptimization');
  const [quoteForm, setQuoteForm] = useState<InspectionQuoteForm>({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    location: '',
    name: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send to backend
    console.log('Quote request:', quoteForm);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setQuoteForm({
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        location: '',
        name: '',
        email: '',
        phone: ''
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setQuoteForm({
      ...quoteForm,
      [e.target.name]: e.target.value
    });
  };

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: 'Auto Inspection Pro',
    description: 'Professional mobile car inspection services for pre-purchase inspections, diagnostics, and vehicle assessments',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    priceRange: '$$',
    telephone: '+1-555-AUTO-PRO',
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    serviceType: ['Car Inspection', 'Vehicle Inspection', 'Pre-Purchase Inspection', 'Mobile Mechanic'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1250'
    }
  };

  return (
    <>
      <SEO
        title="Professional Car Inspection Services | Auto Inspection Pro"
        description="Get a comprehensive pre-purchase car inspection from certified professionals. Mobile inspection service with detailed reports, AI-powered diagnostics, and instant results. Book your vehicle inspection today!"
        keywords="car inspection near me, pre-purchase inspection, mobile car inspection, vehicle inspection, used car inspection, auto inspection service, certified car inspector"
        ogType="website"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Professional Car Inspections
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2">
                  Before You Buy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Don't risk buying a lemon. Get a comprehensive AI-powered inspection from certified professionals. Mobile service available nationwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#quote"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Free Quote
                </a>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all border border-gray-700"
                >
                  How It Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">15,000+</div>
                <div className="text-gray-400">Inspections Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">4.9/5</div>
                <div className="text-gray-400">Customer Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-gray-400">Available Service</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-gray-400">Money Back Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why Choose Auto Inspection Pro?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI-Powered Analysis',
                  description: 'Advanced AI technology analyzes every aspect of the vehicle, providing insights that human eyes might miss.',
                  icon: '🤖'
                },
                {
                  title: 'Certified Inspectors',
                  description: 'ASE-certified technicians with years of experience in automotive diagnostics and inspection.',
                  icon: '👨‍🔧'
                },
                {
                  title: 'Detailed Reports',
                  description: 'Comprehensive inspection reports with photos, videos, and detailed findings delivered instantly.',
                  icon: '📊'
                },
                {
                  title: 'Mobile Service',
                  description: 'We come to you! Inspection at your home, office, or the seller\'s location.',
                  icon: '🚗'
                },
                {
                  title: 'OBD Diagnostics',
                  description: 'Professional OBD-II scanning to detect hidden issues and check engine codes.',
                  icon: '🔍'
                },
                {
                  title: 'Same-Day Results',
                  description: 'Get your detailed inspection report within hours, not days. Make informed decisions fast.',
                  icon: '⚡'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Request Quote', description: 'Fill out our simple form with vehicle details' },
                { step: '2', title: 'Schedule Inspection', description: 'Choose a convenient time and location' },
                { step: '3', title: 'Professional Inspection', description: 'Certified technician performs thorough check' },
                { step: '4', title: 'Receive Report', description: 'Get detailed results within hours' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Simple, Transparent Pricing
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Basic Inspection',
                  price: '$149',
                  features: [
                    'Visual inspection (150+ points)',
                    'Basic diagnostics',
                    'Photo documentation',
                    'Digital report',
                    'Same-day results'
                  ]
                },
                {
                  name: 'Premium Inspection',
                  price: '$299',
                  popular: true,
                  features: [
                    'Everything in Basic',
                    'OBD-II diagnostics',
                    'Test drive analysis',
                    'Vehicle history report',
                    'AI-powered insights',
                    'Video walkthrough'
                  ]
                },
                {
                  name: 'Elite Inspection',
                  price: '$499',
                  features: [
                    'Everything in Premium',
                    'Paint thickness testing',
                    'Compression test',
                    'Undercarriage inspection',
                    'Negotiation support',
                    'Priority scheduling',
                    '30-day warranty'
                  ]
                }
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 p-8 rounded-xl border-2 ${
                    plan.popular ? 'border-blue-500 transform scale-105' : 'border-gray-700'
                  } hover:border-blue-500 transition-all`}
                >
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-blue-400 mb-6">{plan.price}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#quote"
                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote" className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              Get Your Free Quote
            </h2>
            <p className="text-gray-300 text-center mb-12">
              Fill out the form below and we'll get back to you within 1 hour with a customized quote.
            </p>

            {submitted ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">We've received your request and will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Make
                    </label>
                    <input
                      type="text"
                      name="vehicleMake"
                      value={quoteForm.vehicleMake}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Toyota"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={quoteForm.vehicleModel}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Camry"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      name="vehicleYear"
                      value={quoteForm.vehicleYear}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 2020"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={quoteForm.location}
                      onChange={handleInputChange}
                      required
                      placeholder="City, State"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={quoteForm.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={quoteForm.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={quoteForm.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  Get Free Quote
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              What Our Customers Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'First-time Car Buyer',
                  text: 'Saved me from buying a car with hidden damage! The inspection was thorough and the report was easy to understand.',
                  rating: 5
                },
                {
                  name: 'Mike Chen',
                  role: 'Used Car Dealer',
                  text: 'I use Auto Inspection Pro for all my inventory checks. Professional, fast, and incredibly detailed reports.',
                  rating: 5
                },
                {
                  name: 'Emily Rodriguez',
                  role: 'Car Enthusiast',
                  text: 'The AI-powered analysis caught issues that even I missed. Worth every penny for peace of mind.',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make a Smart Car Purchase?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Don't risk thousands of dollars on a vehicle with hidden problems. Get professional inspection today.
            </p>
            <a
              href="#quote"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg"
            >
              Schedule Your Inspection Now
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Auto Inspection Pro</h3>
                <p className="text-gray-400 text-sm">
                  Professional car inspection services nationwide.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-blue-400">Pre-Purchase Inspection</a></li>
                  <li><a href="#" className="hover:text-blue-400">OBD Diagnostics</a></li>
                  <li><a href="#" className="hover:text-blue-400">Mobile Service</a></li>
                  <li><a href="#" className="hover:text-blue-400">Fleet Inspections</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="/leads" className="hover:text-blue-400">For Entrepreneurs</a></li>
                  <li><a href="/affiliate" className="hover:text-blue-400">Affiliate Program</a></li>
                  <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📞 +1-555-AUTO-PRO</li>
                  <li>📧 info@autoinspectionpro.com</li>
                  <li>🕐 24/7 Available</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Auto Inspection Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicLandingPage;
