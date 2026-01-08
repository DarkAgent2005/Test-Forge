import { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, getTestHistory } from '../api';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Heartbeat grid simulation
  const [heartbeatData, setHeartbeatData] = useState([]);

  useEffect(() => {
    // Generate initial heartbeat grid
    const totalBlocks = 240;
    const initialBlocks = Array.from({ length: totalBlocks }, () => {
      const rand = Math.random();
      if (rand > 0.95) return 'bg-[#ffb4ab] border-[#ffb4ab]/30'; // FAIL
      if (rand > 0.15) return 'bg-[#6bfb9a]/20 border-[#6bfb9a]/10'; // PASS dim
      return 'bg-[#30353b] border-transparent'; // IDLE
    });
    setHeartbeatData(initialBlocks);

    // Fetch projects
    fetchProjects();

    // Heartbeat grid live updates
    const interval = setInterval(() => {
      setHeartbeatData(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const rand = Math.random();
        if (rand > 0.96) {
          next[randomIndex] = 'bg-[#ffb4ab] border-[#ffb4ab]/30 led-active';
        } else if (rand > 0.2) {
          next[randomIndex] = 'bg-[#6bfb9a] border-[#6bfb9a]/30';
        } else {
          next[randomIndex] = 'bg-[#30353b] border-transparent';
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      const created = await createProject({ name, description, baseUrl });
      setProjects(prev => [created, ...prev]);
      setShowModal(false);
      setName('');
      setDescription('');
      setBaseUrl('');
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its endpoints?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="flex-1 p-md bg-surface-container-lowest grid grid-cols-12 gap-gutter font-body-md overflow-y-auto">
      {/* Hero: Heartbeat Monitor */}
      <section className="col-span-12 bg-surface border border-outline-variant p-panel-padding mb-md rounded-sm">
        <div className="flex justify-between items-end mb-md">
          <div>
            <h2 className="font-label-caps text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mb-1">SYSTEM_HEARTBEAT</h2>
            <div className="font-display-lg text-3xl font-bold text-primary tracking-tight font-mono">LIVE_EXECUTIONS</div>
          </div>
          <div className="text-right font-data-tabular text-xs text-on-surface-variant font-mono">
            Uptime: <span className="text-primary-fixed">99.982%</span>
          </div>
        </div>

        {/* Dynamic Heartbeat Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-[3px] h-24 overflow-hidden my-3">
          {heartbeatData.map((bgClass, idx) => (
            <div
              key={idx}
              className={`w-full h-full border rounded-sm transition-all duration-300 ${bgClass}`}
            />
          ))}
        </div>

        <div className="mt-sm flex justify-between items-center border-t border-outline-variant/30 pt-sm">
          <div className="flex gap-md text-[10px] font-label-caps font-mono font-bold tracking-wider">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-primary rounded-sm"></div> PASS</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-error rounded-sm"></div> FAIL</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-surface-container-highest rounded-sm"></div> IDLE</div>
          </div>
          <span className="text-[10px] font-data-tabular text-on-surface-variant font-mono">N=1204 SAMPLES // 24H_CYCLE</span>
        </div>
      </section>

      {/* High-density Telemetry Cards */}
      <div className="col-span-12 lg:col-span-3 bg-surface border border-outline-variant p-panel-padding flex flex-col justify-between rounded-sm min-h-[100px]">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">TOTAL_PROJECTS</span>
        <div className="flex items-baseline justify-between mt-sm">
          <span className="font-display-lg text-3xl font-bold text-secondary-fixed font-mono">{projects.length}</span>
          <span className="text-primary text-[10px] font-data-tabular font-mono font-bold">+100% ACTV</span>
        </div>
        <div className="h-1 w-full bg-surface-container-highest mt-md overflow-hidden rounded-sm">
          <div className="h-full bg-secondary-fixed w-full"></div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 bg-surface border border-outline-variant p-panel-padding flex flex-col justify-between rounded-sm min-h-[100px]">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">STABILITY_RATIO</span>
        <div className="flex items-baseline justify-between mt-sm">
          <span className="font-display-lg text-3xl font-bold text-primary font-mono">98.98%</span>
          <span className="text-[10px] text-on-surface-variant font-mono font-bold">STABLE</span>
        </div>
        <div className="h-1 w-full bg-surface-container-highest mt-md overflow-hidden rounded-sm flex">
          <div className="h-full bg-primary w-[98.98%]"></div>
          <div className="h-full bg-error w-[1.02%]"></div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 bg-surface border border-outline-variant p-panel-padding flex flex-col justify-between rounded-sm min-h-[100px]">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">LATENCY_P95</span>
        <div className="flex items-baseline justify-between mt-sm">
          <span className="font-display-lg text-3xl font-bold text-on-surface font-mono">142ms</span>
          <span className="text-primary text-[10px] font-data-tabular font-mono font-bold">-4ms DEC</span>
        </div>
        <div className="flex gap-[3px] items-end h-8 overflow-hidden mt-xs">
          <div className="w-1 bg-primary h-2"></div>
          <div className="w-1 bg-primary h-4"></div>
          <div className="w-1 bg-primary h-3"></div>
          <div className="w-1 bg-primary h-6"></div>
          <div className="w-1 bg-primary h-5"></div>
          <div className="w-1 bg-primary h-7"></div>
          <div className="w-1 bg-error h-8"></div>
          <div className="w-1 bg-primary h-4"></div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 bg-surface border border-outline-variant p-panel-padding flex flex-col justify-between rounded-sm min-h-[100px]">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">ACTIVE_NODES</span>
        <div className="flex items-baseline justify-between mt-sm">
          <span className="font-display-lg text-3xl font-bold text-tertiary-fixed font-mono">08/08</span>
          <span className="text-primary text-[10px] font-data-tabular font-mono font-bold">100% RUNNING</span>
        </div>
        <div className="h-1 w-full bg-surface-container-highest mt-md overflow-hidden rounded-sm">
          <div className="h-full bg-tertiary w-full"></div>
        </div>
      </div>

      {/* Projects Rack Panel */}
      <section className="col-span-12 bg-surface border border-outline-variant rounded-sm mt-md">
        <div className="px-panel-padding py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
          <div className="flex items-center gap-md">
            <span className="font-label-caps text-xs font-bold text-on-surface">PROJECTS_RACK</span>
            <span className="px-md py-[1px] bg-surface border border-outline-variant text-primary-fixed font-data-tabular text-[10px] font-mono rounded-sm">
              COUNT: {projects.length}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-md py-1 bg-primary text-surface font-label-caps text-xs font-bold tracking-wider rounded-sm hover:brightness-110 active:brightness-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            NEW PROJECT
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant font-data-tabular text-sm font-mono flex items-center justify-center gap-3">
              <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              LOADING_PROJECT_TELEMETRY...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-error font-data-tabular text-sm font-mono border border-error/20 bg-error/5 m-md rounded-sm">
              <span className="material-symbols-outlined mr-2">error</span>
              ERROR: {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-data-tabular text-sm font-mono">
              NO PROJECTS LOADED. CLICK 'NEW PROJECT' TO INITIALIZE.
            </div>
          ) : (
            <table className="w-full text-left font-data-tabular text-sm border-collapse font-mono">
              <thead className="bg-surface-container text-on-surface-variant text-[10px] uppercase tracking-wider font-label-caps border-b border-outline-variant font-bold">
                <tr>
                  <th className="p-md text-outline font-bold">PROJECT_NAME</th>
                  <th className="p-md text-outline font-bold">BASE_URL</th>
                  <th className="p-md text-outline font-bold">DESCRIPTION</th>
                  <th className="p-md text-outline font-bold">INITIALIZED_AT</th>
                  <th className="p-md text-outline font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-surface-container transition-colors group">
                    <td className="p-md font-bold text-primary-fixed hover:underline">
                      <Link to={`/projects/${proj._id}`} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">folder</span>
                        {proj.name}
                      </Link>
                    </td>
                    <td className="p-md text-secondary-fixed max-w-[200px] truncate">
                      {proj.baseUrl || 'N/A'}
                    </td>
                    <td className="p-md text-on-surface-variant max-w-[250px] truncate">
                      {proj.description || 'No description provided'}
                    </td>
                    <td className="p-md text-on-surface-variant">
                      {new Date(proj.createdAt).toLocaleString()}
                    </td>
                    <td className="p-md text-right">
                      <button
                        onClick={(e) => handleDeleteProject(proj._id, e)}
                        className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-error hover:brightness-125 transition-all"
                        title="Delete Project"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* New Project Modal (Stitch DNA style input overlay) */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0f14]/80 flex items-center justify-center z-[100] p-md">
          <div className="w-full max-w-md bg-surface border border-outline flex flex-col rounded-sm relative shadow-2xl">
            {/* Focus notch line */}
            <div className="absolute top-0 right-0 w-8 h-[2px] bg-[#7bd0ff]" />
            
            <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <span className="font-label-caps text-xs font-bold text-on-surface">SYS_PROJECT_INITIALIZE</span>
              <button
                onClick={() => setShowModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-md flex flex-col gap-md">
              {formError && (
                <div className="p-sm bg-error/10 border border-error/30 text-error text-xs font-mono rounded-sm">
                  ERROR: {formError}
                </div>
              )}

              <div className="flex flex-col gap-xs relative focus-notch">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">PROJECT_NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Identity Services"
                  className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-sm focus:border-secondary transition-all outline-none rounded-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-xs relative focus-notch">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">BASE_URL (TARGET)</label>
                <input
                  type="url"
                  placeholder="https://api.staging.internal"
                  className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-sm focus:border-secondary transition-all outline-none rounded-sm"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-xs relative focus-notch">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">PROJECT_DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the project capabilities and diagnostic goals..."
                  className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-xs focus:border-secondary transition-all outline-none resize-none rounded-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-md border-t border-outline-variant/30 pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-md py-2 border border-outline-variant text-on-surface font-label-caps text-xs font-bold tracking-wider hover:bg-surface-variant rounded-sm transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-lg py-2 bg-primary text-surface font-label-caps text-xs font-bold tracking-wider hover:brightness-110 active:brightness-95 disabled:opacity-50 rounded-sm transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      INITIALIZING...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                      INITIALIZE_PROJECT
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
