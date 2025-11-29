import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  value: string;
  onChange: (value: string) => void;
}>({ value: '', onChange: () => {} });

export function Tabs({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      onClick={() => onChange(value)}
      className={`px-4 py-2 transition-colors ${
        isActive
          ? 'bg-cyan-500 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: selectedValue } = useContext(TabsContext);

  if (selectedValue !== value) return null;

  return <div className={className}>{children}</div>;
}
