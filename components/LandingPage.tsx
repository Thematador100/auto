import React from 'react';
import { CONFIG } from '../config';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

const VEHICLE_TYPES = [
  { icon: '🚗', name: 'Standard Auto', desc: 'Cars, SUVs, Trucks', price: '$19.99' },
  { icon: '⚡', name: 'Electric Vehicle', desc: 'EV battery health + SoH', price: '$24.99' },
  { icon: '🚛', name: 'Commercial Truck', desc: '18-wheelers, DOT/FMCSA', price: '$39.99' },
  { icon: '🏕️', name: 'RV / Motorhome', desc: 'Habitability + mechanical', price: '$34.99' },
  { icon: '🏎️', name: 'Classic / Vintage', desc: 'Authenticity + provenance', price: '$29.99' },
  { icon: '🏍️', name: 'Motorcycle', desc: 'Frame, tires, brakes', price: '$14.99' },
];

const FEATURES = [
  {
    icon: '🔌',
    title: 'Bluetooth OBD Scanner',
    desc: 'Connect your OBD-II or J1939 adapter via Bluetooth. Read live data, fault codes, and EV battery health in real time.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Reports',
    desc: 'Multi-AI engine (Gemini, DeepSeek, OpenAI) generates professional inspection reports with prioritized recommendations.',
  },
  {
    icon: '🎤',
    title: 'Voice Assistant',
    desc: 'Hands-free dictation for notes and an AI assistant that answers your vehicle questions instantly.',
  },
  {
    icon: '🚛',
    title: 'Heavy-Duty J1939',
    desc: 'SAE J1939 CAN bus diagnostics for Class 6-8 trucks. SPN/FMI codes, DPF/DEF monitoring, DOT compliance.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Licensing',
    desc: 'Admin controls for team access, feature flags, territory management, and revenue share tracking.',
  },
  {
    icon: '📄',
    title: 'PDF Export & Sharing',
    desc: 'Generate branded PDF reports with photos, checklist results, and AI analysis. Share with clients instantly.',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToSignup }) => {
  return (
    <div className="min-h-screen bg-dark-bg text-light-text">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-bg to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold text-primary">{CONFIG.BRANDING.companyName}</div>
            <div className="flex gap-3">
              <button
                onClick={onNavigateToLogin}
                className="px-5 py-2 text-sm font-medium text-medium-text hover:text-light-text transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateToSignup}
                className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto pb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Professional Vehicle Inspections
              <span className="block text-primary mt-2">Powered by AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-medium-text mb-8 max-w-2xl mx-auto">
              The all-in-one inspection platform for autos, EVs, commercial trucks, RVs, classic cars, and motorcycles.
              Bluetooth OBD scanning, AI reports, and voice assistant built in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToSignup}
                className="px-8 py-3 bg-primary text-white font-semibold rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Start Free Trial
              </button>
              <button
                onClick={onNavigateToLogin}
                className="px-8 py-3 border border-dark-border text-light-text font-semibold rounded-lg text-lg hover:bg-dark-card transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Vehicle Types */}
      <section className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Every Vehicle Type Covered</h2>
          <p className="text-medium-text text-center mb-12 max-w-2xl mx-auto">
            From everyday sedans to 18-wheeler commercial fleets. Each inspection is tailored with type-specific checklists and compliance standards.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {VEHICLE_TYPES.map((vt) => (
              <div key={vt.name} className="bg-dark-bg rounded-xl p-4 text-center border border-dark-border hover:border-primary/50 transition-colors">
                <div className="text-4xl mb-3">{vt.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{vt.name}</h3>
                <p className="text-xs text-medium-text mb-2">{vt.desc}</p>
                <span className="text-xs font-bold text-primary">{vt.price}/report</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-medium-text text-center mb-12 max-w-2xl mx-auto">
            Professional-grade tools that work together seamlessly. Connect your scanner, run the inspection, generate the report.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-medium-text text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Select Vehicle Type', desc: 'Choose from 6 types. The checklist auto-configures for that vehicle.' },
              { step: '2', title: 'Run Inspection', desc: 'Go through the checklist, take photos, connect your OBD scanner for diagnostics.' },
              { step: '3', title: 'AI Analysis', desc: 'Our multi-AI engine generates a professional report with prioritized findings.' },
              { step: '4', title: 'Share Report', desc: 'Download the branded PDF or share it directly with your client.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-medium-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* DIY */}
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <h3 className="text-xl font-bold mb-2">DIY Buyer</h3>
              <p className="text-medium-text text-sm mb-4">Perfect for individuals buying a used vehicle</p>
              <div className="text-3xl font-bold mb-6">From $14.99 <span className="text-base font-normal text-medium-text">/ report</span></div>
              <ul className="space-y-3 mb-8">
                {['Pay per inspection', 'AI-powered report', 'OBD scanner support', 'PDF download', 'Photo documentation'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onNavigateToSignup}
                className="w-full py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
              >
                Buy a Report
              </button>
            </div>
            {/* Pro */}
            <div className="bg-dark-card rounded-xl p-8 border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Pro Inspector</h3>
              <p className="text-medium-text text-sm mb-4">For professional inspectors and shops</p>
              <div className="text-3xl font-bold mb-6">$49.99 <span className="text-base font-normal text-medium-text">/ month</span></div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited inspections',
                  'All vehicle types',
                  'J1939 heavy-duty diagnostics',
                  'EV battery health analysis',
                  'Voice assistant & dictation',
                  'Team management',
                  'Branded PDF reports',
                  '14-day free trial',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onNavigateToSignup}
                className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-purple-900/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-medium-text mb-8">
            Join thousands of inspectors using AI Auto Pro. Start your 14-day free trial today.
          </p>
          <button
            onClick={onNavigateToSignup}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-dark-card border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-medium-text">
          <p>&copy; {new Date().getFullYear()} {CONFIG.BRANDING.companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
