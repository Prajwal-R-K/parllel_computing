
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Cpu, Clock, Zap, BarChart3, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProcessorCore {
  id: number;
  isActive: boolean;
  currentTask: string;
  utilization: number;
  temperature: number;
  powerUsage: number;
  completedTasks: number;
  efficiency: number;
}

interface ExecutionState {
  mode: 'serial' | 'parallel';
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  cores: ProcessorCore[];
  currentStep: string;
  timeElapsed: number;
  powerConsumption: number;
  averageEfficiency: number;
  parallelSpeedup: number;
}

interface PerformanceMetrics {
  serialTime: number;
  parallelTime: number;
  speedup: number;
  efficiency: number;
  powerSaved: number;
}

const InternalProcessVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    mode: 'serial',
    totalTasks: 20,
    completedTasks: 0,
    activeTasks: 0,
    cores: [
      { id: 1, isActive: false, currentTask: '', utilization: 0, temperature: 45, powerUsage: 10, completedTasks: 0, efficiency: 0 },
      { id: 2, isActive: false, currentTask: '', utilization: 0, temperature: 45, powerUsage: 10, completedTasks: 0, efficiency: 0 },
      { id: 3, isActive: false, currentTask: '', utilization: 0, temperature: 45, powerUsage: 10, completedTasks: 0, efficiency: 0 },
      { id: 4, isActive: false, currentTask: '', utilization: 0, temperature: 45, powerUsage: 10, completedTasks: 0, efficiency: 0 }
    ],
    currentStep: 'Idle',
    timeElapsed: 0,
    powerConsumption: 40,
    averageEfficiency: 0,
    parallelSpeedup: 1
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    serialTime: 0,
    parallelTime: 0,
    speedup: 1,
    efficiency: 0,
    powerSaved: 0
  });

  const [executionHistory, setExecutionHistory] = useState<{time: number, efficiency: number, power: number}[]>([]);
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
      powerConsumption: 50,
      cores: prev.cores.map((core, idx) => ({ 
        ...core, 
        isActive: idx === 0, 
        currentTask: idx === 0 ? 'Task 1' : '', 
        utilization: idx === 0 ? 100 : 0,
        temperature: idx === 0 ? 75 : 45,
        powerUsage: idx === 0 ? 25 : 10,
        completedTasks: 0,
        efficiency: idx === 0 ? 100 : 0
      }))
    }));

    let taskIndex = 0;
    let timeCounter = 0;
    const startTime = Date.now();

    const timer = setInterval(() => {
      timeCounter += 100;
      
      if (taskIndex < 20) {
        const progress = (timeCounter % 400) / 400 * 100;
        
        setExecutionState(prev => ({
          ...prev,
          timeElapsed: timeCounter,
          activeTasks: 1,
          currentStep: `Processing task ${taskIndex + 1}/20 on Core 1 (${progress.toFixed(0)}%)`,
          powerConsumption: 50 + Math.sin(timeCounter / 200) * 5,
          averageEfficiency: 25, // Only 1 of 4 cores used
          cores: prev.cores.map((core, idx) => ({
            ...core,
            isActive: idx === 0,
            currentTask: idx === 0 ? `Task ${taskIndex + 1}` : '',
            utilization: idx === 0 ? 90 + Math.random() * 10 : 0,
            temperature: idx === 0 ? 70 + Math.random() * 10 : 45 + Math.random() * 2,
            powerUsage: idx === 0 ? 20 + Math.random() * 8 : 8 + Math.random() * 4,
            efficiency: idx === 0 ? 95 + Math.random() * 5 : 0
          }))
        }));

        // Complete task every 400ms
        if (timeCounter % 400 === 0) {
          taskIndex++;
          setExecutionState(prev => ({
            ...prev,
            completedTasks: taskIndex,
            cores: prev.cores.map((core, idx) => ({
              ...core,
              completedTasks: idx === 0 ? taskIndex : 0
            }))
          }));
        }
      } else {
        // Execution complete
        clearInterval(timer);
        const totalTime = Date.now() - startTime;
        setPerformanceMetrics(prev => ({ ...prev, serialTime: totalTime }));
        setExecutionState(prev => ({
          ...prev,
          currentStep: 'Serial execution completed',
          activeTasks: 0,
          powerConsumption: 40,
          cores: prev.cores.map(core => ({ 
            ...core, 
            isActive: false, 
            currentTask: '', 
            utilization: 0,
            temperature: 45,
            powerUsage: 10,
            efficiency: 0
          }))
        }));
        setIsRunning(false);
      }

      // Update execution history
      setExecutionHistory(prev => [...prev.slice(-50), {
        time: timeCounter,
        efficiency: 25,
        power: 50 + Math.sin(timeCounter / 200) * 5
      }]);
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
      powerConsumption: 80,
      cores: prev.cores.map((core, idx) => ({ 
        ...core, 
        isActive: true, 
        currentTask: `Task ${idx + 1}`, 
        utilization: 85 + Math.random() * 15,
        temperature: 65 + Math.random() * 15,
        powerUsage: 18 + Math.random() * 7,
        completedTasks: 0,
        efficiency: 90 + Math.random() * 10
      }))
    }));

    let completedTasks = 0;
    let timeCounter = 0;
    let taskAssignments = [1, 2, 3, 4];
    const startTime = Date.now();

    const timer = setInterval(() => {
      timeCounter += 100;
      
      if (completedTasks < 20) {
        const activeCoreCount = Math.min(4, 20 - completedTasks);
        const avgProgress = (timeCounter % 300) / 300 * 100;
        
        setExecutionState(prev => ({
          ...prev,
          timeElapsed: timeCounter,
          activeTasks: activeCoreCount,
          currentStep: `Processing ${activeCoreCount} tasks in parallel (${avgProgress.toFixed(0)}%)`,
          powerConsumption: 75 + activeCoreCount * 8 + Math.sin(timeCounter / 150) * 5,
          averageEfficiency: 85 + Math.random() * 10,
          parallelSpeedup: Math.min(4, 20 - completedTasks),
          cores: prev.cores.map((core, idx) => ({
            ...core,
            isActive: idx < activeCoreCount,
            currentTask: idx < activeCoreCount ? `Task ${taskAssignments[idx]}` : '',
            utilization: idx < activeCoreCount ? 80 + Math.random() * 20 : 0,
            temperature: idx < activeCoreCount ? 60 + Math.random() * 20 : 45 + Math.random() * 2,
            powerUsage: idx < activeCoreCount ? 15 + Math.random() * 10 : 8 + Math.random() * 4,
            efficiency: idx < activeCoreCount ? 85 + Math.random() * 15 : 0
          }))
        }));

        // Complete tasks every 300ms (faster than serial)
        if (timeCounter % 300 === 0) {
          const tasksToComplete = Math.min(activeCoreCount, 20 - completedTasks);
          completedTasks += tasksToComplete;
          
          // Assign new tasks to cores
          taskAssignments = taskAssignments.map((task, idx) => 
            idx < activeCoreCount ? task + tasksToComplete : task
          );

          setExecutionState(prev => ({
            ...prev,
            completedTasks: completedTasks,
            cores: prev.cores.map((core, idx) => ({
              ...core,
              completedTasks: idx < activeCoreCount ? Math.floor(completedTasks / activeCoreCount) : 0
            }))
          }));
        }
      } else {
        // Execution complete
        clearInterval(timer);
        const totalTime = Date.now() - startTime;
        setPerformanceMetrics(prev => {
          const speedup = prev.serialTime > 0 ? prev.serialTime / totalTime : 1;
          return {
            ...prev,
            parallelTime: totalTime,
            speedup,
            efficiency: (speedup / 4) * 100,
            powerSaved: Math.max(0, prev.serialTime - totalTime) * 0.1
          };
        });
        setExecutionState(prev => ({
          ...prev,
          currentStep: 'Parallel execution completed',
          activeTasks: 0,
          powerConsumption: 40,
          cores: prev.cores.map(core => ({ 
            ...core, 
            isActive: false, 
            currentTask: '', 
            utilization: 0,
            temperature: 45,
            powerUsage: 10,
            efficiency: 0
          }))
        }));
        setIsRunning(false);
      }

      // Update execution history
      const avgEfficiency = executionState.cores.reduce((sum, core) => sum + core.efficiency, 0) / 4;
      setExecutionHistory(prev => [...prev.slice(-50), {
        time: timeCounter,
        efficiency: avgEfficiency,
        power: executionState.powerConsumption
      }]);
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
      powerConsumption: 40,
      averageEfficiency: 0,
      parallelSpeedup: 1,
      cores: prev.cores.map(core => ({ 
        ...core, 
        isActive: false, 
        currentTask: '', 
        utilization: 0,
        temperature: 45,
        powerUsage: 10,
        completedTasks: 0,
        efficiency: 0
      }))
    }));
    setExecutionHistory([]);
    setPerformanceMetrics({
      serialTime: 0,
      parallelTime: 0,
      speedup: 1,
      efficiency: 0,
      powerSaved: 0
    });
  };

  const renderCoreVisualization = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {executionState.cores.map((core) => (
        <Card key={core.id} className={`
          transition-all duration-300 transform border-2
          ${core.isActive 
            ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 scale-105 shadow-lg shadow-orange-500/25' 
            : 'border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-700/50'
          }
        `}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cpu className={`w-4 h-4 ${core.isActive ? 'text-orange-400' : 'text-slate-400'}`} />
              Core {core.id}
              {core.isActive && <Activity className="w-3 h-3 text-orange-400 animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={core.isActive ? "default" : "secondary"} className="w-full justify-center">
              {core.isActive ? 'Active' : 'Idle'}
            </Badge>
            
            <div className="text-xs text-slate-300 min-h-[32px]">
              {core.currentTask || 'No task assigned'}
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Utilization</span>
                  <span>{core.utilization.toFixed(0)}%</span>
                </div>
                <Progress value={core.utilization} className="h-1.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Temperature</span>
                  <span>{core.temperature.toFixed(0)}°C</span>
                </div>
                <Progress 
                  value={(core.temperature - 40) / 50 * 100} 
                  className={`h-1.5 ${core.temperature > 80 ? 'bg-red-500/20' : 'bg-blue-500/20'}`} 
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Power</span>
                  <span>{core.powerUsage.toFixed(1)}W</span>
                </div>
                <Progress value={(core.powerUsage / 30) * 100} className="h-1.5" />
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center">
              Completed: {core.completedTasks}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="execution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="execution">Live Execution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-6">
          {/* Controls */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Cpu className="w-5 h-5" />
                Execution Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={simulateSerialExecution}
                  disabled={isRunning}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Serial Execution
                </Button>
                <Button
                  onClick={simulateParallelExecution}
                  disabled={isRunning}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Parallel Execution
                </Button>
                {isRunning && (
                  <Button 
                    onClick={stopExecution} 
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
                <Button 
                  onClick={resetSimulation} 
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Status */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Clock className="w-5 h-5" />
                Live Execution Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-blue-400">{executionState.mode.toUpperCase()}</div>
                  <div className="text-xs text-slate-400">Mode</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-green-400">{executionState.activeTasks}</div>
                  <div className="text-xs text-slate-400">Active Tasks</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-orange-400">{executionState.completedTasks}/{executionState.totalTasks}</div>
                  <div className="text-xs text-slate-400">Progress</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-purple-400">{(executionState.timeElapsed / 1000).toFixed(1)}s</div>
                  <div className="text-xs text-slate-400">Time</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-red-400">{executionState.powerConsumption.toFixed(0)}W</div>
                  <div className="text-xs text-slate-400">Power</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-slate-200 mb-2">Overall Progress:</div>
                <Progress 
                  value={(executionState.completedTasks / executionState.totalTasks) * 100} 
                  className="h-3" 
                />
                <div className="text-xs text-slate-400 mt-1">{executionState.currentStep}</div>
              </div>
            </CardContent>
          </Card>

          {/* CPU Cores */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">CPU Core Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCoreVisualization()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <BarChart3 className="w-5 h-5" />
                Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {performanceMetrics.serialTime > 0 ? (performanceMetrics.serialTime / 1000).toFixed(1) : '—'}s
                  </div>
                  <div className="text-sm text-slate-400">Serial Time</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {performanceMetrics.parallelTime > 0 ? (performanceMetrics.parallelTime / 1000).toFixed(1) : '—'}s
                  </div>
                  <div className="text-sm text-slate-400">Parallel Time</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {performanceMetrics.speedup.toFixed(1)}×
                  </div>
                  <div className="text-sm text-slate-400">Speedup</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {performanceMetrics.efficiency.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Activity className="w-5 h-5" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>System Efficiency</span>
                    <span>{executionState.averageEfficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={executionState.averageEfficiency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>Power Efficiency</span>
                    <span>{Math.max(0, 100 - (executionState.powerConsumption - 40) / 60 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (executionState.powerConsumption - 40) / 60 * 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InternalProcessVisualization;
