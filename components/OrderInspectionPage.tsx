import React, { useState } from 'react';
import { CONFIG } from '../config';

interface OrderFormData {
  vehicleType: string;
  vin: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  preferredDate: string;
  notes: string;
}

export const OrderInspectionPage: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    vehicleType: 'Standard Car/SUV',
    vin: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
    preferredDate: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend API
    console.log('Order submitted:', formData);
    setSubmitted(true);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mobileInspections = CONFIG.PRICING.mobileInspections;
  const selectedPrice = mobileInspections[formData.vehicleType];

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-dark-card border border-primary rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-light-text mb-4">Order Received!</h2>
            <p className="text-medium-text text-lg mb-6">
              Thank you for choosing AI Auto Pro. We'll contact you within 24 hours to schedule your mobile inspection.
            </p>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-6 mb-6 text-left">
              <h3 className="text-xl font-semibold text-light-text mb-4">Order Summary</h3>
              <div className="space-y-2 text-medium-text">
                <p><strong className="text-light-text">Service:</strong> {formData.vehicleType} Mobile Inspection</p>
                <p><strong className="text-light-text">Price:</strong> ${selectedPrice?.price.toFixed(2)}</p>
                <p><strong className="text-light-text">Location:</strong> {formData.location}</p>
                <p><strong className="text-light-text">Preferred Date:</strong> {formData.preferredDate}</p>
                <p><strong className="text-light-text">Email:</strong> {formData.customerEmail}</p>
              </div>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Submit Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold mb-6">Professional Mobile Vehicle Inspections</h1>
          <p className="text-xl mb-4 max-w-3xl mx-auto">
            Certified inspectors come to you. We inspect cars, trucks, RVs, commercial vehicles, classic cars, motorcycles, and more.
          </p>
          <p className="text-2xl font-bold">
            Starting at ${mobileInspections['Standard Car/SUV'].price}
            <span className="text-sm ml-2 line-through opacity-75">${mobileInspections['Standard Car/SUV'].originalPrice}</span>
            <span className="ml-2 bg-white text-primary px-3 py-1 rounded-full text-sm font-semibold">Save 5%</span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-dark-card border border-primary rounded-lg p-6 text-center">
            <div className="text-primary text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-bold text-light-text mb-2">We Come To You</h3>
            <p className="text-medium-text">Mobile inspections at your location - home, dealer, or anywhere convenient</p>
          </div>
          <div className="bg-dark-card border border-primary rounded-lg p-6 text-center">
            <div className="text-primary text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-light-text mb-2">Comprehensive Reports</h3>
            <p className="text-medium-text">AI-powered detailed inspection reports with photos and recommendations</p>
          </div>
          <div className="bg-dark-card border border-primary rounded-lg p-6 text-center">
            <div className="text-primary text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-light-text mb-2">Fast Turnaround</h3>
            <p className="text-medium-text">Most inspections completed within 48 hours of scheduling</p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-light-text text-center mb-8">Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(mobileInspections).map(([type, pricing]) => (
              <div key={type} className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold text-light-text mb-2">{type}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">${pricing.price.toFixed(2)}</span>
                  <span className="ml-2 text-medium-text line-through">${pricing.originalPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-400 font-semibold mb-2">Save ${(pricing.originalPrice - pricing.price).toFixed(2)} (5% off)</p>
                <ul className="text-sm text-medium-text space-y-1">
                  <li>✓ Complete bumper-to-bumper inspection</li>
                  <li>✓ Professional test drive</li>
                  <li>✓ Detailed photo documentation</li>
                  <li>✓ AI-powered analysis report</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-dark-card border border-primary rounded-lg p-8">
          <h2 className="text-3xl font-bold text-light-text mb-6 text-center">Order Your Inspection</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Type */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                >
                  {Object.keys(mobileInspections).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* VIN */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="17-character VIN"
                  maxLength={17}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Inspection Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State or Full Address"
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Preferred Date */}
              <div className="md:col-span-2">
                <label className="block text-light-text font-semibold mb-2">
                  Preferred Inspection Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none"
                />
              </div>

              {/* Additional Notes */}
              <div className="md:col-span-2">
                <label className="block text-light-text font-semibold mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific concerns or areas you'd like us to focus on?"
                  rows={4}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-dark-bg border border-primary rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-light-text font-semibold">Service:</span>
                <span className="text-medium-text">{formData.vehicleType} Mobile Inspection</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-light-text font-semibold">Regular Price:</span>
                <span className="text-medium-text line-through">${selectedPrice?.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-400 font-semibold">You Save (5%):</span>
                <span className="text-green-400 font-semibold">
                  -${(selectedPrice ? selectedPrice.originalPrice - selectedPrice.price : 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-dark-border pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-light-text">Total:</span>
                  <span className="text-2xl font-bold text-primary">${selectedPrice?.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              Schedule My Inspection
            </button>

            <p className="text-center text-sm text-medium-text">
              By submitting, you agree to our terms of service. We'll contact you to confirm scheduling and payment details.
            </p>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-light-text mb-8">Why Choose AI Auto Pro?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-medium-text">Certified Inspectors</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-medium-text">All 50 States</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-medium-text">AI-Powered Reports</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-medium-text">Best Price Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
