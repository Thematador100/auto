import React, { useState } from 'react';
import { SEO } from './SEO';

interface AffiliateForm {
  name: string;
  email: string;
  phone: string;
  website: string;
  audienceSize: string;
  platform: string;
  experience: string;
}

export const AffiliatePage: React.FC = () => {
  const [form, setForm] = useState<AffiliateForm>({
    name: '',
    email: '',
    phone: '',
    website: '',
    audienceSize: '',
    platform: '',
    experience: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Affiliate application:', form);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        website: '',
        audienceSize: '',
        platform: '',
        experience: ''
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Auto Inspection Pro Affiliate Program',
    description: 'Earn commission promoting professional car inspection services',
    provider: {
      '@type': 'Organization',
      name: 'Auto Inspection Pro'
    }
  };

  return (
    <>
      <SEO
        title="Affiliate Program - Earn Up to 30% Commission | Auto Inspection Pro"
        description="Join our affiliate program and earn generous commissions promoting professional car inspection services. High conversion rates, recurring commissions, and dedicated support. Start earning today!"
        keywords="affiliate program, car inspection affiliate, automotive affiliate, referral program, earn commission, passive income"
        ogType="website"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Earn Passive Income
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mt-2">
                  With Our Affiliate Program
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Promote professional car inspection services and earn up to 30% commission on every sale. Perfect for automotive bloggers, YouTubers, and influencers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#join"
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Join Free Today
                </a>
                <a
                  href="#earnings"
                  className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all border border-gray-700"
                >
                  See Earnings Potential
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Stats */}
        <section className="py-12 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">30%</div>
                <div className="text-gray-400">Commission Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">$60</div>
                <div className="text-gray-400">Avg. Commission</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">90 Days</div>
                <div className="text-gray-400">Cookie Duration</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-gray-400">Affiliate Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why Join Our Affiliate Program?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'High Commissions',
                  description: 'Earn 20-30% commission on every sale. Our premium inspection packages mean bigger payouts for you.',
                  icon: '💰'
                },
                {
                  title: 'Long Cookie Duration',
                  description: '90-day cookie window ensures you get credit for sales even if customers don\'t buy immediately.',
                  icon: '⏰'
                },
                {
                  title: 'Recurring Revenue',
                  description: 'Earn on repeat customers and subscription plans. Build passive income that grows over time.',
                  icon: '🔄'
                },
                {
                  title: 'Marketing Materials',
                  description: 'Access to banners, landing pages, email templates, and social media content ready to use.',
                  icon: '🎨'
                },
                {
                  title: 'Real-Time Tracking',
                  description: 'Advanced dashboard with real-time stats, conversion tracking, and detailed analytics.',
                  icon: '📊'
                },
                {
                  title: 'Reliable Payouts',
                  description: 'Get paid on time, every time. Multiple payment options including PayPal, wire, and direct deposit.',
                  icon: '✅'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section id="earnings" className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Commission Structure
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  tier: 'Starter',
                  sales: '0-25 sales/month',
                  rate: '20%',
                  example: '$149 inspection = $30 commission'
                },
                {
                  tier: 'Professional',
                  sales: '26-50 sales/month',
                  rate: '25%',
                  popular: true,
                  example: '$299 inspection = $75 commission'
                },
                {
                  tier: 'Elite',
                  sales: '50+ sales/month',
                  rate: '30%',
                  example: '$499 inspection = $150 commission'
                }
              ].map((tier, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 p-8 rounded-xl border-2 ${
                    tier.popular ? 'border-purple-500 transform scale-105' : 'border-gray-700'
                  } hover:border-purple-500 transition-all`}
                >
                  {tier.popular && (
                    <div className="bg-purple-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Common
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.tier}</h3>
                  <div className="text-sm text-gray-400 mb-4">{tier.sales}</div>
                  <div className="text-5xl font-bold text-purple-400 mb-6">{tier.rate}</div>
                  <div className="text-gray-300 text-sm bg-gray-700/50 p-4 rounded-lg">
                    <div className="font-semibold mb-2">Example:</div>
                    {tier.example}
                  </div>
                </div>
              ))}
            </div>

            {/* Earnings Calculator */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white text-center mb-8">
                  Monthly Earnings Calculator
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">10 Sales/Month</div>
                    <div className="text-3xl font-bold text-purple-400">$400</div>
                    <div className="text-sm text-gray-500 mt-1">@ $200 avg × 20%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">30 Sales/Month</div>
                    <div className="text-3xl font-bold text-purple-400">$1,875</div>
                    <div className="text-sm text-gray-500 mt-1">@ $250 avg × 25%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">100 Sales/Month</div>
                    <div className="text-3xl font-bold text-purple-400">$9,000</div>
                    <div className="text-sm text-gray-500 mt-1">@ $300 avg × 30%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Sign Up Free', description: 'Join our affiliate program in minutes. No fees, no obligations.' },
                { step: '2', title: 'Get Your Link', description: 'Receive unique tracking links and promotional materials.' },
                { step: '3', title: 'Promote', description: 'Share with your audience through blog, social, email, or ads.' },
                { step: '4', title: 'Earn Money', description: 'Get paid commissions on every successful referral.' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perfect For Section */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Auto Bloggers', icon: '✍️', desc: 'Monetize your automotive content' },
                { title: 'YouTubers', icon: '🎥', desc: 'Add revenue to car review videos' },
                { title: 'Instagram Influencers', icon: '📱', desc: 'Share with car enthusiasts' },
                { title: 'Car Dealers', icon: '🚗', desc: 'Offer value-added services' },
                { title: 'Real Estate Agents', icon: '🏠', desc: 'Help relocating clients' },
                { title: 'Finance Professionals', icon: '💼', desc: 'Assist auto loan clients' },
                { title: 'Mechanics', icon: '🔧', desc: 'Refer pre-purchase inspections' },
                { title: 'Anyone!', icon: '👥', desc: 'Easy to promote to anyone buying cars' }
              ].map((audience, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all text-center">
                  <div className="text-4xl mb-3">{audience.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{audience.title}</h3>
                  <p className="text-sm text-gray-400">{audience.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marketing Tools */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Marketing Tools Provided
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Banner Ads',
                  description: 'Professional banners in all sizes (300×250, 728×90, 160×600, etc.)',
                  included: ['Static & animated versions', 'Multiple designs', 'High-converting creatives']
                },
                {
                  title: 'Landing Pages',
                  description: 'Pre-built, optimized landing pages that convert',
                  included: ['Mobile-responsive', 'A/B tested designs', 'Fast loading']
                },
                {
                  title: 'Email Templates',
                  description: 'Ready-to-send email campaigns',
                  included: ['Multiple templates', 'Proven copy', 'Easy customization']
                },
                {
                  title: 'Social Media Content',
                  description: 'Posts and graphics for all platforms',
                  included: ['Instagram posts', 'Facebook ads', 'Twitter content']
                },
                {
                  title: 'Video Assets',
                  description: 'Professional video content for promotion',
                  included: ['Explainer videos', 'Testimonials', 'Product demos']
                },
                {
                  title: 'Blog Content',
                  description: 'SEO-optimized articles you can publish',
                  included: ['Ready to publish', 'SEO optimized', 'Regular updates']
                }
              ].map((tool, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-3">{tool.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{tool.description}</p>
                  <ul className="space-y-2">
                    {tool.included.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-300">
                        <span className="text-purple-400 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Affiliate Dashboard Preview */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              Powerful Affiliate Dashboard
            </h2>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Track your performance with our advanced analytics dashboard
            </p>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Total Clicks</div>
                  <div className="text-3xl font-bold text-white mb-1">2,847</div>
                  <div className="text-sm text-green-400">↑ 12% this month</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Conversions</div>
                  <div className="text-3xl font-bold text-white mb-1">156</div>
                  <div className="text-sm text-green-400">↑ 8% this month</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Earnings</div>
                  <div className="text-3xl font-bold text-purple-400 mb-1">$3,744</div>
                  <div className="text-sm text-green-400">↑ 15% this month</div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Features:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Real-time click tracking',
                    'Conversion analytics',
                    'Revenue reports',
                    'Top performing links',
                    'Geographic data',
                    'Device breakdown',
                    'Payment history',
                    'Referral sub-affiliates'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <span className="text-purple-400 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Affiliate Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'CarReviewPro',
                  type: 'YouTube Channel',
                  earnings: '$8,500/month',
                  text: 'I mention Auto Inspection Pro in every car review video. It\'s relevant to my audience and the commissions are fantastic.'
                },
                {
                  name: 'AutoBlogger',
                  type: 'Automotive Blog',
                  earnings: '$5,200/month',
                  text: 'Added affiliate links to my used car buying guide. Passive income that keeps growing every month.'
                },
                {
                  name: 'Mike\'s Motors',
                  type: 'Independent Dealer',
                  earnings: '$12,000/month',
                  text: 'Recommend inspections to all my buyers. Win-win: they get peace of mind, I earn commission.'
                }
              ].map((story, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="text-purple-400 font-bold text-xl mb-2">{story.earnings}</div>
                  <p className="text-gray-300 mb-4 italic">"{story.text}"</p>
                  <div>
                    <div className="font-semibold text-white">{story.name}</div>
                    <div className="text-sm text-gray-400">{story.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="join" className="py-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              Join Our Affiliate Program
            </h2>
            <p className="text-gray-300 text-center mb-12">
              Sign up free and start earning commissions today. Approval usually within 24 hours.
            </p>

            {submitted ? (
              <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
                <p className="text-gray-300">We'll review your application and get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website/Social URL *
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleInputChange}
                        required
                        placeholder="https://yourblog.com"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Audience Size *
                      </label>
                      <select
                        name="audienceSize"
                        value={form.audienceSize}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select...</option>
                        <option value="1k-5k">1,000 - 5,000</option>
                        <option value="5k-10k">5,000 - 10,000</option>
                        <option value="10k-50k">10,000 - 50,000</option>
                        <option value="50k-100k">50,000 - 100,000</option>
                        <option value="100k+">100,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Platform *
                      </label>
                      <select
                        name="platform"
                        value={form.platform}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select...</option>
                        <option value="blog">Blog/Website</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="facebook">Facebook</option>
                        <option value="email">Email List</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How will you promote us? *
                    </label>
                    <textarea
                      name="experience"
                      value={form.experience}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Tell us about your platform, audience, and promotion strategy..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    Submit Application
                  </button>

                  <p className="text-sm text-gray-400 text-center">
                    By submitting, you agree to our affiliate terms and conditions.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Is there a cost to join?',
                  a: 'No! Our affiliate program is completely free to join with no hidden fees or obligations.'
                },
                {
                  q: 'When do I get paid?',
                  a: 'Commissions are paid monthly on the 15th via PayPal, direct deposit, or wire transfer. Minimum payout is $50.'
                },
                {
                  q: 'How long is the cookie duration?',
                  a: '90 days. If someone clicks your link and makes a purchase within 90 days, you earn the commission.'
                },
                {
                  q: 'Do I need a large audience?',
                  a: 'No! While larger audiences can drive more sales, even small, engaged audiences can be very profitable.'
                },
                {
                  q: 'Can I use paid advertising?',
                  a: 'Yes! You can use Google Ads, Facebook Ads, or any paid platform. We provide guidance on what works best.'
                },
                {
                  q: 'Do you offer recurring commissions?',
                  a: 'Yes! For customers who use our subscription plans, you earn recurring monthly commissions.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of affiliates earning passive income promoting our services.
            </p>
            <a
              href="#join"
              className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg"
            >
              Join Free - Start Earning Today
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
                  Premium affiliate program for automotive services.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">For Affiliates</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#join" className="hover:text-purple-400">Join Program</a></li>
                  <li><a href="#earnings" className="hover:text-purple-400">Earnings Calculator</a></li>
                  <li><a href="#" className="hover:text-purple-400">Affiliate Login</a></li>
                  <li><a href="#" className="hover:text-purple-400">Resources</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-purple-400">Help Center</a></li>
                  <li><a href="#" className="hover:text-purple-400">Marketing Materials</a></li>
                  <li><a href="#" className="hover:text-purple-400">Best Practices</a></li>
                  <li><a href="#" className="hover:text-purple-400">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📧 affiliates@autoinspectionpro.com</li>
                  <li>💬 Live Chat Support</li>
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

export default AffiliatePage;
