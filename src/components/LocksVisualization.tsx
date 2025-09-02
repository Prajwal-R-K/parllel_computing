import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Lock, Unlock, AlertTriangle, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';

interface Thread {
  id: number;
  status: 'running' | 'waiting' | 'locked' | 'completed' | 'deadlocked' | 'trying' | 'skipped';
  currentTask: string;
  progress: number;
  waitingFor: string;
  holdsLock: string | null;
  attempts: number;
  timeline: {time: number, status: string, color: string}[];
}

interface LockState {
  name: string;
  owner: number | null;
  waitingThreads: number[];
  tryAttempts: number;
}

interface QueueItem {
  id: number;
  producer: number;
  timestamp: number;
}

interface LogEntry {
  timestamp: number;
  thread: string;
  message: string;
  type: 'lock' | 'unlock' | 'deadlock' | 'system' | 'queue' | 'memory';
}

const LocksVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [locks, setLocks] = useState<LockState[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [currentDemo, setCurrentDemo] = useState<'basic' | 'deadlock' | 'trylock' | 'producer-consumer' | 'memory-visibility'>('basic');
  const [deadlockDetected, setDeadlockDetected] = useState(false);
  const [sharedQueue, setSharedQueue] = useState<QueueItem[]>([]);
  const [sharedVariable, setSharedVariable] = useState(0);
  const [threadLocalCaches, setThreadLocalCaches] = useState<{[key: number]: number}>({});
  const [memoryVisible, setMemoryVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const addLog = (thread: string, message: string, type: 'lock' | 'unlock' | 'deadlock' | 'system' | 'queue' | 'memory') => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      thread,
      message,
      type
    }].slice(-30));
  };

  const updateTimeline = (threadId: number, status: string, color: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId 
        ? { ...t, timeline: [...t.timeline, { time: executionTime, status, color }].slice(-50) }
        : t
    ));
  };

  const initializeBasicDemo = () => {
    setThreads([
      { id: 0, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 1, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 2, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 3, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] }
    ]);
    setLocks([
      { name: 'BankAccount', owner: null, waitingThreads: [], tryAttempts: 0 }
    ]);
  };

  const initializeDeadlockDemo = () => {
    setThreads([
      { id: 0, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 1, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] }
    ]);
    setLocks([
      { name: 'LockA', owner: null, waitingThreads: [], tryAttempts: 0 },
      { name: 'LockB', owner: null, waitingThreads: [], tryAttempts: 0 }
    ]);
  };

  const initializeTriylockDemo = () => {
    setThreads([
      { id: 0, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 1, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 2, status: 'running', currentTask: 'Initializing', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] }
    ]);
    setLocks([
      { name: 'SharedResource', owner: null, waitingThreads: [], tryAttempts: 0 }
    ]);
  };

  const initializeProducerConsumerDemo = () => {
    setThreads([
      { id: 0, status: 'running', currentTask: 'Producer', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 1, status: 'running', currentTask: 'Producer', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 2, status: 'running', currentTask: 'Consumer', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 3, status: 'running', currentTask: 'Consumer', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] }
    ]);
    setLocks([
      { name: 'QueueLock', owner: null, waitingThreads: [], tryAttempts: 0 }
    ]);
    setSharedQueue([]);
  };

  const initializeMemoryVisibilityDemo = () => {
    setThreads([
      { id: 0, status: 'running', currentTask: 'Writer', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 1, status: 'running', currentTask: 'Reader', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] },
      { id: 2, status: 'running', currentTask: 'Reader', progress: 0, waitingFor: '', holdsLock: null, attempts: 0, timeline: [] }
    ]);
    setLocks([
      { name: 'MemoryLock', owner: null, waitingThreads: [], tryAttempts: 0 }
    ]);
    setSharedVariable(0);
    setThreadLocalCaches({ 0: 0, 1: 0, 2: 0 });
  };

  const reset = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setExecutionTime(0);
    setDeadlockDetected(false);
    setLogs([]);
    
    switch (currentDemo) {
      case 'basic': initializeBasicDemo(); break;
      case 'deadlock': initializeDeadlockDemo(); break;
      case 'trylock': initializeTriylockDemo(); break;
      case 'producer-consumer': initializeProducerConsumerDemo(); break;
      case 'memory-visibility': initializeMemoryVisibilityDemo(); break;
    }
  };

  const startBasicDemo = () => {
    setIsRunning(true);
    addLog('System', 'Starting basic lock demonstration', 'system');
    
    let timeCounter = 0;
    const timer = setInterval(() => {
      timeCounter += 100;
      setExecutionTime(timeCounter);

      setThreads(prev => {
        const updated = [...prev];
        let allCompleted = true;

        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2;
            
            // At 30%, threads try to access shared resource
            if (thread.progress >= 30 && thread.progress < 70 && !thread.holdsLock) {
              const accountLock = locks.find(l => l.name === 'BankAccount');
              if (accountLock && !accountLock.owner) {
                // Acquire lock
                thread.status = 'locked';
                thread.currentTask = 'Updating bank account';
                thread.holdsLock = 'BankAccount';
                setLocks(prevLocks => prevLocks.map(l => 
                  l.name === 'BankAccount' ? { ...l, owner: thread.id } : l
                ));
                addLog(`Thread ${thread.id}`, 'Acquired BankAccount lock', 'lock');
              } else if (accountLock && accountLock.owner !== thread.id) {
                // Wait for lock
                thread.status = 'waiting';
                thread.currentTask = 'Waiting for bank account access';
                thread.waitingFor = 'BankAccount';
                addLog(`Thread ${thread.id}`, 'Waiting for BankAccount lock', 'lock');
              }
            }
            
            // At 70%, release lock
            if (thread.progress >= 70 && thread.holdsLock) {
              thread.status = 'running';
              thread.currentTask = 'Continuing work';
              thread.holdsLock = null;
              setLocks(prevLocks => prevLocks.map(l => 
                l.name === 'BankAccount' ? { ...l, owner: null } : l
              ));
              addLog(`Thread ${thread.id}`, 'Released BankAccount lock', 'unlock');
              
              // Wake up waiting threads
              const waitingThread = updated.find(t => t.waitingFor === 'BankAccount');
              if (waitingThread) {
                waitingThread.status = 'running';
                waitingThread.waitingFor = '';
              }
            }
            
            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.currentTask = 'Completed';
              thread.progress = 100;
            }
          } else if (thread.status === 'locked') {
            thread.progress += 1; // Slower progress when holding lock
          }

          if (thread.status !== 'completed') {
            allCompleted = false;
          }
        });

        if (allCompleted) {
          clearInterval(timer);
          setIsRunning(false);
          addLog('System', 'All threads completed successfully', 'system');
        }

        return updated;
      });
    }, 100);
  };

  const startDeadlockDemo = () => {
    setIsRunning(true);
    addLog('System', 'Starting deadlock demonstration', 'system');
    
    let timeCounter = 0;
    const timer = setInterval(() => {
      timeCounter += 100;
      setExecutionTime(timeCounter);

      setThreads(prev => {
        const updated = [...prev];

        // Thread 0 tries to get LockA first, then LockB
        // Thread 1 tries to get LockB first, then LockA
        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2;
            
            if (thread.id === 0) {
              // Thread 0: LockA -> LockB
              if (thread.progress >= 30 && !thread.holdsLock) {
                const lockA = locks.find(l => l.name === 'LockA');
                if (lockA && !lockA.owner) {
                  thread.holdsLock = 'LockA';
                  thread.currentTask = 'Holding LockA, need LockB';
                  setLocks(prevLocks => prevLocks.map(l => 
                    l.name === 'LockA' ? { ...l, owner: 0 } : l
                  ));
                  addLog('Thread 0', 'Acquired LockA', 'lock');
                }
              } else if (thread.progress >= 50 && thread.holdsLock === 'LockA') {
                const lockB = locks.find(l => l.name === 'LockB');
                if (lockB && !lockB.owner) {
                  addLog('Thread 0', 'Acquired LockB - can proceed', 'lock');
                  thread.status = 'completed';
                } else {
                  thread.status = 'waiting';
                  thread.waitingFor = 'LockB';
                  thread.currentTask = 'Deadlock: Waiting for LockB';
                  addLog('Thread 0', 'Waiting for LockB (holds LockA)', 'deadlock');
                }
              }
            } else if (thread.id === 1) {
              // Thread 1: LockB -> LockA
              if (thread.progress >= 30 && !thread.holdsLock) {
                const lockB = locks.find(l => l.name === 'LockB');
                if (lockB && !lockB.owner) {
                  thread.holdsLock = 'LockB';
                  thread.currentTask = 'Holding LockB, need LockA';
                  setLocks(prevLocks => prevLocks.map(l => 
                    l.name === 'LockB' ? { ...l, owner: 1 } : l
                  ));
                  addLog('Thread 1', 'Acquired LockB', 'lock');
                }
              } else if (thread.progress >= 50 && thread.holdsLock === 'LockB') {
                const lockA = locks.find(l => l.name === 'LockA');
                if (lockA && !lockA.owner) {
                  addLog('Thread 1', 'Acquired LockA - can proceed', 'lock');
                  thread.status = 'completed';
                } else {
                  thread.status = 'waiting';
                  thread.waitingFor = 'LockA';
                  thread.currentTask = 'Deadlock: Waiting for LockA';
                  addLog('Thread 1', 'Waiting for LockA (holds LockB)', 'deadlock');
                }
              }
            }
          }
        });

        // Detect deadlock
        const thread0Waiting = updated[0].status === 'waiting' && updated[0].waitingFor === 'LockB';
        const thread1Waiting = updated[1].status === 'waiting' && updated[1].waitingFor === 'LockA';
        
        if (thread0Waiting && thread1Waiting && !deadlockDetected) {
          setDeadlockDetected(true);
          updated.forEach(t => t.status = 'deadlocked');
          addLog('System', '💀 DEADLOCK DETECTED! Both threads waiting forever', 'deadlock');
          clearInterval(timer);
          setIsRunning(false);
        }

        return updated;
      });
    }, 100);
  };

  const startTrylockDemo = () => {
    setIsRunning(true);
    addLog('System', 'Starting try-lock demonstration', 'system');
    
    let timeCounter = 0;
    const timer = setInterval(() => {
      timeCounter += 100;
      setExecutionTime(timeCounter);

      setThreads(prev => {
        const updated = [...prev];
        let allCompleted = true;

        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2;
            
            if (thread.progress >= 30 && thread.progress < 80) {
              const sharedLock = locks.find(l => l.name === 'SharedResource');
              
              if (sharedLock && !sharedLock.owner) {
                // Successfully acquire lock
                thread.status = 'locked';
                thread.holdsLock = 'SharedResource';
                thread.currentTask = 'Using shared resource';
                setLocks(prevLocks => prevLocks.map(l => 
                  l.name === 'SharedResource' ? { ...l, owner: thread.id } : l
                ));
                addLog(`Thread ${thread.id}`, 'Try-lock succeeded, using resource', 'lock');
              } else if (sharedLock && sharedLock.owner !== thread.id) {
                // Try-lock failed, do other work
                thread.attempts++;
                thread.currentTask = `Try-lock failed (attempt ${thread.attempts}), doing other work`;
                addLog(`Thread ${thread.id}`, `Try-lock failed, continuing with other tasks`, 'lock');
              }
            }
            
            if (thread.progress >= 80 && thread.holdsLock) {
              thread.status = 'running';
              thread.currentTask = 'Released resource, finishing';
              thread.holdsLock = null;
              setLocks(prevLocks => prevLocks.map(l => 
                l.name === 'SharedResource' ? { ...l, owner: null } : l
              ));
              addLog(`Thread ${thread.id}`, 'Released SharedResource lock', 'unlock');
            }
            
            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.currentTask = 'Completed';
            }
          } else if (thread.status === 'locked') {
            thread.progress += 0.8; // Slower when using resource
          }

          if (thread.status !== 'completed') {
            allCompleted = false;
          }
        });

        if (allCompleted) {
          clearInterval(timer);
          setIsRunning(false);
          addLog('System', 'All threads completed - no deadlocks!', 'system');
        }

        return updated;
      });
    }, 100);
  };

  const startProducerConsumerDemo = () => {
    setIsRunning(true);
    addLog('System', 'Starting Producer-Consumer demonstration', 'system');
    
    let timeCounter = 0;
    const timer = setInterval(() => {
      timeCounter += 100;
      setExecutionTime(timeCounter);

      setThreads(prev => {
        const updated = [...prev];

        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2;
            
            if (thread.currentTask === 'Producer' && thread.progress >= 30 && thread.progress < 80) {
              // Producer tries to add item
              const queueLock = locks.find(l => l.name === 'QueueLock');
              if (queueLock && !queueLock.owner && sharedQueue.length < 5) {
                // Acquire lock and add item
                thread.status = 'locked';
                thread.holdsLock = 'QueueLock';
                setLocks(prevLocks => prevLocks.map(l => 
                  l.name === 'QueueLock' ? { ...l, owner: thread.id } : l
                ));
                
                const newItem = { id: Date.now(), producer: thread.id, timestamp: timeCounter };
                setSharedQueue(prev => [...prev, newItem]);
                updateTimeline(thread.id, 'producing', '#10b981');
                addLog(`Thread ${thread.id}`, `Produced item ${newItem.id}`, 'queue');
                
                setTimeout(() => {
                  thread.status = 'running';
                  thread.holdsLock = null;
                  setLocks(prevLocks => prevLocks.map(l => 
                    l.name === 'QueueLock' ? { ...l, owner: null } : l
                  ));
                  addLog(`Thread ${thread.id}`, 'Released QueueLock', 'unlock');
                }, 200);
              } else if (queueLock && queueLock.owner !== thread.id) {
                thread.status = 'waiting';
                thread.waitingFor = 'QueueLock';
                updateTimeline(thread.id, 'waiting', '#f59e0b');
              }
            } else if (thread.currentTask === 'Consumer' && thread.progress >= 30 && thread.progress < 80) {
              // Consumer tries to remove item
              const queueLock = locks.find(l => l.name === 'QueueLock');
              if (queueLock && !queueLock.owner && sharedQueue.length > 0) {
                // Acquire lock and remove item
                thread.status = 'locked';
                thread.holdsLock = 'QueueLock';
                setLocks(prevLocks => prevLocks.map(l => 
                  l.name === 'QueueLock' ? { ...l, owner: thread.id } : l
                ));
                
                const consumedItem = sharedQueue[0];
                setSharedQueue(prev => prev.slice(1));
                updateTimeline(thread.id, 'consuming', '#8b5cf6');
                addLog(`Thread ${thread.id}`, `Consumed item ${consumedItem.id}`, 'queue');
                
                setTimeout(() => {
                  thread.status = 'running';
                  thread.holdsLock = null;
                  setLocks(prevLocks => prevLocks.map(l => 
                    l.name === 'QueueLock' ? { ...l, owner: null } : l
                  ));
                  addLog(`Thread ${thread.id}`, 'Released QueueLock', 'unlock');
                }, 200);
              } else if (queueLock && queueLock.owner !== thread.id) {
                thread.status = 'waiting';
                thread.waitingFor = 'QueueLock';
                updateTimeline(thread.id, 'waiting', '#f59e0b');
              }
            }
            
            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.currentTask = 'Completed';
              thread.progress = 100;
              updateTimeline(thread.id, 'completed', '#22c55e');
            }
          } else if (thread.status === 'locked') {
            thread.progress += 0.5;
          }
        });

        return updated;
      });
    }, 100);
  };

  const startMemoryVisibilityDemo = () => {
    setIsRunning(true);
    addLog('System', 'Starting Memory Visibility demonstration', 'system');
    
    let timeCounter = 0;
    const timer = setInterval(() => {
      timeCounter += 100;
      setExecutionTime(timeCounter);

      setThreads(prev => {
        const updated = [...prev];

        updated.forEach(thread => {
          if (thread.status === 'running') {
            thread.progress += 2;
            
            if (thread.currentTask === 'Writer' && thread.progress >= 30 && thread.progress < 80) {
              if (memoryVisible) {
                // With synchronization - use lock
                const memoryLock = locks.find(l => l.name === 'MemoryLock');
                if (memoryLock && !memoryLock.owner) {
                  thread.status = 'locked';
                  thread.holdsLock = 'MemoryLock';
                  setLocks(prevLocks => prevLocks.map(l => 
                    l.name === 'MemoryLock' ? { ...l, owner: thread.id } : l
                  ));
                  
                  const newValue = sharedVariable + 1;
                  setSharedVariable(newValue);
                  setThreadLocalCaches(prev => ({ ...prev, [thread.id]: newValue }));
                  updateTimeline(thread.id, 'writing', '#ef4444');
                  addLog(`Thread ${thread.id}`, `Updated shared variable to ${newValue} (visible to all)`, 'memory');
                  
                  setTimeout(() => {
                    thread.status = 'running';
                    thread.holdsLock = null;
                    setLocks(prevLocks => prevLocks.map(l => 
                      l.name === 'MemoryLock' ? { ...l, owner: null } : l
                    ));
                    // Update all caches when lock is released
                    setThreadLocalCaches(prev => {
                      const updated = { ...prev };
                      Object.keys(updated).forEach(key => {
                        updated[parseInt(key)] = newValue;
                      });
                      return updated;
                    });
                  }, 200);
                }
              } else {
                // Without synchronization - cache inconsistency
                const newValue = sharedVariable + 1;
                setSharedVariable(newValue);
                setThreadLocalCaches(prev => ({ ...prev, [thread.id]: newValue }));
                updateTimeline(thread.id, 'writing-unsafe', '#ef4444');
                addLog(`Thread ${thread.id}`, `Updated shared variable to ${newValue} (cache inconsistency!)`, 'memory');
              }
            } else if (thread.currentTask === 'Reader' && thread.progress >= 40 && thread.progress < 90) {
              const cacheValue = threadLocalCaches[thread.id] || 0;
              const actualValue = sharedVariable;
              
              if (cacheValue !== actualValue && !memoryVisible) {
                addLog(`Thread ${thread.id}`, `Reading stale value ${cacheValue} (actual: ${actualValue})`, 'memory');
                updateTimeline(thread.id, 'reading-stale', '#f59e0b');
              } else {
                addLog(`Thread ${thread.id}`, `Reading current value ${actualValue}`, 'memory');
                updateTimeline(thread.id, 'reading', '#22c55e');
                setThreadLocalCaches(prev => ({ ...prev, [thread.id]: actualValue }));
              }
            }
            
            if (thread.progress >= 100) {
              thread.status = 'completed';
              thread.currentTask = 'Completed';
              thread.progress = 100;
              updateTimeline(thread.id, 'completed', '#22c55e');
            }
          }
        });

        return updated;
      });
    }, 100);
  };

  const startDemo = () => {
    reset();
    setTimeout(() => {
      switch (currentDemo) {
        case 'basic': startBasicDemo(); break;
        case 'deadlock': startDeadlockDemo(); break;
        case 'trylock': startTrylockDemo(); break;
        case 'producer-consumer': startProducerConsumerDemo(); break;
        case 'memory-visibility': startMemoryVisibilityDemo(); break;
      }
    }, 100);
  };

  useEffect(() => {
    reset();
  }, [currentDemo]);

  const renderTimeline = () => (
    <Card>
      <CardHeader>
        <CardTitle>Execution Timeline (Gantt Chart)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {threads.map(thread => (
            <div key={thread.id} className="flex items-center gap-2">
              <div className="w-16 text-sm font-semibold">T{thread.id}</div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded h-6 relative overflow-hidden">
                {thread.timeline.map((event, index) => (
                  <div
                    key={index}
                    className="absolute h-full"
                    style={{
                      left: `${(event.time / Math.max(executionTime, 1000)) * 100}%`,
                      width: '2%',
                      backgroundColor: event.color
                    }}
                    title={`${event.time}ms: ${event.status}`}
                  />
                ))}
              </div>
              <div className="w-16 text-xs text-muted-foreground">{thread.status}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Running</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Waiting</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Deadlocked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQueueVisualization = () => (
    <Card>
      <CardHeader>
        <CardTitle>Shared Queue Buffer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Queue (max 5 items):</span>
            <Badge variant={sharedQueue.length === 5 ? 'destructive' : 'default'}>
              {sharedQueue.length}/5
            </Badge>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`
                  w-12 h-12 border-2 rounded flex items-center justify-center text-xs
                  ${sharedQueue[i] 
                    ? 'border-green-500 bg-green-100 dark:bg-green-900/20' 
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600'}
                `}
              >
                {sharedQueue[i] ? `P${sharedQueue[i].producer}` : '—'}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMemoryVisualization = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Memory Visibility 
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setMemoryVisible(!memoryVisible)}
          >
            {memoryVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {memoryVisible ? 'Synchronized' : 'Unsynchronized'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Main Memory</h4>
            <div className="p-4 border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/20 rounded text-center">
              <div className="text-2xl font-bold">{sharedVariable}</div>
              <div className="text-xs">Shared Variable</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Thread Local Caches</h4>
            <div className="space-y-2">
              {threads.map(thread => (
                <div key={thread.id} className="flex items-center gap-2">
                  <div className="w-8 text-xs">T{thread.id}:</div>
                  <div className={`
                    px-2 py-1 border rounded text-sm
                    ${threadLocalCaches[thread.id] === sharedVariable 
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-100 dark:bg-red-900/20'}
                  `}>
                    {threadLocalCaches[thread.id] || 0}
                  </div>
                  {threadLocalCaches[thread.id] !== sharedVariable && (
                    <span className="text-xs text-red-600">Stale!</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderThreads = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {threads.map(thread => (
        <div
          key={thread.id}
          className={`
            p-4 rounded-lg border transition-all duration-300
            ${thread.status === 'locked' ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20' : 
              thread.status === 'waiting' ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20' :
              thread.status === 'deadlocked' ? 'border-red-500 bg-red-100 dark:bg-red-900/20' :
              thread.status === 'completed' ? 'border-green-500 bg-green-100 dark:bg-green-900/20' :
              thread.status === 'trying' ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/20' :
              thread.status === 'skipped' ? 'border-gray-500 bg-gray-100 dark:bg-gray-900/20' :
              'border-border bg-secondary/50'}
          `}
        >
          <div className="flex items-center gap-2 mb-3">
            {thread.holdsLock && <Lock className="w-4 h-4 text-blue-500" />}
            {thread.status === 'waiting' && <Clock className="w-4 h-4 text-yellow-500" />}
            {thread.status === 'deadlocked' && <AlertTriangle className="w-4 h-4 text-red-500" />}
            <span className="font-semibold text-sm">Thread {thread.id}</span>
          </div>
          
          <div className="space-y-2">
            <Badge variant={thread.status === 'completed' ? 'default' : 'secondary'}>
              {thread.status}
            </Badge>
            
            <div className="text-xs font-medium text-muted-foreground">{thread.currentTask}</div>
            
            {thread.holdsLock && (
              <div className="text-xs text-blue-600">Holds: {thread.holdsLock}</div>
            )}
            
            {thread.waitingFor && (
              <div className="text-xs text-yellow-600">Waiting for: {thread.waitingFor}</div>
            )}
            
            {thread.attempts > 0 && (
              <div className="text-xs text-purple-600">Try attempts: {thread.attempts}</div>
            )}
            
            <Progress value={thread.progress} className="h-2" />
            <div className="text-center text-xs">{Math.round(thread.progress)}%</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLocks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locks.map(lock => (
        <div
          key={lock.name}
          className={`
            p-4 rounded-lg border transition-all duration-300
            ${lock.owner !== null ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            {lock.owner !== null ? <Lock className="w-5 h-5 text-red-500" /> : <Unlock className="w-5 h-5 text-green-500" />}
            <span className="font-semibold">{lock.name}</span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div>Status: {lock.owner !== null ? 'Locked' : 'Available'}</div>
            {lock.owner !== null && <div>Owner: Thread {lock.owner}</div>}
            {lock.waitingThreads.length > 0 && (
              <div>Waiting: {lock.waitingThreads.join(', ')}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderConsoleLog = () => (
    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto">
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{((log.timestamp - logs[0]?.timestamp || 0) / 1000).toFixed(2)}s]</span>
          <span className={`ml-2 ${
            log.type === 'lock' ? 'text-blue-400' :
            log.type === 'unlock' ? 'text-green-400' :
            log.type === 'deadlock' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {log.thread}:
          </span>
          <span className="ml-2">{log.message}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Demo Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Advanced Lock Mechanisms Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={currentDemo === 'basic' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('basic')}
            >
              Basic Locks
            </Button>
            <Button
              variant={currentDemo === 'deadlock' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('deadlock')}
            >
              💀 Deadlock
            </Button>
            <Button
              variant={currentDemo === 'trylock' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('trylock')}
            >
              🔄 Try-Lock
            </Button>
            <Button
              variant={currentDemo === 'producer-consumer' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('producer-consumer')}
            >
              📦 Producer-Consumer
            </Button>
            <Button
              variant={currentDemo === 'memory-visibility' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('memory-visibility')}
            >
              🧠 Memory Visibility
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={startDemo}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Demo
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time: {(executionTime / 1000).toFixed(2)}s</span>
            </div>
            {deadlockDetected && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Deadlock Detected!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Threads Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Thread States</CardTitle>
        </CardHeader>
        <CardContent>
          {renderThreads()}
        </CardContent>
      </Card>

      {/* Demo-specific visualizations */}
      {currentDemo === 'producer-consumer' && renderQueueVisualization()}
      {currentDemo === 'memory-visibility' && renderMemoryVisualization()}

      {/* Timeline */}
      {renderTimeline()}

      {/* Locks Status */}
      <Card>
        <CardHeader>
          <CardTitle>Lock Status</CardTitle>
        </CardHeader>
        <CardContent>
          {renderLocks()}
        </CardContent>
      </Card>

      {/* Console Output */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
        </CardHeader>
        <CardContent>
          {renderConsoleLog()}
        </CardContent>
      </Card>

      {/* Real-World Analogies */}
      <Card>
        <CardHeader>
          <CardTitle>🚿 Real-World Analogies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🚿 Basic Lock</h4>
              <p className="text-sm text-muted-foreground">
                Like a bathroom with one key. Only one person can use it at a time. Others wait in line.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">💀 Deadlock</h4>
              <p className="text-sm text-muted-foreground">
                Two friends each holding one chopstick, both waiting for the other's chopstick to eat.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔄 Try-Lock</h4>
              <p className="text-sm text-muted-foreground">
                Knocking on a door. If no answer, go do something else instead of waiting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocksVisualization;
