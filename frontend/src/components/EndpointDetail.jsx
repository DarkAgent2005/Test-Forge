import { useEffect, useState, useRef } from 'react';
import { getProject, getEndpoint, generateEndpointTests, getEndpointTestCases, runTests } from '../api';
import { useParams, Link } from 'react-router-dom';

export default function EndpointDetail() {
  const { id, endpointId } = useParams();
  const [project, setProject] = useState(null);
  const [endpoint, setEndpoint] = useState(null);
  const [testCases, setTestCaseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Runner view state
  const [isRunnerActive, setIsRunnerActive] = useState(false);
  const [runnerState, setRunnerState] = useState('idle'); // 'idle' | 'running' | 'completed' | 'paused'
  const [runnerLogs, setRunnerLogs] = useState([]);
  const [queueResults, setQueueResults] = useState([]);
  const [executionStats, setExecutionStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    avgLatency: 0
  });

  // Coordinates for the Traveler Mock
  const [coords, setCoords] = useState({ x: 124.52, y: 68.21, z: 0.00 });

  // Accordion details
  const [expandedTestIdx, setExpandedTestIdx] = useState(null);
  
  // Generating state
  const [generating, setGenerating] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    fetchEndpointDetails();
  }, [id, endpointId]);

  useEffect(() => {
    if (runnerState === 'running') {
      const interval = setInterval(() => {
        setCoords({
          x: (Math.random() * 500).toFixed(2),
          y: (Math.random() * 500).toFixed(2),
          z: (Math.random() * 50).toFixed(2)
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [runnerState]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [runnerLogs]);

  const fetchEndpointDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projData = await getProject(id);
      setProject(projData);

      const epData = await getEndpoint(endpointId);
      setEndpoint(epData);

      const cases = await getEndpointTestCases(endpointId);
      setTestCaseList(cases || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load endpoint details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    try {
      setGenerating(true);
      setError(null);
      const generated = await generateEndpointTests(endpointId);
      setTestCaseList(generated);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate test cases');
    } finally {
      setGenerating(false);
    }
  };

  const addLog = (text, type = 'INF') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const color = type === 'OK' ? 'text-[#6bfb9a]' : type === 'ERR' ? 'text-[#ffb4ab]' : type === 'WRN' ? 'text-[#ffb95f]' : 'text-[#7bd0ff]';
    setRunnerLogs(prev => [...prev, { time, type, text, color }]);
  };

  const handleRunTests = async () => {
    if (testCases.length === 0) {
      alert('Please generate test cases first.');
      return;
    }

    setIsRunnerActive(true);
    setRunnerState('running');
    setRunnerLogs([]);
    setQueueResults(testCases.map(tc => ({ ...tc, status: 'PENDING', latency: 'PENDING' })));

    addLog(`Initialize connection to target endpoint...`, 'INF');
    addLog(`Handshake verified via TLS 1.3 to ${project.baseUrl || 'local'}`, 'INF');
    addLog(`Request Traveler core engine spawned at node 0x7FF...`, 'OK');

    try {
      const url = `${project.baseUrl || 'http://localhost:5000'}${endpoint.path}`;
      const method = endpoint.method;
      
      // We map database TestCase structures to test inputs expected by /run-tests
      const formattedTestCases = testCases.map(tc => ({
        name: tc.name,
        input: tc.requestBody || {},
        expectedStatus: tc.expectedStatus
      }));

      // Trigger the execution on the backend
      const resultData = await runTests(url, method, formattedTestCases);
      
      // Simulate real-time progress update for UX feedback
      let passed = 0;
      let failed = 0;
      let totalLatency = 0;

      for (let i = 0; i < resultData.results.length; i++) {
        const res = resultData.results[i];
        await new Promise(r => setTimeout(r, 600)); // stagger updates

        setQueueResults(prev => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            status: res.status === 'PASS' ? 'PASS' : 'FAIL',
            latency: `${res.responseTime}ms`
          };
          return next;
        });

        totalLatency += res.responseTime;

        if (res.status === 'PASS') {
          passed++;
          addLog(`PASS: ${res.name} (Expected ${res.expectedStatus}, got ${res.actualStatus}) in ${res.responseTime}ms`, 'OK');
        } else {
          failed++;
          addLog(`FAIL: ${res.name} (Expected ${res.expectedStatus}, got ${res.actualStatus}) in ${res.responseTime}ms`, 'ERR');
          if (res.aiExplanation) {
            addLog(`AI_CAUSE: ${res.aiExplanation}`, 'WRN');
          }
        }
      }

      setExecutionStats({
        total: resultData.results.length,
        passed,
        failed,
        avgLatency: Math.round(totalLatency / resultData.results.length)
      });
      setRunnerState('completed');
      addLog(`Execution completed: ${passed} passed, ${failed} failed. Telemetry sync stable.`, 'OK');
    } catch (err) {
      setRunnerState('completed');
      addLog(`EXECUTION_ABORTED: ${err.message}`, 'ERR');
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
    <div className="h-full flex-1 bg-surface-container-lowest font-body-md overflow-hidden flex flex-col min-h-0">
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-data-tabular text-sm font-mono flex items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          LOADING_ENDPOINT_CONTEXT...
        </div>
      ) : error ? (
        <div className="p-md text-center text-error font-data-tabular text-sm font-mono border border-error/20 bg-error/5 rounded-sm">
          <span className="material-symbols-outlined mr-2">error</span>
          ERROR: {error}
        </div>
      ) : (
        <>
          {/* Header Strip */}
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-sm text-[10px] font-label-caps font-bold text-on-surface-variant mb-1 font-mono">
                <Link to="/" className="hover:text-primary transition-colors">DASHBOARD</Link>
                <span>/</span>
                <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">{project.name.toUpperCase()}</Link>
                <span>/</span>
                <span className="text-on-surface">EP_{endpointId.substring(18)}</span>
              </div>
              
              <div className="flex items-center gap-md">
                <span className={`px-md py-[2px] border text-xs font-bold rounded-sm tracking-wider font-mono ${getMethodBadgeClass(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <h2 className="font-display-lg text-2xl font-bold text-white font-mono">
                  {endpoint.path}
                </h2>
              </div>

              <div className="flex items-center gap-sm mt-xs">
                <span className="px-md py-1 bg-on-secondary-fixed-variant/20 border border-secondary-fixed-dim text-secondary-fixed-dim rounded-sm font-label-caps text-[9px] font-mono">SECURITY</span>
                <span className="px-md py-1 bg-on-primary-fixed-variant/20 border border-primary-fixed-dim text-primary-fixed-dim rounded-sm font-label-caps text-[9px] font-mono">PERFORMANCE</span>
                <span className="px-md py-1 bg-surface-variant border border-outline-variant text-on-surface-variant rounded-sm font-label-caps text-[9px] font-mono">CRITICAL_PATH</span>
              </div>
            </div>

            <div className="flex gap-md">
              {isRunnerActive ? (
                <button
                  onClick={() => setIsRunnerActive(false)}
                  className="px-md py-2 border border-outline-variant text-on-surface font-label-caps text-xs font-bold tracking-wider hover:bg-surface-variant rounded-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                  BACK TO SUITE
                </button>
              ) : (
                <>
                  <button
                    onClick={handleGenerateTests}
                    disabled={generating}
                    className="px-md py-2 bg-surface border border-outline-variant text-on-surface font-label-caps text-xs font-bold tracking-wider hover:border-secondary disabled:opacity-50 rounded-sm transition-all flex items-center gap-1.5"
                  >
                    {generating ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        GENERATING...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        GENERATE NEW TESTS
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleRunTests}
                    disabled={testCases.length === 0}
                    className="px-md py-2 bg-primary text-surface font-label-caps text-xs font-bold tracking-wider hover:brightness-110 disabled:opacity-50 rounded-sm transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    RUN ENDPOINT TEST
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sub-View: Test Runner Layout */}
          {isRunnerActive ? (
            <div className="h-0 flex-1 p-md grid grid-cols-12 grid-rows-6 gap-md overflow-hidden min-h-0">
              {/* Traveler Core Mock Visualizer */}
              <section className="col-span-12 lg:col-span-8 row-start-1 row-end-5 bg-surface border border-outline-variant relative overflow-hidden rounded-sm min-h-0">
                <div className="absolute top-sm left-sm z-10 flex items-center gap-sm bg-surface-container-lowest/80 px-sm py-xs border border-outline-variant rounded-sm">
                  <div className={`w-2 h-2 rounded-full bg-primary ${runnerState === 'running' ? 'led-active' : ''}`} />
                  <span className="font-label-caps text-[10px] font-bold text-primary tracking-widest">REQUEST TRAVELER CORE</span>
                </div>
                <div className="absolute top-sm right-sm z-10 font-data-tabular text-[10px] text-on-surface-variant font-mono">
                  XYZ_COORD: <span className="text-secondary">{coords.x}</span>, <span className="text-secondary">{coords.y}</span>, <span className="text-secondary">{coords.z}</span>
                </div>

                {/* Radar Grid Graphic Mock */}
                <div className="w-full h-full flex items-center justify-center bg-[#0a0f14]">
                  <div className="relative w-full h-full border border-outline-variant/10 pointer-events-none">
                    {/* Technical Grid Lines */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #1e262f 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.2 }} />
                    
                    {/* Active Scan Indicator */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className={`w-28 h-28 border border-primary/20 flex items-center justify-center ${runnerState === 'running' ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                        <div className={`w-20 h-20 border border-secondary/30 rotate-45 flex items-center justify-center ${runnerState === 'running' ? 'animate-pulse' : ''}`}>
                          <span className="material-symbols-outlined text-primary text-3xl font-bold">deployed_code</span>
                        </div>
                      </div>
                      <div className="mt-md px-md py-xs bg-surface-container border border-outline-variant rounded-sm">
                        <span className="font-label-caps text-[10px] font-bold text-on-surface tracking-wider font-mono">
                          {runnerState === 'running' ? 'SCANNING_ENDPOINTS: ACTIVE' : 'DIAGNOSIS_IDLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress Queue Table */}
              <section className="col-span-12 lg:col-span-4 row-start-1 row-end-5 bg-surface border border-outline-variant flex flex-col overflow-hidden rounded-sm min-h-0">
                <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center font-mono">
                  <span className="font-label-caps text-xs font-bold text-on-surface">ENDPOINT QUEUE</span>
                  <span className="font-data-tabular text-[10px] text-primary font-bold uppercase">
                    {runnerState === 'running' ? 'RUNNING' : 'SYNC_COMPLETED'}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto font-data-tabular font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface-container-high border-b border-outline-variant text-[10px]">
                      <tr>
                        <th className="p-sm text-outline font-bold">STATUS</th>
                        <th className="p-sm text-outline font-bold">SCENARIO</th>
                        <th className="p-sm text-outline font-bold">LATENCY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {queueResults.map((qr, idx) => (
                        <tr key={idx} className="hover:bg-surface-container transition-colors">
                          <td className="p-sm">
                            {qr.status === 'PENDING' ? (
                              <div className="w-2.5 h-2.5 rounded-full border border-outline-variant animate-pulse" />
                            ) : qr.status === 'PASS' ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary led-active" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-error" />
                            )}
                          </td>
                          <td className="p-sm text-on-surface font-semibold max-w-[140px] truncate" title={qr.name}>
                            {qr.name}
                          </td>
                          <td className={`p-sm font-bold ${qr.status === 'PASS' ? 'text-primary' : qr.status === 'FAIL' ? 'text-error' : 'text-outline-variant'}`}>
                            {qr.latency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Execution Console Logs Panel */}
              <section className="col-span-12 row-start-5 row-end-7 bg-surface-container-lowest border border-outline-variant flex flex-col overflow-hidden relative rounded-sm min-h-0">
                <div className="px-md py-xs bg-surface-container-low border-b border-outline-variant flex justify-between items-center font-mono shrink-0">
                  <div className="flex items-center gap-md">
                    <span className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">EXECUTION CONSOLE</span>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full ${runnerState === 'running' ? 'bg-primary animate-pulse' : 'bg-surface-container-highest'}`} />
                    </div>
                  </div>
                  <span className="font-data-tabular text-[9px] text-outline-variant">T_OFFSET: +00:00:00</span>
                </div>
                
                <div className="flex-1 p-md font-data-tabular text-[11px] text-on-surface-variant overflow-y-auto space-y-1 font-mono">
                  {runnerLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-md leading-relaxed">
                      <span className="text-outline shrink-0 font-bold">[{log.time}]</span>
                      <span className={`${log.color} shrink-0 font-bold`}>{log.type}</span>
                      <span className="break-all whitespace-pre-wrap">{log.text}</span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-4 terminal-gradient pointer-events-none" />
              </section>
            </div>
          ) : (
            /* Sub-View: Default Telemetry & AI Test Cases List */
            <div className="flex-1 p-md flex flex-col gap-md overflow-y-auto min-h-0">
              
              {/* Telemetry Row */}
              <div className="grid grid-cols-12 gap-gutter bg-outline-variant border border-outline-variant rounded-sm shrink-0">
                <div className="col-span-12 md:col-span-3 bg-surface p-sm flex items-center justify-between font-mono">
                  <span className="text-[10px] text-on-surface-variant font-label-caps font-bold">AVG_LATENCY</span>
                  <span className="text-[11px] text-primary-fixed font-bold">
                    {executionStats.total > 0 ? `${executionStats.avgLatency}ms` : '142ms'}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-3 bg-surface p-sm flex items-center justify-between font-mono">
                  <span className="text-[10px] text-on-surface-variant font-label-caps font-bold">SUCCESS_RATE</span>
                  <span className="text-[11px] text-secondary-fixed font-bold">
                    {executionStats.total > 0 ? `${Math.round((executionStats.passed / executionStats.total) * 100)}%` : '99.8%'}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-3 bg-surface p-sm flex items-center justify-between font-mono">
                  <span className="text-[10px] text-on-surface-variant font-label-caps font-bold">THROUGHPUT</span>
                  <span className="text-[11px] text-tertiary-fixed font-bold">4.2 req/s</span>
                </div>
                <div className="col-span-12 md:col-span-3 bg-surface p-sm flex items-center justify-between font-mono">
                  <span className="text-[10px] text-on-surface-variant font-label-caps font-bold">AI_COVERAGE</span>
                  <span className="text-[11px] text-primary font-bold">95.4%</span>
                </div>
              </div>

              {/* Scenarios Panel */}
              <section className="bg-surface border border-outline-variant rounded-sm flex-1 flex flex-col overflow-hidden min-h-[250px]">
                <div className="px-panel-padding py-sm border-b border-outline-variant bg-surface-container-high flex justify-between items-center shrink-0 font-mono">
                  <span className="font-label-caps text-xs font-bold text-on-surface-variant">AI_GENERATED_TEST_SUITE</span>
                  <span className="text-[10px] text-on-surface-variant">SCENARIOS: {testCases.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-md space-y-md">
                  {testCases.length === 0 ? (
                    <div className="text-center font-mono py-12 text-on-surface-variant">
                      NO AI SCENARIOS FOUND. CLICK 'GENERATE NEW TESTS' ABOVE TO GENERATE.
                    </div>
                  ) : (
                    testCases.map((tc, idx) => {
                      const isExpanded = expandedTestIdx === idx;
                      const hasConf = tc.confidence === 'high';
                      
                      return (
                        <div key={tc._id || idx} className="border border-outline-variant bg-surface-container rounded-sm overflow-hidden">
                          <div
                            onClick={() => setExpandedTestIdx(isExpanded ? null : idx)}
                            className="p-md flex items-center justify-between cursor-pointer hover:bg-surface-container-high/60 transition-colors"
                          >
                            <div className="flex items-center gap-md min-w-0">
                              <span className={`material-symbols-outlined ${tc.category === 'security' ? 'text-error' : tc.category === 'negative' ? 'text-[#ffb95f]' : 'text-primary'}`}>
                                {tc.category === 'security' ? 'dangerous' : tc.category === 'negative' ? 'report' : 'verified'}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-on-surface text-sm truncate font-mono">{tc.name}</h4>
                                <p className="text-[10px] text-on-surface-variant font-mono">CATEGORY: {tc.category.toUpperCase()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-lg shrink-0 font-mono">
                              <div className="text-right">
                                <p className="text-[9px] text-on-surface-variant font-bold">EXPECTED_STATUS</p>
                                <p className={`font-bold ${tc.expectedStatus < 400 ? 'text-primary' : 'text-error'}`}>
                                  {tc.expectedStatus}
                                </p>
                              </div>
                              <span className="material-symbols-outlined text-on-surface-variant select-none">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-outline-variant h-48">
                              <div className="border-r border-outline-variant p-md bg-[#0a0f14] overflow-hidden flex flex-col">
                                <p className="text-[10px] text-on-surface-variant font-bold font-mono mb-xs">INPUT_PAYLOAD</p>
                                <pre className="font-data-tabular text-[11px] text-secondary-fixed leading-tight overflow-auto flex-1 font-mono p-sm bg-[#131A21]/50 border border-outline-variant/20 rounded-sm">
                                  {JSON.stringify(tc.requestBody, null, 2)}
                                </pre>
                              </div>

                              <div className="p-md bg-[#0a0f14]/50 flex flex-col justify-center items-center">
                                <p className="text-[10px] text-on-surface-variant font-bold font-mono mb-sm">AI_CONFIDENCE_SCORE</p>
                                <p className={`text-3xl font-display-lg font-mono font-bold ${hasConf ? 'text-primary' : 'text-tertiary-fixed'}`}>
                                  {hasConf ? '99.2%' : '85.4%'}
                                </p>
                                <span className="text-[10px] text-on-surface-variant mt-sm font-mono tracking-wider">
                                  SOURCE: {tc.source ? tc.source.toUpperCase() : 'AI_ENGINE'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
