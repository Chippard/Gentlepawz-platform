import { useState, useEffect } from "react";
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
  PawPrint,
  ClipboardList,
  Dog,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useBookings, useMessages } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
}

interface QuestionnaireRecord {
  id: string;
  pet_id: string;
  created_at: string;
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, loading: authLoading } = useSupabaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "bookings" | "pets" | "questionnaire" | "messages" | "history" | "reviews"
  >("bookings");

  // Pets state
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);

  // Questionnaire state
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireRecord[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    setLocation("/login");
    return null;
  }

  // Fetch real data from Supabase
  const { bookings, loading: bookingsLoading } = useBookings(user?.id || null);
  const { messages, loading: messagesLoading } = useMessages(user?.id || null);

  // Fetch pets
  useEffect(() => {
    if (!user) return;
    const fetchPets = async () => {
      setLoadingPets(true);
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("id, name, breed, age")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPets(data || []);
      } catch (err) {
        console.error("Error fetching pets:", err);
      } finally {
        setLoadingPets(false);
      }
    };
    fetchPets();
  }, [user]);

  // Fetch questionnaires
  useEffect(() => {
    if (!user) return;
    const fetchQuestionnaires = async () => {
      setLoadingQuestionnaires(true);
      try {
        const { data, error } = await supabase
          .from("questionnaires")
          .select("id, pet_id, created_at")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuestionnaires(data || []);
      } catch (err) {
        console.error("Error fetching questionnaires:", err);
      } finally {
        setLoadingQuestionnaires(false);
      }
    };
    fetchQuestionnaires();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      setLocation("/");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const handleBooking = () => {
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
            <Button variant="outline" onClick={handleBooking}>
              Book a Stay
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
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
                onClick={() => setActiveTab("pets")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "pets"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <PawPrint className="w-4 h-4 inline mr-2" />
                My Pets
              </button>
              <button
                onClick={() => setActiveTab("questionnaire")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "questionnaire"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Questionnaire
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
            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">My Bookings</h2>
                  <Button
                    onClick={handleBooking}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Book a Stay
                  </Button>
                </div>

                {bookingsLoading ? (
                  <p className="text-foreground/60">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <p className="text-foreground/60 mb-4">No bookings yet</p>
                    <Button
                      onClick={handleBooking}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Book Your First Stay
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg capitalize">
                              {booking.service_type}
                            </h3>
                            <p className="text-foreground/60">
                              {new Date(booking.start_date).toLocaleDateString()}{" "}
                              &rarr;{" "}
                              {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                            {booking.price && (
                              <p className="text-sm text-foreground/60 mt-1">
                                ${booking.price}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PETS TAB */}
            {activeTab === "pets" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">My Pets</h2>
                  <Button
                    onClick={() => setLocation("/pets")}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <PawPrint className="w-4 h-4" />
                    Manage Pets
                  </Button>
                </div>

                {loadingPets ? (
                  <p className="text-foreground/60">Loading pets...</p>
                ) : pets.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Dog className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <p className="text-foreground/60 mb-4">
                      No pets added yet
                    </p>
                    <Button
                      onClick={() => setLocation("/pets")}
                      className="bg-primary hover:bg-primary/90 gap-2"
                    >
                      <PawPrint className="w-4 h-4" />
                      Add Your First Pet
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pets.map((pet) => (
                      <Card key={pet.id} className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Dog className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{pet.name}</h3>
                              <p className="text-sm text-foreground/60">
                                {[pet.breed, pet.age]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation("/pets")}
                            className="gap-1 text-primary"
                          >
                            Edit
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setLocation("/pets")}
                        className="text-sm text-primary hover:underline"
                      >
                        Manage all pets &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QUESTIONNAIRE TAB */}
            {activeTab === "questionnaire" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">
                    Client Questionnaire
                  </h2>
                </div>

                {loadingQuestionnaires ? (
                  <p className="text-foreground/60">Loading...</p>
                ) : questionnaires.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ClipboardList className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Questionnaire Not Completed
                    </h3>
                    <p className="text-foreground/60 mb-4">
                      Please fill out the new client questionnaire so we can
                      provide the best care for your pup.
                    </p>
                    <Button
                      onClick={() => setLocation("/questionnaire")}
                      className="bg-primary hover:bg-primary/90 gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Fill Out Questionnaire
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card className="p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-300">
                            Questionnaire Completed
                          </h3>
                          <p className="text-sm text-green-700/70 dark:text-green-400/70">
                            Submitted on{" "}
                            {new Date(
                              questionnaires[0].created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {questionnaires.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/60">
                          You have {questionnaires.length} questionnaire
                          {questionnaires.length > 1 ? "s" : ""} on file.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setLocation("/questionnaire")}
                          className="gap-2"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Submit Another Questionnaire
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && (
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6">Messages</h2>
                {messagesLoading ? (
                  <p className="text-foreground/60">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <p className="text-foreground/60">No messages yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card
                        key={message.id}
                        className="p-6 hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {message.sender_id === user?.id
                                ? "You"
                                : "Emily"}
                            </h3>
                            <p className="text-foreground/60 mt-2">
                              {message.content}
                            </p>
                          </div>
                          <span className="text-xs text-foreground/40">
                            {new Date(
                              message.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6">
                  Booking History
                </h2>
                <Card className="p-8 text-center">
                  <History className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-foreground/60">
                    Your completed bookings will appear here
                  </p>
                </Card>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6">
                  Leave a Review
                </h2>
                <Card className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rating
                      </label>
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
                      <label className="block text-sm font-medium mb-2">
                        Your Review
                      </label>
                      <textarea
                        className="w-full p-3 border border-border rounded-lg bg-background"
                        rows={4}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Submit Review
                    </Button>
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
