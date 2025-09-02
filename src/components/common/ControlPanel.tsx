
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

type ControlPanelProps = {
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // 0.5x - 3x
  onSpeedChange: (v: number) => void;
  threads: number;
  onThreadsChange: (n: number) => void;
  onStart: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  disableThreadChange?: boolean;
  title?: string;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  isPaused,
  speed,
  onSpeedChange,
  threads,
  onThreadsChange,
  onStart,
  onPauseResume,
  onReset,
  disableThreadChange,
  title
}) => {
  return (
    <Card className="p-4 space-y-4">
      {title && <div className="font-semibold">{title}</div>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onStart} disabled={isRunning} className="hover-scale">
          Start
        </Button>
        <Button onClick={onPauseResume} variant="outline" disabled={!isRunning} className="hover-scale">
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button onClick={onReset} variant="secondary" className="hover-scale">
          Stop / Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm mb-2">Speed: {speed.toFixed(1)}x</div>
          <Slider
            value={[speed]}
            min={0.5}
            max={3}
            step={0.1}
            onValueChange={(v) => onSpeedChange(v[0] ?? 1)}
          />
        </div>

        <div className="md:col-span-2">
          <div className="text-sm mb-2">Threads</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={16}
              value={threads}
              onChange={(e) => {
                const next = parseInt(e.target.value || '1', 10);
                if (!Number.isNaN(next)) onThreadsChange(Math.max(1, Math.min(16, next)));
              }}
              disabled={disableThreadChange}
              className="w-28"
            />
            {disableThreadChange && (
              <span className="text-xs text-muted-foreground">Stop the demo to change threads</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ControlPanel;
