
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Shield, AlertTriangle, CheckCircle, Lock, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThreadSafetyVisualization from '@/components/ThreadSafetyVisualization';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ThreadSafetyPage: React.FC = () => {
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
            Thread Safety
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Race conditions vs safe updates with locks/atomics and private variables. Learn how to write thread-safe code and avoid common concurrency pitfalls.
          </p>
        </div>

        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
            <TabsTrigger value="concepts">Core Concepts</TabsTrigger>
            <TabsTrigger value="techniques">Safety Techniques</TabsTrigger>
            <TabsTrigger value="examples">Examples & Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thread Safety Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare unsafe vs safe concurrent operations and observe race conditions in real-time
                </p>
              </CardHeader>
              <CardContent>
                <ThreadSafetyVisualization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  What is Thread Safety?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Definition</h3>
                  <p className="text-sm mb-4">
                    Thread safety means that a program's behavior remains correct when accessed by multiple threads simultaneously,
                    without data races or inconsistent states.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Thread-Safe Code ✅</h4>
                      <ul className="space-y-1">
                        <li>• Produces consistent results</li>
                        <li>• No data corruption</li>
                        <li>• Maintains invariants</li>
                        <li>• Handles concurrent access gracefully</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Thread-Unsafe Code ❌</h4>
                      <ul className="space-y-1">
                        <li>• Race conditions occur</li>
                        <li>• Data gets corrupted</li>
                        <li>• Unpredictable results</li>
                        <li>• Intermittent failures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Types of Thread Safety Issues</h3>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-red-600 mb-2">Race Conditions</h4>
                      <p className="text-sm mb-2">
                        Multiple threads access shared data simultaneously, leading to unpredictable results.
                      </p>
                      <Badge variant="destructive" className="text-xs">Critical Issue</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-orange-600 mb-2">Lost Updates</h4>
                      <p className="text-sm mb-2">
                        One thread's changes are overwritten by another thread's modifications.
                      </p>
                      <Badge variant="outline" className="text-xs">Data Corruption</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-600 mb-2">Inconsistent State</h4>
                      <p className="text-sm mb-2">
                        Objects are left in invalid states due to interrupted operations.
                      </p>
                      <Badge variant="secondary" className="text-xs">Logic Error</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Memory Model Concepts</h3>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 mb-2">Memory Visibility</h4>
                      <p className="text-sm">
                        Changes made by one thread may not be immediately visible to other threads
                        due to CPU caching and optimizations.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 mb-2">Instruction Reordering</h4>
                      <p className="text-sm">
                        Compilers and CPUs may reorder instructions for optimization,
                        potentially breaking assumptions in concurrent code.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-teal-600 mb-2">Cache Coherence</h4>
                      <p className="text-sm">
                        Different CPU cores may have different cached values for the same memory location,
                        leading to inconsistency.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="techniques" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Thread Safety Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-blue-600">🔒 Mutual Exclusion (Locks)</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Critical sections with locks</p>
                      <p><strong>Pros:</strong> Simple, widely supported</p>
                      <p><strong>Cons:</strong> Performance overhead, deadlock risk</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`#pragma omp critical
{
  shared_counter++;
}`}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-green-600">⚛️ Atomic Operations</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Hardware-supported atomic ops</p>
                      <p><strong>Pros:</strong> Lock-free, high performance</p>
                      <p><strong>Cons:</strong> Limited to simple operations</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`#pragma omp atomic
shared_counter++;`}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-purple-600">🔄 Thread-Local Storage</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Private variables per thread</p>
                      <p><strong>Pros:</strong> No synchronization needed</p>
                      <p><strong>Cons:</strong> Results must be combined</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`int local_sum = 0;
#pragma omp parallel private(local_sum)`}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-orange-600">🔀 Reduction Operations</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Built-in parallel reductions</p>
                      <p><strong>Pros:</strong> Optimized by compiler</p>
                      <p><strong>Cons:</strong> Limited to specific operations</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`#pragma omp parallel for reduction(+:sum)
for(int i=0; i<n; i++) sum += arr[i];`}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-red-600">🚧 Memory Barriers</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Control memory ordering</p>
                      <p><strong>Pros:</strong> Fine-grained control</p>
                      <p><strong>Cons:</strong> Complex, platform-specific</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`#pragma omp flush
// Ensures memory visibility`}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-teal-600">📦 Immutable Data</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Method:</strong> Data that never changes</p>
                      <p><strong>Pros:</strong> Inherently thread-safe</p>
                      <p><strong>Cons:</strong> Memory overhead for copies</p>
                      <div className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2">
                        <code>{`const int* readonly_data = ...;
// Safe to read from multiple threads`}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Technique</th>
                          <th className="text-left p-2">Performance</th>
                          <th className="text-left p-2">Scalability</th>
                          <th className="text-left p-2">Complexity</th>
                          <th className="text-left p-2">Best Use Case</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Locks</td>
                          <td className="p-2"><Badge variant="secondary">Medium</Badge></td>
                          <td className="p-2"><Badge variant="destructive">Poor</Badge></td>
                          <td className="p-2"><Badge variant="outline">Low</Badge></td>
                          <td className="p-2">Complex critical sections</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Atomics</td>
                          <td className="p-2"><Badge variant="default">High</Badge></td>
                          <td className="p-2"><Badge variant="default">Good</Badge></td>
                          <td className="p-2"><Badge variant="outline">Low</Badge></td>
                          <td className="p-2">Simple operations, counters</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Thread-Local</td>
                          <td className="p-2"><Badge variant="default">Highest</Badge></td>
                          <td className="p-2"><Badge variant="default">Excellent</Badge></td>
                          <td className="p-2"><Badge variant="secondary">Medium</Badge></td>
                          <td className="p-2">Independent computations</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">Reductions</td>
                          <td className="p-2"><Badge variant="default">High</Badge></td>
                          <td className="p-2"><Badge variant="default">Excellent</Badge></td>
                          <td className="p-2"><Badge variant="outline">Low</Badge></td>
                          <td className="p-2">Aggregation operations</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Examples & Common Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">❌ Thread-Unsafe Examples</h3>
                    
                    <div className="border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Bank Account Transfer</h4>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs mb-2">
                        <code>{`// UNSAFE - Race condition!
void transfer(Account* from, Account* to, int amount) {
  int from_balance = from->balance;
  int to_balance = to->balance;
  
  from->balance = from_balance - amount; // Race here!
  to->balance = to_balance + amount;     // Race here!
}`}</code>
                      </div>
                      <p className="text-sm text-red-600">Problem: Multiple threads can read/modify balances simultaneously</p>
                    </div>
                    
                    <div className="border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Shared Counter</h4>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs mb-2">
                        <code>{`// UNSAFE - Lost updates!
int global_counter = 0;

#pragma omp parallel for
for(int i = 0; i < 1000000; i++) {
  global_counter++; // Not atomic!
}`}</code>
                      </div>
                      <p className="text-sm text-red-600">Problem: Increment operation is not atomic (read-modify-write)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">✅ Thread-Safe Solutions</h3>
                    
                    <div className="border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Safe Bank Transfer</h4>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs mb-2">
                        <code>{`// SAFE - Using critical section
void safe_transfer(Account* from, Account* to, int amount) {
  #pragma omp critical(bank_transfer)
  {
    if(from->balance >= amount) {
      from->balance -= amount;
      to->balance += amount;
    }
  }
}`}</code>
                      </div>
                      <p className="text-sm text-green-600">Solution: Critical section ensures atomic transfer operation</p>
                    </div>
                    
                    <div className="border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Atomic Counter</h4>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs mb-2">
                        <code>{`// SAFE - Using atomic operation
int global_counter = 0;

#pragma omp parallel for
for(int i = 0; i < 1000000; i++) {
  #pragma omp atomic
  global_counter++;
}`}</code>
                      </div>
                      <p className="text-sm text-green-600">Solution: Atomic increment ensures thread-safe counting</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Design Patterns for Thread Safety</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-blue-600">Producer-Consumer</h4>
                      <p className="text-sm mb-2">Separate threads produce and consume data from a shared buffer</p>
                      <Badge variant="outline">Coordination Pattern</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-green-600">Read-Write Lock</h4>
                      <p className="text-sm mb-2">Multiple readers or single writer can access shared data</p>
                      <Badge variant="outline">Performance Pattern</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-purple-600">Double-Checked Locking</h4>
                      <p className="text-sm mb-2">Optimize initialization with minimal locking overhead</p>
                      <Badge variant="outline">Optimization Pattern</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Best Practices Checklist</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3">Thread Safety Guidelines ✅</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Identify all shared mutable data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Use appropriate synchronization primitives</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Minimize critical section size</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Prefer immutable data when possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Test thoroughly under high concurrency</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Document thread safety guarantees</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">Common Pitfalls to Avoid ❌</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Assuming operations are atomic when they're not</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Forgetting to synchronize related operations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Using the wrong granularity of locking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Ignoring memory visibility issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Over-synchronization leading to poor performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Testing only with low thread counts</span>
                        </li>
                      </ul>
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

export default ThreadSafetyPage;
