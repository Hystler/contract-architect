"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type CalendarInputProps = {
  value?: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  placeholder?: string;
};

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarInput({
  value,
  onChange,
  isInvalid,
  placeholder = "Выберите дату"
}: CalendarInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(parseDate(value) || new Date())
  );

  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) {
      setVisibleMonth(getMonthStart(parsed));
    }
  }, [value]);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedDate = parseDate(value);
  const formattedValue = selectedDate
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(selectedDate)
    : "";

  function moveMonth(delta: number) {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1)
    );
  }

  function selectDate(date: Date) {
    onChange(toInputDate(date));
    setIsOpen(false);
  }

  function selectToday() {
    selectDate(new Date());
  }

  return (
    <div className="relative">
      <button
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm text-graphite-950 outline-none transition hover:border-gold-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15",
          isInvalid ? "border-red-500/70" : "border-legal-border"
        )}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={formattedValue ? "" : "text-muted-500/70"}>
          {formattedValue || placeholder}
        </span>
        <span aria-hidden="true" className="text-muted-500">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-12 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-legal-border bg-paper-50 p-3 text-graphite-950 shadow-paper">
          <div className="flex items-center justify-between gap-3">
            <button
              aria-label="Предыдущий месяц"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-legal-border bg-white text-sm font-semibold transition hover:border-gold-500"
              onClick={() => moveMonth(-1)}
              type="button"
            >
              {"<"}
            </button>
            <p className="text-sm font-semibold">
              {new Intl.DateTimeFormat("ru-RU", {
                month: "long",
                year: "numeric"
              }).format(visibleMonth)}
            </p>
            <button
              aria-label="Следующий месяц"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-legal-border bg-white text-sm font-semibold transition hover:border-gold-500"
              onClick={() => moveMonth(1)}
              type="button"
            >
              {">"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-500">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isCurrentMonth =
                day.getMonth() === visibleMonth.getMonth();
              const isSelected =
                selectedDate && toInputDate(day) === toInputDate(selectedDate);
              const isToday = toInputDate(day) === toInputDate(new Date());

              return (
                <button
                  className={cn(
                    "flex h-9 cursor-pointer items-center justify-center rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-gold-500/30",
                    isCurrentMonth ? "text-graphite-950" : "text-muted-500/45",
                    isSelected
                      ? "bg-gold-500 font-semibold text-ink-950"
                      : "hover:bg-surface-100",
                    isToday && !isSelected ? "border border-gold-500/50" : ""
                  )}
                  key={toInputDate(day)}
                  onClick={() => selectDate(day)}
                  type="button"
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-legal-border pt-3">
            <button
              className="min-h-9 cursor-pointer rounded-md border border-legal-border bg-white px-3 text-sm font-semibold transition hover:border-gold-500"
              onClick={selectToday}
              type="button"
            >
              Сегодня
            </button>
            <button
              className="min-h-9 cursor-pointer rounded-md border border-transparent px-3 text-sm font-semibold text-muted-500 transition hover:bg-surface-100"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildCalendarDays(month: Date) {
  const firstDay = getMonthStart(month);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
