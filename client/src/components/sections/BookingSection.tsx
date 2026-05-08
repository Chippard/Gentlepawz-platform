import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Clock, Shield } from "lucide-react";

export function BookingSection() {
  return (
    <section id="booking" className="section-padding">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Book Now
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Reserve Your Spot
          </h2>
          <p className="text-muted-foreground text-lg">
            Check availability and book your dog's stay or walk in just a few clicks. 
            We keep our calendar limited to ensure quality care.
          </p>
        </div>

        {/* Booking features */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Real-Time Availability</h4>
            <p className="text-xs text-muted-foreground">See open slots instantly</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Instant Confirmation</h4>
            <p className="text-xs text-muted-foreground">Get confirmed in minutes</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Free Cancellation</h4>
            <p className="text-xs text-muted-foreground">Cancel up to 24h before</p>
          </div>
        </div>

        {/* Calendar embed */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Calendar header */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/10 px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Booking Calendar</span>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full text-xs bg-white"
              >
                <a
                  href="https://gentlepawz-calendar-d73g.vercel.app/booking"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Full Calendar
                  <ExternalLink className="ml-1.5 w-3 h-3" />
                </a>
              </Button>
            </div>

            {/* Iframe embed */}
            <div className="relative w-full" style={{ height: "600px" }}>
              <iframe
                src="https://gentlepawz-calendar-d73g.vercel.app/booking"
                className="absolute inset-0 w-full h-full border-0"
                title="Gentle Pawz Booking Calendar"
                loading="lazy"
                allow="clipboard-write"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
