import React, { useState } from "react";
import { useLocation } from "wouter";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";

const CDN_BASE =
  "https://img1.wsimg.com/isteam/ip/31d2cac8-6cfb-4c70-8fe0-fb5ab5b21207";

type GalleryImage = {
  id: number;
  filename: string;
  alt: string;
  category: "boarding" | "walks" | "happy-pups";
};

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    filename: "1000010479.jpg",
    alt: "Cozy pup sleeping on the couch in a daisy outfit",
    category: "boarding",
  },
  {
    id: 2,
    filename: "1000010476.jpg",
    alt: "Happy dog enjoying quality time",
    category: "happy-pups",
  },
  {
    id: 3,
    filename: "1000011005.jpg",
    alt: "Playful pup during day care session",
    category: "boarding",
  },
  {
    id: 4,
    filename: "1000012761.jpg",
    alt: "Dog enjoying an outdoor adventure",
    category: "walks",
  },
  {
    id: 5,
    filename: "1000011425.jpg",
    alt: "Furry friend relaxing after a walk",
    category: "walks",
  },
  {
    id: 6,
    filename: "1000011018.jpg",
    alt: "Pup getting love and attention during boarding",
    category: "boarding",
  },
  {
    id: 7,
    filename: "1000011173.jpg",
    alt: "Happy dog posing for the camera",
    category: "happy-pups",
  },
  {
    id: 8,
    filename: "1000013361.jpg",
    alt: "Tail-wagging fun at Gentle Pawz",
    category: "happy-pups",
  },
  {
    id: 9,
    filename: "1000011095.jpg",
    alt: "Dog enjoying a peaceful rest",
    category: "boarding",
  },
  {
    id: 10,
    filename: "1000012860.jpg",
    alt: "Energetic pup on a walk",
    category: "walks",
  },
  {
    id: 11,
    filename: "1000010187.jpg",
    alt: "Adorable dog having a great day",
    category: "happy-pups",
  },
  {
    id: 12,
    filename: "1000012818.jpg",
    alt: "Comfortable overnight boarding guest",
    category: "boarding",
  },
  {
    id: 13,
    filename: "1000013359.jpg",
    alt: "Joyful pup at Gentle Pawz",
    category: "happy-pups",
  },
];

function getImageUrl(filename: string, width: number = 600): string {
  return `${CDN_BASE}/${filename}/:/rs=w:${width},cg:true,m`;
}

function getLargeImageUrl(filename: string): string {
  return `${CDN_BASE}/${filename}/:/rs=w:1200,cg:true,m`;
}

type FilterCategory = "all" | "boarding" | "walks" | "happy-pups";

const categories: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All Photos" },
  { key: "boarding", label: "Boarding" },
  { key: "walks", label: "Walks" },
  { key: "happy-pups", label: "Happy Pups" },
];

export default function Gallery() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filteredImages =
    activeFilter === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-card border-b border-border">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Paw-some Moments
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Our <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            See the love, joy, and tail-wagging fun that happens every day at
            Gentle Pawz. These are real moments from our boarding, walks, and
            day care sessions.
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={activeFilter === cat.key ? "default" : "outline"}
                onClick={() => setActiveFilter(cat.key)}
                className={
                  activeFilter === cat.key
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid group cursor-pointer overflow-hidden rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300"
                onClick={() => setLightboxImage(image)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(image.filename, 600)}
                    alt={image.alt}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-3">
                        <Camera className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-foreground/70">{image.alt}</p>
                  <span className="inline-block mt-1 text-xs font-medium text-primary capitalize">
                    {image.category.replace("-", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground/50 text-lg">
                No photos in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Want Your Pup Featured Here?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
            Book a service and your furry friend could be our next star!
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation("/booking")}
          >
            Book Now
          </Button>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-[101]"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getLargeImageUrl(lightboxImage.filename)}
              alt={lightboxImage.alt}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-white text-lg">{lightboxImage.alt}</p>
              <span className="text-primary text-sm capitalize">
                {lightboxImage.category.replace("-", " ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
