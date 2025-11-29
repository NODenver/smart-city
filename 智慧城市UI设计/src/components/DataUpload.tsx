import { useState, useCallback } from 'react';
import { Upload, FileJson, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { CityEvent, SensorData } from '../App';

interface DataUploadProps {
  onEventsUploaded: (events: CityEvent[]) => void;
  onSensorDataUploaded: (sensors: SensorData[]) => void;
}

export function DataUpload({ onEventsUploaded, onSensorDataUploaded }: DataUploadProps) {
  const [dragActive, setDragActive] = useState<'events' | 'sensors' | null>(null);
  const [eventsStatus, setEventsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sensorsStatus, setSensorsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [eventsCount, setEventsCount] = useState(0);
  const [sensorsCount, setSensorsCount] = useState(0);

  const validateCityEvents = (data: any): data is CityEvent[] => {
    if (!Array.isArray(data)) return false;
    
    return data.every(item => 
      item.id &&
      item.type &&
      item.description &&
      item.location?.district &&
      item.location?.address &&
      typeof item.location?.lat === 'number' &&
      typeof item.location?.lng === 'number' &&
      item.reporter &&
      item.timestamp &&
      ['pending', 'processing', 'resolved'].includes(item.status)
    );
  };

  const validateSensorData = (data: any): data is SensorData[] => {
    if (!Array.isArray(data)) return false;
    
    return data.every(item =>
      item.id &&
      item.deviceId &&
      item.type &&
      item.location?.district &&
      item.location?.address &&
      typeof item.location?.lat === 'number' &&
      typeof item.location?.lng === 'number' &&
      typeof item.value === 'number' &&
      item.unit &&
      typeof item.threshold === 'number' &&
      ['normal', 'warning', 'error', 'offline'].includes(item.status) &&
      item.timestamp
    );
  };

  const handleFile = useCallback((file: File, type: 'events' | 'sensors') => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        if (type === 'events') {
          if (validateCityEvents(json)) {
            onEventsUploaded(json);
            setEventsStatus('success');
            setEventsCount(json.length);
            toast.success(`成功上传 ${json.length} 条市民事件数据`);
          } else {
            setEventsStatus('error');
            toast.error('数据格式错误：请检查city_events.json格式是否正确');
          }
        } else {
          if (validateSensorData(json)) {
            onSensorDataUploaded(json);
            setSensorsStatus('success');
            setSensorsCount(json.length);
            toast.success(`成功上传 ${json.length} 条传感器数据`);
          } else {
            setSensorsStatus('error');
            toast.error('数据格式错误：请检查sensor_data.json格式是否正确');
          }
        }
      } catch (error) {
        if (type === 'events') {
          setEventsStatus('error');
        } else {
          setSensorsStatus('error');
        }
        toast.error('JSON解析失败：文件格式不正确');
      }
    };

    reader.readAsText(file);
  }, [onEventsUploaded, onSensorDataUploaded]);

  const handleDrag = useCallback((e: React.DragEvent, type: 'events' | 'sensors') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'events' | 'sensors') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], type);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'events' | 'sensors') => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], type);
    }
  }, [handleFile]);

  const UploadCard = ({ 
    type, 
    title, 
    description, 
    status, 
    count 
  }: { 
    type: 'events' | 'sensors'; 
    title: string; 
    description: string; 
    status: 'idle' | 'success' | 'error';
    count: number;
  }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
          <FileJson className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white mb-1">{title}</h3>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive === type
            ? 'border-cyan-500 bg-cyan-500/5'
            : status === 'success'
            ? 'border-green-500 bg-green-500/5'
            : status === 'error'
            ? 'border-red-500 bg-red-500/5'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
        }`}
        onDragEnter={(e) => handleDrag(e, type)}
        onDragLeave={(e) => handleDrag(e, type)}
        onDragOver={(e) => handleDrag(e, type)}
        onDrop={(e) => handleDrop(e, type)}
      >
        <input
          type="file"
          id={`file-${type}`}
          accept=".json"
          onChange={(e) => handleChange(e, type)}
          className="hidden"
        />
        
        <label htmlFor={`file-${type}`} className="cursor-pointer">
          <div className="flex flex-col items-center">
            {status === 'idle' && (
              <>
                <Upload className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-white mb-2">拖拽文件到此处或点击上传</p>
                <p className="text-slate-500">支持 JSON 格式文件</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-green-400 mb-2">上传成功！</p>
                <p className="text-slate-400">已加载 {count} 条数据</p>
                <button className="mt-4 px-4 py-2 bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded hover:bg-slate-700 transition-colors">
                  重新上传
                </button>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-400 mb-2">上传失败</p>
                <p className="text-slate-400">请检查文件格式</p>
                <button className="mt-4 px-4 py-2 bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded hover:bg-slate-700 transition-colors">
                  重新上传
                </button>
              </>
            )}
          </div>
        </label>
      </div>

      {status === 'idle' && (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <p className="mb-2">数据格式要求：</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {type === 'events' ? (
                  <>
                    <li>必须包含字段：id, type, description, location, reporter, timestamp, status</li>
                    <li>location需包含：district, address, lat, lng</li>
                    <li>status取值：pending, processing, resolved</li>
                  </>
                ) : (
                  <>
                    <li>必须包含字段：id, deviceId, type, location, value, unit, threshold, status, timestamp</li>
                    <li>location需包含：district, address, lat, lng</li>
                    <li>status取值：normal, warning, error, offline</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadCard
          type="events"
          title="市民事件上报数据"
          description="city_events.json - 市民上报的城市问题"
          status={eventsStatus}
          count={eventsCount}
        />
        
        <UploadCard
          type="sensors"
          title="物联网传感器数据"
          description="sensor_data.json - 物联网设备采集的环境/设施状态"
          status={sensorsStatus}
          count={sensorsCount}
        />
      </div>
    </div>
  );
}
