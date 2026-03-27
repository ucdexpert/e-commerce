'use client';

import { useEffect, useState } from 'react';
import { Gift, Trophy, Star, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LoyaltyStats {
  points: number;
  tier: string;
  points_to_next_tier: number;
  total_earned: number;
  total_redeemed: number;
  rank: number;
}

interface Tier {
  name: string;
  icon: any;
  color: string;
  min_points: number;
  benefits: string[];
}

export default function LoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setStats({
      points: 2450,
      tier: 'Gold',
      points_to_next_tier: 550,
      total_earned: 5000,
      total_redeemed: 2550,
      rank: 47,
    });
    setLoading(false);
  }, []);

  const tiers: Tier[] = [
    {
      name: 'Bronze',
      icon: Award,
      color: 'from-amber-700 to-amber-600',
      min_points: 0,
      benefits: ['5% cashback', 'Free shipping on orders $50+'],
    },
    {
      name: 'Silver',
      icon: Trophy,
      color: 'from-gray-400 to-gray-300',
      min_points: 1000,
      benefits: ['10% cashback', 'Free shipping on orders $30+', 'Early access to sales'],
    },
    {
      name: 'Gold',
      icon: Star,
      color: 'from-yellow-500 to-yellow-400',
      min_points: 3000,
      benefits: ['15% cashback', 'Free shipping on all orders', 'Priority support', 'Exclusive deals'],
    },
    {
      name: 'Platinum',
      icon: Gift,
      color: 'from-purple-500 to-purple-400',
      min_points: 10000,
      benefits: ['20% cashback', 'Free express shipping', 'Dedicated support', 'Birthday gifts', 'VIP events'],
    },
  ];

  const currentTierIndex = tiers.findIndex(t => t.name === stats?.tier);
  const progress = ((stats?.points || 0) / (tiers[currentTierIndex + 1]?.min_points || 3000)) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Rewards</h1>
        <p className="text-muted-foreground mt-2">Earn points and unlock exclusive rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Points</p>
              <p className="text-3xl font-bold">{stats?.points?.toLocaleString()}</p>
            </div>
            <Star className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-3xl font-bold">{stats?.total_earned?.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Redeemed</p>
              <p className="text-3xl font-bold">{stats?.total_redeemed?.toLocaleString()}</p>
            </div>
            <Gift className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-3xl font-bold">#{stats?.rank}</p>
            </div>
            <Users className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Current Tier */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Current Tier: {stats?.tier}</h2>
            <p className="text-sm text-muted-foreground">
              {stats?.points_to_next_tier} points to next tier
            </p>
          </div>
          {currentTierIndex >= 0 && (
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tiers[currentTierIndex].color} flex items-center justify-center`}>
              {tiers[currentTierIndex].icon({ className: 'w-8 h-8 text-white' })}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* All Tiers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reward Tiers</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = tier.name === stats?.tier;
            const isUnlocked = index <= currentTierIndex;

            return (
              <div
                key={tier.name}
                className={`rounded-lg border p-6 transition-all ${
                  isCurrentTier
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : isUnlocked
                    ? 'border-green-500 bg-green-50'
                    : 'opacity-60'
                }`}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-center mb-2">{tier.name}</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  {tier.min_points.toLocaleString()}+ points
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {isCurrentTier && (
                  <Badge className="w-full mt-4 justify-center">Current Tier</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-4">How to Earn Points</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Make Purchases</h3>
              <p className="text-sm text-muted-foreground">Earn 10 points for every $1 spent</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Refer Friends</h3>
              <p className="text-sm text-muted-foreground">Get 500 points per successful referral</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Write Reviews</h3>
              <p className="text-sm text-muted-foreground">Earn 50 points for each review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Points */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-4">Redeem Your Points</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-2">$5 Off</p>
            <p className="text-sm text-muted-foreground mb-4">500 points</p>
            <Button className="w-full">Redeem</Button>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-2">$10 Off</p>
            <p className="text-sm text-muted-foreground mb-4">1000 points</p>
            <Button className="w-full">Redeem</Button>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-2">$25 Off</p>
            <p className="text-sm text-muted-foreground mb-4">2500 points</p>
            <Button className="w-full">Redeem</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ShoppingBag } from 'lucide-react';
