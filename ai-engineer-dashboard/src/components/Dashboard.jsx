import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Flag, 
  Monitor, 
  Settings, 
  Users, 
  Zap,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ProcessingTrendChart, 
  ClassificationPieChart, 
  MachinePerformanceChart, 
  ErrorTrendChart, 
  ConfidenceDistributionChart,
  RealTimeMetricsChart 
} from './Charts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Mock data for demonstration
  const machineData = [
    { id: 'RVM-001', name: 'Mall Central', status: 'online', lastSync: '2 min ago', itemsToday: 45, confidence: 94 },
    { id: 'RVM-002', name: 'University Campus', status: 'online', lastSync: '1 min ago', itemsToday: 67, confidence: 91 },
    { id: 'RVM-003', name: 'Shopping Center', status: 'offline', lastSync: '15 min ago', itemsToday: 23, confidence: 88 },
    { id: 'RVM-004', name: 'Office Complex', status: 'online', lastSync: '3 min ago', itemsToday: 34, confidence: 96 },
  ];

  const flaggedItems = [
    { id: 1, image: '/api/placeholder/100/100', classification: 'Plastic Bottle', confidence: 67, timestamp: '10:30 AM', machine: 'RVM-001', status: 'pending' },
    { id: 2, image: '/api/placeholder/100/100', classification: 'Aluminum Can', confidence: 72, timestamp: '10:25 AM', machine: 'RVM-002', status: 'pending' },
    { id: 3, image: '/api/placeholder/100/100', classification: 'Glass Bottle', confidence: 65, timestamp: '10:20 AM', machine: 'RVM-001', status: 'reviewed' },
    { id: 4, image: '/api/placeholder/100/100', classification: 'Paper Cup', confidence: 58, timestamp: '10:15 AM', machine: 'RVM-003', status: 'pending' },
  ];

  const recentActivity = [
    { type: 'flag', message: 'Item flagged for review in RVM-001', time: '2 min ago' },
    { type: 'update', message: 'AI model v2.1.3 deployed to RVM-002', time: '5 min ago' },
    { type: 'alert', message: 'RVM-003 went offline', time: '15 min ago' },
    { type: 'success', message: 'Batch export completed (45 items)', time: '20 min ago' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'flag': return <Flag className="w-4 h-4 text-yellow-500" />;
      case 'update': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AI Engineer Dashboard</h1>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2">
                
              </div>
              All Systems Online
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium">AI Engineer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button 
                variant={activeTab === 'machines' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('machines')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Machines
              </Button>
              <Button 
                variant={activeTab === 'flags' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('flags')}
              >
                <Flag className="w-4 h-4 mr-2" />
                Flagged Items
              </Button>
              <Button 
                variant={activeTab === 'models' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('models')}
              >
                <Database className="w-4 h-4 mr-2" />
                AI Models
              </Button>
              <Button 
                variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('analytics')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Online Machines</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">3/4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Flagged Items</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Version</span>
                <Badge variant="secondary">v2.1.3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-xs text-gray-500">1m ago</span>
              </div>
            </div>
          </div>

          {/* Machine List */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Machines</h3>
            <div className="space-y-2">
              {machineData.map((machine) => (
                <div 
                  key={machine.id} 
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMachine === machine.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMachine(machine.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)}`}></div>
                      <span className="text-sm font-medium">{machine.id}</span>
                    </div>
                    <span className="text-xs text-gray-500">{machine.itemsToday}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{machine.name}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items Processed</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">169</div>
                    <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92.3%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Awaiting review</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3/4</div>
                    <p className="text-xs text-muted-foreground">1 machine offline</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Mini Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest events from your RVM network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <span>Processing Overview</span>
                    </CardTitle>
                    <CardDescription>Real-time processing metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RealTimeMetricsChart />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Flagged Items</h2>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search items..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flaggedItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                        <Eye className="w-8 h-8 text-gray-500" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={item.status === 'pending' ? 'destructive' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                      <h3 className="font-medium mb-1">{item.classification}</h3>
                      <p className="text-sm text-gray-600 mb-2">Confidence: {item.confidence}%</p>
                      <p className="text-xs text-gray-500 mb-3">Machine: {item.machine}</p>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Correct
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Incorrect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'machines' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Machine Monitoring</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {machineData.map((machine) => (
                  <Card key={machine.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status)}`}></div>
                          <span>{machine.id}</span>
                        </CardTitle>
                        <Badge variant={machine.status === 'online' ? 'default' : 'destructive'}>
                          {machine.status}
                        </Badge>
                      </div>
                      <CardDescription>{machine.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Items Today:</span>
                          <span className="font-medium">{machine.itemsToday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg. Confidence:</span>
                          <span className="font-medium">{machine.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Sync:</span>
                          <span className="font-medium">{machine.lastSync}</span>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View Captures
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sync Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">AI Model Management</h2>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Model
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Model Version</CardTitle>
                  <CardDescription>Active across all RVM units</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">v2.1.3</h3>
                      <p className="text-sm text-gray-600">Deployed: March 15, 2024</p>
                      <p className="text-sm text-gray-600">Accuracy: 92.3%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline">View Details</Button>
                      <Button variant="outline">Rollback</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                  <CardDescription>Classification accuracy over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Performance chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
              
              {/* Real-time Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Real-time Processing Metrics</span>
                  </CardTitle>
                  <CardDescription>Live data from the last 4 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeMetricsChart />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Trends</CardTitle>
                    <CardDescription>Items processed over the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProcessingTrendChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Classification Distribution</CardTitle>
                    <CardDescription>Breakdown by item type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClassificationPieChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Machine Performance</CardTitle>
                    <CardDescription>Comparison across all units</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MachinePerformanceChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Error Trends</CardTitle>
                    <CardDescription>Flagged vs resolved items over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ErrorTrendChart />
                  </CardContent>
                </Card>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Confidence Score Distribution</CardTitle>
                    <CardDescription>AI model confidence levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConfidenceDistributionChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health Metrics</CardTitle>
                    <CardDescription>Overall system performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">System Uptime</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">99.8%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Response Time</span>
                        <span className="text-sm">1.2s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Data Sync Success Rate</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">98.5%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Storage Usage</span>
                        <span className="text-sm">67% (2.1GB / 3.2GB)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

