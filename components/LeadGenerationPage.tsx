import React, { useState } from 'react';
import { SEO } from './SEO';

interface EntrepreneurForm {
  businessName: string;
  name: string;
  email: string;
  phone: string;
  serviceArea: string;
  businessType: string;
  leadsPerMonth: string;
  message: string;
}

export const LeadGenerationPage: React.FC = () => {
  const [form, setForm] = useState<EntrepreneurForm>({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    serviceArea: '',
    businessType: '',
    leadsPerMonth: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead request:', form);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setForm({
        businessName: '',
        name: '',
        email: '',
        phone: '',
        serviceArea: '',
        businessType: '',
        leadsPerMonth: '',
        message: ''
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
    '@type': 'Service',
    name: 'Auto Inspection Lead Generation',
    description: 'Qualified car inspection leads for automotive professionals and entrepreneurs',
    provider: {
      '@type': 'Organization',
      name: 'Auto Inspection Pro'
    },
    serviceType: 'Lead Generation',
    areaServed: 'United States'
  };

  return (
    <>
      <SEO
        title="Get High-Quality Car Inspection Leads | Auto Inspection Pro Partners"
        description="Generate qualified leads for your auto inspection business. Join our network of professional inspectors and receive pre-qualified customers ready to book inspections. Grow your automotive business today!"
        keywords="auto inspection leads, car inspection business, vehicle inspection franchise, automotive leads, inspection business opportunity, mobile mechanic leads"
        ogType="website"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Grow Your Auto Inspection Business
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mt-2">
                  With Qualified Leads
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join our network of professional inspectors and receive pre-qualified customers in your area. No more hunting for clients - we deliver them to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#apply"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Getting Leads
                </a>
                <a
                  href="#calculator"
                  className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all border border-gray-700"
                >
                  Income Calculator
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">$150K+</div>
                <div className="text-gray-400">Avg. Annual Revenue</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
                <div className="text-gray-400">Active Inspectors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">85%</div>
                <div className="text-gray-400">Lead Conversion Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
                <div className="text-gray-400">States Covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why Partner With Us?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Pre-Qualified Leads',
                  description: 'Every lead is verified and ready to book. No tire-kickers, only serious buyers who need inspections.',
                  icon: '🎯'
                },
                {
                  title: 'Flexible Schedule',
                  description: 'Accept leads on your terms. Work full-time or part-time - you control your schedule and workload.',
                  icon: '📅'
                },
                {
                  title: 'Professional Tools',
                  description: 'Access our AI-powered inspection platform, report generation, and customer management system.',
                  icon: '🛠️'
                },
                {
                  title: 'Marketing Support',
                  description: 'We handle all marketing and advertising. You focus on inspections while we bring the customers.',
                  icon: '📱'
                },
                {
                  title: 'Training & Certification',
                  description: 'Comprehensive training program and ongoing support to ensure you deliver top-quality service.',
                  icon: '🎓'
                },
                {
                  title: 'Guaranteed Payment',
                  description: 'Get paid quickly and reliably. We handle all payments and provide guaranteed income protection.',
                  icon: '💰'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              How Our Lead Program Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Apply & Get Approved', description: 'Submit your application and get verified within 48 hours' },
                { step: '2', title: 'Complete Training', description: 'Access our comprehensive training platform (2-3 days)' },
                { step: '3', title: 'Receive Leads', description: 'Start getting qualified leads in your service area' },
                { step: '4', title: 'Earn Revenue', description: 'Complete inspections and get paid weekly' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Income Calculator */}
        <section id="calculator" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              Calculate Your Potential Income
            </h2>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Conservative Estimate</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Inspections per week:</span>
                      <span className="font-semibold text-green-400">10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average price per inspection:</span>
                      <span className="font-semibold text-green-400">$200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your commission (70%):</span>
                      <span className="font-semibold text-green-400">$140</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Monthly Income:</span>
                        <span className="font-bold text-green-400 text-2xl">$5,600</span>
                      </div>
                      <div className="flex justify-between text-lg mt-2">
                        <span className="font-semibold">Annual Income:</span>
                        <span className="font-bold text-green-400 text-2xl">$67,200</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Aggressive Estimate</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Inspections per week:</span>
                      <span className="font-semibold text-green-400">25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average price per inspection:</span>
                      <span className="font-semibold text-green-400">$250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your commission (70%):</span>
                      <span className="font-semibold text-green-400">$175</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Monthly Income:</span>
                        <span className="font-bold text-green-400 text-2xl">$17,500</span>
                      </div>
                      <div className="flex justify-between text-lg mt-2">
                        <span className="font-semibold">Annual Income:</span>
                        <span className="font-bold text-green-400 text-2xl">$210,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-6 text-center">
                * Estimates based on current partner performance. Actual results may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Lead Packages
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter',
                  price: '$299/mo',
                  leads: '10-15 leads',
                  features: [
                    '10-15 qualified leads/month',
                    'Basic territory protection',
                    'Platform access',
                    'Email support',
                    '70% commission rate'
                  ]
                },
                {
                  name: 'Professional',
                  price: '$599/mo',
                  leads: '25-35 leads',
                  popular: true,
                  features: [
                    '25-35 qualified leads/month',
                    'Exclusive territory',
                    'Priority lead routing',
                    'Phone & email support',
                    '75% commission rate',
                    'Marketing materials'
                  ]
                },
                {
                  name: 'Enterprise',
                  price: '$999/mo',
                  leads: '50+ leads',
                  features: [
                    '50+ qualified leads/month',
                    'Exclusive metro territory',
                    'Premium lead routing',
                    'Dedicated account manager',
                    '80% commission rate',
                    'Custom branding',
                    'Team management tools'
                  ]
                }
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 p-8 rounded-xl border-2 ${
                    plan.popular ? 'border-green-500 transform scale-105' : 'border-gray-700'
                  } hover:border-green-500 transition-all`}
                >
                  {plan.popular && (
                    <div className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-green-400 mb-2">{plan.price}</div>
                  <div className="text-gray-400 mb-6">{plan.leads}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#apply"
                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-green-500 text-white hover:bg-green-600'
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

        {/* Application Form */}
        <section id="apply" className="py-20 bg-gradient-to-r from-green-900/30 to-blue-900/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              Apply to Join Our Network
            </h2>
            <p className="text-gray-300 text-center mb-12">
              Fill out the application below. We'll review and get back to you within 48 hours.
            </p>

            {submitted ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
                <p className="text-gray-300">We'll review your application and contact you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={form.businessName}
                        onChange={handleInputChange}
                        required
                        placeholder="Your Auto Services LLC"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Service Area
                      </label>
                      <input
                        type="text"
                        name="serviceArea"
                        value={form.serviceArea}
                        onChange={handleInputChange}
                        required
                        placeholder="City, State or ZIP"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select...</option>
                        <option value="independent">Independent Inspector</option>
                        <option value="mechanic">Mobile Mechanic</option>
                        <option value="dealer">Dealership</option>
                        <option value="shop">Auto Repair Shop</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Desired Leads Per Month
                    </label>
                    <select
                      name="leadsPerMonth"
                      value={form.leadsPerMonth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select...</option>
                      <option value="10-15">10-15 (Starter)</option>
                      <option value="25-35">25-35 (Professional)</option>
                      <option value="50+">50+ (Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tell Us About Your Experience
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Share your automotive background, certifications, and why you want to join our network..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Marcus Thompson',
                  role: 'Former Mechanic',
                  result: '$185K first year',
                  text: 'I went from working in a shop to running my own inspection business. The lead flow is consistent and the platform makes everything easy.'
                },
                {
                  name: 'Lisa Anderson',
                  role: 'Mobile Inspector',
                  result: '40 inspections/week',
                  text: 'I started part-time and within 6 months was doing this full-time. The training and support are excellent.'
                },
                {
                  name: 'David Park',
                  role: 'Auto Dealer',
                  result: '3 inspectors hired',
                  text: 'Started with the Enterprise plan and grew so fast I hired a team. Now managing multiple territories.'
                }
              ].map((story, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="text-green-400 font-bold text-lg mb-2">{story.result}</div>
                  <p className="text-gray-300 mb-4">"{story.text}"</p>
                  <div>
                    <div className="font-semibold text-white">{story.name}</div>
                    <div className="text-sm text-gray-400">{story.role}</div>
                  </div>
                </div>
              ))}
            </div>
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
                  q: 'Do I need special certifications?',
                  a: 'While ASE certification is preferred, it\'s not required. We provide comprehensive training for all partners.'
                },
                {
                  q: 'What equipment do I need?',
                  a: 'Basic tools, OBD-II scanner, camera/smartphone, and reliable transportation. We provide the inspection software and reporting platform.'
                },
                {
                  q: 'How quickly will I start getting leads?',
                  a: 'Most partners receive their first leads within 7 days of completing training and territory assignment.'
                },
                {
                  q: 'Can I choose which leads to accept?',
                  a: 'Yes! You have full control over which leads you accept based on your availability and preferences.'
                },
                {
                  q: 'What if a lead doesn\'t convert?',
                  a: 'You only pay for booked inspections. If a lead doesn\'t convert to a booking, it doesn\'t count against your monthly allocation.'
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
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join hundreds of successful inspectors earning consistent income with our lead program.
            </p>
            <a
              href="#apply"
              className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg"
            >
              Apply Now - Get Approved in 48 Hours
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
                  Empowering automotive professionals nationwide.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">For Partners</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#apply" className="hover:text-green-400">Apply Now</a></li>
                  <li><a href="#calculator" className="hover:text-green-400">Income Calculator</a></li>
                  <li><a href="/affiliate" className="hover:text-green-400">Affiliate Program</a></li>
                  <li><a href="#" className="hover:text-green-400">Partner Login</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-green-400">Training Portal</a></li>
                  <li><a href="#" className="hover:text-green-400">Support Center</a></li>
                  <li><a href="#" className="hover:text-green-400">Blog</a></li>
                  <li><a href="#" className="hover:text-green-400">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📞 +1-555-LEADS-PRO</li>
                  <li>📧 partners@autoinspectionpro.com</li>
                  <li>🕐 Mon-Fri 9AM-6PM EST</li>
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

export default LeadGenerationPage;
