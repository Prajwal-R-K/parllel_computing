
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ControlPanel from './common/ControlPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Lock, Unlock, Zap, Users, BookOpen, Merge, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

type SafetyMechanism = 'unsafe' | 'lock' | 'atomic' | 'reduction';

interface ThreadAnimation {
  id: number;
  isUpdating: boolean;
  lastUpdate: number;
  lostUpdates: number;
  privateCounter: number;
}

const ThreadSafetyVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [threads, setThreads] = useState(4);
  const [mechanism, setMechanism] = useState<SafetyMechanism>('unsafe');
  const [sharedCounter, setSharedCounter] = useState(0);
  const [expectedCounter, setExpectedCounter] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [threadAnimations, setThreadAnimations] = useState<ThreadAnimation[]>([]);
  const [updateAnimations, setUpdateAnimations] = useState<{id: number, from: number, to: number, lost?: boolean}[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const lockRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const initializeThreadAnimations = () => {
    const animations: ThreadAnimation[] = [];
    for (let i = 0; i < threads; i++) {
      animations.push({
        id: i,
        isUpdating: false,
        lastUpdate: 0,
        lostUpdates: 0,
        privateCounter: 0
      });
    }
    setThreadAnimations(animations);
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${currentTime}] ${message}`].slice(-20));
  };

  const animateUpdate = (threadId: number, from: number, to: number, lost = false) => {
    const animationId = Date.now() + threadId;
    setUpdateAnimations(prev => [...prev, { id: animationId, from, to, lost }]);
    
    setTimeout(() => {
      setUpdateAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 1000);
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSharedCounter(0);
    setExpectedCounter(0);
    setCurrentTime(0);
    setLogs([]);
    setUpdateAnimations([]);
    lockRef.current = false;
    initializeThreadAnimations();
  };

  const runUnsafeSimulation = () => {
    if (!isRunning || isPaused) return;
    
    const activeThread = Math.floor(Math.random() * threads);
    const currentValue = sharedCounter;
    
    setThreadAnimations(prev => prev.map(t => 
      t.id === activeThread ? { ...t, isUpdating: true, lastUpdate: currentValue } : t
    ));
    
    addLog(`Thread ${activeThread}: Read counter = ${currentValue}`);
    
    setTimeout(() => {
      const raceCondition = Math.random() < 0.4 && sharedCounter !== currentValue;
      const newValue = raceCondition ? currentValue + 1 : sharedCounter + 1;
      
      if (raceCondition) {
        setThreadAnimations(prev => prev.map(t => 
          t.id === activeThread ? { ...t, lostUpdates: t.lostUpdates + 1, isUpdating: false } : t
        ));
        addLog(`Thread ${activeThread}: ❌ Lost update! Expected ${currentValue + 1}, got ${sharedCounter}`);
        animateUpdate(activeThread, currentValue, currentValue + 1, true);
      } else {
        setSharedCounter(newValue);
        setThreadAnimations(prev => prev.map(t => 
          t.id === activeThread ? { ...t, isUpdating: false } : t
        ));
        addLog(`Thread ${activeThread}: ✅ Updated counter to ${newValue}`);
        animateUpdate(activeThread, currentValue, newValue);
      }
      
      setExpectedCounter(prev => prev + 1);
    }, 200 + Math.random() * 300);
  };

  const runLockSimulation = () => {
    if (!isRunning || isPaused) return;
    
    const availableThreads = threadAnimations.filter(t => !t.isUpdating);
    if (availableThreads.length === 0 || lockRef.current) return;
    
    const activeThread = availableThreads[Math.floor(Math.random() * availableThreads.length)];
    
    lockRef.current = true;
    setThreadAnimations(prev => prev.map(t => 
      t.id === activeThread.id ? { ...t, isUpdating: true } : t
    ));
    
    addLog(`Thread ${activeThread.id}: 🔒 Acquired lock`);
    
    setTimeout(() => {
      const newValue = sharedCounter + 1;
      setSharedCounter(newValue);
      setExpectedCounter(prev => prev + 1);
      
      lockRef.current = false;
      setThreadAnimations(prev => prev.map(t => 
        t.id === activeThread.id ? { ...t, isUpdating: false } : t
      ));
      
      addLog(`Thread ${activeThread.id}: ✅ Updated counter to ${newValue}, 🔓 released lock`);
      animateUpdate(activeThread.id, newValue - 1, newValue);
    }, 300);
  };

  const runAtomicSimulation = () => {
    if (!isRunning || isPaused) return;
    
    const activeThread = Math.floor(Math.random() * threads);
    const newValue = sharedCounter + 1;
    
    setThreadAnimations(prev => prev.map(t => 
      t.id === activeThread ? { ...t, isUpdating: true } : t
    ));
    
    setTimeout(() => {
      setSharedCounter(newValue);
      setExpectedCounter(prev => prev + 1);
      setThreadAnimations(prev => prev.map(t => 
        t.id === activeThread ? { ...t, isUpdating: false } : t
      ));
      
      addLog(`Thread ${activeThread}: ⚡ Atomic increment ${newValue - 1} → ${newValue}`);
      animateUpdate(activeThread, newValue - 1, newValue);
    }, 100);
  };

  const runReductionSimulation = () => {
    if (!isRunning || isPaused) return;
    
    const activeThread = Math.floor(Math.random() * threads);
    
    setThreadAnimations(prev => prev.map(t => 
      t.id === activeThread ? { 
        ...t, 
        isUpdating: true, 
        privateCounter: t.privateCounter + 1 
      } : t
    ));
    
    addLog(`Thread ${activeThread}: Private counter = ${threadAnimations[activeThread]?.privateCounter + 1}`);
    
    setTimeout(() => {
      setThreadAnimations(prev => prev.map(t => 
        t.id === activeThread ? { ...t, isUpdating: false } : t
      ));
      
      if (Math.random() < 0.2) {
        const totalPrivate = threadAnimations.reduce((sum, t) => sum + t.privateCounter, 0);
        setSharedCounter(totalPrivate);
        addLog(`🔄 Reduction: Combined private counters = ${totalPrivate}`);
      }
      
      setExpectedCounter(prev => prev + 1);
    }, 150);
  };

  const simulationStep = () => {
    setCurrentTime(prev => prev + 1);
    
    switch (mechanism) {
      case 'unsafe': 
        runUnsafeSimulation();
        break;
      case 'lock': 
        runLockSimulation();
        break;
      case 'atomic': 
        runAtomicSimulation();
        break;
      case 'reduction': 
        runReductionSimulation();
        break;
    }
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      simulationStep();
    }, Math.max(100, 800 / speed));
  };

  const pause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resume = () => {
    if (isPaused) {
      setIsPaused(false);
      intervalRef.current = window.setInterval(() => {
        simulationStep();
      }, Math.max(100, 800 / speed));
    }
  };

  const pauseResume = () => {
    if (isPaused) {
      resume();
    } else if (isRunning) {
      pause();
    }
  };

  useEffect(() => {
    initializeThreadAnimations();
  }, [threads]);

  useEffect(() => {
    reset();
  }, [mechanism]);

  useEffect(() => {
    if (isRunning && !isPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        simulationStep();
      }, Math.max(100, 800 / speed));
    }
  }, [speed]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderWhiteboardAnalogy = () => (
    <div className="space-y-6 p-6 bg-gradient-to-r from-blue-950/30 to-purple-950/30 rounded-lg border border-border">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2 text-foreground">🎨 The Whiteboard Analogy</h3>
        <p className="text-muted-foreground">
          Imagine {threads} workers trying to update a shared counter on a whiteboard. How do we prevent chaos?
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${mechanism === 'unsafe' ? 'ring-2 ring-red-500 bg-red-950/20' : 'bg-card'} border-border`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Race Condition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-950/30 border border-red-800 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-xs text-foreground">Whiteboard Chaos</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Multiple workers write simultaneously. Updates overlap and get lost.
            </div>
            <div className="space-y-1 text-xs text-foreground bg-secondary/50 p-2 rounded border">
              <div>Worker 1: Reads 0 → Writes 1</div>
              <div>Worker 2: Reads 0 → Writes 1</div>
              <div className="text-red-400 font-semibold">Lost update! Only 1 instead of 2</div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${mechanism === 'lock' ? 'ring-2 ring-blue-500 bg-blue-950/20' : 'bg-card'} border-border`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Lock className="w-5 h-5" />
              Mutual Exclusion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-950/30 border border-blue-800 rounded-lg flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs text-foreground">Queue with Lock</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Workers line up. Only one can write at a time.
            </div>
            <div className="space-y-1 text-xs text-foreground bg-secondary/50 p-2 rounded border">
              <div>🔒 Worker 1 enters, updates, leaves</div>
              <div>🔓 Worker 2 enters, updates, leaves</div>
              <div className="text-blue-400 font-semibold">Safe but slower</div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${mechanism === 'atomic' ? 'ring-2 ring-green-500 bg-green-950/20' : 'bg-card'} border-border`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Zap className="w-5 h-5" />
              Atomic Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-950/30 border border-green-800 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-xs text-foreground">Magic Marker</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Each worker has a magic pen that guarantees non-overlapping writing.
            </div>
            <div className="space-y-1 text-xs text-foreground bg-secondary/50 p-2 rounded border">
              <div>✨ Worker 1: Magic increment</div>
              <div>✨ Worker 2: Magic increment</div>
              <div className="text-green-400 font-semibold">Fast and safe</div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${mechanism === 'reduction' ? 'ring-2 ring-purple-500 bg-purple-950/20' : 'bg-card'} border-border`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Merge className="w-5 h-5" />
              Private Copies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-950/30 border border-purple-800 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-xs text-foreground">Mini Boards + Merge</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Each worker has their own mini whiteboard, then results are combined.
            </div>
            <div className="space-y-1 text-xs text-foreground bg-secondary/50 p-2 rounded border">
              <div>📝 Each worker: Private board</div>
              <div>🔀 Final: Merge all boards</div>
              <div className="text-purple-400 font-semibold">Parallel and correct</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(['unsafe', 'lock', 'atomic', 'reduction'] as SafetyMechanism[]).map(m => (
          <Button
            key={m}
            onClick={() => setMechanism(m)}
            variant={mechanism === m ? 'default' : 'outline'}
            size="sm"
          >
            {m === 'unsafe' ? 'Race Condition' : 
             m === 'lock' ? 'Mutual Exclusion' :
             m === 'atomic' ? 'Atomic Ops' : 'Reduction'}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Workers (Threads)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {threadAnimations.map((thread) => (
                <div key={thread.id} className="relative">
                  <div className={`
                    p-3 rounded border border-border text-center transition-all duration-300 bg-secondary text-secondary-foreground
                    ${thread.isUpdating ? 'bg-blue-600 text-white animate-pulse ring-2 ring-blue-400' : ''}
                  `}>
                    <Users className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Worker {thread.id}</div>
                    {mechanism === 'reduction' && (
                      <div className="text-xs mt-1">Private: {thread.privateCounter}</div>
                    )}
                    {thread.lostUpdates > 0 && (
                      <div className="text-xs text-red-400">Lost: {thread.lostUpdates}</div>
                    )}
                  </div>
                  
                  {updateAnimations.filter(anim => anim.id % 1000 === thread.id).map(anim => (
                    <div key={anim.id} className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                      <div className={`flex items-center gap-1 ${anim.lost ? 'text-red-400' : 'text-green-400'} animate-pulse`}>
                        <span className="text-xs">{anim.lost ? '❌' : '✅'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Shared Counter</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`
              w-24 h-24 mx-auto rounded-lg border-4 flex items-center justify-center mb-4 transition-all duration-300 bg-secondary
              ${mechanism === 'unsafe' ? 'border-red-500' :
                mechanism === 'lock' ? 'border-blue-500' :
                mechanism === 'atomic' ? 'border-green-500' :
                'border-purple-500'}
            `}>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {sharedCounter}
                </div>
                {mechanism === 'lock' && lockRef.current && (
                  <Lock className="w-4 h-4 mx-auto text-blue-400" />
                )}
                {mechanism === 'atomic' && (
                  <Zap className="w-4 h-4 mx-auto text-green-400" />
                )}
              </div>
            </div>
            <Badge variant={
              mechanism === 'unsafe' ? 'destructive' : 'default'
            }>
              {mechanism.toUpperCase()} MODE
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border border-border rounded bg-secondary">
              <div className="font-semibold text-foreground">Expected Result</div>
              <div className="text-2xl font-bold text-green-400">
                {expectedCounter}
              </div>
            </div>
            
            <div className="p-3 border border-border rounded bg-secondary">
              <div className="font-semibold text-foreground">Actual Result</div>
              <div className={`text-2xl font-bold ${
                sharedCounter === expectedCounter ? 'text-green-400' : 'text-red-400'
              }`}>
                {sharedCounter}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sharedCounter === expectedCounter ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <Badge variant="default">Correct!</Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <Badge variant="destructive">Race Condition!</Badge>
                </>
              )}
            </div>

            {mechanism === 'reduction' && (
              <div className="mt-4 space-y-2 bg-secondary p-3 rounded border border-border">
                <div className="text-sm font-semibold text-foreground">Private Counters:</div>
                {threadAnimations.map(thread => (
                  <div key={thread.id} className="flex justify-between text-xs text-foreground">
                    <span>Thread {thread.id}:</span>
                    <span>{thread.privateCounter}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="concept" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="concept">Concept</TabsTrigger>
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="concept" className="space-y-6">
          {renderWhiteboardAnalogy()}
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <ControlPanel
            isRunning={isRunning}
            isPaused={isPaused}
            speed={speed}
            onSpeedChange={setSpeed}
            threads={threads}
            onThreadsChange={setThreads}
            onStart={start}
            onPauseResume={pauseResume}
            onReset={reset}
            disableThreadChange={isRunning}
            title="Thread Safety Controls"
          />

          {renderVisualization()}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Step-by-Step Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-y-auto border border-border">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                {logs.length === 0 && <div>Run simulation to see detailed execution logs...</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreadSafetyVisualization;
