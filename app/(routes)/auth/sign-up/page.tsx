"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp, verifyEmail as verifyEmailAction } from '@/app/action/auth';
import { Button } from '@/components/ui/custom/button';
import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from '@/components/ui/custom/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/components/auth-provider';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const isVerifyMode = searchParams.get('verify') === 'true';
  const urlEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await signUp(name, email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      toast.success('Sign up successful! Please check your email for the verification code.');
      router.push(`?verify=true&email=${encodeURIComponent(email)}`);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await verifyEmailAction(email, otp, 'verify');
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      toast.success('Email verified successfully! Welcome.');
      refreshUser();
      router.push('/courses');
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    const { success, error } = await verifyEmailAction(email, '', 'resend');
    setResending(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      toast.success('Verification code resent to your email.');
    }
  };

  if (isVerifyMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/20">
        <div className="mb-8">
          <Logo />
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Verify Email</CardTitle>
            <CardDescription>
              We sent a verification code to <strong>{email}</strong>. Enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifySubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Verify & Continue
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center text-muted-foreground w-full flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={resending || loading}
              >
                {resending ? <Spinner className="mr-2 h-3 w-3" /> : null}
                Resend Code
              </Button>
              <div>
                Wrong email?{' '}
                <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
                  Sign up again
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/20">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your details below to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUpSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
