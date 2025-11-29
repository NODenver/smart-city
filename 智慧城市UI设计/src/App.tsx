import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/Tabs';
import { DataUpload } from './components/DataUpload';
import { DataOverview } from './components/DataOverview';
import { AIAnalysis } from './components/AIAnalysis';
import { Dashboard } from './components/Dashboard';
import { AlertSystem } from './components/AlertSystem';
import { Upload, BarChart3, Brain, Layout, Bell } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';

export interface CityEvent {
  id: string;
  type: string;
  description: string;
  location: {
    district: string;
    address: string;
    lat: number;
    lng: number;
  };
  reporter: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'resolved';
  priority?: 'high' | 'medium' | 'low';
}

export interface SensorData {
  id: string;
  deviceId: string;
  type: string;
  location: {
    district: string;
    address: string;
    lat: number;
    lng: number;
  };
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'error' | 'offline';
  timestamp: string;
}

export interface AIAnalysisResult {
  id: string;
  timestamp: string;
  eventIds: string[];
  analysis: {
    cause: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  };
}

export interface Alert {
  id: string;
  type: 'cluster' | 'sensor';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'processed';
  relatedEvents?: string[];
  aiSuggestion?: string;
}

function App() {
  const [cityEvents, setCityEvents] = useState<CityEvent[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysisResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster position="top-right" richColors />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-white mb-2">智慧城市运营管理系统</h1>
          <p className="text-slate-400">Smart City Operations Management Platform</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900 border border-slate-800">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              数据上传
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              数据概览
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI分析
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              态势大屏
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              智能预警
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <DataUpload
              onEventsUploaded={setCityEvents}
              onSensorDataUploaded={setSensorData}
            />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <DataOverview
              cityEvents={cityEvents}
              sensorData={sensorData}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AIAnalysis
              cityEvents={cityEvents}
              sensorData={sensorData}
              aiAnalyses={aiAnalyses}
              onAnalysisComplete={(analysis) => setAiAnalyses([...aiAnalyses, analysis])}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard
              cityEvents={cityEvents}
              sensorData={sensorData}
              alerts={alerts}
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertSystem
              cityEvents={cityEvents}
              sensorData={sensorData}
              alerts={alerts}
              setAlerts={setAlerts}
              aiAnalyses={aiAnalyses}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
