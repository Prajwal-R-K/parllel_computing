
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Settings, Clock, Users } from 'lucide-react';

interface MatrixCell {
  value: number;
  status: 'idle' | 'assigned' | 'processing' | 'completed';
  taskId?: number;
  threadId?: number;
}

interface TaskInfo {
  id: number;
  type: 'element' | 'row';
  position: string;
  status: 'pending' | 'assigned' | 'executing' | 'completed';
  threadId?: number;
  startTime?: number;
  endTime?: number;
}

interface ThreadInfo {
  id: number;
  status: 'idle' | 'working' | 'finished';
  currentTask?: string;
  tasksCompleted: number;
  color: string;
}

const MatrixVisualization: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState(4);
  const [taskGranularity, setTaskGranularity] = useState('element');
  const [numThreads, setNumThreads] = useState(4);
  const [speed, setSpeed] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [matrixB, setMatrixB] = useState<number[][]>([]);
  const [matrixC, setMatrixC] = useState<MatrixCell[][]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [performance, setPerformance] = useState({ executionTime: 0, tasksCompleted: 0 });

  const threadColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Initialize matrices and data
  useEffect(() => {
    initializeData();
  }, [matrixSize, numThreads, taskGranularity]);

  const initializeData = () => {
    // Initialize matrices with random values
    const newMatrixA = Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => Math.floor(Math.random() * 9) + 1)
    );
    const newMatrixB = Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => Math.floor(Math.random() * 9) + 1)
    );
    const newMatrixC = Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        taskId: undefined,
        threadId: undefined
      }))
    );

    setMatrixA(newMatrixA);
    setMatrixB(newMatrixB);
    setMatrixC(newMatrixC);

    // Initialize threads
    const newThreads: ThreadInfo[] = Array(numThreads).fill(null).map((_, i) => ({
      id: i,
      status: 'idle',
      tasksCompleted: 0,
      color: threadColors[i % threadColors.length]
    }));
    setThreads(newThreads);

    // Create tasks based on granularity
    const newTasks: TaskInfo[] = [];
    let taskId = 0;

    if (taskGranularity === 'element') {
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          newTasks.push({
            id: taskId++,
            type: 'element',
            position: `C[${i}][${j}]`,
            status: 'pending'
          });
        }
      }
    } else {
      for (let i = 0; i < matrixSize; i++) {
        newTasks.push({
          id: taskId++,
          type: 'row',
          position: `Row ${i}`,
          status: 'pending'
        });
      }
    }

    setTasks(newTasks);
    setExecutionLog([]);
    setPerformance({ executionTime: 0, tasksCompleted: 0 });
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startSimulation = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const startTime = Date.now();
    
    addLog(`🚀 Starting ${taskGranularity}-based parallelism with ${numThreads} threads`);
    addLog(`📝 Thread 0 creating ${tasks.length} tasks in parallel region...`);

    // Reset matrices
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        taskId: undefined,
        threadId: undefined
      }))
    ));

    // Create task queue
    const taskQueue = [...tasks];
    const runningTasks: { [threadId: number]: TaskInfo } = {};
    let completedTasks = 0;

    // Main execution loop
    while (completedTasks < tasks.length) {
      // Assign tasks to idle threads
      for (let threadId = 0; threadId < numThreads; threadId++) {
        if (!(threadId in runningTasks) && taskQueue.length > 0) {
          const task = taskQueue.shift()!;
          task.status = 'assigned';
          task.threadId = threadId;
          task.startTime = Date.now();
          runningTasks[threadId] = task;

          // Update thread status
          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, status: 'working', currentTask: task.position }
              : t
          ));

          // Update matrix cells
          if (task.type === 'element') {
            const [i, j] = task.position.match(/\d+/g)!.map(Number);
            setMatrixC(prev => prev.map((row, rowIdx) =>
              row.map((cell, colIdx) => 
                rowIdx === i && colIdx === j 
                  ? { ...cell, status: 'assigned', threadId, taskId: task.id }
                  : cell
              )
            ));
          } else {
            const rowIndex = parseInt(task.position.split(' ')[1]);
            setMatrixC(prev => prev.map((row, rowIdx) =>
              rowIdx === rowIndex 
                ? row.map(cell => ({ ...cell, status: 'assigned', threadId, taskId: task.id }))
                : row
            ));
          }

          addLog(`🎯 Thread ${threadId} assigned ${task.position}`);
        }
      }

      await delay(speed / 4);

      // Execute assigned tasks
      for (const [threadIdStr, task] of Object.entries(runningTasks)) {
        const threadId = parseInt(threadIdStr);
        if (task.status === 'assigned') {
          task.status = 'executing';
          
          if (task.type === 'element') {
            const [i, j] = task.position.match(/\d+/g)!.map(Number);
            const result = matrixA[i][j] + matrixB[i][j];
            
            setMatrixC(prev => prev.map((row, rowIdx) =>
              row.map((cell, colIdx) => 
                rowIdx === i && colIdx === j 
                  ? { ...cell, status: 'processing', value: result }
                  : cell
              )
            ));
            
            addLog(`⚡ Thread ${threadId} executing ${task.position}: ${matrixA[i][j]} + ${matrixB[i][j]} = ${result}`);
          } else {
            const rowIndex = parseInt(task.position.split(' ')[1]);
            
            setMatrixC(prev => prev.map((row, rowIdx) =>
              rowIdx === rowIndex 
                ? row.map((cell, colIdx) => ({ 
                    ...cell, 
                    status: 'processing',
                    value: matrixA[rowIdx][colIdx] + matrixB[rowIdx][colIdx]
                  }))
                : row
            ));
            
            addLog(`⚡ Thread ${threadId} processing ${task.position}`);
            
            // Show individual element computation for row-based
            for (let j = 0; j < matrixSize; j++) {
              await delay(speed / (matrixSize * 4));
              addLog(`   Thread ${threadId}: C[${rowIndex}][${j}] = ${matrixA[rowIndex][j]} + ${matrixB[rowIndex][j]} = ${matrixA[rowIndex][j] + matrixB[rowIndex][j]}`);
            }
          }
        }
      }

      await delay(speed);

      // Complete tasks
      for (const [threadIdStr, task] of Object.entries(runningTasks)) {
        const threadId = parseInt(threadIdStr);
        
        if (task.status === 'executing' && Date.now() - task.startTime! >= speed) {
          task.status = 'completed';
          task.endTime = Date.now();
          completedTasks++;

          // Update matrix cells to completed
          if (task.type === 'element') {
            const [i, j] = task.position.match(/\d+/g)!.map(Number);
            setMatrixC(prev => prev.map((row, rowIdx) =>
              row.map((cell, colIdx) => 
                rowIdx === i && colIdx === j 
                  ? { ...cell, status: 'completed' }
                  : cell
              )
            ));
          } else {
            const rowIndex = parseInt(task.position.split(' ')[1]);
            setMatrixC(prev => prev.map((row, rowIdx) =>
              rowIdx === rowIndex 
                ? row.map(cell => ({ ...cell, status: 'completed' }))
                : row
            ));
          }

          // Update thread status
          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, status: 'idle', currentTask: undefined, tasksCompleted: t.tasksCompleted + 1 }
              : t
          ));

          addLog(`✅ Thread ${threadId} completed ${task.position}`);
          delete runningTasks[threadId];
        }
      }

      // Update tasks display
      setTasks(prev => prev.map(t => {
        const found = Object.values(runningTasks).find(rt => rt.id === t.id);
        return found || t;
      }));

      await delay(speed / 8);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    setPerformance({
      executionTime: totalTime,
      tasksCompleted: completedTasks
    });

    addLog(`🏁 ${taskGranularity}-based parallelism completed in ${totalTime}ms`);
    addLog(`📊 Total tasks completed: ${completedTasks}`);
    
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    initializeData();
  };

  const renderMatrix = (matrix: number[][] | MatrixCell[][], title: string, isResult = false) => (
    <div className="flex flex-col items-center space-y-2">
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      <div 
        className="grid gap-1" 
        style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}
      >
        {matrix.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const cellValue = typeof cell === 'number' ? cell : cell.value;
            const cellStatus = typeof cell === 'number' ? 'idle' : cell.status;
            const threadId = typeof cell === 'number' ? undefined : cell.threadId;
            const threadColor = threadId !== undefined ? threadColors[threadId % threadColors.length] : undefined;
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`
                  w-10 h-10 border border-border flex items-center justify-center text-xs font-bold rounded transition-all duration-500 relative
                  ${cellStatus === 'idle' ? 'bg-muted text-muted-foreground' : ''}
                  ${cellStatus === 'assigned' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                  ${cellStatus === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-300 scale-110 shadow-lg' : ''}
                  ${cellStatus === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                `}
                style={{
                  backgroundColor: cellStatus === 'processing' && threadColor ? `${threadColor}20` : undefined,
                  borderColor: cellStatus === 'processing' && threadColor ? threadColor : undefined,
                  color: cellStatus === 'processing' && threadColor ? threadColor : undefined
                }}
              >
                {cellValue}
                {isResult && threadId !== undefined && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: threadColor }}
                  >
                    {threadId}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-background via-muted/20 to-background p-6 rounded-lg">
      {/* Controls */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5 text-primary" />
            OpenMP Task Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Matrix Size</label>
              <Slider
                value={[matrixSize]}
                onValueChange={(value) => setMatrixSize(value[0])}
                min={3}
                max={6}
                step={1}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{matrixSize}×{matrixSize}</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Task Granularity</label>
              <select
                value={taskGranularity}
                onChange={(e) => setTaskGranularity(e.target.value)}
                disabled={isRunning}
                className="mt-2 w-full px-3 py-1 text-sm border border-border rounded-md bg-background"
              >
                <option value="element">Element-based</option>
                <option value="row">Row-based</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Number of Threads</label>
              <Slider
                value={[numThreads]}
                onValueChange={(value) => setNumThreads(value[0])}
                min={2}
                max={8}
                step={1}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{numThreads} threads</span>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Animation Speed</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={200}
                max={2000}
                step={100}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{speed}ms delay</span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={startSimulation}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Running...' : 'Start Simulation'}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thread Status */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Thread Status Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {threads.map(thread => (
              <div
                key={thread.id}
                className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${thread.status === 'idle' ? 'bg-muted border-muted-foreground/20' : ''}
                  ${thread.status === 'working' ? 'bg-blue-50 border-blue-200 shadow-md' : ''}
                `}
                style={{
                  backgroundColor: thread.status === 'working' ? `${thread.color}10` : undefined,
                  borderColor: thread.status === 'working' ? thread.color : undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: thread.color }}
                  />
                  <span className="font-semibold text-sm text-foreground">Thread {thread.id}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: <Badge variant={thread.status === 'working' ? 'default' : 'secondary'} className="ml-1">
                    {thread.status}
                  </Badge>
                </div>
                {thread.currentTask && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Task: {thread.currentTask}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Completed: {thread.tasksCompleted}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Visualization */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Matrix Visualization</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              {taskGranularity === 'element' ? 'Element-based Tasks' : 'Row-based Tasks'}
            </Badge>
            {performance.executionTime > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {performance.executionTime}ms
              </Badge>
            )}
          </div>
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
            {renderMatrix(matrixC, 'Result Matrix C', true)}
          </div>
        </CardContent>
      </Card>

      {/* Execution Log */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            Execution Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm">
            {executionLog.length === 0 ? (
              <div className="text-muted-foreground italic">Click "Start Simulation" to see execution details...</div>
            ) : (
              executionLog.map((log, index) => (
                <div key={index} className="text-foreground mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixVisualization;
