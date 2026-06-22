import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import {
  Calendar,
  Users,
  Building,
  Briefcase,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectEvent }) => {
  const { events, clients, venues, staff, notifications, user } = useApp();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Personalized Greeting based on local computer time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calendar Highlight Calculation (current month)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth(); // 0-indexed
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonthNum, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dateKeysWithEvents = new Set(events.map((e) => e.date));

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const getFullDateString = (dayNum: number) => {
    const mm = String(currentMonthNum + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Events scheduled for selected day
  const eventsOnSelectedDay = events.filter((e) => e.date === selectedCalendarDate);

  // Metrics count
  const plannedEventsCount = events.filter((e) => e.status === 'planning' || e.status === 'confirmed').length;

  return (
    <div id="dashboard-container" className="space-y-8 p-1">
      {/* Greetings Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Planner'}! 👋
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            You have {plannedEventsCount} events planned or upcoming. Everything is on track.
          </p>
        </div>
        <button
          onClick={() => onNavigate('events')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </section>

      {/* Metrics Banner */}
      <div id="metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Events</p>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{events.length}</h3>
          <p className="text-xs text-indigo-500 font-medium mt-2">{plannedEventsCount} upcoming events</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Managed Clients</p>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{clients.length}</h3>
          <p className="text-xs text-gray-400 mt-2">Active CRM contacts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Venues Directory</p>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{venues.length}</h3>
          <p className="text-xs text-gray-400 mt-2">Across top districts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Staff</p>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{staff.length}</h3>
          <p className="text-xs text-green-500 font-medium mt-2">↑ Fully scheduled</p>
        </div>
      </div>

      {/* Main Grid: Mini calendar / Tasks dashboard info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Tasks panel & Notifications alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Work Flow */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <dt className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</dt>
                <p className="text-gray-550 dark:text-slate-400 text-xs mt-0.5">Your schedule for the upcoming days.</p>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group cursor-pointer"
              >
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </button>
            </div>

            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                  <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">No events found. Plan one now or use the AI Assistant below!</p>
                </div>
              ) : (
                events.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-gray-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4 w-3/4">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex flex-col items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-950">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase leading-none">
                          {evt.date.split('-')[1]}
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-white leading-none mt-1">
                          {evt.date.split('-')[2]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{evt.title}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-450 mt-1 truncate">
                          {evt.venueName || 'No Venue'} • {evt.clientName || 'No Client'}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      evt.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : evt.status === 'planning'
                        ? 'bg-yellow-100 text-yellow-650 dark:bg-yellow-950/30 dark:text-yellow-400'
                        : evt.status === 'completed'
                        ? 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {evt.status.charAt(0).toUpperCase() + evt.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick-action shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate('clients')}
              className="p-5 rounded-2xl bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition shadow-sm"
            >
              <Users className="h-6 w-6 text-indigo-100 mb-3" />
              <h4 className="text-sm font-bold">Launch Clients (CRM)</h4>
              <p className="text-xs text-indigo-100 mt-1 leading-normal">Register names, phone contacts and operational files for event hosts.</p>
            </div>
            
            <div
              onClick={() => onNavigate('calendar')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition shadow-sm"
            >
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">View Full Calendar</h4>
              <p className="text-xs text-gray-400 dark:text-slate-450 mt-1 leading-normal">Check monthly agendas and inspect location scheduling blocks.</p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Mini Calendar & Live Daily logs */}
        <div className="space-y-6">
          
          {/* Mini Calendar Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {monthNames[currentMonthNum]} {currentYear}
              </h2>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-400 font-medium">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }
                const dateStr = getFullDateString(day);
                const isSelected = dateStr === selectedCalendarDate;
                const hasEvent = dateKeysWithEvents.has(dateStr);
                const isTodayDate = day === today.getDate() && currentMonthNum === today.getMonth();

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`h-8 flex items-center justify-center rounded-lg text-sm transition-colors relative cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : isTodayDate
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-650'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Days with scheduled events list representation */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Agenda for {selectedCalendarDate}
              </p>
              <div className="mt-2 space-y-2">
                {eventsOnSelectedDay.length === 0 ? (
                  <p className="text-xs text-gray-450 dark:text-slate-500 italic">
                    No events scheduled.
                  </p>
                ) : (
                  eventsOnSelectedDay.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt.id)}
                      className="p-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between cursor-pointer text-left transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{evt.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{evt.venueName || 'TBD venue'}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-405 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Notifications checklist logs */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold mb-4">Pending Assignments</h2>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-start gap-3 group">
                <div className="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-indigo-500 shrink-0 mt-0.5"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-205">Verify layout setup for first event</p>
                  <p className="text-xs text-gray-450">Due today • Sarah J.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-450 dark:text-slate-400 line-through">Send proposal to active client</p>
                  <p className="text-xs text-gray-350">Completed • 2h ago</p>
                </div>
              </div>
              {notifications.slice(0, 1).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 group">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 shrink-0 mt-0.5"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-205">{notif.title}</p>
                    <p className="text-xs text-gray-450">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-2 mt-6 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase tracking-wider">All Tasks</button>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Dashboard;
