import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Crown, Users, CheckCircle, Clock, Zap, Settings } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  type: 'matrix_row' | 'vector_dot' | 'monte_carlo' | 'image_filter';
  status: 'pending' | 'assigned' | 'processing' | 'completed';
  assignedWorker: number | null;
  progress: number;
  executionTime: number;
  complexity: number;
  data?: number[];
}

interface Worker {
  id: number;
  status: 'idle' | 'busy';
  currentTask: Task | null;
  completedTasks: number;
  totalWorkTime: number;
  efficiency: number;
}

interface Master {
  status: 'idle' | 'distributing' | 'waiting' | 'collecting';
  currentAction: string;
  tasksAssigned: number;
  tasksCompleted: number;
  totalDistributionTime: number;
}

interface LogEntry {
  timestamp: number;
  thread: string;
  message: string;
  type: 'master' | 'worker' | 'system';
}

interface TimelineEntry {
  start: number;
  end?: number;
  task: string;
  color: string;
}

type ExampleType = 'matrix_addition' | 'dot_product' | 'monte_carlo' | 'image_processing';

const TASK_TYPES = {
  matrix_addition: { name: 'Matrix Addition', count: 16, baseTime: 800 },
  dot_product: { name: 'Dot Product', count: 12, baseTime: 600 },
  monte_carlo: { name: 'Monte Carlo π', count: 8, baseTime: 1200 },
  image_processing: { name: 'Image Filter', count: 20, baseTime: 900 }
};

