import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import {
  Star,
  MapPin,
  Heart,
  MessageCircle,
  Award,
  Users,
  ArrowLeft,
} from "lucide-react";

export default function WalkerProfile() {
  const [, setLocation] = useLocation();

  const walkerData = {
    name: "Emily S.",
    title: "Star Sitter",
    rating: 4.9,
    reviewCount: 93,
    repeatClients: 28,
    location: "North Vancouver, BC",
    tagline: "The best care for your best friend",
    bio: "Active individual who loves adventures with dogs. Worked at a pet hospital for over a year caring for boarding animals. Has cared for many friends' animals and loved every minute.",
    photo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663631703889/wNcyibGbPclGWTzQ.jpg",
    skills: [
      "Oral medication administration",
      "First aid/CPR",
      "Senior dog experience",
      "Special needs dog experience",
    ],
    household: {
      smoking: false,
      otherPets: false,
      children: false,
    },
    pricing: {
      daycare: 40,
      boarding: 60,
      walks: 30,
    },
  };

  const reviews = [
    {
      id: 1,
      author: "Nagin H.",
      rating: 5,
      text: "Emily was great with giving updates and handled my anxious dog really well. Lots of care!",
      date: "May 2026",
    },
    {
      id: 2,
      author: "Graham T.",
      rating: 5,
      text: "Emily was the best. So many updates and pics that I felt great about Gus being with her. Highly highly recommend.",
      date: "May 2026",
    },
    {
      id: 3,
      author: "Kaya R.",
      rating: 5,
      text: "Excellent communication and care. She gave attention and care to our little dog. Lots of photos and messages along the way to make us feel comfortable.",
      date: "April 2026",
    },
    {
      id: 4,
      author: "Sharwyn G.",
      rating: 5,
      text: "We had a great experience with Emily. She kept us updated regularly and sent us a lot of photos, which really put our minds at ease.",
      date: "April 2026",
    },
    {
      id: 5,
      author: "Carly",
      rating: 5,
      text: "Emily is fantastic! She cared for our beagle mix, Gus. They were a great match. Emily was amazing at communicating throughout our stay.",
      date: "March 2026",
    },
    {
      id: 6,
      author: "Sean B.",
      rating: 5,
      text: "Thanks again Emily! I'm pretty sure Bingley had the best vacation ever. So many photos and updates.",
      date: "March 2026",
    },
    {
      id: 7,
      author: "Jennifer L.",
      rating: 5,
      text: "Loving home care for our dog daughter. Thanks again, Emily!",
      date: "February 2026",
    },
    {
      id: 8,
      author: "Mariana G.",
      rating: 5,
      text: "Perfect service, the dogs had a great time! Always updating and keeping us informed.",
      date: "February 2026",
    },
  ];

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
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold hidden sm:inline">
              Gentle Pawz
            </span>
          </div>
          <Button onClick={() => setLocation("/signup?role=customer")}>
            Book Now
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="rounded-2xl overflow-hidden">
              <img
                src={walkerData.photo}
                alt={walkerData.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2">
                    {walkerData.name}
                  </h1>
                  <p className="text-lg text-primary font-medium mb-2">
                    {walkerData.title}
                  </p>
                  <p className="text-foreground/70 italic">
                    "{walkerData.tagline}"
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold">{walkerData.rating}</span>
                <span className="text-foreground/60">
                  ({walkerData.reviewCount} reviews)
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {walkerData.repeatClients}
                  </div>
                  <div className="text-sm text-foreground/60">Repeat Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {walkerData.reviewCount}
                  </div>
                  <div className="text-sm text-foreground/60">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-foreground/60">Recommended</div>
                </div>
              </div>

              {/* About */}
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold">About</h2>
                <p className="text-foreground/70 leading-relaxed">
                  {walkerData.bio}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold">Skills & Certifications</h2>
              <div className="grid grid-cols-2 gap-3">
                {walkerData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Award className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Household Info */}
            <div className="space-y-4 p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-lg font-semibold">Household Info</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Non-smoking household</span>
                  <span className="text-sm font-medium text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">No other pets</span>
                  <span className="text-sm font-medium text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">No children</span>
                  <span className="text-sm font-medium text-green-600">✓</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold">Reviews</h2>
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{review.author}</h3>
                        <p className="text-xs text-foreground/60">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/70">{review.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-sm text-foreground/70">
                    {walkerData.location}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Pricing</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Day Care</span>
                  <span className="font-semibold">
                    ${walkerData.pricing.daycare}/day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Boarding</span>
                  <span className="font-semibold">
                    ${walkerData.pricing.boarding}/night
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Walks</span>
                  <span className="font-semibold">
                    ${walkerData.pricing.walks}/hour
                  </span>
                </div>
              </div>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/signup?role=customer")}
                className="w-full bg-primary hover:bg-primary/90 h-11"
              >
                <Heart className="w-4 h-4 mr-2" />
                Book Emily
              </Button>
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  window.location.href = "mailto:emily@gentlepawz.ca?subject=Message via Gentle Pawz";
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Trust Indicators */}
            <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Verified Walker</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Max 2 Dogs at a Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Insured & Bonded</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
