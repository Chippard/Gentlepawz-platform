import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useBookings(userId: string | null, fetchAll: boolean = false) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!fetchAll && !userId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        // If not fetching all, filter by user
        if (!fetchAll && userId) {
          query = query.or(`customer_id.eq.${userId},walker_id.eq.${userId}`);
        }

        const { data, error: err } = await query;

        if (err) throw err;
        setBookings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, fetchAll, refreshKey]);

  return { bookings, loading, error, refetch };
}

export function useMessages(userId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error: err } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  return { messages, loading, error };
}

export function useReviews(walkerId: string | null) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walkerId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const { data, error: err } = await supabase
          .from('reviews')
          .select('*')
          .eq('walker_id', walkerId)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setReviews(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [walkerId]);

  return { reviews, loading, error };
}

export function useWalkerProfile(userId: string | null) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error: err } = await supabase
          .from('walker_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (err && err.code !== 'PGRST116') throw err; // PGRST116 = no rows
        setProfile(data || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export function useWalkers() {
  const [walkers, setWalkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalkers = async () => {
      try {
        const { data: profiles, error: err } = await supabase
          .from('walker_profiles')
          .select('*, users:user_id(id, email, full_name, avatar_url)');

        if (err) throw err;
        setWalkers(profiles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalkers();
  }, []);

  return { walkers, loading, error };
}

export async function createBooking(booking: any) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function createMessage(message: any) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function createReview(review: any) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function updateWalkerProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('walker_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();

  if (error) throw error;
  return data?.[0];
}
