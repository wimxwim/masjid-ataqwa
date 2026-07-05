import { Clock } from "lucide-react";
import { Suspense } from "react";

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

async function PrayerTimesInner({ city = "Jakarta" }: { city?: string }) {
  const res = await fetch(
    `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Indonesia&method=11`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return null;

  const data = await res.json();
  const timings = data.data?.timings as Record<string, string> | undefined;
  if (!timings) return null;

  const prayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  // Find closest/next prayer by current time (simple string comparison HH:MM)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let nextPrayer: string | null = null;
  for (const key of prayers) {
    const [h, m] = timings[key]!.split(":").map(Number);
    if (h! * 60 + m! > currentMinutes) {
      nextPrayer = key;
      break;
    }
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
      {prayers.map((key) => {
        const label = PRAYER_NAMES[key];
        const time = timings[key];
        if (!label || !time) return null;

        const isNext = key === nextPrayer;

        return (
          <div
            key={key}
            className={`text-center px-2 sm:px-3 py-1.5 rounded-xl min-w-[3.5rem] transition-all ${
              isNext
                ? "bg-primary text-white shadow-glow"
                : "hover:bg-surface/60"
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isNext ? "text-white/90" : "text-muted"
              }`}
            >
              {label}
            </p>
            <p
              className={`text-sm sm:text-base font-mono font-bold ${
                isNext ? "text-white" : "text-ink"
              }`}
            >
              {time}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PrayerTimesSkeleton() {
  return (
    <div className="flex items-center gap-2 justify-center animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="text-center px-3 py-1.5 rounded-xl">
          <div className="h-3 w-10 bg-surface rounded mb-1 mx-auto" />
          <div className="h-4 w-12 bg-surface rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

export default function PrayerTimes({ city }: { city?: string }) {
  return (
    <div className="reveal glass rounded-2xl px-4 py-3 shadow-2">
      <div className="flex items-center gap-2 justify-center mb-2">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
          Jadwal Sholat
        </p>
      </div>
      <Suspense fallback={<PrayerTimesSkeleton />}>
        <PrayerTimesInner city={city} />
      </Suspense>
    </div>
  );
}
