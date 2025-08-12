
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Square, RotateCcw, Clock, Cpu } from 'lucide-react';

interface MatrixCell {
  value: number;
  status: 'idle' | 'processing' | 'completed';
}

interface ProcessingStep {
  type: 'serial' | 'parallel';
  rowIndex: number;
  colIndex: number;
  timestamp: number;
  threadId?: number;
}

const SerialVsParallelDemo: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState(4);
  const [matrixA, setMatrixA] = useState<MatrixCell[][]>([]);
  const [matrixB, setMatrixB] = useState<MatrixCell[][]>([]);
  const [matrixC, setMatrixC] = useState<MatrixCell[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'serial' | 'parallel' | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionTime, setExecutionTime] = useState({ serial: 0, parallel: 0 });

  // Initialize matrices
  useEffect(() => {
    initializeMatrices();
  }, [matrixSize]);

  const initializeMatrices = () => {
    const createMatrix = (): MatrixCell[][] => {
      return Array(matrixSize).fill(null).map(() =>
        Array(matrixSize).fill(null).map(() => ({
          value: Math.floor(Math.random() * 9) + 1,
          status: 'idle' as const
        }))
      );
    };

    setMatrixA(createMatrix());
    setMatrixB(createMatrix());
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const
      }))
    ));
    setProcessingSteps([]);
    setCurrentStepIndex(0);
  };

  const runSerialExecution = async () => {
    setIsRunning(true);
    setCurrentMode('serial');
    const startTime = Date.now();
    
    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const
      }))
    ));

    // Process each cell sequentially
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        // Mark current cell as processing
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => ({
            ...cell,
            status: rowIdx === i && colIdx === j ? 'processing' : cell.status
          }))
        ));

        await new Promise(resolve => setTimeout(resolve, 300));

        // Complete the calculation and mark as completed
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (rowIdx === i && colIdx === j) {
              return {
                value: matrixA[i][j].value + matrixB[i][j].value,
                status: 'completed' as const
              };
            }
            return cell;
          })
        ));

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const endTime = Date.now();
    setExecutionTime(prev => ({ ...prev, serial: endTime - startTime }));
    setIsRunning(false);
    setCurrentMode(null);
  };

  const runParallelExecution = async () => {
    setIsRunning(true);
    setCurrentMode('parallel');
    const startTime = Date.now();
    
    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const
      }))
    ));

    // Simulate parallel execution with 2 threads
    const threads = 2;
    const rowsPerThread = Math.ceil(matrixSize / threads);
    
    const executeThread = async (threadId: number, startRow: number, endRow: number) => {
      for (let i = startRow; i < Math.min(endRow, matrixSize); i++) {
        for (let j = 0; j < matrixSize; j++) {
          // Mark current cell as processing
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => ({
              ...cell,
              status: rowIdx === i && colIdx === j ? 'processing' : cell.status
            }))
          ));

          await new Promise(resolve => setTimeout(resolve, 200));

          // Complete the calculation
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (rowIdx === i && colIdx === j) {
                return {
                  value: matrixA[i][j].value + matrixB[i][j].value,
                  status: 'completed' as const
                };
              }
              return cell;
            })
          ));

          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    // Run threads in parallel
    const threadPromises = [];
    for (let t = 0; t < threads; t++) {
      const startRow = t * rowsPerThread;
      const endRow = (t + 1) * rowsPerThread;
      threadPromises.push(executeThread(t, startRow, endRow));
    }

    await Promise.all(threadPromises);

    const endTime = Date.now();
    setExecutionTime(prev => ({ ...prev, parallel: endTime - startTime }));
    setIsRunning(false);
    setCurrentMode(null);
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentMode(null);
    initializeMatrices();
    setExecutionTime({ serial: 0, parallel: 0 });
  };

  const renderMatrix = (matrix: MatrixCell[][], title: string) => (
    <div className="flex flex-col items-center space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div 
        className="grid gap-1" 
        style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}
      >
        {matrix.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`
                w-10 h-10 border border-border flex items-center justify-center text-xs font-bold rounded transition-all duration-300
                ${cell.status === 'idle' ? 'bg-secondary' : ''}
                ${cell.status === 'processing' ? 'bg-task-running text-white scale-110 shadow-lg' : ''}
                ${cell.status === 'completed' ? 'bg-task-completed text-white' : ''}
              `}
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
            <Cpu className="w-5 h-5" />
            Serial vs Parallel Execution Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Matrix Size</label>
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
            
            <div className="flex gap-2">
              <Button
                onClick={runSerialExecution}
                disabled={isRunning}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run Serial
              </Button>
              <Button
                onClick={runParallelExecution}
                disabled={isRunning}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                Run Parallel
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
          </div>
        </CardContent>
      </Card>

      {/* Execution Status */}
      {currentMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Execution: {currentMode === 'serial' ? 'Serial Processing' : 'Parallel Processing'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {currentMode === 'serial' 
                ? 'Processing one cell at a time sequentially' 
                : 'Processing multiple cells simultaneously using 2 threads'
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Matrix Addition Visualization</CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch how cells are processed differently in serial vs parallel execution
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8">
            {renderMatrix(matrixA, 'Matrix A')}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">+</span>
            </div>
            {renderMatrix(matrixB, 'Matrix B')}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">=</span>
            </div>
            {renderMatrix(matrixC, 'Result Matrix C')}
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      {(executionTime.serial > 0 || executionTime.parallel > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Serial Execution</span>
                  <span>{executionTime.serial}ms</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className="performance-bar h-2 rounded-full opacity-70"
                    style={{ width: executionTime.serial > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Parallel Execution</span>
                  <span>{executionTime.parallel}ms</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div 
                    className="performance-bar h-2 rounded-full"
                    style={{ 
                      width: executionTime.parallel > 0 && executionTime.serial > 0 
                        ? `${(executionTime.parallel / executionTime.serial) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
            {executionTime.serial > 0 && executionTime.parallel > 0 && (
              <div className="text-center mt-4">
                <div className="text-lg font-bold text-primary">
                  Speedup: {(executionTime.serial / executionTime.parallel).toFixed(2)}x faster
                </div>
                <div className="text-sm text-muted-foreground">
                  Parallel execution completed in {((1 - (executionTime.parallel / executionTime.serial)) * 100).toFixed(1)}% less time
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SerialVsParallelDemo;
