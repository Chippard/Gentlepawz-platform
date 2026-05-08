import { Badge } from "@/components/ui/badge";
import { Star, Award, Clock, MapPin } from "lucide-react";

interface Walker {
  name: string;
  role: string;
  bio: string;
  certifications: string[];
  availability: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
}

// NOTE: Placeholder profile — replace with actual owner details when provided
const walkers: Walker[] = [
  {
    name: "Sarah Mitchell",
    role: "Founder & Lead Caregiver",
    bio: "With over 8 years of professional dog care experience, Sarah founded Gentle Pawz to provide the kind of personalized attention that every dog deserves. She's certified in pet first aid and specializes in caring for small breeds.",
    certifications: ["Pet First Aid Certified", "CPDT-KA", "Fear Free Certified"],
    availability: "Mon–Sun, 7 AM – 9 PM",
    rating: 5.0,
    reviewCount: 47,
    specialties: ["Small Breeds", "Senior Dogs", "Anxious Pups"],
  },
];

function WalkerCard({ walker }: { walker: Walker }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-primary/10">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663631703889/HyjFhWM4C2oWxo7dXTLa4r/walker-sarah-CmH4wiJWo3bhtbPs5BFT6U.webp"
                alt={walker.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-foreground">{walker.name}</h3>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  {walker.role}
                </Badge>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(walker.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{walker.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({walker.reviewCount} reviews)
                </span>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">{walker.bio}</p>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Certifications */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Certifications</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {walker.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs font-normal">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Availability</span>
                </div>
                <p className="text-sm text-muted-foreground">{walker.availability}</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Specialties</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {walker.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalkersSection() {
  return (
    <section id="walkers" className="section-padding bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Our Team
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Meet Your Dog's New Best Friend
          </h2>
          <p className="text-muted-foreground text-lg">
            Every caregiver on our team is vetted, certified, and passionate about providing 
            exceptional care for your furry family member.
          </p>
        </div>

        {/* Walker cards */}
        <div className="max-w-3xl mx-auto space-y-6">
          {walkers.map((walker) => (
            <WalkerCard key={walker.name} walker={walker} />
          ))}
        </div>

        {/* Coming soon indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              More caregivers joining our team soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
