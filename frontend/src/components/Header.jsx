import { Activity } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl shadow-lg">
      <div className="h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
      
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
            <Activity className="text-emerald-400 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              TestForge AI
            </h1>
            <p className="text-xs text-gray-500 font-medium">Production API Testing Platform</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
