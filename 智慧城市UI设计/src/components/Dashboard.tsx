import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Zap, Users, Wifi, Radio, Shield, Eye } from 'lucide-react';
import type { CityEvent, SensorData, Alert } from '../App';

interface DashboardProps {
  cityEvents: CityEvent[];
  sensorData: SensorData[];
  alerts: Alert[];
}

export function Dashboard({ cityEvents, sensorData, alerts }: DashboardProps) {
  const [liveEvents, setLiveEvents] = useState<Array<any>>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 生成模拟数据
  const mockData = useMemo(() => {
    // 如果没有真实数据，使用模拟数据
    const hasRealData = cityEvents.length > 0 || sensorData.length > 0;
    
    if (!hasRealData) {
      return {
        events: generateMockEvents(),
        sensors: generateMockSensors(),
      };
    }
    
    return {
      events: cityEvents,
      sensors: sensorData,
    };
  }, [cityEvents, sensorData]);

  // 模拟实时事件滚动
  useEffect(() => {
    const eventSource = mockData.events.length > 0 ? mockData.events : generateMockEvents();
    
    setLiveEvents(eventSource.slice(0, 8).map((e: any) => ({ ...e, isNew: false })));

    const interval = setInterval(() => {
      setLiveEvents((prev: any) => {
        const randomEvent = eventSource[Math.floor(Math.random() * eventSource.length)];
        const newEvent = { ...randomEvent, id: `${randomEvent.id}-${Date.now()}`, isNew: true };
        const updated = [newEvent, ...prev.slice(0, 7)];
        
        setTimeout(() => {
          setLiveEvents((current: any) => 
            current.map((e: any) => e.id === newEvent.id ? { ...e, isNew: false } : e)
          );
        }, 3000);
        
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [mockData.events]);

  // 统计数据
  const stats = useMemo(() => {
    const events = mockData.events;
    const sensors = mockData.sensors;
    
    const todayEvents = events.filter((e: any) => {
      const eventDate = new Date(e.timestamp);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length || 127;

    const abnormalSensors = sensors.filter((s: any) => s.status === 'warning' || s.status === 'error').length || 23;
    const highPriorityIssues = events.filter((e: any) => e.priority === 'high').length || 15;
    const avgResponseTime = 18;
    const deviceOnlineRate = sensors.length > 0 
      ? ((sensors.filter((s: any) => s.status !== 'offline').length / sensors.length) * 100).toFixed(1)
      : '94.7';
    const totalDevices = sensors.length || 856;
    const resolvedToday = 89;

    return {
      todayEvents,
      abnormalSensors,
      highPriorityIssues,
      avgResponseTime,
      deviceOnlineRate,
      totalDevices,
      resolvedToday,
    };
  }, [mockData]);

  // 问题类型分布数据
  const typePieData = useMemo(() => {
    const events = mockData.events;
    const sensors = mockData.sensors;
    
    if (events.length === 0 && sensors.length === 0) {
      return [
        { name: '道路积水', value: 45, color: '#06b6d4' },
        { name: '路灯故障', value: 32, color: '#3b82f6' },
        { name: '噪音扰民', value: 28, color: '#8b5cf6' },
        { name: '占道经营', value: 25, color: '#ec4899' },
        { name: '井盖缺失', value: 18, color: '#f59e0b' },
        { name: '垃圾堆积', value: 22, color: '#10b981' },
      ];
    }

    const eventTypes: Record<string, number> = {};
    events.forEach((e: any) => {
      eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
    });

    const sensorTypes: Record<string, number> = {};
    sensors.filter((s: any) => s.status !== 'normal').forEach((s: any) => {
      sensorTypes[s.type] = (sensorTypes[s.type] || 0) + 1;
    });

    const combined = [
      ...Object.entries(eventTypes).map(([name, value]) => ({ name, value })),
      ...Object.entries(sensorTypes).map(([name, value]) => ({ name, value })),
    ].slice(0, 8);

    return combined.length > 0 ? combined : [
      { name: '道路积水', value: 45 },
      { name: '路灯故障', value: 32 },
    ];
  }, [mockData]);

  // 近7天趋势数据
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      days.push({
        date: dateStr,
        events: Math.floor(Math.random() * 40) + 80,
        sensors: Math.floor(Math.random() * 15) + 15,
        resolved: Math.floor(Math.random() * 35) + 60,
      });
    }
    return days;
  }, []);

  // 24小时分布数据
  const hourlyData = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: `${i}:00`,
        count: Math.floor(Math.random() * 15) + 5,
      });
    }
    return hours;
  }, []);

  // 热力图数据
  const heatmapData = useMemo(() => {
    const events = mockData.events;
    
    if (events.length === 0) {
      return [
        { name: '朝阳区', value: 89, percentage: 100 },
        { name: '海淀区', value: 76, percentage: 85 },
        { name: '东城区', value: 68, percentage: 76 },
        { name: '西城区', value: 54, percentage: 61 },
        { name: '丰台区', value: 47, percentage: 53 },
        { name: '石景山区', value: 39, percentage: 44 },
        { name: '通州区', value: 33, percentage: 37 },
        { name: '大兴区', value: 28, percentage: 31 },
      ];
    }

    const districtCount: Record<string, number> = {};
    events.forEach((e: any) => {
      districtCount[e.location.district] = (districtCount[e.location.district] || 0) + 1;
    });

    const sorted = Object.entries(districtCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
    
    const max = sorted[0]?.[1] || 1;
    
    return sorted.map(([name, value]) => ({
      name,
      value,
      percentage: (value / max) * 100,
    }));
  }, [mockData.events]);

  // 区域雷达图数据
  const radarData = [
    { subject: '交通', A: 85, fullMark: 100 },
    { subject: '环境', A: 92, fullMark: 100 },
    { subject: '设施', A: 78, fullMark: 100 },
    { subject: '治安', A: 95, fullMark: 100 },
    { subject: '市容', A: 88, fullMark: 100 },
    { subject: '服务', A: 90, fullMark: 100 },
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

  return (
    <div className="bg-slate-950 relative overflow-hidden" style={{ width: '1920px', height: '1080px' }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部标题栏 */}
      <div className="relative h-20 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-cyan-500/30 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white mb-0.5 flex items-center gap-3">
              智慧城市运行态势感知平台
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs">
                系统运行正常
              </span>
            </h1>
            <p className="text-cyan-400">Smart City Operations Monitoring Platform</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-cyan-400 text-3xl tracking-wider font-mono">{currentTime.toLocaleTimeString('zh-CN')}</div>
          <div className="text-slate-400">{currentTime.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="relative h-[calc(100%-80px)] p-5">
        {/* 顶部关键指标 */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="今日事件"
            value={stats.todayEvents}
            unit="件"
            color="cyan"
            trend="+12%"
          />
          <MetricCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="已处理"
            value={stats.resolvedToday}
            unit="件"
            color="green"
            trend="+8%"
          />
          <MetricCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="异常设备"
            value={stats.abnormalSensors}
            unit="台"
            color="red"
            trend="-5%"
          />
          <MetricCard
            icon={<Wifi className="w-6 h-6" />}
            title="设备在线率"
            value={stats.deviceOnlineRate}
            unit="%"
            color="blue"
            trend="+2%"
          />
          <MetricCard
            icon={<Radio className="w-6 h-6" />}
            title="物联设备"
            value={stats.totalDevices}
            unit="台"
            color="purple"
            trend="—"
          />
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            title="高优先级"
            value={stats.highPriorityIssues}
            unit="项"
            color="orange"
            trend="+6%"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            title="响应时长"
            value={stats.avgResponseTime}
            unit="min"
            color="teal"
            trend="-15%"
          />
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100%-140px)]">
          {/* 左侧列 */}
          <div className="col-span-3 space-y-4">
            {/* 城市问题热力图 */}
            <ChartCard title="城市问题热力分布" icon={<MapPin className="w-5 h-5 text-cyan-400" />} className="h-[48%]">
              <div className="space-y-2.5 mt-2">
                {heatmapData.map((item, index) => (
                  <div key={item.name} className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 w-5">{index + 1}</span>
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-cyan-400">{item.value}</span>
                    </div>
                    <div className="h-6 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 relative overflow-hidden transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* 城市运行健康度 */}
            <ChartCard title="城市运行健康度" icon={<Shield className="w-5 h-5 text-cyan-400" />} className="h-[48%]">
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <PolarRadiusAxis stroke="#64748b" />
                  <Radar name="健康度" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* 中间列 */}
          <div className="col-span-6 space-y-4">
            {/* 近7天趋势 */}
            <ChartCard title="近7天问题趋势分析" icon={<TrendingUp className="w-5 h-5 text-cyan-400" />} className="h-[48%]">
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSensors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="events" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEvents)" name="上报事件" />
                  <Area type="monotone" dataKey="sensors" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSensors)" name="传感器异常" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="已处理" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 问题类型分布 & 24小时分布 */}
            <div className="grid grid-cols-2 gap-4 h-[48%]">
              <ChartCard title="问题类型分布" icon={<Activity className="w-5 h-5 text-cyan-400" />}>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="24小时事件分布" icon={<Clock className="w-5 h-5 text-cyan-400" />}>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#64748b" 
                      style={{ fontSize: '10px' }}
                      interval={2}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* 右侧列 - 实时事件流 */}
          <div className="col-span-3">
            <ChartCard title="实时事件流" icon={<Radio className="w-5 h-5 text-cyan-400" />} className="h-full">
              <div className="space-y-2.5 overflow-y-auto h-[calc(100%-20px)] custom-scrollbar pr-2">
                {liveEvents.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      event.isNew
                        ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {event.isNew && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs animate-pulse flex-shrink-0">
                          NEW
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                        event.priority === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : event.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="text-slate-300 mb-2 line-clamp-2">{event.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location.district}</span>
                      </div>
                      <div className="text-slate-600">
                        {new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function ChartCard({ 
  title, 
  icon, 
  children, 
  className = '' 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`bg-slate-900/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 ${className}`}>
      <h3 className="text-white mb-3 flex items-center gap-2 pb-2 border-b border-slate-800">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="h-[calc(100%-44px)]">
        {children}
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  unit,
  color, 
  trend 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  unit: string;
  color: string;
  trend: string;
}) {
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    red: { bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400' },
    orange: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    green: { bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400' },
    blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    purple: { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    teal: { bg: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  };

  const classes = colorClasses[color] || colorClasses.cyan;

  return (
    <div className={`bg-gradient-to-br ${classes.bg} border ${classes.border} backdrop-blur-sm rounded-lg p-4 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={classes.text}>{icon}</div>
          {trend !== '—' && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              trend.startsWith('+') 
                ? 'bg-green-500/20 text-green-400' 
                : trend.startsWith('-')
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-500/20 text-slate-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <div className="text-slate-400 mb-1">{title}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-white text-2xl">{value}</span>
          <span className="text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

// 生成模拟事件数据
function generateMockEvents() {
  const types = ['道路积水', '路灯故障', '噪音扰民', '占道经营', '井盖缺失', '垃圾堆积'];
  const districts = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'];
  const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  const events = [];
  for (let i = 0; i < 150; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    
    events.push({
      id: `event-${i}`,
      type,
      description: `${district}${type}问题需要处理`,
      location: {
        district,
        address: `${district}某街道${Math.floor(Math.random() * 100)}号`,
        lat: 39.9 + Math.random() * 0.2,
        lng: 116.3 + Math.random() * 0.2,
      },
      reporter: `市民${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['pending', 'processing', 'resolved'][Math.floor(Math.random() * 3)] as any,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    });
  }
  
  return events;
}

// 生成模拟传感器数据
function generateMockSensors() {
  const types = ['积水传感器', '路灯监测', '噪音监测', '空气质量', '水质监测'];
  const districts = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区'];
  
  const sensors = [];
  for (let i = 0; i < 100; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    
    sensors.push({
      id: `sensor-${i}`,
      deviceId: `DEV-${1000 + i}`,
      type,
      location: {
        district,
        address: `${district}某路段${Math.floor(Math.random() * 100)}号`,
        lat: 39.9 + Math.random() * 0.2,
        lng: 116.3 + Math.random() * 0.2,
      },
      value: Math.random() * 100,
      unit: type.includes('积水') ? 'cm' : type.includes('噪音') ? 'dB' : 'μg/m³',
      threshold: 50,
      status: ['normal', 'warning', 'error', 'offline'][Math.floor(Math.random() * 10) > 7 ? Math.floor(Math.random() * 4) : 0] as any,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return sensors;
}
