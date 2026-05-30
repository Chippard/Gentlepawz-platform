import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  ClipboardList,
  Loader2,
  CheckCircle,
  AlertCircle,
  Dog,
  Phone,
  Stethoscope,
  PawPrint,
} from "lucide-react";

interface Pet {
  id: string;
  name: string;
  age: string;
  spayed_neutered: boolean;
  shots_up_to_date: boolean;
}

export default function Questionnaire() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, loading: authLoading } = useSupabaseAuth();

  // Parse pet_id from query string (?pet_id=xxx)
  const params = new URLSearchParams(search);
  const petIdParam = params.get("pet_id") || "";

  // Pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsWithQuestionnaires, setPetsWithQuestionnaires] = useState<Set<string>>(new Set());
  const [loadingPets, setLoadingPets] = useState(true);

  // Form state
  const [selectedPetId, setSelectedPetId] = useState(petIdParam);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [vetContact, setVetContact] = useState("");
  const [allergiesMedsFeeding, setAllergiesMedsFeeding] = useState("");
  const [allowedHumanFood, setAllowedHumanFood] = useState("");
  const [getsAlongWith, setGetsAlongWith] = useState("");
  const [hasBittenDestroyed, setHasBittenDestroyed] = useState("");
  const [separationAnxietyCrate, setSeparationAnxietyCrate] = useState("");
  const [walkLength, setWalkLength] = useState("");
  const [exerciseLevel, setExerciseLevel] = useState("");
  const [dogParksHikesOffleash, setDogParksHikesOffleash] = useState("");
  const [carTravelComfort, setCarTravelComfort] = useState("");
  const [furnitureSleep, setFurnitureSleep] = useState("");
  const [bathSwim, setBathSwim] = useState("");
  const [officeBehavior, setOfficeBehavior] = useState("");
  const [quirksTips, setQuirksTips] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  // Fetch pets and their questionnaire completion status
  useEffect(() => {
    if (!user) return;
    const fetchPets = async () => {
      setLoadingPets(true);
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("id, name, age, spayed_neutered, shots_up_to_date")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const petList = data || [];
        setPets(petList);

        // Find which pets already have questionnaires
        if (petList.length > 0) {
          const petIds = petList.map((p: Pet) => p.id);
          const { data: questData } = await supabase
            .from("questionnaires")
            .select("pet_id")
            .in("pet_id", petIds);
          if (questData) {
            const completedIds = new Set(questData.map((q: { pet_id: string }) => q.pet_id));
            setPetsWithQuestionnaires(completedIds);
          }
        }
      } catch (err: any) {
        console.error("Error fetching pets:", err);
        toast.error("Failed to load pets");
      } finally {
        setLoadingPets(false);
      }
    };
    fetchPets();
  }, [user]);

  // If petIdParam is set and selectedPetId hasn't been set yet, set it once pets load
  useEffect(() => {
    if (petIdParam && !selectedPetId) {
      setSelectedPetId(petIdParam);
    }
  }, [petIdParam]);

  // Get selected pet details
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Pets that still need questionnaires (for the selector when no pet_id param)
  const petsNeedingQuestionnaire = pets.filter((p) => !petsWithQuestionnaires.has(p.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedPetId) {
      toast.error("Please select a pet");
      return;
    }
    if (!emergencyContact.trim()) {
      toast.error("Please provide an emergency contact");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("questionnaires").insert({
        customer_id: user.id,
        pet_id: selectedPetId,
        emergency_contact: emergencyContact.trim(),
        vet_contact: vetContact.trim(),
        allergies_meds_feeding: allergiesMedsFeeding.trim(),
        allowed_human_food: allowedHumanFood.trim(),
        gets_along_with: getsAlongWith.trim(),
        has_bitten_destroyed: hasBittenDestroyed.trim(),
        separation_anxiety_crate: separationAnxietyCrate.trim(),
        walk_length: walkLength.trim(),
        exercise_level: exerciseLevel.trim(),
        dog_parks_hikes_offleash: dogParksHikesOffleash.trim(),
        car_travel_comfort: carTravelComfort.trim(),
        furniture_sleep: furnitureSleep.trim(),
        bath_swim: bathSwim.trim(),
        office_behavior: officeBehavior.trim(),
        quirks_tips: quirksTips.trim(),
      });

      if (error) throw error;

      const petName = selectedPet?.name || "your pet";
      toast.success(`Questionnaire for ${petName} submitted! Heading to your dashboard.`);
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("Error submitting questionnaire:", err);
      toast.error(err.message || "Failed to submit questionnaire");
    } finally {
      setSubmitting(false);
    }
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
            <ClipboardList className="w-4 h-4" />
            New Client Questionnaire
          </div>
          {selectedPet ? (
            <>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">
                Tell Us About {selectedPet.name}
              </h1>
              <p className="text-foreground/60 max-w-lg mx-auto">
                Help us understand {selectedPet.name}'s personality, needs, and preferences so
                we can provide personalized care during their stay.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">
                Tell Us About Your Pup
              </h1>
              <p className="text-foreground/60 max-w-lg mx-auto">
                Help us understand your dog's personality, needs, and preferences so
                we can provide personalized care during their stay.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="container max-w-3xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Info */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Basic Information
            </h2>

            {/* Your Full Name (pre-filled) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your Full Name</label>
              <Input
                value={user.user_metadata?.full_name || user.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Select Pet */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Which pet is this questionnaire for? <span className="text-red-500">*</span>
              </label>
              {loadingPets ? (
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading pets...
                </div>
              ) : pets.length === 0 ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      No pets found.{" "}
                      <button
                        type="button"
                        onClick={() => setLocation("/pets")}
                        className="underline hover:no-underline"
                      >
                        Add a pet first
                      </button>
                    </span>
                  </div>
                </div>
              ) : petIdParam && selectedPet ? (
                // Pre-selected pet from URL param — show read-only
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Dog className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedPet.name}</p>
                    {selectedPet.age && (
                      <p className="text-xs text-foreground/60">{selectedPet.age}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation("/questionnaire")}
                    className="ml-auto text-xs text-primary hover:underline"
                  >
                    Change pet
                  </button>
                </div>
              ) : (
                // No pet_id param — show selector filtered to pets needing questionnaires
                <>
                  {petsNeedingQuestionnaire.length === 0 ? (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          All your pets already have questionnaires on file!{" "}
                          <button
                            type="button"
                            onClick={() => setLocation("/dashboard")}
                            className="underline hover:no-underline"
                          >
                            Go to dashboard
                          </button>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {petsNeedingQuestionnaire.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name} {pet.age ? `(${pet.age})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>

            {/* Pre-filled from pet */}
            {selectedPet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-sm">
                  <span className="text-foreground/60">Spayed/Neutered:</span>{" "}
                  <strong>
                    {selectedPet.spayed_neutered ? "Yes" : "No"}
                  </strong>
                </div>
                <div className="text-sm">
                  <span className="text-foreground/60">Shots Up to Date:</span>{" "}
                  <strong>
                    {selectedPet.shots_up_to_date ? "Yes" : "No"}
                  </strong>
                </div>
              </div>
            )}
          </Card>

          {/* Section: Emergency & Vet */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Emergency & Vet Contacts
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Emergency Contact Info <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name, phone number, relationship..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vet Contact</label>
              <Textarea
                value={vetContact}
                onChange={(e) => setVetContact(e.target.value)}
                placeholder="Vet name, clinic, phone number..."
                rows={2}
              />
            </div>
          </Card>

          {/* Section: Health & Diet */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Health & Diet
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Allergies, Medications, Feeding/Treat Instructions
              </label>
              <Textarea
                value={allergiesMedsFeeding}
                onChange={(e) => setAllergiesMedsFeeding(e.target.value)}
                placeholder="Any allergies, current medications, feeding schedule, treat preferences..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Allowed Human Food?
              </label>
              <Input
                value={allowedHumanFood}
                onChange={(e) => setAllowedHumanFood(e.target.value)}
                placeholder="e.g., Carrots and apples are okay, no chocolate or grapes"
              />
            </div>
          </Card>

          {/* Section: Behavior & Temperament */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <Dog className="w-5 h-5 text-primary" />
              Behavior & Temperament
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Gets along with (dogs, cats, people)?
              </label>
              <Input
                value={getsAlongWith}
                onChange={(e) => setGetsAlongWith(e.target.value)}
                placeholder="e.g., Great with dogs and people, nervous around cats"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Has your dog ever bitten or destroyed property?
              </label>
              <Input
                value={hasBittenDestroyed}
                onChange={(e) => setHasBittenDestroyed(e.target.value)}
                placeholder="e.g., No biting history, has chewed shoes when left alone"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Separation anxiety? Crate trained?
              </label>
              <Input
                value={separationAnxietyCrate}
                onChange={(e) => setSeparationAnxietyCrate(e.target.value)}
                placeholder="e.g., Mild separation anxiety, crate trained and sleeps in crate at night"
              />
            </div>
          </Card>

          {/* Section: Activity & Exercise */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Activity & Exercise
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Walk length comfortable with
              </label>
              <Input
                value={walkLength}
                onChange={(e) => setWalkLength(e.target.value)}
                placeholder="e.g., 30-45 minutes"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Exercise level needed
              </label>
              <Select value={exerciseLevel} onValueChange={setExerciseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — short walks only</SelectItem>
                  <SelectItem value="moderate">
                    Moderate — regular walks and play
                  </SelectItem>
                  <SelectItem value="high">
                    High — needs lots of activity
                  </SelectItem>
                  <SelectItem value="very-high">
                    Very High — athlete dog, needs running/hiking
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Dog parks or hikes? Off-leash okay?
              </label>
              <Input
                value={dogParksHikesOffleash}
                onChange={(e) => setDogParksHikesOffleash(e.target.value)}
                placeholder="e.g., Loves dog parks, good off-leash with reliable recall"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Car travel comfort
              </label>
              <Input
                value={carTravelComfort}
                onChange={(e) => setCarTravelComfort(e.target.value)}
                placeholder="e.g., Loves car rides, no motion sickness"
              />
            </div>
          </Card>

          {/* Section: Home & Lifestyle */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <Dog className="w-5 h-5 text-primary" />
              Home & Lifestyle
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Okay with furniture? Where do they sleep?
              </label>
              <Input
                value={furnitureSleep}
                onChange={(e) => setFurnitureSleep(e.target.value)}
                placeholder="e.g., Allowed on couch, sleeps on dog bed in bedroom"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Bath okay? Can your dog swim?
              </label>
              <Input
                value={bathSwim}
                onChange={(e) => setBathSwim(e.target.value)}
                placeholder="e.g., Tolerates baths, loves swimming in lakes"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                How would your pup behave in an office setting?
              </label>
              <Textarea
                value={officeBehavior}
                onChange={(e) => setOfficeBehavior(e.target.value)}
                placeholder="e.g., Would settle under a desk, might bark at delivery people"
                rows={2}
              />
            </div>
          </Card>

          {/* Section: Anything Else */}
          <Card className="p-6 space-y-5">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Anything Else?
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Any quirks, tips, or extra info?
              </label>
              <Textarea
                value={quirksTips}
                onChange={(e) => setQuirksTips(e.target.value)}
                placeholder="Anything else we should know to make your pup's stay perfect..."
                rows={4}
              />
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-center pb-8">
            <Button
              type="submit"
              disabled={submitting || !selectedPetId}
              className="gap-2 px-8 py-5 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Questionnaire
                  {selectedPet ? ` for ${selectedPet.name}` : ""}
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
