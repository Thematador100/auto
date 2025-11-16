import React, { useState } from 'react';
import { CustomerFeedback as FeedbackType, CompletedReport } from '../types';

interface CustomerFeedbackProps {
  report: CompletedReport;
  customerId: string;
  onSubmit: (feedback: FeedbackType) => void;
  onClose: () => void;
}

const CustomerFeedback: React.FC<CustomerFeedbackProps> = ({ report, customerId, onSubmit, onClose }) => {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [aspects, setAspects] = useState({
    thoroughness: 5,
    clarity: 5,
    timeliness: 5,
    professionalism: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const feedback: FeedbackType = {
      id: `feedback-${Date.now()}`,
      reportId: report.id,
      customerId,
      rating,
      comment: comment.trim() || undefined,
      date: new Date().toISOString(),
      wouldRecommend,
      aspects,
    };

    onSubmit(feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-300 mb-6">Your feedback has been submitted successfully.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Rate Your Inspection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-gray-300">
            <span className="font-semibold text-white">Vehicle:</span> {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-white">VIN:</span> {report.vehicle.vin}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-white">Inspection Date:</span> {new Date(report.date).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Rating */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">Overall Rating</label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`w-10 h-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-white font-semibold">{rating}/5</span>
          </div>
        </div>

        {/* Detailed Aspects */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-4">Rate Specific Aspects</label>
          <div className="space-y-4">
            {Object.entries(aspects).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 capitalize">{key}</span>
                  <span className="text-white font-semibold">{value}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={value}
                  onChange={(e) => setAspects({ ...aspects, [key]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Would Recommend */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">Would you recommend this inspector?</label>
          <div className="flex gap-4">
            <button
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                wouldRecommend
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                !wouldRecommend
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">Additional Comments (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this inspection..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-400 mt-2">
            {comment.length} characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;
