import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldCheck, Zap } from 'lucide-react';
import { ActivityLogEntry } from '@shared';

interface ActivityLogFeedProps {
  logs: ActivityLogEntry[];
}

export const ActivityLogFeed: React.FC<ActivityLogFeedProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getTypeBadge = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'DISPATCH':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'DECISION':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'BOARDING':
        return 'bg-sky-950/80 text-sky-400 border-sky-800';
      case 'DOOR':
        return 'bg-purple-950/80 text-purple-400 border-purple-800';
      case 'SYSTEM':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-64">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Dispatch Decision Feed
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Real-time
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-800"
      >
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={log.id}
                className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 hover:bg-slate-950 transition-colors"
              >
                <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                  {timeStr}
                </span>

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0 uppercase ${getTypeBadge(
                    log.type
                  )}`}
                >
                  {log.type}
                </span>

                <span className="text-slate-300 leading-tight">
                  {log.message}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
            Waiting for simulation events...
          </div>
        )}
      </div>
    </div>
  );
};
