    
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Cpu, Users, Zap, Play, Grid, Layers } from 'lucide-react';

const MatrixCodeAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Code className="w-5 h-5 text-primary" />
            Matrix Addition Code Examples & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="serial" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="serial">Serial</TabsTrigger>
              <TabsTrigger value="parallel-for">Parallel For</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="element-task">Element Tasks</TabsTrigger>
              <TabsTrigger value="row-task">Row Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="serial" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-gray-600" />
                  Serial Matrix Addition
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// Serial Matrix Addition
void matrix_add_serial(int A[N][N], int B[N][N], int C[N][N]) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}`}</code>
                </pre>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Approach Characteristics:</h5>
                    <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• <strong>Sequential execution:</strong> One element processed at a time</li>
                      <li>• <strong>Single thread:</strong> Uses only one CPU core</li>
                      <li>• <strong>Predictable performance:</strong> Consistent execution order</li>
                      <li>• <strong>Simple debugging:</strong> Linear execution flow</li>
                      <li>• <strong>Cache locality:</strong> Good memory access pattern</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Performance Analysis:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Time Complexity:</strong> O(N²) for N×N matrix</li>
                      <li>• <strong>Space Complexity:</strong> O(1) additional space</li>
                      <li>• <strong>Memory Access:</strong> Sequential, cache-friendly</li>
                      <li>• <strong>CPU Utilization:</strong> Single core only</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h5 className="font-medium mb-2 text-red-900 dark:text-red-100">Limitations:</h5>
                    <ul className="text-sm space-y-1 text-red-800 dark:text-red-200">
                      <li>• No parallelism - doesn't utilize multiple cores</li>
                      <li>• Slower execution for large matrices</li>
                      <li>• Not scalable with hardware improvements</li>
                      <li>• Underutilizes modern multi-core processors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parallel-for" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-blue-500" />
                  Parallel For Loop
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// OpenMP Parallel For
void matrix_add_parallel_for(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel for collapse(2)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}`}</code>
                </pre>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Approach Characteristics:</h5>
                    <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• <strong>Static distribution:</strong> Iterations divided equally among threads</li>
                      <li>• <strong>Loop collapse:</strong> Combines nested loops into single iteration space</li>
                      <li>• <strong>Automatic scheduling:</strong> OpenMP handles work distribution</li>
                      <li>• <strong>Load balancing:</strong> Good for uniform workloads</li>
                      <li>• <strong>Low overhead:</strong> Minimal synchronization required</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Performance Benefits:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Scalability:</strong> Performance scales with number of cores</li>
                      <li>• <strong>Simple implementation:</strong> Single pragma directive</li>
                      <li>• <strong>Efficient scheduling:</strong> Static work distribution minimizes overhead</li>
                      <li>• <strong>Memory efficiency:</strong> Good cache locality within threads</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Execution Pattern:</h5>
                    <div className="text-sm font-mono bg-purple-100 dark:bg-purple-900/30 p-3 rounded text-purple-800 dark:text-purple-200">
                      For 4×4 matrix with 4 threads:<br/>
                      Thread 0: iterations 0-3 (C[0][0] to C[0][3])<br/>
                      Thread 1: iterations 4-7 (C[1][0] to C[1][3])<br/>
                      Thread 2: iterations 8-11 (C[2][0] to C[2][3])<br/>
                      Thread 3: iterations 12-15 (C[3][0] to C[3][3])
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Sections-based Parallelism
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// OpenMP Sections
void matrix_add_sections(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel sections
    {
        #pragma omp section
        {
            // Process first quarter
            for (int i = 0; i < N/2; i++)
                for (int j = 0; j < N/2; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
        #pragma omp section
        {
            // Process second quarter
            for (int i = 0; i < N/2; i++)
                for (int j = N/2; j < N; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
        #pragma omp section
        {
            // Process third quarter
            for (int i = N/2; i < N; i++)
                for (int j = 0; j < N/2; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
        #pragma omp section
        {
            // Process fourth quarter
            for (int i = N/2; i < N; i++)
                for (int j = N/2; j < N; j++)
                    C[i][j] = A[i][j] + B[i][j];
        }
    }
}`}</code>
                </pre>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Approach Characteristics:</h5>
                    <ul className="text-sm space-y-1 text-purple-800 dark:text-purple-200">
                      <li>• <strong>Predefined work sections:</strong> Matrix divided into specific regions</li>
                      <li>• <strong>Static load distribution:</strong> Each thread gets a fixed section</li>
                      <li>• <strong>Explicit work division:</strong> Programmer controls partitioning</li>
                      <li>• <strong>Good for heterogeneous tasks:</strong> Different sections can have different complexity</li>
                      <li>• <strong>Regional processing:</strong> Each thread works on contiguous memory blocks</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Advantages:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Cache efficiency:</strong> Good spatial locality within sections</li>
                      <li>• <strong>Predictable workload:</strong> Each section has known size</li>
                      <li>• <strong>Low synchronization overhead:</strong> No inter-thread dependencies</li>
                      <li>• <strong>Flexible partitioning:</strong> Can adapt sections to data characteristics</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/50 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h5 className="font-medium mb-2 text-yellow-900 dark:text-yellow-100">Load Balancing Considerations:</h5>
                    <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                      <li>• May suffer from load imbalance if sections have different complexities</li>
                      <li>• Best when sections have similar computational requirements</li>
                      <li>• Limited scalability - number of sections must be predefined</li>
                      <li>• Thread utilization depends on section size uniformity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="element-task" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Element-based Task Parallelism
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// Element-based OpenMP Tasks
void matrix_add_element_tasks(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (int i = 0; i < N; i++) {
                for (int j = 0; j < N; j++) {
                    #pragma omp task firstprivate(i, j) shared(A, B, C)
                    {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
        }
    }
}`}</code>
                </pre>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-950/50 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h5 className="font-medium mb-2 text-yellow-900 dark:text-yellow-100">Approach Characteristics:</h5>
                    <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                      <li>• <strong>Fine-grained parallelism:</strong> One task per matrix element</li>
                      <li>• <strong>Dynamic scheduling:</strong> Tasks assigned to threads dynamically</li>
                      <li>• <strong>Work stealing:</strong> Idle threads can steal tasks from busy ones</li>
                      <li>• <strong>Single thread creates tasks:</strong> One thread generates all tasks initially</li>
                      <li>• <strong>All threads execute:</strong> Including task creator participates in execution</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Performance Benefits:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Excellent load balancing:</strong> Dynamic task distribution</li>
                      <li>• <strong>Optimal thread utilization:</strong> No idle threads when tasks available</li>
                      <li>• <strong>Adaptive scheduling:</strong> Faster threads process more elements</li>
                      <li>• <strong>Fault tolerance:</strong> System adapts to varying thread performance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h5 className="font-medium mb-2 text-red-900 dark:text-red-100">Overhead Considerations:</h5>
                    <ul className="text-sm space-y-1 text-red-800 dark:text-red-200">
                      <li>• <strong>High task creation overhead:</strong> N² tasks for N×N matrix</li>
                      <li>• <strong>Task management cost:</strong> Scheduling and synchronization overhead</li>
                      <li>• <strong>Memory overhead:</strong> Task descriptors consume additional memory</li>
                      <li>• <strong>Best for larger computations:</strong> Overhead justified by computation cost</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Execution Flow:</h5>
                    <div className="text-sm bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-blue-800 dark:text-blue-200">
                      1. Thread 0 creates all N×N tasks in #pragma omp single region<br/>
                      2. Tasks are added to shared task pool<br/>
                      3. All threads (including Thread 0) compete for available tasks<br/>
                      4. Dynamic assignment ensures optimal load balancing<br/>
                      5. Fast threads automatically process more elements
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="row-task" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Row-based Task Parallelism
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// Row-based OpenMP Tasks
void matrix_add_row_tasks(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (int i = 0; i < N; i++) {
                #pragma omp task firstprivate(i) shared(A, B, C)
                {
                    for (int j = 0; j < N; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
        }
    }
}`}</code>
                </pre>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Approach Characteristics:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Medium-grained parallelism:</strong> One task per matrix row</li>
                      <li>• <strong>Balanced overhead:</strong> Fewer tasks than element-based approach</li>
                      <li>• <strong>Good cache locality:</strong> Each task processes contiguous memory</li>
                      <li>• <strong>Single thread creates tasks:</strong> One thread generates all row tasks</li>
                      <li>• <strong>Dynamic load balancing:</strong> Threads can steal row tasks from others</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Performance Analysis:</h5>
                    <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• <strong>Task overhead:</strong> Only N tasks for N×N matrix (much lower than element-based)</li>
                      <li>• <strong>Cache efficiency:</strong> Sequential access within each row</li>
                      <li>• <strong>Scalable granularity:</strong> Task size grows with matrix width</li>
                      <li>• <strong>Balanced workload:</strong> Each row has equal computational cost</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium mb-2 text-green-900 dark:text-green-100">Optimal Use Cases:</h5>
                    <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>• <strong>Medium to large matrices:</strong> Row processing is substantial enough</li>
                      <li>• <strong>Cache-conscious applications:</strong> Sequential memory access important</li>
                      <li>• <strong>Balanced task granularity:</strong> Not too fine, not too coarse</li>
                      <li>• <strong>Variable thread performance:</strong> Dynamic scheduling compensates differences</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium mb-2 text-purple-900 dark:text-purple-100">Execution Strategy:</h5>
                    <div className="text-sm bg-purple-100 dark:bg-purple-900/30 p-3 rounded text-purple-800 dark:text-purple-200">
                      1. Thread 0 creates N row tasks in #pragma omp single region<br/>
                      2. Each task processes an entire row (N elements)<br/>
                      3. All threads participate in task execution after creation<br/>
                      4. Dynamic work stealing ensures load balance<br/>
                      5. Combines benefits of task parallelism with good cache locality
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixCodeAnalysis;