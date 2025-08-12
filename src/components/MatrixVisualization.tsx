
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface MatrixCell {
  value: number;
  status: 'idle' | 'pending' | 'running' | 'completed';
  taskId: number;
}

interface TaskInfo {
  id: number;
  rowStart: number;
  rowEnd: number;
  status: 'pending' | 'running' | 'completed';
  executionTime: number;
  threadId: number;
}

const MatrixVisualization: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState(8);
  const [taskGranularity, setTaskGranularity] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [threads, setThreads] = useState(4);
  
  const [matrixA, setMatrixA] = useState<MatrixCell[][]>([]);
  const [matrixB, setMatrixB] = useState<MatrixCell[][]>([]);
  const [matrixC, setMatrixC] = useState<MatrixCell[][]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [performance, setPerformance] = useState({ serial: 0, parallel: 0 });

  // Initialize matrices
  useEffect(() => {
    initializeMatrices();
  }, [matrixSize]);

  const initializeMatrices = () => {
    const createMatrix = (): MatrixCell[][] => {
      return Array(matrixSize).fill(null).map(() =>
        Array(matrixSize).fill(null).map(() => ({
          value: Math.floor(Math.random() * 10) + 1,
          status: 'idle' as const,
          taskId: -1
        }))
      );
    };

    setMatrixA(createMatrix());
    setMatrixB(createMatrix());
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        taskId: -1
      }))
    ));

    // Create tasks based on granularity
    const newTasks: TaskInfo[] = [];
    let taskId = 0;
    for (let i = 0; i < matrixSize; i += taskGranularity) {
      newTasks.push({
        id: taskId++,
        rowStart: i,
        rowEnd: Math.min(i + taskGranularity - 1, matrixSize - 1),
        status: 'pending',
        executionTime: 0,
        threadId: -1
      });
    }
    setTasks(newTasks);
    setCurrentStep(0);
  };

  const startSimulation = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    simulateParallelExecution();
  };

  const simulateParallelExecution = async () => {
    const startTime = Date.now();
    let completedTasks = 0;
    const totalTasks = tasks.length;
    
    // Simulate parallel execution
    const executeTask = async (task: TaskInfo, threadId: number): Promise<void> => {
      return new Promise((resolve) => {
        // Mark task as running
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'running', threadId } : t
        ));

        // Update matrix cells for this task
        const updateMatrixCells = (status: 'pending' | 'running' | 'completed') => {
          setMatrixC(prev => prev.map((row, rowIdx) => {
            if (rowIdx >= task.rowStart && rowIdx <= task.rowEnd) {
              return row.map(cell => ({ ...cell, status, taskId: task.id }));
            }
            return row;
          }));
        };

        updateMatrixCells('running');

        // Simulate computation time
        const computationTime = 800 + Math.random() * 400;
        
        setTimeout(() => {
          // Calculate actual matrix addition for this task
          setMatrixC(prev => prev.map((row, rowIdx) => {
            if (rowIdx >= task.rowStart && rowIdx <= task.rowEnd) {
              return row.map((cell, colIdx) => ({
                ...cell,
                value: matrixA[rowIdx][colIdx].value + matrixB[rowIdx][colIdx].value,
                status: 'completed' as const
              }));
            }
            return row;
          }));

          // Mark task as completed
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { 
              ...t, 
              status: 'completed', 
              executionTime: computationTime 
            } : t
          ));

          completedTasks++;
          if (completedTasks === totalTasks) {
            const endTime = Date.now();
            setPerformance(prev => ({ 
              ...prev, 
              parallel: endTime - startTime,
              serial: totalTasks * 1000 // Estimated serial time
            }));
            setIsRunning(false);
          }

          resolve();
        }, computationTime);
      });
    };

    // Execute tasks in parallel with thread limit
    const pendingTasks = [...tasks];
    const runningTasks: Promise<void>[] = [];

    while (pendingTasks.length > 0 || runningTasks.length > 0) {
      // Start new tasks up to thread limit
      while (runningTasks.length < threads && pendingTasks.length > 0) {
        const task = pendingTasks.shift()!;
        const threadId = runningTasks.length;
        const taskPromise = executeTask(task, threadId);
        runningTasks.push(taskPromise);
      }

      // Wait for at least one task to complete
      if (runningTasks.length > 0) {
        await Promise.race(runningTasks);
        // Remove completed tasks
        for (let i = runningTasks.length - 1; i >= 0; i--) {
          try {
            await Promise.race([runningTasks[i], Promise.resolve()]);
            runningTasks.splice(i, 1);
          } catch {
            // Task still running
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    initializeMatrices();
    setPerformance({ serial: 0, parallel: 0 });
  };

  const renderMatrix = (matrix: MatrixCell[][], label: string) => (
    <div className="flex flex-col items-center space-y-2">
      <h3 className="font-bold text-sm text-muted-foreground">{label}</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
        {matrix.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`matrix-cell ${cell.status !== 'idle' ? `task-${cell.status}` : ''}`}
            >
              {cell.value}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            OpenMP Task Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Matrix Size</label>
              <Slider
                value={[matrixSize]}
                onValueChange={(value) => setMatrixSize(value[0])}
                min={4}
                max={12}
                step={2}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{matrixSize}×{matrixSize}</span>
            </div>
            
            <div>
              <label className="text-sm font-medium">Task Granularity</label>
              <Slider
                value={[taskGranularity]}
                onValueChange={(value) => setTaskGranularity(value[0])}
                min={1}
                max={4}
                step={1}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{taskGranularity} rows/task</span>
            </div>

            <div>
              <label className="text-sm font-medium">Thread Count</label>
              <Slider
                value={[threads]}
                onValueChange={(value) => setThreads(value[0])}
                min={1}
                max={8}
                step={1}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{threads} threads</span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startSimulation}
                disabled={isRunning && currentStep === 0}
                variant="default"
                size="sm"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Matrix Addition Visualization</CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch as OpenMP tasks execute in parallel to compute C = A + B
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {renderMatrix(matrixA, 'Matrix A')}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">+</span>
            </div>
            {renderMatrix(matrixB, 'Matrix B')}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">=</span>
            </div>
            {renderMatrix(matrixC, 'Matrix C (Result)')}
          </div>

          {/* Task Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Task Status</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex justify-between items-center p-2 rounded text-xs
                      ${task.status === 'pending' ? 'bg-task-pending/20' : ''}
                      ${task.status === 'running' ? 'bg-task-running/20' : ''}
                      ${task.status === 'completed' ? 'bg-task-completed/20' : ''}
                    `}
                  >
                    <span>Task {task.id} (rows {task.rowStart}-{task.rowEnd})</span>
                    <span className="capitalize">{task.status}</span>
                    {task.threadId >= 0 && <span>Thread {task.threadId}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Performance Metrics</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Serial Execution (est.)</span>
                    <span>{performance.serial}ms</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="performance-bar h-2 rounded-full opacity-50"
                      style={{ width: performance.serial > 0 ? '100%' : '0%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Parallel Execution</span>
                    <span>{performance.parallel}ms</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="performance-bar h-2 rounded-full"
                      style={{ 
                        width: performance.parallel > 0 && performance.serial > 0 
                          ? `${(performance.parallel / performance.serial) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
                {performance.serial > 0 && performance.parallel > 0 && (
                  <div className="text-xs text-primary font-bold">
                    Speedup: {(performance.serial / performance.parallel).toFixed(2)}x
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixVisualization;
