
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import MatrixVisualization from '@/components/MatrixVisualization';
import SerialVsParallelDemo from '@/components/SerialVsParallelDemo';
import InternalProcessVisualization from '@/components/InternalProcessVisualization';
import CodeExamples from '@/components/CodeExamples';
import ConceptsExplainer from '@/components/ConceptsExplainer';
import ParallelismFundamentals from '@/components/ParallelismFundamentals';
import MatrixAdditionExamples from '@/components/MatrixAdditionExamples';
import MatrixCodeAnalysis from '@/components/MatrixCodeAnalysis';
import { 
  Cpu, 
  Code, 
  BookOpen, 
  GitCompare, 
  Settings, 
  Network, 
  Grid
} from 'lucide-react';

const OpenMPPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
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
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                OpenMP Task Parallelism
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore parallel computing concepts through interactive visualizations, 
              real-time demonstrations, and comprehensive learning modules.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="fundamentals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-8 h-auto">
            <TabsTrigger value="fundamentals" className="flex items-center gap-2 py-3">
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Fundamentals</span>
            </TabsTrigger>
            <TabsTrigger value="matrix-examples" className="flex items-center gap-2 py-3">
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2 py-3">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Internal</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2 py-3">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="concepts" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Concepts</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2 py-3">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fundamentals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-6 h-6" />
                  Parallelism Fundamentals - Internal Workings
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <Grid className="w-6 h-6" />
                  Matrix Addition - Complete Parallelism Examples
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="w-6 h-6" />
                  Serial vs Parallel Execution Comparison
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Internal Process Visualization
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-6 h-6" />
                  OpenMP Task-Based Parallelism
                </CardTitle>
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
    </div>
  );
};

export default OpenMPPage;
