import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import { ChevronLeft, ChevronRight, Inbox, Plus, Calendar, ArrowRight } from 'lucide-react';

interface CalendarPageProps {
  onSelectEvent: (eventId: string) => void;
  onNavigate: (page: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onSelectEvent, onNavigate }) => {
  const { events } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-22')); // Default close to the metadata timestamp

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // Weekday index for day 1

  const prevMonthDays = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonthDays = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getFullFmtDateStr = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Build Grid Calendar blocks
  const calendarBlocks: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarBlocks.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarBlocks.push(i);
  }

  const [activeDateStr, setActiveDateStr] = useState<string>('2026-06-22');
  const activeDayEvents = events.filter(e => e.date === activeDateStr);

  return (
    <div id="calendar-page-container" className="space-y-6 text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-505" /> Calendar Dispatcher
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map out events schedules, logistics bookings and inspect day grids.
          </p>
        </div>
        <button
          onClick={() => onNavigate('events')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="h-4.5 w-4.5" /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Day agenda inspect panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm h-fit">
          <h3 className="font-sans font-extrabold text-sm text-slate-800 dark:text-white mb-1">
            Agenda Details
          </h3>
          <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500 mb-4">
            Date: <span className="font-bold text-slate-600 dark:text-slate-300">{activeDateStr}</span>
          </p>

          <div className="space-y-3">
            {activeDayEvents.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-150 dark:border-slate-800 rounded-xl">
                <Inbox className="h-6 w-6 text-slate-350 mx-auto mb-1.5" />
                <p className="font-sans text-xxs text-slate-450 dark:text-slate-500">No events scheduled today.</p>
              </div>
            ) : (
              activeDayEvents.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt.id)}
                  className="p-3 bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl cursor-pointer transition text-left"
                >
                  <span className={`inline-block text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${
                    evt.status === 'confirmed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {evt.status}
                  </span>
                  <p className="font-sans font-bold text-xs text-slate-900 dark:text-white truncate">{evt.title}</p>
                  <p className="font-sans text-xxs text-slate-500 mt-1 truncate">{evt.venueName || 'TBD Venue'}</p>
                  
                  <div className="mt-3 flex items-center justify-between text-xxs text-indigo-600 dark:text-indigo-400 font-semibold pt-1 border-t border-slate-150 dark:border-slate-750">
                    <span>Manage detail</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 3 Columns: Grid calendar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
          {/* Header Month Navigate panel */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-black text-base text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonthDays}
                className="p-2 border border-slate-150 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-755 dark:text-slate-200 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonthDays}
                className="p-2 border border-slate-150 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-755 dark:text-slate-200 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday columns */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-sans font-bold tracking-wider text-slate-400 dark:text-slate-550 border-b border-slate-100 dark:border-slate-850 pb-2 mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          {/* Days square grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarBlocks.map((dayNum, idx) => {
              if (dayNum === null) {
                return (
                  <div key={`cal-empty-${idx}`} className="aspect-square bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-transparent" />
                );
              }

              const formattedDate = getFullFmtDateStr(dayNum);
              const dayEvents = events.filter(e => e.date === formattedDate);
              const isSelected = formattedDate === activeDateStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={`cal-day-${dayNum}`}
                  onClick={() => setActiveDateStr(formattedDate)}
                  className={`aspect-square rounded-xl border p-1 sm:p-2 text-left flex flex-col justify-between transition relative overflow-hidden group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-inner'
                      : 'border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-850/10 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <span className={`text-xs font-black font-sans shrink-0 ${
                    isSelected ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-350'
                  }`}>
                    {dayNum}
                  </span>

                  {/* Render list of events inside date block on desktop display */}
                  {hasEvents && (
                    <div className="hidden sm:block space-y-1 w-full overflow-hidden flex-1 mt-1">
                      {dayEvents.slice(0, 2).map(evt => (
                        <div
                          key={`block-evt-${evt.id}`}
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold font-sans bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 truncate leading-none"
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[7px] font-sans font-black text-slate-400 pl-0.5">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mobile event indicator dots */}
                  {hasEvents && (
                    <div className="sm:hidden absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
export default CalendarPage;
