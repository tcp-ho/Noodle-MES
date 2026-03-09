import { 
  AlertTriangle, CheckCircle, Clock, Factory, 
  FileText, Megaphone, ShieldCheck, Thermometer, Box
} from 'lucide-react';

const MOCK_DATA = {
  stats: [
    { label: 'Total Inspections', value: '145', sub: 'Today', icon: FileText, color: '#B91C1C', bg: '#FEF2F2' },
    { label: 'Pass Rate', value: '98.5%', sub: 'Quality Score', icon: ShieldCheck, color: '#2E7D32', bg: '#F0FDF4' },
    { label: 'Pending Release', value: '12', sub: 'Lots waiting', icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Active NC', value: '3', sub: 'Requires Action', icon: AlertTriangle, color: '#B91C1C', bg: '#FEF2F2' },
  ],
  production: [
    { id: 'RM-Starch-001', item: 'Mung Bean Starch', stage: 'Incoming QA', status: 'PASSED', time: '10:30 AM', img: 'https://images.unsplash.com/photo-1589301773836-829033e08285?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'FG-Noodle-012', item: 'Glass Noodle 500g', stage: 'FG QA', status: 'PENDING LAB', time: '11:15 AM', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'PM-Film-005', item: 'Packaging Film', stage: 'Incoming QA', status: 'PASSED', time: '11:45 AM', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=150&h=150' },
  ],
  alerts: [
    { title: 'Dryer Temp High', desc: 'Oven B exceeded 80°C.', time: 'In 15 mins', icon: Thermometer },
    { title: 'Starch Low Stock', desc: 'Reserve below 500kg.', time: 'In 30 mins', icon: Box },
  ]
};

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fadeIn pb-4 mt-24">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">SAWASDEE, QA TEAM!</h1>
          <p className="text-[#B91C1C] text-sm font-mono mt-1 tracking-widest uppercase">
            Quality Assurance Hub • PRODUCTION ACTIVE
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-[#B91C1C] border border-[#B91C1C] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Factory size={16} /> Factory Overview
          </button>
          <button className="bg-[#B91C1C] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#991B1B] transition-colors flex items-center gap-2">
            <AlertTriangle size={16} /> Report NC
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-md group">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200&h=400" 
          alt="Food Safety" 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center p-10">
          <div className="border-l-4 border-[#B91C1C] pl-4 mb-2">
            <h2 className="text-3xl font-bold text-white tracking-widest uppercase">FOOD SAFETY FIRST</h2>
          </div>
          <p className="text-white/90 text-xl font-serif italic max-w-2xl">
            "A small mistake in food safety can have huge consequences."
          </p>
          <p className="text-[#B91C1C] font-bold mt-2 tracking-widest uppercase text-sm">WHO</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_DATA.stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Icon size={120} color={stat.color} />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">{stat.label}</p>
                  <h4 className="text-4xl font-extrabold tracking-tight" style={{color: stat.color}}>{stat.value}</h4>
                  <p className="text-[10px] text-gray-500 font-medium font-mono mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: stat.color}}></span>
                    {stat.sub}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{backgroundColor: stat.bg, borderColor: stat.color + '30'}}>
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-[#FEF2F2] to-white border-l-4 border-[#B91C1C] rounded-2xl p-6 shadow-sm flex items-start gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-[#FEF2F2] to-transparent pointer-events-none"></div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <AlertTriangle size={150} />
        </div>
        
        <div className="bg-[#B91C1C] p-4 rounded-2xl shadow-lg shrink-0 z-10">
          <Megaphone size={32} className="text-white" />
        </div>
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-[#B91C1C] uppercase tracking-widest">SHIFT HANDOVER ALERT</h3>
            <span className="bg-[#B91C1C] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">URGENT</span>
          </div>
          <p className="text-gray-700 text-sm font-mono leading-relaxed">
            <span className="font-bold text-[#B91C1C]">Previous Shift Issue:</span> Metal detector on Line 2 rejected 5 packs of FG-Noodle-012 due to high sensitivity.<br/>
            <span className="font-bold text-[#D97706]">Action Required:</span> Current shift QC must recalibrate Line 2 detector and monitor every 30 mins.
          </p>
        </div>
        <div className="text-right shrink-0 z-10">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">REPORTED BY</p>
          <p className="text-sm font-bold text-gray-800">Night Shift Supervisor</p>
          <p className="text-[#B91C1C] font-mono text-xs font-bold mt-1">06:00 AM</p>
        </div>
      </div>

      {/* Bottom Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Inspections */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase tracking-widest">
              <CheckCircle size={20} className="text-[#B91C1C]" /> 
              RECENT INSPECTIONS
            </h2>
            <span className="text-[10px] text-[#B91C1C] font-bold bg-[#FEF2F2] px-3 py-1 rounded-full border border-[#B91C1C]/20 uppercase tracking-widest">LIVE UPDATES</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_DATA.production.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-[#B91C1C]/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Factory size={40} />
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm mx-auto mb-3 relative">
                  <img src={item.img} alt={item.item} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'PASSED' ? 'bg-[#2E7D32]' : 'bg-[#D97706]'}`}></div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{item.id}</h4>
                  <p className={`text-[10px] font-bold mt-1 tracking-widest uppercase ${item.status === 'PASSED' ? 'text-[#2E7D32]' : 'text-[#D97706]'}`}>
                    {item.status}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{item.stage}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-mono uppercase">Time</span>
                  <span className="text-[10px] font-bold text-gray-800 font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CCP Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <AlertTriangle size={20} className="text-[#B91C1C]" />
            CCP ALERTS
          </h2>
          <div className="space-y-4">
            {MOCK_DATA.alerts.map((alert, idx) => {
              const Icon = alert.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-[#FEF2F2] hover:border-[#B91C1C]/30 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                    <Icon size={20} className="text-[#B91C1C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{alert.title}</h4>
                    <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">{alert.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-[#B91C1C] font-mono">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-6 bg-[#8B5E34] hover:bg-[#6B4423] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">
            ACKNOWLEDGE ALL
          </button>
        </div>
      </div>
    </div>
  );
}
