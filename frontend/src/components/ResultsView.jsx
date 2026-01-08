import { CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import TestCard from './TestCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useState } from 'react';
import { PassFailChart, ResponseTimeChart } from './Charts';
import { useTestStore } from '../store/testStore';

export default function ResultsView() {
  const results = useTestStore(s => s.results);
  const filters = useTestStore(s => s.filters);
  const sortBy = useTestStore(s => s.sortBy);
  const sortOrder = useTestStore(s => s.sortOrder);
  const setFilter = useTestStore(s => s.setFilter);
  const setSearchQuery = useTestStore(s => s.setSearchQuery);
  const setSortBy = useTestStore(s => s.setSortBy);
  const setSortOrder = useTestStore(s => s.setSortOrder);
  const getFilteredResults = useTestStore(s => s.getFilteredResults);

  const [showFilters, setShowFilters] = useState(false);

  if (!results) return null;

  const { summary } = results;
  const filteredResults = getFilteredResults();
  const displayTests = filteredResults?.results || [];

  const getStatusColor = (status) => {
    return status === 'PASS' 
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' 
      : 'border-red-500/30 bg-red-500/10 text-red-500';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Tests</p>
          <p className="text-3xl font-bold font-mono text-gray-200">{summary.totalTests}</p>
        </Card>
        
        <Card className="border-emerald-900/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-emerald-500 w-4 h-4" />
            <p className="text-emerald-500/80 text-xs font-semibold uppercase tracking-wider">Passed</p>
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-400">{summary.passedTests}</p>
        </Card>
        
        <Card className="border-red-900/30 bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red-500 w-4 h-4" />
            <p className="text-red-500/80 text-xs font-semibold uppercase tracking-wider">Failed</p>
          </div>
          <p className="text-3xl font-bold font-mono text-red-500">{summary.failedTests}</p>
        </Card>

        <Card>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Status</p>
          <Badge variant={summary.overallStatus === 'PASS' ? 'success' : 'error'}>
            {summary.overallStatus}
          </Badge>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <PassFailChart passed={summary.passedTests} failed={summary.failedTests} />
        <ResponseTimeChart results={results.results} />
      </div>

      {/* Target Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`px-6 py-4 rounded-2xl border ${getStatusColor(summary.overallStatus)}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="neutral" className="tracking-widest">{summary.method}</Badge>
            <span className="font-mono text-sm opacity-90 break-all">{summary.url}</span>
          </div>
          <div className="font-bold text-lg">
            {summary.overallStatus}
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-800"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          {filters.status && (
            <Badge variant="info">
              {filters.status}
            </Badge>
          )}
          {filters.searchQuery && (
            <Badge variant="info">
              {filters.searchQuery}
            </Badge>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Card className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Search Tests</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by name or status"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                      value={filters.searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'All', value: null },
                      { label: 'Passed', value: 'PASS' },
                      { label: 'Failed', value: 'FAIL_AFTER_RETRY' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={filters.status === option.value ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Sort By</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'Time', value: 'time' },
                      { label: 'Response Time', value: 'responseTime' },
                      { label: 'Name', value: 'name' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSortBy(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="flex gap-2">
                  <Button
                    variant={sortOrder === 'asc' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSortOrder('asc')}
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={sortOrder === 'desc' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSortOrder('desc')}
                  >
                    Descending
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Test List */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-300">Execution Details</h3>
          <span className="text-sm text-gray-500">{displayTests.length} result{displayTests.length !== 1 ? 's' : ''}</span>
        </div>
        
        {displayTests.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            <p>No tests match the current filters</p>
          </Card>
        ) : (
          displayTests.map((test, index) => (
            <TestCard key={index} test={test} index={index} />
          ))
        )}
      </motion.div>
    </div>
  );
}
