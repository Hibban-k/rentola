"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarPickerProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    minDate?: string;
    label: string;
    placeholder?: string;
}

export default function CalendarPicker({
    selectedDate,
    onDateSelect,
    minDate = new Date().toISOString().split("T")[0],
    label,
    placeholder = "Select date"
}: CalendarPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(selectedDate || new Date()));
    const calendarRef = React.useRef<HTMLDivElement>(null);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isDateDisabled = (date: Date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        return d < min;
    };

    const isDateSelected = (date: Date) => {
        if (!selectedDate) return false;
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const s = new Date(selectedDate);
        s.setHours(0, 0, 0, 0);
        return d.getTime() === s.getTime();
    };

    const handleDateClick = (day: number) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (isDateDisabled(date)) return;

        onDateSelect(date.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const days = [];
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    // Padding for first day of month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        const disabled = isDateDisabled(date);
        const selected = isDateSelected(date);

        days.push(
            <button
                key={d}
                type="button"
                onClick={() => handleDateClick(d)}
                disabled={disabled}
                className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all
                    ${selected ? "bg-primary text-primary-foreground font-bold shadow-md" : ""}
                    ${!selected && !disabled ? "hover:bg-primary/10 hover:text-primary" : ""}
                    ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                `}
            >
                {d}
            </button>
        );
    }

    return (
        <div className="relative group" ref={calendarRef}>
            <label className="block text-sm font-medium mb-1.5 group-focus-within:text-primary transition-colors">
                <CalendarIcon className="w-4 h-4 inline mr-1.5" />
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-left flex items-center justify-between hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
                <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                    {selectedDate ? new Date(selectedDate).toLocaleDateString() : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h4 className="font-semibold text-sm">
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </h4>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                            <div key={day} className="text-xs font-medium text-muted-foreground h-6 flex items-center justify-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>
            )}
        </div>
    );
}

function ChevronDown({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
