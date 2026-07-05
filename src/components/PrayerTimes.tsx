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

  return (
    <div className="flex items-center gap-1 sm:gap-3 flex-wrap justify-center">
      {prayers.map((key) => {
        const label = PRAYER_NAMES[key];
        const time = timings[key];
        if (!label || !time) return null;
        return (
          <div key={key} className="text-center px-2 sm:px-3 py-1.5">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
            <p className="text-sm sm:text-base font-mono font-bold text-ink">{time}</p>
          </div>
        );
      })}
    </div>
  );
}

function PrayerTimesSkeleton() {
  return (
    <div className="flex items-center gap-3 justify-center animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="text-center px-3 py-1.5">
          <div className="h-3 w-10 bg-gray-200 rounded mb-1 mx-auto" />
          <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

export default function PrayerTimes({ city }: { city?: string }) {
  return (
    <div className="bg-surface/80 border border-outline rounded-xl px-4 py-2 shadow-xs">
      <div className="flex items-center gap-2 justify-center mb-1">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Jadwal Sholat</p>
      </div>
      <Suspense fallback={<PrayerTimesSkeleton />}>
        <PrayerTimesInner city={city} />
      </Suspense>
    </div>
  );
}
