
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Users, Clock } from 'lucide-react';
import ControlPanel from './common/ControlPanel';
import ThreadTimeline, { Activity } from './common/ThreadTimeline';

interface Thread {
  id: number;
  status: 'running' | 'waiting' | 'barrier' | 'single' | 'completed';
  progress: number;
  currentPhase: string;
  waitTime: number;
}

interface LogEntry {
  timestamp: number;
  thread: string;
  message: string;
  type: 'barrier' | 'single' | 'master' | 'system';
}

const SynchronizationVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [threads, setThreads] = useState(6);

  const [threadsState, setThreadsState] = useState<Thread[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [currentDemo, setCurrentDemo] = useState<'barrier' | 'single' | 'master'>('barrier');
  const [barrierCount, setBarrierCount] = useState(0);

  const timerRef = useRef<number | null>(null);
  const timeCounterRef = useRef(0);
  const baseTimeRef = useRef(Date.now());

  const [activities, setActivities] = useState<Record<number, Activity[]>>({});

  const addLog = (thread: string, message: string, type: 'barrier' | 'single' | 'master' | 'system') => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      thread,
      message,
      type
    }].slice(-50));
  };

  const initializeThreads = () => {
    const threadList: Thread[] = Array.from({ length: threads }, (_, i) => ({
      id: i,
      status: 'running',
      progress: 0,
      currentPhase: 'Initialization',
      waitTime: 0
    }));
    setThreadsState(threadList);
  };

  const reset = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setExecutionTime(0);
    timeCounterRef.current = 0;
    baseTimeRef.current = Date.now();
    setBarrierCount(0);
    setLogs([]);
    setActivities({});
    initializeThreads();
  };

  useEffect(() => {
    initializeThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, currentDemo]);

  const startLoop = (tickFn: () => void) => {
    timerRef.current = window.setInterval(() => {
      const baseTick = 50;
      const scaled = baseTick * speed;
      timeCounterRef.current += scaled;
      setExecutionTime(timeCounterRef.current);
      tickFn();
    }, 50);
  };

  const startBarrierDemo = () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog('System', 'Starting barrier synchronization demonstration', 'system');
    startLoop(() => {
      setThreadsState(prev => {
        const updated = [...prev];
        let allAtBarrier = true;
        let allCompleted = true;

        updated.forEach(thread => {
          if (thread.status === 'running') {
            const speedLocal = 2 + Math.random() * 3;
            thread.progress += speedLocal * speed;
            thread.currentPhase = 'Computing array elements';

            if (thread.progress >= 100 && thread.status === 'running') {
              thread.status = 'barrier';
              thread.currentPhase = 'Waiting at barrier';
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                arr.push({ start: Date.now(), label: 'Waiting (barrier)', color: 'bg-yellow-500' });
                return { ...prevA, [thread.id]: arr };
              });
              addLog(`Thread ${thread.id}`, 'Reached barrier - waiting for others', 'barrier');
            }
          }

          if (thread.status !== 'completed') allCompleted = false;
          if (thread.status !== 'barrier' && thread.status !== 'completed') allAtBarrier = false;
        });

        const threadsAtBarrier = updated.filter(t => t.status === 'barrier').length;
        const activeThreads = updated.filter(t => t.status !== 'completed').length;

        if (threadsAtBarrier === activeThreads && threadsAtBarrier > 0) {
          updated.forEach(thread => {
            if (thread.status === 'barrier') {
              thread.status = 'running';
              thread.progress = 0;
              thread.currentPhase = 'Post-barrier computation';
              thread.waitTime = 0;
              // Close waiting activity
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                for (let i = arr.length - 1; i >= 0; i--) {
                  if (!arr[i].end) { arr[i] = { ...arr[i], end: Date.now() }; break; }
                }
                arr.push({ start: Date.now(), label: 'Post-barrier work', color: 'bg-primary' });
                return { ...prevA, [thread.id]: arr };
              });
            }
          });
          setBarrierCount(prev => prev + 1);
          addLog('System', `Barrier ${barrierCount + 1} released - all threads continue`, 'system');

          if (barrierCount >= 1) {
            updated.forEach(thread => {
              thread.status = 'completed';
              thread.progress = 100;
              thread.currentPhase = 'Completed';
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                arr.push({ start: Date.now(), end: Date.now() + 10, label: 'Completed', color: 'bg-green-500' });
                return { ...prevA, [thread.id]: arr };
              });
            });
            addLog('System', 'All threads completed execution', 'system');
          }
        } else if (threadsAtBarrier > 0) {
          updated.forEach(thread => {
            if (thread.status === 'barrier') thread.waitTime += 50 * speed;
          });
        }

        if (allCompleted) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          setIsRunning(false);
        }

        return updated;
      });
    });
  };

  const startSingleDemo = () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog('System', 'Starting single construct demonstration', 'system');

    let singleExecuted = false;

    startLoop(() => {
      setThreadsState(prev => {
        const updated = [...prev];
        let allCompleted = true;

        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2 * speed;
            thread.currentPhase = 'Parallel work';

            if (thread.progress >= 50 && !singleExecuted) {
              thread.status = 'single';
              thread.currentPhase = 'Executing single block';
              singleExecuted = true;
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                arr.push({ start: Date.now(), label: 'SINGLE block', color: 'bg-blue-500' });
                return { ...prevA, [thread.id]: arr };
              });
              addLog(`Thread ${thread.id}`, 'Executing single construct - others skip', 'single');
            }

            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.progress = 100;
              thread.currentPhase = 'Completed';
            }
          } else if (thread.status === 'single') {
            thread.progress += 1 * speed;
            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.currentPhase = 'Completed';
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                for (let i = arr.length - 1; i >= 0; i--) {
                  if (!arr[i].end) { arr[i] = { ...arr[i], end: Date.now() }; break; }
                }
                return { ...prevA, [thread.id]: arr };
              });
              addLog(`Thread ${thread.id}`, 'Single construct completed', 'single');
            }
          }

          if (thread.status !== 'completed') allCompleted = false;
        });

        if (allCompleted) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          setIsRunning(false);
          addLog('System', 'Single construct demo completed', 'system');
        }

        return updated;
      });
    });
  };

  const startMasterDemo = () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog('System', 'Starting master construct demonstration', 'system');

    let masterWorkDone = false;

    startLoop(() => {
      setThreadsState(prev => {
        const updated = [...prev];
        let allCompleted = true;

        updated.forEach(thread => {
          if (thread.status === 'running') {
            if (thread.id === 0 && !masterWorkDone) {
              thread.progress += 1.5 * speed;
              thread.currentPhase = 'Master: Initializing shared data';
              if (thread.progress >= 70) {
                masterWorkDone = true;
                addLog('Thread 0 (Master)', 'Master work completed - data initialized', 'master');
                setActivities(prevA => {
                  const arr = prevA[0] ? [...prevA[0]] : [];
                  arr.push({ start: Date.now(), label: 'Master init done', color: 'bg-red-500' });
                  return { ...prevA, 0: arr };
                });
              }
            } else if (thread.id === 0 && masterWorkDone) {
              thread.progress += 3 * speed;
              thread.currentPhase = 'Master: Parallel work';
            } else {
              thread.progress += 3 * speed;
              thread.currentPhase = `Worker: Parallel computation`;
            }

            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.progress = 100;
              thread.currentPhase = 'Completed';
              setActivities(prevA => {
                const arr = prevA[thread.id] ? [...prevA[thread.id]] : [];
                arr.push({ start: Date.now(), end: Date.now() + 10, label: 'Completed', color: 'bg-green-500' });
                return { ...prevA, [thread.id]: arr };
              });
            }
          }

          if (thread.status !== 'completed') allCompleted = false;
        });

        if (allCompleted) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          setIsRunning(false);
          addLog('System', 'Master construct demo completed', 'system');
        }

        return updated;
      });
    });
  };

  const startDemo = () => {
    reset();
    setTimeout(() => {
      if (currentDemo === 'barrier') startBarrierDemo();
      else if (currentDemo === 'single') startSingleDemo();
      else if (currentDemo === 'master') startMasterDemo();
    }, 50);
  };

  const pauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      // resume
      if (currentDemo === 'barrier') startBarrierDemo();
      if (currentDemo === 'single') startSingleDemo();
      if (currentDemo === 'master') startMasterDemo();
    } else {
      setIsPaused(true);
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const renderThreads = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {threadsState.map(thread => (
        <div
          key={thread.id}
          className={`
            p-4 rounded-lg border transition-all duration-300
            ${thread.status === 'barrier' ? 'border-yellow-500 bg-yellow-500/10' : 
              thread.status === 'single' ? 'border-blue-500 bg-blue-500/10' :
              thread.status === 'completed' ? 'border-green-500 bg-green-500/10' :
              'border-border bg-secondary/50'}
          `}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className={`w-5 h-5 ${
              thread.status === 'barrier' ? 'text-yellow-500' :
              thread.status === 'single' ? 'text-blue-500' :
              thread.status === 'completed' ? 'text-green-500' :
              'text-muted-foreground'
            }`} />
            <span className="font-semibold text-sm">
              Thread {thread.id} {thread.id === 0 && currentDemo === 'master' ? '(Master)' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            <Badge variant={thread.status === 'completed' ? 'default' : 'secondary'}>
              {thread.status}
            </Badge>
            
            <div className="text-xs font-medium">{thread.currentPhase}</div>
            
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  thread.status === 'barrier' ? 'bg-yellow-500' :
                  thread.status === 'single' ? 'bg-blue-500' :
                  thread.status === 'completed' ? 'bg-green-500' :
                  'bg-primary'
                }`}
                style={{ width: `${thread.progress}%` }}
              />
            </div>
            
            <div className="text-center text-xs">{Math.round(thread.progress)}%</div>
            
            {thread.waitTime > 0 && (
              <div className="text-xs text-yellow-600">
                Waiting: {(thread.waitTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderConsoleLog = () => (
    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto">
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{((log.timestamp - logs[0]?.timestamp || 0) / 1000).toFixed(2)}s]</span>
          <span className={`ml-2 ${
            log.type === 'barrier' ? 'text-yellow-400' :
            log.type === 'single' ? 'text-blue-400' :
            log.type === 'master' ? 'text-red-400' :
            'text-green-400'
          }`}>
            {log.thread}:
          </span>
          <span className="ml-2">{log.message}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Demo Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Synchronization Primitives Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={currentDemo === 'barrier' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('barrier')}
            >
              Barrier
            </Button>
            <Button
              variant={currentDemo === 'single' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('single')}
            >
              Single
            </Button>
            <Button
              variant={currentDemo === 'master' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('master')}
            >
              Master
            </Button>
          </div>

          <ControlPanel
            isRunning={isRunning}
            isPaused={isPaused}
            speed={speed}
            onSpeedChange={setSpeed}
            threads={threads}
            onThreadsChange={setThreads}
            onStart={startDemo}
            onPauseResume={pauseResume}
            onReset={reset}
            disableThreadChange={isRunning}
            title="Controls"
          />

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time: {(executionTime / 1000).toFixed(2)}s</span>
            </div>
            {currentDemo === 'barrier' && (
              <div>Barriers Completed: {barrierCount}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thread Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Thread Execution - {currentDemo.toUpperCase()} Construct</CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentDemo === 'barrier' && 'All threads must reach the barrier before any can continue'}
            {currentDemo === 'single' && 'Only one thread executes the single block, others skip it'}
            {currentDemo === 'master' && 'Only the master thread (Thread 0) executes master blocks'}
          </p>
        </CardHeader>
        <CardContent>
          {renderThreads()}
        </CardContent>
      </Card>

      {/* Timeline */}
      <ThreadTimeline
        activities={activities}
        baseTime={baseTimeRef.current}
        now={Date.now()}
        title="Thread Timeline (Gantt)"
      />

      {/* Console Output */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
        </CardHeader>
        <CardContent>
          {renderConsoleLog()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SynchronizationVisualization;
