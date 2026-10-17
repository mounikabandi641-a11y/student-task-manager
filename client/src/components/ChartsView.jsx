import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const PRIORITY_COLORS = {
  High: '#F43F5E',   // Pink
  Medium: '#F97316', // Orange
  Low: '#10B981'     // Green
};

export default function ChartsView({ stats }) {
  const { priorityBreakdown = {}, subjectBreakdown = [] } = stats || {};

  const priorityData = [
    { name: 'High', value: priorityBreakdown.High || 0 },
    { name: 'Medium', value: priorityBreakdown.Medium || 0 },
    { name: 'Low', value: priorityBreakdown.Low || 0 }
  ].filter(d => d.value > 0);

  const subjectData = (subjectBreakdown || []).slice(0, 5).map(item => ({
    name: item.name.length > 12 ? item.name.substring(0, 10) + '...' : item.name,
    fullName: item.name,
    tasks: item.count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-subtle)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {data.payload.fullName || data.name}: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Priority Distribution Chart */}
      <div className="widget-card">
        <div className="widget-header">
          <div className="widget-title">
            <PieIcon size={18} color="var(--pink-500)" />
            <h3>Priority Breakdown</h3>
          </div>
        </div>

        {priorityData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No priority data available
          </div>
        ) : (
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PRIORITY_COLORS[entry.name] || '#8B5CF6'} 
                      stroke="#0B0E17"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
              {priorityData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLORS[d.name] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasks by Subject Chart */}
      <div className="widget-card">
        <div className="widget-header">
          <div className="widget-title">
            <BarChart2 size={18} color="var(--purple-500)" />
            <h3>Tasks by Subject</h3>
          </div>
        </div>

        {subjectData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No subject data available
          </div>
        ) : (
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  allowDecimals={false} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="tasks" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
