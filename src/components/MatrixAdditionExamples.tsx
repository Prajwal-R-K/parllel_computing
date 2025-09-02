import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Clock, Cpu, Users, Zap, Grid, Layers } from 'lucide-react';

interface MatrixCell {
  value: number;
  status: 'idle' | 'assigned' | 'processing' | 'completed';
  threadId?: number;
  taskId?: number;
  sectionId?: number;
}

interface ThreadInfo {
  id: number;
  status: 'idle' | 'working' | 'finished' | 'creating-tasks';
  currentTask?: string;
  tasksCompleted: number;
  color: string;
}

interface TaskInfo {
  id: number;
  type: 'element' | 'row' | 'section';
  position: string;
  status: 'created' | 'assigned' | 'executing' | 'completed';
  threadId?: number;
  executionTime?: number;
}

const MatrixAdditionExamples: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState(4);
  const [numThreads, setNumThreads] = useState(4);
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [matrixB, setMatrixB] = useState<number[][]>([]);
  const [matrixC, setMatrixC] = useState<MatrixCell[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'serial' | 'parallel-for' | 'sections' | 'element-task' | 'row-task' | null>(null);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [speed, setSpeed] = useState(1000);

  const threadColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Initialize matrices and threads
  useEffect(() => {
    initializeData();
  }, [matrixSize, numThreads]);

  const initializeData = () => {
    // Initialize matrices
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
        threadId: undefined,
        taskId: undefined
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

    setTasks([]);
    setExecutionLog([]);
    setExecutionTime(0);
  };

  const addLog = (message: string) => {
    setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runSerialDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('serial');
    const startTime = Date.now();
    addLog('🚀 Starting Serial Matrix Addition');
    addLog('📊 Processing elements sequentially, one by one');

    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        threadId: 0,
        taskId: undefined
      }))
    ));

    // Set up single thread
    setThreads([{
      id: 0,
      status: 'working',
      currentTask: 'Sequential Processing',
      tasksCompleted: 0,
      color: threadColors[0]
    }]);

    // Process elements sequentially
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        // Mark cell as processing
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => 
            rowIdx === i && colIdx === j 
              ? { ...cell, status: 'processing', value: matrixA[i][j] + matrixB[i][j] }
              : cell
          )
        ));

        addLog(`⚡ Processing C[${i}][${j}] = ${matrixA[i][j]} + ${matrixB[i][j]} = ${matrixA[i][j] + matrixB[i][j]}`);
        await delay(speed / 2);

        // Mark as completed
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => 
            rowIdx === i && colIdx === j 
              ? { ...cell, status: 'completed' }
              : cell
          )
        ));
        await delay(speed / 4);
      }
    }

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    addLog(`🏁 Serial execution completed in ${endTime - startTime}ms`);
    setIsRunning(false);
    setCurrentDemo(null);
  };

  const runParallelForDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('parallel-for');
    const startTime = Date.now();
    addLog('🚀 Starting Parallel For Loop (#pragma omp parallel for collapse(2))');
    addLog(`📊 Distributing ${matrixSize * matrixSize} iterations across ${numThreads} threads`);

    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        threadId: undefined,
        taskId: undefined
      }))
    ));

    // Initialize threads
    const newThreads: ThreadInfo[] = Array(numThreads).fill(null).map((_, i) => ({
      id: i,
      status: 'working',
      tasksCompleted: 0,
      color: threadColors[i % threadColors.length],
      currentTask: 'Loop iterations'
    }));
    setThreads(newThreads);

    // Static distribution of iterations
    const totalIterations = matrixSize * matrixSize;
    const iterationsPerThread = Math.ceil(totalIterations / numThreads);
    
    addLog(`📋 Static distribution: ~${iterationsPerThread} iterations per thread`);

    // Process iterations in parallel chunks
    const allIterations: { i: number, j: number, threadId: number }[] = [];
    let iterationCount = 0;
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        const threadId = Math.floor(iterationCount / iterationsPerThread);
        allIterations.push({ i, j, threadId: Math.min(threadId, numThreads - 1) });
        iterationCount++;
      }
    }

    // Group by thread for parallel execution
    const threadWork: { [key: number]: { i: number, j: number }[] } = {};
    allIterations.forEach(({ i, j, threadId }) => {
      if (!threadWork[threadId]) threadWork[threadId] = [];
      threadWork[threadId].push({ i, j });
    });

    // Execute in parallel
    const threadPromises = Object.entries(threadWork).map(async ([threadIdStr, work]) => {
      const threadId = parseInt(threadIdStr);
      for (const { i, j } of work) {
        // Mark as assigned
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => 
            rowIdx === i && colIdx === j 
              ? { ...cell, status: 'assigned', threadId }
              : cell
          )
        ));
        
        await delay(speed / 8);
        
        // Process
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => 
            rowIdx === i && colIdx === j 
              ? { ...cell, status: 'processing', value: matrixA[i][j] + matrixB[i][j] }
              : cell
          )
        ));

        addLog(`⚡ Thread ${threadId}: C[${i}][${j}] = ${matrixA[i][j]} + ${matrixB[i][j]} = ${matrixA[i][j] + matrixB[i][j]}`);
        await delay(speed / 2);

        // Complete
        setMatrixC(prev => prev.map((row, rowIdx) =>
          row.map((cell, colIdx) => 
            rowIdx === i && colIdx === j 
              ? { ...cell, status: 'completed' }
              : cell
          )
        ));
        
        setThreads(prev => prev.map(t => 
          t.id === threadId 
            ? { ...t, tasksCompleted: t.tasksCompleted + 1 }
            : t
        ));
      }
    });

    await Promise.all(threadPromises);

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    addLog(`🏁 Parallel for loop completed in ${endTime - startTime}ms`);
    setIsRunning(false);
    setCurrentDemo(null);
  };

  const runSectionsDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('sections');
    const startTime = Date.now();
    addLog('🚀 Starting OpenMP Sections (#pragma omp parallel sections)');
    addLog(`📊 Dividing matrix into ${numThreads} predefined sections`);

    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        threadId: undefined,
        sectionId: undefined
      }))
    ));

    // Initialize threads
    const newThreads: ThreadInfo[] = Array(numThreads).fill(null).map((_, i) => ({
      id: i,
      status: 'working',
      tasksCompleted: 0,
      color: threadColors[i % threadColors.length],
      currentTask: `Section ${i}`
    }));
    setThreads(newThreads);

    // Define sections (quarters for 4 threads)
    const sections = [
      { id: 0, name: 'Top-Left', iStart: 0, iEnd: Math.ceil(matrixSize/2), jStart: 0, jEnd: Math.ceil(matrixSize/2) },
      { id: 1, name: 'Top-Right', iStart: 0, iEnd: Math.ceil(matrixSize/2), jStart: Math.ceil(matrixSize/2), jEnd: matrixSize },
      { id: 2, name: 'Bottom-Left', iStart: Math.ceil(matrixSize/2), iEnd: matrixSize, jStart: 0, jEnd: Math.ceil(matrixSize/2) },
      { id: 3, name: 'Bottom-Right', iStart: Math.ceil(matrixSize/2), iEnd: matrixSize, jStart: Math.ceil(matrixSize/2), jEnd: matrixSize }
    ].slice(0, numThreads);

    addLog(`📋 Created ${sections.length} sections for parallel execution`);

    // Execute sections in parallel
    const sectionPromises = sections.map(async (section, threadId) => {
      addLog(`🎯 Thread ${threadId} assigned to ${section.name} section`);
      
      for (let i = section.iStart; i < section.iEnd; i++) {
        for (let j = section.jStart; j < section.jEnd; j++) {
          // Mark as assigned
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => 
              rowIdx === i && colIdx === j 
                ? { ...cell, status: 'assigned', threadId, sectionId: section.id }
                : cell
            )
          ));
          
          await delay(speed / 6);
          
          // Process
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => 
              rowIdx === i && colIdx === j 
                ? { ...cell, status: 'processing', value: matrixA[i][j] + matrixB[i][j] }
                : cell
            )
          ));

          addLog(`⚡ Thread ${threadId} (${section.name}): C[${i}][${j}] = ${matrixA[i][j] + matrixB[i][j]}`);
          await delay(speed / 2);

          // Complete
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => 
              rowIdx === i && colIdx === j 
                ? { ...cell, status: 'completed' }
                : cell
            )
          ));
          
          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, tasksCompleted: t.tasksCompleted + 1 }
              : t
          ));
        }
      }
      addLog(`✅ Thread ${threadId} completed ${section.name} section`);
    });

    await Promise.all(sectionPromises);

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    addLog(`🏁 Sections-based parallelism completed in ${endTime - startTime}ms`);
    setIsRunning(false);
    setCurrentDemo(null);
  };

  const runElementBasedDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('element-task');
    const startTime = Date.now();
    addLog('🚀 Starting Element-based Task Parallelism');
    addLog(`📊 Thread 0 will create ${matrixSize * matrixSize} tasks (one per element)`);
    addLog('🏗️ #pragma omp single - Thread 0 creating all tasks...');

    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        threadId: undefined,
        taskId: undefined
      }))
    ));

    // Initialize threads - Thread 0 starts as task creator
    const newThreads: ThreadInfo[] = Array(numThreads).fill(null).map((_, i) => ({
      id: i,
      status: i === 0 ? 'creating-tasks' : 'idle',
      tasksCompleted: 0,
      color: threadColors[i % threadColors.length],
      currentTask: i === 0 ? 'Creating tasks' : undefined
    }));
    setThreads(newThreads);

    // Phase 1: Thread 0 creates all tasks
    addLog('📝 Thread 0 in #pragma omp single region - creating task pool...');
    const allTasks: TaskInfo[] = [];
    let taskId = 0;
    
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        allTasks.push({
          id: taskId++,
          type: 'element',
          position: `C[${i}][${j}]`,
          status: 'created',
          executionTime: Math.random() * 200 + 100
        });
        
        // Show task creation progress
        if (taskId % Math.max(1, Math.floor(matrixSize * matrixSize / 5)) === 0) {
          await delay(speed / 8);
          addLog(`📋 Thread 0: Created ${taskId} tasks so far...`);
        }
      }
    }
    
    setTasks(allTasks);
    addLog(`✅ Thread 0: All ${allTasks.length} tasks created and added to shared task pool`);
    addLog('🚦 Task creation complete - all threads now participate in task execution');

    // Phase 2: All threads (including Thread 0) now execute tasks
    setThreads(prev => prev.map(t => ({ ...t, status: 'idle', currentTask: undefined })));
    await delay(speed / 2);

    let completedTasks = 0;
    const availableThreads = [...Array(numThreads).keys()];
    const runningTasks: { [key: number]: { taskIndex: number; startTime: number } } = {};

    while (completedTasks < allTasks.length) {
      // Assign tasks to available threads (including Thread 0)
      for (const threadId of availableThreads) {
        if (!(threadId in runningTasks)) {
          const nextTaskIndex = allTasks.findIndex(task => task.status === 'created');
          if (nextTaskIndex !== -1) {
            const task = allTasks[nextTaskIndex];
            const [i, j] = task.position.match(/\d+/g)!.map(Number);
            
            task.status = 'assigned';
            task.threadId = threadId;
            runningTasks[threadId] = { taskIndex: nextTaskIndex, startTime: Date.now() };
            
            setThreads(prev => prev.map(t => 
              t.id === threadId 
                ? { ...t, status: 'working', currentTask: task.position }
                : t
            ));

            setMatrixC(prev => prev.map((row, rowIdx) =>
              row.map((cell, colIdx) => 
                rowIdx === i && colIdx === j 
                  ? { ...cell, status: 'assigned', threadId, taskId: task.id }
                  : cell
              )
            ));

            addLog(`🎯 Thread ${threadId} grabbed task ${task.position} from shared pool`);
            setTasks([...allTasks]);
          }
        }
      }

      await delay(speed / 4);

      // Process assigned tasks
      for (const [threadId, taskInfo] of Object.entries(runningTasks)) {
        const task = allTasks[taskInfo.taskIndex];
        if (task.status === 'assigned') {
          task.status = 'executing';
          const [i, j] = task.position.match(/\d+/g)!.map(Number);
          
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => 
              rowIdx === i && colIdx === j 
                ? { ...cell, status: 'processing', value: matrixA[i][j] + matrixB[i][j] }
                : cell
            )
          ));
          
          addLog(`⚡ Thread ${threadId} executing ${task.position}: ${matrixA[i][j]} + ${matrixB[i][j]} = ${matrixA[i][j] + matrixB[i][j]}`);
        }
      }

      await delay(speed);

      // Complete tasks
      for (const [threadIdStr, taskInfo] of Object.entries(runningTasks)) {
        const threadId = parseInt(threadIdStr);
        if (Date.now() - taskInfo.startTime >= (allTasks[taskInfo.taskIndex].executionTime! * speed / 1000)) {
          const task = allTasks[taskInfo.taskIndex];
          const [i, j] = task.position.match(/\d+/g)!.map(Number);
          
          task.status = 'completed';
          completedTasks++;
          
          setMatrixC(prev => prev.map((row, rowIdx) =>
            row.map((cell, colIdx) => 
              rowIdx === i && colIdx === j 
                ? { ...cell, status: 'completed' }
                : cell
            )
          ));

          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, status: 'idle', currentTask: undefined, tasksCompleted: t.tasksCompleted + 1 }
              : t
          ));

          addLog(`✅ Thread ${threadId} completed ${task.position}`);
          delete runningTasks[threadId];
        }
      }

      setTasks([...allTasks]);
      await delay(speed / 4);
    }

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    addLog(`🏁 Element-based task parallelism completed in ${endTime - startTime}ms`);
    addLog(`📊 All ${numThreads} threads participated in task execution (including task creator)`);
    setIsRunning(false);
    setCurrentDemo(null);
  };

  const runRowBasedDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('row-task');
    const startTime = Date.now();
    addLog('🚀 Starting Row-based Task Parallelism');
    addLog(`📊 Thread 0 will create ${matrixSize} tasks (one per row)`);
    addLog('🏗️ #pragma omp single - Thread 0 creating all row tasks...');

    // Reset matrix C
    setMatrixC(Array(matrixSize).fill(null).map(() =>
      Array(matrixSize).fill(null).map(() => ({
        value: 0,
        status: 'idle' as const,
        threadId: undefined,
        taskId: undefined
      }))
    ));

    // Initialize threads - Thread 0 starts as task creator
    const newThreads: ThreadInfo[] = Array(numThreads).fill(null).map((_, i) => ({
      id: i,
      status: i === 0 ? 'creating-tasks' : 'idle',
      tasksCompleted: 0,
      color: threadColors[i % threadColors.length],
      currentTask: i === 0 ? 'Creating row tasks' : undefined
    }));
    setThreads(newThreads);

    // Phase 1: Thread 0 creates all row tasks
    addLog('📝 Thread 0 in #pragma omp single region - creating row task pool...');
    const rowTasks: TaskInfo[] = [];
    
    for (let i = 0; i < matrixSize; i++) {
      rowTasks.push({
        id: i,
        type: 'row',
        position: `Row ${i}`,
        status: 'created',
        executionTime: Math.random() * 500 + 300
      });
      
      await delay(speed / 6);
      addLog(`📋 Thread 0: Created task for Row ${i}`);
    }
    
    setTasks(rowTasks);
    addLog(`✅ Thread 0: All ${rowTasks.length} row tasks created and added to shared task pool`);
    addLog('🚦 Task creation complete - all threads now participate in row processing');

    // Phase 2: All threads (including Thread 0) now execute row tasks
    setThreads(prev => prev.map(t => ({ ...t, status: 'idle', currentTask: undefined })));
    await delay(speed / 2);

    let completedTasks = 0;
    const availableThreads = [...Array(numThreads).keys()];
    const runningTasks: { [key: number]: { taskIndex: number; startTime: number } } = {};

    while (completedTasks < rowTasks.length) {
      // Assign row tasks to available threads (including Thread 0)
      for (const threadId of availableThreads) {
        if (!(threadId in runningTasks)) {
          const nextTaskIndex = rowTasks.findIndex(task => task.status === 'created');
          if (nextTaskIndex !== -1) {
            const task = rowTasks[nextTaskIndex];
            const rowIndex = task.id;
            
            task.status = 'assigned';
            task.threadId = threadId;
            runningTasks[threadId] = { taskIndex: nextTaskIndex, startTime: Date.now() };
            
            setThreads(prev => prev.map(t => 
              t.id === threadId 
                ? { ...t, status: 'working', currentTask: task.position }
                : t
            ));

            setMatrixC(prev => prev.map((row, rowIdx) =>
              rowIdx === rowIndex 
                ? row.map(cell => ({ ...cell, status: 'assigned', threadId, taskId: task.id }))
                : row
            ));

            addLog(`🎯 Thread ${threadId} grabbed ${task.position} from shared pool`);
            setTasks([...rowTasks]);
          }
        }
      }

      await delay(speed / 2);

      // Process assigned row tasks
      for (const [threadIdStr, taskInfo] of Object.entries(runningTasks)) {
        const threadId = parseInt(threadIdStr);
        const task = rowTasks[taskInfo.taskIndex];
        if (task.status === 'assigned') {
          task.status = 'executing';
          const rowIndex = task.id;
          
          setMatrixC(prev => prev.map((row, rowIdx) =>
            rowIdx === rowIndex 
              ? row.map((cell, colIdx) => ({ 
                  ...cell, 
                  status: 'processing',
                  value: matrixA[rowIdx][colIdx] + matrixB[rowIdx][colIdx]
                }))
              : row
          ));
          
          addLog(`⚡ Thread ${threadId} processing ${task.position} (${matrixSize} elements)`);
          
          // Show individual element computation
          for (let j = 0; j < matrixSize; j++) {
            await delay(speed / (matrixSize * 2));
            addLog(`   Thread ${threadId}: C[${rowIndex}][${j}] = ${matrixA[rowIndex][j]} + ${matrixB[rowIndex][j]} = ${matrixA[rowIndex][j] + matrixB[rowIndex][j]}`);
          }
        }
      }

      await delay(speed);

      // Complete row tasks
      for (const [threadIdStr, taskInfo] of Object.entries(runningTasks)) {
        const threadId = parseInt(threadIdStr);
        if (Date.now() - taskInfo.startTime >= (rowTasks[taskInfo.taskIndex].executionTime! * speed / 1000)) {
          const task = rowTasks[taskInfo.taskIndex];
          const rowIndex = task.id;
          
          task.status = 'completed';
          completedTasks++;
          
          setMatrixC(prev => prev.map((row, rowIdx) =>
            rowIdx === rowIndex 
              ? row.map(cell => ({ ...cell, status: 'completed' }))
              : row
          ));

          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, status: 'idle', currentTask: undefined, tasksCompleted: t.tasksCompleted + 1 }
              : t
          ));

          addLog(`✅ Thread ${threadId} completed ${task.position}`);
          delete runningTasks[threadId];
        }
      }

      setTasks([...rowTasks]);
      await delay(speed / 4);
    }

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);
    addLog(`🏁 Row-based task parallelism completed in ${endTime - startTime}ms`);
    addLog(`📊 All ${numThreads} threads participated in row processing (including task creator)`);
    setIsRunning(false);
    setCurrentDemo(null);
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentDemo(null);
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
                  w-10 h-10 border border-border flex items-center justify-center text-xs font-bold rounded transition-all duration-500
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
            <Cpu className="w-5 h-5 text-primary" />
            Matrix Addition Parallelism Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onClick={runSerialDemo}
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Serial Execution
            </Button>
            <Button
              onClick={runParallelForDemo}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              Parallel For Loops
            </Button>
            <Button
              onClick={runSectionsDemo}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Sections-based
            </Button>
            <Button
              onClick={runElementBasedDemo}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Element Tasks
            </Button>
            <Button
              onClick={runRowBasedDemo}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Row Tasks
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
                  ${thread.status === 'creating-tasks' ? 'bg-purple-50 border-purple-200 shadow-md' : ''}
                `}
                style={{
                  backgroundColor: thread.status === 'working' ? `${thread.color}10` : 
                                  thread.status === 'creating-tasks' ? `${thread.color}15` : undefined,
                  borderColor: (thread.status === 'working' || thread.status === 'creating-tasks') ? thread.color : undefined
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
                  Status: <Badge variant={
                    thread.status === 'working' ? 'default' : 
                    thread.status === 'creating-tasks' ? 'destructive' : 'secondary'
                  } className="ml-1">
                    {thread.status === 'creating-tasks' ? 'creating' : thread.status}
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
          {currentDemo && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary">
                {currentDemo === 'element-task' ? 'Element-based Tasks' : 
                 currentDemo === 'row-task' ? 'Row-based Tasks' : 
                 currentDemo === 'serial' ? 'Serial Execution' :
                 currentDemo === 'parallel-for' ? 'Parallel For Loop' :
                 currentDemo === 'sections' ? 'Sections-based' : ''}
              </Badge>
              {executionTime > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {executionTime}ms
                </Badge>
              )}
            </div>
          )}
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
              <div className="text-muted-foreground italic">Click a demo button to see execution details...</div>
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

export default MatrixAdditionExamples;
