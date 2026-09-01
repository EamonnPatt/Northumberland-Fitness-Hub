import React, { useState, useEffect } from "react";
import { Menu, X, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import logoSrc from "@assets/northumberland_logo.png";


const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "About Us", id: "about" },
  { label: "Mission & Vision", id: "mission" },
  { label: "Programs", id: "programs" },
  { label: "Club Hours", id: "hours" },
  { label: "Pricing", id: "pricing" },
  { label: "Contact", id: "contact" },
  { label: "Register", id: "register" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -79% 0px" }
    );

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location !== "/") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white py-2 shadow-lg" : "bg-white/95 py-2 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div
          className="cursor-pointer shrink-0"
          onClick={() => handleNavClick("home")}
          data-testid="nav-logo"
        >
          <img
            src={logoSrc}
            alt="Northumberland Fitness logo"
            style={{ width: '120px', height: 'auto' }}
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={cn(
                "text-sm font-semibold uppercase tracking-wider transition-colors duration-200",
                activeSection === link.id
                  ? "text-primary"
                  : "text-secondary hover:text-primary"
              )}
              data-testid={`nav-link-${link.id}`}
            >
              {link.label}
            </button>
          ))}
          <Link
            href={user ? "/account" : "/login"}
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors duration-200"
            data-testid="nav-link-account"
          >
            <UserRound size={18} />
            {user ? "My Account" : "Login"}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-secondary hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="nav-mobile-toggle"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-border">
          <div className="flex flex-col py-4 px-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={cn(
                  "text-left text-base font-semibold uppercase tracking-wider transition-colors py-2 border-b border-border last:border-0",
                  activeSection === link.id
                    ? "text-primary"
                    : "text-secondary hover:text-primary"
                )}
                data-testid={`nav-mobile-link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-left text-base font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors py-2"
              data-testid="nav-mobile-link-account"
            >
              <UserRound size={18} />
              {user ? "My Account" : "Login"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
