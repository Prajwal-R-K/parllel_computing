
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, PlayCircle, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const SynchronizationCodeExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('barrier');

  const codeExamples = {
    barrier: {
      title: "Barrier Synchronization",
      description: "All threads must reach the barrier before any can continue",
      code: `#include <omp.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define ARRAY_SIZE 1000000

int main() {
    int *array = malloc(ARRAY_SIZE * sizeof(int));
    int *results = malloc(omp_get_max_threads() * sizeof(int));
    
    printf("=== Barrier Synchronization Demo ===\\n");
    printf("Using %d threads\\n\\n", omp_get_max_threads());
    
    #pragma omp parallel
    {
        int thread_id = omp_get_thread_num();
        int num_threads = omp_get_num_threads();
        
        // Phase 1: Each thread initializes its portion
        int start = thread_id * (ARRAY_SIZE / num_threads);
        int end = (thread_id + 1) * (ARRAY_SIZE / num_threads);
        
        printf("Thread %d: Initializing elements %d to %d\\n", 
               thread_id, start, end-1);
        
        for(int i = start; i < end; i++) {
            array[i] = i * 2;  // Some initialization work
        }
        
        printf("Thread %d: Finished initialization, waiting at barrier\\n", 
               thread_id);
        
        #pragma omp barrier  // ← KEY: All threads wait here
        
        printf("Thread %d: Passed barrier, starting computation\\n", 
               thread_id);
        
        // Phase 2: Each thread computes sum of its portion
        // This phase can only start after ALL threads finish Phase 1
        int local_sum = 0;
        for(int i = start; i < end; i++) {
            local_sum += array[i];
        }
        results[thread_id] = local_sum;
        
        printf("Thread %d: Local sum = %d\\n", thread_id, local_sum);
        
        #pragma omp barrier  // Wait before final phase
        
        #pragma omp master
        {
            printf("\\n=== Master collecting results ===\\n");
            int total_sum = 0;
            for(int i = 0; i < num_threads; i++) {
                total_sum += results[i];
                printf("Thread %d contributed: %d\\n", i, results[i]);
            }
            printf("Total sum: %d\\n", total_sum);
        }
    }
    
    free(array);
    free(results);
    return 0;
}

/* Expected Output:
Thread 0: Initializing elements 0 to 249999
Thread 1: Initializing elements 250000 to 499999
Thread 2: Initializing elements 500000 to 749999
Thread 3: Initializing elements 750000 to 999999
Thread 0: Finished initialization, waiting at barrier
Thread 2: Finished initialization, waiting at barrier
Thread 1: Finished initialization, waiting at barrier
Thread 3: Finished initialization, waiting at barrier
Thread 0: Passed barrier, starting computation
Thread 1: Passed barrier, starting computation
Thread 2: Passed barrier, starting computation
Thread 3: Passed barrier, starting computation
*/`,
      analysis: {
        keyPoints: [
          "Barrier ensures all threads complete Phase 1 before starting Phase 2",
          "No thread can proceed past barrier until ALL threads reach it",
          "Implicit barrier exists at end of parallel regions",
          "Useful for multi-phase algorithms requiring synchronization"
        ],
        performance: "Prevents race conditions but can cause load imbalance delays",
        pitfalls: "Slowest thread determines overall performance"
      }
    },
    
    single: {
      title: "Single Construct",
      description: "Only one thread executes the single block, others skip it",
      code: `#include <omp.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define ARRAY_SIZE 10000

int main() {
    int *shared_array = malloc(ARRAY_SIZE * sizeof(int));
    int initialization_done = 0;
    
    printf("=== Single Construct Demo ===\\n");
    printf("Using %d threads\\n\\n", omp_get_max_threads());
    
    #pragma omp parallel
    {
        int thread_id = omp_get_thread_num();
        
        printf("Thread %d: Started parallel region\\n", thread_id);
        
        // Only ONE thread will execute this block
        #pragma omp single
        {
            printf("\\n*** Thread %d: Executing SINGLE block ***\\n", thread_id);
            printf("Thread %d: Initializing shared data structure...\\n", thread_id);
            
            // Simulate expensive initialization (file I/O, network, etc.)
            for(int i = 0; i < ARRAY_SIZE; i++) {
                shared_array[i] = rand() % 1000;
            }
            
            printf("Thread %d: Shared data initialization completed\\n", thread_id);
            initialization_done = 1;
            
            printf("*** Thread %d: SINGLE block finished ***\\n\\n", thread_id);
        }
        // Implicit barrier here - all threads wait for single to complete
        
        printf("Thread %d: Continuing after single block\\n", thread_id);
        
        // Now ALL threads can work on the initialized data
        int thread_sum = 0;
        int start = thread_id * (ARRAY_SIZE / omp_get_num_threads());
        int end = (thread_id + 1) * (ARRAY_SIZE / omp_get_num_threads());
        
        for(int i = start; i < end; i++) {
            thread_sum += shared_array[i];
        }
        
        printf("Thread %d: Processed elements %d-%d, sum = %d\\n", 
               thread_id, start, end-1, thread_sum);
    }
    
    printf("\\nAll threads completed. Shared data was initialized by only one thread.\\n");
    
    free(shared_array);
    return 0;
}

/* Expected Output:
Thread 0: Started parallel region
Thread 1: Started parallel region
Thread 2: Started parallel region
Thread 3: Started parallel region

*** Thread 2: Executing SINGLE block ***
Thread 2: Initializing shared data structure...
Thread 2: Shared data initialization completed
*** Thread 2: SINGLE block finished ***

Thread 0: Continuing after single block
Thread 1: Continuing after single block  
Thread 2: Continuing after single block
Thread 3: Continuing after single block
Thread 0: Processed elements 0-2499, sum = 1247832
Thread 1: Processed elements 2500-4999, sum = 1251043
Thread 2: Processed elements 5000-7499, sum = 1248721
Thread 3: Processed elements 7500-9999, sum = 1249876
*/`,
      analysis: {
        keyPoints: [
          "Only one thread (any thread) executes the single block",
          "Other threads skip the single block entirely",
          "Implicit barrier after single - all threads wait",
          "Useful for initialization that should happen only once"
        ],
        performance: "Avoids redundant work while maintaining parallelism",
        pitfalls: "Creates serialization bottleneck if single block is large"
      }
    },
    
    master: {
      title: "Master Construct",
      description: "Only the master thread (Thread 0) executes master blocks",
      code: `#include <omp.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

typedef struct {
    int *data;
    int size;
    double average;
    int min_val;
    int max_val;
} DataStats;

int main() {
    DataStats stats;
    stats.size = 8000;
    stats.data = malloc(stats.size * sizeof(int));
    
    printf("=== Master Construct Demo ===\\n");
    printf("Using %d threads\\n\\n", omp_get_max_threads());
    
    #pragma omp parallel
    {
        int thread_id = omp_get_thread_num();
        
        printf("Thread %d: Entered parallel region\\n", thread_id);
        
        #pragma omp master  // Only Thread 0 executes this
        {
            printf("\\n*** MASTER (Thread %d): Initializing global data ***\\n", 
                   thread_id);
            
            srand(time(NULL));
            for(int i = 0; i < stats.size; i++) {
                stats.data[i] = rand() % 1000 + 1;
            }
            
            printf("MASTER (Thread %d): Data initialization complete\\n", thread_id);
            printf("*** MASTER block finished ***\\n\\n");
        }
        // NO implicit barrier after master - other threads continue
        
        printf("Thread %d: Continuing with parallel work\\n", thread_id);
        
        // All threads work in parallel
        int local_sum = 0;
        int local_min = 1001, local_max = 0;
        int start = thread_id * (stats.size / omp_get_num_threads());
        int end = (thread_id + 1) * (stats.size / omp_get_num_threads());
        
        // Wait a bit for master to finish (in real code, use proper sync)
        if(thread_id != 0) {
            while(stats.data == NULL || stats.data[0] == 0) {
                // Busy wait (not recommended, just for demo)
            }
        }
        
        for(int i = start; i < end; i++) {
            local_sum += stats.data[i];
            if(stats.data[i] < local_min) local_min = stats.data[i];
            if(stats.data[i] > local_max) local_max = stats.data[i];
        }
        
        printf("Thread %d: Range [%d-%d], Sum=%d, Min=%d, Max=%d\\n",
               thread_id, start, end-1, local_sum, local_min, local_max);
        
        #pragma omp master  // Master collects results
        {
            printf("\\n*** MASTER (Thread %d): Collecting final results ***\\n", 
                   thread_id);
            
            // Calculate global statistics
            int total_sum = 0;
            int global_min = 1001, global_max = 0;
            
            for(int i = 0; i < stats.size; i++) {
                total_sum += stats.data[i];
                if(stats.data[i] < global_min) global_min = stats.data[i];
                if(stats.data[i] > global_max) global_max = stats.data[i];
            }
            
            stats.average = (double)total_sum / stats.size;
            stats.min_val = global_min;
            stats.max_val = global_max;
            
            printf("MASTER: Final Statistics:\\n");
            printf("  Total elements: %d\\n", stats.size);
            printf("  Average value: %.2f\\n", stats.average);
            printf("  Min value: %d\\n", stats.min_val);
            printf("  Max value: %d\\n", stats.max_val);
            printf("*** MASTER collection complete ***\\n");
        }
    }
    
    printf("\\nExecution completed. Master handled coordination tasks.\\n");
    
    free(stats.data);
    return 0;
}`,
      analysis: {
        keyPoints: [
          "Only master thread (Thread 0) executes master blocks",
          "Other threads skip master blocks and continue",
          "NO implicit barrier after master construct",
          "Useful for coordination, I/O, and result collection"
        ],
        performance: "Enables master-worker pattern with minimal overhead",
        pitfalls: "No automatic synchronization - manual sync may be needed"
      }
    }
  };

  const renderCodeBlock = (code: string) => (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
      <pre className="text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  const renderAnalysis = (analysis: any) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Key Implementation Points
        </h4>
        <ul className="space-y-1 text-sm">
          {analysis.keyPoints.map((point: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Performance Characteristics
        </h4>
        <p className="text-sm">{analysis.performance}</p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          Potential Pitfalls
        </h4>
        <p className="text-sm">{analysis.pitfalls}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Example Selection */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(codeExamples).map(([key, example]) => (
          <Button
            key={key}
            variant={activeExample === key ? "default" : "outline"}
            onClick={() => setActiveExample(key)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {example.title}
          </Button>
        ))}
      </div>

      {/* Active Example */}
      {Object.entries(codeExamples).map(([key, example]) => (
        activeExample === key && (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                {example.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{example.description}</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="code">Source Code</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="execution">Runtime Behavior</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code">
                  {renderCodeBlock(example.code)}
                </TabsContent>
                
                <TabsContent value="analysis">
                  {renderAnalysis(example.analysis)}
                </TabsContent>
                
                <TabsContent value="execution">
                  <div className="space-y-4">
                    <h4 className="font-semibold">OpenMP Runtime Behavior:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Thread Creation</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Parallel region encountered</p>
                          <p>2. Runtime creates thread team</p>
                          <p>3. Master thread = Thread 0</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Construct Execution</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Runtime identifies construct type</p>
                          <p>2. Determines which threads execute</p>
                          <p>3. Handles synchronization automatically</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Synchronization</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Barrier: All threads wait</p>
                          <p>2. Single: Implicit barrier after</p>
                          <p>3. Master: No automatic barrier</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Thread Termination</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. End of parallel region</p>
                          <p>2. Implicit barrier (unless nowait)</p>
                          <p>3. Thread team disbanded</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

export default SynchronizationCodeExamples;
