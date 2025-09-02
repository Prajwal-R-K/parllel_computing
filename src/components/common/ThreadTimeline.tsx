
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

export type Activity = {
  start: number; // ms timestamp
  end?: number; // ms timestamp
  label: string;
  color?: string; // Tailwind class for bg color
};

type ThreadTimelineProps = {
  activities: Record<number, Activity[]>;
  baseTime: number; // demo start time (ms)
  now: number; // current time (ms)
  title?: string;
};

const ThreadTimeline: React.FC<ThreadTimelineProps> = ({ activities, baseTime, now, title }) => {
  const totalMs = Math.max(500, now - baseTime);
  const rows = useMemo(() => Object.keys(activities).map(k => Number(k)).sort((a, b) => a - b), [activities]);

  return (
    <Card className="p-4 space-y-3">
      {title && <div className="font-semibold">{title}</div>}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] space-y-2">
          {rows.map((tid) => (
            <div key={tid}>
              <div className="text-xs text-muted-foreground mb-1">Thread {tid}</div>
              <div className="relative w-full h-6 bg-secondary rounded">
                {activities[tid]?.map((act, idx) => {
                  const startPct = Math.max(0, ((act.start - baseTime) / totalMs) * 100);
                  const endTime = act.end ?? now;
                  const widthPct = Math.max(1, ((endTime - act.start) / totalMs) * 100);
                  const color = act.color || 'bg-primary';
                  return (
                    <div
                      key={idx}
                      className={`absolute top-0 h-6 ${color} text-[10px] text-background px-1 rounded`}
                      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                      title={act.label}
                    >
                      <span className="truncate">{act.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-xs text-muted-foreground">No activity yet. Start the demo to see the timeline.</div>
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Timeline length: {(totalMs / 1000).toFixed(1)}s</div>
    </Card>
  );
};

export default ThreadTimeline;
