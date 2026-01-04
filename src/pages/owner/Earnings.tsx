import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Calendar,
  Download,
  TrendingDown,
  Sparkles,
  BarChart3,
  PieChart,
  Target,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  Award,
  MoreVertical,
  Eye,
  FileText,
  Zap
} from 'lucide-react';
import { PageHeader, StatCard } from '@/components/owner/DashboardComponents';
import { mockEarningsData } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

type Period = 'daily' | 'weekly' | 'monthly';

// Enhanced mock data with additional metrics
const enhancedEarningsData = mockEarningsData.map(day => ({
  ...day,
  profit: day.revenue * 0.3, // Assuming 30% profit margin
  growth: Math.random() > 0.5 ? Math.random() * 20 - 5 : 0, // Random growth between -5% to 15%
  peakHour: Math.floor(Math.random() * 24),
}));

// Function to export as CSV
const exportToCSV = (data: typeof enhancedEarningsData, period: Period) => {
  const headers = ['Date', 'Revenue (₹)', 'Orders', 'Profit (₹)', 'Avg Order Value (₹)', 'Growth (%)', 'Peak Hour'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(day => [
      new Date(day.date).toLocaleDateString('en-US'),
      day.revenue.toFixed(2),
      day.orders,
      day.profit.toFixed(2),
      (day.revenue / day.orders).toFixed(2),
      day.growth.toFixed(2),
      `${day.peakHour}:00`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `earnings-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('CSV file downloaded successfully!');
};

// Function to generate and export PDF (using jsPDF and html2canvas)
const exportToPDF = async (data: typeof enhancedEarningsData, period: Period) => {
  try {
    // Dynamic import for client-side only
    const jspdfModule = await import('jspdf');
    const jsPDF = jspdfModule.default;
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Earnings Report', 14, 22);
    
    // Add period and date
    doc.setFontSize(12);
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 14, 40);
    
    // Calculate summary statistics
    const totalRevenue = data.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = data.reduce((sum, day) => sum + day.orders, 0);
    const totalProfit = data.reduce((sum, day) => sum + day.profit, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 50);
    
    doc.setFontSize(10);
    const summaryData = [
      ['Total Revenue', `₹${totalRevenue.toFixed(2)}`],
      ['Total Orders', totalOrders.toString()],
      ['Total Profit', `₹${totalProfit.toFixed(2)}`],
      ['Avg Order Value', `₹${avgOrderValue.toFixed(2)}`],
      ['Period', period.charAt(0).toUpperCase() + period.slice(1)]
    ];
    
    (doc as any).autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 55 }
    });
    
    // Add detailed data table
    doc.setFontSize(14);
    doc.text('Detailed Data', 14, (doc as any).lastAutoTable.finalY + 10);
    
    const tableData = data.map(day => [
      new Date(day.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      `₹${day.revenue.toFixed(2)}`,
      day.orders.toString(),
      `₹${day.profit.toFixed(2)}`,
      `₹${(day.revenue / day.orders).toFixed(2)}`,
      `${day.growth > 0 ? '+' : ''}${day.growth.toFixed(2)}%`,
      `${day.peakHour}:00`
    ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Date', 'Revenue', 'Orders', 'Profit', 'Avg Value', 'Growth', 'Peak Hour']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { top: 10 }
    });
    
    // Add footer
    const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} • Generated by FoodSwift`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`earnings-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('PDF report generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
  }
};

// Function to export as Excel (using simplified CSV approach for now)
const exportToExcel = (data: typeof enhancedEarningsData, period: Period) => {
  const headers = ['Date', 'Revenue', 'Orders', 'Profit', 'Avg Order Value', 'Growth', 'Peak Hour'];
  
  // Create CSV content with tab separation for better Excel compatibility
  const csvContent = [
    headers.join('\t'),
    ...data.map(day => [
      new Date(day.date).toLocaleDateString('en-US'),
      day.revenue.toFixed(2),
      day.orders,
      day.profit.toFixed(2),
      (day.revenue / day.orders).toFixed(2),
      day.growth.toFixed(2),
      `${day.peakHour}:00`
    ].join('\t'))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `earnings-report-${period}-${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('Excel file downloaded successfully!');
};

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('daily');
  const [viewType, setViewType] = useState<'revenue' | 'orders' | 'profit'>('revenue');
  const [isExporting, setIsExporting] = useState(false);

  const currentData = enhancedEarningsData;
  const totalRevenue = currentData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = currentData.reduce((sum, day) => sum + day.orders, 0);
  const totalProfit = currentData.reduce((sum, day) => sum + day.profit, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const maxRevenue = Math.max(...currentData.map((d) => d.revenue));
  
  // Calculate growth metrics
  const lastPeriodRevenue = totalRevenue * 0.85;
  const revenueGrowth = ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100;
  
  const lastPeriodOrders = totalOrders * 0.88;
  const ordersGrowth = ((totalOrders - lastPeriodOrders) / lastPeriodOrders) * 100;
  
  const profitGrowth = revenueGrowth * 0.8; // Profit grows slightly slower than revenue

  // Find best performing day
  const bestDay = currentData.reduce((prev, current) => 
    prev.revenue > current.revenue ? prev : current
  );

  // Get data for current view type
  const getViewData = (day: typeof currentData[0]) => {
    switch(viewType) {
      case 'revenue': return day.revenue;
      case 'orders': return day.orders;
      case 'profit': return day.profit;
    }
  };

  // Handle export with loading state
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    
    try {
      switch(format) {
        case 'pdf':
          await exportToPDF(currentData, period);
          break;
        case 'csv':
          exportToCSV(currentData, period);
          break;
        case 'excel':
          exportToExcel(currentData, period);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export file');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Earnings Dashboard - FoodSwift Owner</title>
      </Helmet>

      {/* Enhanced background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor your restaurant's financial performance in real-time
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 relative"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => handleExport('pdf')}
                  className="gap-2 cursor-pointer"
                  disabled={isExporting}
                >
                  <FileText className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  className="gap-2 cursor-pointer"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('excel')}
                  className="gap-2 cursor-pointer"
                  disabled={isExporting}
                >
                  <FileText className="w-4 h-4" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Period Selector and View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  period === p 
                    ? "bg-white shadow-sm text-emerald-600" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[ 
              { key: 'revenue', label: 'Revenue', icon: DollarSign },
              { key: 'orders', label: 'Orders', icon: ShoppingBag },
              { key: 'profit', label: 'Profit', icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setViewType(item.key as any)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2",
                    viewType === item.key 
                      ? "bg-white shadow-sm text-emerald-600" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Stats Overview - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge variant={revenueGrowth >= 0 ? "default" : "destructive"} className="gap-1">
                  {revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                {revenueGrowth >= 0 ? 'Increased' : 'Decreased'} from last period
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant={ordersGrowth >= 0 ? "default" : "destructive"} className="gap-1">
                  {ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(ordersGrowth).toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg ₹{avgOrderValue.toFixed(2)} per order
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Zap className="w-3 h-3" />
                  30% margin
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Profit</h3>
              <p className="text-2xl font-bold text-gray-900">₹{totalProfit.toFixed(2)}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Margin</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-1.5" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Best Day
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Peak Performance</h3>
              <p className="text-2xl font-bold text-gray-900">₹{bestDay.revenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)} Overview
                    </h2>
                    <p className="text-sm text-gray-600">Last 7 days performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Target className="w-3 h-3" />
                    +15% target
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {currentData.map((day, index) => {
                  const value = getViewData(day);
                  const maxValue = Math.max(...currentData.map(d => getViewData(d)));
                  const height = (value / maxValue) * 100;
                  
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${height}%`, opacity: 1 }}
                      transition={{
                        delay: 0.6 + index * 0.05,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 flex flex-col items-center group relative"
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-xl relative cursor-pointer transition-all duration-300 group-hover:opacity-90",
                          viewType === 'revenue' && "bg-gradient-to-t from-emerald-500 to-emerald-400",
                          viewType === 'orders' && "bg-gradient-to-t from-blue-500 to-blue-400",
                          viewType === 'profit' && "bg-gradient-to-t from-purple-500 to-purple-400"
                        )}
                        style={{ height: '100%', minHeight: '20px' }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg">
                          <div className="flex items-center gap-2">
                            {viewType === 'revenue' || viewType === 'profit' ? '₹' : ''}
                            {value.toLocaleString()}
                            {viewType === 'orders' ? ' orders' : ''}
                          </div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs font-medium text-gray-700 block">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
                {[ 
                  { 
                    label: 'Revenue', 
                    color: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
                    value: `₹${totalRevenue.toFixed(2)}`
                  },
                  { 
                    label: 'Orders', 
                    color: 'bg-gradient-to-r from-blue-500 to-blue-400',
                    value: totalOrders.toLocaleString()
                  },
                  { 
                    label: 'Profit', 
                    color: 'bg-gradient-to-r from-purple-500 to-purple-400',
                    value: `₹${totalProfit.toFixed(2)}`
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setViewType(item.label.toLowerCase() as any)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                      viewType === item.label.toLowerCase() 
                        ? "bg-gray-50 ring-1 ring-gray-200" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.value}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Breakdown - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Daily Performance</h2>
                    <p className="text-sm text-gray-600">Detailed breakdown of daily earnings</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200/50">
              {currentData.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      day.revenue > avgOrderValue * 10 
                        ? "bg-gradient-to-br from-amber-100 to-amber-50 ring-2 ring-amber-200"
                        : "bg-gradient-to-br from-gray-100 to-gray-50"
                    )}>
                      {day.revenue > avgOrderValue * 10 ? (
                        <Award className="w-6 h-6 text-amber-600" />
                      ) : (
                        <Calendar className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {day.orders} orders
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          Peak: {day.peakHour}:00
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                        ₹{day.revenue.toFixed(2)}
                      </p>
                      {day.growth !== 0 && (
                        <Badge 
                          variant={day.growth > 0 ? "default" : "destructive"}
                          className="text-xs h-5 px-2"
                        >
                          {day.growth > 0 ? '+' : ''}{day.growth.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Avg: ₹{(day.revenue / day.orders).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Performance Insights</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Revenue trending upward</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You're on track to beat this month's target by 15%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Peak hours identified</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Consider extending staff hours during 12PM-2PM
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Weekly goal achieved</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You've reached 92% of your weekly revenue target
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-200 hover:shadow-emerald-300">
              View Detailed Analytics
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Conversion Rate</span>
                  <span className="font-semibold">4.8%</span>
                </div>
                <Progress value={48} className="h-1.5 bg-gray-700" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Repeat Customers</span>
                  <span className="font-semibold">42%</span>
                </div>
                <Progress value={42} className="h-1.5 bg-gray-700" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Avg. Order Time</span>
                  <span className="font-semibold">18min</span>
                </div>
                <Progress value={72} className="h-1.5 bg-gray-700" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Customer Satisfaction</span>
                  <span className="font-semibold">4.7/5</span>
                </div>
                <Progress value={94} className="h-1.5 bg-gray-700" />
              </div>
            </div>
          </motion.div>

          {/* Revenue Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Goal Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Monthly Goal</span>
                  <span className="font-semibold text-emerald-600">₹{totalRevenue.toFixed(0)} / ₹10,000</span>
                </div>
                <Progress value={(totalRevenue / 10000) * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <div className="text-xs text-gray-600">Days Left</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-emerald-600">92%</div>
                  <div className="text-xs text-gray-600">On Track</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                Adjust Goal
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
