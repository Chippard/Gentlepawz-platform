import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, Calendar, ExternalLink, Clock, Dog, CheckCircle } from "lucide-react";

const BOOKING_URL = "https://gentlepawz-calendar-d73g.vercel.app/booking";

export default function BookingFlow() {
  const [, setLocation] = useLocation();

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
            <span className="font-serif font-bold hidden sm:inline">Gentle Pawz</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Dog className="w-4 h-4" />
            Boutique Dog Boarding — Max 2 Dogs at a Time
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
            Book a Stay for Your Pup
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Choose your dates on our visual calendar. Red dates are fully booked, grey dates are blocked. Emily confirms every booking personally within 24 hours.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="w-5 h-5" />
              Open Booking Calendar
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Button>
          </a>
          <p className="text-sm text-foreground/40">
            Opens in a new tab — no account required
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container max-w-3xl mx-auto py-16 space-y-10">
        <h2 className="text-2xl font-serif font-bold text-center">How Booking Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3 border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-lg">1</span>
            </div>
            <Calendar className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-semibold">Pick Your Dates</h3>
            <p className="text-sm text-foreground/60">
              Select your drop-off and pick-up dates on the visual calendar. Available days are shown in white.
            </p>
          </Card>
          <Card className="p-6 text-center space-y-3 border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-lg">2</span>
            </div>
            <Dog className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-semibold">Tell Us About Your Dog</h3>
            <p className="text-sm text-foreground/60">
              Enter your name, email, your dog's name, and any care notes — feeding routines, medications, temperament.
            </p>
          </Card>
          <Card className="p-6 text-center space-y-3 border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <CheckCircle className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-semibold">Emily Confirms</h3>
            <p className="text-sm text-foreground/60">
              Emily reviews every booking personally and confirms within 24 hours. You'll hear back by email.
            </p>
          </Card>
        </div>

        {/* CTA Card */}
        <Card className="p-8 bg-primary/5 border-primary/20 text-center space-y-4">
          <h3 className="text-xl font-serif font-bold">Ready to Book?</h3>
          <p className="text-foreground/60 text-sm max-w-md mx-auto">
            The booking calendar opens in a new tab. No account needed — just fill in your details and pick your dates.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2 px-8">
              <Calendar className="w-4 h-4" />
              Open Booking Calendar
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Button>
          </a>
        </Card>

        {/* Info Row */}
        <div className="grid sm:grid-cols-3 gap-4 text-center text-sm text-foreground/60">
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-4 h-4 text-primary" />
            <span>24-hour confirmation</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Dog className="w-4 h-4 text-primary" />
            <span>Max 2 dogs per stay</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>No account required</span>
          </div>
        </div>
      </section>
    </div>
  );
}
