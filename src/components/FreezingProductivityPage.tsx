import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Grid3x3, FileText, BarChart2, Calendar, RefreshCw, 
    Loader2, TrendingUp, History, PieChart, Table, Clock, Zap, List, 
    Download, Printer, Factory, CheckCircle, Database
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// --- Helper Functions ---
const formatMinutes = (mins: number) => {
    if (!mins || isNaN(mins)) return '-';
    const m = Math.round(mins);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r}m`;
    return `${h}h ${r}m`;
};

const formatNumber = (v: number, digits = 1) => {
    if (v == null || isNaN(v)) return '-';
    return Number(v).toFixed(digits);
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FreezingProductivityPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Monthly Selection State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState<any>(null);
    
    // Matrix Table State
    const [freezerStats, setFreezerStats] = useState<any[]>([]);
    const [freezerEnergyStats, setFreezerEnergyStats] = useState<any[]>([]);
    const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
    const [hoverData, setHoverData] = useState<any>(null);

    // Report State
    const [reportType, setReportType] = useState('production'); // 'production', 'energy'
    const [reportData, setReportData] = useState<any[]>([]);

    const chart1Ref = useRef<HTMLCanvasElement>(null);
    const chart2Ref = useRef<HTMLCanvasElement>(null);
    const chart3Ref = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{c1?: Chart, c2?: Chart, c3?: Chart}>({});

    useEffect(() => {
        // Mock Data Loading
        setTimeout(() => {
            const mockData = {
                hasData: true,
                updatedAt: new Date().toLocaleString('th-TH'),
                today: {
                    dateLabel: new Date().toLocaleDateString('th-TH'),
                    batchCount: 12,
                    totalEnergy: 450.5,
                    totalFreezingMinutes: 720,
                    totalThawMinutes: 180,
                    totalWaitStartMinutes: 45,
                    totalWaitThawMinutes: 30
                },
                last7Days: {
                    rangeLabel: "Last 7 Days",
                    batchCount: 85,
                    totalEnergy: 3200.8,
                    totalFreezingMinutes: 5100,
                    totalThawMinutes: 1200,
                    totalWaitStartMinutes: 350,
                    totalWaitThawMinutes: 210
                },
                byModel: [
                    { model: 'F Series', batchCount: 40, avgEnergy: 35.5, avgFreezingMinutes: 60, avgThawMinutes: 15 },
                    { model: 'C Series', batchCount: 25, avgEnergy: 28.2, avgFreezingMinutes: 55, avgThawMinutes: 12 },
                    { model: 'R Series', batchCount: 20, avgEnergy: 42.0, avgFreezingMinutes: 70, avgThawMinutes: 20 }
                ]
            };
            setData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    // Generate Monthly Data & Matrix Data based on selection
    useEffect(() => {
        const dim = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const days = Array.from({length: dim}, (_, i) => i + 1);
        setDaysInMonth(days);
        
        // 1. Mock Chart Data
        const batches = days.map(() => Math.floor(Math.random() * 15) + 2); 
        const avgTimes = days.map(() => (Math.random() * 20 + 30).toFixed(1)); 
        setMonthlyData({ labels: days, batches, avgTimes });

        // 2. Mock Freezer Matrix Data
        const fSeries = [
            { id: 'F1/1', std: 38, stdE: 40 }, { id: 'F1/2', std: 38, stdE: 40 },
            { id: 'F2/1', std: 38, stdE: 40 }, { id: 'F2/2', std: 38, stdE: 40 },
            { id: 'F3/1', std: 38, stdE: 40 }, { id: 'F3/2', std: 38, stdE: 40 }
        ];
        const cSeries = Array.from({length: 10}, (_, i) => ({ id: `C${i+1}`, std: 25, stdE: 30 }));
        const rSeries = Array.from({length: 14}, (_, i) => ({ id: `R${i+1}`, std: 48, stdE: 50 }));
        const mockFreezers = [...fSeries, ...cSeries, ...rSeries];

        // Generate Time Matrix Data
        const newFreezerStats = mockFreezers.map(f => {
            const daily = days.map(d => {
                if(Math.random() > 0.4) {
                    const actual = f.std + (Math.random() * 10 - 3); 
                    return {
                        val: actual.toFixed(1),
                        diff: actual - f.std,
                        batchId: `B-${1000 + d + parseInt(f.id.replace(/\D/g,'') || '0')}`,
                        status: actual > f.std + 2 ? 'Over' : (actual < f.std - 2 ? 'Fast' : 'Normal')
                    };
                }
                return null;
            });
            return { ...f, daily };
        });
        setFreezerStats(newFreezerStats);

        // Generate Energy Matrix Data
        const newFreezerEnergyStats = mockFreezers.map(f => {
            const daily = days.map(d => {
                if(Math.random() > 0.4) {
                    const actual = f.stdE + (Math.random() * 15 - 5); 
                    return {
                        val: actual.toFixed(1),
                        diff: actual - f.stdE,
                        batchId: `B-${1000 + d + parseInt(f.id.replace(/\D/g,'') || '0')}`,
                        status: actual > f.stdE + 5 ? 'High' : (actual < f.stdE - 5 ? 'Low' : 'Normal')
                    };
                }
                return null;
            });
            return { ...f, daily };
        });
        setFreezerEnergyStats(newFreezerEnergyStats);

        // 3. Generate Report Data
        const mockReportData: any[] = [];
        days.forEach(d => {
            const numBatches = Math.floor(Math.random() * 5) + 2; 
            for(let i=0; i<numBatches; i++) {
                const f = mockFreezers[Math.floor(Math.random() * mockFreezers.length)];
                const energy = f.stdE + (Math.random() * 10 - 5);
                const duration = f.std + (Math.random() * 4 - 2);
                mockReportData.push({
                    date: `${d}/${selectedMonth+1}/${selectedYear}`,
                    batchId: `B-${selectedYear}${selectedMonth+1}${d}-${i+1}`,
                    freezer: f.id,
                    model: f.id.charAt(0),
                    product: ["Vermicelli", "Glass Noodle", "Rice Stick"][Math.floor(Math.random()*3)],
                    qty: Math.floor(Math.random() * 10) + 1,
                    energy: energy.toFixed(2),
                    duration: duration.toFixed(2),
                    status: Math.random() > 0.9 ? 'Incomplete' : 'Completed'
                });
            }
        });
        setReportData(mockReportData);

    }, [selectedMonth, selectedYear]);

    // Chart Rendering
    useEffect(() => {
        if (!data || loading || !monthlyData) return;

        Chart.defaults.font.family = "'JetBrains Mono', 'Noto Sans Thai', sans-serif";
        Chart.defaults.color = '#64748B';

        // Cleanup
        if (chartInstances.current.c1) chartInstances.current.c1.destroy();
        if (chartInstances.current.c2) chartInstances.current.c2.destroy();
        if (chartInstances.current.c3) chartInstances.current.c3.destroy();

        if (activeTab === 'dashboard') {
            if (chart1Ref.current) {
                const ctx1 = chart1Ref.current.getContext('2d');
                if (ctx1) {
                    chartInstances.current.c1 = new Chart(ctx1, {
                        type: 'bar',
                        data: {
                            labels: data.byModel.map((m: any) => m.model),
                            datasets: [
                                { label: 'Batch Count', data: data.byModel.map((m: any) => m.batchCount), backgroundColor: '#1A1D24', borderRadius: 4, yAxisID: 'y' },
                                { label: 'Avg Energy (kWh)', data: data.byModel.map((m: any) => m.avgEnergy), backgroundColor: '#D97706', borderRadius: 4, yAxisID: 'y1' }
                            ]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            scales: {
                                y: { type: 'linear', display: true, position: 'left', title: {display: true, text: 'Batches'} },
                                y1: { type: 'linear', display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display: true, text: 'Energy (kWh)'} }
                            },
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                }
            }

            if (chart2Ref.current) {
                const ctx2 = chart2Ref.current.getContext('2d');
                if (ctx2) {
                    const t = data.today;
                    chartInstances.current.c2 = new Chart(ctx2, {
                        type: 'doughnut',
                        data: {
                            labels: ['Freeze Time', 'Thaw Time', 'Wait Start', 'Wait Thaw'],
                            datasets: [{
                                data: [t.totalFreezingMinutes, t.totalThawMinutes, t.totalWaitStartMinutes, t.totalWaitThawMinutes],
                                backgroundColor: ['#B91C1C', '#B91C1C', '#D97706', '#94A3B8'],
                                borderWidth: 0
                            }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
                    });
                }
            }

            if (chart3Ref.current) {
                const ctx3 = chart3Ref.current.getContext('2d');
                if (ctx3) {
                    chartInstances.current.c3 = new Chart(ctx3, {
                        type: 'bar',
                        data: {
                            labels: monthlyData.labels,
                            datasets: [
                                { label: 'Batches', data: monthlyData.batches, backgroundColor: 'rgba(68, 140, 17, 0.7)', borderRadius: 3, order: 2, yAxisID: 'y' },
                                { label: 'Avg FZ Time (Hrs)', data: monthlyData.avgTimes, type: 'line', borderColor: '#B91C1C', backgroundColor: '#B91C1C', borderWidth: 2, pointRadius: 3, tension: 0.3, order: 1, yAxisID: 'y1' }
                            ]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            scales: {
                                x: { grid: { display: false } },
                                y: { type: 'linear', display: true, position: 'left', title: {display: true, text: 'Total Batches'}, suggestedMax: 20 },
                                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: {display: true, text: 'Time (Hours)'}, suggestedMin: 20 }
                            },
                            plugins: { legend: { position: 'top' } }
                        }
                    });
                }
            }
        }

    }, [data, loading, activeTab, monthlyData]);

    // Handle Tooltip
    const handleCellEnter = (e: any, freezer: any, dayData: any, dayIndex: number, type = 'time') => {
        if(!dayData) return;
        const rect = e.target.getBoundingClientRect();
        setHoverData({
            x: rect.left + rect.width / 2,
            y: rect.top,
            freezerName: freezer.id,
            std: type === 'time' ? freezer.std : freezer.stdE,
            day: dayIndex + 1,
            val: dayData.val,
            batchId: dayData.batchId,
            status: dayData.status,
            diff: dayData.diff.toFixed(1),
            type: type // 'time' or 'energy'
        });
    };

    const handleCellLeave = () => setHoverData(null);

    const getCellColor = (data: any, type = 'time') => {
        if(!data) return 'bg-gray-50';
        if (type === 'time') {
            if(data.status === 'Over') return 'bg-red-100 text-red-700 font-bold';
            if(data.status === 'Fast') return 'bg-yellow-100 text-yellow-700';
            return 'bg-emerald-100 text-emerald-800';
        } else {
            // Energy Colors
            if(data.status === 'High') return 'bg-amber-100 text-amber-800 font-bold';
            if(data.status === 'Low') return 'bg-red-100 text-red-800';
            return 'bg-emerald-100 text-emerald-700';
        }
    };

    // Report Actions
    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Define Headers
        const headers = ["Date", "Batch ID", "Freezer", "Product", "Qty", "Energy (kWh)", "Duration (h)", "Status"];
        
        // Convert Data to CSV Rows
        const rows = reportData.map(row => [
            row.date,
            row.batchId,
            row.freezer,
            row.product,
            row.qty,
            row.energy,
            row.duration,
            row.status
        ]);

        // Combine Headers and Rows
        const csvContent = [
            headers.join(","), 
            ...rows.map(e => e.join(","))
        ].join("\n");

        // Create Blob with BOM for Thai support
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create Download Link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Production_Report_${monthNames[selectedMonth]}_${selectedYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full bg-[#F4F3EF]">
            
            {/* Header */}
            <div className="px-4 py-2 flex justify-between items-center z-10 shrink-0 no-print">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/20 flex-shrink-0">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A1D24] tracking-tight whitespace-nowrap">Productivity Analysis</h1>
                        <p className="text-[#718096] text-[10px] font-medium uppercase tracking-widest mt-0.5">วิเคราะห์ประสิทธิภาพการผลิต</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/40 p-1 rounded-md overflow-x-auto no-scrollbar max-w-full border border-white/50 shadow-inner w-fit flex-shrink-0 backdrop-blur-sm">
                        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'dashboard' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <LayoutDashboard size={14} /> DASHBOARD
                        </button>
                        <button onClick={() => setActiveTab('matrix')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'matrix' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <Grid3x3 size={14} /> MATRIX
                        </button>
                        <button onClick={() => setActiveTab('report')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'report' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <FileText size={14} /> REPORT
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 px-4 pb-4 pt-2 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                
                {/* Info Bar & Date Filter (Available for all tabs) */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 p-2 rounded-xl border border-white/50 shadow-sm mb-2 shrink-0 no-print backdrop-blur-sm">
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <Database size={14}/>
                        <span>Data Source: Freezing_Trans (Updated: {data ? data.updatedAt : '-'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                            <Calendar size={14} className="text-slate-400 mr-2"/>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-[#1A1D24] outline-none cursor-pointer"
                            >
                                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <span className="mx-2 text-slate-300">|</span>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-[#1A1D24] outline-none cursor-pointer"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button className="bg-[#1A1D24] text-white p-2 rounded-lg hover:bg-[#1A1D24] transition shadow-sm">
                            <RefreshCw size={16}/>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-3">
                        <Loader2 size={32} className="animate-spin" />
                        <span className="font-mono">Loading Analysis Data...</span>
                    </div>
                ) : !data ? (
                    <div className="text-center py-20 text-slate-400">No Data Available</div>
                ) : (
                    <>
                        {/* TAB: DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar animate-fade-in-up pb-10">
                                
                                {/* NEW: Monthly Performance Chart */}
                                <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-[#718096] uppercase tracking-wider">Monthly Overview</p>
                                            <h3 className="text-lg font-bold text-[#1A1D24]">Production Performance: {monthNames[selectedMonth]} {selectedYear}</h3>
                                        </div>
                                        <span className="bg-[#718096]/10 text-[#718096] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <TrendingUp size={12}/> Daily Trend
                                        </span>
                                    </div>
                                    <div className="w-full h-72">
                                        <canvas ref={chart3Ref}></canvas>
                                    </div>
                                </div>

                                {/* Summary Cards (Today vs Last 7 Days) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Today Card */}
                                    <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-[#1A1D24] uppercase tracking-wider">Today Performance</p>
                                                <h3 className="text-lg font-bold text-[#1A1D24]">{data.today.dateLabel}</h3>
                                            </div>
                                            <span className="bg-[#1A1D24]/10 text-[#1A1D24] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <Calendar size={12}/> Today
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Batches</p>
                                                <p className="text-2xl font-bold text-[#1A1D24]">{data.today.batchCount}</p>
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Energy</p>
                                                <p className="text-2xl font-bold text-[#D97706]">{formatNumber(data.today.totalEnergy)} <span className="text-xs text-slate-400">kWh</span></p>
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Freeze Time</p>
                                                <p className="text-xl font-bold text-[#718096]">{formatMinutes(data.today.totalFreezingMinutes)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Last 7 Days Card */}
                                    <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">Weekly Overview</p>
                                                <h3 className="text-lg font-bold text-[#1A1D24]">Last 7 Days</h3>
                                            </div>
                                            <span className="bg-[#B91C1C]/10 text-[#B91C1C] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <History size={12}/> 7 Days
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Total Batches</p>
                                                <p className="text-2xl font-bold text-[#1A1D24]">{data.last7Days.batchCount}</p>
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Total Energy</p>
                                                <p className="text-2xl font-bold text-[#D97706]">{formatNumber(data.last7Days.totalEnergy)} <span className="text-xs text-slate-400">kWh</span></p>
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-lg border border-white">
                                                <p className="text-[10px] text-slate-500 uppercase">Avg Freeze/Day</p>
                                                <p className="text-xl font-bold text-[#718096]">{formatMinutes(data.last7Days.totalFreezingMinutes/7)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Graphs Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl p-5 lg:col-span-2 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BarChart2 size={18} className="text-[#1A1D24]"/>
                                            <h3 className="text-sm font-bold text-[#1A1D24]">Efficiency by Model (Batch vs Energy)</h3>
                                        </div>
                                        <div className="relative w-full h-80">
                                            <canvas ref={chart1Ref}></canvas>
                                        </div>
                                    </div>
                                    <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl p-5 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <PieChart size={18} className="text-[#1A1D24]"/>
                                            <h3 className="text-sm font-bold text-[#1A1D24]">Today's Time Usage</h3>
                                        </div>
                                        <div className="relative w-full h-80 flex justify-center">
                                            <canvas ref={chart2Ref}></canvas>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Table - FORCE 12px */}
                                <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl overflow-hidden">
                                    <div className="bg-white/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-[#1A1D24] flex items-center gap-2"><Table size={16}/> Model Performance Detail</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 text-slate-500 font-mono uppercase">
                                                <tr>
                                                    <th className="px-6 py-3">Model</th>
                                                    <th className="px-6 py-3 text-right">Batches</th>
                                                    <th className="px-6 py-3 text-right">Avg Energy</th>
                                                    <th className="px-6 py-3 text-right">Avg Freeze Time</th>
                                                    <th className="px-6 py-3 text-right">Avg Thaw Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.byModel.map((m: any, i: number) => (
                                                    <tr key={i} className="hover:bg-white/50 transition-colors">
                                                        <td className="px-6 py-3 font-bold text-[#1A1D24]">{m.model}</td>
                                                        <td className="px-6 py-3 text-right font-mono">{m.batchCount}</td>
                                                        <td className="px-6 py-3 text-right font-mono text-[#D97706] font-bold">{formatNumber(m.avgEnergy)}</td>
                                                        <td className="px-6 py-3 text-right font-mono">{formatMinutes(m.avgFreezingMinutes)}</td>
                                                        <td className="px-6 py-3 text-right font-mono">{formatMinutes(m.avgThawMinutes)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: MATRIX */}
                        {activeTab === 'matrix' && (
                            <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar animate-fade-in-up pb-10">
                                
                                {/* Matrix 1: Freezing Time - FORCE 10px */}
                                <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl overflow-hidden flex flex-col shadow-lg border border-white/80">
                                    <div className="bg-white/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#1A1D24] flex items-center gap-2"><Clock size={16}/> Daily Freezing Time Matrix (Hours)</h3>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Average freezing duration per cycle</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Normal</span>
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Fast</span>
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-red-500"></span> Over</span>
                                        </div>
                                    </div>
                                    <div className="matrix-table-container custom-scrollbar bg-white overflow-x-auto">
                                        <table className="w-full border-collapse border-spacing-0">
                                            <thead className="sticky top-0 z-30 bg-slate-50">
                                                <tr>
                                                    <th className="sticky left-0 z-20 p-2 text-left text-[10px] font-bold text-slate-600 bg-gray-50 min-w-[100px] border-b border-slate-200 border-r">Freezer (Std)</th>
                                                    {daysInMonth.map(d => (
                                                        <th key={d} className="p-1 text-center text-[10px] font-bold text-slate-500 bg-gray-50 border-b border-slate-200 min-w-[40px]">{d}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {freezerStats.map((f, i) => (
                                                    <tr key={f.id} className="hover:bg-gray-50/50">
                                                        <td className="sticky left-0 z-10 p-2 text-[10px] font-bold text-[#1A1D24] border-b border-slate-100 bg-white border-r">
                                                            {f.id} <span className="text-[9px] text-slate-400">({f.std}h)</span>
                                                        </td>
                                                        {f.daily.map((dayData: any, idx: number) => (
                                                            <td 
                                                                key={idx} 
                                                                className={`min-w-[45px] h-[35px] text-center border-r border-b border-slate-100 text-[10px] transition-all cursor-default hover:scale-110 hover:z-20 hover:shadow-md hover:rounded ${getCellColor(dayData, 'time')}`}
                                                                onMouseEnter={(e) => handleCellEnter(e, f, dayData, idx, 'time')}
                                                                onMouseLeave={handleCellLeave}
                                                            >
                                                                {dayData ? dayData.val : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Matrix 2: Energy Consumption - FORCE 10px */}
                                <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm rounded-2xl overflow-hidden flex flex-col shadow-lg border border-white/80">
                                    <div className="bg-white/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#1A1D24] flex items-center gap-2"><Zap size={16}/> Daily Energy Consumption Matrix (kWh)</h3>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Average energy used per freezing cycle</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal</span>
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-red-600"></span> Low</span>
                                            <span className="flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-600"></span> High</span>
                                        </div>
                                    </div>
                                    <div className="matrix-table-container custom-scrollbar bg-white overflow-x-auto">
                                        <table className="w-full border-collapse border-spacing-0">
                                            <thead className="sticky top-0 z-30 bg-slate-50">
                                                <tr>
                                                    <th className="sticky left-0 z-20 p-2 text-left text-[10px] font-bold text-slate-600 bg-gray-50 min-w-[100px] border-b border-slate-200 border-r">Freezer (Avg)</th>
                                                    {daysInMonth.map(d => (
                                                        <th key={d} className="p-1 text-center text-[10px] font-bold text-slate-500 bg-gray-50 border-b border-slate-200 min-w-[40px]">{d}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {freezerEnergyStats.map((f, i) => (
                                                    <tr key={f.id} className="hover:bg-gray-50/50">
                                                        <td className="sticky left-0 z-10 p-2 text-[10px] font-bold text-[#1A1D24] border-b border-slate-100 bg-white border-r">
                                                            {f.id} <span className="text-[9px] text-slate-400">(~{f.stdE})</span>
                                                        </td>
                                                        {f.daily.map((dayData: any, idx: number) => (
                                                            <td 
                                                                key={idx} 
                                                                className={`min-w-[45px] h-[35px] text-center border-r border-b border-slate-100 text-[10px] transition-all cursor-default hover:scale-110 hover:z-20 hover:shadow-md hover:rounded ${getCellColor(dayData, 'energy')}`}
                                                                onMouseEnter={(e) => handleCellEnter(e, f, dayData, idx, 'energy')}
                                                                onMouseLeave={handleCellLeave}
                                                            >
                                                                {dayData ? dayData.val : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* TAB: REPORT (A4 PAPER VIEW) - FORCE 12px */}
                        {activeTab === 'report' && (
                            <div className="flex flex-col h-full gap-4 animate-fade-in-up">
                                {/* Report Toolbar - Hide on Print */}
                                <div className="bg-white/50 p-3 rounded-xl border border-white/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 no-print">
                                    <div className="flex items-center gap-3">
                                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                            <button 
                                                onClick={() => setReportType('production')}
                                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${reportType === 'production' ? 'bg-[#1A1D24] text-white shadow-sm' : 'text-slate-500 hover:text-[#1A1D24]'}`}
                                            >
                                                <List size={14}/> Production Log
                                            </button>
                                            <button 
                                                onClick={() => setReportType('energy')}
                                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${reportType === 'energy' ? 'bg-[#1A1D24] text-white shadow-sm' : 'text-slate-500 hover:text-[#1A1D24]'}`}
                                            >
                                                <Zap size={14}/> Energy Summary
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleExport} className="px-4 py-2 bg-white text-[#1A1D24] border border-[#1A1D24]/30 hover:bg-[#1A1D24]/5 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-sm">
                                            <Download size={14}/> Export CSV
                                        </button>
                                        <button onClick={handlePrint} className="px-4 py-2 bg-[#1A1D24] text-white hover:bg-[#1A1D24]/90 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg">
                                            <Printer size={14}/> Print
                                        </button>
                                    </div>
                                </div>

                                {/* Report Preview Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-200/50 p-4 md:p-8 flex justify-center items-start rounded-xl border border-black/5">
                                    
                                    {/* A4 Paper Container - ID for Print Targeting */}
                                    <div id="printable-report" className="bg-white shadow-xl min-h-[297mm] w-full max-w-[210mm] p-10 text-[#1A1D24] relative">
                                        
                                        {/* Paper Header */}
                                        <div className="flex justify-between items-start mb-8 border-b-2 border-[#1A1D24] pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#1A1D24] text-white flex items-center justify-center rounded-lg">
                                                    <Factory size={24}/>
                                                </div>
                                                <div>
                                                    <h1 className="text-xl font-bold uppercase tracking-wide">Noodle Master Factory</h1>
                                                    <p className="text-xs text-slate-500">Pathum Thani, Thailand</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h2 className="text-2xl font-bold text-[#1A1D24] uppercase">{reportType === 'production' ? 'Production Log' : 'Energy Report'}</h2>
                                                <p className="text-sm font-mono text-slate-500 mt-1">Period: {monthNames[selectedMonth]} {selectedYear}</p>
                                            </div>
                                        </div>

                                        {/* Summary Box */}
                                        <div className="grid grid-cols-4 gap-4 mb-8">
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="text-[10px] text-slate-500 uppercase">Total Batches</p>
                                                <p className="text-xl font-bold">{reportData.length}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="text-[10px] text-slate-500 uppercase">Total Energy</p>
                                                <p className="text-xl font-bold text-[#D97706]">{formatNumber(reportData.reduce((s,i)=>s+Number(i.energy),0))} kWh</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="text-[10px] text-slate-500 uppercase">Avg Duration</p>
                                                <p className="text-xl font-bold text-[#718096]">{formatNumber(reportData.reduce((s,i)=>s+Number(i.duration),0)/reportData.length)} h</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="text-[10px] text-slate-500 uppercase">Status</p>
                                                <p className="text-sm font-bold text-emerald-700 mt-1"><CheckCircle size={14} className="inline mr-1"/> Verified</p>
                                            </div>
                                        </div>

                                        {/* Data Table - FORCE 12px (text-xs in tailwind is 12px) */}
                                        <div className="w-full">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-[#1A1D24] text-white font-mono uppercase tracking-wider">
                                                    <tr>
                                                        <th className="p-2">Date</th>
                                                        <th className="p-2">Batch ID</th>
                                                        <th className="p-2">Freezer</th>
                                                        <th className="p-2">Product</th>
                                                        <th className="p-2 text-right">Qty</th>
                                                        <th className="p-2 text-right">Energy (kWh)</th>
                                                        <th className="p-2 text-right">Duration (h)</th>
                                                        <th className="p-2 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 font-mono">
                                                    {reportData.map((row, idx) => (
                                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="p-2">{row.date}</td>
                                                            <td className="p-2 font-bold">{row.batchId}</td>
                                                            <td className="p-2"><span className={`px-1 rounded ${row.model==='F'?'bg-red-100 text-red-800':row.model==='C'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-700'}`}>{row.freezer}</span></td>
                                                            <td className="p-2">{row.product}</td>
                                                            <td className="p-2 text-right">{row.qty}</td>
                                                            <td className="p-2 text-right">{row.energy}</td>
                                                            <td className="p-2 text-right">{row.duration}</td>
                                                            <td className="p-2 text-center">
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${row.status==='Completed'?'text-emerald-700 bg-emerald-50 border-emerald-200':'text-red-600 bg-red-50 border-red-200'}`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between text-[10px] text-slate-400 font-mono">
                                            <span>Generated by NOODLE MASTER MES</span>
                                            <span>Page 1 of 1</span>
                                            <span>{new Date().toLocaleString()}</span>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Tooltip Portal */}
            {hoverData && (
                <div className="fixed z-50 pointer-events-none bg-[#1A1D24]/95 text-white p-2 rounded-lg text-xs shadow-xl border border-white/10" style={{ left: hoverData.x, top: hoverData.y, transform: 'translate(-50%, -120%)' }}>
                    <div className="font-bold text-[#D97706] mb-1 flex items-center gap-2">
                        {hoverData.type === 'time' ? <Clock size={12}/> : <Zap size={12}/>} Freezer {hoverData.freezerName}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-gray-300">
                        <span>Date:</span> <span className="text-white text-right">{hoverData.day}/{selectedMonth+1}/{selectedYear}</span>
                        
                        <span>{hoverData.type === 'time' ? 'Avg Time:' : 'Avg Energy:'}</span> 
                        <span className="text-white text-right font-bold">{hoverData.val} {hoverData.type === 'time' ? 'hrs' : 'kWh'}</span>
                        
                        <span>{hoverData.type === 'time' ? 'Std Time:' : 'Avg Ref:'}</span> 
                        <span className="text-white text-right">{hoverData.std} {hoverData.type === 'time' ? 'hrs' : 'kWh'}</span>
                        
                        <span>Diff:</span> <span className={`${Number(hoverData.diff)>0 ? (hoverData.type === 'time' ? 'text-red-400' : 'text-amber-400') : 'text-emerald-400'} text-right`}>{hoverData.diff > 0 ? '+' : ''}{hoverData.diff}</span>
                        
                        <span>Batch:</span> <span className="text-white text-right font-mono">{hoverData.batchId}</span>
                        <span>Status:</span> <span className={`text-right font-bold ${
                            hoverData.type === 'time' 
                                ? (hoverData.status==='Over'?'text-red-500':'text-emerald-600')
                                : (hoverData.status==='High'?'text-amber-600':'text-emerald-500')
                        }`}>{hoverData.status}</span>
                    </div>
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1A1D24]/95"></div>
                </div>
            )}
        </div>
    );
};

export default FreezingProductivityPage;
