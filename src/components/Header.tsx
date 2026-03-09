import { Bell, Clock, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-24 px-8 flex items-center justify-between z-10 absolute top-0 left-0 right-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#B91C1C] flex items-center justify-center shadow-md shrink-0">
          <Award size={24} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#1A1D24] font-extrabold uppercase tracking-wide text-lg leading-tight">
            THE LEADER OF MUNG BEAN VERMICELLI
          </h2>
          <p className="text-[#448C11] text-[10px] font-bold uppercase tracking-widest">
            MANUFACTURE & DISTRIBUTOR IN SOUTH EAST ASIA
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-4 bg-white/80 rounded-md pl-6 pr-2 py-1.5 border border-gray-200 shadow-sm backdrop-blur-sm group hover:bg-white transition-colors">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-bold text-[#465902] tracking-widest uppercase">
              {currentTime.toLocaleDateString('en-GB', { weekday: 'long' })}
            </span>
            <span className="text-xs font-bold text-[#768C70]">
              {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-2 bg-[#448C11] text-white px-4 py-2 rounded-md font-mono text-sm tracking-widest shadow-inner">
            <Clock size={14} className="text-white animate-pulse"/>
            {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <button className="relative p-3 rounded-full bg-white hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
          <Bell size={18} className="text-[#B91C1C]" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
