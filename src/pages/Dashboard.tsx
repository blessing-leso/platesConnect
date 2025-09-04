import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { KitchenDashboard } from '@/components/KitchenDashboard';
import { Loader2 } from 'lucide-react';
import { Header } from "@/components/Header";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
  whatsapp_opted_in: boolean;
  user_type: 'farmer' | 'kitchen';
  location: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
           
          
          if (error) {
            console.error('Error fetching profile:', error);
            toast({
              title: "Error",
              description: "Failed to load profile. Please try again.",
              variant: "destructive"
            });
          } else {
            setProfile(profileData && profileData.length > 0 ? profileData[0] : null);
          }
        } else {
          setProfile(null);
          navigate('/auth');
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignOut = async () => {
      try {
          setLoadingLogout(true);
           const { error } = await supabase.auth.signOut();
          if (error) {
          toast({
            title: "Error",
                description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      navigate('/');
    }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred during sign out.",
          variant: "destructive"
        });
      } finally {
        setLoadingLogout(false);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-primary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (loadingLogout) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-primary">Signing you out...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Kaiǀūb Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {profile.user_type === 'farmer' ? (
          <FarmerDashboard profile={profile} />
        ) : (
          <KitchenDashboard profile={profile} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;