import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Users, Package, Clock, Zap, Timer, Activity } from 'lucide-react';

type ScheduleType = 'static' | 'dynamic' | 'guided' | 'nowait';

interface WorkItem {
  id: number;
  complexity: number;
  assignedThread: number | null;
  status: 'pending' | 'processing' | 'completed';
  startTime?: number;
  endTime?: number;
  processingTime: number;
  progress: number;
}

interface ThreadInfo {
  id: number;
  currentWork: number | null;
  completedWork: number[];
  isActive: boolean;
  waitingTime: number;
  workQueue: number[];
  totalProcessingTime: number;
}

const SchedulingVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('static');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [chunkSize, setChunkSize] = useState(4);
  const [statistics, setStatistics] = useState({
    totalTime: 0,
    efficiency: 0,
    loadBalance: 0,
    throughput: 0
  });
  const intervalRef = useRef<number | null>(null);

  const TOTAL_WORK = 16;
  const NUM_THREADS = 4;

  const getComplexityColor = (complexity: number, status: string) => {
    if (status === 'completed') return 'bg-emerald-500 border-emerald-400';
    if (status === 'processing') return 'bg-blue-500 border-blue-400 animate-pulse';
    
    switch (complexity) {
      case 1: return 'bg-green-600 border-green-500';
      case 2: return 'bg-yellow-600 border-yellow-500';
      case 3: return 'bg-red-600 border-red-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  const getThreadColor = (threadId: number, isActive: boolean) => {
    const colors = [
      isActive ? 'bg-blue-500 border-blue-400' : 'bg-blue-700 border-blue-600',
      isActive ? 'bg-green-500 border-green-400' : 'bg-green-700 border-green-600',
      isActive ? 'bg-purple-500 border-purple-400' : 'bg-purple-700 border-purple-600',
      isActive ? 'bg-orange-500 border-orange-400' : 'bg-orange-700 border-orange-600'
    ];
    return colors[threadId % colors.length];
  };

  const initializeWorkItems = () => {
    const items: WorkItem[] = [];
    for (let i = 0; i < TOTAL_WORK; i++) {
      items.push({
        id: i + 1,
        complexity: scheduleType === 'static' ? 1 : Math.floor(Math.random() * 3) + 1,
        assignedThread: null,
        status: 'pending',
        processingTime: 0,
        progress: 0
      });
    }
    return items;
  };

  const initializeThreads = () => {
    const threadInfo: ThreadInfo[] = [];
    for (let i = 0; i < NUM_THREADS; i++) {
      threadInfo.push({
        id: i,
        currentWork: null,
        completedWork: [],
        isActive: false,
        waitingTime: 0,
        workQueue: [],
        totalProcessingTime: 0
      });
    }
    return threadInfo;
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${currentTime.toString().padStart(3, '0')}] ${message}`].slice(-15));
  };

  const calculateStatistics = () => {
    const completedItems = workItems.filter(item => item.status === 'completed');
    const totalCompleted = completedItems.length;
    const maxThreadWork = Math.max(...threads.map(t => t.completedWork.length));
    const minThreadWork = Math.min(...threads.map(t => t.completedWork.length));
    
    setStatistics({
      totalTime: currentTime,
      efficiency: totalCompleted > 0 ? Math.round((totalCompleted / TOTAL_WORK) * 100) : 0,
      loadBalance: maxThreadWork > 0 ? Math.round((minThreadWork / maxThreadWork) * 100) : 100,
      throughput: currentTime > 0 ? Math.round((totalCompleted / currentTime) * 10) / 10 : 0
    });
  };

  const assignStaticWork = () => {
    const itemsPerThread = Math.ceil(TOTAL_WORK / NUM_THREADS);
    const newWorkItems = [...workItems];
    const newThreads = [...threads];
    
    for (let i = 0; i < TOTAL_WORK; i++) {
      const threadId = Math.floor(i / itemsPerThread);
      if (threadId < NUM_THREADS) {
        newWorkItems[i].assignedThread = threadId;
        newThreads[threadId].workQueue.push(i + 1);
        addLog(`📋 Static: Item ${i + 1} → Thread ${threadId}`);
      }
    }
    
    setWorkItems(newWorkItems);
    setThreads(newThreads);
  };

  const assignDynamicWork = () => {
    const pendingItems = workItems.filter(item => item.status === 'pending');
    const availableThreads = threads.filter(thread => thread.currentWork === null && thread.workQueue.length === 0);
    
    availableThreads.forEach(thread => {
      const currentChunkSize = scheduleType === 'guided' ? 
        Math.max(1, Math.ceil(pendingItems.length / (NUM_THREADS * 2))) : 
        chunkSize;
      
      const itemsToAssign = pendingItems.slice(0, currentChunkSize)
        .filter(item => !workItems.some(w => w.id === item.id && w.assignedThread !== null));
      
      itemsToAssign.forEach(item => {
        const itemIndex = workItems.findIndex(w => w.id === item.id);
        if (itemIndex !== -1) {
          const newWorkItems = [...workItems];
          newWorkItems[itemIndex].assignedThread = thread.id;
          setWorkItems(newWorkItems);
          
          const newThreads = [...threads];
          newThreads[thread.id].workQueue.push(item.id);
          setThreads(newThreads);
          
          const emoji = scheduleType === 'guided' ? '🎯' : '⚡';
          addLog(`${emoji} ${scheduleType}: Item ${item.id} → Thread ${thread.id}`);
        }
      });
    });
  };

  const processWork = () => {
    const newWorkItems = [...workItems];
    const newThreads = [...threads];
    
    threads.forEach(thread => {
      // Assign new work if thread is idle
      if (thread.currentWork === null && thread.workQueue.length > 0) {
        const nextWorkId = thread.workQueue[0];
        newThreads[thread.id].currentWork = nextWorkId;
        newThreads[thread.id].isActive = true;
        newThreads[thread.id].workQueue = thread.workQueue.slice(1);
        
        const workIndex = newWorkItems.findIndex(item => item.id === nextWorkId);
        if (workIndex !== -1) {
          newWorkItems[workIndex].status = 'processing';
          newWorkItems[workIndex].startTime = currentTime;
          addLog(`🚀 Thread ${thread.id} started Item ${nextWorkId}`);
        }
      }
      
      // Process current work
      if (thread.currentWork) {
        const workIndex = newWorkItems.findIndex(item => item.id === thread.currentWork);
        if (workIndex !== -1) {
          const work = newWorkItems[workIndex];
          work.processingTime++;
          work.progress = Math.min(100, (work.processingTime / (work.complexity * 3)) * 100);
          newThreads[thread.id].totalProcessingTime++;
          
          // Complete work based on complexity
          if (work.processingTime >= work.complexity * 3) {
            newWorkItems[workIndex].status = 'completed';
            newWorkItems[workIndex].endTime = currentTime;
            newWorkItems[workIndex].progress = 100;
            newThreads[thread.id].completedWork.push(work.id);
            newThreads[thread.id].currentWork = null;
            newThreads[thread.id].isActive = false;
            
            addLog(`✅ Thread ${thread.id} completed Item ${work.id}`);
          }
        }
      } else {
        // Thread is waiting
        newThreads[thread.id].waitingTime++;
      }
    });
    
    setWorkItems(newWorkItems);
    setThreads(newThreads);
  };

  const simulationStep = () => {
    setCurrentTime(prev => prev + 1);
    
    if (scheduleType === 'static') {
      processWork();
    } else {
      assignDynamicWork();
      processWork();
    }
    
    calculateStatistics();
    
    const allCompleted = workItems.every(item => item.status === 'completed');
    if (allCompleted && workItems.length > 0) {
      setIsRunning(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      addLog('🎉 All work completed!');
    }
  };

  const startSimulation = () => {
    if (isPaused) {
      setIsPaused(false);
      intervalRef.current = window.setInterval(simulationStep, 600);
      addLog('▶️ Simulation resumed');
    } else if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      if (scheduleType === 'static') {
        assignStaticWork();
      }
      intervalRef.current = window.setInterval(simulationStep, 600);
      addLog('🎬 Simulation started');
    }
  };

  const pauseSimulation = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      addLog('⏸️ Simulation paused');
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const newWorkItems = initializeWorkItems();
    const newThreads = initializeThreads();
    setWorkItems(newWorkItems);
    setThreads(newThreads);
    setCurrentTime(0);
    setLogs([]);
    setStatistics({ totalTime: 0, efficiency: 0, loadBalance: 0, throughput: 0 });
    addLog('🔄 Simulation reset');
  };

  useEffect(() => {
    resetSimulation();
  }, [scheduleType]);

  useEffect(() => {
    const newWorkItems = initializeWorkItems();
    const newThreads = initializeThreads();
    setWorkItems(newWorkItems);
    setThreads(newThreads);
  }, []);

  const renderBrickAnalogy = () => (
    <div className="space-y-6 p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-700">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4 text-foreground">🧱 The Brick Moving Analogy</h3>
        <p className="text-muted-foreground mb-6">
          Imagine we have 100 bricks to move (workload), and 4 workers (threads).
          The scheduling strategy decides who gets which bricks and when.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`${scheduleType === 'static' ? 'ring-2 ring-blue-500 bg-slate-800/50' : 'bg-slate-900/30'} border-slate-700`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Package className="w-5 h-5" />
              1. Static Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">Work is divided equally in advance among threads.</p>
            <div className="space-y-2 text-xs text-foreground bg-slate-800/50 p-3 rounded border border-slate-600">
              <p>• Thread 0 → bricks 1–25</p>
              <p>• Thread 1 → bricks 26–50</p>
              <p>• Thread 2 → bricks 51–75</p>
              <p>• Thread 3 → bricks 76–100</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-4xl">🚛🚛🚛🚛</div>
            </div>
            <p className="text-xs text-green-400">✅ Efficient if work is uniform</p>
            <p className="text-xs text-red-400">❌ Bad if some bricks are heavier</p>
          </CardContent>
        </Card>

        <Card className={`${scheduleType === 'dynamic' ? 'ring-2 ring-green-500 bg-slate-800/50' : 'bg-slate-900/30'} border-slate-700`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Users className="w-5 h-5" />
              2. Dynamic Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">Bricks are picked up on demand. Each thread grabs a small set of bricks (chunk).</p>
            <div className="flex items-center justify-center">
              <div className="text-4xl">🏗️ ← 👷👷👷👷</div>
            </div>
            <p className="text-xs text-foreground bg-slate-800/50 p-2 rounded border border-slate-600">Workers come, pick some bricks, deliver, return for more.</p>
            <p className="text-xs text-green-400">✅ Good for uneven workloads</p>
            <p className="text-xs text-red-400">❌ Overhead: threads keep asking for more</p>
          </CardContent>
        </Card>

        <Card className={`${scheduleType === 'guided' ? 'ring-2 ring-purple-500 bg-slate-800/50' : 'bg-slate-900/30'} border-slate-700`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Zap className="w-5 h-5" />
              3. Guided Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">Starts like Dynamic, but chunk size decreases over time.</p>
            <div className="space-y-1 text-xs text-foreground bg-slate-800/50 p-3 rounded border border-slate-600">
              <p>First: large chunks (20 bricks) 🧺🧺🧺🧺</p>
              <p>Later: smaller chunks (5) 🪣🪣🪣🪣</p>
              <p>End: tiny chunks (1-2) 👜👜👜👜</p>
            </div>
            <p className="text-xs text-green-400">✅ Balances load while reducing overhead</p>
            <p className="text-xs text-red-400">❌ Might still cause imbalance near end</p>
          </CardContent>
        </Card>

        <Card className={`${scheduleType === 'nowait' ? 'ring-2 ring-orange-500 bg-slate-800/50' : 'bg-slate-900/30'} border-slate-700`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Clock className="w-5 h-5" />
              4. Nowait Clause
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">Fast workers move to next job without waiting for slowest.</p>
            <div className="flex items-center justify-center">
              <div className="text-4xl">🏃‍♂️🚶‍♂️🚶‍♂️🐌</div>
            </div>
            <p className="text-xs text-foreground bg-slate-800/50 p-2 rounded border border-slate-600">Fast workers start painting walls while others finish moving bricks.</p>
            <p className="text-xs text-green-400">✅ Reduces idle time</p>
            <p className="text-xs text-red-400">❌ Risk: Later code can't depend on all bricks moved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(['static', 'dynamic', 'guided', 'nowait'] as ScheduleType[]).map(type => (
          <Button
            key={type}
            onClick={() => setScheduleType(type)}
            variant={scheduleType === type ? 'default' : 'outline'}
            size="sm"
            className={scheduleType === type ? 'bg-primary text-primary-foreground' : ''}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <Button 
          onClick={isRunning && !isPaused ? pauseSimulation : startSimulation}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              {isPaused ? 'Resume' : 'Start'}
            </>
          )}
        </Button>
        <Button onClick={resetSimulation} variant="outline" className="border-slate-600">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Time: {currentTime}</span>
        </div>
      </div>

      {/* Statistics Panel */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5" />
            Performance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">{statistics.efficiency}%</div>
              <div className="text-xs text-muted-foreground">Completion</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="text-2xl font-bold text-green-400">{statistics.loadBalance}%</div>
              <div className="text-xs text-muted-foreground">Load Balance</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="text-2xl font-bold text-purple-400">{statistics.throughput}</div>
              <div className="text-xs text-muted-foreground">Throughput</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="text-2xl font-bold text-orange-400">{statistics.totalTime}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-foreground">Work Items ({TOTAL_WORK} total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {workItems.map(item => (
                <div
                  key={item.id}
                  className={`
                    relative w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300
                    ${getComplexityColor(item.complexity, item.status)}
                    ${item.status === 'processing' ? 'shadow-lg shadow-blue-500/50' : ''}
                  `}
                  title={`Item ${item.id} - Complexity: ${item.complexity} - Thread: ${item.assignedThread ?? 'None'} - Status: ${item.status}`}
                >
                  <span className="text-white">{item.id}</span>
                  {item.status === 'processing' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-b">
                      <div 
                        className="h-full bg-blue-400 rounded-b transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="text-[8px] text-white">{item.complexity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 border border-green-500 rounded"></div>
                  <span>Low (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-600 border border-yellow-500 rounded"></div>
                  <span>Medium (2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 border border-red-500 rounded"></div>
                  <span>High (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 border border-emerald-400 rounded"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-foreground">Threads ({NUM_THREADS} workers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threads.map(thread => (
                <div key={thread.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                    ${getThreadColor(thread.id, thread.isActive)}
                    ${thread.isActive ? 'animate-pulse shadow-lg' : ''}
                  `}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">Thread {thread.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {thread.currentWork ? `🔄 Processing Item ${thread.currentWork}` : '💤 Idle'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ✅ Completed: {thread.completedWork.length} | ⌛ Queue: {thread.workQueue.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ⏱️ Work Time: {thread.totalProcessingTime} | 🕐 Wait Time: {thread.waitingTime}
                    </div>
                  </div>
                  <Badge variant={thread.isActive ? 'default' : 'secondary'} className={
                    thread.isActive ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                  }>
                    {thread.isActive ? '🔴 Active' : '⚫ Idle'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground">Thread Work Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {threads.map(thread => (
              <div key={thread.id} className="space-y-2">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getThreadColor(thread.id, false).split(' ')[0]}`}></div>
                  Thread {thread.id}
                </div>
                <div className="min-h-[80px] bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {thread.completedWork.map(workId => (
                      <div key={workId} className="w-6 h-6 bg-emerald-500 text-white text-xs rounded flex items-center justify-center font-bold shadow">
                        {workId}
                      </div>
                    ))}
                    {thread.currentWork && (
                      <div className="relative w-6 h-6 bg-blue-500 text-white text-xs rounded flex items-center justify-center animate-pulse font-bold shadow-lg">
                        {thread.currentWork}
                        <div className="absolute inset-0 rounded animate-ping bg-blue-400 opacity-20"></div>
                      </div>
                    )}
                    {thread.workQueue.map(workId => (
                      <div key={workId} className="w-6 h-6 bg-slate-600 text-slate-300 text-xs rounded flex items-center justify-center border-2 border-dashed border-slate-500">
                        {workId}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Efficiency: {thread.totalProcessingTime > 0 ? Math.round((thread.totalProcessingTime / (thread.totalProcessingTime + thread.waitingTime)) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCodeExample = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">OpenMP Code Examples</h3>
      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-700">
        <pre className="text-sm overflow-x-auto">
          <code>{`#include <stdio.h>
