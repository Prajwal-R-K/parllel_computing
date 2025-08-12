
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Cpu, Clock, Zap } from 'lucide-react';

interface ProcessorCore {
  id: number;
  isActive: boolean;
  currentTask: string;
  utilization: number;
}

interface ExecutionState {
  mode: 'serial' | 'parallel';
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  cores: ProcessorCore[];
  currentStep: string;
  timeElapsed: number;
}

const InternalProcessVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    mode: 'serial',
    totalTasks: 16,
    completedTasks: 0,
    activeTasks: 0,
    cores: [
      { id: 1, isActive: false, currentTask: '', utilization: 0 },
      { id: 2, isActive: false, currentTask: '', utilization: 0 },
      { id: 3, isActive: false, currentTask: '', utilization: 0 },
      { id: 4, isActive: false, currentTask: '', utilization: 0 }
    ],
    currentStep: 'Idle',
    timeElapsed: 0
  });

  const [interval, setIntervalState] = useState<NodeJS.Timeout | null>(null);

  const simulateSerialExecution = () => {
    setIsRunning(true);
    setExecutionState(prev => ({
      ...prev,
      mode: 'serial',
      completedTasks: 0,
      activeTasks: 0,
      timeElapsed: 0,
      currentStep: 'Starting serial execution...',
      cores: prev.cores.map(core => ({ ...core, isActive: false, currentTask: '', utilization: 0 }))
    }));

    let taskIndex = 0;
    let timeCounter = 0;

    const timer = setInterval(() => {
      timeCounter += 100;
      
      if (taskIndex < 16) {
        // Only use core 1 for serial execution
        setExecutionState(prev => ({
          ...prev,
          timeElapsed: timeCounter,
          activeTasks: 1,
          currentStep: `Processing task ${taskIndex + 1} on Core 1`,
          cores: prev.cores.map((core, idx) => ({
            ...core,
            isActive: idx === 0,
            currentTask: idx === 0 ? `Task ${taskIndex + 1}` : '',
            utilization: idx === 0 ? 100 : 0
          }))
        }));

        // Complete task after 500ms
        if (timeCounter % 500 === 0) {
          taskIndex++;
          setExecutionState(prev => ({
            ...prev,
            completedTasks: taskIndex,
            activeTasks: taskIndex < 16 ? 1 : 0
          }));
        }
      } else {
        // Execution complete
        clearInterval(timer);
        setExecutionState(prev => ({
          ...prev,
          currentStep: 'Serial execution completed',
          activeTasks: 0,
          cores: prev.cores.map(core => ({ ...core, isActive: false, currentTask: '', utilization: 0 }))
        }));
        setIsRunning(false);
      }
    }, 100);

    setIntervalState(timer);
  };

  const simulateParallelExecution = () => {
    setIsRunning(true);
    setExecutionState(prev => ({
      ...prev,
      mode: 'parallel',
      completedTasks: 0,
      activeTasks: 0,
      timeElapsed: 0,
      currentStep: 'Starting parallel execution...',
      cores: prev.cores.map(core => ({ ...core, isActive: false, currentTask: '', utilization: 0 }))
    }));

    let completedTasks = 0;
    let timeCounter = 0;
    let activeCores = [0, 1, 2, 3]; // All cores can be active
    let taskAssignments = [1, 2, 3, 4]; // Current tasks assigned to each core

    const timer = setInterval(() => {
      timeCounter += 100;
      
      if (completedTasks < 16) {
        const activeCoreCount = Math.min(4, 16 - completedTasks);
        
        setExecutionState(prev => ({
          ...prev,
          timeElapsed: timeCounter,
          activeTasks: activeCoreCount,
          currentStep: `Processing ${activeCoreCount} tasks in parallel`,
          cores: prev.cores.map((core, idx) => ({
            ...core,
            isActive: idx < activeCoreCount,
            currentTask: idx < activeCoreCount ? `Task ${taskAssignments[idx]}` : '',
            utilization: idx < activeCoreCount ? 100 : 0
          }))
        }));

        // Complete tasks after 400ms (faster than serial due to parallelism)
        if (timeCounter % 400 === 0) {
          const tasksToComplete = Math.min(activeCoreCount, 16 - completedTasks);
          completedTasks += tasksToComplete;
          
          // Assign new tasks to cores
          taskAssignments = taskAssignments.map((task, idx) => 
            idx < activeCoreCount ? task + tasksToComplete : task
          );

          setExecutionState(prev => ({
            ...prev,
            completedTasks: completedTasks
          }));
        }
      } else {
        // Execution complete
        clearInterval(timer);
        setExecutionState(prev => ({
          ...prev,
          currentStep: 'Parallel execution completed',
          activeTasks: 0,
          cores: prev.cores.map(core => ({ ...core, isActive: false, currentTask: '', utilization: 0 }))
        }));
        setIsRunning(false);
      }
    }, 100);

    setIntervalState(timer);
  };

  const stopExecution = () => {
    if (interval) {
      clearInterval(interval);
      setIntervalState(null);
    }
    setIsRunning(false);
  };

  const resetSimulation = () => {
    stopExecution();
    setExecutionState(prev => ({
      ...prev,
      completedTasks: 0,
      activeTasks: 0,
      timeElapsed: 0,
      currentStep: 'Idle',
      cores: prev.cores.map(core => ({ ...core, isActive: false, currentTask: '', utilization: 0 }))
    }));
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Internal Process Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={simulateSerialExecution}
              disabled={isRunning}
              variant="default"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Serial Execution
            </Button>
            <Button
              onClick={simulateParallelExecution}
              disabled={isRunning}
              variant="default"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Parallel Execution
            </Button>
            {isRunning && (
              <Button onClick={stopExecution} variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
            <Button onClick={resetSimulation} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Execution Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{executionState.mode}</div>
              <div className="text-xs text-muted-foreground">Mode</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-task-running">{executionState.activeTasks}</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-task-completed">{executionState.completedTasks}/{executionState.totalTasks}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{(executionState.timeElapsed / 1000).toFixed(1)}s</div>
              <div className="text-xs text-muted-foreground">Time Elapsed</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium">Current Step:</div>
            <div className="text-sm text-muted-foreground">{executionState.currentStep}</div>
          </div>
        </CardContent>
      </Card>

      {/* CPU Cores Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Core Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch how different execution modes utilize processor cores
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {executionState.cores.map((core) => (
              <div
                key={core.id}
                className={`
                  p-4 rounded-lg border transition-all duration-300
                  ${core.isActive 
                    ? 'border-task-running bg-task-running/10 shadow-md' 
                    : 'border-border bg-secondary/50'
                  }
                `}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Cpu className={`w-5 h-5 ${core.isActive ? 'text-task-running' : 'text-muted-foreground'}`} />
                    <span className="font-semibold">Core {core.id}</span>
                  </div>
                  <Badge 
                    variant={core.isActive ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {core.isActive ? 'Active' : 'Idle'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {core.currentTask || 'No task'}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Utilization</div>
                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                      <div 
                        className="performance-bar h-2 rounded-full transition-all duration-300"
                        style={{ width: `${core.utilization}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{core.utilization}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Task Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{executionState.completedTasks}/{executionState.totalTasks} tasks</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="performance-bar h-3 rounded-full transition-all duration-300"
                style={{ width: `${(executionState.completedTasks / executionState.totalTasks) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {((executionState.completedTasks / executionState.totalTasks) * 100).toFixed(1)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalProcessVisualization;
