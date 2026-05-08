import { PawHeartLogo } from "./PawHeartLogo";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/80">
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PawHeartLogo size={28} className="text-primary" />
              <span className="font-serif text-lg font-semibold text-background">
                Gentle Pawz
              </span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs">
              Boutique dog boarding and walking in North Vancouver. 
              Where every paw gets personal attention.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background text-sm">Quick Links</h4>
            <div className="space-y-2">
              <a href="#services" className="block text-sm text-background/60 hover:text-primary transition-colors">
                Services & Pricing
              </a>
              <a href="#walkers" className="block text-sm text-background/60 hover:text-primary transition-colors">
                Our Team
              </a>
              <a href="#booking" className="block text-sm text-background/60 hover:text-primary transition-colors">
                Book Now
              </a>
              <a href="#reviews" className="block text-sm text-background/60 hover:text-primary transition-colors">
                Reviews
              </a>
              <a href="#contact" className="block text-sm text-background/60 hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background text-sm">Hours</h4>
            <div className="space-y-2 text-sm text-background/60">
              <p>Monday – Friday: 7:00 AM – 9:00 PM</p>
              <p>Saturday – Sunday: 8:00 AM – 8:00 PM</p>
              <p className="pt-2 text-background/40">
                North Vancouver, BC, Canada
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {currentYear} Gentle Pawz. All rights reserved.
          </p>
          <p className="text-xs text-background/40 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-primary fill-primary" /> for pups everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
