import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../lib/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'neutral',
  trend,
  delay = 0,
}) {
  const variants = {
    neutral: 'border-gray-800',
    success: 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent',
    error: 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent',
    info: 'border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent',
  };

  const iconColors = {
    neutral: 'text-gray-500',
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card
        className={cn('flex flex-col justify-between', variants[variant])}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <Icon className={cn('w-6 h-6', iconColors[variant])} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-4xl font-bold font-mono bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