const MasterWorkerVisualization: React.FC = () => {
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [threadCount, setThreadCount] = useState(4);
  const [delayMs, setDelayMs] = useState(100);
  const [exampleType, setExampleType] = useState<ExampleType>('matrix_addition');

  const [master, setMaster] = useState<Master>({
    status: 'idle',
    currentAction: 'Ready to start',
    tasksAssigned: 0,
    tasksCompleted: 0,
    totalDistributionTime: 0
  });
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [totalThroughput, setTotalThroughput] = useState(0);

  // Timeline visualization
  const [timeline, setTimeline] = useState<Record<number, TimelineEntry[]>>({});

  // Refs for simulation
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workersRef = useRef<Worker[]>([]);
  const tasksRef = useRef<Task[]>([]);
  const timeCounterRef = useRef(0);
  const baseTimeRef = useRef<number>(Date.now());

  const addLog = (thread: string, message: string, type: 'master' | 'worker' | 'system') => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      thread,
      message,
      type
    }].slice(-50));
  };

  const generateTasks = (type: ExampleType): Task[] => {
    const config = TASK_TYPES[type];
    return Array.from({ length: config.count }, (_, i) => ({
      id: i + 1,
      name: getTaskName(type, i + 1),
      type: getTaskType(type),
      status: 'pending' as const,
      assignedWorker: null,
      progress: 0,
      executionTime: config.baseTime + (Math.random() - 0.5) * 400,
      complexity: Math.floor(Math.random() * 3) + 1,
      data: generateTaskData(type, i)
    }));
  };

  const getTaskName = (type: ExampleType, id: number): string => {
    switch (type) {
      case 'matrix_addition': return `Row ${id} Addition`;
      case 'dot_product': return `Vector Chunk ${id}`;
      case 'monte_carlo': return `Sample Batch ${id}`;
      case 'image_processing': return `Filter Block ${id}`;
      default: return `Task ${id}`;
    }
  };

  const getTaskType = (type: ExampleType): Task['type'] => {
    switch (type) {
      case 'matrix_addition': return 'matrix_row';
      case 'dot_product': return 'vector_dot';
      case 'monte_carlo': return 'monte_carlo';
      case 'image_processing': return 'image_filter';
      default: return 'matrix_row';
    }
  };

  const generateTaskData = (type: ExampleType, index: number): number[] => {
    switch (type) {
      case 'matrix_addition':
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
      case 'dot_product':
        return Array.from({ length: 1000 }, () => Math.random() * 2 - 1);
      case 'monte_carlo':
        return [1000000];
      case 'image_processing':
        return Array.from({ length: 64 }, () => Math.floor(Math.random() * 256));
      default:
        return [];
    }
  };

  const initWorkers = (count: number) => {
    const workerArray: Worker[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      status: 'idle',
      currentTask: null,
      completedTasks: 0,
      totalWorkTime: 0,
      efficiency: 0.8 + Math.random() * 0.4
    }));
    setWorkers(workerArray);
    workersRef.current = workerArray;
  };

  const reset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setExecutionTime(0);
    setTotalThroughput(0);
    timeCounterRef.current = 0;
    baseTimeRef.current = Date.now();
    
    setMaster({
      status: 'idle',
      currentAction: 'Ready to start',
      tasksAssigned: 0,
      tasksCompleted: 0,
      totalDistributionTime: 0
    });
    
    initWorkers(threadCount);
    setTimeline({});
    setLogs([]);
    
    const newTasks = generateTasks(exampleType);
    setTasks(newTasks);
    tasksRef.current = newTasks;
  };

  const startDemo = () => {
    if (isRunning) return;
    
    baseTimeRef.current = Date.now();
    addLog('System', `Starting ${TASK_TYPES[exampleType].name} demonstration`, 'system');
    addLog('Master', `Initializing ${threadCount} worker threads`, 'master');

    setIsRunning(true);
    setIsPaused(false);
    setMaster(prev => ({
      ...prev,
      status: 'distributing',
      currentAction: 'Distributing tasks to available workers'
    }));

    const runSimulation = () => {
      const actualDelay = delayMs / speed;
      timeCounterRef.current += actualDelay;
      setExecutionTime(timeCounterRef.current);

      let currentWorkers = [...workersRef.current];
      let currentTasks = [...tasksRef.current];

      const pendingTasks = currentTasks.filter(t => t.status === 'pending');
      const idleWorkers = currentWorkers.filter(w => w.status === 'idle');

      idleWorkers.forEach(worker => {
        if (pendingTasks.length === 0) return;
        
        const task = pendingTasks.shift()!;
        const taskIndex = currentTasks.findIndex(t => t.id === task.id);
        
        if (taskIndex !== -1) {
          currentTasks[taskIndex] = {
            ...currentTasks[taskIndex],
            status: 'assigned' as const,
            assignedWorker: worker.id,
            progress: 0
          };

          const workerIndex = currentWorkers.findIndex(w => w.id === worker.id);
          currentWorkers[workerIndex] = {
            ...currentWorkers[workerIndex],
            status: 'busy' as const,
            currentTask: currentTasks[taskIndex]
          };

          setTimeout(() => {
            const taskIdx = tasksRef.current.findIndex(t => t.id === task.id);
            if (taskIdx !== -1) {
              tasksRef.current[taskIdx] = {
                ...tasksRef.current[taskIdx],
                status: 'processing' as const
              };
              setTasks([...tasksRef.current]);

              const now = Date.now();
              setTimeline(prev => ({
                ...prev,
                [worker.id]: [
                  ...(prev[worker.id] || []),
                  {
                    start: now,
                    task: task.name,
                    color: getTaskColor(task.type)
                  }
                ]
              }));
            }
          }, 50);

          addLog('Master', `Assigned ${task.name} to Worker ${worker.id}`, 'master');
          addLog(`Worker ${worker.id}`, `Received ${task.name}`, 'worker');
          
          setMaster(prev => ({
            ...prev,
            tasksAssigned: prev.tasksAssigned + 1,
            currentAction: `Assigned ${task.name} to Worker ${worker.id}`
          }));
        }
      });

      currentTasks = currentTasks.map(task => {
        if (task.status === 'processing' && task.assignedWorker) {
          const worker = currentWorkers.find(w => w.id === task.assignedWorker);
          if (worker) {
            const baseProgress = (100 / (task.executionTime / actualDelay)) * speed;
            const adjustedProgress = baseProgress * worker.efficiency;
            const newProgress = Math.min(100, task.progress + adjustedProgress);
            
            return { ...task, progress: newProgress };
          }
        }
        return task;
      });

      const justCompleted: Task[] = [];
      currentTasks = currentTasks.map(task => {
        if (task.status === 'processing' && task.progress >= 100) {
          const completedTask = { ...task, status: 'completed' as const, progress: 100 };
          justCompleted.push(completedTask);
          return completedTask;
        }
        return task;
      });

      if (justCompleted.length > 0) {
        currentWorkers = currentWorkers.map(worker => {
          const completedTask = justCompleted.find(t => t.assignedWorker === worker.id);
          if (completedTask) {
            const endTime = Date.now();
            setTimeline(prev => {
              const workerTimeline = prev[worker.id] || [];
              const updatedTimeline = [...workerTimeline];
              
              for (let i = updatedTimeline.length - 1; i >= 0; i--) {
                if (!updatedTimeline[i].end) {
                  updatedTimeline[i] = { ...updatedTimeline[i], end: endTime };
                  break;
                }
              }
              
              return { ...prev, [worker.id]: updatedTimeline };
            });

            addLog(`Worker ${worker.id}`, `Completed ${completedTask.name}`, 'worker');
            addLog('Master', `Collected result from ${completedTask.name}`, 'master');
            
            setMaster(prev => ({
              ...prev,
              status: 'collecting',
              tasksCompleted: prev.tasksCompleted + 1,
              currentAction: `Collecting result from ${completedTask.name}`
            }));

            return {
              ...worker,
              status: 'idle' as const,
              currentTask: null,
              completedTasks: worker.completedTasks + 1,
              totalWorkTime: worker.totalWorkTime + completedTask.executionTime
            };
          }
          return worker;
        });
      }

      const anyPending = currentTasks.some(t => t.status === 'pending');
      const anyProcessing = currentTasks.some(t => t.status === 'processing' || t.status === 'assigned');
      
      if (!anyPending && anyProcessing) {
        setMaster(prev => ({ 
          ...prev, 
          status: 'waiting', 
          currentAction: 'Waiting for workers to complete remaining tasks' 
        }));
      } else if (anyPending) {
        setMaster(prev => ({ 
          ...prev, 
          status: 'distributing', 
          currentAction: 'Looking for available workers' 
        }));
      }

      const allCompleted = currentTasks.every(t => t.status === 'completed');
      if (allCompleted) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsRunning(false);
        setIsPaused(false);
        
        const totalTime = timeCounterRef.current / 1000;
        const throughput = currentTasks.length / totalTime;
        setTotalThroughput(throughput);
        
        setMaster(prev => ({ 
          ...prev, 
          status: 'idle', 
          currentAction: `All ${currentTasks.length} tasks completed successfully!` 
        }));
        
        addLog('System', `Completed in ${totalTime.toFixed(2)}s (${throughput.toFixed(2)} tasks/sec)`, 'system');
      } else {
        timerRef.current = setTimeout(runSimulation, delayMs);
      }

      setWorkers(currentWorkers);
      setTasks(currentTasks);
      workersRef.current = currentWorkers;
      tasksRef.current = currentTasks;
    };

    timerRef.current = setTimeout(runSimulation, delayMs);
  };

  const pauseResume = () => {
    if (!isRunning) return;
    
    if (isPaused) {
      setIsPaused(false);
      startDemo();
    } else {
      setIsPaused(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const getTaskColor = (type: Task['type']): string => {
    switch (type) {
      case 'matrix_row': return 'bg-blue-500';
      case 'vector_dot': return 'bg-green-500';
      case 'monte_carlo': return 'bg-purple-500';
      case 'image_filter': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    reset();
  }, [threadCount, exampleType]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Master–Worker Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Controls */}
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={startDemo} 
                  disabled={isRunning} 
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
                <Button 
                  onClick={pauseResume} 
                  variant="outline" 
                  disabled={!isRunning} 
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button 
                  onClick={reset} 
                  variant="secondary" 
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Example Type</label>
                <Select value={exampleType} onValueChange={(value: ExampleType) => setExampleType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matrix_addition">Matrix Addition (Row-wise)</SelectItem>
                    <SelectItem value="dot_product">Dot Product (Chunks)</SelectItem>
                    <SelectItem value="monte_carlo">Monte Carlo π Estimation</SelectItem>
                    <SelectItem value="image_processing">Image Processing (Blocks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parameter Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Speed: {speed.toFixed(1)}x
                </label>
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setSpeed(value[0])}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Worker Threads</label>
                  <Input
                    type="number"
                    min={1}
                    max={16}
                    value={threadCount}
                    onChange={(e) => setThreadCount(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))}
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Delay (ms)</label>
                  <Input
                    type="number"
                    min={50}
                    max={1000}
                    value={delayMs}
                    onChange={(e) => setDelayMs(Math.max(50, parseInt(e.target.value) || 100))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time: {(executionTime / 1000).toFixed(2)}s</span>
              </div>
              <Badge variant="outline">Tasks: {tasks.length}</Badge>
              <Badge variant="outline">Workers: {threadCount}</Badge>
              {totalThroughput > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Throughput: {totalThroughput.toFixed(2)} tasks/s</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Thread Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Master Thread (Thread 0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`
            p-6 rounded-lg border-2 transition-all duration-300
            ${master.status === 'distributing' ? 'border-primary bg-primary/10' : 
              master.status === 'waiting' ? 'border-yellow-500 bg-yellow-500/10' :
              master.status === 'collecting' ? 'border-green-500 bg-green-500/10' :
              'border-border bg-secondary/50'}
          `}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Current Status</div>
                <Badge variant={master.status === 'idle' ? 'secondary' : 'default'}>
                  {master.status.charAt(0).toUpperCase() + master.status.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">{master.currentAction}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Tasks Assigned</div>
                <div className="text-2xl font-bold">{master.tasksAssigned}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Tasks Completed</div>
                <div className="text-2xl font-bold text-green-600">{master.tasksCompleted}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Worker Threads ({workers.filter(w => w.status === 'busy').length}/{workers.length} active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.map(worker => (
              <div
                key={worker.id}
                className={`
                  p-4 rounded-lg border transition-all duration-300
                  ${worker.status === 'busy' ? 'border-blue-500 bg-blue-500/10 shadow-lg' :
                    'border-border bg-secondary/50'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${worker.status === 'busy' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-sm">Worker {worker.id}</span>
                  </div>
                  <Badge variant={worker.status === 'idle' ? 'secondary' : 'default'}>
                    {worker.status}
                  </Badge>
                </div>

                {worker.currentTask && (
                  <div className="space-y-2 mb-3">
                    <div className="text-xs font-medium">{worker.currentTask.name}</div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${worker.currentTask.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      {Math.round(worker.currentTask.progress)}%
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <div className="font-bold">{worker.completedTasks}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Efficiency:</span>
                    <div className="font-bold">{(worker.efficiency * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Queue Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Task Queue & Status ({TASK_TYPES[exampleType].name})</CardTitle>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="bg-gray-100">Pending</Badge>
            <Badge variant="secondary" className="bg-yellow-100">Assigned</Badge>
            <Badge variant="secondary" className="bg-blue-100">Processing</Badge>
            <Badge variant="secondary" className="bg-green-100">Completed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`
                  p-3 rounded border text-center transition-all duration-300 cursor-default
                  ${task.status === 'pending' ? 'border-gray-300 bg-gray-50' :
                    task.status === 'assigned' ? 'border-yellow-400 bg-yellow-50' :
                    task.status === 'processing' ? 'border-blue-400 bg-blue-50 shadow-md' :
                    'border-green-400 bg-green-50'}
                `}
                title={`${task.name} - ${task.status} ${task.assignedWorker ? `(Worker ${task.assignedWorker})` : ''}`}
              >
                <div className="text-xs font-semibold mb-1">T{task.id}</div>
                {task.assignedWorker && (
                  <div className="text-xs text-muted-foreground mb-1">W{task.assignedWorker}</div>
                )}
                {task.status === 'processing' && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.status === 'completed' && (
                  <CheckCircle className="w-3 h-3 mx-auto text-green-500" />
                )}
                <div className="text-xs text-muted-foreground">
                  {task.complexity > 1 && '★'.repeat(task.complexity)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Thread Timeline (Gantt Chart)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time visualization of thread activity and task execution patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: threadCount }, (_, i) => i + 1).map(workerId => (
              <div key={workerId} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">Worker {workerId}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                  {timeline[workerId]?.map((activity, idx) => {
                    const startOffset = Math.max(0, (activity.start - baseTimeRef.current) / (executionTime || 1)) * 100;
                    const duration = activity.end ? 
                      ((activity.end - activity.start) / (executionTime || 1)) * 100 : 
                      Math.min(10, 100 - startOffset);
                    
                    return (
                      <div
                        key={idx}
                        className={`absolute h-full ${activity.color} rounded opacity-80 flex items-center justify-center`}
                        style={{
                          left: `${startOffset}%`,
                          width: `${Math.max(2, duration)}%`
                        }}
                        title={activity.task}
                      >
                        <span className="text-xs text-white font-medium truncate px-1">
                          {activity.task.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {executionTime > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
              Timeline duration: {(executionTime / 1000).toFixed(1)}s | 
              Active workers: {workers.filter(w => w.status === 'busy').length} | 
              Completed: {master.tasksCompleted}/{tasks.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Log */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time log of master-worker communication and task lifecycle
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No activity yet. Click Start to begin...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 flex">
                  <span className="text-gray-500 w-16">
                    [{((log.timestamp - logs[0]?.timestamp || 0) / 1000).toFixed(2)}s]
                  </span>
                  <span className={`w-20 ${
                    log.type === 'master' ? 'text-blue-400' :
                    log.type === 'worker' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {log.thread}:
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Execution Time</div>
              <div className="text-2xl font-bold">{(executionTime / 1000).toFixed(2)}s</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Tasks Completed</div>
              <div className="text-2xl font-bold">{master.tasksCompleted}/{tasks.length}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Average Throughput</div>
              <div className="text-2xl font-bold">
                {totalThroughput > 0 ? `${totalThroughput.toFixed(1)}/s` : '—'}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Worker Utilization</div>
              <div className="text-2xl font-bold">
                {workers.length > 0 ? 
                  `${((workers.filter(w => w.status === 'busy').length / workers.length) * 100).toFixed(0)}%` : 
                  '0%'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterWorkerVisualization;
