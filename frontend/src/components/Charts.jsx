import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';

export function PassFailChart({ passed, failed }) {
  const data = [
    { name: 'Passed', value: passed, color: '#10B981' },
    { name: 'Failed', value: failed, color: '#EF4444' },
  ];

  const total = passed + failed;
  const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Card className="flex flex-col items-center justify-center p-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-6">Test Results Overview</h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 flex gap-6 text-center">
          <div>
            <p className="text-sm text-gray-400 mb-1">Pass Rate</p>
            <p className="text-3xl font-bold text-emerald-400">{passPercentage}%</p>
          </div>
          <div className="w-px bg-gray-700" />
          <div>
            <p className="text-sm text-gray-400 mb-1">Tests Run</p>
            <p className="text-3xl font-bold text-gray-300">{total}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ResponseTimeChart({ results }) {
  if (!results || results.length === 0) {
    return (
      <Card className="flex items-center justify-center p-8 text-gray-500">
        No data available
      </Card>
    );
  }

  // Group by response time ranges and get average
  const chartData = results
    .sort((a, b) => a.responseTime - b.responseTime)
    .map((test, idx) => ({
      name: test.name.substring(0, 15),
      time: test.responseTime,
      index: idx,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <Card className="p-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-6">Response Times</h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              label={{ value: 'ms', angle: -90, position: 'insideLeft', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [`${value}ms`, 'Response Time']}
            />
            <Line 
              type="monotone" 
              dataKey="time" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
