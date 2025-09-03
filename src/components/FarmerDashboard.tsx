import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
  whatsapp_opted_in: boolean;
  user_type: 'farmer';
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

interface FarmerDashboardProps {
  profile: Profile;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({profile}) => {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    price: '0',
    description: ''
  });
  const { toast } = useToast();

  // Load profile and listings on mount
  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch profile
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profilesData) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
        return;
      }

      // Fetch listings
      await fetchListings(session.user.id);
    };

    loadDashboard();
  }, []);

  const fetchListings = async (userId: string) => {
    const { data, error } = await supabase
      .from('surplus_listings')
      .select('*')
      .eq('farmer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your listings",
        variant: "destructive"
      });
    } else {
      setListings(data || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('surplus_listings')
        .insert({
          farmer_id: profile.user_id,
          product_name: formData.productName,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          expiry_date: formData.expiryDate,
          price: parseFloat(formData.price),
          description: formData.description || null,
          location: profile.location
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Surplus listing created successfully. AI matching in progress..."
      });

      // Reset form
      setFormData({
        productName: '',
        quantity: '',
        unit: 'kg',
        expiryDate: '',
        price: '0',
        description: ''
      });
      setShowAddForm(false);

      // Refresh listings
      await fetchListings(profile.user_id);

      // Trigger AI matching
      await triggerAIMatching(profile.user_id);
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

  const triggerAIMatching = async (farmerId: string) => {
    try {
      await supabase.functions.invoke('ai-matching', {
        body: { farmer_id: farmerId }
      });
    } catch (error) {
      console.error('AI matching failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'collected': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'available').length,
    totalKgShared: listings.reduce((sum, l) => sum + l.quantity, 0)
  };

  if (!profile) return <div>Loading your dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surplus Shared</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKgShared.toFixed(1)} kg</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Surplus Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Surplus Listings</h2>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Surplus
        </Button>
      </div>

      {/* Add Surplus Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Surplus</CardTitle>
            <CardDescription>
              List your surplus produce to connect with community kitchens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Tomatoes, Maize, Potatoes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      placeholder="100"
                    />
                    <Select value={formData.unit} onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, unit: value }))
                    }>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="tons">tons</SelectItem>
                        <SelectItem value="bags">bags</SelectItem>
                        <SelectItem value="crates">crates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ZAR) - 0 for donation</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional details about the produce quality, organic certification, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Listing'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <Card key={listing.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{listing.product_name}</CardTitle>
                <Badge className={getStatusColor(listing.status)}>
                  {listing.status}
                </Badge>
              </div>
              <CardDescription>
                {listing.quantity} {listing.unit} • Expires: {new Date(listing.expiry_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {listing.description && (
                <p className="text-sm text-muted-foreground mb-2">{listing.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {listing.price > 0 ? `R${listing.price}` : 'Free donation'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No surplus listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first surplus produce to connect with community kitchens
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Surplus
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
