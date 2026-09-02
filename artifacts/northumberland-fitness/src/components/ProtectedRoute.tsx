import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({
  children,
  requireAdmin = false,
  deniedRedirect = "/account",
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  deniedRedirect?: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (requireAdmin && user.role !== "admin") return <Redirect to={deniedRedirect} />;

  return <>{children}</>;
}
