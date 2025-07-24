import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // IMPORTANT: Changed to Shadcn UI Button
import { Expand, Loader2 } from 'lucide-react';
import { ChartComponent } from './ChartComponent';
import { motion } from 'framer-motion';

// Define API Base URL (kept for context, but not used for layout-only fix)
const API_BASE_URL = 'http://localhost:3000';

// Define the ChartData interface (kept as is)
interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'pie' | 'column' | 'area' | 'bar';
  data: (string | number)[][]; // Data for Highcharts series
  config: Highcharts.Options; // Highcharts configuration
  isLoading: boolean; // Kept for consistency, but will be false with hardcoded data
  error: string | null; // Kept for consistency, but will be null with hardcoded data
}

interface ChartGridProps {
  onExpandChart: (chart: ChartData) => void;
}

// Interface for the data fetched from stats API endpoints (kept for context)
interface StatResponse {
  count?: number;
  value?: number;
  previousCount?: number;
  previousValue?: number;
  changePercentage?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

// Using the original hardcoded chartData for layout fix only
const chartData: ChartData[] = [
  {
    id: 'revenue-trend',
    title: 'Revenue Trend',
    type: 'line',
    data: [
      ['Jan', 65000],
      ['Feb', 75000],
      ['Mar', 85000],
      ['Apr', 95000],
      ['May', 105000],
      ['Jun', 115000]
    ],
    config: {
      chart: { type: 'line' },
      title: { text: 'Monthly Revenue Trend' },
      xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], title: { text: 'Month' } },
      yAxis: { title: { text: 'Revenue (R)' } },
      series: [{ name: 'Revenue', data: [65000, 75000, 85000, 95000, 105000, 115000], type: 'line', color: '#2563eb' }]
    },
    isLoading: false, // Set to false for hardcoded data
    error: null // Set to null for hardcoded data
  },
  {
    id: 'sales-by-category',
    title: 'Sales by Category',
    type: 'pie',
    data: [
      ['Electronics', 45],
      ['Clothing', 30],
      ['Books', 15],
      ['Sports', 10]
    ],
    config: {
      chart: { type: 'pie' },
      title: { text: 'Sales Distribution by Category' },
      series: [{ name: 'Sales', data: [{name: 'Electronics', y: 45}, {name: 'Clothing', y: 30}, {name: 'Books', y: 15}, {name: 'Sports', y: 10}], type: 'pie', colorByPoint: true }]
    },
    isLoading: false,
    error: null
  },
  {
    id: 'monthly-orders',
    title: 'Monthly Orders',
    type: 'column',
    data: [
      ['Jan', 120],
      ['Feb', 135],
      ['Mar', 150],
      ['Apr', 145],
      ['May', 160],
      ['Jun', 175]
    ],
    config: {
      chart: { type: 'column' },
      title: { text: 'Monthly Order Volume' },
      xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], title: { text: 'Month' } },
      yAxis: { title: { text: 'Orders' } },
      series: [{ name: 'Orders', data: [120, 135, 150, 145, 160, 175], type: 'column', color: '#10b981' }]
    },
    isLoading: false,
    error: null
  },
  {
    id: 'profit-margin',
    title: 'Profit Margin Analysis',
    type: 'area',
    data: [
      ['Q1', 15.2],
      ['Q2', 18.7],
      ['Q3', 22.1],
      ['Q4', 19.8]
    ],
    config: {
      chart: { type: 'area' },
      title: { text: 'Quarterly Profit Margin' },
      xAxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'], title: { text: 'Quarter' } },
      yAxis: { title: { text: 'Margin (%)' } },
      series: [{ name: 'Profit Margin', data: [15.2, 18.7, 22.1, 19.8], type: 'area', color: '#f59e0b' }]
    },
    isLoading: false,
    error: null
  },
  {
    id: 'customer-acquisition',
    title: 'Customer Acquisition',
    type: 'bar',
    data: [
      ['Online Ads', 45],
      ['Referrals', 35],
      ['Social Media', 25],
      ['Direct', 20],
      ['Email', 15]
    ],
    config: {
      chart: { type: 'bar' },
      title: { text: 'Customer Acquisition Channels' },
      xAxis: { categories: ['Online Ads', 'Referrals', 'Social Media', 'Direct', 'Email'], title: { text: 'Channel' } },
      yAxis: { title: { text: 'Customers' } },
      series: [{ name: 'Customers', data: [45, 35, 25, 20, 15], type: 'bar', color: '#8b5cf6' }]
    },
    isLoading: false,
    error: null
  },
  {
    id: 'inventory-levels',
    title: 'Inventory Levels',
    type: 'line',
    data: [
      ['Week 1', 450],
      ['Week 2', 420],
      ['Week 3', 380],
      ['Week 4', 410],
      ['Week 5', 390],
      ['Week 6', 430]
    ],
    config: {
      chart: { type: 'line' },
      title: { text: 'Weekly Inventory Levels' },
      xAxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'], title: { text: 'Week' } },
      yAxis: { title: { text: 'Units' } },
      series: [{ name: 'Inventory', data: [450, 420, 380, 410, 390, 430], type: 'line', color: '#ef4444' }]
    },
    isLoading: false,
    error: null
  }
];

export function ChartGrid ({ onExpandChart }: ChartGridProps) {
  // Using hardcoded chartData for layout fix, so no useState/useEffect for fetching needed here.
  // The 'isLoading' and 'error' properties are part of the ChartData interface for future dynamic use.

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {chartData.map((chart, index) => (
        <motion.div
          key={chart.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className='relative group h-full flex flex-col'> {/* Added h-full and flex-col */}
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {chart.title}
              </CardTitle>
              {/* Replaced Ant Design Button with Shadcn UI Button */}
              <Button
                variant='ghost' // Use ghost variant for a subtle button
                size='icon' // Make it a small icon button
                onClick={() => onExpandChart(chart)}
                // Position absolutely within the card, visible on hover
                className='opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-10'
              >
                <Expand className='h-4 w-4' />
              </Button>
            </CardHeader>
            <CardContent className='flex-1 flex items-center justify-center p-4'> {/* Added flex-1 and p-4 */}
              <div className='w-full h-full'> {/* Ensure Highcharts takes full available space */}
                {/* With hardcoded data, isLoading is false and error is null */}
                <ChartComponent
                  data={chart.data}
                  config={{
                    ...chart.config,
                    // Ensure series data is correctly passed from the hardcoded 'data'
                    series: Array.isArray(chart.config.series)
                      ? chart.config.series.map((s: any) => ({ ...s, data: s.type === 'pie' ? chart.data.map(item => ({ name: item[0], y: item[1] })) : chart.data }))
                      : [{ ...chart.config.series, data: chart.config.series?.type === 'pie' ? chart.data.map(item => ({ name: item[0], y: item[1] })) : chart.data }]
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
