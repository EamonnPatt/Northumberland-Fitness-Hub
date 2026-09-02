import React from "react";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import logoSrc from "@assets/northumberland_logo.png";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logoSrc} alt="Northumberland Fitness logo" style={{ width: "100px", height: "auto" }} />
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-muted-foreground hidden sm:inline">{user.firstName}</span>}
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="admin-logout">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
