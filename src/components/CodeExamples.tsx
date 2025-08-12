
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Clock, Cpu, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

const CodeExamples: React.FC = () => {
  const codeExamples = [
    {
      id: 'serial',
      title: 'Serial Matrix Addition',
      description: 'Traditional sequential approach processing one element at a time',
      icon: <Clock className="w-5 h-5" />,
      complexity: 'Basic',
      performance: 'O(n²)',
      code: `#include <stdio.h>
#include <stdlib.h>

#define N 4  // Define matrix size for example

void matrix_add_serial(int A[N][N], int B[N][N], int C[N][N], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}

int main() {
    int A[N][N], B[N][N], C[N][N];

    // Initialize matrices with example values
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            A[i][j] = i + j;
            B[i][j] = i - j;
        }
    }

    matrix_add_serial(A, B, C, N);

    // Print result matrix C
    printf("Result matrix C (Serial):\\n");
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            printf("%4d ", C[i][j]);
        }
        printf("\\n");
    }

    return 0;
}`,
      explanation: [
        "Sequential execution: processes one element at a time",
        "Nested loops iterate through all matrix positions",
        "Simple and straightforward implementation",
        "Time complexity: O(n²) where n is matrix dimension",
        "Limited by single-core performance"
      ]
    },
    {
      id: 'parallel-tasks',
      title: 'OpenMP Task-Based Parallel Addition',
      description: 'Task-based parallelism with dynamic scheduling',
      icon: <Cpu className="w-5 h-5" />,
      complexity: 'Advanced',
      performance: 'O(n²/p) where p = cores',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

#define N 4  // Matrix size for example

void matrix_add_parallel(int A[N][N], int B[N][N], int C[N][N], int n) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (int i = 0; i < n; i++) {
                #pragma omp task firstprivate(i)
                {
                    for (int j = 0; j < n; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
        }
    }
}

int main() {
    int A[N][N], B[N][N], C[N][N];

    // Initialize input matrices
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            A[i][j] = i + j;
            B[i][j] = i - j;
            C[i][j] = 0;  // Initialize output matrix
        }
    }

    matrix_add_parallel(A, B, C, N);

    // Print result matrix C
    printf("Result matrix C (Parallel with OpenMP tasks):\\n");
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            printf("%4d ", C[i][j]);
        }
        printf("\\n");
    }

    return 0;
}`,
      explanation: [
        "#pragma omp parallel: Creates a team of threads",
        "#pragma omp single: Ensures only one thread creates tasks",
        "#pragma omp task: Defines independent work units (row processing)",
        "firstprivate(i): Each task gets its own copy of loop variable",
        "Dynamic scheduling: Tasks distributed automatically to available threads",
        "Implicit synchronization: All tasks complete before parallel region ends"
      ]
    },
    {
      id: 'parallel-for',
      title: 'OpenMP Parallel For Loop',
      description: 'Simple loop-based parallelism for comparison',
      icon: <Zap className="w-5 h-5" />,
      complexity: 'Intermediate',
      performance: 'O(n²/p) where p = cores',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

#define N 1000

void matrix_add_parallel_for(int A[N][N], int B[N][N], int C[N][N], int n) {
    #pragma omp parallel for collapse(2)
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}

int main() {
    int A[N][N], B[N][N], C[N][N];
    
    // Initialize matrices
    #pragma omp parallel for collapse(2)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            A[i][j] = i + j;
            B[i][j] = i - j;
        }
    }
    
    double start_time = omp_get_wtime();
    matrix_add_parallel_for(A, B, C, N);
    double end_time = omp_get_wtime();
    
    printf("Parallel execution time: %f seconds\\n", end_time - start_time);
    
    return 0;
}`,
      explanation: [
        "#pragma omp parallel for: Distributes loop iterations among threads",
        "collapse(2): Combines nested loops for better load balancing",
        "Static scheduling: Work divided evenly among threads at compile time",
        "Less overhead than tasks for regular, predictable workloads",
        "omp_get_wtime(): Built-in timing function for performance measurement"
      ]
    },
    {
      id: 'advanced-tasks',
      title: 'Advanced Task Features',
      description: 'Task dependencies and priorities for complex workflows',
      icon: <Code className="w-5 h-5" />,
      complexity: 'Expert',
      performance: 'Optimized scheduling',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

#define N 8

void advanced_matrix_operations(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            // Phase 1: Initialize matrices (high priority)
            #pragma omp task priority(10) depend(out: A, B)
            {
                printf("Thread %d: Initializing matrices\\n", omp_get_thread_num());
                for (int i = 0; i < N; i++) {
                    for (int j = 0; j < N; j++) {
                        A[i][j] = i + j;
                        B[i][j] = i * j + 1;
                    }
                }
            }
            
            // Phase 2: Process upper half (depends on initialization)
            #pragma omp task depend(in: A, B) depend(out: C)
            {
                printf("Thread %d: Processing upper half\\n", omp_get_thread_num());
                for (int i = 0; i < N/2; i++) {
                    for (int j = 0; j < N; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
            
            // Phase 3: Process lower half (depends on initialization)
            #pragma omp task depend(in: A, B) depend(inout: C)
            {
                printf("Thread %d: Processing lower half\\n", omp_get_thread_num());
                for (int i = N/2; i < N; i++) {
                    for (int j = 0; j < N; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
            
            // Phase 4: Validate results (depends on computation)
            #pragma omp task depend(in: C)
            {
                printf("Thread %d: Validating results\\n", omp_get_thread_num());
                int sum = 0;
                for (int i = 0; i < N; i++) {
                    for (int j = 0; j < N; j++) {
                        sum += C[i][j];
                    }
                }
                printf("Validation sum: %d\\n", sum);
            }
        }
    }
}

int main() {
    int A[N][N], B[N][N], C[N][N];
    
    printf("Starting advanced task-based matrix operations...\\n");
    advanced_matrix_operations(A, B, C);
    printf("All tasks completed!\\n");
    
    return 0;
}`,
      explanation: [
        "priority(10): Higher priority tasks execute first",
        "depend(out: A, B): Task produces output for matrices A and B",
        "depend(in: A, B): Task requires matrices A and B as input",
        "depend(inout: C): Task both reads and writes matrix C",
        "Complex workflow: Initialization → Processing → Validation",
        "Automatic dependency resolution by OpenMP runtime"
      ]
    },
    {
      id: 'performance',
      title: 'Performance Measurement Example',
      description: 'Complete example with timing and optimization',
      icon: <CheckCircle2 className="w-5 h-5" />,
      complexity: 'Production',
      performance: 'Benchmarked',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>
#include <time.h>

#define N 1000
#define WARMUP_RUNS 3
#define BENCHMARK_RUNS 10

void initialize_matrices(int A[N][N], int B[N][N]) {
    #pragma omp parallel for collapse(2)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            A[i][j] = rand() % 100;
            B[i][j] = rand() % 100;
        }
    }
}

void matrix_add_serial(int A[N][N], int B[N][N], int C[N][N]) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
}

void matrix_add_tasks(int A[N][N], int B[N][N], int C[N][N]) {
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (int i = 0; i < N; i++) {
                #pragma omp task firstprivate(i)
                {
                    for (int j = 0; j < N; j++) {
                        C[i][j] = A[i][j] + B[i][j];
                    }
                }
            }
        }
    }
}

double benchmark_function(void (*func)(int[N][N], int[N][N], int[N][N]), 
                         int A[N][N], int B[N][N], int C[N][N]) {
    double total_time = 0.0;
    
    // Warmup runs
    for (int i = 0; i < WARMUP_RUNS; i++) {
        func(A, B, C);
    }
    
    // Benchmark runs
    for (int i = 0; i < BENCHMARK_RUNS; i++) {
        double start = omp_get_wtime();
        func(A, B, C);
        double end = omp_get_wtime();
        total_time += (end - start);
    }
    
    return total_time / BENCHMARK_RUNS;
}

int main() {
    int A[N][N], B[N][N], C_serial[N][N], C_parallel[N][N];
    
    srand(time(NULL));
    initialize_matrices(A, B);
    
    printf("Matrix size: %dx%d\\n", N, N);
    printf("Number of threads: %d\\n", omp_get_max_threads());
    printf("\\nRunning benchmarks...\\n");
    
    // Benchmark serial version
    double serial_time = benchmark_function(matrix_add_serial, A, B, C_serial);
    printf("Serial execution time: %.6f seconds\\n", serial_time);
    
    // Benchmark parallel version
    double parallel_time = benchmark_function(matrix_add_tasks, A, B, C_parallel);
    printf("Parallel execution time: %.6f seconds\\n", parallel_time);
    
    // Calculate speedup
    double speedup = serial_time / parallel_time;
    printf("\\nSpeedup: %.2fx\\n", speedup);
    printf("Efficiency: %.2f%%\\n", (speedup / omp_get_max_threads()) * 100);
    
    // Verify correctness
    int correct = 1;
    for (int i = 0; i < N && correct; i++) {
        for (int j = 0; j < N && correct; j++) {
            if (C_serial[i][j] != C_parallel[i][j]) {
                correct = 0;
            }
        }
    }
    
    printf("\\nResults verification: %s\\n", correct ? "PASSED" : "FAILED");
    
    return 0;
}`,
      explanation: [
        "Warmup runs: Eliminate cold start effects for accurate timing",
        "Multiple benchmark runs: Calculate average performance",
        "omp_get_max_threads(): Query available thread count",
        "Speedup calculation: Serial time / Parallel time",
        "Efficiency: How well parallel version utilizes available cores",
        "Results verification: Ensure parallel version produces correct output",
        "Production-ready benchmarking methodology"
      ]
    }
  ];

  const keyDirectives = [
    {
      directive: "#pragma omp parallel",
      purpose: "Creates a team of threads",
      usage: "Establishes parallel region for task creation"
    },
    {
      directive: "#pragma omp single",
      purpose: "Ensures only one thread executes the block",
      usage: "Used for task creation to avoid duplicate tasks"
    },
    {
      directive: "#pragma omp task",
      purpose: "Defines an independent unit of work",
      usage: "Creates tasks that can execute concurrently"
    },
    {
      directive: "firstprivate(var)",
      purpose: "Gives each task a private copy of variable",
      usage: "Prevents race conditions on loop variables"
    },
    {
      directive: "depend(in/out/inout: var)",
      purpose: "Specifies task dependencies",
      usage: "Controls execution order based on data dependencies"
    },
    {
      directive: "priority(n)",
      purpose: "Sets task execution priority",
      usage: "Higher priority tasks execute first"
    }
  ];

  return (
    <div className="space-y-6">
      {/* OpenMP Directives Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            OpenMP Task Directives Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyDirectives.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-secondary">
                <div className="font-mono text-sm font-bold text-primary mb-1">
                  {item.directive}
                </div>
                <div className="text-sm mb-1">{item.purpose}</div>
                <div className="text-xs text-muted-foreground">{item.usage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Code Examples</CardTitle>
          <p className="text-sm text-muted-foreground">
            From basic serial implementation to advanced task-based parallelism
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="serial" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {codeExamples.map((example) => (
                <TabsTrigger key={example.id} value={example.id} className="text-xs">
                  <div className="flex items-center gap-1">
                    {example.icon}
                    <span className="hidden sm:inline">{example.title.split(' ')[0]}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {codeExamples.map((example) => (
              <TabsContent key={example.id} value={example.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{example.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">{example.complexity}</Badge>
                    <Badge variant="secondary">{example.performance}</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{example.description}</p>
                
                <div className="bg-card border rounded-lg">
                  <div className="border-b p-3 bg-muted">
                    <span className="text-sm font-medium">C Code Example</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Key Concepts Explained
                  </h4>
                  <ul className="space-y-1">
                    {example.explanation.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Compilation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Compilation Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-card border rounded-lg">
            <div className="border-b p-3 bg-muted">
              <span className="text-sm font-medium">GCC Compilation Commands</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Basic OpenMP compilation:</div>
                <code className="text-xs bg-secondary p-2 rounded block font-mono">
                  gcc -fopenmp -o matrix_addition matrix_addition.c
                </code>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">With optimization flags:</div>
                <code className="text-xs bg-secondary p-2 rounded block font-mono">
                  gcc -fopenmp -O3 -march=native -o matrix_addition matrix_addition.c
                </code>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Runtime thread control:</div>
                <code className="text-xs bg-secondary p-2 rounded block font-mono">
                  export OMP_NUM_THREADS=4<br />
                  ./matrix_addition
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeExamples;
