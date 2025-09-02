
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, PlayCircle, Clock, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

const MasterWorkerCodeExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');

  const codeExamples = {
    basic: {
      title: "Basic Master-Worker Pattern",
      description: "Simple task distribution using OpenMP master construct",
      code: `#include <omp.h>
#include <stdio.h>
#include <stdlib.h>

#define NUM_TASKS 12
#define MATRIX_SIZE 1000

int task_queue[NUM_TASKS];
int task_results[NUM_TASKS];
int next_task = 0;

void process_task(int task_id) {
    // Simulate matrix row computation
    int sum = 0;
    for(int i = 0; i < MATRIX_SIZE; i++) {
        sum += task_id * i;  // Dummy computation
    }
    task_results[task_id] = sum;
    printf("Worker %d completed Task %d\\n", 
           omp_get_thread_num(), task_id);
}

int main() {
    // Initialize task queue
    for(int i = 0; i < NUM_TASKS; i++) {
        task_queue[i] = i;
    }
    
    printf("Starting Master-Worker with %d threads\\n", 
           omp_get_max_threads());
    
    #pragma omp parallel
    {
        int thread_id = omp_get_thread_num();
        
        #pragma omp master
        {
            printf("Master (Thread %d): Distributing tasks...\\n", thread_id);
            // Master distributes tasks to workers
            while(next_task < NUM_TASKS) {
                printf("Master: Task %d ready for assignment\\n", next_task);
                next_task++;
                // Small delay to visualize distribution
                for(int i = 0; i < 1000000; i++);
            }
            printf("Master: All tasks distributed\\n");
        }
        
        // Workers pick up and process tasks
        #pragma omp for schedule(dynamic, 1)
        for(int i = 0; i < NUM_TASKS; i++) {
            printf("Worker %d: Processing Task %d\\n", thread_id, i);
            process_task(i);
        }
        
        #pragma omp master
        {
            printf("Master: Collecting results...\\n");
            int total = 0;
            for(int i = 0; i < NUM_TASKS; i++) {
                total += task_results[i];
            }
            printf("Master: Total result = %d\\n", total);
        }
    }
    
    return 0;
}`,
      analysis: {
        keyPoints: [
          "Master thread (Thread 0) handles task distribution",
          "Workers use dynamic scheduling for load balancing",
          "Master collects results after all workers finish",
          "Implicit barrier ensures synchronization"
        ],
        performance: "Dynamic scheduling provides good load balancing",
        pitfalls: "Master thread idle during worker execution phase"
      }
    },
    
    advanced: {
      title: "Work-Stealing Master-Worker",
      description: "Advanced pattern with work-stealing queue and task dependencies",
      code: `#include <omp.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct {
    int task_id;
    int priority;
    int dependency;
    bool completed;
} Task;

Task task_pool[100];
int pool_size = 0;
omp_lock_t pool_lock;

void add_task(int id, int priority, int dep) {
    omp_set_lock(&pool_lock);
    task_pool[pool_size] = (Task){id, priority, dep, false};
    pool_size++;
    printf("Master: Added Task %d (priority %d, depends on %d)\\n", 
           id, priority, dep);
    omp_unset_lock(&pool_lock);
}

Task* get_next_task() {
    Task* task = NULL;
    omp_set_lock(&pool_lock);
    
    // Find highest priority task with satisfied dependencies
    for(int i = 0; i < pool_size; i++) {
        if(!task_pool[i].completed) {
            bool dep_satisfied = true;
            if(task_pool[i].dependency >= 0) {
                dep_satisfied = task_pool[task_pool[i].dependency].completed;
            }
            
            if(dep_satisfied && (task == NULL || 
                task_pool[i].priority > task->priority)) {
                task = &task_pool[i];
            }
        }
    }
    
    omp_unset_lock(&pool_lock);
    return task;
}

void execute_task(Task* task) {
    int thread_id = omp_get_thread_num();
    printf("Worker %d: Starting Task %d\\n", thread_id, task->task_id);
    
    // Simulate work (different computation times)
    int work_amount = 1000000 * (task->priority + 1);
    volatile int sum = 0;
    for(int i = 0; i < work_amount; i++) {
        sum += i;
    }
    
    task->completed = true;
    printf("Worker %d: Completed Task %d\\n", thread_id, task->task_id);
}

int main() {
    omp_init_lock(&pool_lock);
    
    printf("=== Work-Stealing Master-Worker Pattern ===\\n");
    
    #pragma omp parallel num_threads(5)
    {
        int thread_id = omp_get_thread_num();
        
        #pragma omp master
        {
            // Master creates tasks with dependencies
            printf("Master (Thread %d): Creating task dependency graph\\n", thread_id);
            
            add_task(0, 1, -1);  // No dependency
            add_task(1, 2, -1);  // No dependency
            add_task(2, 3, 0);   // Depends on Task 0
            add_task(3, 3, 0);   // Depends on Task 0
            add_task(4, 4, 1);   // Depends on Task 1
            add_task(5, 5, 2);   // Depends on Task 2
            add_task(6, 6, 3);   // Depends on Task 3
            add_task(7, 7, 4);   // Depends on Task 4
            
            printf("Master: Task graph created\\n");
        }
        
        #pragma omp barrier  // Wait for master to create all tasks
        
        // All threads (including master) become workers
        while(true) {
            Task* task = get_next_task();
            if(task == NULL) {
                // Check if all tasks completed
                bool all_done = true;
                for(int i = 0; i < pool_size; i++) {
                    if(!task_pool[i].completed) {
                        all_done = false;
                        break;
                    }
                }
                if(all_done) break;
                
                // No available tasks, yield and try again
                #pragma omp taskyield
                continue;
            }
            
            execute_task(task);
        }
        
        #pragma omp master
        {
            printf("Master: All tasks completed successfully\\n");
        }
    }
    
    omp_destroy_lock(&pool_lock);
    return 0;
}`,
      analysis: {
        keyPoints: [
          "Master creates task dependency graph",
          "All threads participate in work-stealing",
          "Priority-based task selection",
          "Dynamic dependency resolution"
        ],
        performance: "Better CPU utilization as master also works",
        pitfalls: "Lock contention on task pool access"
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
          <Clock className="w-4 h-4 text-blue-500" />
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
                  <TabsTrigger value="execution">Execution Flow</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code">
                  {renderCodeBlock(example.code)}
                </TabsContent>
                
                <TabsContent value="analysis">
                  {renderAnalysis(example.analysis)}
                </TabsContent>
                
                <TabsContent value="execution">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Internal Execution Flow:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Phase 1: Initialization</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Parallel region created</p>
                          <p>2. Thread team formed (1 master + N workers)</p>
                          <p>3. Master thread identified (thread_id = 0)</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Phase 2: Task Distribution</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Master creates/assigns tasks</p>
                          <p>2. Workers wait or steal available tasks</p>
                          <p>3. Load balancing through dynamic scheduling</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Phase 3: Execution</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Workers execute assigned tasks</p>
                          <p>2. Master may participate or coordinate</p>
                          <p>3. Progress monitoring and load balancing</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-full justify-center">Phase 4: Synchronization</Badge>
                        <div className="text-sm space-y-1">
                          <p>1. Implicit barrier at parallel region end</p>
                          <p>2. Master collects results</p>
                          <p>3. Thread team dissolved</p>
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

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Performance Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">High</div>
              <div className="text-sm text-muted-foreground">Load Balancing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">Medium</div>
              <div className="text-sm text-muted-foreground">Overhead</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">Variable</div>
              <div className="text-sm text-muted-foreground">Scalability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterWorkerCodeExamples;
