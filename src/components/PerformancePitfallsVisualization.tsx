
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ControlPanel from './common/ControlPanel';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, AlertTriangle, Shield, TrendingUp, Cpu, MemoryStick, Clock } from 'lucide-react';

interface BenchmarkResult {
  scenario: string;
  time: number;
  operations: number;
  throughput: number;
  efficiency: number;
}

interface CacheLineVisualization {
  id: number;
  data: number[];
  accessCount: number;
  invalidations: number;
  isHot: boolean;
}

const PerformancePitfallsVisualization: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [threads, setThreads] = useState(4);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [cacheLines, setCacheLines] = useState<CacheLineVisualization[]>([]);
  const [animatedAccess, setAnimatedAccess] = useState<number[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    falseSharingEvents: 0,
    totalOperations: 0
  });

  const initializeCacheLines = () => {
    const lines: CacheLineVisualization[] = [];
    for (let i = 0; i < 8; i++) {
      lines.push({
        id: i,
        data: Array(8).fill(0).map((_, idx) => i * 8 + idx),
        accessCount: 0,
        invalidations: 0,
        isHot: false
      });
    }
    setCacheLines(lines);
  };

  useEffect(() => {
    initializeCacheLines();
  }, []);

  const runBenchmark = async (scenario: 'no-padding' | 'with-padding' | 'atomic' | 'optimized') => {
    setIsRunning(true);
    setCurrentScenario(scenario);
    
    const iterations = Math.floor(1_000_000 / speed);
    const startTime = performance.now();
    
    // Simulate different scenarios
    let simulatedDelay = 0;
    let operations = 0;
    let falseSharingEvents = 0;
    let cacheEvents = { hits: 0, misses: 0 };

    switch (scenario) {
      case 'no-padding':
        // Simulate false sharing - high contention
        simulatedDelay = 150 + (threads * 20);
        operations = iterations;
        falseSharingEvents = Math.floor(iterations * 0.3);
        cacheEvents.misses = Math.floor(iterations * 0.4);
        cacheEvents.hits = iterations - cacheEvents.misses;
        animateFalseSharing();
        break;
        
      case 'with-padding':
        // Simulate padded access - reduced contention
        simulatedDelay = 80 + (threads * 5);
        operations = iterations;
        falseSharingEvents = Math.floor(iterations * 0.05);
        cacheEvents.misses = Math.floor(iterations * 0.15);
        cacheEvents.hits = iterations - cacheEvents.misses;
        animatePaddedAccess();
        break;
        
      case 'atomic':
        // Simulate atomic operations - synchronized but efficient
        simulatedDelay = 100 + (threads * 8);
        operations = iterations;
        falseSharingEvents = 0;
        cacheEvents.misses = Math.floor(iterations * 0.2);
        cacheEvents.hits = iterations - cacheEvents.misses;
        animateAtomicAccess();
        break;
        
      case 'optimized':
        // Simulate optimized access patterns
        simulatedDelay = 60 + (threads * 3);
        operations = iterations;
        falseSharingEvents = 0;
        cacheEvents.misses = Math.floor(iterations * 0.1);
        cacheEvents.hits = iterations - cacheEvents.misses;
        animateOptimizedAccess();
        break;
    }

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));
    
    const endTime = performance.now();
    const actualTime = endTime - startTime;
    const throughput = operations / (actualTime / 1000);
    const efficiency = Math.max(0, 100 - (falseSharingEvents / operations * 100));

    const result: BenchmarkResult = {
      scenario,
      time: actualTime,
      operations,
      throughput,
      efficiency
    };

    setBenchmarkResults(prev => [...prev.filter(r => r.scenario !== scenario), result]);
    setPerformanceMetrics(prev => ({
      cacheHits: prev.cacheHits + cacheEvents.hits,
      cacheMisses: prev.cacheMisses + cacheEvents.misses,
      falseSharingEvents: prev.falseSharingEvents + falseSharingEvents,
      totalOperations: prev.totalOperations + operations
    }));
    
    setIsRunning(false);
    setCurrentScenario('');
  };

  const animateFalseSharing = () => {
    // Simulate multiple threads accessing same cache line
    const hotLines = [0, 1];
    setCacheLines(prev => prev.map(line => ({
      ...line,
      isHot: hotLines.includes(line.id),
      accessCount: hotLines.includes(line.id) ? line.accessCount + threads : line.accessCount,
      invalidations: hotLines.includes(line.id) ? line.invalidations + threads - 1 : line.invalidations
    })));
    
    setAnimatedAccess(hotLines);
    setTimeout(() => setAnimatedAccess([]), 1000);
  };

  const animatePaddedAccess = () => {
    // Simulate threads accessing different cache lines
    const threadLines = Array.from({length: threads}, (_, i) => i);
    setCacheLines(prev => prev.map(line => ({
      ...line,
      isHot: threadLines.includes(line.id),
      accessCount: threadLines.includes(line.id) ? line.accessCount + 1 : line.accessCount,
      invalidations: line.invalidations
    })));
    
    setAnimatedAccess(threadLines);
    setTimeout(() => setAnimatedAccess([]), 1000);
  };

  const animateAtomicAccess = () => {
    // Simulate atomic access to single location
    setCacheLines(prev => prev.map((line, idx) => ({
      ...line,
      isHot: idx === 0,
      accessCount: idx === 0 ? line.accessCount + 1 : line.accessCount,
      invalidations: line.invalidations
    })));
    
    setAnimatedAccess([0]);
    setTimeout(() => setAnimatedAccess([]), 1000);
  };

  const animateOptimizedAccess = () => {
    // Simulate optimized access patterns
    const optimalLines = Array.from({length: Math.min(threads, 4)}, (_, i) => i * 2);
    setCacheLines(prev => prev.map(line => ({
      ...line,
      isHot: optimalLines.includes(line.id),
      accessCount: optimalLines.includes(line.id) ? line.accessCount + 1 : line.accessCount,
      invalidations: line.invalidations
    })));
    
    setAnimatedAccess(optimalLines);
    setTimeout(() => setAnimatedAccess([]), 1000);
  };

  const reset = () => {
    setBenchmarkResults([]);
    setPerformanceMetrics({
      cacheHits: 0,
      cacheMisses: 0,
      falseSharingEvents: 0,
      totalOperations: 0
    });
    initializeCacheLines();
    setAnimatedAccess([]);
    setCurrentScenario('');
    setIsRunning(false);
  };

  const renderCacheVisualization = () => (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-200 mb-2">Cache Line Visualization</div>
      <div className="grid grid-cols-4 gap-2">
        {cacheLines.map((line) => (
          <div key={line.id} className={`
            relative p-3 rounded-lg border-2 transition-all duration-500 transform
            ${animatedAccess.includes(line.id) ? 'scale-110 border-yellow-400 bg-gradient-to-r from-yellow-500/30 to-orange-500/30' :
              line.isHot ? 'border-red-400 bg-gradient-to-r from-red-500/20 to-red-600/20' :
              'border-slate-600 bg-gradient-to-r from-slate-800/50 to-slate-700/50'}
          `}>
            <div className="text-xs font-mono text-slate-300 mb-1">Line {line.id}</div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {line.data.slice(0, 4).map((val, idx) => (
                <div key={idx} className="w-3 h-3 bg-blue-500/50 rounded border border-blue-400/30 text-xs text-center leading-3">
                  {val}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              <div>Hits: {line.accessCount}</div>
              <div>Invalidations: {line.invalidations}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBenchmarkResults = () => (
    <div className="space-y-4">
      {benchmarkResults.map((result) => (
        <div key={result.scenario} className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {result.scenario === 'no-padding' && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {result.scenario === 'with-padding' && <Shield className="w-5 h-5 text-green-400" />}
              {result.scenario === 'atomic' && <Zap className="w-5 h-5 text-blue-400" />}
              {result.scenario === 'optimized' && <TrendingUp className="w-5 h-5 text-purple-400" />}
              <span className="font-semibold text-slate-200 capitalize">
                {result.scenario.replace('-', ' ')}
              </span>
            </div>
            <Badge variant={result.efficiency > 80 ? 'default' : result.efficiency > 60 ? 'secondary' : 'destructive'}>
              {result.efficiency.toFixed(1)}%
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Time</div>
              <div className="font-mono text-slate-200">{result.time.toFixed(1)}ms</div>
            </div>
            <div>
              <div className="text-slate-400">Throughput</div>
              <div className="font-mono text-slate-200">{(result.throughput / 1000).toFixed(1)}K ops/s</div>
            </div>
            <div>
              <div className="text-slate-400">Operations</div>
              <div className="font-mono text-slate-200">{result.operations.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <ControlPanel
        isRunning={isRunning}
        isPaused={isPaused}
        speed={speed}
        onSpeedChange={setSpeed}
        threads={threads}
        onThreadsChange={setThreads}
        onStart={() => {}}
        onPauseResume={() => {}}
        onReset={reset}
        disableThreadChange={isRunning}
        title="Performance Pitfalls Controls"
      />

      <Tabs defaultValue="benchmark" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="cache">Cache Visualization</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmark" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Cpu className="w-5 h-5" />
                Memory Access Patterns Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => runBenchmark('no-padding')}
                  disabled={isRunning}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  False Sharing
                </Button>
                <Button
                  onClick={() => runBenchmark('with-padding')}
                  disabled={isRunning}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  With Padding
                </Button>
                <Button
                  onClick={() => runBenchmark('atomic')}
                  disabled={isRunning}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Atomic Ops
                </Button>
                <Button
                  onClick={() => runBenchmark('optimized')}
                  disabled={isRunning}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Optimized
                </Button>
              </div>

              {isRunning && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-slate-200">Running {currentScenario} benchmark...</span>
                  </div>
                  <Progress value={undefined} className="h-2" />
                </div>
              )}

              {renderBenchmarkResults()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <MemoryStick className="w-5 h-5" />
                Cache Line Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCacheVisualization()}
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-red-400">
                    {cacheLines.reduce((sum, line) => sum + line.invalidations, 0)}
                  </div>
                  <div className="text-xs text-slate-400">Cache Invalidations</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-green-400">
                    {cacheLines.reduce((sum, line) => sum + line.accessCount, 0)}
                  </div>
                  <div className="text-xs text-slate-400">Total Accesses</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {cacheLines.filter(line => line.isHot).length}
                  </div>
                  <div className="text-xs text-slate-400">Hot Cache Lines</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {((cacheLines.reduce((sum, line) => sum + line.accessCount, 0) - 
                       cacheLines.reduce((sum, line) => sum + line.invalidations, 0)) / 
                      Math.max(1, cacheLines.reduce((sum, line) => sum + line.accessCount, 0)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400">Cache Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <TrendingUp className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-green-400">{performanceMetrics.cacheHits.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Cache Hits</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-red-400">{performanceMetrics.cacheMisses.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Cache Misses</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-orange-400">{performanceMetrics.falseSharingEvents.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">False Sharing Events</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-blue-400">{performanceMetrics.totalOperations.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Total Operations</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>Cache Hit Rate</span>
                    <span>{(performanceMetrics.cacheHits / Math.max(1, performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={performanceMetrics.cacheHits / Math.max(1, performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>False Sharing Impact</span>
                    <span>{(performanceMetrics.falseSharingEvents / Math.max(1, performanceMetrics.totalOperations) * 100).toFixed(2)}%</span>
                  </div>
                  <Progress 
                    value={performanceMetrics.falseSharingEvents / Math.max(1, performanceMetrics.totalOperations) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformancePitfallsVisualization;
