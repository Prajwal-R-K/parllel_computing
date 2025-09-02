import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Cpu, Users, Clock, Zap, Shield, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SynchronizationVisualizationEnhanced from '@/components/SynchronizationVisualizationEnhanced';
import SynchronizationCodeExamples from '@/components/SynchronizationCodeExamples';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SynchronizationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Synchronization Primitives
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore OpenMP synchronization mechanisms including barriers, single, and master directives with interactive visualizations and comprehensive analysis of the bank account problem.
          </p>
        </div>

        <Tabs defaultValue="visualization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visualization">Interactive Demo</TabsTrigger>
            <TabsTrigger value="concepts">Core Concepts</TabsTrigger>
            <TabsTrigger value="code-examples">Code Examples</TabsTrigger>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="applications">Real-World Uses</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Synchronization Visualization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive bank account demonstration showing race conditions and synchronization solutions
                </p>
              </CardHeader>
              <CardContent>
                <SynchronizationVisualizationEnhanced />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            {/* Core Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Synchronization Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">What is Synchronization?</h3>
                  <p className="text-sm mb-4">
                    Synchronization is the coordination of concurrent threads to ensure correct program execution. 
                    It controls when threads can execute certain code sections and how they communicate.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Why Synchronization?</h4>
                      <ul className="space-y-1">
                        <li>• Coordinate thread execution order</li>
                        <li>• Prevent race conditions</li>
                        <li>• Ensure data consistency</li>
                        <li>• Implement communication protocols</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Synchronization Goals</h4>
                      <ul className="space-y-1">
                        <li>• Mutual exclusion (safety)</li>
                        <li>• Progress (liveness)</li>
                        <li>• Fairness (no starvation)</li>
                        <li>• Performance (minimal overhead)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-600 text-base">
                        <Users className="w-5 h-5" />
                        Barrier Synchronization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        All threads must reach the barrier point before any thread can proceed past it.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Coordination Pattern</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Use Case:</strong> Phase synchronization</p>
                          <p><strong>Behavior:</strong> Wait for all threads</p>
                          <p><strong>Performance:</strong> Limited by slowest thread</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
                        <Zap className="w-5 h-5" />
                        Single Construct
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Only one thread (any thread) executes the single block, others skip it entirely.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Execution Pattern</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Use Case:</strong> One-time initialization</p>
                          <p><strong>Behavior:</strong> First-come, first-serve</p>
                          <p><strong>Performance:</strong> Implicit barrier after</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600 text-base">
                        <Shield className="w-5 h-5" />
                        Master Construct
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Only the master thread (Thread 0) executes master blocks, providing predictable behavior.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Control Pattern</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Use Case:</strong> I/O operations, coordination</p>
                          <p><strong>Behavior:</strong> Thread 0 only</p>
                          <p><strong>Performance:</strong> No implicit barrier</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Synchronization Overhead Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600">Performance Costs</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border rounded p-3">
                          <p className="font-semibold">Thread Coordination Overhead</p>
                          <p>Time spent waiting and signaling between threads</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Memory Synchronization</p>
                          <p>Cache invalidation and memory coherence protocols</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Load Imbalance</p>
                          <p>Fastest threads wait for slowest in barriers</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-600">Optimization Strategies</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border rounded p-3">
                          <p className="font-semibold">Minimize Synchronization Points</p>
                          <p>Reduce frequency of coordination between threads</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Balance Workload</p>
                          <p>Ensure equal work distribution across threads</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Use Appropriate Granularity</p>
                          <p>Match synchronization scope to problem requirements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advantages and Disadvantages */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Shield className="w-5 h-5" />
                    Advantages of Synchronization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Correctness Guarantee</p>
                        <p className="text-muted-foreground">Ensures thread-safe execution and prevents race conditions</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Predictable Behavior</p>
                        <p className="text-muted-foreground">Provides deterministic execution patterns for critical sections</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Resource Management</p>
                        <p className="text-muted-foreground">Coordinates access to shared resources and prevents conflicts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Phase Coordination</p>
                        <p className="text-muted-foreground">Enables multi-phase algorithms with dependencies between phases</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Disadvantages & Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Performance Bottlenecks</p>
                      <p className="text-muted-foreground mb-2">Synchronization creates serialization points</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Minimize critical sections, use lock-free algorithms where possible
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Load Imbalance Impact</p>
                      <p className="text-muted-foreground mb-2">Barriers amplify effects of uneven work distribution</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Dynamic load balancing, work-stealing algorithms
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Scalability Limitations</p>
                      <p className="text-muted-foreground mb-2">Overhead increases with thread count</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Hierarchical synchronization, reduce synchronization frequency
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Programming Complexity</p>
                      <p className="text-muted-foreground mb-2">Deadlocks and race conditions become possible</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Use high-level constructs, formal verification, extensive testing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="code-examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples & Runtime Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real OpenMP implementations with detailed runtime behavior analysis
                </p>
              </CardHeader>
              <CardContent>
                <SynchronizationCodeExamples />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Performance Characteristics & Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Synchronization Overhead</h4>
                        <div className="text-sm space-y-1">
                          <p>• <strong>Barrier:</strong> O(log n) to O(n) depending on implementation</p>
                          <p>• <strong>Single:</strong> Constant overhead + barrier cost</p>
                          <p>• <strong>Master:</strong> Minimal overhead, no barrier</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Scalability Factors</h4>
                        <div className="text-sm space-y-1">
                          <p>• Number of threads participating</p>
                          <p>• Frequency of synchronization points</p>
                          <p>• Hardware architecture (NUMA effects)</p>
                          <p>• Memory bandwidth and latency</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Optimization Techniques</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-blue-600">Reduce Sync Frequency</h4>
                        <p className="text-sm">
                          Combine multiple operations between synchronization points.
                          Use local computation and batch updates.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-green-600">Hierarchical Barriers</h4>
                        <p className="text-sm">
                          Use tree-based or tournament barriers for better scalability
                          on large-scale systems.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-purple-600">Relaxed Consistency</h4>
                        <p className="text-sm">
                          Use relaxed memory models where strict ordering isn't required
                          for better performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Comparison Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2">
                          <th className="text-left p-3">Construct</th>
                          <th className="text-left p-3">Overhead</th>
                          <th className="text-left p-3">Scalability</th>
                          <th className="text-left p-3">Use Case</th>
                          <th className="text-left p-3">Best Practice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Barrier</td>
                          <td className="p-3">
                            <Badge variant="destructive">High</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">Poor</Badge>
                          </td>
                          <td className="p-3">Phase synchronization, iterative algorithms</td>
                          <td className="p-3">Minimize frequency, balance load</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Single</td>
                          <td className="p-3">
                            <Badge variant="secondary">Medium</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">Fair</Badge>
                          </td>
                          <td className="p-3">Initialization, I/O operations</td>
                          <td className="p-3">Keep single blocks small</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Master</td>
                          <td className="p-3">
                            <Badge variant="default">Low</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="default">Good</Badge>
                          </td>
                          <td className="p-3">Coordination, result collection</td>
                          <td className="p-3">Avoid bottlenecks in master thread</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Applications & Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-purple-600">🧮 Scientific Computing</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Barrier Usage:</strong> Iterative solvers (Jacobi, Gauss-Seidel)</p>
                      <p><strong>Pattern:</strong> Compute → Synchronize → Check convergence</p>
                      <p><strong>Example:</strong> Finite element analysis, climate modeling</p>
                      <Badge variant="outline" className="mt-2">Phase-based algorithms</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-blue-600">🎮 Game Engines</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Single Usage:</strong> Resource loading, asset initialization</p>
                      <p><strong>Pattern:</strong> One-time setup for shared game state</p>
                      <p><strong>Example:</strong> Texture loading, physics world initialization</p>
                      <Badge variant="outline" className="mt-2">Initialization patterns</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-green-600">🏭 Manufacturing Control</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Master Usage:</strong> Supervisory control, data logging</p>
                      <p><strong>Pattern:</strong> Master coordinates, workers execute</p>
                      <p><strong>Example:</strong> Production line control, quality monitoring</p>
                      <Badge variant="outline" className="mt-2">Control hierarchies</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-orange-600">🧬 Bioinformatics</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Barrier Usage:</strong> Sequence alignment, phylogenetic analysis</p>
                      <p><strong>Pattern:</strong> Parallel computation with periodic synchronization</p>
                      <p><strong>Example:</strong> BLAST search, genome assembly</p>
                      <Badge variant="outline" className="mt-2">Data-parallel algorithms</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-red-600">🔬 High-Energy Physics</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Single Usage:</strong> Detector calibration, event reconstruction</p>
                      <p><strong>Pattern:</strong> Setup shared detector geometry once</p>
                      <p><strong>Example:</strong> CERN LHC data processing</p>
                      <Badge variant="outline" className="mt-2">Large-scale data processing</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-teal-600">💰 Financial Trading</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Master Usage:</strong> Market data distribution, risk management</p>
                      <p><strong>Pattern:</strong> Master receives data, workers process orders</p>
                      <p><strong>Example:</strong> High-frequency trading systems</p>
                      <Badge variant="outline" className="mt-2">Low-latency systems</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Implementation Guidelines by Domain</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">High-Performance Computing (HPC)</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Use hierarchical barriers for large node counts</li>
                        <li>• Minimize synchronization in inner loops</li>
                        <li>• Overlap communication with computation</li>
                        <li>• Consider NUMA topology in thread placement</li>
                        <li>• Profile synchronization overhead regularly</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-600">Real-Time Systems</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Bound worst-case synchronization time</li>
                        <li>• Use priority-aware synchronization</li>
                        <li>• Avoid unbounded waiting in critical paths</li>
                        <li>• Design for deterministic behavior</li>
                        <li>• Test under maximum load conditions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Advanced Synchronization Patterns</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-300">Producer-Consumer with Barriers</h4>
                      <pre className="text-sm overflow-x-auto">
                        <code>{`#pragma omp parallel sections
{
  #pragma omp section  // Producer
  {
    for(int batch = 0; batch < num_batches; batch++) {
      produce_batch(batch);
      #pragma omp barrier  // Wait for consumers
    }
  }
  
  #pragma omp section  // Consumer 1
  {
    for(int batch = 0; batch < num_batches; batch++) {
      #pragma omp barrier  // Wait for producer
      consume_batch_part1(batch);
    }
  }
  
  #pragma omp section  // Consumer 2
  {
    for(int batch = 0; batch < num_batches; batch++) {
      #pragma omp barrier  // Wait for producer
      consume_batch_part2(batch);
    }
  }
}`}</code>
                      </pre>
                    </div>
                    
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-300">Master-Worker with Dynamic Assignment</h4>
                      <pre className="text-sm overflow-x-auto">
                        <code>{`#pragma omp parallel
{
  #pragma omp master
  {
    // Master distributes work dynamically
    for(int task = 0; task < total_tasks; task++) {
      int worker = get_next_available_worker();
      assign_task_to_worker(task, worker);
    }
    signal_completion();
  }
  
  // Workers process assigned tasks
  int my_task;
  while((my_task = get_my_next_task()) >= 0) {
    process_task(my_task);
    report_completion(my_task);
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SynchronizationPage;
