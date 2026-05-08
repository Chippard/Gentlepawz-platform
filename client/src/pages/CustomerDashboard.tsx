import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import {
  Calendar,
  MessageCircle,
  History,
  Star,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useBookings, useMessages } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, loading: authLoading } = useSupabaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "messages" | "history" | "reviews">(
    "bookings"
  );

  // Redirect if not authenticated
  if (!authLoading && !user) {
    setLocation("/login");
    return null;
  }

  // Fetch real data from Supabase
  const { bookings, loading: bookingsLoading } = useBookings(user?.id || null);
  const { messages, loading: messagesLoading } = useMessages(user?.id || null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      setLocation("/");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const handleBookWalker = () => {
    setLocation("/booking");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <PawHeartLogo size={48} />
          </div>
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold">Gentle Pawz</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" onClick={handleBookWalker}>
              Book a Walker
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "bookings"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "messages"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "history"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "reviews"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Reviews
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">My Bookings</h2>
                  <Button onClick={handleBookWalker} className="bg-primary hover:bg-primary/90">
                    Book a Walker
                  </Button>
                </div>

                {bookingsLoading ? (
                  <p className="text-foreground/60">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-foreground/60 mb-4">No bookings yet</p>
                    <Button onClick={handleBookWalker} className="bg-primary hover:bg-primary/90">
                      Book Your First Walker
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.service_type}</h3>
                            <p className="text-foreground/60">
                              {new Date(booking.start_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-foreground/60 mt-2">${booking.price}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Messages</h2>
                {messagesLoading ? (
                  <p className="text-foreground/60">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-foreground/60">No messages yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="p-6 hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{message.sender_id === user?.id ? 'You' : 'Walker'}</h3>
                            <p className="text-foreground/60 mt-2">{message.content}</p>
                          </div>
                          <span className="text-xs text-foreground/40">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Booking History</h2>
                <Card className="p-8 text-center">
                  <p className="text-foreground/60">Your completed bookings will appear here</p>
                </Card>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Leave a Review</h2>
                <Card className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="text-2xl hover:scale-110 transition-transform"
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        className="w-full p-3 border border-border rounded-lg"
                        rows={4}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Submit Review</Button>
                  </form>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
