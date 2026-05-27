import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Heart, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopNav from "@/components/TopNav";

const GOOGLE_BUSINESS_URL = "https://maps.google.com/?q=Gentle+Pawz+North+Vancouver";
const GOOGLE_PROFILE_URL = "https://business.google.com/n/4053690830842870116";

// Replace YOUR_FORM_ID with your Formspree form ID (e.g., "xyzabcde")
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqejgwvz";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _replyto: formData.email,
          _subject: `New Contact Form Message from ${formData.name}`,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert("Something went wrong. Please try again or email us directly at Emily@Gentlepawz.ca");
      }
    } catch (error) {
      alert("Something went wrong. Please try again or email us directly at Emily@Gentlepawz.ca");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-cyan-50 to-white">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 border border-cyan-200 mb-6">
            <Heart className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-700">
              Get In Touch
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions about our services,
            want to schedule a meet and greet, or just want to say hi — reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 text-sm">
                North Vancouver, BC<br />
                Canada
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <a
                href="tel:+17789980769"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
              >
                (778) 998-0769
              </a>
              <p className="text-gray-500 text-xs mt-1">Text or call anytime</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <a
                href="mailto:Emily@Gentlepawz.ca"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
              >
                Emily@Gentlepawz.ca
              </a>
              <p className="text-gray-500 text-xs mt-1">We respond within 24 hours</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-600 text-sm">
                Open Daily<br />
                9:00 AM – 9:00 PM
              </p>
            </div>
          </div>

          {/* Contact Form & Map Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left: Contact Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {isSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Message Sent!</h3>
                  <p className="text-gray-600">
                    Thanks for reaching out! Emily will get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mt-4 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="(778) 555-0123"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 bg-white resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-11 shadow-lg shadow-cyan-200"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Right: Map Embed */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-[320px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2601.6!2d-123.009845!3d49.3151427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548671a4e8a67b5b%3A0x3847c8e1f0a1c5e7!2sNorth+Vancouver%2C+BC!5e0!3m2!1sen!2sca!4v1716500000000!5m2!1sen!2sca"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Gentle Pawz Location - North Vancouver"
                />
              </div>

              {/* Google Business Links */}
              <div className="bg-cyan-50 rounded-2xl border border-cyan-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Find Us on Google</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Check out our reviews, photos, and get directions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={GOOGLE_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Google Profile
                  </a>
                  <a
                    href={GOOGLE_BUSINESS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors font-medium text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 text-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Ready to Book?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Schedule a meet and greet or book day care and boarding directly through our site.
              We'd love to meet your pup!
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = "/booking"}
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200"
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container text-center">
          <p className="font-serif font-bold text-lg mb-2">Gentle Pawz</p>
          <p className="text-sm text-gray-400">
            Boutique dog care in North Vancouver, BC
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
            <a href="tel:+17789980769" className="hover:text-white transition-colors">
              (778) 998-0769
            </a>
            <a href="mailto:Emily@Gentlepawz.ca" className="hover:text-white transition-colors">
              Emily@Gentlepawz.ca
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            &copy; 2026 Gentle Pawz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
