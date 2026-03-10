import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import {
  fetchDashboardFilters,
  fetchDashboardOverview,
  fetchPersonActivityTimeline,
} from '../api/cameraService';
import CameraCard from '../components/CameraCard';
import { ShieldAlert, Download, Grid2X2, LogOut } from 'lucide-react';

export default function CameraDashboard({ initialCamera = 'workspace' }) {
  const { cameraId } = useParams();
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ cameras: [], dates: [] });
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState({ durationSeconds: 300, timeline: [] });

  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState(null);

  const [selectedCamera, setSelectedCamera] = useState(cameraId || initialCamera);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonId, setSelectedPersonId] = useState('');

  const timerRef = useRef(null);

  const cameraOptions = useMemo(() => filters.cameras || [], [filters]);
  const dateOptions = useMemo(() => filters.dates || [], [filters]);
  const personRows = useMemo(() => overview?.persons || [], [overview]);

  const selectedPersonName = useMemo(
    () => personRows.find((person) => person.id === selectedPersonId)?.name || '',
    [personRows, selectedPersonId]
  );

  const selectedCameraName =
    cameraOptions.find((camera) => camera.id === selectedCamera)?.name ||
    (selectedCamera ? selectedCamera.charAt(0).toUpperCase() + selectedCamera.slice(1) : 'Unknown Camera');
  const title = overview?.cameraName || selectedCameraName;
  const currentCount = overview?.personsDetected ?? 0;

  const loadFilters = async () => {
    const response = await fetchDashboardFilters();
    setFilters({
      cameras: response?.cameras || [],
      dates: response?.dates || [],
    });
  };

  const loadOverview = useCallback(async (isPoll = false) => {
    if (!selectedCamera || !selectedDate) return;
    if (!isPoll) setLoading(true);

    try {
      const response = await fetchDashboardOverview({ camera: selectedCamera, date: selectedDate });
      setOverview(response);
      setTimestamp(response?.timestamp || Date.now());
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load API data.');
    } finally {
      if (!isPoll) setLoading(false);
    }
  }, [selectedCamera, selectedDate]);

  const loadTimeline = useCallback(async () => {
    if (!selectedPersonId || !selectedPersonName) return;

    setTimelineLoading(true);
    try {
      const response = await fetchPersonActivityTimeline({
        camera: selectedCamera,
        date: selectedDate,
        personId: selectedPersonId,
        personName: selectedPersonName,
      });
      setTimeline({
        durationSeconds: response?.durationSeconds || 300,
        timeline: response?.timeline || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  }, [selectedCamera, selectedDate, selectedPersonId, selectedPersonName]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    if (cameraOptions.length && !cameraOptions.some((camera) => camera.id === selectedCamera)) {
      setSelectedCamera(cameraOptions[0].id);
    }
  }, [cameraOptions, selectedCamera]);

  useEffect(() => {
    if (cameraId && cameraId !== selectedCamera) {
      setSelectedCamera(cameraId);
    }
  }, [cameraId, selectedCamera]);

  useEffect(() => {
    if (!selectedDate && dateOptions.length) {
      setSelectedDate(dateOptions[0].value);
    }
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (personRows.length && !personRows.some((person) => person.id === selectedPersonId)) {
      setSelectedPersonId(personRows[0].id);
    }
    if (!personRows.length) {
      setSelectedPersonId('');
    }
  }, [personRows, selectedPersonId]);

  useEffect(() => {
    if (!selectedCamera || !selectedDate) return;

    loadOverview();

    timerRef.current = setInterval(() => {
      loadOverview(true);
    }, 5000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [selectedCamera, selectedDate, loadOverview]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleDownload = () => {
    if (!overview) return;

    const csvContent = `Camera,Date,Persons Detected,Timestamp\n${title},${selectedDate},${currentCount},${timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCamera}-analytics-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full min-h-0 flex flex-col relative w-full fade-in-up anim-enter">
      <nav className="mb-2 rounded-3xl border border-slate-700/60 bg-[#0b1a44]/35 px-4 py-2.5 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl anim-enter" style={{ animationDelay: '40ms' }}>
        <div className="relative flex min-h-[64px] items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="rounded-xl bg-slate-800/70 p-2.5 text-blue-400 ring-1 ring-slate-600/70 transition-colors hover:bg-slate-700/80 anim-glow"
            >
              <Grid2X2 className="h-5 w-5 stroke-[2.3]" />
            </button>
            <img src="/startup-logo.png" alt="Startup Park Logo" className="w-32 h-auto object-contain" />
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center md:block">
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-slate-300/85">Monitoring real-time video analytics feeds</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-300 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 duration-200"
              disabled={loading || !overview}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/20 hover:-translate-y-0.5 duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <div className="mt-2 text-center md:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-slate-300/85">Monitoring real-time video analytics feeds</p>
        </div>
      </nav>

      {error && !overview ? (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-6 rounded-2xl flex flex-col items-center justify-center h-64 gap-3 z-10">
          <ShieldAlert className="w-12 h-12 mb-2 opacity-80" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-red-400/80 text-center max-w-sm">
            {error} We are currently unable to reach the FastAPI backend service.
            Retrying connection in the background...
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
            <div className="xl:col-span-8 anim-enter" style={{ animationDelay: '100ms' }}>
              <CameraCard
                key={`${selectedCamera}-${selectedDate}-${selectedPersonId || 'none'}`}
                title={title}
                count={currentCount}
                videoStartTime={overview?.videoStartTime}
                videoEndTime={overview?.videoEndTime}
                loading={(loading && !overview) || timelineLoading}
                error={!!error}
                selectedPersonName={selectedPersonName}
                cameraOptions={cameraOptions}
                selectedCamera={selectedCamera}
                onCameraChange={setSelectedCamera}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                activityTimeline={timeline.timeline}
                durationSeconds={timeline.durationSeconds}
              />
            </div>

            <section className="xl:col-span-4 h-full rounded-3xl border border-slate-700/60 bg-slate-800/65 p-3 md:p-4 shadow-[0_16px_40px_rgba(2,6,23,0.4)] backdrop-blur-xl anim-enter overflow-hidden flex flex-col" style={{ animationDelay: '160ms' }}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Person Data</h2>
                <span className="text-xs text-slate-400">Selected: <span className="font-semibold text-slate-200">{selectedPersonName || '--'}</span></span>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/35">
                {personRows.length ? (
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700/70 text-left text-slate-400">
                        <th className="px-3 py-2 font-medium">Person Name</th>
                        <th className="px-3 py-2 font-medium">Start Time</th>
                        <th className="px-3 py-2 font-medium">End Time</th>
                        <th className="px-3 py-2 font-medium">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personRows.map((person) => {
                        const isActive = person.id === selectedPersonId;
                        return (
                          <tr key={person.id} className="border-b border-slate-700/40 text-slate-200">
                            <td className="px-3 py-3">{person.name}</td>
                            <td className="px-3 py-3">{person.startTime}</td>
                            <td className="px-3 py-3">{person.endTime}</td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setSelectedPersonId(person.id)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                                    : 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30 hover:bg-blue-500/25'
                                }`}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-slate-400">
                    No person data available for selected camera/date.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
