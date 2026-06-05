import { Users, Briefcase, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', jobs: 40 },
  { name: 'Tue', jobs: 30 },
  { name: 'Wed', jobs: 45 },
  { name: 'Thu', jobs: 50 },
  { name: 'Fri', jobs: 65 },
  { name: 'Sat', jobs: 85 },
  { name: 'Sun', jobs: 70 },
];

export default function Dashboard() {
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
        <div className="bg-speede-red/10 text-speede-red px-3 py-1 rounded-full text-sm font-medium">Live System</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Users", value: "12,450", icon: Users, change: "+12%" },
          { title: "Active Jobs", value: "842", icon: Briefcase, change: "+5%" },
          { title: "Job Success Rate", value: "94%", icon: Activity, change: "+2%" },
          { title: "Revenue", value: "฿45,200", icon: TrendingUp, change: "+18%" }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold dark:text-white">{stat.value}</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 dark:bg-speede-black rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-speede-red" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-500 font-medium">{stat.change} this week</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Jobs Posted Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="jobs" fill="#E52020" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-speede-red"></div>
                <div>
                  <p className="text-sm font-medium dark:text-white">New user registered</p>
                  <p className="text-xs text-gray-500">{i * 10} mins ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
