import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import {
  UserCheck,
  Calendar,
  TrendingUp,
  LogOut,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Dog,
  User,
  ClipboardList,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Ban,
  Unlock,
  CalendarRange,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  getDay,
} from "date-fns";

const MAX_DOGS_PER_DAY = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

interface Pet {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  age: string | null;
  weight: string | null;
  spayed_neutered: boolean;
  shots_up_to_date: boolean;
}

interface Questionnaire {
  id: string;
  customer_id: string;
  pet_id: string;
  emergency_contact: string | null;
  vet_contact: string | null;
  allergies_meds_feeding: string | null;
  allowed_human_food: string | null;
  gets_along_with: string | null;
  has_bitten_destroyed: string | null;
  separation_anxiety_crate: string | null;
  walk_length: string | null;
  exercise_level: string | null;
  dog_parks_hikes_offleash: string | null;
  car_travel_comfort: string | null;
  furniture_sleep: string | null;
  bath_swim: string | null;
  office_behavior: string | null;
  quirks_tips: string | null;
  created_at: string;
}

interface EnrichedBooking {
  id: string;
  customer_id: string | null;
  service_type: string | null;
  start_date: string | null;
  end_date: string | null;
  dropoff_time: string | null;
  notes: string | null;
  status: string;
  price: number | null;
  created_at: string;
  // Calendar-app fields (anonymous bookings)
  owner_name: string | null;
  email: string | null;
  pet_name: string | null;
  // Resolved from joins
  profile: UserProfile | null;
  pet: Pet | null;
  questionnaire: Questionnaire | null;
}

