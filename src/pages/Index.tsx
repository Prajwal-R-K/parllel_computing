import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MatrixVisualization from '@/components/MatrixVisualization';
import SerialVsParallelDemo from '@/components/SerialVsParallelDemo';
import InternalProcessVisualization from '@/components/InternalProcessVisualization';
import CodeExamples from '@/components/CodeExamples';
import ConceptsExplainer from '@/components/ConceptsExplainer';
import ParallelismFundamentals from '@/components/ParallelismFundamentals';
import MatrixAdditionExamples from '@/components/MatrixAdditionExamples';
import MatrixCodeAnalysis from '@/components/MatrixCodeAnalysis';
import { Cpu, Code, BookOpen, Zap, GitCompare, Settings, Network, Grid } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-r from-background via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Cpu className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-sm">
                OpenMP Educational Platform
              </Badge>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Parallel Computing Visualization
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how serial and parallel processing work internally with interactive demonstrations
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Real-time Visualization
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <GitCompare className="w-3 h-3" />
                Serial vs Parallel
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Internal Process View
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="fundamentals" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="fundamentals" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Fundamentals
            </TabsTrigger>
            <TabsTrigger value="matrix-examples" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Matrix Examples
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              Serial vs Parallel
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Internal Process
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              OpenMP Tasks
            </TabsTrigger>
            <TabsTrigger value="concepts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Concepts
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fundamentals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parallelism Fundamentals - Internal Workings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Understand how different types of parallelism work internally. Watch thread creation, 
                  task distribution, assignment, and execution in real-time.
                </p>
              </CardHeader>
              <CardContent>
                <ParallelismFundamentals />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix-examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matrix Addition - Complete Parallelism Examples</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See different parallelism approaches applied to matrix addition with detailed 
                  step-by-step visualization of thread behavior and task execution.
                </p>
              </CardHeader>
              <CardContent>
                <MatrixAdditionExamples />
              </CardContent>
            </Card>
            
            <MatrixCodeAnalysis />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Serial vs Parallel Execution Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare how matrix addition is performed sequentially versus concurrently.
                  Watch the visual differences in processing patterns and execution time.
                </p>
              </CardHeader>
              <CardContent>
                <SerialVsParallelDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internal Process Visualization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See how CPU cores are utilized differently in serial and parallel execution modes.
                  Understand the internal workings of task scheduling and resource allocation.
                </p>
              </CardHeader>
              <CardContent>
                <InternalProcessVisualization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>OpenMP Task-Based Parallelism</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced OpenMP task system with dynamic scheduling and work-stealing.
                  Adjust parameters to see how task granularity affects performance.
                </p>
              </CardHeader>
              <CardContent>
                <MatrixVisualization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            <ConceptsExplainer />
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <CodeExamples />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Educational Platform for Parallel Computing Concepts
            </p>
            <p className="text-xs text-muted-foreground">
              Learn the fundamentals of serial vs parallel processing with complete internal visualizations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;