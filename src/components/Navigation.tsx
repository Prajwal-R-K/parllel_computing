
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Crown, 
  RefreshCw, 
  Lock, 
  ArrowRightLeft, 
  GitBranch, 
  AlertTriangle, 
  Calendar, 
  Shield,
  ChevronRight,
  Zap
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const pages = [
    {
      path: '/',
      title: 'Home',
      icon: Home,
      description: 'Parallel Computing Overview',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      category: 'Overview'
    },
    {
      path: '/master-worker',
      title: 'Master-Worker',
      icon: Crown,
      description: 'Task distribution pattern with dynamic load balancing',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      category: 'Patterns'
    },
    {
      path: '/synchronization',
      title: 'Synchronization',
      icon: RefreshCw,
      description: 'Thread coordination primitives and barriers',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      category: 'Coordination'
    },
    {
      path: '/locks',
      title: 'Locks & Deadlocks',
      icon: Lock,
      description: 'Mutual exclusion mechanisms and deadlock prevention',
      gradient: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      category: 'Safety'
    },
    {
      path: '/producer-consumer',
      title: 'Producer-Consumer',
      icon: ArrowRightLeft,
      description: 'Data flow synchronization and buffer management',
      gradient: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-50',
      category: 'Patterns'
    },
    {
      path: '/task-dependencies',
      title: 'Task Dependencies',
      icon: GitBranch,
      description: 'DAG execution ordering and dependency resolution',
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      category: 'Scheduling'
    },
    {
      path: '/performance-pitfalls',
      title: 'Performance Pitfalls',
      icon: AlertTriangle,
      description: 'Cache coherence, false sharing, and optimization',
      gradient: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      category: 'Optimization'
    },
    {
      path: '/scheduling',
      title: 'Scheduling',
      icon: Calendar,
      description: 'Work distribution strategies and load balancing',
      gradient: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      category: 'Scheduling'
    },
    {
      path: '/thread-safety',
      title: 'Thread Safety',
      icon: Shield,
      description: 'Race conditions, atomics, and memory models',
      gradient: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      category: 'Safety'
    }
  ];

  const currentPath = location.pathname;
  const categories = [...new Set(pages.map(p => p.category))];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Interactive Learning Platform</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Explore Parallel Computing Concepts
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Navigate through different aspects of parallel programming with OpenMP. Each section includes 
          interactive visualizations, real-world examples, and comprehensive explanations.
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{category}</h3>
            <Badge variant="outline" className="text-xs">
              {pages.filter(p => p.category === category).length} topics
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages
              .filter(page => page.category === category)
              .map((page) => {
                const Icon = page.icon;
                const isActive = currentPath === page.path;
                
                return (
                  <Link key={page.path} to={page.path} className="group">
                    <Card className={`
                      h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer
                      border-2 relative overflow-hidden
                      ${isActive 
                        ? 'ring-2 ring-primary shadow-xl border-primary/50' 
                        : 'border-border hover:border-primary/30 hover:shadow-lg'
                      }
                    `}>
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${page.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                      
                      <CardContent className="p-6 relative">
                        <div className="space-y-4">
                          {/* Icon and badge */}
                          <div className="flex items-start justify-between">
                            <div className={`
                              p-3 rounded-xl ${page.bgColor} flex-shrink-0
                              transition-all duration-300 group-hover:scale-110
                            `}>
                              <Icon className={`w-6 h-6 bg-gradient-to-br ${page.gradient} bg-clip-text text-transparent`} />
                            </div>
                            {isActive && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                Current
                              </Badge>
                            )}
                          </div>

                          {/* Content */}
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                              {page.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {page.description}
                            </p>
                          </div>

                          {/* Action */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center text-primary text-sm font-medium group-hover:text-primary/80">
                              <span>Explore Topic</span>
                              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}

      {/* Footer info */}
      <div className="bg-muted/50 rounded-lg p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Each topic includes interactive controls, real-time visualizations, and comprehensive explanations
        </p>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>• Speed Controls</span>
          <span>• Thread Adjustment</span>
          <span>• Real-time Metrics</span>
          <span>• Code Examples</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
