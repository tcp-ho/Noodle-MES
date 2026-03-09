import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    PieChart, BarChart2, TrendingUp, ShoppingCart, Truck, CheckCircle, Coins
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// --- Components ---

const KpiCard = ({ title, val, color, icon: Icon, desc }: any) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-white/60 relative overflow-hidden group h-full cursor-pointer">
        <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
            <Icon size={120} strokeWidth={1.5} color={color} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-[#718096] uppercase tracking-widest font-mono opacity-90 truncate">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-extrabold tracking-tight font-mono leading-tight truncate" style={{ color }}>{val}</h4>
                </div>
                {desc && (
                    <p className="text-[10px] text-gray-400 font-medium font-sans mt-2 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                        {desc}
                    </p>
                )}
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md border border-white/60" style={{ backgroundColor: color + '20' }}>
                <Icon size={24} color={color} />
            </div>
        </div>
        
        <div className="w-full bg-white/50 rounded-full h-1.5 mt-4 overflow-hidden relative z-10">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: '70%', backgroundColor: color }}></div>
        </div>
    </div>
);

// --- Main Page Component ---

export default function POAnalysisPage() {
    const [period, setPeriod] = useState('This Month');
    const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];
    
    // Mock PO Data
    const [poData, setPoData] = useState<any[]>([
        { status: 'Sent', totalAmount: 8025, vendor: 'Thai Steel Co.' },
        { status: 'Completed', totalAmount: 535, vendor: 'Nut & Bolt Shop' },
        { status: 'Pending Approve', totalAmount: 5000, vendor: 'Office Supply Co.' },
        { status: 'Approved', totalAmount: 12000, vendor: 'Thai Steel Co.' },
        { status: 'Completed', totalAmount: 50000, vendor: 'Legacy Supplier' },
        { status: 'Sent', totalAmount: 25000, vendor: 'Global Raw Materials' },
        { status: 'Completed', totalAmount: 15000, vendor: 'Thai Steel Co.' },
    ]);

    const chartStatusRef = useRef<HTMLCanvasElement>(null);
    const chartVendorRef = useRef<HTMLCanvasElement>(null);
    const chartTrendRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{status?: Chart, vendor?: Chart, trend?: Chart}>({});

    const stats = useMemo(() => {
        const total = poData.length;
        const pendingDelivery = poData.filter(p => ['Sent', 'Approved'].includes(p.status)).length;
        const completed = poData.filter(p => p.status === 'Completed').length;
        const totalSpend = poData.reduce((acc, curr) => acc + curr.totalAmount, 0);
        
        // Mock On-Time Rate calculation
        const onTimeRate = 92; // Placeholder

        return {
            total,
            pendingDelivery,
            onTimeRate,
            totalSpend
        };
    }, [poData]);

    const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

    useEffect(() => {
        // Initialize Charts
        if (chartInstances.current.status) chartInstances.current.status.destroy();
        if (chartInstances.current.vendor) chartInstances.current.vendor.destroy();
        if (chartInstances.current.trend) chartInstances.current.trend.destroy();

        Chart.defaults.font.family = "'JetBrains Mono', 'Noto Sans Thai', sans-serif";
        Chart.defaults.color = '#718096';

        // 1. Status Chart (Doughnut)
        const statusCounts: any = {}; 
        poData.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
        
        if (chartStatusRef.current) {
             chartInstances.current.status = new Chart(chartStatusRef.current, {
                 type: 'doughnut',
                 data: {
                     labels: Object.keys(statusCounts),
                     datasets: [{
                         data: Object.values(statusCounts),
                         backgroundColor: ['#718096', '#3F6212', '#D97706', '#1A1D24', '#B91C1C'],
                         borderWidth: 0,
                         hoverOffset: 4
                     }]
                 },
                 options: {
                     maintainAspectRatio: false,
                     cutout: '65%',
                     plugins: { 
                         legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: {size: 11} } },
                         tooltip: { backgroundColor: 'rgba(13, 24, 38, 0.9)' }
                     }
                 }
             });
        }

        // 2. Vendor Chart (Bar) - Top Vendors by Spend
        const vendorSpending: any = {}; 
        poData.forEach(p => { vendorSpending[p.vendor] = (vendorSpending[p.vendor] || 0) + p.totalAmount; });
        
        if (chartVendorRef.current) {
             chartInstances.current.vendor = new Chart(chartVendorRef.current, {
                 type: 'bar',
                 data: {
                     labels: Object.keys(vendorSpending),
                     datasets: [{
                         label: 'Spend Amount (THB)',
                         data: Object.values(vendorSpending),
                         backgroundColor: '#1A1D24',
                         borderRadius: 4,
                         barThickness: 24
                     }]
                 },
                 options: {
                     maintainAspectRatio: false,
                     indexAxis: 'y', // Horizontal bar for better label readability
                     scales: { 
                         x: { grid: { display: false }, ticks: {font: {size: 10}} }, 
                         y: { grid: { color: '#E2E8F0', tickBorderDash: [5, 5] } } 
                     },
                     plugins: { 
                         legend: { display: false },
                         tooltip: { backgroundColor: 'rgba(13, 24, 38, 0.9)' }
                     }
                 }
             });
        }

        // 3. Trend Chart (Line - Mock Data)
        if (chartTrendRef.current) {
            const ctx = chartTrendRef.current.getContext('2d');
            let gradient: any = 'rgba(212, 175, 55, 0.2)';
            if (ctx) {
                gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
                gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
            }

            chartInstances.current.trend = new Chart(chartTrendRef.current, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Purchase Volume',
                        data: [45000, 32000, 58000, 25000],
                        borderColor: '#D97706',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#D97706',
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: { 
                        x: { grid: { display: false } }, 
                        y: { grid: { color: '#E2E8F0', tickBorderDash: [5, 5] }, beginAtZero: true } 
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(13, 24, 38, 0.9)' }
                    }
                }
            });
        }

        return () => {
            Object.values(chartInstances.current).forEach(c => c && (c as Chart).destroy());
        };
    }, [poData, period]);

    return (
        <div className="flex flex-col h-full bg-[#D9D9D9]">
            {/* Header */}
            <div className="px-4 py-2 flex justify-between items-center z-10 shrink-0 no-print">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/20 flex-shrink-0 border border-white/20">
                        <PieChart size={24} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A1D24] tracking-tight whitespace-nowrap">PO ANALYSIS</h1>
                        <p className="text-[#718096] text-[10px] font-medium uppercase tracking-widest mt-0.5">วิเคราะห์ข้อมูลการสั่งซื้อ</p>
                    </div>
                </div>
                
                {/* Filter */}
                <div className="flex bg-white/40 p-1 rounded-md overflow-x-auto no-scrollbar max-w-full border border-white/50 shadow-inner w-fit flex-shrink-0 backdrop-blur-sm">
                    {periods.map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${period === p ? 'bg-[#1A1D24] text-[#D97706] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-4 pt-2 relative z-10 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <KpiCard title="Total Orders" val={stats.total} color="#718096" icon={ShoppingCart} desc="All POs Issued" />
                    <KpiCard title="Pending Delivery" val={stats.pendingDelivery} color="#D97706" icon={Truck} desc="Waiting for Goods" />
                    <KpiCard title="On-Time Rate" val={stats.onTimeRate + '%'} color="#3F6212" icon={CheckCircle} desc="Vendor Performance" />
                    <KpiCard title="Total Spend" val={formatCurrency(stats.totalSpend)} color="#1A1D24" icon={Coins} desc="Net Value" />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] shrink-0">
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-soft flex flex-col hover:shadow-lg transition-shadow">
                        <h3 className="text-sm font-bold text-[#1A1D24] mb-4 uppercase tracking-wide flex justify-between items-center font-mono">
                            <span className="flex items-center gap-2"><PieChart size={16} color="#718096"/> PO Status Distribution</span>
                        </h3>
                        <div className="flex-grow relative flex items-center justify-center">
                            <canvas ref={chartStatusRef}></canvas>
                        </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-soft flex flex-col hover:shadow-lg transition-shadow">
                        <h3 className="text-sm font-bold text-[#1A1D24] mb-4 uppercase tracking-wide flex justify-between items-center font-mono">
                            <span className="flex items-center gap-2"><BarChart2 size={16} color="#718096"/> Top Vendors by Spend</span>
                        </h3>
                        <div className="flex-grow relative flex items-center justify-center">
                            <canvas ref={chartVendorRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 gap-4 h-[350px] shrink-0 pb-6">
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-soft flex flex-col hover:shadow-lg transition-shadow">
                        <h3 className="text-sm font-bold text-[#1A1D24] mb-4 uppercase tracking-wide flex justify-between items-center font-mono">
                            <span className="flex items-center gap-2"><TrendingUp size={16} color="#718096"/> Monthly Purchase Trend</span>
                        </h3>
                        <div className="flex-grow relative">
                            <canvas ref={chartTrendRef}></canvas>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
