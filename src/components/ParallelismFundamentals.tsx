
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Cpu, Users, Layers, Network } from 'lucide-react';

interface Thread {
  id: number;
  isActive: boolean;
  currentTask: string;
  workload: number;
  color: string;
}

interface Task {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed';
  assignedThread: number | null;
  progress: number;
  rowIndex?: number;
  dependencies?: number[];
}

interface ParallelismState {
  type: 'serial' | 'data-parallel' | 'task-parallel' | 'pipeline';
  step: number;
  threads: Thread[];
  tasks: Task[];
  description: string;
  isRunning: boolean;
}

const ParallelismFundamentals: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'serial' | 'data-parallel' | 'task-parallel' | 'pipeline'>('serial');
  const [state, setState] = useState<ParallelismState>({
    type: 'serial',
    step: 0,
    threads: [],
    tasks: [],
    description: '',
    isRunning: false
  });

  const threadColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const initializeDemo = (type: typeof currentDemo) => {
    const baseThreads: Thread[] = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      isActive: false,
      currentTask: '',
      workload: 0,
      color: threadColors[i]
    }));

    const baseTasks: Task[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Task ${i + 1}`,
      status: 'pending' as const,
      assignedThread: null,
      progress: 0,
      rowIndex: i
    }));

    setState({
      type,
      step: 0,
      threads: baseThreads,
      tasks: baseTasks,
      description: getStepDescription(type, 0),
      isRunning: false
    });
  };

  const getStepDescription = (type: string, step: number): string => {
    const descriptions = {
      serial: [
        "Serial Processing: One task executed at a time by a single thread",
        "Thread 1 processes Task 1 completely",
        "Thread 1 moves to Task 2 after completing Task 1",
        "This continues sequentially until all tasks are done",
        "Only one CPU core is utilized at any time"
      ],
      'data-parallel': [
        "Data Parallel: Same operation applied to different data simultaneously",
        "All threads receive identical instructions",
        "Each thread works on different data portions",
        "Threads execute the same operation in lockstep",
        "Perfect for SIMD operations and uniform workloads"
      ],
      'task-parallel': [
        "Task-Based Parallelism: Independent tasks distributed among threads",
        "Step 1: Parallel region created, thread team formed",
        "Step 2: Single thread creates all tasks and queues them",
        "Step 3: Tasks are dynamically assigned to available threads",
        "Step 4: Threads execute tasks concurrently with work-stealing",
        "Step 5: Implicit synchronization when all tasks complete"
      ],
      pipeline: [
        "Pipeline Parallelism: Different stages processed concurrently",
        "Stage 1: Data preprocessing",
        "Stage 2: Core computation",
        "Stage 3: Result processing",
        "Multiple data items flow through pipeline simultaneously"
      ]
    };
    return descriptions[type]?.[step] || "Processing...";
  };

  const runDemo = async () => {
    if (state.isRunning) return;
    
    setState(prev => ({ ...prev, isRunning: true }));

    switch (currentDemo) {
      case 'serial':
        await runSerialDemo();
        break;
      case 'data-parallel':
        await runDataParallelDemo();
        break;
      case 'task-parallel':
        await runTaskParallelDemo();
        break;
      case 'pipeline':
        await runPipelineDemo();
        break;
    }

    setState(prev => ({ ...prev, isRunning: false }));
  };

  const runSerialDemo = async () => {
    for (let taskIndex = 0; taskIndex < 8; taskIndex++) {
      setState(prev => ({
        ...prev,
        step: taskIndex + 1,
        description: `Processing Task ${taskIndex + 1} sequentially`,
        threads: prev.threads.map((thread, i) => ({
          ...thread,
          isActive: i === 0,
          currentTask: i === 0 ? `Task ${taskIndex + 1}` : '',
          workload: i === 0 ? 100 : 0
        })),
        tasks: prev.tasks.map((task, i) => ({
          ...task,
          status: i === taskIndex ? 'running' : i < taskIndex ? 'completed' : 'pending',
          assignedThread: i === taskIndex ? 1 : task.assignedThread,
          progress: i === taskIndex ? 50 : i < taskIndex ? 100 : 0
        }))
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map((task, i) => ({
          ...task,
          status: i <= taskIndex ? 'completed' : 'pending',
          progress: i <= taskIndex ? 100 : 0
        }))
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const runDataParallelDemo = async () => {
    // Step 1: All threads start working on different data
    setState(prev => ({
      ...prev,
      step: 1,
      description: "All threads process different data elements simultaneously",
      threads: prev.threads.map(thread => ({
        ...thread,
        isActive: true,
        currentTask: `Data Chunk ${thread.id}`,
        workload: 100
      })),
      tasks: prev.tasks.map((task, i) => ({
        ...task,
        status: i < 4 ? 'running' : 'pending',
        assignedThread: i < 4 ? i + 1 : null,
        progress: i < 4 ? 50 : 0
      }))
    }));

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Complete first batch
    setState(prev => ({
      ...prev,
      step: 2,
      description: "First batch completed, starting second batch",
      tasks: prev.tasks.map((task, i) => ({
        ...task,
        status: i < 4 ? 'completed' : i < 8 ? 'running' : 'pending',
        assignedThread: i >= 4 && i < 8 ? (i - 4) + 1 : task.assignedThread,
        progress: i < 4 ? 100 : i < 8 ? 50 : 0
      }))
    }));

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Complete all
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => ({
        ...task,
        status: 'completed',
        progress: 100
      }))
    }));
  };

  const runTaskParallelDemo = async () => {
    // Step 1: Create parallel region
    setState(prev => ({
      ...prev,
      step: 1,
      description: getStepDescription('task-parallel', 1),
      threads: prev.threads.map(thread => ({
        ...thread,
        isActive: true,
        currentTask: 'Thread created',
        workload: 0
      }))
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Single thread creates tasks
    setState(prev => ({
      ...prev,
      step: 2,
      description: getStepDescription('task-parallel', 2),
      threads: prev.threads.map((thread, i) => ({
        ...thread,
        isActive: i === 0,
        currentTask: i === 0 ? 'Creating tasks' : 'Waiting',
        workload: i === 0 ? 80 : 0
      }))
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Dynamic task assignment
    setState(prev => ({
      ...prev,
      step: 3,
      description: getStepDescription('task-parallel', 3),
      threads: prev.threads.map(thread => ({
        ...thread,
        isActive: true,
        currentTask: 'Ready for tasks',
        workload: 0
      }))
    }));

    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 4: Concurrent execution with work stealing
    const taskAssignments = [
      [0, 1, 2, 3], // First wave
      [4, 5, 6, 7]  // Second wave
    ];

    for (let wave = 0; wave < taskAssignments.length; wave++) {
      const currentTasks = taskAssignments[wave];
      
      setState(prev => ({
        ...prev,
        step: 4,
        description: `Wave ${wave + 1}: Tasks distributed and executing concurrently`,
        threads: prev.threads.map((thread, i) => ({
          ...thread,
          isActive: true,
          currentTask: `Task ${currentTasks[i] + 1}`,
          workload: 100
        })),
        tasks: prev.tasks.map((task, i) => ({
          ...task,
          status: currentTasks.includes(i) ? 'running' : 
                  i < wave * 4 ? 'completed' : 'pending',
          assignedThread: currentTasks.includes(i) ? 
                         currentTasks.indexOf(i) + 1 : task.assignedThread,
          progress: currentTasks.includes(i) ? 70 : 
                   i < wave * 4 ? 100 : 0
        }))
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Complete current wave
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map((task, i) => ({
          ...task,
          status: i <= (wave + 1) * 4 - 1 ? 'completed' : 'pending',
          progress: i <= (wave + 1) * 4 - 1 ? 100 : 0
        })),
        threads: prev.threads.map(thread => ({
          ...thread,
          workload: 0,
          currentTask: wave < taskAssignments.length - 1 ? 'Task completed' : 'All tasks done'
        }))
      }));

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Step 5: Synchronization
    setState(prev => ({
      ...prev,
      step: 5,
      description: getStepDescription('task-parallel', 5),
      threads: prev.threads.map(thread => ({
        ...thread,
        currentTask: 'Synchronized',
        workload: 0
      }))
    }));
  };

  const runPipelineDemo = async () => {
    const stages = ['Preprocess', 'Compute', 'Postprocess'];
    const dataItems = ['Data 1', 'Data 2', 'Data 3', 'Data 4'];

    for (let cycle = 0; cycle < dataItems.length + stages.length - 1; cycle++) {
      setState(prev => ({
        ...prev,
        step: cycle + 1,
        description: `Pipeline Cycle ${cycle + 1}: Multiple data items in different stages`,
        threads: prev.threads.slice(0, 3).map((thread, stageIndex) => {
          const dataIndex = cycle - stageIndex;
          const hasData = dataIndex >= 0 && dataIndex < dataItems.length;
          return {
            ...thread,
            isActive: hasData,
            currentTask: hasData ? `${stages[stageIndex]}: ${dataItems[dataIndex]}` : 'Idle',
            workload: hasData ? 90 : 0
          };
        })
      }));

      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  };

  const resetDemo = () => {
    initializeDemo(currentDemo);
  };

  useEffect(() => {
    initializeDemo(currentDemo);
  }, [currentDemo]);

  const renderThreads = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {state.threads.map((thread) => (
        <div
          key={thread.id}
          className={`p-3 rounded-lg border transition-all duration-300 ${
            thread.isActive ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className={`w-4 h-4 ${thread.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-sm">Thread {thread.id}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {thread.currentTask || 'Idle'}
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="performance-bar h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${thread.workload}%`,
                backgroundColor: thread.color
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{thread.workload}%</div>
        </div>
      ))}
    </div>
  );

  const renderTasks = () => (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
      {state.tasks.map((task) => (
        <div
          key={task.id}
          className={`p-2 rounded border text-center transition-all duration-300 ${
            task.status === 'pending' ? 'border-border bg-secondary' :
            task.status === 'running' ? 'border-task-running bg-task-running/20' :
            'border-task-completed bg-task-completed/20'
          }`}
        >
          <div className="text-xs font-semibold">{task.name}</div>
          {task.assignedThread && (
            <div className="text-xs text-muted-foreground">T{task.assignedThread}</div>
          )}
          <div className="w-full bg-secondary rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                task.status === 'running' ? 'performance-bar' : 
                task.status === 'completed' ? 'bg-task-completed' : ''
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Parallelism Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Parallelism Types - Internal Workings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { key: 'serial', label: 'Serial', icon: <Layers className="w-4 h-4" /> },
              { key: 'data-parallel', label: 'Data Parallel', icon: <Users className="w-4 h-4" /> },
              { key: 'task-parallel', label: 'Task Parallel', icon: <Cpu className="w-4 h-4" /> },
              { key: 'pipeline', label: 'Pipeline', icon: <Network className="w-4 h-4" /> }
            ].map((type) => (
              <Button
                key={type.key}
                variant={currentDemo === type.key ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDemo(type.key as any)}
                className="flex items-center gap-2"
              >
                {type.icon}
                {type.label}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={runDemo}
              disabled={state.isRunning}
              size="sm"
            >
              {state.isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {state.isRunning ? 'Running' : 'Start Demo'}
            </Button>
            <Button
              onClick={resetDemo}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Step
            <Badge variant="secondary">Step {state.step}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{state.description}</p>
        </CardContent>
      </Card>

      {/* Thread Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Thread Activity Monitor</CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch how threads are created, assigned tasks, and execute work
          </p>
        </CardHeader>
        <CardContent>
          {renderThreads()}
        </CardContent>
      </Card>

      {/* Task Queue Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status and Assignment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor task creation, assignment to threads, and completion status
          </p>
        </CardHeader>
        <CardContent>
          {renderTasks()}
        </CardContent>
      </Card>

      {/* Parallelism Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How {currentDemo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {currentDemo === 'serial' && (
              <div className="space-y-2">
                <p><strong>Serial Processing:</strong> Tasks execute one after another on a single thread.</p>
                <p><strong>Characteristics:</strong> Simple, predictable, but slow for large workloads.</p>
                <p><strong>Use Case:</strong> Small datasets or when parallelization overhead exceeds benefits.</p>
              </div>
            )}
            {currentDemo === 'data-parallel' && (
              <div className="space-y-2">
                <p><strong>Data Parallel:</strong> Same operation applied to different data simultaneously.</p>
                <p><strong>Characteristics:</strong> SIMD-friendly, uniform workload distribution.</p>
                <p><strong>Use Case:</strong> Vector operations, image processing, mathematical computations.</p>
              </div>
            )}
            {currentDemo === 'task-parallel' && (
              <div className="space-y-2">
                <p><strong>Task-Based Parallel:</strong> Independent work units distributed dynamically.</p>
                <p><strong>Characteristics:</strong> Flexible scheduling, work-stealing, load balancing.</p>
                <p><strong>Use Case:</strong> Irregular workloads, recursive algorithms, matrix operations.</p>
                <p><strong>OpenMP Implementation:</strong> Uses #pragma omp task with dynamic scheduling.</p>
              </div>
            )}
            {currentDemo === 'pipeline' && (
              <div className="space-y-2">
                <p><strong>Pipeline Parallel:</strong> Different stages of computation overlap.</p>
                <p><strong>Characteristics:</strong> Continuous data flow, stage specialization.</p>
                <p><strong>Use Case:</strong> Stream processing, assembly lines, data processing pipelines.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParallelismFundamentals;
