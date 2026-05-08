import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import {
  Users,
  UserCheck,
  Calendar,
  Star,
  TrendingUp,
  LogOut,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useBookings } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, userRole, signOut, loading: authLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all bookings (admin sees all)
  const { bookings, loading: bookingsLoading, refetch } = useBookings(null, true);

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
      refetch();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  // Show loading spinner while auth is resolving
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

  // Only show Access Denied AFTER auth has fully resolved
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

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

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
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "bookings"
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "calendar"
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            Calendar
          </button>
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
                    <p className="text-sm text-foreground/60 mb-1">
                      Total Bookings
                    </p>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary/50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {pendingBookings}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500/50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {confirmedBookings}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500/50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      ${totalRevenue.toFixed(2)}
                    </p>
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
                  <a
                    href="https://gentlepawz-calendar-d73g.vercel.app/booking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Open Booking Calendar{" "}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary/5 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Client
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Pet
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Dates
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 10).map((booking: any) => (
                          <tr
                            key={booking.id}
                            className="border-b border-border hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">
                                {booking.owner_name || "—"}
                              </div>
                              <div className="text-foreground/50 text-xs">
                                {booking.email || "—"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {booking.pet_name || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div>
                                {booking.start_date
                                  ? new Date(
                                      booking.start_date
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                              {booking.end_date && (
                                <div className="text-foreground/50 text-xs">
                                  to{" "}
                                  {new Date(
                                    booking.end_date
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                              {booking.notes || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : booking.status === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {booking.status === "pending" && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking.id,
                                        "confirmed"
                                      )
                                    }
                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    title="Confirm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        booking.id,
                                        "cancelled"
                                      )
                                    }
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Cancel"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
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

        {/* Bookings Tab - Full list */}
        {activeTab === "bookings" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">All Bookings</h2>
              <a
                href="https://gentlepawz-calendar-d73g.vercel.app/booking"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Open Booking Calendar <ExternalLink className="w-4 h-4" />
              </a>
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
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Pet
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Check-in
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Check-out
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking: any) => (
                        <tr
                          key={booking.id}
                          className="border-b border-border hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            {booking.owner_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/70">
                            {booking.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.pet_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.start_date
                              ? new Date(
                                  booking.start_date
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.end_date
                              ? new Date(
                                  booking.end_date
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm max-w-[200px]">
                            <span
                              className="truncate block"
                              title={booking.notes}
                            >
                              {booking.notes || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : booking.status === "cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.status === "pending" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(booking.id, "confirmed")
                                  }
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Confirm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(booking.id, "cancelled")
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Calendar Tab - Embedded calendar */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Booking Calendar</h2>
              <a
                href="https://gentlepawz-calendar-d73g.vercel.app/booking"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Open in New Tab <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <Card className="overflow-hidden">
              <iframe
                src="https://gentlepawz-calendar-d73g.vercel.app/booking"
                className="w-full h-[700px] border-0"
                title="Gentle Pawz Booking Calendar"
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
