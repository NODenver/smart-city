import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Activity, AlertTriangle, MapPin, Cpu, Database, TrendingUp } from 'lucide-react';
import type { CityEvent, SensorData } from '../App';

interface DataOverviewProps {
  cityEvents: CityEvent[];
  sensorData: SensorData[];
}

type ViewMode = 'all' | 'events' | 'sensors';

export function DataOverview({ cityEvents, sensorData }: DataOverviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 统计数据
  const stats = useMemo(() => {
    // 事件统计
    const eventTypeCount: Record<string, number> = {};
    const eventDistrictCount: Record<string, number> = {};
    
    cityEvents.forEach(event => {
      eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
      eventDistrictCount[event.location.district] = (eventDistrictCount[event.location.district] || 0) + 1;
    });

    // 传感器统计
    const sensorAbnormal = sensorData.filter(s => s.status === 'warning' || s.status === 'error').length;
    const sensorOnline = sensorData.filter(s => s.status !== 'offline').length;
    const sensorOnlineRate = sensorData.length > 0 ? (sensorOnline / sensorData.length * 100).toFixed(1) : '0';

    const sensorTypeCount: Record<string, number> = {};
    sensorData.forEach(sensor => {
      sensorTypeCount[sensor.type] = (sensorTypeCount[sensor.type] || 0) + 1;
    });

    return {
      eventTotal: cityEvents.length,
      eventTypeCount,
      eventDistrictCount,
      sensorTotal: sensorData.length,
      sensorAbnormal,
      sensorOnlineRate,
      sensorTypeCount,
    };
  }, [cityEvents, sensorData]);

  // 饼图数据
  const eventTypePieData = Object.entries(stats.eventTypeCount).map(([name, value]) => ({
    name,
    value,
  }));

  const districtBarData = Object.entries(stats.eventDistrictCount).map(([name, value]) => ({
    name,
    value,
  }));

  // 分页数据
  const displayData = useMemo(() => {
    let data: any[] = [];
    
    if (viewMode === 'all') {
      data = [
        ...cityEvents.map(e => ({ ...e, dataType: 'event' })),
        ...sensorData.map(s => ({ ...s, dataType: 'sensor' }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (viewMode === 'events') {
      data = cityEvents.map(e => ({ ...e, dataType: 'event' }));
    } else {
      data = sensorData.map(s => ({ ...s, dataType: 'sensor' }));
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: data.slice(startIndex, endIndex),
      total: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
    };
  }, [cityEvents, sensorData, viewMode, currentPage]);

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="事件总数"
          value={stats.eventTotal}
          color="cyan"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="传感器异常"
          value={stats.sensorAbnormal}
          color="red"
        />
        <StatCard
          icon={<Cpu className="w-6 h-6" />}
          title="设备在线率"
          value={`${stats.sensorOnlineRate}%`}
          color="green"
        />
        <StatCard
          icon={<Database className="w-6 h-6" />}
          title="传感器总数"
          value={stats.sensorTotal}
          color="blue"
        />
      </div>

      {/* 可视化图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 事件类型分布 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            事件类型分布
          </h3>
          {eventTypePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypePieData.map((entry, index) => (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 区域分布 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            区域分布
          </h3>
          {districtBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtBarData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setViewMode('all'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded transition-colors ${
            viewMode === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          合并视图
        </button>
        <button
          onClick={() => { setViewMode('events'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded transition-colors ${
            viewMode === 'events'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          仅事件
        </button>
        <button
          onClick={() => { setViewMode('sensors'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded transition-colors ${
            viewMode === 'sensors'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          仅传感器
        </button>
      </div>

      {/* 数据列表 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300">类型</th>
                <th className="px-4 py-3 text-left text-slate-300">描述/设备</th>
                <th className="px-4 py-3 text-left text-slate-300">位置</th>
                <th className="px-4 py-3 text-left text-slate-300">状态</th>
                <th className="px-4 py-3 text-left text-slate-300">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayData.items.map((item: any, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded text-xs ${
                      item.dataType === 'event'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {item.dataType === 'event' ? '市民事件' : '传感器'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.dataType === 'event' ? item.description : `${item.type} (${item.deviceId})`}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.location.district}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(item.timestamp).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {displayData.totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
            <div className="text-slate-400">
              共 {displayData.total} 条数据，第 {currentPage} / {displayData.totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(displayData.totalPages, p + 1))}
                disabled={currentPage === displayData.totalPages}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string;
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-400 mb-1">{title}</p>
          <p className="text-white text-2xl">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: '待处理', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    processing: { label: '处理中', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    resolved: { label: '已解决', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    normal: { label: '正常', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    warning: { label: '警告', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    error: { label: '异常', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    offline: { label: '离线', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };

  return (
    <span className={`inline-flex px-2 py-1 rounded text-xs border ${config.className}`}>
      {config.label}
    </span>
  );
}
