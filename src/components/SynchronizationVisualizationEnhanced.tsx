
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Lock, Unlock, Users, DollarSign } from 'lucide-react';

type ThreadState = 'waiting' | 'in_critical' | 'working' | 'completed';
type SyncMechanism = 'none' | 'critical' | 'atomic' | 'mutex';

interface Thread {
  id: number;
  state: ThreadState;
  position: number;
  balance: number;
  waitTime: number;
  hasLock: boolean;
}

interface BankAccount {
  balance: number;
  isLocked: boolean;
  lockHolder: number | null;
}

const SynchronizationVisualizationEnhanced: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [syncMechanism, setSyncMechanism] = useState<SyncMechanism>('none');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount>({ balance: 100, isLocked: false, lockHolder: null });
  const [logs, setLogs] = useState<string[]>([]);
  const [executionHistory, setExecutionHistory] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const initializeThreads = () => {
    const threadCount = 4;
    const newThreads: Thread[] = Array.from({ length: threadCount }, (_, i) => ({
      id: i,
      state: 'waiting',
      position: 0,
      balance: 0,
      waitTime: 0,
      hasLock: false
    }));
    setThreads(newThreads);
    setBankAccount({ balance: 100, isLocked: false, lockHolder: null });
    setLogs([]);
    setExecutionHistory([]);
    stepRef.current = 0;
  };

  const addLog = (message: string, threadId?: number) => {
    const timestamp = new Date().toLocaleTimeString();
    const threadLabel = threadId !== undefined ? `Thread ${threadId}` : 'System';
    setLogs(prev => [...prev, `[${timestamp}] ${threadLabel}: ${message}`].slice(-15));
  };

  const simulateWithoutSync = () => {
    setThreads(prev => prev.map(thread => {
      if (thread.state === 'waiting' && Math.random() < 0.3) {
        // Thread reads balance
        const readBalance = bankAccount.balance;
        addLog(`Read balance: ${readBalance}`, thread.id);
        
        // Simulate some processing time
        setTimeout(() => {
          // Thread writes new balance (race condition possible)
          const newBalance = readBalance + 50;
          setBankAccount(prev => ({ ...prev, balance: newBalance }));
          addLog(`Updated balance to: ${newBalance}`, thread.id);
          setExecutionHistory(prev => [...prev, newBalance]);
        }, Math.random() * 1000);
        
        return { ...thread, state: 'working' };
      }
      return thread;
    }));
  };

  const simulateWithCritical = () => {
    setThreads(prev => prev.map(thread => {
      if (thread.state === 'waiting' && !bankAccount.isLocked && Math.random() < 0.3) {
        // Enter critical section
        setBankAccount(prev => ({ ...prev, isLocked: true, lockHolder: thread.id }));
        addLog(`Entered critical section`, thread.id);
        
        // Perform atomic update
        setTimeout(() => {
          setBankAccount(prev => {
            const newBalance = prev.balance + 50;
            addLog(`Updated balance: ${prev.balance} → ${newBalance}`, thread.id);
            setExecutionHistory(prevHist => [...prevHist, newBalance]);
            return { balance: newBalance, isLocked: false, lockHolder: null };
          });
          
          setThreads(prevThreads => prevThreads.map(t => 
            t.id === thread.id ? { ...t, state: 'completed' } : t
          ));
          addLog(`Exited critical section`, thread.id);
        }, 800 / speed[0]);
        
        return { ...thread, state: 'in_critical', hasLock: true };
      } else if (thread.state === 'waiting' && bankAccount.isLocked) {
        // Thread waits
        return { ...thread, waitTime: thread.waitTime + 1 };
      }
      return thread;
    }));
  };

  const simulateWithAtomic = () => {
    setThreads(prev => prev.map(thread => {
      if (thread.state === 'waiting' && Math.random() < 0.4) {
        // Atomic operation (simulated)
        setBankAccount(prev => {
          const newBalance = prev.balance + 50;
          addLog(`Atomic update: ${prev.balance} → ${newBalance}`, thread.id);
          setExecutionHistory(prevHist => [...prevHist, newBalance]);
          return { ...prev, balance: newBalance };
        });
        
        return { ...thread, state: 'completed' };
      }
      return thread;
    }));
  };

  const startSimulation = () => {
    if (!isRunning) {
      initializeThreads();
      addLog(`Starting simulation with ${syncMechanism} synchronization`);
      
      timerRef.current = window.setInterval(() => {
        stepRef.current++;
        
        switch (syncMechanism) {
          case 'none':
            simulateWithoutSync();
            break;
          case 'critical':
            simulateWithCritical();
            break;
          case 'atomic':
            simulateWithAtomic();
            break;
          default:
            break;
        }
      }, 1000 / speed[0]);
      
      setIsRunning(true);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const resetSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    initializeThreads();
  };

  const renderBankAccount = () => (
    <div className="text-center space-y-4">
      <div className={`
        w-32 h-32 mx-auto rounded-lg border-4 flex items-center justify-center transition-all duration-300
        ${bankAccount.isLocked ? 'border-red-500 bg-red-100' : 'border-green-500 bg-green-100'}
      `}>
        <div className="text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2" />
          <div className="font-bold text-lg">₹{bankAccount.balance}</div>
          {bankAccount.isLocked && (
            <div className="text-xs text-red-600">
              <Lock className="w-3 h-3 inline mr-1" />
              Thread {bankAccount.lockHolder}
            </div>
          )}
        </div>
      </div>
      
      <Badge variant={bankAccount.isLocked ? "destructive" : "default"}>
        {bankAccount.isLocked ? 'LOCKED' : 'AVAILABLE'}
      </Badge>
    </div>
  );

  const renderThread = (thread: Thread) => (
    <div className="space-y-3 p-3 border rounded-lg">
      <div className="text-center font-semibold">Thread {thread.id}</div>
      
      <div className={`
        w-12 h-12 rounded-full mx-auto border-4 transition-all duration-300
        ${thread.state === 'waiting' ? 'bg-yellow-500 border-yellow-600' :
          thread.state === 'in_critical' ? 'bg-red-500 border-red-600 animate-pulse' :
          thread.state === 'working' ? 'bg-blue-500 border-blue-600 animate-pulse' :
          'bg-green-500 border-green-600'}
      `}>
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
          {thread.id}
        </div>
      </div>

      <Badge variant={
        thread.state === 'waiting' ? 'secondary' :
        thread.state === 'in_critical' ? 'destructive' :
        thread.state === 'working' ? 'default' :
        'outline'
      }>
        {thread.state.replace('_', ' ').toUpperCase()}
      </Badge>

      {thread.waitTime > 0 && (
        <div className="text-xs text-center text-muted-foreground">
          Wait time: {thread.waitTime}
        </div>
      )}
    </div>
  );

  const renderCriticalSectionDoor = () => (
    <div className="text-center space-y-2">
      <div className={`
        w-20 h-24 mx-auto border-4 rounded-lg transition-all duration-300 flex items-center justify-center
        ${bankAccount.isLocked ? 'border-red-500 bg-red-100' : 'border-green-500 bg-green-100'}
      `}>
        {bankAccount.isLocked ? (
          <Lock className="w-8 h-8 text-red-600" />
        ) : (
          <Unlock className="w-8 h-8 text-green-600" />
        )}
      </div>
      <div className="text-xs font-semibold">Critical Section</div>
      {bankAccount.lockHolder !== null && (
        <div className="text-xs text-red-600">
          Thread {bankAccount.lockHolder} inside
        </div>
      )}
    </div>
  );

  const renderExecutionHistory = () => (
    <div className="space-y-2">
      <h4 className="font-semibold">Balance History</h4>
      <div className="flex flex-wrap gap-1">
        {executionHistory.map((balance, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            ₹{balance}
          </Badge>
        ))}
      </div>
      <div className="text-sm">
        Expected: ₹{100 + threads.filter(t => t.state === 'completed').length * 50} | 
        Actual: ₹{bankAccount.balance} 
        <Badge variant={100 + threads.filter(t => t.state === 'completed').length * 50 === bankAccount.balance ? "default" : "destructive"} className="ml-2">
          {100 + threads.filter(t => t.state === 'completed').length * 50 === bankAccount.balance ? "Correct" : "Race Condition!"}
        </Badge>
      </div>
    </div>
  );

  useEffect(() => {
    initializeThreads();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Account Synchronization Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={startSimulation} variant={isRunning ? "secondary" : "default"}>
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Synchronization Method</label>
            <div className="flex gap-2">
              {(['none', 'critical', 'atomic'] as SyncMechanism[]).map(method => (
                <Button
                  key={method}
                  onClick={() => setSyncMechanism(method)}
                  variant={syncMechanism === method ? "default" : "outline"}
                  size="sm"
                >
                  {method === 'none' ? 'No Sync' : method.charAt(0).toUpperCase() + method.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Speed: {speed[0]}x</label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              max={3}
              min={0.5}
              step={0.5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            {renderBankAccount()}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-center">Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {threads.map(thread => (
                <div key={thread.id}>
                  {renderThread(thread)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCriticalSectionDoor()}
          </CardContent>
        </Card>
      </div>

      {/* Results and Logs */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
          </CardHeader>
          <CardContent>
            {renderExecutionHistory()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {logs.length === 0 && <div>No activity yet. Start the simulation to see logs.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanations */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding the Demonstration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">No Synchronization</h4>
              <ul className="text-sm space-y-1">
                <li>• Threads read balance simultaneously</li>
                <li>• Multiple threads see same initial value</li>
                <li>• Lost updates due to race conditions</li>
                <li>• Final balance incorrect</li>
                <li>• Unpredictable behavior</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">Critical Section</h4>
              <ul className="text-sm space-y-1">
                <li>• Only one thread enters at a time</li>
                <li>• Mutual exclusion guaranteed</li>
                <li>• Sequential access to shared resource</li>
                <li>• Correct final balance</li>
                <li>• Higher overhead due to blocking</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Atomic Operations</h4>
              <ul className="text-sm space-y-1">
                <li>• Hardware-level atomicity</li>
                <li>• No explicit locking needed</li>
                <li>• Fast execution</li>
                <li>• Suitable for simple operations</li>
                <li>• Lower overhead than critical sections</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SynchronizationVisualizationEnhanced;
