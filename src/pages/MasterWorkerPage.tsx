
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Crown, Users, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import MasterWorkerVisualization from '@/components/MasterWorkerVisualization';
import MasterWorkerCodeExamples from '@/components/MasterWorkerCodeExamples';

const MasterWorkerPage: React.FC = () => {
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
          <div className="flex justify-center items-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-primary" />
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Master–Worker Model
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore how the Master-Worker pattern distributes tasks from a central coordinator 
            to multiple worker threads, with detailed visualizations and real-world analogies.
          </p>
        </div>

        {/* Concept Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="w-5 h-5 text-primary" />
                Core Concept
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                The Master-Worker pattern is a fundamental parallel computing design where:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <span><strong>Master thread</strong> manages task distribution and coordination</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <span><strong>Worker threads</strong> execute assigned tasks independently</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <span><strong>Load balancing</strong> occurs naturally as fast workers get more tasks</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• <strong>Dynamic load balancing:</strong> Fast workers get more tasks automatically</li>
                <li>• <strong>Scalability:</strong> Easy to add more worker threads</li>
                <li>• <strong>Fault tolerance:</strong> Failed workers don't block others</li>
                <li>• <strong>Simplicity:</strong> Clear separation of coordination and execution</li>
                <li>• <strong>Heterogeneous systems:</strong> Works well with different CPU speeds</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Limitations & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-red-500">Problem:</strong> Master thread bottleneck
                  <br />
                  <strong className="text-green-600">Solution:</strong> Use task queues, minimize master work
                </div>
                <div>
                  <strong className="text-red-500">Problem:</strong> Communication overhead
                  <br />
                  <strong className="text-green-600">Solution:</strong> Batch tasks, optimize task size
                </div>
                <div>
                  <strong className="text-red-500">Problem:</strong> Load imbalance at end
                  <br />
                  <strong className="text-green-600">Solution:</strong> Work-stealing, smaller final tasks
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-World Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Real-World Applications & Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">🍳 Restaurant Kitchen</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Master:</strong> Head chef assigns dishes to cooks<br />
                  <strong>Workers:</strong> Line cooks prepare assigned meals<br />
                  <strong>Load Balancing:</strong> Fast cooks get more orders
                </p>
                <Badge variant="secondary">Service Industry</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">🏭 Manufacturing Line</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Master:</strong> Production supervisor distributes parts<br />
                  <strong>Workers:</strong> Assembly stations process components<br />
                  <strong>Optimization:</strong> Efficient stations handle more units
                </p>
                <Badge variant="secondary">Manufacturing</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">💻 Web Server</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Master:</strong> Load balancer distributes requests<br />
                  <strong>Workers:</strong> Backend servers handle requests<br />
                  <strong>Scaling:</strong> Add more servers for higher load
                </p>
                <Badge variant="secondary">Web Development</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">🔬 Scientific Computing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Example:</strong> Monte Carlo simulations<br />
                  <strong>Master:</strong> Distributes parameter sets<br />
                  <strong>Workers:</strong> Run simulations with different parameters
                </p>
                <Badge variant="secondary">Research</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">🎮 Game Engine</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Master:</strong> Main thread manages game objects<br />
                  <strong>Workers:</strong> Physics, AI, and rendering threads<br />
                  <strong>Coordination:</strong> Synchronize frame updates
                </p>
                <Badge variant="secondary">Gaming</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📊 Data Processing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Example:</strong> Large dataset analysis<br />
                  <strong>Master:</strong> Splits data into chunks<br />
                  <strong>Workers:</strong> Process data chunks independently
                </p>
                <Badge variant="secondary">Big Data</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Interactive Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Master-Worker Visualization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Watch how a master thread coordinates task distribution to worker threads.
                Control speed, number of threads, and observe real-time execution patterns.
              </p>
            </CardHeader>
            <CardContent>
              <MasterWorkerVisualization />
            </CardContent>
          </Card>

          {/* Code Examples and Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Code Examples & Internal Working</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real OpenMP implementations with detailed analysis and multiple programming approaches.
              </p>
            </CardHeader>
            <CardContent>
              <MasterWorkerCodeExamples />
            </CardContent>
          </Card>

          {/* Performance Considerations */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis & Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Factors Affecting Performance:</h4>
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Task Granularity:</strong> Balance between overhead and parallelism</li>
                    <li>• <strong>Communication Cost:</strong> Minimize data transfer between threads</li>
                    <li>• <strong>Load Distribution:</strong> Ensure even workload across workers</li>
                    <li>• <strong>Synchronization:</strong> Reduce blocking and waiting time</li>
                    <li>• <strong>Memory Access:</strong> Consider cache locality and false sharing</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Optimization Strategies:</h4>
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Work Stealing:</strong> Let idle workers steal tasks from busy ones</li>
                    <li>• <strong>Batch Processing:</strong> Group small tasks to reduce overhead</li>
                    <li>• <strong>Hierarchical Masters:</strong> Use multiple levels of coordination</li>
                    <li>• <strong>Affinity Control:</strong> Pin threads to specific CPU cores</li>
                    <li>• <strong>Dynamic Scheduling:</strong> Adjust task distribution based on performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison with Other Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison with Other Parallel Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Pattern</th>
                      <th className="text-left p-3">Coordination</th>
                      <th className="text-left p-3">Load Balancing</th>
                      <th className="text-left p-3">Best For</th>
                      <th className="text-left p-3">Drawbacks</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b">
                      <td className="p-3 font-semibold">Master-Worker</td>
                      <td className="p-3">Centralized</td>
                      <td className="p-3">Dynamic</td>
                      <td className="p-3">Irregular tasks, different complexities</td>
                      <td className="p-3">Master bottleneck</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold">Fork-Join</td>
                      <td className="p-3">Structured</td>
                      <td className="p-3">Static</td>
                      <td className="p-3">Divide-and-conquer algorithms</td>
                      <td className="p-3">Load imbalance</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold">Pipeline</td>
                      <td className="p-3">Sequential stages</td>
                      <td className="p-3">Stage-based</td>
                      <td className="p-3">Stream processing, assembly lines</td>
                      <td className="p-3">Bottleneck stages</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-semibold">Producer-Consumer</td>
                      <td className="p-3">Buffer-based</td>
                      <td className="p-3">Rate-dependent</td>
                      <td className="p-3">Data flow, buffered processing</td>
                      <td className="p-3">Buffer management</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasterWorkerPage;
