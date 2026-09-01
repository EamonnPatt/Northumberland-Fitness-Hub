import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import logoSrc from "@assets/northumberland_logo.png";

const SEX_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const AGE_RANGE_OPTIONS = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_64", label: "55–64" },
  { value: "65_plus", label: "65+" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  membership: "basic",
  sex: "",
  ageRange: "",
};

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({
        ...form,
        ageRange: form.ageRange || undefined,
      });
      navigate("/account");
    } catch (err) {
      toast({
        title: "Couldn't create account",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logoSrc} alt="Northumberland Fitness logo" style={{ width: "140px", height: "auto" }} />
          </div>
          <h1 className="text-3xl font-serif text-secondary text-center mb-8">Create Your Account</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                required
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className="h-12 rounded-none"
                data-testid="register-firstname"
              />
              <Input
                placeholder="Last Name"
                required
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className="h-12 rounded-none"
                data-testid="register-lastname"
              />
            </div>
            <Input
              placeholder="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="h-12 rounded-none"
              data-testid="register-email"
            />
            <Input
              placeholder="Password (min. 8 characters)"
              type="password"
              minLength={8}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="h-12 rounded-none"
              data-testid="register-password"
            />
            <Input
              placeholder="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="h-12 rounded-none"
              data-testid="register-phone"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Select required value={form.sex} onValueChange={(v) => set("sex", v)}>
                <SelectTrigger className="h-12 rounded-none" data-testid="register-sex">
                  <SelectValue placeholder="Sex" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={form.ageRange} onValueChange={(v) => set("ageRange", v)}>
                <SelectTrigger className="h-12 rounded-none" data-testid="register-agerange">
                  <SelectValue placeholder="Age Range (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RANGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={form.membership} onValueChange={(v) => set("membership", v)}>
              <SelectTrigger className="h-12 rounded-none" data-testid="register-membership">
                <SelectValue placeholder="Select Membership Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic - Access to gym floor</SelectItem>
                <SelectItem value="premium">Premium - Gym floor & classes</SelectItem>
                <SelectItem value="elite">Elite - All access + personal training</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-none h-12 uppercase font-bold tracking-wider"
              data-testid="register-submit"
            >
              {submitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already a member?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm mt-2">
            <Link href="/" className="text-muted-foreground hover:underline">
              Back to site
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
