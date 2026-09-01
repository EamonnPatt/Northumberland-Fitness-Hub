import React from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MEMBERSHIP_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  elite: "Elite",
};

export default function Account() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />
      <div className="pt-32 pb-24 container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-secondary">
            Welcome, {user.firstName}
          </h1>
          <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
            Sign Out
          </Button>
        </div>

        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Membership Plan</span>
              <Badge className="uppercase">{MEMBERSHIP_LABELS[user.membership] ?? user.membership}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {user.role === "admin" && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-secondary mb-1">Admin Panel</h2>
                <p className="text-muted-foreground text-sm">Edit site content and manage members.</p>
              </div>
              <Button onClick={() => navigate("/admin")} data-testid="go-to-admin">
                Open Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