#include <omp.h>

#define N 16

int main() {
    int arr[N];
    for (int i = 0; i < N; i++) arr[i] = i+1;

    printf("=== Static Scheduling ===\\n");
    #pragma omp parallel for schedule(static,4)
    for (int i = 0; i < N; i++) {
        printf("Thread %d handled %d\\n", omp_get_thread_num(), arr[i]);
    }

    printf("=== Dynamic Scheduling ===\\n");
    #pragma omp parallel for schedule(dynamic,2)
    for (int i = 0; i < N; i++) {
        printf("Thread %d handled %d\\n", omp_get_thread_num(), arr[i]);
    }

    printf("=== Guided Scheduling ===\\n");
    #pragma omp parallel for schedule(guided,2)
    for (int i = 0; i < N; i++) {
        printf("Thread %d handled %d\\n", omp_get_thread_num(), arr[i]);
    }

    printf("=== Nowait Example ===\\n");
    #pragma omp parallel
    {
        #pragma omp for schedule(static,2) nowait
        for (int i = 0; i < N; i++) {
            printf("Thread %d processed %d\\n", omp_get_thread_num(), arr[i]);
        }
        printf("Thread %d moved ahead without waiting!\\n", omp_get_thread_num());
    }
}`}</code>
        </pre>
      </div>
    </div>
  );

  const renderLogs = () => (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-foreground">Execution Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto border border-slate-800">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
          {logs.length === 0 && <div className="text-slate-500">Start simulation to see execution logs...</div>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="concept" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="concept" className="data-[state=active]:bg-slate-700">Concept</TabsTrigger>
          <TabsTrigger value="demo" className="data-[state=active]:bg-slate-700">Interactive Demo</TabsTrigger>
          <TabsTrigger value="code" className="data-[state=active]:bg-slate-700">Code Examples</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="concept">
          {renderBrickAnalogy()}
        </TabsContent>

        <TabsContent value="demo">
          {renderVisualization()}
        </TabsContent>

        <TabsContent value="code">
          {renderCodeExample()}
        </TabsContent>

        <TabsContent value="logs">
          {renderLogs()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulingVisualization;
