import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Logo fade in and scale
    const timer1 = setTimeout(() => setStage(1), 150);
    // Stage 2: Logo fade out
    const timer2 = setTimeout(() => setStage(2), 2200);
    // Finish: Remove splash
    const timer3 = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <div className={cn(
      "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0d1425] to-[#050914] transition-opacity duration-500",
      stage === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
    )}>
      {/* Animated Luxury Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] h-[40%] w-[40%] rounded-full bg-gold/5 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[40%] rounded-full bg-gold/5 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className={cn(
        "relative flex flex-col items-center transition-all duration-1000 transform",
        stage === 0 ? "opacity-0 scale-95 translate-y-4" : 
        stage === 1 ? "opacity-100 scale-100 translate-y-0" : 
        "opacity-0 scale-105 -translate-y-4"
      )}>
        <div className="relative mb-10">
          <div className="absolute inset-0 animate-ping rounded-full bg-gold/10 opacity-30" style={{ animationDuration: '3s' }} />
          <img 
            src="/logo.png" 
            alt="Univers Maison" 
            className="relative h-28 w-auto drop-shadow-luxury brightness-110"
          />
        </div>
        
        <h1 className="font-serif text-5xl font-medium tracking-tight text-white mb-2 flex gap-3">
          <span>Univers</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold bg-[length:200%_auto] animate-shimmer-sweep">
            Maison
          </span>
        </h1>
        
        <div className="flex items-center gap-4">
          <div className={cn("h-px bg-gold/30 transition-all duration-1000 delay-300", stage >= 1 ? "w-16" : "w-0")} />
          <span className={cn(
            "text-[10px] uppercase tracking-[0.5em] text-gold/60 font-medium transition-all duration-1000 delay-500",
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            Art de la Table
          </span>
          <div className={cn("h-px bg-gold/30 transition-all duration-1000 delay-300", stage >= 1 ? "w-16" : "w-0")} />
        </div>
      </div>

      {/* Progress line */}
      <div className="absolute bottom-24 left-1/2 w-48 -translate-x-1/2 overflow-hidden rounded-full h-[1px] bg-white/5">
        <div className={cn(
          "h-full bg-gradient-to-r from-transparent via-gold to-transparent shadow-gold-sm transition-all duration-1000 ease-in-out",
          stage >= 1 ? "w-full translate-x-0" : "w-0 -translate-x-full"
        )} />
      </div>
    </div>
  );
}
