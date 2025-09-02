
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Zap, 
  GitBranch, 
  Timer, 
  Users, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const ConceptsExplainer: React.FC = () => {
  const concepts = [
    {
      icon: <Cpu className="w-6 h-6 text-primary" />,
      title: "Task-Based Parallelism",
      description: "Independent units of work that can execute concurrently",
      details: [
        "Tasks are created dynamically at runtime",
        "Better load balancing than static scheduling",
        "Ideal for irregular or unpredictable workloads",
        "Tasks can be nested and have dependencies"
      ],
      benefits: ["Dynamic scheduling", "Load balancing", "Scalability"]
    },
    {
      icon: <GitBranch className="w-6 h-6 text-accent" />,
      title: "Task Granularity",
      description: "The size of work assigned to each task",
      details: [
        "Fine-grained: Many small tasks (high overhead)",
        "Coarse-grained: Few large tasks (poor load balancing)",
        "Optimal granularity balances overhead and load balancing",
        "Can be adjusted based on problem size and system"
      ],
      benefits: ["Tunable performance", "Overhead control", "Load optimization"]
    },
    {
      icon: <Users className="w-6 h-6 text-task-running" />,
      title: "Thread Pool",
      description: "Set of worker threads that execute tasks",
      details: [
        "Created once at program start",
        "Tasks are queued and distributed to available threads",
        "Work-stealing enables load balancing",
        "Number of threads typically matches CPU cores"
      ],
      benefits: ["Efficient resource usage", "Work stealing", "Low thread overhead"]
    },
    {
      icon: <Timer className="w-6 h-6 text-task-pending" />,
      title: "Dynamic Scheduling",
      description: "Runtime assignment of tasks to threads",
      details: [
        "Tasks assigned when threads become available",
        "No predetermined work distribution",
        "Handles load imbalance automatically",
        "Better for irregular computation patterns"
      ],
      benefits: ["Automatic load balancing", "Adaptability", "Efficiency"]
    }
  ];

  const performanceFactors = [
    {
      factor: "Task Overhead",
      impact: "High",
      description: "Task creation and scheduling cost",
      mitigation: "Increase task granularity"
    },
    {
      factor: "Load Imbalance",
      impact: "Medium",
      description: "Uneven work distribution",
      mitigation: "Dynamic scheduling with work-stealing"
    },
    {
      factor: "Memory Access",
      impact: "Medium",
      description: "Cache misses and memory bandwidth",
      mitigation: "Data locality optimization"
    },
    {
      factor: "Synchronization",
      impact: "Low",
      description: "Thread coordination overhead",
      mitigation: "Minimize shared data access"
    }
  ];

  const advantages = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
      title: "Automatic Load Balancing",
      description: "Tasks are distributed dynamically across available threads"
    },
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: "Scalability",
      description: "Performance scales with the number of available cores"
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
      title: "Flexibility",
      description: "Suitable for irregular and nested parallelism patterns"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      title: "Efficiency",
      description: "Better resource utilization compared to static scheduling"
    }
  ];

  const challenges = [
    {
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      title: "Task Overhead",
      description: "Creating too many small tasks can hurt performance"
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      title: "Granularity Tuning",
      description: "Finding optimal task size requires experimentation"
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      title: "Debugging Complexity",
      description: "Non-deterministic execution makes debugging harder"
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      title: "Memory Locality",
      description: "Tasks may access non-local memory, reducing cache efficiency"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Core Concepts */}
      <Card className="bg-card border-border">
        <CardHeader className="bg-card">
          <CardTitle className="text-foreground">Core Concepts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fundamental principles of OpenMP task-based parallelism
          </p>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {concepts.map((concept, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center gap-3">
                  {concept.icon}
                  <h3 className="font-semibold text-foreground">{concept.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{concept.description}</p>
                <ul className="text-xs space-y-1 text-foreground">
                  {concept.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1">
                  {concept.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Factors */}
      <Card className="bg-card border-border">
        <CardHeader className="bg-card">
          <CardTitle className="text-foreground">Performance Considerations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Factors that affect task-based parallel performance
          </p>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="space-y-4">
            {performanceFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">{factor.factor}</h4>
                    <Badge 
                      variant={factor.impact === 'High' ? 'destructive' : factor.impact === 'Medium' ? 'default' : 'secondary'}
                    >
                      {factor.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{factor.description}</p>
                </div>
                <div className="text-xs text-primary font-medium">
                  {factor.mitigation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advantages vs Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="bg-card">
            <CardTitle className="text-primary">Advantages</CardTitle>
          </CardHeader>
          <CardContent className="bg-card">
            <div className="space-y-4">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary border border-border">
                  {advantage.icon}
                  <div>
                    <h4 className="font-medium text-foreground">{advantage.title}</h4>
                    <p className="text-sm text-muted-foreground">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="bg-card">
            <CardTitle className="text-destructive">Challenges</CardTitle>
          </CardHeader>
          <CardContent className="bg-card">
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary border border-border">
                  {challenge.icon}
                  <div>
                    <h4 className="font-medium text-foreground">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConceptsExplainer;
