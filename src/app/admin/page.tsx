'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, UtensilsCrossed, DollarSign, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase/client';

// Interfaces for fetched data
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  tracking_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

// Chart configurations
const weeklyChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#ea580c',
  },
  orders: {
    label: 'Orders',
    color: '#3b82f6',
  },
};

const topItemsConfig = {
  revenue: {
    label: 'Revenue (₦)',
    color: '#10b981',
  },
};

const PIE_COLORS = ['#ea580c', '#dc2626', '#f59e0b', '#6366f1', '#8b5cf6', '#10b981'];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Fetch orders and their items
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
        
      if (ordersData) {
        setOrders(ordersData);
      }

      // Fetch menu items count
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });
        
      setMenuItemsCount(count || 0);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Compute Statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Compute Weekly Revenue Data (grouping by Day of Week)
  // For a real app, this should probably filter by the last 7 days.
  // Here we'll just map the existing orders into days of the week.
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyStats: Record<string, { revenue: number; orders: number }> = {};
  
  daysOfWeek.forEach(day => {
    weeklyStats[day] = { revenue: 0, orders: 0 };
  });

  orders.forEach(order => {
    const date = new Date(order.created_at);
    const dayName = daysOfWeek[date.getDay()];
    if (weeklyStats[dayName]) {
      weeklyStats[dayName].revenue += Number(order.total) || 0;
      weeklyStats[dayName].orders += 1;
    }
  });

  const weeklyRevenueData = daysOfWeek.map(day => ({
    day,
    revenue: weeklyStats[day].revenue,
    orders: weeklyStats[day].orders
  }));

  // Compute Top Items and Pie Data
  const itemStats: Record<string, { quantity: number; revenue: number }> = {};
  
  orders.forEach(order => {
    if (order.order_items) {
      order.order_items.forEach(item => {
        if (!itemStats[item.name]) {
          itemStats[item.name] = { quantity: 0, revenue: 0 };
        }
        itemStats[item.name].quantity += item.quantity;
        itemStats[item.name].revenue += item.price * item.quantity;
      });
    }
  });

  const sortedItems = Object.entries(itemStats)
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: stats.revenue,
      value: stats.quantity // For PieChart
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topItemsByRevenue = sortedItems.slice(0, 5);
  const pieData = sortedItems.slice(0, 5).map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length]
  }));

  // Dynamic pieChartConfig based on actual items
  const pieChartConfig = pieData.reduce((acc, item) => {
    acc[item.name.toLowerCase().replace(/\s+/g, '')] = {
      label: item.name,
      color: item.color
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Menu Items</CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{menuItemsCount}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Order Value</CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">₦{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
            <p className="text-sm text-slate-500 mt-1">View your sales performance across different metrics</p>
          </div>
          <div className="flex flex-wrap gap-2 md:inline-flex md:overflow-hidden md:rounded-full md:border md:border-slate-300 md:bg-slate-100 md:p-1">
            {[
              { id: 'weekly', label: 'Weekly' },
              { id: 'topitems', label: 'Top Items' },
              { id: 'distribution', label: 'Distribution' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none rounded-lg md:rounded-full px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition duration-200 ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg md:bg-white md:text-slate-900 md:shadow-sm' : 'bg-slate-200 text-slate-700 md:bg-transparent md:text-slate-600 hover:bg-slate-300 md:hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'weekly' && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Weekly Revenue</CardTitle>
              <CardDescription className="text-slate-600">Revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto -mx-6 md:mx-0 md:overflow-visible">
                <div className="w-full min-w-max md:min-w-0 px-6 md:px-0">
                  <ChartContainer config={weeklyChartConfig} className="w-full h-56 sm:h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={5} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} width={35} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={35} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                        <Bar yAxisId="left" dataKey="revenue" fill="#ea580c" name="Revenue" radius={[6, 6, 0, 0]} />
                        <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'topitems' && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Top Selling Items</CardTitle>
              <CardDescription className="text-slate-600">Best performing menu items by revenue</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {topItemsByRevenue.length > 0 ? (
                <div className="overflow-x-auto -mx-6 md:mx-0 md:overflow-visible">
                  <div className="w-full min-w-max md:min-w-0 px-6 md:px-0">
                    <ChartContainer config={topItemsConfig} className="w-full h-56 sm:h-64 md:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topItemsByRevenue}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={70} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₦${Number(value).toLocaleString()}`} />} />
                          <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <p className="font-medium">No sales data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'distribution' && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Sales Distribution</CardTitle>
              <CardDescription className="text-slate-600">Sales quantity by menu item</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {pieData.length > 0 ? (
                <div className="flex justify-center">
                  <ChartContainer config={pieChartConfig} className="w-full h-56 sm:h-64 md:h-80 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={window.innerWidth < 768 ? 70 : 100}
                          innerRadius={window.innerWidth < 768 ? 35 : 50}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <p className="font-medium">No sales data available yet</p>
                </div>
              )}
              {pieData.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center md:gap-3">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders placed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-bold text-slate-900 tracking-tight">{order.tracking_id}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg">₦{Number(order.total).toLocaleString()}</p>
                  <span className={`inline-flex px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full capitalize
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                No recent orders found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}