
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskDependenciesVisualization from '@/components/TaskDependenciesVisualization';

const TaskDependenciesPage: React.FC = () => {
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
            Task Dependencies (DAG)
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how OpenMP schedules dependent tasks to respect data dependencies.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interactive DAG Visualization</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardContent>
            <TaskDependenciesVisualization />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDependenciesPage;
