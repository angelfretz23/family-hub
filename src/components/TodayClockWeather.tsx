"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { hubConfig } from "@/config/hub";
import type { WeatherSnapshot } from "@/lib/weather";
import {
  WeatherChip,
  WeatherMeta,
  WeatherTemp,
} from "@/components/layout";

const Trailing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
`;

const Clock = styled.time`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.6rem, 5vw, 3.75rem);
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.ink};
  font-variant-numeric: tabular-nums;
`;

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: hubConfig.timeZone,
  }).format(date);
}

export function TodayClockWeather() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) throw new Error("bad status");
        const data = (await response.json()) as WeatherSnapshot;
        if (!cancelled) {
          setWeather(data);
          setWeatherError(false);
        }
      } catch {
        if (!cancelled) setWeatherError(true);
      }
    }

    void load();
    const id = window.setInterval(load, 10 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <Trailing>
      <Clock dateTime={now.toISOString()} aria-live="polite">
        {formatClock(now)}
      </Clock>
      <WeatherChip
        aria-label={
          weather
            ? `${weather.tempF} degrees, ${weather.condition}`
            : "Weather"
        }
      >
        <WeatherTemp>
          {weather ? `${weather.tempF}°` : weatherError ? "—°" : "…°"}
        </WeatherTemp>
        <WeatherMeta>
          {weather
            ? `${weather.condition} · ${weather.locationLabel}`
            : weatherError
              ? "Weather offline"
              : "Loading weather"}
        </WeatherMeta>
      </WeatherChip>
    </Trailing>
  );
}
