import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { 
  Cpu, 
  Code, 
  Zap, 
  GitCompare, 
  Settings, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">OpenMP Educational Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Parallel Computing
              </span>
              <br />
              <span className="text-foreground">Visualization Hub</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Master the fundamentals of parallel programming through interactive demonstrations, 
              real-time visualizations, and comprehensive learning modules designed for both 
              beginners and advanced practitioners.
            </p>
            
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
                <Zap className="w-4 h-4" />
                Real-time Visualization
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
                <GitCompare className="w-4 h-4" />
                Serial vs Parallel
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
                <Settings className="w-4 h-4" />
                Interactive Controls
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
                <Code className="w-4 h-4" />
                Code Examples
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* OpenMP Card */}
          <div className="max-w-4xl mx-auto">
            <Link to="/openmp" className="group block">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer border-2 relative overflow-hidden hover:border-primary/30">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity" />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-xl bg-blue-50 flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                        <Cpu className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                          OpenMP Task Parallelism
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          Interactive visualizations and comprehensive learning modules for OpenMP parallel programming
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium text-primary">Fundamentals</div>
                      <div className="text-xs text-muted-foreground">Core concepts</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium text-primary">Matrix Operations</div>
                      <div className="text-xs text-muted-foreground">Real examples</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium text-primary">Comparisons</div>
                      <div className="text-xs text-muted-foreground">Serial vs Parallel</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium text-primary">Code Examples</div>
                      <div className="text-xs text-muted-foreground">Practical demos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline">Interactive</Badge>
                      <Badge variant="outline">Real-time</Badge>
                      <Badge variant="outline">Educational</Badge>
                    </div>
                    <div className="text-sm text-primary font-medium">
                      Explore OpenMP →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Other Topics */}
          <Navigation />
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">OpenMP Learning Platform</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Master parallel computing concepts through interactive visualizations, comprehensive 
              explanations, and hands-on examples. Built for students, researchers, and professionals.
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-4">
              <span>• Interactive Visualizations</span>
              <span>• Real-time Controls</span>
              <span>• Comprehensive Examples</span>
              <span>• Educational Content</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
