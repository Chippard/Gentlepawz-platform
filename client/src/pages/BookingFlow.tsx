import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dog,
  CheckCircle,
  RefreshCw,
  Loader2,
  PawPrint,
  Mail,
  User,
  FileText,
} from "lucide-react";
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
  addDays,
} from "date-fns";

const MAX_DOGS_PER_DAY = 2;

interface BookedDate {
  date: Date;
  count: number;
}

export default function BookingFlow() {
  const [, setLocation] = useLocation();

  // Form state
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [notes, setNotes] = useState("");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  // Availability state
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      // Fetch blocked dates if the table exists
      try {
        const { data: blocked } = await supabase
          .from("blocked_dates")
          .select("date");
        if (blocked) {
          setBlockedDates(blocked.map((b: any) => new Date(b.date)));
        }
      } catch {
        // blocked_dates table may not exist — that's fine
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

  // Check if a date is fully booked (>= MAX_DOGS_PER_DAY)
  const isFullyBooked = (date: Date) => {
    const found = bookedDates.find((b) => isSameDay(b.date, date));
    return found ? found.count >= MAX_DOGS_PER_DAY : false;
  };

  // Check if a date is blocked
  const isBlocked = (date: Date) => {
    return blockedDates.some((b) => isSameDay(b, date));
  };

  // Check if a date is in the past
  const isPast = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  // Check if a date is unavailable
  const isUnavailable = (date: Date) => {
    return isPast(date) || isFullyBooked(date) || isBlocked(date);
  };

  // Get booking count for a date
  const getBookingCount = (date: Date) => {
    const found = bookedDates.find((b) => isSameDay(b.date, date));
    return found ? found.count : 0;
  };

  // Check if date is in selected range
  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isUnavailable(date)) return;

    if (!selectingEnd || !startDate) {
      // Selecting start date
      setStartDate(date);
      setEndDate(null);
      setSelectingEnd(true);
    } else {
      // Selecting end date
      if (isBefore(date, startDate)) {
        // If clicked before start, reset
        setStartDate(date);
        setEndDate(null);
      } else {
        // Check if any date in range is unavailable
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

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start with empty cells for alignment
    const startDayOfWeek = getDay(monthStart); // 0 = Sunday
    const paddedDays: (Date | null)[] = Array(startDayOfWeek).fill(null);
    paddedDays.push(...days);

    return paddedDays;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select your stay dates on the calendar.");
      return;
    }
    if (!ownerName.trim() || !email.trim() || !petName.trim()) {
      toast.error("Please fill in your name, email, and pet name.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        owner_name: ownerName.trim(),
        email: email.trim(),
        pet_name: petName.trim(),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        notes: notes.trim() || null,
        status: "pending",
        service_type: "boarding",
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

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container h-16 flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-2">
              <PawHeartLogo size={24} className="text-primary" />
              <span className="font-serif font-bold hidden sm:inline">
                Gentle Pawz
              </span>
            </div>
            <div className="w-20" />
          </div>
        </header>

        <div className="container max-w-lg mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Booking Submitted!</h1>
          <p className="text-foreground/60 text-lg">
            Thank you, <strong>{ownerName}</strong>! Your stay request for{" "}
            <strong>{petName}</strong> from{" "}
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
              <li>
                If your dates are available, the booking will be confirmed
              </li>
            </ul>
          </Card>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="mt-4"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

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
            Back
          </button>
          <div className="flex items-center gap-2">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold hidden sm:inline">
              Gentle Pawz
            </span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Dog className="w-4 h-4" />
            Boutique Dog Boarding — Max 2 Dogs at a Time
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
            Book a Stay for Your Pup
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Pick your dates, tell us about your dog, and Emily will confirm
            within 24 hours. No account needed.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container max-w-5xl mx-auto py-10">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
          {/* Calendar — Left Side (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
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
                    const isStart =
                      startDate && isSameDay(day, startDate);
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
                      className +=
                        "text-foreground/20 cursor-not-allowed ";
                    } else {
                      className +=
                        "hover:bg-primary/10 text-foreground ";
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
                        (
                        {Math.ceil(
                          (endDate.getTime() - startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        nights)
                      </span>
                    </p>
                  ) : (
                    <p className="text-foreground/60">
                      <strong>Start:</strong>{" "}
                      {format(startDate, "EEE, MMM d")} — now select your
                      pick-up date
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Form — Right Side (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary" />
                Your Details
              </h2>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-foreground/50" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-foreground/50" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Pet Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-foreground/50" />
                  Dog's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Buddy"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Care Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-foreground/50" />
                  Care Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Feeding schedule, medications, temperament, special needs..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gap-2 py-5 text-base"
                disabled={submitting || !startDate || !endDate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Request Booking
                  </>
                )}
              </Button>

              {(!startDate || !endDate) && (
                <p className="text-xs text-center text-foreground/40">
                  Select your stay dates on the calendar first
                </p>
              )}
            </Card>

            {/* Info Card */}
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
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>No account required — just fill in your details</span>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </section>
    </div>
  );
}