
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ControlPanel from './common/ControlPanel';
import ThreadTimeline, { Activity } from './common/ThreadTimeline';
import { Badge } from '@/components/ui/badge';

type Item = { id: number; producedAt: number };
type LogEntry = { timestamp: number; msg: string; type: 'producer' | 'consumer' | 'system' };

const ProducerConsumerVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [threads, setThreads] = useState(4); // 1 producer + N-1 consumers
  const [buffer, setBuffer] = useState<Item[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [useFlush, setUseFlush] = useState(true);

  const baseTimeRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);
  const staleVisibilityRef = useRef(false);

  const addLog = (msg: string, type: 'producer' | 'consumer' | 'system') => {
    setLogs(prev => [...prev, { timestamp: Date.now(), msg, type }].slice(-60));
  };

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    setBuffer([]);
    setLogs([]);
    setActivities({});
    baseTimeRef.current = Date.now();
    nextIdRef.current = 1;
    staleVisibilityRef.current = !useFlush; // if not using flush, simulate staleness
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog('Starting Producer–Consumer demo', 'system');
    timerRef.current = window.setInterval(() => {
      const producerId = 0;
      const consumerIds = Array.from({ length: Math.max(1, threads - 1) }, (_, i) => i + 1);

      // Producer periodically generates
      if (Math.random() < 0.6 * speed) {
        const item: Item = { id: nextIdRef.current++, producedAt: Date.now() };
        setBuffer(prev => {
          const next = [...prev, item].slice(-20);
          addLog(`Producer produced item ${item.id}`, 'producer');
          setActivities(prevA => {
            const arr = prevA[producerId] ? [...prevA[producerId]] : [];
            arr.push({ start: Date.now(), end: Date.now() + 50, label: `Produce ${item.id}`, color: 'bg-primary' });
            return { ...prevA, [producerId]: arr };
          });
          return next;
        });

        // Simulate memory visibility: if no flush, consumers may miss latest item momentarily
        staleVisibilityRef.current = !useFlush && Math.random() < 0.5;
      }

      // Consumers pick up
      consumerIds.forEach(cid => {
        if (Math.random() < 0.8 * speed) {
          setBuffer(prev => {
            if (prev.length === 0) return prev;
            // If stale, pretend they didn't see the last item
            const pickIndex = staleVisibilityRef.current ? prev.length - 2 : prev.length - 1;
            if (pickIndex < 0) return prev;
            const item = prev[pickIndex];
            const next = prev.filter((_, idx) => idx !== pickIndex);
            addLog(`Consumer ${cid} consumed item ${item.id}`, 'consumer');
            setActivities(prevA => {
              const arr = prevA[cid] ? [...prevA[cid]] : [];
              arr.push({ start: Date.now(), end: Date.now() + 80, label: `Consume ${item.id}`, color: 'bg-green-500' });
              return { ...prevA, [cid]: arr };
            });
            // After a "flush", visibility resets
            if (useFlush) staleVisibilityRef.current = false;
            return next;
          });
        }
      });
    }, 120);
  };

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="space-y-6">
      <ControlPanel
        isRunning={isRunning}
        isPaused={isPaused}
        speed={speed}
        onSpeedChange={setSpeed}
        threads={threads}
        onThreadsChange={setThreads}
        onStart={start}
        onPauseResume={() => {
          if (!isRunning) return;
          if (isPaused) { setIsPaused(false); start(); } else { setIsPaused(true); if (timerRef.current) window.clearInterval(timerRef.current); }
        }}
        onReset={reset}
        disableThreadChange={isRunning}
        title="Producer–Consumer Controls"
      />

      <Card>
        <CardHeader>
          <CardTitle>Buffer Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 text-sm items-center">
            <Badge variant={useFlush ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setUseFlush(v => !v)}>
              {useFlush ? 'Flush: ON (visible updates)' : 'Flush: OFF (possible stale reads)'}
            </Badge>
            <span className="text-muted-foreground">Toggle to demonstrate memory visibility with/without flush.</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {buffer.map((it) => (
              <div key={it.id} className="p-2 text-center border rounded bg-secondary text-xs">
                Item {it.id}
              </div>
            ))}
            {buffer.length === 0 && (<div className="text-xs text-muted-foreground">Buffer empty</div>)}
          </div>
        </CardContent>
      </Card>

      <ThreadTimeline activities={activities} baseTime={baseTimeRef.current} now={Date.now()} title="Thread Timeline (0 = Producer, 1..N = Consumers)" />

      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500">[{((l.timestamp - (logs[0]?.timestamp || l.timestamp)) / 1000).toFixed(2)}s]</span>
                <span className={`ml-2 ${l.type === 'producer' ? 'text-blue-400' : l.type === 'consumer' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {l.type.toUpperCase()}:
                </span>
                <span className="ml-2">{l.msg}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerConsumerVisualization;
