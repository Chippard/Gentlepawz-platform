import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import {
  PawPrint,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Dog,
  Weight,
  Calendar as CalendarIcon,
  Heart,
  Shield,
} from "lucide-react";

interface Pet {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  spayed_neutered: boolean;
  shots_up_to_date: boolean;
  photo_url: string | null;
  created_at: string;
}

interface PetFormData {
  name: string;
  breed: string;
  age: string;
  weight: string;
  spayed_neutered: boolean;
  shots_up_to_date: boolean;
}

const emptyForm: PetFormData = {
  name: "",
  breed: "",
  age: "",
  weight: "",
  spayed_neutered: false,
  shots_up_to_date: false,
};

export default function PetProfile() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PetFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  // Fetch pets
  useEffect(() => {
    if (!user) return;
    fetchPets();
  }, [user]);

  const fetchPets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (err: any) {
      console.error("Error fetching pets:", err);
      toast.error("Failed to load pets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error("Please enter your pet's name");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing pet
        const { error } = await supabase
          .from("pets")
          .update({
            name: formData.name.trim(),
            breed: formData.breed.trim(),
            age: formData.age.trim(),
            weight: formData.weight.trim(),
            spayed_neutered: formData.spayed_neutered,
            shots_up_to_date: formData.shots_up_to_date,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Pet updated successfully!");
      } else {
        // Create new pet
        const { error } = await supabase.from("pets").insert({
          owner_id: user.id,
          name: formData.name.trim(),
          breed: formData.breed.trim(),
          age: formData.age.trim(),
          weight: formData.weight.trim(),
          spayed_neutered: formData.spayed_neutered,
          shots_up_to_date: formData.shots_up_to_date,
        });

        if (error) throw error;
        toast.success("Pet added successfully!");
      }

      setFormData(emptyForm);
      setShowForm(false);
      setEditingId(null);
      fetchPets();
    } catch (err: any) {
      console.error("Error saving pet:", err);
      toast.error(err.message || "Failed to save pet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setFormData({
      name: pet.name,
      breed: pet.breed || "",
      age: pet.age || "",
      weight: pet.weight || "",
      spayed_neutered: pet.spayed_neutered,
      shots_up_to_date: pet.shots_up_to_date,
    });
    setEditingId(pet.id);
    setShowForm(true);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm("Are you sure you want to remove this pet?")) return;

    setDeletingId(petId);
    try {
      const { error } = await supabase.from("pets").delete().eq("id", petId);
      if (error) throw error;
      toast.success("Pet removed");
      fetchPets();
    } catch (err: any) {
      console.error("Error deleting pet:", err);
      toast.error("Failed to remove pet");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-10">
        <div className="container max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <PawPrint className="w-4 h-4" />
            My Pets
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Pet Profiles
          </h1>
          <p className="text-foreground/60 max-w-lg mx-auto">
            Manage your furry family members. Add their details so we can
            provide the best care possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container max-w-4xl mx-auto py-8 px-4">
        {/* Add Pet Button */}
        {!showForm && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add a Pet
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-primary/20">
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Dog className="w-5 h-5 text-primary" />
              {editingId ? "Edit Pet" : "Add a New Pet"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Buddy"
                    required
                  />
                </div>

                {/* Breed */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Breed</label>
                  <Input
                    value={formData.breed}
                    onChange={(e) =>
                      setFormData({ ...formData, breed: e.target.value })
                    }
                    placeholder="Golden Retriever"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder="3 years"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Weight</label>
                  <Input
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="65 lbs"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.spayed_neutered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spayed_neutered: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Spayed / Neutered</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shots_up_to_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shots_up_to_date: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Shots Up to Date</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingId ? "Update Pet" : "Add Pet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Pets List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-foreground/60">Loading pets...</span>
          </div>
        ) : pets.length === 0 ? (
          <Card className="p-12 text-center">
            <PawPrint className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
            <p className="text-foreground/60 mb-4">
              Add your first pet to get started with booking.
            </p>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Pet
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Card
                key={pet.id}
                className="p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Dog className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg">
                        {pet.name}
                      </h3>
                      {pet.breed && (
                        <p className="text-sm text-foreground/60">
                          {pet.breed}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(pet)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pet.id)}
                      disabled={deletingId === pet.id}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {deletingId === pet.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Pet Details */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {pet.age && (
                    <div className="flex items-center gap-2 text-foreground/70">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
                      <span>{pet.age}</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex items-center gap-2 text-foreground/70">
                      <Weight className="w-3.5 h-3.5 text-primary/60" />
                      <span>{pet.weight}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Heart className="w-3.5 h-3.5 text-primary/60" />
                    <span>
                      {pet.spayed_neutered
                        ? "Spayed/Neutered"
                        : "Not spayed/neutered"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Shield className="w-3.5 h-3.5 text-primary/60" />
                    <span>
                      {pet.shots_up_to_date
                        ? "Shots current"
                        : "Shots not current"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
