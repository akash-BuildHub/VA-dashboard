import React, { useMemo, useRef, useState } from 'react';
import { Camera, Users, Smartphone, Bed, UserX, BriefcaseBusiness, UserRound } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function CameraCard({
  title,
  count,
  videoStartTime,
  videoEndTime,
  loading,
  error,
  selectedPersonName,
  cameraOptions = [],
  selectedCamera = '',
  onCameraChange = () => {},
  selectedDate = '',
  onDateChange = () => {},
  activityTimeline = [],
  durationSeconds = 300,
}) {
  const dialRef = useRef(null);
  const [selectedSecond, setSelectedSecond] = useState(0);

  const parsedVideoStartMs = videoStartTime ? Date.parse(videoStartTime) : NaN;
  const parsedVideoEndMs = videoEndTime ? Date.parse(videoEndTime) : NaN;
  const backendWindowDurationSeconds =
    Number.isFinite(parsedVideoStartMs) && Number.isFinite(parsedVideoEndMs)
      ? Math.max(1, Math.round((parsedVideoEndMs - parsedVideoStartMs) / 1000))
      : null;

  const normalizedDuration = Math.max(1, durationSeconds || backendWindowDurationSeconds || 300);
  const safeTimeline = useMemo(() => {
    if (activityTimeline.length) return activityTimeline;
    return [{ start: 0, end: normalizedDuration, label: 'Working', key: 'working' }];
  }, [activityTimeline, normalizedDuration]);

  const activeActivity =
    safeTimeline.find(({ start, end }) => selectedSecond >= start && selectedSecond < end) ||
    safeTimeline[safeTimeline.length - 1];

  const activityCards = [
    { key: 'mobile', label: 'Employee using mobile phone', icon: Smartphone },
    { key: 'sleeping', label: 'Sleeping', icon: Bed },
    { key: 'absent', label: 'Not in workplace', icon: UserX },
    { key: 'working', label: 'Working', icon: BriefcaseBusiness },
  ];

  const angle = (selectedSecond / normalizedDuration) * 360;
  const minute = Math.floor(selectedSecond / 60);
  const second = selectedSecond % 60;
  const totalMinute = Math.floor(normalizedDuration / 60);
  const totalSecond = normalizedDuration % 60;
  const formattedTime = `${minute}:${String(second).padStart(2, '0')}`;
  const formattedDuration = `${totalMinute}:${String(totalSecond).padStart(2, '0')}`;

  const effectiveVideoStartMs = Number.isFinite(parsedVideoStartMs)
    ? parsedVideoStartMs
    : Number.isFinite(parsedVideoEndMs)
      ? parsedVideoEndMs - normalizedDuration * 1000
      : null;

  const selectedVideoDate = Number.isFinite(effectiveVideoStartMs)
    ? new Date(effectiveVideoStartMs + selectedSecond * 1000)
    : null;
  const formattedSelectedVideoTime = selectedVideoDate
    ? selectedVideoDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  const updateDial = (clientX, clientY) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let nextAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (nextAngle < 0) nextAngle += 360;
    const nextSecond = Math.round((nextAngle / 360) * normalizedDuration);
    setSelectedSecond(Math.min(normalizedDuration, Math.max(0, nextSecond)));
  };

  const handleMouseDown = (event) => {
    updateDial(event.clientX, event.clientY);
    const handleMouseMove = (moveEvent) => updateDial(moveEvent.clientX, moveEvent.clientY);
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    updateDial(touch.clientX, touch.clientY);
    const handleTouchMove = (moveEvent) => {
      const movingTouch = moveEvent.touches[0];
      if (!movingTouch) return;
      updateDial(movingTouch.clientX, movingTouch.clientY);
    };
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-800/65 p-4 shadow-[0_20px_55px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-5 anim-enter" style={{ animationDelay: '120ms' }}>
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl transition-colors duration-500 group-hover:bg-blue-500/15 anim-float" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />

      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex items-center gap-4">
          <div className="relative rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/5 p-3 shadow-inner">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/40 bg-slate-900/70 anim-glow">
              <UserRound className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            <p className="mt-0.5 text-xs text-blue-300">Viewing Person: {selectedPersonName || '--'}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/45 p-1.5 backdrop-blur">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400">Camera Name</span>
              <select
                value={selectedCamera}
                onChange={(event) => onCameraChange(event.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-400"
              >
                {cameraOptions.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400">Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-400"
              />
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3 z-10 relative">
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 lg:col-span-1">
          <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
          <Users className="w-6 h-6 text-blue-400 mb-4 opacity-80" />
          <span className="text-slate-400 text-sm font-medium mb-1">Persons Detected</span>

          {loading && !count ? (
            <div className="h-14 w-20 bg-slate-700 animate-pulse rounded-lg mt-2"></div>
          ) : error ? (
            <span className="text-3xl font-bold text-red-400 mt-2">--</span>
          ) : (
            <span className="text-4xl font-black text-white tracking-tighter mt-1">{count}</span>
          )}

          <div className="mt-3 w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Video Timeline</span>

            <div
              ref={dialRef}
              role="slider"
              aria-label="Video timeline"
              aria-valuemin={0}
              aria-valuemax={normalizedDuration}
              aria-valuenow={selectedSecond}
              tabIndex={0}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                  setSelectedSecond((prev) => Math.min(normalizedDuration, prev + 5));
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                  setSelectedSecond((prev) => Math.max(0, prev - 5));
                }
              }}
              className="mt-2 relative h-28 w-28 rounded-full cursor-grab active:cursor-grabbing select-none touch-none"
            >
              <div className="absolute inset-0 rounded-full border-8 border-slate-700/90 bg-slate-800 shadow-inner" />
              <div
                className="absolute inset-0 rounded-full border-8 border-blue-500/80 transition-all duration-200"
                style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%, 50% 50%)` }}
              />
              <div className="absolute inset-4 rounded-full border border-slate-600/80 bg-slate-900/90 flex items-center justify-center text-sm font-bold text-slate-100">{formattedTime}</div>
              <div className="absolute inset-0 transition-transform duration-150" style={{ transform: `rotate(${angle}deg)` }}>
                <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-[88%] rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.7)]" />
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-slate-400">
                Selected Position: <span className="text-slate-200 font-semibold">{formattedTime}</span> / {formattedDuration}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Video Time: <span className="text-slate-200 font-semibold">{formattedSelectedVideoTime}</span>
              </p>
              <p className="text-xs font-semibold text-blue-300 mt-1 transition-all duration-300">{activeActivity?.label || 'No activity'}</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Activity Categories</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
            {activityCards.map((activity) => {
              const isActive = activeActivity?.key === activity.key;
              return (
                <div
                  key={activity.key}
                  className={twMerge(
                    clsx(
                      'rounded-xl border p-3 transition-all duration-500 transform hover:-translate-y-0.5',
                      isActive
                        ? 'border-blue-400/70 bg-blue-500/15 shadow-[0_0_24px_rgba(59,130,246,0.25)] scale-[1.02]'
                        : 'border-slate-700/70 bg-slate-800/70 opacity-75'
                    )
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    {React.createElement(activity.icon, {
                      className: twMerge(
                        clsx('w-5 h-5 transition-colors duration-300', isActive ? 'text-blue-300' : 'text-slate-400')
                      ),
                    })}
                    <span
                      className={twMerge(
                        clsx(
                          'text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border transition-all duration-300',
                          isActive ? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-600 text-slate-400'
                        )
                      )}
                    >
                      {isActive ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <p className={twMerge(clsx('mt-3 text-sm font-medium leading-snug transition-colors duration-300', isActive ? 'text-slate-100' : 'text-slate-400'))}>{activity.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 mt-auto border-t border-slate-700/60 pt-2 text-xs">
          <span className="text-red-400 font-medium">Connection Lost. Retrying...</span>
        </div>
      )}
    </div>
  );
}
