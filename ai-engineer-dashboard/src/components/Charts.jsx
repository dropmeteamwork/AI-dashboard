import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data for charts
const processingTrendData = [
  { time: '00:00', items: 12, confidence: 89 },
  { time: '04:00', items: 8, confidence: 92 },
  { time: '08:00', items: 25, confidence: 94 },
  { time: '12:00', items: 45, confidence: 91 },
  { time: '16:00', items: 38, confidence: 93 },
  { time: '20:00', items: 22, confidence: 90 },
  { time: '24:00', items: 15, confidence: 88 }
];

const classificationData = [
  { name: 'Plastic Bottles', value: 45, color: '#22C55E' },
  { name: 'Aluminum Cans', value: 30, color: '#16A34A' },
  { name: 'Glass Bottles', value: 15, color: '#15803D' },
  { name: 'Paper Cups', value: 10, color: '#DCFCE7' }
];

const machinePerformanceData = [
  { machine: 'RVM-001', processed: 45, accuracy: 94, flagged: 3 },
  { machine: 'RVM-002', processed: 67, accuracy: 91, flagged: 5 },
  { machine: 'RVM-003', processed: 23, accuracy: 88, flagged: 4 },
  { machine: 'RVM-004', processed: 34, accuracy: 96, flagged: 2 }
];

const errorTrendData = [
  { date: 'Mon', flagged: 8, resolved: 6 },
  { date: 'Tue', flagged: 12, resolved: 10 },
  { date: 'Wed', flagged: 6, resolved: 8 },
  { date: 'Thu', flagged: 15, resolved: 12 },
  { date: 'Fri', flagged: 9, resolved: 11 },
  { date: 'Sat', flagged: 4, resolved: 5 },
  { date: 'Sun', flagged: 7, resolved: 6 }
];

const confidenceDistributionData = [
  { range: '90-100%', count: 120 },
  { range: '80-89%', count: 35 },
  { range: '70-79%', count: 12 },
  { range: '60-69%', count: 8 },
  { range: '<60%', count: 3 }
];

export const ProcessingTrendChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={processingTrendData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="time" stroke="#666" />
      <YAxis stroke="#666" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="items" 
        stroke="#22C55E" 
        strokeWidth={3}
        dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
        name="Items Processed"
      />
    </LineChart>
  </ResponsiveContainer>
);

export const ClassificationPieChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={classificationData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {classificationData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
    </PieChart>
  </ResponsiveContainer>
);

export const MachinePerformanceChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={machinePerformanceData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="machine" stroke="#666" />
      <YAxis stroke="#666" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Legend />
      <Bar dataKey="processed" fill="#22C55E" name="Items Processed" radius={[4, 4, 0, 0]} />
      <Bar dataKey="accuracy" fill="#16A34A" name="Accuracy %" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const ErrorTrendChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={errorTrendData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="date" stroke="#666" />
      <YAxis stroke="#666" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Legend />
      <Area 
        type="monotone" 
        dataKey="flagged" 
        stackId="1" 
        stroke="#EF4444" 
        fill="#FEE2E2" 
        name="Flagged Items"
      />
      <Area 
        type="monotone" 
        dataKey="resolved" 
        stackId="1" 
        stroke="#22C55E" 
        fill="#DCFCE7" 
        name="Resolved Items"
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const ConfidenceDistributionChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={confidenceDistributionData} layout="horizontal">
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis type="number" stroke="#666" />
      <YAxis dataKey="range" type="category" stroke="#666" width={80} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Bar dataKey="count" fill="#22C55E" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const RealTimeMetricsChart = () => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={processingTrendData.slice(-4)}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="time" stroke="#666" />
      <YAxis stroke="#666" />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Line 
        type="monotone" 
        dataKey="items" 
        stroke="#22C55E" 
        strokeWidth={2}
        dot={{ fill: '#22C55E', strokeWidth: 2, r: 3 }}
        name="Items/Hour"
      />
      <Line 
        type="monotone" 
        dataKey="confidence" 
        stroke="#16A34A" 
        strokeWidth={2}
        dot={{ fill: '#16A34A', strokeWidth: 2, r: 3 }}
        name="Confidence %"
      />
    </LineChart>
  </ResponsiveContainer>
);

