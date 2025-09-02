
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import SchedulingVisualization from '@/components/SchedulingVisualization';

const SchedulingPage: React.FC = () => {
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
            Scheduling Strategies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare static, dynamic, guided scheduling and the impact of nowait on synchronization.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iteration-to-Thread Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <SchedulingVisualization />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulingPage;
