import { useEffect, useState } from 'react';
import { getProject, createEndpoint, deleteEndpoint } from '../api';
import { useParams, Link } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Endpoint form state
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [requestFields, setRequestFields] = useState([]); // [{ name, type, required }]
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProject(id);
      setProject(data);
      setEndpoints(data.endpoints || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setRequestFields(prev => [...prev, { name: '', type: 'string', required: false }]);
  };

  const handleRemoveField = (index) => {
    setRequestFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, value) => {
    setRequestFields(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleCreateEndpoint = async (e) => {
    e.preventDefault();
    if (!path.trim()) {
      setFormError('Endpoint path is required');
      return;
    }
    // Simple validation for request fields names
    if (requestFields.some(f => !f.name.trim())) {
      setFormError('All request fields must have a name');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const created = await createEndpoint({
        project: id,
        method,
        path: path.trim().startsWith('/') ? path.trim() : '/' + path.trim(),
        description,
        requestFields: requestFields.map(f => ({ ...f, name: f.name.trim() }))
      });
      setEndpoints(prev => [created, ...prev]);
      setShowModal(false);
      setMethod('GET');
      setPath('');
      setDescription('');
      setRequestFields([]);
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to create endpoint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEndpoint = async (epId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this endpoint?')) return;
    try {
      await deleteEndpoint(epId);
      setEndpoints(prev => prev.filter(ep => ep._id !== epId));
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete endpoint');
    }
  };

  const getMethodBadgeClass = (m) => {
    switch (m) {
      case 'GET': return 'bg-[#7bd0ff]/10 border-[#7bd0ff]/30 text-[#7bd0ff]';
      case 'POST': return 'bg-[#6bfb9a]/10 border-[#6bfb9a]/30 text-[#6bfb9a]';
      case 'PUT':
      case 'PATCH': return 'bg-[#ffb95f]/10 border-[#ffb95f]/30 text-[#ffb95f]';
      case 'DELETE': return 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]';
      default: return 'bg-[#30353b] border-[#869486]/30 text-[#dee3ea]';
    }
  };

  return (
    <div className="flex-1 p-md bg-surface-container-lowest font-body-md overflow-y-auto">
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-data-tabular text-sm font-mono flex items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          LOADING_PROJECT_CONTEXT...
        </div>
      ) : error ? (
        <div className="p-md text-center text-error font-data-tabular text-sm font-mono border border-error/20 bg-error/5 rounded-sm">
          <span className="material-symbols-outlined mr-2">error</span>
          ERROR: {error}
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {/* Breadcrumbs & Header */}
          <div className="flex justify-between items-start border-b border-outline-variant pb-md bg-surface-container-low p-panel-padding rounded-sm">
            <div>
              <div className="flex items-center gap-sm text-[10px] font-label-caps font-bold text-on-surface-variant mb-1 font-mono">
                <Link to="/" className="hover:text-primary transition-colors">DASHBOARD</Link>
                <span>/</span>
                <span className="text-on-surface">PROJECT_CONTEXT</span>
              </div>
              <h2 className="font-display-lg text-2xl font-bold text-white mb-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">folder_open</span>
                {project.name}
              </h2>
              <p className="text-xs text-on-surface-variant max-w-2xl">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-sm font-mono text-[10px] text-secondary-fixed flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">link</span>
                BASE_URL: <a href={project.baseUrl} target="_blank" rel="noreferrer" className="hover:underline">{project.baseUrl || 'N/A'}</a>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-md py-2 bg-primary text-surface font-label-caps text-xs font-bold tracking-wider rounded-sm hover:brightness-110 active:brightness-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              NEW ENDPOINT
            </button>
          </div>

          {/* Bento Stats Row */}
          <div className="grid grid-cols-12 gap-md">
            <div className="col-span-12 md:col-span-4 bg-surface border border-outline-variant p-panel-padding rounded-sm flex items-center justify-between">
              <div>
                <span className="font-label-caps text-[9px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">ENDPOINTS_COUNT</span>
                <p className="font-data-tabular text-2xl font-bold text-secondary-fixed font-mono mt-xs">{endpoints.length}</p>
              </div>
              <span className="material-symbols-outlined text-outline text-3xl">route</span>
            </div>

            <div className="col-span-12 md:col-span-4 bg-surface border border-outline-variant p-panel-padding rounded-sm flex items-center justify-between">
              <div>
                <span className="font-label-caps text-[9px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">AVG_RESPONSE_TIME</span>
                <p className="font-data-tabular text-2xl font-bold text-primary font-mono mt-xs">124ms</p>
              </div>
              <span className="material-symbols-outlined text-outline text-3xl">speed</span>
            </div>

            <div className="col-span-12 md:col-span-4 bg-surface border border-outline-variant p-panel-padding rounded-sm flex items-center justify-between">
              <div>
                <span className="font-label-caps text-[9px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">TARGET_ENVIRONMENT</span>
                <p className="font-data-tabular text-base font-bold text-tertiary-fixed font-mono mt-xs truncate max-w-[200px]" title={project.baseUrl}>
                  {project.baseUrl ? new URL(project.baseUrl).hostname : 'LOCAL_INSTANCE'}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline text-3xl">dns</span>
            </div>
          </div>

          {/* Endpoints Table */}
          <section className="bg-surface border border-outline-variant rounded-sm">
            <div className="px-panel-padding py-sm border-b border-outline-variant bg-surface-container-high font-mono font-bold text-xs flex justify-between items-center text-on-surface-variant">
              <span>ENDPOINT_SCHEMA_MAP</span>
              <span className="text-[10px] text-primary">SCENARIOS: ACTIVE</span>
            </div>

            <div className="overflow-x-auto">
              {endpoints.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant font-data-tabular text-sm font-mono">
                  NO ENDPOINTS REGISTERED. CLICK 'NEW ENDPOINT' TO DIAGNOSE AN API PATH.
                </div>
              ) : (
                <table className="w-full text-left font-data-tabular text-sm border-collapse font-mono">
                  <thead className="bg-surface-container text-on-surface-variant text-[10px] uppercase tracking-wider font-label-caps border-b border-outline-variant font-bold">
                    <tr>
                      <th className="p-md text-outline font-bold">METHOD</th>
                      <th className="p-md text-outline font-bold">PATH</th>
                      <th className="p-md text-outline font-bold">DESCRIPTION</th>
                      <th className="p-md text-outline font-bold">FIELDS_COUNT</th>
                      <th className="p-md text-outline font-bold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {endpoints.map((ep) => (
                      <tr key={ep._id} className="hover:bg-surface-container transition-colors group">
                        <td className="p-md">
                          <span className={`px-sm py-[2px] border text-[10px] font-bold rounded-sm tracking-wider font-mono ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td className="p-md font-bold text-primary hover:underline truncate max-w-[280px]">
                          <Link to={`/projects/${id}/endpoints/${ep._id}`}>
                            {ep.path}
                          </Link>
                        </td>
                        <td className="p-md text-on-surface-variant truncate max-w-[320px]">
                          {ep.description || 'No description provided'}
                        </td>
                        <td className="p-md text-on-surface-variant font-semibold">
                          {(ep.requestFields || []).length} field{(ep.requestFields || []).length !== 1 ? 's' : ''}
                        </td>
                        <td className="p-md text-right">
                          <button
                            onClick={(e) => handleDeleteEndpoint(ep._id, e)}
                            className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-error hover:brightness-125 transition-all"
                            title="Delete Endpoint"
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
        </div>
      )}

      {/* New Endpoint Drawer / Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0f14]/80 flex items-center justify-end z-[100]">
          <div className="w-full max-w-xl h-full bg-surface border-l border-outline flex flex-col relative shadow-2xl overflow-y-auto">
            {/* Focus notch line */}
            <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#7bd0ff]" />

            <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center sticky top-0 z-10">
              <span className="font-label-caps text-xs font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">add_road</span>
                SYS_ENDPOINT_REGISTER
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateEndpoint} className="p-md flex flex-col gap-md flex-1 overflow-y-auto">
              {formError && (
                <div className="p-sm bg-error/10 border border-error/30 text-error text-xs font-mono rounded-sm">
                  ERROR: {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-md">
                <div className="flex flex-col gap-xs focus-notch col-span-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">METHOD</label>
                  <select
                    className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-sm focus:border-secondary transition-all outline-none rounded-sm"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-xs focus-notch col-span-2">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">PATH *</label>
                  <input
                    type="text"
                    required
                    placeholder="/api/v1/users"
                    className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-sm focus:border-secondary transition-all outline-none rounded-sm"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs relative focus-notch">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">PATH_DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Explain the functional purpose of this route..."
                  className="w-full bg-[#131A21] border border-outline-variant px-md py-sm text-data-tabular font-mono text-xs focus:border-secondary transition-all outline-none resize-none rounded-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Dynamic Request Fields Builder */}
              <div className="border border-outline-variant/60 rounded-sm p-sm mt-xs">
                <div className="flex justify-between items-center border-b border-outline-variant/50 pb-xs mb-sm">
                  <span className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                    REQUEST_BODY_SCHEMA (FIELDS)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-md py-1 border border-primary text-primary font-label-caps text-[10px] font-bold tracking-widest hover:bg-primary/10 rounded-sm transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                    ADD FIELD
                  </button>
                </div>

                {requestFields.length === 0 ? (
                  <p className="text-center text-[11px] text-on-surface-variant font-mono py-md">
                    No fields configured. Recommended for POST/PUT/PATCH paths.
                  </p>
                ) : (
                  <div className="space-y-sm max-h-64 overflow-y-auto pr-xs">
                    {requestFields.map((field, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-sm items-center border-b border-outline-variant/20 pb-sm">
                        <div className="col-span-5 relative focus-notch">
                          <input
                            type="text"
                            required
                            placeholder="field_name"
                            className="w-full bg-[#131A21] border border-outline-variant px-sm py-[4px] text-data-tabular font-mono text-xs focus:border-secondary transition-all outline-none rounded-sm"
                            value={field.name}
                            onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                          />
                        </div>

                        <div className="col-span-4">
                          <select
                            className="w-full bg-[#131A21] border border-outline-variant px-sm py-[4px] text-data-tabular font-mono text-xs focus:border-secondary transition-all outline-none rounded-sm"
                            value={field.type}
                            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                          >
                            {['string', 'number', 'boolean', 'object', 'array'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <input
                            type="checkbox"
                            id={`req-${idx}`}
                            className="rounded-sm bg-[#131A21] border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                          />
                          <label htmlFor={`req-${idx}`} className="font-label-caps text-[9px] text-on-surface-variant font-bold cursor-pointer">
                            REQ
                          </label>
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="material-symbols-outlined text-error hover:brightness-125 text-sm"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-md border-t border-outline-variant/30 pt-md mt-auto sticky bottom-0 bg-surface z-10 pb-xs">
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
                      REGISTERING...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                      REGISTER_ENDPOINT
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
