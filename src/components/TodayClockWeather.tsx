"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { hubConfig } from "@/config/hub";
import {
  formatWeatherTempLine,
  type WeatherSnapshot,
} from "@/lib/weather";
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

const WeatherStack = styled.div`
  position: relative;
  display: inline-flex;
  align-items: stretch;
  /* room for the icon peeking past the chip corner */
  margin-top: 1.7rem;
  margin-left: 2rem;
`;

const WeatherIcon = styled.img`
  position: absolute;
  top: -2.1rem;
  left: -2.3rem;
  width: 7.8rem;
  height: 7.8rem;
  object-fit: contain;
  z-index: 0;
  pointer-events: none;
`;

const ChipFront = styled.div`
  position: relative;
  z-index: 1;
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

  const tempLine = weather ? formatWeatherTempLine(weather) : null;

  return (
    <Trailing>
      <Clock dateTime={now.toISOString()} aria-live="polite">
        {formatClock(now)}
      </Clock>
      <WeatherStack>
        {weather ? (
          <WeatherIcon
            src={weather.iconUrl}
            alt=""
            aria-hidden="true"
          />
        ) : null}
        <ChipFront>
          <WeatherChip
            aria-label={
              weather
                ? `${tempLine}, ${weather.condition}`
                : "Weather"
            }
          >
            <WeatherTemp>
              {tempLine ?? (weatherError ? "—°" : "…°")}
            </WeatherTemp>
            <WeatherMeta>
              {weather
                ? `${weather.condition} · ${weather.locationLabel}`
                : weatherError
                  ? "Weather offline"
                  : "Loading weather"}
            </WeatherMeta>
          </WeatherChip>
        </ChipFront>
      </WeatherStack>
    </Trailing>
  );
}
