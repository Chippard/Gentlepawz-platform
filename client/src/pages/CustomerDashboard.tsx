import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  LogOut,
  PawPrint,
  ClipboardList,
  Dog,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Clock,
  Home,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";

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

interface Booking {
  id: string;
  service_type: string;
  start_date: string;
  end_date: string;
  status: string;
  price: number | null;
  pet_name: string | null;
  dropoff_time: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { user, signOut, loading: authLoading } = useSupabaseAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireRecord[]>(
    []
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  // Fetch all data
  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoadingData(true);
      try {
        const [petsRes, questRes, bookingsRes] = await Promise.all([
          supabase
            .from("pets")
            .select("id, name, breed, age")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("questionnaires")
            .select("id, pet_id, created_at")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("bookings")
            .select("*")
            .eq("customer_id", user.id)
            .order("start_date", { ascending: true }),
        ]);

        if (petsRes.data) setPets(petsRes.data);
        if (questRes.data) setQuestionnaires(questRes.data);
        if (bookingsRes.data) setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
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

  // Derived data
  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter(
    (b) => b.end_date >= today && b.status !== "cancelled"
  );
  const pastBookings = bookings.filter(
    (b) => b.end_date < today || b.status === "cancelled"
  );
  const hasQuestionnaire = questionnaires.length > 0;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user has no pets, guide them to add one first
  if (!loadingData && pets.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container max-w-lg mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Dog className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Welcome to Gentle Pawz!</h1>
          <p className="text-foreground/60 text-lg">
            Let's get started by adding your furry friend's profile. This helps us
            provide the best care possible.
          </p>
          <Button
            onClick={() => setLocation("/pets")}
            className="bg-primary hover:bg-primary/90 gap-2"
            size="lg"
          >
            <PawPrint className="w-5 h-5" />
            Add Your First Pet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Welcome back, {userName}!
            </h1>
            <p className="text-foreground/60 mt-1">
              Here's an overview of your account
            </p>
          </div>
          <Button
            onClick={() => setLocation("/booking")}
            className="bg-primary hover:bg-primary/90 gap-2 self-start"
          >
            <Calendar className="w-4 h-4" />
            Book a Stay
          </Button>
        </div>

        {/* Status Cards */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pets Card */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Dog className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pets.length}</p>
                    <p className="text-sm text-foreground/60">
                      Pet{pets.length !== 1 ? "s" : ""} Registered
                    </p>
                  </div>
                </div>
              </Card>

              {/* Upcoming Bookings Card */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {upcomingBookings.length}
                    </p>
                    <p className="text-sm text-foreground/60">
                      Upcoming Booking{upcomingBookings.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Questionnaire Card */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      hasQuestionnaire
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-amber-100 dark:bg-amber-900/30"
                    }`}
                  >
                    {hasQuestionnaire ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {hasQuestionnaire ? "Completed" : "Not Done"}
                    </p>
                    <p className="text-sm text-foreground/60">Questionnaire</p>
                  </div>
                </div>
              </Card>

              {/* Total Bookings Card */}
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                    <p className="text-sm text-foreground/60">Total Bookings</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Questionnaire CTA if not completed */}
            {!hasQuestionnaire && (
              <Card className="p-5 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        Complete Your Questionnaire
                      </p>
                      <p className="text-sm text-amber-700/70 dark:text-amber-400/70">
                        Help us understand your pup better so we can provide the
                        best care.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 shrink-0"
                    onClick={() => setLocation("/questionnaire")}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Fill Out Now
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setLocation("/booking")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Book a Stay</span>
                </button>

                <button
                  onClick={() => setLocation("/pets")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <PawPrint className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">My Pets</span>
                </button>

                <button
                  onClick={() => setLocation("/questionnaire")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Questionnaire</span>
                </button>

                <button
                  onClick={() => setLocation("/")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Home</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Upcoming Bookings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
                {upcomingBookings.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary"
                    onClick={() => setLocation("/booking")}
                  >
                    Book Another
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {upcomingBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-foreground/60 mb-4">
                    No upcoming bookings
                  </p>
                  <Button
                    onClick={() => setLocation("/booking")}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Your First Stay
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <PawPrint className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">
                              {booking.service_type || "Boarding"}
                              {booking.pet_name && (
                                <span className="text-foreground/60 font-normal">
                                  {" "}
                                  — {booking.pet_name}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-foreground/60 mt-0.5">
                              {new Date(
                                booking.start_date
                              ).toLocaleDateString()}{" "}
                              &rarr;{" "}
                              {new Date(
                                booking.end_date
                              ).toLocaleDateString()}
                            </p>
                            {booking.dropoff_time && (
                              <p className="text-xs text-foreground/50 mt-0.5">
                                Drop-off: {booking.dropoff_time}
                              </p>
                            )}
                            {booking.price != null && (
                              <p className="text-sm font-medium mt-1">
                                ${booking.price}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Bookings (collapsed) */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground/70">
                  Past Bookings
                </h2>
                <div className="space-y-2">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <Card
                      key={booking.id}
                      className="p-4 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Dog className="w-4 h-4 text-foreground/40" />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {booking.service_type || "Boarding"}
                              {booking.pet_name && ` — ${booking.pet_name}`}
                            </p>
                            <p className="text-xs text-foreground/50">
                              {new Date(
                                booking.start_date
                              ).toLocaleDateString()}{" "}
                              &rarr;{" "}
                              {new Date(
                                booking.end_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    </Card>
                  ))}
                  {pastBookings.length > 5 && (
                    <p className="text-sm text-foreground/50 text-center pt-2">
                      + {pastBookings.length - 5} more past booking
                      {pastBookings.length - 5 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* My Pets Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Pets</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary"
                  onClick={() => setLocation("/pets")}
                >
                  Manage
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pets.map((pet) => (
                  <Card key={pet.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Dog className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-xs text-foreground/60">
                          {[pet.breed, pet.age].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