interface BookedDate {
  date: Date;
  count: number;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

// ─── Helper: resolve display name / email / pet for a booking ────────────────

function getDisplayName(b: EnrichedBooking): string {
  return b.profile?.full_name || b.owner_name || "—";
}

function getDisplayEmail(b: EnrichedBooking): string {
  return b.profile?.email || b.email || "—";
}

function getDisplayPetName(b: EnrichedBooking): string {
  return b.pet?.name || b.pet_name || "—";
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "confirmed"
      ? "bg-green-100 text-green-700"
      : status === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : status === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingDetailModal({
  booking,
  open,
  onClose,
  onUpdateStatus,
}: {
  booking: EnrichedBooking | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  if (!booking) return null;

  const q = booking.questionnaire;
  const pet = booking.pet;
  const profile = booking.profile;

  const qFields: { label: string; value: string | null | undefined }[] = [
    { label: "Emergency Contact", value: q?.emergency_contact },
    { label: "Vet Contact", value: q?.vet_contact },
    { label: "Allergies / Meds / Feeding", value: q?.allergies_meds_feeding },
    { label: "Allowed Human Food", value: q?.allowed_human_food },
    { label: "Gets Along With", value: q?.gets_along_with },
    { label: "Bitten / Destroyed Property", value: q?.has_bitten_destroyed },
    { label: "Separation Anxiety / Crate", value: q?.separation_anxiety_crate },
    { label: "Walk Length", value: q?.walk_length },
    { label: "Exercise Level", value: q?.exercise_level },
    { label: "Dog Parks / Hikes / Off-leash", value: q?.dog_parks_hikes_offleash },
    { label: "Car Travel Comfort", value: q?.car_travel_comfort },
    { label: "Furniture / Sleep", value: q?.furniture_sleep },
    { label: "Bath / Swim", value: q?.bath_swim },
    { label: "Office Behaviour", value: q?.office_behavior },
    { label: "Quirks & Tips", value: q?.quirks_tips },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 py-5 space-y-6">

            {/* ── Booking Info ── */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Booking
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-foreground/60">Service</span>
                  <p className="font-medium capitalize">{booking.service_type || "—"}</p>
                </div>
                <div>
                  <span className="text-foreground/60">Status</span>
                  <p className="mt-0.5"><StatusBadge status={booking.status} /></p>
                </div>
                <div>
                  <span className="text-foreground/60">Check-in</span>
                  <p className="font-medium">
                    {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">Check-out</span>
                  <p className="font-medium">
                    {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                {booking.dropoff_time && (
                  <div>
                    <span className="text-foreground/60">Drop-off Time</span>
                    <p className="font-medium">{booking.dropoff_time}</p>
                  </div>
                )}
                {booking.price != null && (
                  <div>
                    <span className="text-foreground/60">Price</span>
                    <p className="font-medium">${booking.price}</p>
                  </div>
                )}
                {booking.notes && (
                  <div className="col-span-2">
                    <span className="text-foreground/60">Notes</span>
                    <p className="font-medium">{booking.notes}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* ── Client Info ── */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Client
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-foreground/60">Name</span>
                  <p className="font-medium">{getDisplayName(booking)}</p>
                </div>
                <div>
                  <span className="text-foreground/60">Email</span>
                  <p className="font-medium break-all">{getDisplayEmail(booking)}</p>
                </div>
                {profile?.role && (
                  <div>
                    <span className="text-foreground/60">Role</span>
                    <p className="font-medium capitalize">{profile.role}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* ── Pet Profile ── */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3 flex items-center gap-1.5">
                <Dog className="w-4 h-4" /> Pet Profile
              </h3>
              {pet ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-foreground/60">Name</span>
                    <p className="font-medium">{pet.name}</p>
                  </div>
                  {pet.breed && (
                    <div>
                      <span className="text-foreground/60">Breed</span>
                      <p className="font-medium">{pet.breed}</p>
                    </div>
                  )}
                  {pet.age && (
                    <div>
                      <span className="text-foreground/60">Age</span>
                      <p className="font-medium">{pet.age}</p>
                    </div>
                  )}
                  {pet.weight && (
                    <div>
                      <span className="text-foreground/60">Weight</span>
                      <p className="font-medium">{pet.weight}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-foreground/60">Spayed / Neutered</span>
                    <p className="font-medium">{pet.spayed_neutered ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-foreground/60">Shots Up to Date</span>
                    <p className="font-medium">{pet.shots_up_to_date ? "Yes" : "No"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/50 italic">
                  {booking.pet_name
                    ? `Pet name: ${booking.pet_name} (no profile linked)`
                    : "No pet profile linked to this booking."}
                </p>
              )}
            </section>

            {/* ── Questionnaire ── */}
            {q ? (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" /> Questionnaire
                  </h3>
                  <div className="space-y-3 text-sm">
                    {qFields.map(({ label, value }) =>
                      value ? (
                        <div key={label}>
                          <span className="text-foreground/60">{label}</span>
                          <p className="font-medium whitespace-pre-wrap">{value}</p>
                        </div>
                      ) : null
                    )}
                    {qFields.every(({ value }) => !value) && (
                      <p className="text-foreground/50 italic">All questionnaire fields are empty.</p>
                    )}
                  </div>
                </section>
              </>
            ) : booking.customer_id ? (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" /> Questionnaire
                  </h3>
                  <p className="text-sm text-foreground/50 italic">
                    No questionnaire submitted for this client yet.
                  </p>
                </section>
              </>
            ) : null}

          </div>
        </ScrollArea>

        {/* Footer actions */}
        {booking.status === "pending" && (
          <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => { onUpdateStatus(booking.id, "cancelled"); onClose(); }}
            >
              <XCircle className="w-4 h-4" />
              Deny
            </Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => { onUpdateStatus(booking.id, "confirmed"); onClose(); }}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Admin Calendar Component ────────────────────────────────────────────────

function AdminCalendar({ bookings }: { bookings: EnrichedBooking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [blockingDate, setBlockingDate] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Block Date Range state
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeReason, setRangeReason] = useState("");
  const [blockingRange, setBlockingRange] = useState(false);

  // Fetch availability data
  const fetchCalendarData = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      // Count bookings per date from confirmed/pending bookings
      const { data: rawBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("start_date, end_date, status")
        .in("status", ["pending", "confirmed"]);

      if (bookingsError) throw bookingsError;

      const dateCounts: Record<string, number> = {};
      (rawBookings || []).forEach((booking: any) => {
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
          .select("id, date, reason");
        if (blocked) {
          setBlockedDates(blocked as BlockedDate[]);
        }
      } catch {
        // blocked_dates table may not exist yet
      }
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
      toast.error("Could not load calendar data.");
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Calendar helpers
  const getBookingCount = (date: Date) => {
    const found = bookedDates.find((b) => isSameDay(b.date, date));
    return found ? found.count : 0;
  };

  const isBlocked = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.some((b) => b.date === dateStr);
  };

  const getBlockedEntry = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.find((b) => b.date === dateStr);
  };

  const isPast = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
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

  // Get day cell color class
  const getDayCellClass = (date: Date) => {
    if (isBlocked(date)) {
      return "bg-red-100 border-red-300 text-red-800";
    }
    const count = getBookingCount(date);
    if (count >= MAX_DOGS_PER_DAY) {
      return "bg-red-50 border-red-200 text-red-700";
    }
    if (count === 1) {
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
    return "bg-green-50 border-green-200 text-green-800";
  };

  // Block/Unblock handlers
  const handleBlockDate = async (date: Date) => {
    setBlockingDate(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const { error } = await supabase
        .from("blocked_dates")
        .insert({ date: dateStr, reason: blockReason || null });
      if (error) throw error;
      toast.success(`Blocked ${format(date, "MMM d, yyyy")}`);
      setBlockReason("");
      await fetchCalendarData();
    } catch (err: any) {
      console.error("Failed to block date:", err);
      toast.error(`Failed to block date: ${err.message}`);
    } finally {
      setBlockingDate(false);
    }
  };

  const handleUnblockDate = async (date: Date) => {
    setBlockingDate(true);
    try {
      const entry = getBlockedEntry(date);
      if (!entry) return;
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", entry.id);
      if (error) throw error;
      toast.success(`Unblocked ${format(date, "MMM d, yyyy")}`);
      await fetchCalendarData();
    } catch (err: any) {
      console.error("Failed to unblock date:", err);
      toast.error(`Failed to unblock date: ${err.message}`);
    } finally {
      setBlockingDate(false);
    }
  };

  // Block Date Range handler
  const handleBlockDateRange = async () => {
    if (!rangeStart || !rangeEnd) {
      toast.error("Please select both a start and end date.");
      return;
    }
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (isAfter(start, end)) {
      toast.error("Start date must be before or equal to end date.");
      return;
    }

    setBlockingRange(true);
    try {
      const days = eachDayOfInterval({ start, end });
      const rows = days.map((day) => ({
        date: format(day, "yyyy-MM-dd"),
        reason: rangeReason.trim() || null,
      }));

      const { error } = await supabase
        .from("blocked_dates")
        .upsert(rows, { onConflict: "date" });
      if (error) throw error;

      toast.success(
        `Blocked ${days.length} day${days.length > 1 ? "s" : ""}: ${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
      );
      setRangeStart("");
      setRangeEnd("");
      setRangeReason("");
      setRangeModalOpen(false);
      await fetchCalendarData();
    } catch (err: any) {
      console.error("Failed to block date range:", err);
      toast.error(`Failed to block range: ${err.message}`);
    } finally {
      setBlockingRange(false);
    }
  };

  // Get bookings for selected date
  const getBookingsForDate = (date: Date): EnrichedBooking[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter((b) => {
      if (!b.start_date || !b.end_date) return false;
      if (b.status === "cancelled") return false;
      const start = format(new Date(b.start_date), "yyyy-MM-dd");
      const end = format(new Date(b.end_date), "yyyy-MM-dd");
      return dateStr >= start && dateStr <= end;
    });
  };

  const calendarDays = generateCalendarDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loadingCalendar) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          {/* Block Range Button + Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => setRangeModalOpen(true)}
            >
              <CalendarRange className="w-4 h-4" />
              Block Date Range
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300" />
              <span>1 booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span>Full (2 bookings)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
              <span className="flex items-center gap-0.5">Blocked <Ban className="w-3 h-3" /></span>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-foreground/60 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const count = getBookingCount(date);
              const blocked = isBlocked(date);
              const past = isPast(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={format(date, "yyyy-MM-dd")}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    aspect-square rounded-lg border text-sm font-medium
                    flex flex-col items-center justify-center gap-0.5
                    transition-all relative
                    ${past ? "opacity-40" : "hover:scale-105 hover:shadow-md cursor-pointer"}
                    ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
                    ${isToday ? "ring-1 ring-primary/50" : ""}
                    ${past ? "bg-gray-50 border-gray-200 text-gray-400" : getDayCellClass(date)}
                  `}
                >
                  <span className="text-sm leading-none">{format(date, "d")}</span>
                  {blocked && !past && (
                    <Ban className="w-3.5 h-3.5 text-red-600 absolute top-0.5 right-0.5" />
                  )}
                  {!blocked && !past && count > 0 && (
                    <span className="text-[10px] leading-none font-bold">
                      {count}/{MAX_DOGS_PER_DAY}
                    </span>
                  )}
                  {!blocked && !past && count === 0 && (
                    <span className="text-[10px] leading-none opacity-60">open</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Day Detail Panel */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-24">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, "EEE, MMM d, yyyy")}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-primary/10 rounded text-foreground/50"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Status summary */}
              <div className="space-y-2">
                {isBlocked(selectedDate) && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <Ban className="w-4 h-4" />
                    <span className="text-sm font-medium">Date is BLOCKED</span>
                  </div>
                )}
                <div className="text-sm text-foreground/70">
                  Bookings: <span className="font-semibold">{getBookingCount(selectedDate)}</span> / {MAX_DOGS_PER_DAY}
                </div>
                {getBlockedEntry(selectedDate)?.reason && (
                  <div className="text-sm text-foreground/60">
                    Reason: <span className="italic">{getBlockedEntry(selectedDate)?.reason}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Block/Unblock controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/70">Manage Date</h4>
                {isBlocked(selectedDate) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50"
                    onClick={() => handleUnblockDate(selectedDate)}
                    disabled={blockingDate}
                  >
                    {blockingDate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                    Unblock this date
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleBlockDate(selectedDate)}
                      disabled={blockingDate}
                    >
                      {blockingDate ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      Block this date
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Bookings for this date */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/70">
                  Bookings on this day
                </h4>
                {(() => {
                  const dayBookings = getBookingsForDate(selectedDate);
                  if (dayBookings.length === 0) {
                    return (
                      <p className="text-sm text-foreground/50 italic">
                        No bookings for this date.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {dayBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-lg border border-border bg-card hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {getDisplayName(b)}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>
                          <div className="text-xs text-foreground/60 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Dog className="w-3 h-3" />
                              {getDisplayPetName(b)}
                            </div>
                            <div>
                              {b.start_date && format(new Date(b.start_date), "MMM d")}
                              {b.end_date && ` – ${format(new Date(b.end_date), "MMM d")}`}
                            </div>
                            {b.service_type && (
                              <div className="capitalize">{b.service_type}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-foreground/50">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Click a date to view details</p>
              <p className="text-xs mt-1">and manage blocked dates</p>
            </div>
          )}
        </Card>
      </div>

      {/* Block Date Range Modal */}
      <Dialog open={rangeModalOpen} onOpenChange={setRangeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-red-600" />
              Block Date Range
            </DialogTitle>
            <DialogDescription>
              Block multiple consecutive dates at once. Each day in the range will be
              inserted into the blocked dates list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                min={rangeStart || undefined}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <input
                type="text"
                value={rangeReason}
                onChange={(e) => setRangeReason(e.target.value)}
                placeholder="e.g., Holiday break, Vacation"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {rangeStart && rangeEnd && !isAfter(new Date(rangeStart), new Date(rangeEnd)) && (
              <div className="text-xs text-foreground/60 bg-muted/50 px-3 py-2 rounded-lg">
                This will block{" "}
                <strong>
                  {eachDayOfInterval({
                    start: new Date(rangeStart),
                    end: new Date(rangeEnd),
                  }).length}
                </strong>{" "}
                day(s) from{" "}
                {format(new Date(rangeStart), "MMM d, yyyy")} to{" "}
                {format(new Date(rangeEnd), "MMM d, yyyy")}.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRangeModalOpen(false)}
              disabled={blockingRange}
            >
              Cancel
            </Button>
            <Button
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleBlockDateRange}
              disabled={blockingRange || !rangeStart || !rangeEnd}
            >
              {blockingRange ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              Block Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, userRole, signOut, loading: authLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Enriched bookings state
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<EnrichedBooking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch all bookings, then enrich with profile/pet/questionnaire data ──

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      // 1. Fetch all bookings
      const { data: rawBookings, error: bookingsErr } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsErr) throw bookingsErr;
      if (!rawBookings || rawBookings.length === 0) {
        setBookings([]);
        return;
      }

      // 2. Collect unique customer_ids and pet_ids (from platform bookings)
      const customerIds = [...new Set(
        rawBookings.map((b: any) => b.customer_id).filter(Boolean)
      )] as string[];

      // 3. Fetch profiles for those customer_ids
      let profilesMap: Record<string, UserProfile> = {};
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("users")
          .select("id, full_name, email, role")
          .in("id", customerIds);
        if (profiles) {
          profiles.forEach((p: UserProfile) => { profilesMap[p.id] = p; });
        }
      }

      // 4. Fetch pets for those customer_ids (by owner_id)
      let petsMap: Record<string, Pet[]> = {};
      if (customerIds.length > 0) {
        const { data: pets } = await supabase
          .from("pets")
          .select("id, owner_id, name, breed, age, weight, spayed_neutered, shots_up_to_date")
          .in("owner_id", customerIds);
        if (pets) {
          pets.forEach((p: Pet) => {
            if (!petsMap[p.owner_id]) petsMap[p.owner_id] = [];
            petsMap[p.owner_id].push(p);
          });
        }
      }

      // 5. Fetch questionnaires for those customer_ids
      let questionnairesMap: Record<string, Questionnaire[]> = {};
      if (customerIds.length > 0) {
        const { data: questionnaires } = await supabase
          .from("questionnaires")
          .select("*")
          .in("customer_id", customerIds);
        if (questionnaires) {
          questionnaires.forEach((q: Questionnaire) => {
            if (!questionnairesMap[q.customer_id]) questionnairesMap[q.customer_id] = [];
            questionnairesMap[q.customer_id].push(q);
          });
        }
      }

      // 6. Enrich each booking
      const enriched: EnrichedBooking[] = rawBookings.map((b: any) => {
        const profile = b.customer_id ? (profilesMap[b.customer_id] || null) : null;
        const ownerPets = b.customer_id ? (petsMap[b.customer_id] || []) : [];
        const ownerQuestionnaires = b.customer_id ? (questionnairesMap[b.customer_id] || []) : [];

        // Try to match pet by pet_id if present, otherwise pick first pet
        let pet: Pet | null = null;
        if (b.pet_id) {
          pet = ownerPets.find((p) => p.id === b.pet_id) || null;
        }
        if (!pet && ownerPets.length > 0) {
          pet = ownerPets[0];
        }

        // Try to match questionnaire by pet_id if available, otherwise pick most recent
        let questionnaire: Questionnaire | null = null;
        if (pet && ownerQuestionnaires.length > 0) {
          questionnaire =
            ownerQuestionnaires.find((q) => q.pet_id === pet!.id) ||
            ownerQuestionnaires[0];
        } else if (ownerQuestionnaires.length > 0) {
          questionnaire = ownerQuestionnaires[0];
        }

        return {
          id: b.id,
          customer_id: b.customer_id || null,
          service_type: b.service_type || null,
          start_date: b.start_date || null,
          end_date: b.end_date || null,
          dropoff_time: b.dropoff_time || null,
          notes: b.notes || null,
          status: b.status || "pending",
          price: b.price ?? null,
          created_at: b.created_at,
          owner_name: b.owner_name || null,
          email: b.email || null,
          pet_name: b.pet_name || null,
          profile,
          pet,
          questionnaire,
        };
      });

      setBookings(enriched);
    } catch (err: any) {
      console.error("Error fetching admin bookings:", err);
      toast.error(`Failed to load bookings: ${err.message}`);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchBookings();
    }
  }, [user, userRole, fetchBookings]);

  // ── Handlers ──

  const handleLogout = async () => {
    try {
      await signOut();
      setLocation("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);
      if (error) throw error;
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  const openDetail = (booking: EnrichedBooking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  // ── Auth guards ──

  if (authLoading || (user && userRole === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/70 mb-6">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // ── Stats ──

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // ── Shared table row renderer ──

  const renderBookingRow = (booking: EnrichedBooking, showEmail = false) => (
    <tr
      key={booking.id}
      className="border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
      onClick={() => openDetail(booking)}
    >
      <td className="px-4 py-3 text-sm">
        <div className="font-medium">{getDisplayName(booking)}</div>
        {showEmail && (
          <div className="text-foreground/50 text-xs">{getDisplayEmail(booking)}</div>
        )}
      </td>
      {!showEmail && (
        <td className="px-4 py-3 text-sm text-foreground/70">
          {getDisplayEmail(booking)}
        </td>
      )}
      <td className="px-4 py-3 text-sm">{getDisplayPetName(booking)}</td>
      <td className="px-4 py-3 text-sm">
        <div>
          {booking.start_date
            ? new Date(booking.start_date).toLocaleDateString()
            : "—"}
        </div>
        {booking.end_date && (
          <div className="text-foreground/50 text-xs">
            to {new Date(booking.end_date).toLocaleDateString()}
          </div>
        )}
      </td>
      {!showEmail && (
        <td className="px-4 py-3 text-sm max-w-[180px]">
          <span className="truncate block" title={booking.notes || undefined}>
            {booking.notes || "—"}
          </span>
        </td>
      )}
      <td className="px-4 py-3 text-sm">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openDetail(booking)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // ── Render ──

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <PawHeartLogo size={24} className="text-primary" />
              <span className="font-serif font-bold">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/70">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {["overview", "bookings", "calendar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold">Platform Overview</h2>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary/50" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500/50" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{confirmedBookings}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500/50" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary/50" />
                </div>
              </Card>
            </div>

            {/* Recent Bookings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <Card className="p-8 text-center text-foreground/60">
                  <p className="mb-4">No bookings yet</p>
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Open Calendar <Calendar className="w-4 h-4" />
                  </button>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary/5 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Pet</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dates</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 10).map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => openDetail(booking)}
                          >
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">{getDisplayName(booking)}</div>
                              <div className="text-foreground/50 text-xs">{getDisplayEmail(booking)}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">{getDisplayPetName(booking)}</td>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                {booking.start_date
                                  ? new Date(booking.start_date).toLocaleDateString()
                                  : "—"}
                              </div>
                              {booking.end_date && (
                                <div className="text-foreground/50 text-xs">
                                  to {new Date(booking.end_date).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openDetail(booking)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {booking.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                      title="Confirm"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      title="Cancel"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab — Full list */}
        {activeTab === "bookings" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">All Bookings</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="w-4 h-4" />
                View Calendar
              </Button>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <Card className="p-8 text-center text-foreground/60">
                No bookings found. Bookings will appear here when customers use
                the calendar to book stays.
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Pet</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Dates</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Notes</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => renderBookingRow(booking))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Calendar Tab — Integrated Admin Calendar */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Booking Calendar</h2>
              <p className="text-sm text-foreground/60">
                Manage availability and view bookings by date
              </p>
            </div>
            <AdminCalendar bookings={bookings} />
          </div>
        )}
      </main>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedBooking(null); }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
