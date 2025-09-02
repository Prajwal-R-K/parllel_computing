
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ControlPanel from './common/ControlPanel';
import ThreadTimeline, { Activity } from './common/ThreadTimeline';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';

type TaskNode = {
  id: string;
  label: string;
  deps: string[];
  duration: number;
  assignedTo?: number;
  start?: number;
  end?: number;
  status: 'pending' | 'ready' | 'running' | 'done';
  progress?: number;
};

const initialGraph = (): TaskNode[] => ([
  { id: 'A', label: 'Load Data', deps: [], duration: 1200, status: 'pending', progress: 0 },
  { id: 'B', label: 'Preprocess', deps: ['A'], duration: 1000, status: 'pending', progress: 0 },
  { id: 'C', label: 'Filter Data', deps: ['A'], duration: 800, status: 'pending', progress: 0 },
  { id: 'D', label: 'Transform', deps: ['B'], duration: 900, status: 'pending', progress: 0 },
  { id: 'E', label: 'Validate', deps: ['C'], duration: 700, status: 'pending', progress: 0 },
  { id: 'F', label: 'Combine Results', deps: ['D', 'E'], duration: 1100, status: 'pending', progress: 0 },
]);

const taskColors = {
  A: 'from-blue-500 to-blue-600',
  B: 'from-green-500 to-green-600',
  C: 'from-purple-500 to-purple-600',
  D: 'from-orange-500 to-orange-600',
  E: 'from-pink-500 to-pink-600',
  F: 'from-yellow-500 to-yellow-600',
};

const TaskDependenciesVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [threads, setThreads] = useState(3);
  const [graph, setGraph] = useState<TaskNode[]>(initialGraph);
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [stats, setStats] = useState({
    totalTasks: initialGraph().length,
    completedTasks: 0,
    runningTasks: 0,
    readyTasks: 0,
    executionTime: 0,
    efficiency: 0
  });
  const baseTimeRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    setGraph(initialGraph());
    setActivities({});
    setStats({
      totalTasks: initialGraph().length,
      completedTasks: 0,
      runningTasks: 0,
      readyTasks: 0,
      executionTime: 0,
      efficiency: 0
    });
    baseTimeRef.current = Date.now();
    startTimeRef.current = 0;
  };

  const updateTaskStatuses = (tasks: TaskNode[]) => {
    const updated = tasks.map(t => {
      if (t.status === 'pending') {
        const allDepsDone = t.deps.every(d => tasks.find(x => x.id === d)?.status === 'done');
        return allDepsDone ? { ...t, status: 'ready' as const } : t;
      }
      return t;
    });
    return updated;
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      setGraph(prev => {
        const now = Date.now();
        let updated = [...prev];

        // Update task statuses
        updated = updateTaskStatuses(updated);

        // Update progress for running tasks
        updated = updated.map(t => {
          if (t.status === 'running' && t.start) {
            const elapsed = now - t.start;
            const progress = Math.min(100, (elapsed / (t.duration / speed)) * 100);
            
            if (progress >= 100) {
              t.status = 'done';
              t.end = now;
              t.progress = 100;
              
              setActivities(prevA => {
                const arr = prevA[t.assignedTo ?? 0] ? [...prevA[t.assignedTo ?? 0]] : [];
                for (let i = arr.length - 1; i >= 0; i--) {
                  if (!arr[i].end && arr[i].label.includes(t.id)) {
                    arr[i] = { ...arr[i], end: now, color: 'bg-task-completed' };
                    break;
                  }
                }
                return { ...prevA, [t.assignedTo ?? 0]: arr };
              });
            } else {
              t.progress = progress;
            }
          }
          return t;
        });

        // Assign ready tasks to free threads
        const runningWorkers = new Set(updated.filter(t => t.status === 'running').map(t => t.assignedTo ?? -1));
        
        for (let wid = 0; wid < threads; wid++) {
          if (runningWorkers.has(wid)) continue;
          
          const ready = updated.find(t => t.status === 'ready');
          if (ready) {
            ready.status = 'running';
            ready.start = now;
            ready.assignedTo = wid;
            ready.progress = 0;
            
            setActivities(prevA => {
              const arr = prevA[wid] ? [...prevA[wid]] : [];
              arr.push({ 
                start: now, 
                label: `Task ${ready.id}: ${ready.label}`, 
                color: 'bg-task-running' 
              });
              return { ...prevA, [wid]: arr };
            });
          }
        }

        // Update statistics
        const completed = updated.filter(t => t.status === 'done').length;
        const running = updated.filter(t => t.status === 'running').length;
        const ready = updated.filter(t => t.status === 'ready').length;
        const executionTime = startTimeRef.current > 0 ? (now - startTimeRef.current) / 1000 : 0;
        const efficiency = threads > 0 ? (running / threads) * 100 : 0;

        setStats({
          totalTasks: updated.length,
          completedTasks: completed,
          runningTasks: running,
          readyTasks: ready,
          executionTime,
          efficiency
        });

        // Stop when all done
        if (updated.every(t => t.status === 'done')) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
        }

        return updated;
      });
    }, 100);
  };

  const pause = () => {
    setIsPaused(true);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resume = () => {
    if (isPaused) {
      setIsPaused(false);
      start();
    }
  };

  const pauseResume = () => {
    if (isPaused) {
      resume();
    } else if (isRunning) {
      pause();
    }
  };

  useEffect(() => () => { 
    if (timerRef.current) window.clearInterval(timerRef.current); 
  }, []);

  const renderDependencyArrows = () => {
    const arrows = [];
    graph.forEach(task => {
      task.deps.forEach(depId => {
        arrows.push(
          <div key={`${depId}-${task.id}`} className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="font-mono">{depId}</span>
            <ArrowRight className="w-3 h-3 mx-1" />
            <span className="font-mono">{task.id}</span>
          </div>
        );
      });
    });
    return arrows;
  };

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
        onPauseResume={pauseResume}
        onReset={reset}
        disableThreadChange={isRunning}
        title="Task Dependencies Controls"
      />

      {/* Statistics Dashboard */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Clock className="w-5 h-5" />
            Execution Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">{stats.completedTasks}/{stats.totalTasks}</div>
              <div className="text-xs text-slate-300">Tasks Completed</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-green-400">{stats.runningTasks}</div>
              <div className="text-xs text-slate-300">Running Tasks</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-yellow-400">{stats.readyTasks}</div>
              <div className="text-xs text-slate-300">Ready Tasks</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-purple-400">{stats.executionTime.toFixed(1)}s</div>
              <div className="text-xs text-slate-300">Execution Time</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Thread Efficiency</span>
              <span>{stats.efficiency.toFixed(1)}%</span>
            </div>
            <Progress value={stats.efficiency} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Dependency Graph */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Task Dependency Graph (DAG)</CardTitle>
          <div className="text-sm text-slate-400">
            Tasks execute when all dependencies are completed
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {graph.map((task) => (
              <div key={task.id} className={`
                relative p-4 rounded-lg border-2 transition-all duration-300 transform
                ${task.status === 'done' ? 'border-green-500 bg-gradient-to-br from-green-900/30 to-green-800/30 scale-105' : 
                  task.status === 'running' ? `border-orange-500 bg-gradient-to-br ${taskColors[task.id as keyof typeof taskColors]}/20 scale-105 animate-pulse` :
                  task.status === 'ready' ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-blue-800/30' :
                  'border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-700/50'}
              `}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${task.status === 'done' ? 'bg-green-500 text-white' :
                      task.status === 'running' ? 'bg-orange-500 text-white' :
                      task.status === 'ready' ? 'bg-blue-500 text-white' :
                      'bg-slate-600 text-slate-300'}
                  `}>
                    {task.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100">{task.label}</div>
                    <div className="text-xs text-slate-400">
                      {task.duration}ms • Thread {task.assignedTo ?? 'N/A'}
                    </div>
                  </div>
                  {task.status === 'done' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {task.status === 'running' && <Play className="w-5 h-5 text-orange-400" />}
                  {task.status === 'ready' && <AlertCircle className="w-5 h-5 text-blue-400" />}
                </div>
                
                {task.status === 'running' && task.progress !== undefined && (
                  <div className="mb-2">
                    <Progress value={task.progress} className="h-1" />
                    <div className="text-xs text-slate-400 mt-1">{task.progress.toFixed(0)}%</div>
                  </div>
                )}
                
                <div className="text-xs text-slate-400">
                  Dependencies: {task.deps.length ? task.deps.join(', ') : 'None'}
                </div>
                
                <Badge 
                  variant={task.status === 'done' ? 'default' : 'secondary'}
                  className={`mt-2 ${
                    task.status === 'done' ? 'bg-green-600' :
                    task.status === 'running' ? 'bg-orange-600' :
                    task.status === 'ready' ? 'bg-blue-600' : ''
                  }`}
                >
                  {task.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
            <div className="text-sm font-semibold text-slate-200 mb-2">Dependency Relationships:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {renderDependencyArrows()}
            </div>
          </div>
        </CardContent>
      </Card>

      <ThreadTimeline 
        activities={activities} 
        baseTime={baseTimeRef.current} 
        now={Date.now()} 
        title="Thread Execution Timeline" 
      />
    </div>
  );
};

export default TaskDependenciesVisualization;
