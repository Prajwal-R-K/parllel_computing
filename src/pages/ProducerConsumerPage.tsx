import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Factory, ShoppingCart, Cpu, AlertTriangle, CheckCircle, Eye, HardDrive, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProducerConsumerVisualizationEnhanced from '@/components/ProducerConsumerVisualizationEnhanced';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProducerConsumerPage: React.FC = () => {
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
            Producer–Consumer and Memory Visibility
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understand how flush ensures changes become globally visible across threads and explore the classic producer-consumer synchronization pattern with interactive visualizations.
          </p>
        </div>

        <Tabs defaultValue="visualization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visualization">Interactive Demo</TabsTrigger>
            <TabsTrigger value="concepts">Concepts & Theory</TabsTrigger>
            <TabsTrigger value="memory-model">Memory Model</TabsTrigger>
            <TabsTrigger value="examples">Real-World Examples</TabsTrigger>
            <TabsTrigger value="solutions">Solutions & Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Producer–Consumer Visualization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive demonstration of memory visibility issues and how flush operations ensure data consistency
                </p>
              </CardHeader>
              <CardContent>
                <ProducerConsumerVisualizationEnhanced />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            {/* Core Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Producer-Consumer Pattern - Core Concepts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">What is the Producer-Consumer Pattern?</h3>
                  <p className="text-sm mb-4">
                    A fundamental synchronization pattern where producer threads generate data items and consumer threads 
                    process these items through a shared buffer. This pattern decouples production and consumption rates, 
                    enabling efficient parallel processing in many applications.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Key Components</h4>
                      <ul className="space-y-1">
                        <li>• <strong>Producers:</strong> Generate and add data to buffer</li>
                        <li>• <strong>Consumers:</strong> Remove and process data from buffer</li>
                        <li>• <strong>Buffer:</strong> Shared data structure (queue, array, etc.)</li>
                        <li>• <strong>Synchronization:</strong> Coordinate access and signaling</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Memory Challenges</h4>
                      <ul className="space-y-1">
                        <li>• Cache coherence across different CPU cores</li>
                        <li>• Write visibility between producer and consumer</li>
                        <li>• Memory ordering and consistency models</li>
                        <li>• False sharing and cache line effects</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Factory className="w-5 h-5 text-blue-500" />
                      Producer Thread Responsibilities
                    </h3>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Data Generation</h4>
                        <p className="text-sm">Creates or retrieves data items from external sources like files, networks, sensors, or computational processes.</p>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Buffer Management</h4>
                        <p className="text-sm">Safely adds items to shared buffer while respecting capacity limits and synchronization protocols.</p>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Flow Control</h4>
                        <p className="text-sm">Handles buffer full conditions through blocking, dropping, or backpressure mechanisms.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-green-500" />
                      Consumer Thread Responsibilities
                    </h3>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Data Processing</h4>
                        <p className="text-sm">Retrieves items from buffer and performs required computations, transformations, or I/O operations.</p>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Buffer Cleanup</h4>
                        <p className="text-sm">Removes processed items from buffer to make space for new items and prevent memory leaks.</p>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="font-semibold mb-1">Result Handling</h4>
                        <p className="text-sm">Manages processed results through storage, forwarding to other stages, or triggering dependent operations.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Visibility Demonstration */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Visibility Issues - Step by Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">Without Flush - The Problem</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Step 1: Producer Writes</h4>
                      <p>Producer writes data = 42 to its local cache</p>
                      <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
                        <code>data = 42 // In producer cache only</code>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Step 2: Consumer Reads</h4>
                      <p>Consumer reads from its cache, still sees old value</p>
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                        <code>data = 0 // Stale value!</code>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Result</h4>
                      <p>Race condition - incorrect behavior</p>
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                        <code>❌ Wrong result</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">With Flush - The Solution</h3>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Step 1: Producer Writes</h4>
                      <p>Producer writes data = 42</p>
                      <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
                        <code>data = 42</code>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Step 2: Flush</h4>
                      <p>Ensures visibility to all threads</p>
                      <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                        <code>#pragma omp flush</code>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Step 3: Consumer Reads</h4>
                      <p>Consumer sees updated value</p>
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 rounded">
                        <code>data = 42 ✓</code>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                      <h4 className="font-semibold mb-2">Result</h4>
                      <p>Correct synchronization</p>
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 rounded">
                        <code>✅ Correct!</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Code Examples - Before and After</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-3">❌ Problematic Code</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`#include <omp.h>
#include <stdio.h>

int shared_data = 0;
int ready_flag = 0;

int main() {
    #pragma omp parallel sections
    {
        #pragma omp section  // Producer
        {
            shared_data = 42;    // Write data
            ready_flag = 1;      // Set flag
        }
        
        #pragma omp section  // Consumer  
        {
            while (ready_flag == 0) {
                // Busy wait
            }
            printf("Data: %d\\n", shared_data);
            // May print 0 instead of 42!
        }
    }
    return 0;
}`}
                      </pre>
                    </div>
                    <div className="mt-3 text-sm text-red-600">
                      <p><strong>Problem:</strong> Consumer may see ready_flag=1 but shared_data=0 due to memory reordering.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Corrected Code</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`#include <omp.h>
#include <stdio.h>

int shared_data = 0;
int ready_flag = 0;

int main() {
    #pragma omp parallel sections
    {
        #pragma omp section  // Producer
        {
            shared_data = 42;
            #pragma omp flush    // Ensure visibility
            ready_flag = 1;
            #pragma omp flush    // Ensure flag visible
        }
        
        #pragma omp section  // Consumer
        {
            int flag;
            do {
                #pragma omp flush
                flag = ready_flag;
            } while (flag == 0);
            #pragma omp flush
            printf("Data: %d\\n", shared_data);
            // Always prints 42
        }
    }
    return 0;
}`}
                      </pre>
                    </div>
                    <div className="mt-3 text-sm text-green-600">
                      <p><strong>Solution:</strong> Explicit flush operations ensure proper memory visibility and ordering.</p>
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
                    Advantages & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Decoupling & Modularity</p>
                        <p className="text-muted-foreground">Producers and consumers operate independently, enabling modular design and easier testing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Rate Matching & Buffering</p>
                        <p className="text-muted-foreground">Buffer smooths out rate differences between production and consumption speeds</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Scalability & Load Distribution</p>
                        <p className="text-muted-foreground">Multiple producers/consumers can be added to increase throughput and handle varying loads</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                      <div>
                        <p className="font-semibold">Fault Tolerance & Reliability</p>
                        <p className="text-muted-foreground">System continues operating if some producers/consumers fail, improving overall robustness</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Challenges & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Memory Visibility Issues</p>
                      <p className="text-muted-foreground mb-2">CPU caches can cause stale data reads between threads</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solutions:</strong> Use flush directives, atomic operations, memory barriers, or volatile variables
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Buffer Overflow/Underflow</p>
                      <p className="text-muted-foreground mb-2">Unbounded buffers can exhaust memory; empty buffers block consumers</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solutions:</strong> Implement bounded buffers with flow control, condition variables, and proper signaling
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-red-600 mb-1">Synchronization Overhead</p>
                      <p className="text-muted-foreground mb-2">Locking and signaling mechanisms can become performance bottlenecks</p>
                      <p className="text-green-600 text-xs">
                        <strong>Solutions:</strong> Use lock-free algorithms, batch operations, fine-grained locking, or wait-free data structures
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memory-model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Memory Models & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Understanding Memory Visibility</h3>
                  <p className="text-sm mb-4">
                    Modern CPUs use complex cache hierarchies and memory ordering optimizations that can cause writes from one thread 
                    to be invisible to other threads for extended periods. This creates the infamous "cache coherence problem" in 
                    parallel programming.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Without Memory Synchronization</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`// PROBLEMATIC CODE - Race condition
int shared_data = 0;
int ready_flag = 0;

// Producer thread
#pragma omp section
{
    shared_data = 42;      // Write 1
    ready_flag = 1;        // Write 2
}

// Consumer thread  
#pragma omp section
{
    while (ready_flag == 0);  // Spin wait
    printf("%d\\n", shared_data); // May print 0!
}`}</code>
                      </pre>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                        <span><strong>Problem:</strong> Consumer may see ready_flag=1 but shared_data=0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                        <span><strong>Cause:</strong> CPU reordering or cache delays</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                        <span><strong>Result:</strong> Incorrect program behavior</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">With Proper Synchronization</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`// CORRECT CODE - With flush
int shared_data = 0;
int ready_flag = 0;

// Producer thread
#pragma omp section
{
    shared_data = 42;
    #pragma omp flush    // Ensure visibility
    ready_flag = 1;
    #pragma omp flush    // Ensure flag visible
}

// Consumer thread
#pragma omp section
{
    int flag;
    do {
        #pragma omp flush
        flag = ready_flag;
    } while (flag == 0);
    #pragma omp flush
    printf("%d\\n", shared_data); // Always prints 42
}`}</code>
                      </pre>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                        <span><strong>Solution:</strong> Explicit flush operations ensure visibility</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                        <span><strong>Guarantee:</strong> All prior writes become visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                        <span><strong>Result:</strong> Predictable, correct behavior</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Cache Coherence Protocols</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-600">MESI Protocol</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>M</strong>odified: Exclusive, dirty</li>
                        <li>• <strong>E</strong>xclusive: Exclusive, clean</li>
                        <li>• <strong>S</strong>hared: Shared, clean</li>
                        <li>• <strong>I</strong>nvalid: Not present</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-600">Write Invalidate</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Writer invalidates other copies</li>
                        <li>• Other caches must reload from memory</li>
                        <li>• Good for low sharing scenarios</li>
                        <li>• Used in most modern CPUs</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-purple-600">Write Update</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Writer updates all copies</li>
                        <li>• High bandwidth requirements</li>
                        <li>• Good for high sharing scenarios</li>
                        <li>• Less common in practice</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Ordering & Consistency Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">Strong Consistency Models</h4>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <p className="font-semibold text-sm">Sequential Consistency</p>
                        <p className="text-xs text-muted-foreground">All operations appear in some sequential order, same order observed by all threads</p>
                      </div>
                      <div className="border rounded p-3">
                        <p className="font-semibold text-sm">Linearizability</p>
                        <p className="text-xs text-muted-foreground">Operations appear instantaneous at some point between start and completion</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">Weak Consistency Models</h4>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <p className="font-semibold text-sm">Release Consistency</p>
                        <p className="text-xs text-muted-foreground">Synchronization operations define consistency boundaries</p>
                      </div>
                      <div className="border rounded p-3">
                        <p className="font-semibold text-sm">Eventual Consistency</p>
                        <p className="text-xs text-muted-foreground">System will become consistent eventually, no timing guarantees</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Applications & Industry Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-blue-600">🎬 Media Streaming Systems</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> Network decoder receiving video packets</p>
                      <p><strong>Consumer:</strong> Video renderer displaying frames to screen</p>
                      <p><strong>Buffer:</strong> Frame buffer queue with jitter compensation</p>
                      <p><strong>Challenge:</strong> Real-time constraints, variable network latency</p>
                      <p><strong>Solution:</strong> Adaptive buffering, frame dropping strategies</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-green-600">🏭 Industrial IoT & Manufacturing</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> Sensor data collection from assembly line</p>
                      <p><strong>Consumer:</strong> Real-time analytics and quality control</p>
                      <p><strong>Buffer:</strong> Time-series data buffer with windowing</p>
                      <p><strong>Challenge:</strong> High-frequency data, fault tolerance</p>
                      <p><strong>Solution:</strong> Lock-free ring buffers, redundant processing</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-purple-600">📊 Financial Trading Systems</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> Market data feeds and order flow</p>
                      <p><strong>Consumer:</strong> Risk management and execution engines</p>
                      <p><strong>Buffer:</strong> Priority queues with latency optimization</p>
                      <p><strong>Challenge:</strong> Ultra-low latency, high throughput</p>
                      <p><strong>Solution:</strong> Hardware acceleration, NUMA awareness</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-orange-600">🔍 Search Engine Indexing</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> Web crawlers discovering new content</p>
                      <p><strong>Consumer:</strong> Document processors and index builders</p>
                      <p><strong>Buffer:</strong> Distributed queue system (Kafka, RabbitMQ)</p>
                      <p><strong>Challenge:</strong> Massive scale, fault recovery</p>
                      <p><strong>Solution:</strong> Horizontal scaling, checkpoint mechanisms</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-red-600">🎮 Game Engine Architecture</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> Physics simulation and AI systems</p>
                      <p><strong>Consumer:</strong> Rendering and audio systems</p>
                      <p><strong>Buffer:</strong> Command buffers and state queues</p>
                      <p><strong>Challenge:</strong> Frame-rate consistency, resource contention</p>
                      <p><strong>Solution:</strong> Frame pipelining, priority scheduling</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-teal-600">🧬 Bioinformatics Pipelines</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Producer:</strong> DNA sequencing machines generating reads</p>
                      <p><strong>Consumer:</strong> Alignment and variant calling algorithms</p>
                      <p><strong>Buffer:</strong> FASTQ file queues and intermediate results</p>
                      <p><strong>Challenge:</strong> Large data volumes, computational intensity</p>
                      <p><strong>Solution:</strong> Streaming algorithms, distributed processing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Characteristics by Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-3">Domain</th>
                        <th className="text-left p-3">Latency Req.</th>
                        <th className="text-left p-3">Throughput</th>
                        <th className="text-left p-3">Buffer Strategy</th>
                        <th className="text-left p-3">Key Optimization</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-semibold">High-Frequency Trading</td>
                        <td className="p-3"><Badge variant="destructive">&lt; 1μs</Badge></td>
                        <td className="p-3"><Badge variant="default">1M+ msg/s</Badge></td>
                        <td className="p-3">Lock-free ring buffer</td>
                        <td className="p-3">CPU affinity, kernel bypass</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-semibold">Real-time Gaming</td>
                        <td className="p-3"><Badge variant="secondary">&lt; 16ms</Badge></td>
                        <td className="p-3"><Badge variant="default">60+ FPS</Badge></td>
                        <td className="p-3">Triple buffering</td>
                        <td className="p-3">Frame pipelining, prediction</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-semibold">Video Streaming</td>
                        <td className="p-3"><Badge variant="outline">&lt; 100ms</Badge></td>
                        <td className="p-3"><Badge variant="default">Multiple Gbps</Badge></td>
                        <td className="p-3">Adaptive buffering</td>
                        <td className="p-3">Compression, CDN caching</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-semibold">Data Analytics</td>
                        <td className="p-3"><Badge variant="outline">&lt; 1s</Badge></td>
                        <td className="p-3"><Badge variant="secondary">TB/hour</Badge></td>
                        <td className="p-3">Batch processing</td>
                        <td className="p-3">Columnar storage, SIMD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Implementation Patterns & Advanced Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">OpenMP Implementation</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{`#include <omp.h>
#include <stdio.h>

#define BUFFER_SIZE 10
int buffer[BUFFER_SIZE];
int count = 0, in = 0, out = 0;

#pragma omp parallel sections
{
  #pragma omp section  // Producer
  {
    for(int i = 0; i < 20; i++) {
      int item = i * i;  // Generate data
      
      #pragma omp critical(buffer_ops)
      {
        while(count == BUFFER_SIZE) {
          // Buffer full - wait
          #pragma omp flush(count)
        }
        buffer[in] = item;
        in = (in + 1) % BUFFER_SIZE;
        count++;
        #pragma omp flush  // Ensure visibility
        printf("Produced: %d\\n", item);
      }
    }
  }
  
  #pragma omp section  // Consumer
  {
    for(int i = 0; i < 20; i++) {
      int item;
      
      #pragma omp critical(buffer_ops)
      {
        while(count == 0) {
          // Buffer empty - wait
          #pragma omp flush(count)
        }
        item = buffer[out];
        out = (out + 1) % BUFFER_SIZE;
        count--;
        #pragma omp flush  // Ensure visibility
      }
      printf("Consumed: %d\\n", item);
    }
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Lock-Free Ring Buffer</h3>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{`// Lock-free single producer/consumer
typedef struct {
    volatile int head;    // Consumer index
    volatile int tail;    // Producer index
    int size;
    int mask;            // size - 1 (power of 2)
    int *data;
} ring_buffer_t;

// Producer (single thread only)
bool produce(ring_buffer_t *rb, int item) {
    int current_tail = rb->tail;
    int next_tail = (current_tail + 1) & rb->mask;
    
    if(next_tail == rb->head) {
        return false;  // Buffer full
    }
    
    rb->data[current_tail] = item;
    // Memory barrier here
    #pragma omp flush
    rb->tail = next_tail;
    return true;
}

// Consumer (single thread only)  
bool consume(ring_buffer_t *rb, int *item) {
    int current_head = rb->head;
    
    if(current_head == rb->tail) {
        return false;  // Buffer empty
    }
    
    *item = rb->data[current_head];
    // Memory barrier here
    #pragma omp flush
    rb->head = (current_head + 1) & rb->mask;
    return true;
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Advanced Synchronization Techniques</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-600">Compare-and-Swap (CAS)</h4>
                      <div className="text-sm space-y-2">
                        <p>Atomic operation that compares a memory location with an expected value and updates it if they match.</p>
                        <code className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded">
                          __sync_bool_compare_and_swap(&var, old_val, new_val)
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-600">Memory Barriers</h4>
                      <div className="text-sm space-y-2">
                        <p>Explicit instructions to control memory ordering and prevent CPU reordering optimizations.</p>
                        <code className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded">
                          __sync_synchronize() // Full barrier
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-purple-600">Hazard Pointers</h4>
                      <div className="text-sm space-y-2">
                        <p>Memory management technique for lock-free data structures to prevent ABA problems.</p>
                        <code className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded">
                          hazard_ptr = atomic_load(&shared_ptr)
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Optimization Guidelines</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Best Practices ✅</h4>
                      <ul className="text-sm space-y-2">
                        <li>• <strong>Minimize synchronization points:</strong> Batch operations when possible</li>
                        <li>• <strong>Use appropriate granularity:</strong> Balance between contention and overhead</li>
                        <li>• <strong>Align data structures:</strong> Prevent false sharing with proper padding</li>
                        <li>• <strong>Profile memory access patterns:</strong> Identify cache misses and contention</li>
                        <li>• <strong>Consider NUMA topology:</strong> Keep related data on same node</li>
                        <li>• <strong>Use lock-free when appropriate:</strong> For high-contention scenarios</li>
                        <li>• <strong>Implement backpressure:</strong> Prevent buffer overflow in high-load scenarios</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Common Pitfalls ❌</h4>
                      <ul className="text-sm space-y-2">
                        <li>• <strong>Ignoring memory barriers:</strong> Can lead to subtle race conditions</li>
                        <li>• <strong>Unbounded buffers:</strong> Risk of memory exhaustion under load</li>
                        <li>• <strong>Busy waiting loops:</strong> Wastes CPU cycles and increases contention</li>
                        <li>• <strong>Excessive locking granularity:</strong> Reduces parallelism unnecessarily</li>
                        <li>• <strong>Assuming cache coherence:</strong> Don't rely on timing for correctness</li>
                        <li>• <strong>Neglecting error handling:</strong> Failed operations can corrupt state</li>
                        <li>• <strong>Poor buffer sizing:</strong> Too small causes blocking, too large wastes memory</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Testing & Debugging Strategies</h3>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-300">Stress Testing Techniques</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Load testing:</strong> Gradually increase producer/consumer rates to find bottlenecks</li>
                        <li>• <strong>Burst testing:</strong> Send traffic in short bursts to test buffer overflow handling</li>
                        <li>• <strong>Starvation testing:</strong> Stop producers/consumers to test empty/full buffer scenarios</li>
                        <li>• <strong>Thread scaling:</strong> Vary the number of producer/consumer threads</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-red-700 dark:text-red-300">Race Condition Detection</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Thread Sanitizer (TSan):</strong> Detects data races at runtime</li>
                        <li>• <strong>Helgrind/DRD:</strong> Valgrind tools for race detection</li>
                        <li>• <strong>Static analysis:</strong> Tools like Clang Static Analyzer</li>
                        <li>• <strong>Formal verification:</strong> Model checking with SPIN or TLA+</li>
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

export default ProducerConsumerPage;
