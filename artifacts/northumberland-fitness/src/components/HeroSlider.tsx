import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    title: "Feel Better. Move Better.Live Stronger",
    subtitle: "Premium Equipment. Safe Environment. Supportive Community",
  },
  {
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    title: "Progress Starts The Moment You Show Up",
    subtitle: "Your Journey. Your Pace. Your Progress.",
  },
  {
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
    title: "Push Past Limits. Build What Lasts.",
    subtitle: "Every Repetition Builds the Future you Want",
  }
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-screen overflow-hidden group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, index) => (
            <div key={index} className="relative flex-[0_0_100%] min-w-0 h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center px-6 md:px-20 lg:px-32">
                <div className="max-w-3xl">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white uppercase tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-2xl text-white/90 font-medium mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    {slide.subtitle}
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 uppercase font-bold animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
                    onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
                    data-testid={`hero-cta-${index}`}
                  >
                    Join Us Today
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-primary text-white hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
        onClick={scrollPrev}
        data-testid="hero-prev"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-primary text-white hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
        onClick={scrollNext}
        data-testid="hero-next"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 transition-colors ${
              index === selectedIndex ? "bg-primary" : "bg-white/50 hover:bg-white"
            }`}
            onClick={() => scrollTo(index)}
            data-testid={`hero-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
