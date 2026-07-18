import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api'; // <-- IMPORTED API

const ContactPage = () => {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- ADDED LOADING STATE

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // POST the feedback to your backend
      await api.post('/contact', feedback);
      
      setSubmitted(true);
      setFeedback({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error("Failed to submit feedback", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[#0B2948] mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Our team is available to support donors, NGOs, CSR partners, and anyone interested in learning more about HopeWorks.
        </p>
      </div>

      {/* Info Cards Section */}
      <div className="space-y-6 mb-16">
        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-[#0B2948] mb-2">Support channels</h3>
          <p className="text-gray-600">
            For any issues, queries, donation questions, or platform troubleshooting, please reach out to us directly at:{' '}
            <a href="mailto:support.hopeworks@gmail.com" className="text-[#007A78] font-medium hover:underline">
              support.hopeworks@gmail.com
            </a>
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-[#0B2948] mb-2">Response expectations</h3>
          <p className="text-gray-600">
            We aim to respond to general inquiries promptly and provide appropriate direction for account, compliance, and operational requests.
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-[#0B2948] mb-2">Get involved</h3>
          <p className="text-gray-600">
            If you are an NGO, donor, or corporate partner, we welcome a conversation about how HopeWorks can support your impact initiatives.
          </p>
        </div>
      </div>

      <hr className="mb-12 border-gray-200" />

      {/* Feedback Form Section */}
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-2xl font-bold text-[#0B2948] mb-2">Platform Feedback</h2>
        <p className="text-gray-600 mb-6">
          Have a suggestion or spotted a bug? Let us know how we can improve your experience.
        </p>

        {submitted ? (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
            Thank you for your feedback! We appreciate your help in improving HopeWorks.
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={feedback.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#007A78] focus:border-[#007A78] outline-none bg-white"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={feedback.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#007A78] focus:border-[#007A78] outline-none bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={feedback.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#007A78] focus:border-[#007A78] outline-none bg-white resize-none"
                placeholder="Share your thoughts or report an issue..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 font-bold text-white transition rounded-md bg-[#0B2948] hover:bg-[#1a3a5c] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8">
        <Link to="/" className="text-[#007A78] font-medium hover:underline flex items-center">
          &larr; Return home
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;