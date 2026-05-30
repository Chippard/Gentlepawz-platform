import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Dog,
  CheckCircle,
  RefreshCw,
  Loader2,
  PawPrint,
  Sun,
  Moon,
  Plus,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
  isWithinInterval,
  getDay,
} from "date-fns";

const MAX_DOGS_PER_DAY = 2;

// Generate 30-minute time slots from 9:00 AM to 9:00 PM
const DROPOFF_TIME_OPTIONS: string[] = [];
{
  for (let h = 9; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 21 && m > 0) break; // stop at 9:00 PM
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const minStr = m === 0 ? "00" : "30";
      DROPOFF_TIME_OPTIONS.push(`${hour12}:${minStr} ${ampm}`);
    }
  }
}

interface BookedDate {
  date: Date;
  count: number;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
}

type ServiceType = "daycare" | "boarding";

interface ServiceOption {
  type: ServiceType;
  label: string;
  description: string;
  price: number;
  unit: string;
  icon: React.ReactNode;
}

const services: ServiceOption[] = [
  {
    type: "daycare",
    label: "Day Care",
    description: "Drop off in the morning, pick up in the evening. Includes walks, play, and nap time.",
    price: 40,
    unit: "day",
    icon: <Sun className="w-6 h-6" />,
  },
  {
    type: "boarding",
    label: "Boarding",
    description: "Overnight stays in our cozy home environment. 24/7 supervision and care.",
    price: 60,
    unit: "night",
    icon: <Moon className="w-6 h-6" />,
  },
];

