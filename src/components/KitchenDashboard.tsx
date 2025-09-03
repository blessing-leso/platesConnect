import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, MapPin, Phone, Star, CheckCircle } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
  whatsapp_opted_in: boolean;
  user_type: 'kitchen';
  location: string;
  created_at: string;
  updated_at: string;
}

interface SurplusListing {
  id: string;
  farmer_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  price: number;
  description: string | null;
  status: 'available' | 'claimed' | 'collected' | 'expired';
  location: string;
  created_at: string;
}

interface SurplusMatch {
  id: string;
  surplus_id: string;
  kitchen_id: string;
  match_score: number;
  distance_km: number | null;
  nutritional_fit_score: number | null;
  capacity_fit_score: number | null;
  claimed: boolean;
  claimed_at: string | null;
  pickup_scheduled_at: string | null;
  created_at: string;
  surplus_listings: SurplusListing;
}

interface KitchenDashboardProps {
  profile: Profile;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ profile }) => {
  const [matches, setMatches] = useState<SurplusMatch[]>([]);
  const [availableSurplus, setAvailableSurplus] = useState<SurplusListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchAvailableSurplus();
  }, []);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('surplus_matches')
      .select(`
        *,
        surplus_listings (*)
      `)
      .eq('kitchen_id', profile.user_id)
      .order('match_score', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches(data || []);
    }
  };

  const fetchAvailableSurplus = async () => {
    const { data, error } = await supabase
      .from('surplus_listings')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surplus:', error);
    } else {
      setAvailableSurplus(data || []);
    }
  };

  const handleClaimSurplus = async (matchId: string, surplusId: string) => {
    setLoading(true);
    try {
      // Update match as claimed
      const { error: matchError } = await supabase
        .from('surplus_matches')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Update surplus status
      const { error: surplusError } = await supabase
        .from('surplus_listings')
        .update({ status: 'claimed' })
        .eq('id', surplusId);

      if (surplusError) throw surplusError;

      toast({
        title: "Success!",
        description: "Surplus claimed successfully. The farmer will be notified via WhatsApp."
      });

      // Refresh data
      fetchMatches();
      fetchAvailableSurplus();

      // Trigger WhatsApp notification (we'll create this function later)
      await sendWhatsAppNotification(surplusId);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppNotification = async (surplusId: string) => {
    try {
      await supabase.functions.invoke('whatsapp-notification', {
        body: { 
          surplus_id: surplusId,
          kitchen_id: profile.user_id,
          type: 'surplus_claimed'
        }
      });
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDistance = (distance: number | null) => {
    if (!distance) return 'Distance unknown';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const stats = {
    totalMatches: matches.length,
    claimedSurplus: matches.filter(m => m.claimed).length,
    availableNearby: availableSurplus.length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed Surplus</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.claimedSurplus}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Nearby</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableNearby}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommended Matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">AI Recommended Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map(match => (
              <Card key={match.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{match.surplus_listings.product_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Package className="h-4 w-4" />
                        {match.surplus_listings.quantity} {match.surplus_listings.unit}
                        <Clock className="h-4 w-4 ml-2" />
                        Expires: {new Date(match.surplus_listings.expiry_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getMatchScoreColor(match.match_score)}`}>
                        {Math.round(match.match_score * 100)}% match
                      </div>
                      {match.distance_km && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatDistance(match.distance_km)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {match.surplus_listings.description && (
                      <p className="text-sm text-muted-foreground">
                        {match.surplus_listings.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{match.surplus_listings.location}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {match.surplus_listings.price > 0 
                          ? `R${match.surplus_listings.price}` 
                          : 'Free donation'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Listed: {new Date(match.surplus_listings.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {match.claimed ? (
                      <Badge className="bg-green-100 text-green-800 w-full justify-center">
                        Claimed - Pickup scheduled
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => handleClaimSurplus(match.id, match.surplus_listings.id)}
                        disabled={loading}
                        className="w-full"
                      >
                        Claim This Surplus
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Available Surplus */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Available Surplus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSurplus.map(surplus => (
            <Card key={surplus.id}>
              <CardHeader>
                <CardTitle className="text-lg">{surplus.product_name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {surplus.quantity} {surplus.unit}
                  <Clock className="h-4 w-4 ml-2" />
                  Expires: {new Date(surplus.expiry_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surplus.description && (
                    <p className="text-sm text-muted-foreground">{surplus.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{surplus.location}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {surplus.price > 0 ? `R${surplus.price}` : 'Free donation'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(surplus.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Button 
                    onClick={() => {
                      // Create a manual match and claim
                      toast({
                        title: "Feature coming soon",
                        description: "Direct claiming without AI matching will be available soon."
                      });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Request This Surplus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {availableSurplus.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No surplus available</h3>
              <p className="text-muted-foreground">
                Check back soon or ask farmers in your area to list their surplus on Kaiǀūb
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};