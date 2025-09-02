
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Lock, Unlock, Users, AlertTriangle, CheckCircle, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import LocksVisualization from '@/components/LocksVisualization';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LocksPage: React.FC = () => {
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
            Locks & Mutual Exclusion
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore OpenMP locking mechanisms including critical sections, atomic operations, and mutex locks with interactive visualizations and comprehensive analysis.
          </p>
        </div>

        <Tabs defaultValue="visualization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visualization">Interactive Demo</TabsTrigger>
            <TabsTrigger value="concepts">Core Concepts</TabsTrigger>
            <TabsTrigger value="mechanisms">Lock Mechanisms</TabsTrigger>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="applications">Applications & Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Locks Visualization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Watch how different locking mechanisms coordinate thread access to shared resources
                </p>
              </CardHeader>
              <CardContent>
                <LocksVisualization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            {/* Core Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Mutual Exclusion & Locking Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">What is Mutual Exclusion?</h3>
                  <p className="text-sm mb-4">
                    Mutual exclusion ensures that only one thread can access a critical section of code at a time, 
                    preventing race conditions and maintaining data consistency in concurrent programs.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Critical Section Properties</h4>
                      <ul className="space-y-1">
                        <li>• <strong>Mutual Exclusion:</strong> Only one thread at a time</li>
                        <li>• <strong>Progress:</strong> Non-blocking for waiting threads</li>
                        <li>• <strong>Bounded Waiting:</strong> Fair access guarantees</li>
                        <li>• <strong>Performance:</strong> Minimal overhead</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Race Condition Prevention</h4>
                      <ul className="space-y-1">
                        <li>• Atomic read-modify-write operations</li>
                        <li>• Synchronized access to shared variables</li>
                        <li>• Consistent ordering of operations</li>
                        <li>• Memory visibility guarantees</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                        <Lock className="w-5 h-5" />
                        Critical Sections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Code blocks that access shared resources and must be executed by only one thread at a time.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Exclusive Access</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Usage:</strong> #pragma omp critical</p>
                          <p><strong>Behavior:</strong> Named or unnamed sections</p>
                          <p><strong>Performance:</strong> Serialization bottleneck</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600 text-base">
                        <Shield className="w-5 h-5" />
                        Atomic Operations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Hardware-level operations that complete without interruption, ensuring atomicity for simple operations.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Hardware Level</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Usage:</strong> #pragma omp atomic</p>
                          <p><strong>Behavior:</strong> Single memory location</p>
                          <p><strong>Performance:</strong> Very low overhead</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-600 text-base">
                        <Users className="w-5 h-5" />
                        Mutex Locks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Explicit lock objects that provide fine-grained control over thread synchronization and resource access.
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">Explicit Control</Badge>
                        <div className="text-xs space-y-1">
                          <p><strong>Usage:</strong> omp_lock_t variables</p>
                          <p><strong>Behavior:</strong> Set/unset operations</p>
                          <p><strong>Performance:</strong> Flexible overhead</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Lock Implementation Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">Hardware Support</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border rounded p-3">
                          <p className="font-semibold">Compare-and-Swap (CAS)</p>
                          <p>Atomic instruction for lock-free programming</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Test-and-Set</p>
                          <p>Basic atomic operation for simple locks</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Load-Link/Store-Conditional</p>
                          <p>Advanced atomicity guarantees</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-600">Software Optimizations</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border rounded p-3">
                          <p className="font-semibold">Backoff Strategies</p>
                          <p>Reduce contention through adaptive delays</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Queue-based Locks</p>
                          <p>Fair ordering and reduced cache misses</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-semibold">Reader-Writer Locks</p>
                          <p>Multiple readers, exclusive writers</p>
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
                    <CheckCircle className="w-5 h-5" />
                    Advantages of Locking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Data Consistency</p>
                        <p className="text-muted-foreground">Prevents race conditions and ensures atomic updates</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Predictable Behavior</p>
                        <p className="text-muted-foreground">Deterministic execution order for critical sections</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Resource Protection</p>
                        <p className="text-muted-foreground">Safe access to shared resources and data structures</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Composability</p>
                        <p className="text-muted-foreground">Can be combined with other synchronization primitives</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Disadvantages & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Performance Bottlenecks</p>
                      <p className="text-muted-foreground mb-2">Serialization reduces parallelism benefits</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Minimize critical section size, use fine-grained locking
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Deadlock Potential</p>
                      <p className="text-muted-foreground mb-2">Multiple locks can create circular dependencies</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Lock ordering, timeout mechanisms, deadlock detection
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Priority Inversion</p>
                      <p className="text-muted-foreground mb-2">High-priority threads blocked by low-priority ones</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Priority inheritance protocols, priority ceiling
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Cache Effects</p>
                      <p className="text-muted-foreground mb-2">False sharing and cache line bouncing</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solution:</strong> Padding, thread-local storage, lock-free algorithms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mechanisms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>OpenMP Locking Mechanisms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Critical Sections</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`// Basic critical section
#pragma omp parallel
{
  #pragma omp critical
  {
    shared_counter++;
    printf("Thread %d: %d\\n", 
           omp_get_thread_num(), 
           shared_counter);
  }
}

// Named critical section
#pragma omp critical(update_data)
{
  update_shared_data();
}`}</code>
                      </pre>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong>Use Case:</strong> Complex operations on shared data</p>
                      <p><strong>Granularity:</strong> Coarse-grained locking</p>
                      <p><strong>Performance:</strong> Higher overhead, full serialization</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Atomic Operations</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`// Atomic increment
#pragma omp atomic
counter++;

// Atomic update
#pragma omp atomic
sum += local_value;

// Atomic capture
#pragma omp atomic capture
{
  old_value = counter;
  counter += increment;
}`}</code>
                      </pre>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong>Use Case:</strong> Simple operations (increment, add, etc.)</p>
                      <p><strong>Granularity:</strong> Single memory location</p>
                      <p><strong>Performance:</strong> Very low overhead</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600">Explicit Locks</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`omp_lock_t lock;
omp_init_lock(&lock);

#pragma omp parallel
{
  omp_set_lock(&lock);
  // Critical section
  shared_resource++;
  omp_unset_lock(&lock);
}

omp_destroy_lock(&lock);

// Nested locks
omp_nest_lock_t nest_lock;
omp_init_nest_lock(&nest_lock):`}</code>
                      </pre>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong>Use Case:</strong> Complex synchronization patterns</p>
                      <p><strong>Granularity:</strong> Flexible, programmer-controlled</p>
                      <p><strong>Performance:</strong> Variable, depends on usage</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Advanced Locking Patterns</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-300">Reader-Writer Pattern</h4>
                      <pre className="text-sm overflow-x-auto">
                        <code>{`// Multiple readers, single writer
omp_lock_t read_count_lock;
omp_lock_t write_lock;
int read_count = 0;

// Reader thread
void reader() {
  omp_set_lock(&read_count_lock);
  read_count++;
  if (read_count == 1) {
    omp_set_lock(&write_lock);  // First reader blocks writers
  }
  omp_unset_lock(&read_count_lock);
  
  // Reading...
  read_shared_data();
  
  omp_set_lock(&read_count_lock);
  read_count--;
  if (read_count == 0) {
    omp_unset_lock(&write_lock);  // Last reader unblocks writers
  }
  omp_unset_lock(&read_count_lock);
}

// Writer thread
void writer() {
  omp_set_lock(&write_lock);
  write_shared_data();
  omp_unset_lock(&write_lock);
}`}</code>
                      </pre>
                    </div>
                    
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-300">Producer-Consumer with Locks</h4>
                      <pre className="text-sm overflow-x-auto">
                        <code>{`typedef struct {
  int *buffer;
  int size;
  int count;
  int in, out;
  omp_lock_t mutex;
} bounded_buffer_t;

void produce(bounded_buffer_t *bb, int item) {
  omp_set_lock(&bb->mutex);
  while (bb->count == bb->size) {
    // Buffer full, wait (simplified)
    omp_unset_lock(&bb->mutex);
    // In real implementation, use condition variables
    omp_set_lock(&bb->mutex);
  }
  bb->buffer[bb->in] = item;
  bb->in = (bb->in + 1) % bb->size;
  bb->count++;
  omp_unset_lock(&bb->mutex);
}

int consume(bounded_buffer_t *bb) {
  omp_set_lock(&bb->mutex);
  while (bb->count == 0) {
    // Buffer empty, wait
    omp_unset_lock(&bb->mutex);
    omp_set_lock(&bb->mutex);
  }
  int item = bb->buffer[bb->out];
  bb->out = (bb->out + 1) % bb->size;
  bb->count--;
  omp_unset_lock(&bb->mutex);
  return item;
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
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
                    <h3 className="text-lg font-semibold">Lock Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Acquisition Latency</h4>
                        <div className="text-sm space-y-1">
                          <p>• <strong>Uncontended:</strong> 10-50 CPU cycles</p>
                          <p>• <strong>Light contention:</strong> 100-1000 cycles</p>
                          <p>• <strong>Heavy contention:</strong> 1000+ cycles</p>
                          <p>• <strong>NUMA effects:</strong> 2-10x penalty</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Throughput Impact</h4>
                        <div className="text-sm space-y-1">
                          <p>• Critical section length vs. parallelism</p>
                          <p>• Lock granularity trade-offs</p>
                          <p>• Cache line sharing effects</p>
                          <p>• Memory bandwidth saturation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Optimization Strategies</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-blue-600">Reduce Lock Scope</h4>
                        <p className="text-sm">
                          Minimize time spent in critical sections. Pre-compute values
                          outside locks when possible.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-green-600">Fine-Grained Locking</h4>
                        <p className="text-sm">
                          Use multiple locks for different data structures to
                          reduce contention and increase parallelism.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-purple-600">Lock-Free Alternatives</h4>
                        <p className="text-sm">
                          Consider atomic operations, compare-and-swap, or
                          lock-free data structures for high-performance scenarios.
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
                          <th className="text-left p-3">Mechanism</th>
                          <th className="text-left p-3">Overhead</th>
                          <th className="text-left p-3">Scalability</th>
                          <th className="text-left p-3">Use Case</th>
                          <th className="text-left p-3">Best Practice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Atomic</td>
                          <td className="p-3">
                            <Badge variant="default">Very Low</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="default">Excellent</Badge>
                          </td>
                          <td className="p-3">Simple operations (++, +=, etc.)</td>
                          <td className="p-3">Use for counters, flags</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Critical</td>
                          <td className="p-3">
                            <Badge variant="secondary">Medium</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">Poor</Badge>
                          </td>
                          <td className="p-3">Complex operations on shared data</td>
                          <td className="p-3">Keep sections small</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Mutex</td>
                          <td className="p-3">
                            <Badge variant="outline">Variable</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">Good</Badge>
                          </td>
                          <td className="p-3">Complex synchronization patterns</td>
                          <td className="p-3">Fine-grained locking</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Common Performance Anti-Patterns</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Problems ❌</h4>
                      <ul className="text-sm space-y-2">
                        <li>• <strong>Coarse-grained locks:</strong> Single lock for entire data structure</li>
                        <li>• <strong>Long critical sections:</strong> Complex computations inside locks</li>
                        <li>• <strong>Unnecessary locking:</strong> Thread-local data in critical sections</li>
                        <li>• <strong>False sharing:</strong> Multiple threads updating nearby memory</li>
                        <li>• <strong>Lock convoy:</strong> All threads contending for same lock</li>
                        <li>• <strong>Priority inversion:</strong> Low-priority thread blocking high-priority</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Solutions ✅</h4>
                      <ul className="text-sm space-y-2">
                        <li>• <strong>Fine-grained locking:</strong> Separate locks for different data</li>
                        <li>• <strong>Lock-free algorithms:</strong> Use atomic operations when possible</li>
                        <li>• <strong>Thread-local storage:</strong> Avoid sharing when not necessary</li>
                        <li>• <strong>Padding:</strong> Align data to cache line boundaries</li>
                        <li>• <strong>Work distribution:</strong> Minimize lock contention points</li>
                        <li>• <strong>Priority protocols:</strong> Implement priority inheritance</li>
                      </ul>
                    </div>
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
                    <h3 className="font-semibold mb-3 text-blue-600">🏦 Banking Systems</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Account balance updates, transaction processing</p>
                      <p><strong>Pattern:</strong> Critical sections for atomic fund transfers</p>
                      <p><strong>Example:</strong> ATM withdrawals, online banking</p>
                      <Badge variant="outline" className="mt-2">ACID Compliance</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-green-600">🎮 Game Engines</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Scene graph updates, resource management</p>
                      <p><strong>Pattern:</strong> Reader-writer locks for spatial data structures</p>
                      <p><strong>Example:</strong> Unity, Unreal Engine physics systems</p>
                      <Badge variant="outline" className="mt-2">Real-time Performance</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-purple-600">🗄️ Database Management</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Table locks, row locks, index locks</p>
                      <p><strong>Pattern:</strong> Two-phase locking protocol</p>
                      <p><strong>Example:</strong> MySQL InnoDB, PostgreSQL</p>
                      <Badge variant="outline" className="mt-2">Concurrency Control</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-orange-600">🌐 Web Servers</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Connection pool management, session state</p>
                      <p><strong>Pattern:</strong> Fine-grained locks for scalability</p>
                      <p><strong>Example:</strong> Apache, Nginx worker processes</p>
                      <Badge variant="outline" className="mt-2">High Concurrency</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-red-600">🔬 Scientific Computing</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Shared result accumulation, file I/O</p>
                      <p><strong>Pattern:</strong> Atomic operations for reductions</p>
                      <p><strong>Example:</strong> Monte Carlo simulations, molecular dynamics</p>
                      <Badge variant="outline" className="mt-2">Numerical Accuracy</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-teal-600">📱 Operating Systems</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Lock Usage:</strong> Process scheduling, memory management</p>
                      <p><strong>Pattern:</strong> Spinlocks, mutex locks, semaphores</p>
                      <p><strong>Example:</strong> Linux kernel, Windows NT</p>
                      <Badge variant="outline" className="mt-2">System-level Sync</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Implementation Guidelines by Domain</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">High-Frequency Systems</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Prefer lock-free algorithms over locks</li>
                        <li>• Use atomic operations for simple updates</li>
                        <li>• Minimize critical section duration</li>
                        <li>• Consider hardware transactional memory</li>
                        <li>• Profile lock contention regularly</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-600">Data-Intensive Applications</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Use reader-writer locks for read-heavy workloads</li>
                        <li>• Implement hierarchical locking schemes</li>
                        <li>• Consider lock striping for large data structures</li>
                        <li>• Use condition variables for producer-consumer</li>
                        <li>• Implement deadlock detection mechanisms</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Advanced Example: Hash Table with Fine-Grained Locking</h3>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`typedef struct hash_table {
    bucket_t *buckets;
    omp_lock_t *locks;    // One lock per bucket
    int num_buckets;
} hash_table_t;

void hash_insert(hash_table_t *ht, int key, void *value) {
    int bucket = hash_function(key) % ht->num_buckets;
    
    omp_set_lock(&ht->locks[bucket]);
    // Only this bucket is locked, others can be accessed concurrently
    insert_into_bucket(&ht->buckets[bucket], key, value);
    omp_unset_lock(&ht->locks[bucket]);
}

void* hash_lookup(hash_table_t *ht, int key) {
    int bucket = hash_function(key) % ht->num_buckets;
    
    omp_set_lock(&ht->locks[bucket]);
    void *result = lookup_in_bucket(&ht->buckets[bucket], key);
    omp_unset_lock(&ht->locks[bucket]);
    
    return result;
}

// Initialization
hash_table_t* create_hash_table(int num_buckets) {
    hash_table_t *ht = malloc(sizeof(hash_table_t));
    ht->buckets = calloc(num_buckets, sizeof(bucket_t));
    ht->locks = malloc(num_buckets * sizeof(omp_lock_t));
    ht->num_buckets = num_buckets;
    
    for (int i = 0; i < num_buckets; i++) {
        omp_init_lock(&ht->locks[i]);
    }
    
    return ht;
}`}</code>
                    </pre>
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

export default LocksPage;
