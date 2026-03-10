import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
// cspell:ignore owlytics

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const logoRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      const logoRect = logoRef.current?.getBoundingClientRect();
      if (logoRect) {
        sessionStorage.setItem(
          'logoTransitionStart',
          JSON.stringify({
            left: logoRect.left,
            top: logoRect.top,
            width: logoRect.width,
            height: logoRect.height,
          })
        );
      }
      navigate('/dashboard/owlytics'); // Redirect to first camera by default
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden px-4">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/login_background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-950/45" />

      <div className="relative z-10 w-full max-w-[340px] rounded-2xl border border-slate-500/35 bg-slate-900/55 p-5 backdrop-blur-[2px] shadow-[0_20px_45px_rgba(2,6,23,0.55)]">
        <div className="mb-5 flex flex-col items-center">
          <div ref={logoRef} className="mb-3 w-full max-w-[165px]">
            <img src="/startup-logo.png" alt="Startup Park Logo" className="w-full h-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center text-red-400 gap-3">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200/90" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-blue-300/25 bg-slate-950/70 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200/90" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-blue-300/25 bg-slate-950/70 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 mt-4 shadow-lg shadow-blue-600/20"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
