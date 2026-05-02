import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export default function Countdown({ endDate }: { endDate: string }) {
  const { t, lang } = useI18n();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const labels: Record<string, any> = {
    fr: { d: "Jours", h: "Heures", m: "Min", s: "Sec" },
    ar: { d: "أيام", h: "ساعات", m: "دقائق", s: "ثواني" },
    en: { d: "Days", h: "Hours", m: "Min", s: "Sec" }
  };
  const l = labels[lang] || labels.fr;

  // Si le compte à rebours est terminé
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mt-6 mb-4" dir={lang === 'ar' ? 'ltr' : 'ltr'}>
      <TimeBox value={timeLeft.days} label={l.d} />
      <span className="text-xl font-bold text-gold/60">:</span>
      <TimeBox value={timeLeft.hours} label={l.h} />
      <span className="text-xl font-bold text-gold/60">:</span>
      <TimeBox value={timeLeft.minutes} label={l.m} />
      <span className="text-xl font-bold text-gold/60">:</span>
      <TimeBox value={timeLeft.seconds} label={l.s} />
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-background/20 backdrop-blur-md rounded-lg p-2 min-w-[3.5rem] md:min-w-[4rem] border border-gold/20 shadow-xl">
      <span className="text-xl md:text-2xl font-serif font-bold text-gold">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-primary-foreground/70 mt-1">
        {label}
      </span>
    </div>
  );
}
