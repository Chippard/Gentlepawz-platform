import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  dogName: string;
  breed: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    name: "Jessica T.",
    dogName: "Mochi",
    breed: "Shih Tzu",
    rating: 5,
    text: "Gentle Pawz is the only place I trust with Mochi. Sarah treats her like her own dog. The photo updates throughout the day give me such peace of mind. Mochi actually gets excited when we pull up!",
    date: "2 weeks ago",
  },
  {
    name: "David & Kim R.",
    dogName: "Biscuit",
    breed: "French Bulldog",
    rating: 5,
    text: "We've tried other boarding places and Biscuit always came home stressed. With Gentle Pawz, he comes home happy and tired from playing. The small group size makes all the difference.",
    date: "1 month ago",
  },
  {
    name: "Amanda L.",
    dogName: "Pepper",
    breed: "Miniature Poodle",
    rating: 5,
    text: "The walks are amazing — Sarah sends GPS routes and photos from the trails. Pepper gets so much more stimulation than a quick neighborhood loop. Worth every penny for the one-on-one attention.",
    date: "3 weeks ago",
  },
  {
    name: "Michael S.",
    dogName: "Luna",
    breed: "Cavalier King Charles",
    rating: 5,
    text: "Luna has separation anxiety and Sarah is the only person she's comfortable staying with overnight. The personalized bedtime routine they maintain is incredible. Truly boutique care.",
    date: "1 month ago",
  },
  {
    name: "Rachel & Tom W.",
    dogName: "Oliver",
    breed: "Maltese",
    rating: 5,
    text: "We travel frequently for work and knowing Oliver is in such loving hands makes all the difference. The daily video updates are adorable. He's part of the Gentle Pawz family now!",
    date: "2 months ago",
  },
  {
    name: "Priya K.",
    dogName: "Coco",
    breed: "Toy Pomeranian",
    rating: 5,
    text: "Finding someone who understands tiny dogs is hard. Sarah knows exactly how to handle Coco's needs — from her feeding schedule to her favorite nap spots. Five stars isn't enough!",
    date: "6 weeks ago",
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-primary/20 mb-4" />

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">
        "{review.text}"
      </p>

      {/* Reviewer info */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div>
          <p className="text-sm font-medium text-foreground">{review.name}</p>
          <p className="text-xs text-muted-foreground">
            {review.dogName} the {review.breed}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{review.date}</span>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section id="reviews" className="section-padding bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Pups & Their People
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it — hear from the families who trust us 
            with their furry loved ones.
          </p>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">5.0</span>
            <span className="text-muted-foreground">from 47 reviews</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
