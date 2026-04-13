"use client";

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserSubscription, createCheckout } from '@/app/action/subscription';
import { Check, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/custom/button';
import { Card } from '@/components/ui/custom/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const FEATURES = [
  "All 10 levels per language",
  "Unlimited voice sessions",
  "Full leaderboard + weekly ranking",
  "All 20+ languages",
  "Priority AI response"
];

const UpgradePage = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getUserSubscription(),
  });

  const { mutate: handleUpgrade, isPending } = useMutation({
    mutationFn: () => createCheckout(),
    onSuccess: (result: any) => {
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Failed to create checkout");
    }
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Checking subscription status...</p>
      </div>
    );
  }

  const isPro = subscription?.isPro;

  return (
    <div className="max-w-[1056px] mx-auto p-4 md:p-8 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4 mt-8">
        <Badge variant="secondary" className="px-4 py-1.5 gap-x-2 text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
          <Zap className="h-3.5 w-3.5 fill-primary" />
          <span className="font-black uppercase tracking-widest text-[10px]">Linga Super</span>
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-800">
          {isPro ? "You are a Super Learner!" : "Learn faster with Super"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          {isPro
            ? "Thank you for supporting Linga! You have full access to all premium features."
            : "Get personalized practice, unlimited voice AI, and climb the leaderboard faster with our most powerful learning tools."}
        </p>
      </div>

      {/* Main Pricing Card */}
      <Card className={cn(
        "relative max-w-4xl mx-auto overflow-hidden border-2 shadow-2xl transition-all duration-500",
        isPro ? "border-primary/20 bg-primary/5" : "border-primary/40 bg-white"
      )}>
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative p-6 md:p-10 flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Your Plan</span>
              <h2 className="text-3xl font-black uppercase decoration-primary decoration-4">
                {isPro ? "Super Learner" : "Linga Pro"}
              </h2>
            </div>

            {!isPro && (
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-baseline gap-x-1">
                  <span className="text-5xl font-black text-neutral-800">$9.99</span>
                  <span className="text-muted-foreground font-bold">/month</span>
                </div>
                <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">Billed monthly</p>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full mb-10">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-x-4 group">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <p className="font-bold text-neutral-600 leading-tight">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="w-full space-y-6">
            {!isPro ? (
              <Button
                onClick={() => handleUpgrade()}
                disabled={isPending}
                size="lg"
                className={cn(
                  "w-full h-16 text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl group",
                  isPending && "brightness-95"
                )}
              >
                {isPending ? (
                  <Spinner />
                ) : (
                  <Zap className="h-6 w-6 mr-2 fill-white animate-pulse" />
                )}
                {isPending ? "Connecting..." : "Upgrade to Super"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full h-16 text-xl font-black uppercase tracking-widest border-2 hover:bg-neutral-50 transition-all shadow-md"
                asChild
              >
                <a href="https://polar.sh/settings" target="_blank" rel="noopener noreferrer">
                  Manage Subscription
                </a>
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {isPro
                ? "Billed through Polar.sh Payment Gateway"
                : "Secure checkout. Cancel anytime. 100% Secure Payments."}
            </p>
          </div>
        </div>
      </Card>

      {/* Trust Badge */}
      <div className="flex flex-col items-center gap-y-3 opacity-60 pb-12">
        <div className="flex items-center gap-x-2">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <p className="text-sm font-black uppercase tracking-[0.15em] text-neutral-500">
            Trusted by 500+ daily learners
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;

