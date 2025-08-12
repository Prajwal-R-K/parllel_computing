
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Cpu, Grid, Code, BarChart } from 'lucide-react';

interface MatrixCell {
  value: number;
  status: 'idle' | 'processing' | 'completed';
  taskId?: number;
  threadId?: number;
}

interface ExecutionStep {
  type: string;
  description: string;
  activeThreads: number[];
  processingCells: { row: number; col: number; threadId: number }[];
  timestamp: number;
}

const MatrixAdditionExamples: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState(6);
  const [currentExample, setCurrentExample] = useState<'serial' | 'omp-for' | 'omp-tasks' | 'omp-sections'>('serial');
  const [isRunning, setIsRunning] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [matrixB, setMatrixB] = useState<number[][]>([]);
  const [matrixC, setMatrixC] = useState<MatrixCell[][]>([]);
  const [performance, setPerformance] = useState({ time: 0, efficiency: 0 });

  const threadColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    initializeMatrices();
  }, [matrixSize]);

  const initializeMatrices = () => {
    const createMatrix = (): number[][] => 
      Array(matrixSize).fill(null).map(() => 
        Array(matrixSize).fill(null).map(() => Math.floor(Math.random() * 10) + 1)
      );

    const createResultMatrix = (): MatrixCell[][] =>
      Array(matrixSize).fill(null).map(() =>
        Array(matrixSize).fill(null).map(() => ({
          value: 0,
          status: 'idle' as const
        }))
      );

    setMatrixA(createMatrix());
    setMatrixB(createMatrix());
    setMatrixC(createResultMatrix());
    setExecutionSteps([]);
    setCurrentStep(0);
  };

  const getCodeExample = (type: string) => {
    const examples = {
      serial: `// Serial Matrix Addition
void matrix_add_serial(int A[N][N], int B[N][N], int C[N][N]) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}`,
      'omp-for': `// OpenMP Parallel For
void matrix_add_parallel_for(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel for collapse(2)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}`,
      'omp-tasks': `// OpenMP Tasks
void matrix_add_tasks(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (int i = 0; i < N; i++) {
                #pragma omp task firstprivate(i)
                {
                    for (int j = 0; j < N; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
        }
    }
}`,
      'omp-sections': `// OpenMP Sections
void matrix_add_sections(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel sections
    {
        #pragma omp section
        {
            // Process first quarter
            for (int i = 0; i < N/2; i++)
                for (int j = 0; j < N/2; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
        #pragma omp section
        {
            // Process second quarter
            for (int i = 0; i < N/2; i++)
                for (int j = N/2; j < N; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
        // ... more sections
    }
}`
    };
    return examples[type] || '';
  };

  const runExample = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    const startTime = Date.now();
    
    switch (currentExample) {
      case 'serial':
        await runSerialExample();
        break;
      case 'omp-for':
        await runParallelForExample();
        break;
      case 'omp-tasks':
        await runTasksExample();
        break;
      case 'omp-sections':
        await runSectionsExample();
        break;
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;
    const theoreticalSerial = matrixSize * matrixSize * 50; // Estimated serial time
    const efficiency = Math.min(100, (theoreticalSerial / executionTime) * 100);
    
    setPerformance({ time: executionTime, efficiency });
    setIsRunning(false);
  };

  const runSerialExample = async () => {
    const steps: ExecutionStep[] = [];
    
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        steps.push({
          type: 'serial',
          description: `Processing cell [${i}][${j}] sequentially`,
          activeThreads: [1],
          processingCells: [{ row: i, col: j, threadId: 1 }],
          timestamp: Date.now()
        });

        setExecutionSteps(steps);
        setCurrentStep(steps.length - 1);

        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => ({
            ...cell,
            status: rowIdx === i && colIdx === j ? 'processing' : 
                   (rowIdx < i || (rowIdx === i && colIdx < j)) ? 'completed' : 'idle',
            value: rowIdx === i && colIdx === j ? matrixA[i][j] + matrixB[i][j] : cell.value,
            threadId: rowIdx === i && colIdx === j ? 1 : undefined
          }))
        ));

        await new Promise(resolve => setTimeout(resolve, 150));

        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => ({
            ...cell,
            status: (rowIdx < i || (rowIdx === i && colIdx <= j)) ? 'completed' : 'idle'
          }))
        ));

        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  };

  const runParallelForExample = async () => {
    const steps: ExecutionStep[] = [];
    const numThreads = 4;
    const cellsPerThread = Math.ceil((matrixSize * matrixSize) / numThreads);

    steps.push({
      type: 'parallel-init',
      description: 'Creating parallel region with OpenMP parallel for',
      activeThreads: Array.from({ length: numThreads }, (_, i) => i + 1),
      processingCells: [],
      timestamp: Date.now()
    });

    setExecutionSteps(steps);
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 500));

    const allCells = [];
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        allCells.push({ row: i, col: j });
      }
    }

    // Distribute cells among threads
    const threadWorkloads = Array.from({ length: numThreads }, () => []);
    allCells.forEach((cell, index) => {
      const threadId = index % numThreads;
      threadWorkloads[threadId].push(cell);
    });

    // Process in parallel waves
    const maxCellsInWave = Math.max(...threadWorkloads.map(w => w.length));
    
    for (let wave = 0; wave < maxCellsInWave; wave++) {
      const currentProcessing = [];
      
      for (let threadId = 0; threadId < numThreads; threadId++) {
        if (threadWorkloads[threadId][wave]) {
          const { row, col } = threadWorkloads[threadId][wave];
          currentProcessing.push({ row, col, threadId: threadId + 1 });
        }
      }

      if (currentProcessing.length === 0) break;

      steps.push({
        type: 'parallel-for',
        description: `Wave ${wave + 1}: ${currentProcessing.length} threads processing simultaneously`,
        activeThreads: currentProcessing.map(p => p.threadId),
        processingCells: currentProcessing,
        timestamp: Date.now()
      });

      setExecutionSteps(steps);
      setCurrentStep(steps.length - 1);

      setMatrixC(prev => prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const processing = currentProcessing.find(p => p.row === rowIdx && p.col === colIdx);
          if (processing) {
            return {
              ...cell,
              status: 'processing',
              value: matrixA[rowIdx][colIdx] + matrixB[rowIdx][colIdx],
              threadId: processing.threadId
            };
          }
          return cell;
        })
      ));

      await new Promise(resolve => setTimeout(resolve, 400));

      setMatrixC(prev => prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const processing = currentProcessing.find(p => p.row === rowIdx && p.col === colIdx);
          return processing ? { ...cell, status: 'completed' } : cell;
        })
      ));

      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const runTasksExample = async () => {
    const steps: ExecutionStep[] = [];
    const numThreads = 4;

    // Step 1: Create parallel region
    steps.push({
      type: 'task-init',
      description: 'Creating parallel region and thread team',
      activeThreads: Array.from({ length: numThreads }, (_, i) => i + 1),
      processingCells: [],
      timestamp: Date.now()
    });

    setExecutionSteps(steps);
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 2: Single thread creates tasks
    steps.push({
      type: 'task-creation',
      description: 'Single thread creating tasks (one per row)',
      activeThreads: [1],
      processingCells: [],
      timestamp: Date.now()
    });

    setExecutionSteps(steps);
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 3: Dynamic task execution
    const tasks = Array.from({ length: matrixSize }, (_, i) => ({
      rowIndex: i,
      status: 'pending'
    }));

    let completedTasks = 0;
    while (completedTasks < matrixSize) {
      const availableThreads = Array.from({ length: numThreads }, (_, i) => i + 1);
      const currentlyProcessing = [];

      // Assign tasks to available threads
      for (let threadId = 0; threadId < Math.min(numThreads, matrixSize - completedTasks); threadId++) {
        const taskIndex = completedTasks + threadId;
        if (taskIndex < matrixSize) {
          currentlyProcessing.push({
            threadId: threadId + 1,
            rowIndex: taskIndex,
            taskId: taskIndex + 1
          });
        }
      }

      if (currentlyProcessing.length === 0) break;

      steps.push({
        type: 'task-execution',
        description: `Tasks running: ${currentlyProcessing.map(p => `Row ${p.rowIndex}`).join(', ')}`,
        activeThreads: currentlyProcessing.map(p => p.threadId),
        processingCells: currentlyProcessing.flatMap(p => 
          Array.from({ length: matrixSize }, (_, j) => ({ 
            row: p.rowIndex, 
            col: j, 
            threadId: p.threadId 
          }))
        ),
        timestamp: Date.now()
      });

      setExecutionSteps(steps);
      setCurrentStep(steps.length - 1);

      // Update matrix with processing status
      setMatrixC(prev => prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const processing = currentlyProcessing.find(p => p.rowIndex === rowIdx);
          if (processing) {
            return {
              ...cell,
              status: 'processing',
              value: matrixA[rowIdx][colIdx] + matrixB[rowIdx][colIdx],
              threadId: processing.threadId,
              taskId: processing.taskId
            };
          }
          return cell;
        })
      ));

      await new Promise(resolve => setTimeout(resolve, 600));

      // Complete tasks
      setMatrixC(prev => prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const processing = currentlyProcessing.find(p => p.rowIndex === rowIdx);
          return processing ? { ...cell, status: 'completed' } : cell;
        })
      ));

      completedTasks += currentlyProcessing.length;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const runSectionsExample = async () => {
    const steps: ExecutionStep[] = [];
    const numSections = 4;
    const halfSize = Math.floor(matrixSize / 2);

    const sections = [
      { name: 'Top-Left', rowStart: 0, rowEnd: halfSize, colStart: 0, colEnd: halfSize },
      { name: 'Top-Right', rowStart: 0, rowEnd: halfSize, colStart: halfSize, colEnd: matrixSize },
      { name: 'Bottom-Left', rowStart: halfSize, rowEnd: matrixSize, colStart: 0, colEnd: halfSize },
      { name: 'Bottom-Right', rowStart: halfSize, rowEnd: matrixSize, colStart: halfSize, colEnd: matrixSize }
    ];

    steps.push({
      type: 'sections-init',
      description: 'Creating parallel sections, each handled by different threads',
      activeThreads: Array.from({ length: numSections }, (_, i) => i + 1),
      processingCells: [],
      timestamp: Date.now()
    });

    setExecutionSteps(steps);
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Process all sections simultaneously
    const allProcessingCells = [];
    sections.forEach((section, sectionIndex) => {
      for (let i = section.rowStart; i < section.rowEnd; i++) {
        for (let j = section.colStart; j < section.colEnd; j++) {
          allProcessingCells.push({ row: i, col: j, threadId: sectionIndex + 1 });
        }
      }
    });

    steps.push({
      type: 'sections-execution',
      description: 'All sections processing simultaneously',
      activeThreads: Array.from({ length: numSections }, (_, i) => i + 1),
      processingCells: allProcessingCells,
      timestamp: Date.now()
    });

    setExecutionSteps(steps);
    setCurrentStep(1);

    setMatrixC(prev => prev.map((row, rowIdx) =>
      row.map((cell, colIdx) => {
        const processing = allProcessingCells.find(p => p.row === rowIdx && p.col === colIdx);
        if (processing) {
          return {
            ...cell,
            status: 'processing',
            value: matrixA[rowIdx][colIdx] + matrixB[rowIdx][colIdx],
            threadId: processing.threadId
          };
        }
        return cell;
      })
    ));

    await new Promise(resolve => setTimeout(resolve, 1500));

    setMatrixC(prev => prev.map(row =>
      row.map(cell => ({ ...cell, status: 'completed' }))
    ));
  };

  const resetExample = () => {
    setIsRunning(false);
    initializeMatrices();
    setPerformance({ time: 0, efficiency: 0 });
  };

  const renderMatrix = (matrix: number[][] | MatrixCell[][], title: string, isResult = false) => (
    <div className="flex flex-col items-center space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div 
        className="grid gap-1" 
        style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}
      >
        {matrix.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const cellValue = typeof cell === 'number' ? cell : cell.value;
            const cellStatus = typeof cell === 'number' ? 'idle' : cell.status;
            const threadId = typeof cell === 'number' ? undefined : cell.threadId;
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`
                  w-8 h-8 border border-border flex items-center justify-center text-xs font-bold rounded transition-all duration-300
                  ${cellStatus === 'idle' ? 'bg-secondary' : ''}
                  ${cellStatus === 'processing' ? 'bg-task-running text-white scale-110 shadow-lg' : ''}
                  ${cellStatus === 'completed' ? 'bg-task-completed text-white' : ''}
                `}
                style={{
                  backgroundColor: cellStatus === 'processing' && threadId ? 
                    threadColors[threadId - 1] : undefined
                }}
              >
                {cellValue}
              </div>
            );
          })
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
            <Grid className="w-5 h-5" />
            Matrix Addition - Different Parallelism Approaches
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
                max={8}
                step={1}
                disabled={isRunning}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{matrixSize}×{matrixSize}</span>
            </div>
            
            <div className="col-span-3">
              <label className="text-sm font-medium">Parallelism Type</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { key: 'serial', label: 'Serial', desc: 'Sequential execution' },
                  { key: 'omp-for', label: 'OpenMP For', desc: 'Parallel loops' },
                  { key: 'omp-tasks', label: 'OpenMP Tasks', desc: 'Task-based parallel' },
                  { key: 'omp-sections', label: 'OpenMP Sections', desc: 'Section-based parallel' }
                ].map((type) => (
                  <Button
                    key={type.key}
                    variant={currentExample === type.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentExample(type.key as any)}
                    disabled={isRunning}
                    className="flex flex-col h-auto p-2"
                  >
                    <span className="text-xs font-semibold">{type.label}</span>
                    <span className="text-xs opacity-70">{type.desc}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={runExample}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Running' : 'Start Example'}
            </Button>
            <Button
              onClick={resetExample}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visualization">Live Visualization</TabsTrigger>
          <TabsTrigger value="code">Code Example</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matrix Addition Visualization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Watch how different parallelism approaches process the matrix addition
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
                {renderMatrix(matrixC, 'Result Matrix C', true)}
              </div>

              {/* Current Step Display */}
              {executionSteps.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Execution Progress</h4>
                    <Badge>Step {currentStep + 1} of {executionSteps.length}</Badge>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm">{executionSteps[currentStep]?.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Active Threads:</span>
                      {executionSteps[currentStep]?.activeThreads.map(threadId => (
                        <Badge key={threadId} variant="outline" className="text-xs">
                          Thread {threadId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {currentExample.toUpperCase()} Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-card border rounded-lg">
                <div className="border-b p-3 bg-muted">
                  <span className="text-sm font-medium">C Code with OpenMP</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm">
                  <code>{getCodeExample(currentExample)}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Execution Time</span>
                    <span>{performance.time}ms</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                    <div 
                      className="performance-bar h-2 rounded-full"
                      style={{ width: `${Math.min(100, performance.time / 50)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Parallel Efficiency</span>
                    <span>{performance.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                    <div 
                      className="performance-bar h-2 rounded-full"
                      style={{ width: `${performance.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <h4 className="font-semibold">Approach Characteristics:</h4>
                {currentExample === 'serial' && (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Single-threaded execution</li>
                    <li>• Predictable, sequential processing</li>
                    <li>• No parallelization overhead</li>
                    <li>• Limited by single core performance</li>
                  </ul>
                )}
                {currentExample === 'omp-for' && (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Loop iterations distributed among threads</li>
                    <li>• Static or dynamic scheduling</li>
                    <li>• Good for regular, uniform workloads</li>
                    <li>• Low overhead for large loops</li>
                  </ul>
                )}
                {currentExample === 'omp-tasks' && (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Dynamic task creation and scheduling</li>
                    <li>• Work-stealing for load balancing</li>
                    <li>• Flexible for irregular workloads</li>
                    <li>• Higher overhead but better scalability</li>
                  </ul>
                )}
                {currentExample === 'omp-sections' && (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Predefined work sections</li>
                    <li>• Static load distribution</li>
                    <li>• Good for heterogeneous tasks</li>
                    <li>• Limited scalability</li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatrixAdditionExamples;
