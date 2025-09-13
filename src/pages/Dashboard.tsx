import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import type { DashboardStats } from '../types';
import { toast } from 'sonner';
import { IndianRupee, ShoppingCart, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Card, Title, Text, Flex, Metric, AreaChart, DonutChart, Col, Grid } from '@tremor/react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // <<< FIX: Added missing Table imports

const StatCard = ({ title, metric, icon, color }: { title: string, metric: string | number, icon: React.ReactNode, color: string }) => (
  <Card className="bg-white/90 backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ borderColor: `${color}30` }}>
    <Flex className="items-start">
      <div className="flex-1">
        <Text className="font-semibold text-sm" style={{ color: `${color}` }}>{title}</Text>
        <Metric className="text-2xl font-bold mt-1" style={{ color: `${color}e6` }}>{metric}</Metric>
      </div>
      <div className="p-3 rounded-xl shadow-lg" style={{ background: `linear-gradient(to bottom right, ${color}bf, ${color})`}}>
        {icon}
      </div>
    </Flex>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({ from: addDays(new Date(), -29), to: new Date() });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats(date);
        setStats(data.stats);
      } catch (error) { toast.error("Failed to load dashboard statistics."); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [date]);

  const valueFormatter = (number: number) => `₹${new Intl.NumberFormat('en-IN').format(number).toString()}`;

  // <<< FIX: The loading state is now used to show a skeleton UI
  if (loading) {
    return (
        <div className="min-h-screen p-2 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-300 rounded-xl w-72"></div>
                        <div className="h-6 bg-gray-200 rounded-lg w-96"></div>
                    </div>
                    <div className="h-12 bg-white/80 rounded-xl w-full md:w-80 shadow-sm"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/80 rounded-2xl shadow-lg border border-gray-200/50"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-white/80 rounded-2xl shadow-lg border border-gray-200/50"></div>
                    <div className="h-96 bg-white/80 rounded-2xl shadow-lg border border-gray-200/50"></div>
                </div>
            </div>
        </div>
    );
  }
  

  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-red-700 bg-clip-text text-transparent font-serif">
              Kaagazz Dashboard
            </h1>
            <p className="text-lg text-amber-700/80 font-medium">Monitor your eco-friendly store's performance</p>
          </div>
          <DateRangePicker date={date} onSelect={setDate} />
        </div>

        <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
            <StatCard title="Total Revenue" metric={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} icon={<IndianRupee className="w-6 h-6 text-white"/>} color="#ca8a04"/>
            <StatCard title="Total Orders" metric={stats?.totalOrders || 0} icon={<ShoppingCart className="w-6 h-6 text-white"/>} color="#2563eb"/>
            <StatCard title="New Customers" metric={stats?.totalCustomers || 0} icon={<Users className="w-6 h-6 text-white"/>} color="#7c3aed"/>
            <StatCard title="Average Order Value" metric={`₹${(stats?.averageOrderValue || 0).toLocaleString('en-IN')}`} icon={<TrendingUp className="w-6 h-6 text-white"/>} color="#16a34a"/>
        </Grid>

        <Grid numItemsLg={3} className="gap-6">
          <Col numColSpanLg={2}>
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl h-full">
              <Title className="text-xl font-bold text-amber-900">Revenue Over Time</Title>
              <AreaChart className="h-80 mt-4" data={stats?.salesOverTime || []} index="date" categories={['Revenue']} colors={['amber']} valueFormatter={valueFormatter} yAxisWidth={80} showAnimation={true} />
            </Card>
          </Col>
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl">
            <Title className="text-xl font-bold text-amber-900 flex items-center gap-2"><Clock size={20}/> Recent Activity</Title>
            <div className="mt-4 space-y-4">
              {stats?.recentActivity?.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full mt-1 ${activity.type === 'order' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {activity.type === 'order' ? <ShoppingCart className="h-4 w-4 text-blue-600"/> : <Users className="h-4 w-4 text-green-600"/>}
                  </div>
                  <div>
                    <Text className="font-medium text-gray-800">{activity.message}</Text>
                    <Text className="text-xs text-gray-500">{format(new Date(activity.timestamp), "MMM dd, h:mm a")}</Text>
                  </div>
                  {activity.value && <Text className="font-semibold ml-auto text-gray-700">₹{activity.value.toLocaleString()}</Text>}
                </div>
              ))}
            </div>
          </Card>
        </Grid>

        <Grid numItemsLg={3} className="gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl">
              <Title className="text-xl font-bold text-amber-900">Revenue by Category</Title>
              <DonutChart className="mt-6" data={stats?.revenueByCategory || []} category="value" index="name" valueFormatter={valueFormatter} colors={["amber", "orange", "red", "pink", "purple"]} showAnimation={true} />
            </Card>
            <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl">
                <Title className="text-xl font-bold text-amber-900 flex items-center gap-2"><AlertTriangle size={20}/> Low Stock Products</Title>
                <Table className="mt-4">
                    <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Stock Left</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {stats?.lowStockProducts?.map(p => (
                            <TableRow key={p.title}><TableCell>{p.title}</TableCell><TableCell className="text-right font-medium text-red-500">{p.stock}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </Grid>
      </div>
    </div>
  );
};
export default Dashboard;