export default function BookingFlow() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Service selection
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  // Step 2: Pet selection
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Step 3: Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  // Availability state
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Step 3b: Drop-off time
  const [dropoffTime, setDropoffTime] = useState<string>("");

  // Step 4: Notes
  const [notes, setNotes] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

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
      } catch (err: any) {
        console.error("Error fetching pets:", err);
      } finally {
        setLoadingPets(false);
      }
    };
    fetchPets();
  }, [user]);

  // Fetch availability from Supabase
  const fetchAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    try {
      // Fetch confirmed/pending bookings to count dogs per day
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("start_date, end_date, status")
        .in("status", ["pending", "confirmed"]);

      if (bookingsError) throw bookingsError;

      // Count bookings per date
      const dateCounts: Record<string, number> = {};
      (bookings || []).forEach((booking: any) => {
        if (booking.start_date && booking.end_date) {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          const days = eachDayOfInterval({ start, end });
          days.forEach((day) => {
            const key = format(day, "yyyy-MM-dd");
            dateCounts[key] = (dateCounts[key] || 0) + 1;
          });
        }
      });

      const booked: BookedDate[] = Object.entries(dateCounts).map(
        ([dateStr, count]) => ({
          date: new Date(dateStr),
          count,
        })
      );
      setBookedDates(booked);

      // Fetch blocked dates
      try {
        const { data: blocked } = await supabase
          .from("blocked_dates")
          .select("date");
        if (blocked) {
          setBlockedDates(blocked.map((b: any) => new Date(b.date)));
        }
      } catch {
        // blocked_dates table may not exist
      }
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      toast.error("Could not load availability. Please try again.");
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Calendar helpers
  const isFullyBooked = (date: Date) => {
    const found = bookedDates.find((b) => isSameDay(b.date, date));
    return found ? found.count >= MAX_DOGS_PER_DAY : false;
  };

  const isBlocked = (date: Date) => {
    return blockedDates.some((b) => isSameDay(b, date));
  };

  const isPast = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const isUnavailable = (date: Date) => {
    return isPast(date) || isFullyBooked(date) || isBlocked(date);
  };

  const getBookingCount = (date: Date) => {
    const found = bookedDates.find((b) => isSameDay(b.date, date));
    return found ? found.count : 0;
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  const handleDateClick = (date: Date) => {
    if (isUnavailable(date)) return;

    if (!selectingEnd || !startDate) {
      setStartDate(date);
      setEndDate(null);
      setSelectingEnd(true);
    } else {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        const range = eachDayOfInterval({ start: startDate, end: date });
        const hasUnavailable = range.some((d) => isUnavailable(d));
        if (hasUnavailable) {
          toast.error(
            "Some dates in this range are unavailable. Please choose different dates."
          );
          return;
        }
        setEndDate(date);
        setSelectingEnd(false);
      }
    }
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);
    const paddedDays: (Date | null)[] = Array(startDayOfWeek).fill(null);
    paddedDays.push(...days);
    return paddedDays;
  };

  // Calculate price
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const calculatePrice = () => {
    const nights = calculateNights();
    const service = services.find((s) => s.type === selectedService);
    if (!service) return 0;
    return nights * service.price;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !selectedService || !selectedPetId || !startDate || !endDate) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedPet = pets.find((p) => p.id === selectedPetId);
      const { error } = await supabase.from("bookings").insert({
        customer_id: user.id,
        pet_id: selectedPetId || null,
        service_type: selectedService,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        dropoff_time: dropoffTime || null,
        price: calculatePrice(),
        notes: notes.trim() || null,
        status: "pending",
        // Denormalized fields for quick display in admin panel
        owner_name: user.user_metadata?.full_name || user.email || null,
        email: user.email || null,
        pet_name: selectedPet?.name || null,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Booking request submitted!");
    } catch (err: any) {
      console.error("Booking submission error:", err);
      toast.error(
        `We couldn't save your booking: ${err.message || "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Success screen
  if (submitted) {
    const selectedPet = pets.find((p) => p.id === selectedPetId);
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container max-w-lg mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Booking Submitted!</h1>
          <p className="text-foreground/60 text-lg">
            Thank you! Your {selectedService} request for{" "}
            <strong>{selectedPet?.name}</strong> from{" "}
            <strong>{format(startDate!, "MMM d")}</strong> to{" "}
            <strong>{format(endDate!, "MMM d, yyyy")}</strong> has been received.
          </p>
          <Card className="p-6 bg-primary/5 border-primary/20 text-left space-y-2">
            <p className="text-sm text-foreground/60">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
              <li>Emily will review your request personally</li>
              <li>You'll receive a confirmation email within 24 hours</li>
              <li>If your dates are available, the booking will be confirmed</li>
            </ul>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setLocation("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
            <Button onClick={() => setLocation("/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const serviceInfo = services.find((s) => s.type === selectedService);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-10">
        <div className="container max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Dog className="w-4 h-4" />
            Boutique Dog Boarding — Max 2 Dogs at a Time
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
            Book a Stay for Your Pup
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Complete the steps below to request a booking. Emily will confirm
            within 24 hours.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="container max-w-3xl mx-auto pt-8 px-4">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: "Service" },
            { num: 2, label: "Pet" },
            { num: 3, label: "Dates" },
            { num: 4, label: "Review" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s.num
                  )}
                </div>
                <span className="text-xs text-foreground/60 hidden sm:block">
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    step > s.num ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Step Content */}
      <section className="container max-w-3xl mx-auto pb-12 px-4">
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Choose Your Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.type}
                  className={`p-6 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedService === service.type
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedService(service.type)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-lg">
                        {service.label}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1">
                        {service.description}
                      </p>
                      <p className="text-lg font-bold text-primary mt-3">
                        ${service.price}
                        <span className="text-sm font-normal text-foreground/60">
                          /{service.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="gap-2"
              >
                Next: Select Pet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Pet */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Select Your Pet
            </h2>

            {loadingPets ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-foreground/60">Loading pets...</span>
              </div>
            ) : pets.length === 0 ? (
              <Card className="p-8 text-center">
                <PawPrint className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pets found</h3>
                <p className="text-foreground/60 mb-4">
                  You need to add a pet before booking.
                </p>
                <Button
                  onClick={() => setLocation("/pets")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add a Pet
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <Card
                    key={pet.id}
                    className={`p-5 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedPetId === pet.id
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : ""
                    }`}
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dog className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg">
                          {pet.name}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {[pet.breed, pet.age].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {pets.length > 0 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setLocation("/pets")}
                  className="text-sm text-primary hover:underline"
                >
                  + Add another pet
                </button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedPetId}
                className="gap-2"
              >
                Next: Pick Dates
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Pick Dates */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Your Dates
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchAvailability}
                  disabled={loadingAvailability}
                  className="gap-1 text-xs"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loadingAvailability ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                >
                  &larr;
                </Button>
                <span className="font-medium text-sm">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  &rarr;
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-foreground/50 py-1"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Grid */}
              {loadingAvailability ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-foreground/60">
                    Loading availability...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="h-10" />;
                    }

                    const unavailable = isUnavailable(day);
                    const fullyBooked = isFullyBooked(day);
                    const blocked = isBlocked(day);
                    const past = isPast(day);
                    const isStart = startDate && isSameDay(day, startDate);
                    const isEnd = endDate && isSameDay(day, endDate);
                    const inRange = isInRange(day);
                    const count = getBookingCount(day);

                    let className =
                      "h-10 rounded-md text-sm font-medium flex flex-col items-center justify-center relative transition-all cursor-pointer ";

                    if (isStart || isEnd) {
                      className +=
                        "bg-primary text-primary-foreground ring-2 ring-primary/30 ";
                    } else if (inRange) {
                      className += "bg-primary/20 text-foreground ";
                    } else if (fullyBooked) {
                      className +=
                        "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 cursor-not-allowed line-through ";
                    } else if (blocked) {
                      className +=
                        "bg-muted text-muted-foreground cursor-not-allowed line-through ";
                    } else if (past) {
                      className += "text-foreground/20 cursor-not-allowed ";
                    } else {
                      className += "hover:bg-primary/10 text-foreground ";
                    }

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={unavailable}
                        onClick={() => handleDateClick(day)}
                        className={className}
                        title={
                          fullyBooked
                            ? "Fully booked"
                            : blocked
                              ? "Blocked"
                              : past
                                ? "Past date"
                                : count > 0
                                  ? `${count}/${MAX_DOGS_PER_DAY} booked`
                                  : "Available"
                        }
                      >
                        <span>{format(day, "d")}</span>
                        {!past && !blocked && count > 0 && count < MAX_DOGS_PER_DAY && (
                          <span className="absolute bottom-0.5 text-[8px] text-amber-600 dark:text-amber-400">
                            {count}/{MAX_DOGS_PER_DAY}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-xs text-foreground/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary/20" />
                  <span>In range</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
                  <span>Fully booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
                  <span>Blocked</span>
                </div>
              </div>

              {/* Selection Summary */}
              {startDate && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  {endDate ? (
                    <p>
                      <strong>Stay:</strong>{" "}
                      {format(startDate, "EEE, MMM d")} &rarr;{" "}
                      {format(endDate, "EEE, MMM d, yyyy")}
                      <span className="text-foreground/50 ml-2">
                        ({calculateNights()}{" "}
                        {selectedService === "daycare" ? "days" : "nights"})
                      </span>
                    </p>
                  ) : (
                    <p className="text-foreground/60">
                      <strong>Start:</strong>{" "}
                      {format(startDate, "EEE, MMM d")} — now select your
                      end date
                    </p>
                  )}
                </div>
              )}

              {/* Drop-off Time Picker */}
              {startDate && endDate && (
                <div className="mt-4 p-4 rounded-lg border border-border">
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Drop-off Time
                  </label>
                  <p className="text-xs text-foreground/60 mb-3">
                    What time would you like to drop off your pup on {format(startDate, "MMM d")}?
                  </p>
                  <Select value={dropoffTime} onValueChange={setDropoffTime}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a drop-off time" />
                    </SelectTrigger>
                    <SelectContent>
                      {DROPOFF_TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!startDate || !endDate}
                className="gap-2"
              >
                Next: Review
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Review Your Booking
            </h2>

            <Card className="p-6 space-y-4">
              {/* Service */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {serviceInfo?.icon}
                  </div>
                  <div>
                    <p className="font-medium">{serviceInfo?.label}</p>
                    <p className="text-sm text-foreground/60">
                      ${serviceInfo?.price}/{serviceInfo?.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dog className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedPet?.name}</p>
                    <p className="text-sm text-foreground/60">
                      {[selectedPet?.breed, selectedPet?.age]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {startDate && format(startDate, "MMM d")} &rarr;{" "}
                      {endDate && format(endDate, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {calculateNights()}{" "}
                      {selectedService === "daycare" ? "days" : "nights"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop-off Time */}
              {dropoffTime && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Drop-off at {dropoffTime}</p>
                      <p className="text-sm text-foreground/60">
                        on {startDate && format(startDate, "EEE, MMM d")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between py-3">
                <span className="text-lg font-serif font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${calculatePrice()}
                </span>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <label className="text-sm font-medium block mb-2">
                Care Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Feeding schedule, medications, temperament, special needs..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              />
            </Card>

            {/* Info */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="space-y-3 text-sm text-foreground/60">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Emily confirms every booking within 24 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <Dog className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Maximum 2 dogs at a time for personal attention</span>
                </div>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Booking Request
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
