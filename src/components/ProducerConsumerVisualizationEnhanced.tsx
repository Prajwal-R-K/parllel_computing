
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';

type MemoryState = 'stale' | 'fresh' | 'updating';
type ThreadActivity = 'idle' | 'writing' | 'reading' | 'flushing';

interface BufferItem {
  id: number;
  value: number;
  producedAt: number;
  visibility: MemoryState;
}

interface ThreadState {
  id: number;
  activity: ThreadActivity;
  localCache: { data: number; flag: number };
  visible: boolean;
}

const ProducerConsumerVisualizationEnhanced: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [useFlush, setUseFlush] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [buffer, setBuffer] = useState<BufferItem[]>([]);
  const [threads, setThreads] = useState<ThreadState[]>([
    { id: 0, activity: 'idle', localCache: { data: 0, flag: 0 }, visible: true },
    { id: 1, activity: 'idle', localCache: { data: 0, flag: 0 }, visible: true }
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-10));
  };

  const resetVisualization = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setCurrentStep(0);
    stepRef.current = 0;
    setBuffer([]);
    setThreads([
      { id: 0, activity: 'idle', localCache: { data: 0, flag: 0 }, visible: true },
      { id: 1, activity: 'idle', localCache: { data: 0, flag: 0 }, visible: true }
    ]);
    setLogs([]);
  };

  const simulateProducerConsumer = () => {
    setIsRunning(!isRunning);
    
    if (!isRunning) {
      timerRef.current = window.setInterval(() => {
        stepRef.current++;
        setCurrentStep(stepRef.current);

        // Producer writes data
        if (stepRef.current % 3 === 1) {
          const newValue = Math.floor(Math.random() * 100) + 1;
          const newItem: BufferItem = {
            id: stepRef.current,
            value: newValue,
            producedAt: Date.now(),
            visibility: useFlush ? 'fresh' : 'stale'
          };

          setBuffer(prev => [...prev, newItem].slice(-5));
          setThreads(prev => prev.map(t => 
            t.id === 0 
              ? { ...t, activity: 'writing', localCache: { data: newValue, flag: 1 } }
              : t
          ));
          addLog(`Producer: Writing value ${newValue} ${useFlush ? 'with flush' : 'without flush'}`);

          // Update consumer's local cache based on flush
          setTimeout(() => {
            setThreads(prev => prev.map(t => {
              if (t.id === 1) {
                return {
                  ...t,
                  localCache: useFlush 
                    ? { data: newValue, flag: 1 }
                    : { data: t.localCache.data, flag: Math.random() > 0.5 ? 1 : 0 } // Stale read
                };
              }
              return { ...t, activity: 'idle' };
            }));
          }, 500);
        }

        // Consumer reads data
        if (stepRef.current % 3 === 2) {
          setThreads(prev => {
            const consumer = prev.find(t => t.id === 1);
            const producer = prev.find(t => t.id === 0);
            
            if (consumer && producer) {
              const readData = useFlush ? producer.localCache.data : consumer.localCache.data;
              addLog(`Consumer: Reading value ${readData} ${useFlush ? '(correct)' : '(potentially stale)'}`);
              
              return prev.map(t => 
                t.id === 1 ? { ...t, activity: 'reading' } : t
              );
            }
            return prev;
          });

          setTimeout(() => {
            setThreads(prev => prev.map(t => ({ ...t, activity: 'idle' })));
          }, 500);
        }

        // Flush operation
        if (useFlush && stepRef.current % 3 === 0) {
          setThreads(prev => prev.map(t => ({ ...t, activity: 'flushing' })));
          setBuffer(prev => prev.map(item => ({ ...item, visibility: 'fresh' })));
          addLog('System: Memory flush - all caches synchronized');
          
          setTimeout(() => {
            setThreads(prev => prev.map(t => ({ ...t, activity: 'idle' })));
          }, 300);
        }
      }, 2000 / speed[0]);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const renderBuffer = () => (
    <div className="border-2 border-dashed border-primary rounded-lg p-4 min-h-[100px] bg-secondary/20">
      <h3 className="font-semibold mb-2 text-center">Shared Buffer</h3>
      <div className="grid grid-cols-5 gap-2">
        {buffer.map((item, index) => (
          <div
            key={item.id}
            className={`
              p-2 rounded text-center text-sm border-2 transition-all duration-500
              ${item.visibility === 'fresh' ? 'bg-green-500 text-white border-green-600' : 
                item.visibility === 'stale' ? 'bg-yellow-500 text-black border-yellow-600 opacity-60' : 
                'bg-gray-500 text-white border-gray-600'}
            `}
          >
            {item.value}
          </div>
        ))}
        {buffer.length === 0 && (
          <div className="col-span-5 text-center text-muted-foreground">Empty Buffer</div>
        )}
      </div>
    </div>
  );

  const renderThread = (thread: ThreadState) => (
    <div className="space-y-3">
      <div className="text-center font-semibold">
        Thread {thread.id} ({thread.id === 0 ? 'Producer' : 'Consumer'})
      </div>
      
      {/* Thread activity indicator */}
      <div className={`
        w-16 h-16 rounded-full mx-auto border-4 transition-all duration-300
        ${thread.activity === 'writing' ? 'bg-blue-500 border-blue-600 animate-pulse' :
          thread.activity === 'reading' ? 'bg-green-500 border-green-600 animate-pulse' :
          thread.activity === 'flushing' ? 'bg-purple-500 border-purple-600 animate-pulse' :
          'bg-gray-400 border-gray-500'}
      `}>
        <div className="w-full h-full flex items-center justify-center text-white font-bold">
          {thread.id}
        </div>
      </div>

      {/* Local cache representation */}
      <div className="border rounded p-3 bg-background">
        <div className="text-xs font-semibold mb-1">Local Cache</div>
        <div className="text-xs space-y-1">
          <div>Data: {thread.localCache.data}</div>
          <div>Flag: {thread.localCache.flag}</div>
        </div>
      </div>

      {/* Activity status */}
      <Badge variant={thread.activity === 'idle' ? 'secondary' : 'default'}>
        {thread.activity.toUpperCase()}
      </Badge>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-2">
      <h3 className="font-semibold">Execution Timeline</h3>
      <div className="bg-secondary rounded p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm">Producer writes data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Consumer reads data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm">Memory flush operation</span>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={simulateProducerConsumer} variant={isRunning ? "secondary" : "default"}>
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetVisualization} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={() => setUseFlush(!useFlush)} 
              variant={useFlush ? "default" : "outline"}
            >
              {useFlush ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Flush: {useFlush ? 'ON' : 'OFF'}
            </Button>
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

      {/* Memory Visibility Demonstration */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Producer (Thread 0)</CardTitle>
          </CardHeader>
          <CardContent>
            {renderThread(threads[0])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared Memory</CardTitle>
          </CardHeader>
          <CardContent>
            {renderBuffer()}
            <div className="mt-4 text-center">
              <Badge variant={useFlush ? "default" : "secondary"}>
                Memory Consistency: {useFlush ? 'Strong' : 'Weak'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Consumer (Thread 1)</CardTitle>
          </CardHeader>
          <CardContent>
            {renderThread(threads[1])}
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Logs */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeline Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTimeline()}
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

      {/* Step-by-step explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Memory Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">Without Flush (Stale Reads)</h4>
              <ul className="text-sm space-y-2">
                <li>• Producer writes to its local cache</li>
                <li>• Changes may not be immediately visible to consumer</li>
                <li>• Consumer might read outdated values</li>
                <li>• Can lead to inconsistent program behavior</li>
                <li>• Common in weakly ordered memory models</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">With Flush (Consistent Reads)</h4>
              <ul className="text-sm space-y-2">
                <li>• Explicit flush ensures memory synchronization</li>
                <li>• All threads see consistent view of memory</li>
                <li>• Guarantees visibility of all prior writes</li>
                <li>• Higher overhead but correct behavior</li>
                <li>• Required for critical algorithm correctness</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerConsumerVisualizationEnhanced;
