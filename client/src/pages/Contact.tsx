import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call contact.submit tRPC mutation
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold hidden sm:inline">
              Gentle Pawz
            </span>
          </div>
          <Button onClick={() => setLocation("/signup?role=customer")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-serif font-bold">Get in Touch</h1>
            <p className="text-xl text-foreground/70">
              Have questions? We'd love to hear from you. Reach out anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Contact Info Cards */}
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm text-foreground/70">
                North Vancouver, BC
              </p>
              <p className="text-xs text-foreground/50">
                Serving the North Shore community
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-sm text-foreground/70">
                <a href="tel:+1-604-555-0123" className="hover:text-primary">
                  (604) 555-0123
                </a>
              </p>
              <p className="text-xs text-foreground/50">
                Mon-Fri, 9am-6pm PT
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-foreground/70">
                <a
                  href="mailto:hello@gentlepawz.ca"
                  className="hover:text-primary"
                >
                  hello@gentlepawz.ca
                </a>
              </p>
              <p className="text-xs text-foreground/50">
                We respond within 24 hours
              </p>
            </Card>
          </div>

          {/* Business Hours */}
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-foreground/60">Monday - Friday</p>
                    <p className="font-medium">9:00 AM - 6:00 PM</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Saturday - Sunday</p>
                    <p className="font-medium">10:00 AM - 4:00 PM</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/50 mt-4">
                  Emergency bookings available. Contact us for details.
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Send us a Message</h2>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="(604) 555-0123"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-border rounded-lg min-h-32 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 h-11"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Map Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Find Us</h2>
            <Card className="overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2610.0988949816626!2d-123.07199!3d49.31997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673cc3d8d8d8d%3A0x8d8d8d8d8d8d8d8d!2sNorth%20Vancouver%2C%20BC!5e0!3m2!1sen!2sca!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-12">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold">Gentle Pawz</span>
          </div>
          <p className="text-sm opacity-70">
            Boutique dog care in North Vancouver, BC
          </p>
          <p className="text-xs opacity-50 mt-4">
            &copy; 2026 Gentle Pawz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
