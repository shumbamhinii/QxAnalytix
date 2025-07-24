import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, FileText, BarChart3, Loader2 } from 'lucide-react'; // Added Loader2
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Import Button for retry

// Define API Base URL
const API_BASE_URL = 'http://localhost:3000'; // Ensure this matches your backend server URL

// Define interfaces for the fetched data, now including change details
interface StatResponse {
  count?: number; // For clients, quotes, invoices
  value?: number; // For invoice value
  previousCount?: number; // For counts
  previousValue?: number; // For invoice value
  changePercentage?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export function StatsCards() {
  const [clientStats, setClientStats] = useState<StatResponse | null>(null);
  const [quoteStats, setQuoteStats] = useState<StatResponse | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<StatResponse | null>(null);
  const [invoiceValueStats, setInvoiceValueStats] = useState<StatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        clientsRes,
        quotesRes,
        invoicesRes,
        invoiceValueRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats/clients`),
        fetch(`${API_BASE_URL}/api/stats/quotes`),
        fetch(`${API_BASE_URL}/api/stats/invoices`),
        fetch(`${API_BASE_URL}/api/stats/invoice-value`),
      ]);

      const clientData: StatResponse = await clientsRes.json();
      const quotesData: StatResponse = await quotesRes.json();
      const invoicesData: StatResponse = await invoicesRes.json();
      const invoiceValueData: StatResponse = await invoiceValueRes.json();

      if (!clientsRes.ok || !quotesRes.ok || !invoicesRes.ok || !invoiceValueRes.ok) {
        throw new Error('Failed to fetch one or more stats.');
      }

      setClientStats(clientData);
      setQuoteStats(quotesData);
      setInvoiceStats(invoicesData);
      setInvoiceValueStats(invoiceValueData);

    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Helper to format change string
  const formatChange = (percentage: number | undefined, type: 'increase' | 'decrease' | 'neutral' | undefined) => {
    if (percentage === undefined || type === undefined) {
      return 'N/A';
    }
    const symbol = type === 'increase' ? '↑' : type === 'decrease' ? '↓' : '→';
    return `${symbol} ${Math.abs(percentage).toFixed(2)}%`;
  };

  // Define the stats array dynamically based on fetched data
  const stats = [
    {
      title: 'Clients',
      value: clientStats?.count !== undefined ? clientStats.count.toLocaleString() : 'Loading...',
      change: formatChange(clientStats?.changePercentage, clientStats?.changeType),
      changeType: clientStats?.changeType || 'neutral',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Quotes',
      value: quoteStats?.count !== undefined ? quoteStats.count.toLocaleString() : 'Loading...',
      change: formatChange(quoteStats?.changePercentage, quoteStats?.changeType),
      changeType: quoteStats?.changeType || 'neutral',
      icon: Heart,
      color: 'text-pink-600'
    },
    {
      title: 'Invoices',
      value: invoiceStats?.count !== undefined ? invoiceStats.count.toLocaleString() : 'Loading...',
      change: formatChange(invoiceStats?.changePercentage, invoiceStats?.changeType),
      changeType: invoiceStats?.changeType || 'neutral',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Invoice Value',
      value: invoiceValueStats?.value !== undefined ? `R${invoiceValueStats.value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'Loading...',
      change: formatChange(invoiceValueStats?.changePercentage, invoiceValueStats?.changeType),
      changeType: invoiceValueStats?.changeType || 'neutral',
      icon: BarChart3,
      color: 'text-green-600'
    }
  ];

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
        <span className='ml-2 text-gray-600'>Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-500 p-4 border border-red-300 rounded-md'>
        <p>Error: {error}</p>
        <Button onClick={fetchStats} className='mt-2'>Retry</Button>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <Badge
                variant={
                  stat.changeType === 'increase' ? 'default' : stat.changeType === 'decrease' ? 'destructive' : 'secondary'
                }
                className='mt-1'
              >
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
