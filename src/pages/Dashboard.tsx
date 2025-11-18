import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Leaf, Target, ArrowLeft, PoundSterling, Droplets } from "lucide-react";

// Analytics data structure
interface AnalyticsData {
  dailyVisits: Array<{ date: string; visits: number }>;
  co2Savings: Array<{ date: string; amount: number; category: string }>;
  pledges: Array<{ category: string; action: string; impact: number; date: string; type: string; costSaving?: number }>;
  totalCO2Saved: number;
  totalPledges: number;
  streakDays: number;
  totalWaterSaved: number;
  totalMoneySaved: number;
}

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyVisits: [],
    co2Savings: [],
    pledges: [],
    totalCO2Saved: 0,
    totalPledges: 0,
    streakDays: 0,
    totalWaterSaved: 0,
    totalMoneySaved: 0
  });

  useEffect(() => {
    // Load analytics data from localStorage
    const loadAnalytics = () => {
      const savedPledges = JSON.parse(localStorage.getItem('userPledges') || '[]');
      const savedVisits = JSON.parse(localStorage.getItem('dailyVisits') || '[]');
      
      // Track today's visit
      const today = new Date().toISOString().split('T')[0];
      const existingVisits = savedVisits.filter((v: any) => v.date !== today);
      const todayVisit = savedVisits.find((v: any) => v.date === today);
      const updatedVisits = [...existingVisits, { 
        date: today, 
        visits: todayVisit ? todayVisit.visits + 1 : 1 
      }];
      localStorage.setItem('dailyVisits', JSON.stringify(updatedVisits));

      // Calculate CO2 savings over time
      const co2ByDate: { [key: string]: number } = {};
      savedPledges.forEach((pledge: any) => {
        const date = pledge.date || today;
        if (!co2ByDate[date]) co2ByDate[date] = 0;
        co2ByDate[date] += pledge.impact;
      });

      const co2Savings = Object.entries(co2ByDate).map(([date, amount]) => ({
        date,
        amount,
        category: 'Total'
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Generate last 7 days of visit data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayData = updatedVisits.find((v: any) => v.date === dateStr);
        return {
          date: dateStr,
          visits: dayData ? dayData.visits : 0
        };
      });

      const totalCO2 = savedPledges.reduce((sum: number, pledge: any) => sum + pledge.impact, 0);
      const totalMoney = savedPledges.reduce((sum: number, pledge: any) => sum + (pledge.costSaving || 0), 0);
      // Calculate water saved: approximately 8 liters per kg CO2 saved
      const totalWater = totalCO2 * 8;
      
      // If no pledges, show demo data for better UX
      const hasPledges = savedPledges.length > 0;
      const displayPledges = hasPledges ? savedPledges : [
        { category: 'Energy', action: 'Switch to LED bulbs', impact: 45, date: today, type: 'monthly', costSaving: 120 },
        { category: 'Transport', action: 'Use public transport', impact: 65, date: today, type: 'monthly', costSaving: 200 },
        { category: 'Waste', action: 'Start composting', impact: 28, date: today, type: 'monthly', costSaving: 50 },
      ];
      const displayCO2 = hasPledges ? totalCO2 : 138;
      const displayMoney = hasPledges ? totalMoney : 370;
      const displayWater = hasPledges ? totalWater : 1104;
      
      setAnalytics({
        dailyVisits: last7Days,
        co2Savings: hasPledges ? co2Savings : [{ date: today, amount: 138, category: 'Total' }],
        pledges: displayPledges,
        totalCO2Saved: displayCO2,
        totalPledges: displayPledges.length,
        streakDays: calculateStreak(updatedVisits),
        totalWaterSaved: displayWater,
        totalMoneySaved: displayMoney
      });
    };

    loadAnalytics();
  }, []);

  const calculateStreak = (visits: any[]) => {
    const sortedVisits = visits.sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedVisits.length; i++) {
      const visitDate = new Date(sortedVisits[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (visitDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Chart configurations
  const visitChartConfig = {
    visits: {
      label: "Daily Visits",
      color: "hsl(var(--primary))",
    },
  };

  const co2ChartConfig = {
    amount: {
      label: "CO₂ Saved (kg)",
      color: "hsl(var(--chart-2))",
    },
  };

  // Category breakdown for pie chart
  const categoryBreakdown = analytics.pledges.reduce((acc: any, pledge) => {
    const existing = acc.find((item: any) => item.category === pledge.category);
    if (existing) {
      existing.value += pledge.impact;
    } else {
      acc.push({ category: pledge.category, value: pledge.impact });
    }
    return acc;
  }, []);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1} />
              Back to Calculator
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" strokeWidth={1} />
            <span className="text-lg">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-200">CO₂ Saved</CardTitle>
              <Leaf className="h-3 w-3 text-green-400" strokeWidth={1} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-400">{analytics.totalCO2Saved.toFixed(0)} kg</div>
              <p className="text-xs text-slate-400">{(analytics.totalCO2Saved * 0.4).toFixed(0)} trees</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-200">Money Saved</CardTitle>
              <PoundSterling className="h-3 w-3 text-yellow-400" strokeWidth={1} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-400">£{analytics.totalMoneySaved}</div>
              <p className="text-xs text-slate-400">Per year</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-200">Water Saved</CardTitle>
              <Droplets className="h-3 w-3 text-blue-400" strokeWidth={1} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-400">{analytics.totalWaterSaved.toFixed(0)}L</div>
              <p className="text-xs text-slate-400">Per month</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-200">Pledges</CardTitle>
              <Target className="h-3 w-3 text-purple-400" strokeWidth={1} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-400">{analytics.totalPledges}</div>
              <p className="text-xs text-slate-400">Active actions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-200">Streak</CardTitle>
              <TrendingUp className="h-3 w-3 text-orange-400" strokeWidth={1} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-orange-400">{analytics.streakDays}</div>
              <p className="text-xs text-slate-400">Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Visits Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Daily Engagement (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
          <ChartContainer config={visitChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyVisits} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={1}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
            </CardContent>
          </Card>

          {/* CO2 Savings Over Time */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">CO₂ Savings Timeline</CardTitle>
            </CardHeader>
            <CardContent>
          <ChartContainer config={co2ChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.co2Savings} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown Pie Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">CO₂ Savings by Category</CardTitle>
            </CardHeader>
            <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Recent Pledges</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {analytics.pledges.slice(-5).reverse().map((pledge, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{pledge.action}</p>
                      <p className="text-xs text-slate-400">{pledge.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-400">{pledge.impact} kg CO₂</p>
                      {pledge.costSaving && pledge.costSaving > 0 && (
                        <p className="text-xs text-yellow-400 flex items-center gap-1">
                          <PoundSterling className="w-3 h-3" strokeWidth={1} />
                          £{pledge.costSaving}/year
                        </p>
                      )}
                      <p className="text-xs text-slate-400">{pledge.type}</p>
                    </div>
                  </div>
                ))}
                {analytics.pledges.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No pledges yet. Start taking action to see your progress!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Accuracy Note */}
        <div className="mt-8 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">About This Data</h3>
          <p className="text-sm text-slate-300">
            <strong>Visit Tracking:</strong> Daily visits are tracked locally in your browser and represent each time you open the calculator. 
            Data is stored locally and resets if you clear your browser data.
          </p>
          <p className="text-sm text-slate-300 mt-2">
            <strong>CO₂ Calculations:</strong> Impact values are estimates based on average UK household data and industry research. 
            Actual savings may vary depending on your specific circumstances.
          </p>
          <p className="text-sm text-slate-300 mt-2">
            <strong>Privacy:</strong> All data is stored locally on your device and is not shared or transmitted anywhere.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;