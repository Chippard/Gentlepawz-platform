import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import {
  Calendar,
  MessageCircle,
  Settings,
  Star,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useBookings, useMessages, useReviews, useWalkerProfile } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

export default function WalkerDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, loading: authLoading } = useSupabaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "calendar" | "messages" | "profile" | "reviews">(
    "requests"
  );

  // Redirect if not authenticated
  if (!authLoading && !user) {
    setLocation("/login");
    return null;
  }

  // Fetch real data from Supabase
  const { bookings, loading: bookingsLoading } = useBookings(user?.id || null);
  const { messages, loading: messagesLoading } = useMessages(user?.id || null);
  const { reviews, loading: reviewsLoading } = useReviews(user?.id || null);
  const { profile, loading: profileLoading } = useWalkerProfile(user?.id || null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      setLocation("/");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const handleAcceptRequest = (bookingId: string) => {
    toast.success("Booking accepted!");
  };

  if (authLoading || profileLoading) {
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
                onClick={() => setActiveTab("requests")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "requests"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Booking Requests
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "calendar"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Availability
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
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "profile"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Profile
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
            {activeTab === "requests" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
                {bookingsLoading ? (
                  <p className="text-foreground/60">Loading requests...</p>
                ) : bookings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-foreground/60">No booking requests yet</p>
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
                          {booking.status === 'pending' && (
                            <Button
                              onClick={() => handleAcceptRequest(booking.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "calendar" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Availability Calendar</h2>
                <Card className="p-8 text-center">
                  <p className="text-foreground/60">Calendar integration coming soon</p>
                </Card>
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
                            <h3 className="font-semibold">{message.sender_id === user?.id ? 'You' : 'Customer'}</h3>
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

            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Profile</h2>
                <Card className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      className="w-full p-3 border border-border rounded-lg"
                      rows={4}
                      defaultValue={profile?.bio || ""}
                      placeholder="Tell customers about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-border rounded-lg"
                      placeholder="e.g., Dog training, First aid, Senior dogs"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">Save Profile</Button>
                </Card>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
                {reviewsLoading ? (
                  <p className="text-foreground/60">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-foreground/60">No reviews yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{review.comment}</p>
                            <p className="text-sm text-foreground/60 mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
