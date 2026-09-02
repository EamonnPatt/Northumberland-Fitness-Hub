import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { IS_ADMIN_SITE } from "@/lib/site-mode";
import logoSrc from "@assets/northumberland_logo.png";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(IS_ADMIN_SITE ? "/" : "/account");
    } catch (err) {
      toast({
        title: "Couldn't sign in",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-muted flex items-center justify-center px-4 pb-16",
        IS_ADMIN_SITE ? "pt-16" : "pt-32",
      )}
    >
      {!IS_ADMIN_SITE && <Navbar />}
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logoSrc} alt="Northumberland Fitness logo" style={{ width: "140px", height: "auto" }} />
          </div>
          <h1 className="text-3xl font-serif text-secondary text-center mb-8">
            {IS_ADMIN_SITE ? "Admin Login" : "Member Login"}
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-none"
              data-testid="login-email"
            />
            <Input
              placeholder="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-none"
              data-testid="login-password"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-none h-12 uppercase font-bold tracking-wider"
              data-testid="login-submit"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
          {!IS_ADMIN_SITE && (
            <>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Join now
                </Link>
              </p>
              <p className="text-center text-sm mt-2">
                <Link href="/" className="text-muted-foreground hover:underline">
                  Back to site
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
