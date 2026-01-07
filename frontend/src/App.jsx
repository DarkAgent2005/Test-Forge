import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import EndpointDetail from './components/EndpointDetail';

function AppLayout() {
  const location = useLocation();

  // Helper to determine if link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface text-on-surface flex font-body-md">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface flex flex-col border-r border-outline-variant z-50">
        <div className="p-lg shrink-0">
          <h1 className="font-headline-md text-[20px] font-bold text-primary tracking-tight mb-1 font-mono">TESTFORGE AI</h1>
          <p className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60 font-mono">V2.4.0-STABLE</p>
        </div>

        <nav className="flex-1 px-md space-y-xs mt-md">
          {/* Home link */}
          <Link
            to="/"
            className={`flex items-center gap-md px-md py-sm rounded-sm transition-colors duration-150 ease-in-out font-label-caps text-xs font-bold uppercase tracking-wider font-mono ${
              isActive('/')
                ? 'text-primary border-r-2 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Home</span>
          </Link>

          {/* Test Runner indicator / link */}
          <div
            className={`flex items-center gap-md px-md py-sm rounded-sm font-label-caps text-xs font-bold uppercase tracking-wider font-mono opacity-50 cursor-not-allowed text-on-surface-variant`}
            title="Active only inside specific endpoint diagnostic runner"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            <span>Test Runner</span>
          </div>

          {/* Endpoint Detail link - show active when inside endpoint */}
          <div
            className={`flex items-center gap-md px-md py-sm rounded-sm font-label-caps text-xs font-bold uppercase tracking-wider font-mono ${
              location.pathname.includes('/endpoints/')
                ? 'text-primary border-r-2 border-primary bg-surface-container-high'
                : 'text-on-surface-variant opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <span>Endpoint Detail</span>
          </div>

          <div
            className="flex items-center gap-md px-md py-sm rounded-sm text-on-surface-variant font-label-caps text-xs font-bold uppercase tracking-wider font-mono opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>History</span>
          </div>

          <div
            className="flex items-center gap-md px-md py-sm rounded-sm text-on-surface-variant font-label-caps text-xs font-bold uppercase tracking-wider font-mono opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </div>
        </nav>

        {/* User profile section */}
        <div className="p-lg border-t border-outline-variant flex items-center gap-md shrink-0">
          <div className="w-10 h-10 bg-surface-container-highest border border-outline flex items-center justify-center overflow-hidden rounded-sm">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJJG-oajEsAq4WVV6mfQhnCVQcA1EqOtC-JjT4kvUBJalhLrwrN74F1sur2wr_CrAzcIv3fC-r8MA2fxGRhzCclQYi07DYbdeZGyjktqxDmkD07yPn_wHr-J4h1niE7MHzC-ewjbeLp-Zj-5RgjqHl6zmpEYi3ouzNRy3SDMGGOPD5bad5k7MMs4Kj_2fBz1DZCnC5_Vtq2SGG9zNf8x5QxB8IIrYyXaqq8Vn4dk4ArBZszPRhHKeZGw"
              alt="SYS_ADMIN avatar"
            />
          </div>
          <div>
            <p className="font-data-tabular text-xs font-bold text-on-surface font-mono">SYS_ADMIN_01</p>
            <div className="flex items-center gap-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed led-glow-green" />
              <span className="text-[9px] font-bold text-on-surface-variant font-mono uppercase tracking-wider">ACTIVE_SESSION</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col pl-[280px]">
        {/* Top Header */}
        <header className="h-16 bg-surface-container-low flex justify-between items-center px-lg border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-lg">
            <span className="font-headline-md text-sm font-bold tracking-wider text-on-surface font-mono uppercase">SYSTEM MONITOR</span>
            <div className="h-6 w-px bg-outline-variant" />
            <div className="flex items-center gap-sm">
              <div className="w-2 h-2 rounded-full bg-primary-fixed led-glow-green animate-pulse" />
              <span className="text-[10px] font-label-caps font-bold text-primary font-mono tracking-widest uppercase">LIVE TELEMETRY STREAM</span>
            </div>
          </div>

          <div className="flex items-center gap-md">
            <div className="relative w-64 group focus-notch">
              <input
                type="text"
                placeholder="Search telemetry..."
                className="w-full bg-[#131A21] border border-outline-variant px-md py-1.5 text-data-tabular text-xs focus:border-secondary transition-all outline-none font-mono rounded-sm"
              />
              <span className="material-symbols-outlined absolute right-2 top-2 text-on-surface-variant text-sm font-bold">search</span>
            </div>
            <div className="flex items-center gap-md border-l border-outline-variant pl-lg">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px] font-bold">notifications</button>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px] font-bold">account_tree</button>
              <button className="material-symbols-outlined text-error hover:opacity-80 transition-opacity text-[20px] font-bold">power_settings_new</button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)] flex flex-col bg-surface-container-lowest">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/endpoints/:endpointId" element={<EndpointDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
