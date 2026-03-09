import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Waves, LayoutDashboard, Grid3x3, FileText, Clock, Search, Settings2, 
  X, Sliders, History, Play, ArrowRightCircle, CheckCircle, AlertTriangle, 
  Box, ArrowDownCircle, FlaskConical, Snowflake, Package, Printer, ClipboardList,
  ChevronRight, Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- CONSTANTS ---
const PALETTE = {
    bgGradientStart: '#F4F3EF', bgGradientEnd: '#D9D9D9',
    glassWhite: 'rgba(255, 255, 255, 0.85)',
    greenMain: '#1A1D24', greenLight: '#BBF7D0'
};

const TANKS_CONFIG = Array.from({length: 100}, (_, i) => ({
    id: `S${i+1}`, name: `บ่อแช่ ${i+1}`,
    capacity: i < 50 ? 1000 : 2000
}));

const FORMULA_OPTIONS = [
    { name: "สูตรมาตรฐาน (Standard)", time: 60, chem: 500 },
    { name: "สูตรขาวพิเศษ (Extra White)", time: 90, chem: 750 },
    { name: "สูตรส่งออก (Export)", time: 45, chem: 300 },
];

// --- COMPONENTS ---
const GlassCard = ({ children, className = '', onClick }: any) => (
    <div onClick={onClick} className={`rounded-2xl p-4 backdrop-blur-xl shadow-sm border border-white/60 bg-white/90 ${className}`}>
        {children}
    </div>
);

// --- LOGIC HELPERS ---
const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
};

const generateFreezerJob = () => {
    const id = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const products = ['วุ้นเส้นสด', 'วุ้นเส้นแห้ง', 'เส้นก๋วยเตี๋ยว', 'หมี่ขาว'];
    const freezers = ['F1/1', 'F2/1', 'C3', 'R5', 'R12'];
    return {
        id: `JOB-${id}`,
        product: products[Math.floor(Math.random() * products.length)],
        weight: Math.floor(Math.random() * 1000) + 500,
        from: freezers[Math.floor(Math.random() * freezers.length)],
        timeOut: new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})
    };
};

const generatePackingJob = () => {
    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g,'');
    const id = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const products = ['วุ้นเส้นสด', 'วุ้นเส้นแห้ง', 'เส้นก๋วยเตี๋ยว'];
    const tanks = ['S1', 'S2', 'S5', 'S10', 'S24'];
    return {
        batchId: `B-${dateStr}-${tanks[Math.floor(Math.random() * tanks.length)]}`,
        product: products[Math.floor(Math.random() * products.length)],
        weight: Math.floor(Math.random() * 1000) + 500,
        outTime: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})
    };
};

const generateHistoryJob = () => {
    const date = new Date(Date.now() - Math.floor(Math.random() * 1000000000));
    const tankNum = Math.floor(Math.random()*50)+1;
    return {
        startTime: date.toISOString(),
        batchId: `B-HIST-${Math.floor(Math.random()*1000)}`,
        tankId: `S${tankNum}`,
        product: 'วุ้นเส้นสด',
        chemicalAmount: 500,
        status: 'PACKED',
        lotNo: `L-${date.getFullYear()}${date.getMonth()+1}-${Math.floor(Math.random()*100)}`,
        packedQty: 1000
    };
};

// --- SPECIFIC COMPONENTS ---
const TankCard = ({ config, batch, onAction, isJobSelected }: any) => {
    const [elapsed, setElapsed] = useState(0);
    
    useEffect(() => {
        let interval: any;
        if (batch && batch.status === 'SOAKING') {
            interval = setInterval(() => {
                const now = new Date();
                const start = new Date(batch.startTime);
                setElapsed(Math.floor((now.getTime() - start.getTime()) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [batch]);

    const targetSeconds = batch ? batch.targetMinutes * 60 : 0;
    const progress = Math.min((elapsed / targetSeconds) * 100, 100) || 0;
    const isOverdue = elapsed > targetSeconds;

    let statusColor = "border-gray-200 hover:border-gray-300";
    let Icon = Box;
    let statusText = "Empty";
    let textColor = "text-gray-400";
    let bgColor = "bg-white/80";

    if (batch) {
        if (batch.status === 'SOAKING') {
            statusColor = isOverdue ? "border-[#B91C1C] bg-red-50/50" : "border-[#B91C1C] bg-red-50/50";
            Icon = isOverdue ? AlertTriangle : Waves;
            statusText = isOverdue ? "OVERDUE" : "SOAKING";
            textColor = isOverdue ? "text-[#B91C1C]" : "text-[#B91C1C]";
            bgColor = "bg-white/90";
        } else if (batch.status === 'FINISHED') {
            statusColor = "border-[#1A1D24] bg-emerald-50/50";
            Icon = CheckCircle;
            statusText = "FINISHED";
            textColor = "text-[#1A1D24]";
            bgColor = "bg-white/90";
        }
    } else if (isJobSelected) {
        statusColor = "border-[#1A1D24] ring-2 ring-[#BBF7D0] cursor-pointer bg-[#BBF7D0]/10 animate-pulse";
        textColor = "text-[#1A1D24]";
        statusText = "SELECT THIS";
        bgColor = "bg-white";
    }

    return (
        <div onClick={() => onAction(config, batch)} className={`relative rounded-xl p-3 border-2 transition-all cursor-pointer h-36 flex flex-col justify-between hover:shadow-lg ${statusColor} ${bgColor} overflow-hidden group`}>
            {batch && batch.status === 'SOAKING' && (
                <div className="absolute bottom-0 left-0 w-full bg-[#B91C1C]/10 transition-all duration-1000" style={{ height: `${progress}%` }}></div>
            )}
            <div className="flex justify-between items-start z-10">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1A1D24]">{config.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{config.id} • {config.capacity}kg</span>
                </div>
                <Icon size={18} className={textColor} />
            </div>
            <div className="z-10 flex-1 flex flex-col justify-center gap-1 mt-1">
                {batch ? (
                    <>
                        <div className="text-center">
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>{statusText}</div>
                            <div className="text-xl font-mono font-bold text-[#1A1D24] leading-tight">
                                {batch.status === 'SOAKING' ? formatTime(elapsed) : (batch.status === 'FINISHED' ? 'READY' : '--:--')}
                            </div>
                        </div>
                        <div className="bg-white/60 px-1.5 py-0.5 rounded border border-white/50 text-[10px] truncate text-center font-bold text-gray-600">
                            {batch.batchId}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-300">
                        {isJobSelected ? (
                            <ArrowDownCircle size={28} className="mx-auto text-[#1A1D24] animate-bounce"/>
                        ) : (
                            <span className="text-[10px] font-mono opacity-50">AVAILABLE</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APPLICATION ---
export default function SoakingPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [batches, setBatches] = useState<any>({});
    
    // Queue & Logic States
    const [incomingJobs, setIncomingJobs] = useState([generateFreezerJob(), generateFreezerJob(), generateFreezerJob()]);
    const [packingQueue, setPackingQueue] = useState<any[]>([generatePackingJob(), generatePackingJob()]); 
    
    // History Log State
    const [historyLog, setHistoryLog] = useState<any[]>(() => {
        // Generate some initial history
        return Array.from({length: 5}, () => generateHistoryJob());
    });

    const [selectedQueueJob, setSelectedQueueJob] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTank, setSelectedTank] = useState<any>(null);
    const [tankSearch, setTankSearch] = useState('');
    const [activeModalTab, setActiveModalTab] = useState('new');
    
    // NEW: Modal Main Tab State (Control vs History)
    const [modalMainTab, setModalMainTab] = useState('control'); 

    // Packing Modal States
    const [packingModalOpen, setPackingModalOpen] = useState(false);
    const [selectedPackingJob, setSelectedPackingJob] = useState<any>(null);
    const [packingForm, setPackingForm] = useState({ product: '', lot: '', qty: '' });

    // Form
    const [form, setForm] = useState({
        batchId: '', product: '', weight: '', formulaIdx: 0, chemicalAmount: '', targetMinutes: 60, fromFreezer: ''
    });

    // Effects
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = useMemo(() => {
        const list: any[] = Object.values(batches);
        return {
            soaking: list.filter(b => b.status === 'SOAKING').length,
            finished: list.filter(b => b.status === 'FINISHED').length,
            waitingPack: packingQueue.length,
            chemicals: list.reduce((sum, b) => sum + (Number(b.chemicalAmount)||0), 0)
        };
    }, [batches, packingQueue]);

    const filteredTanks = useMemo(() => {
        if (!tankSearch) return TANKS_CONFIG;
        return TANKS_CONFIG.filter(t => t.id.toLowerCase().includes(tankSearch.toLowerCase()) || t.name.includes(tankSearch));
    }, [tankSearch]);

    // Logic Functions
    const handleJobSelect = (job: any) => {
        if (selectedQueueJob?.id === job.id) setSelectedQueueJob(null);
        else {
            setSelectedQueueJob(job);
            if (activeTab !== 'tanks') {
                setActiveTab('tanks');
                Swal.fire({ title: 'Select Tank', text: `Please select an empty tank for ${job.id}`, icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            }
        }
    };

    const handlePackingClick = (job: any) => {
        setSelectedPackingJob(job);
        setPackingForm({
            product: job.product, // Pre-fill
            lot: `L-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.floor(Math.random()*900)+100}`, // Auto Gen Lot
            qty: job.weight
        });
        setPackingModalOpen(true);
    };

    const handleConfirmPack = () => {
        if (!packingForm.product || !packingForm.lot || !packingForm.qty) {
            return Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
        }
        
        const packQty = parseFloat(packingForm.qty);
        const currentQty = parseFloat(selectedPackingJob.weight);

        if (packQty <= 0) {
                return Swal.fire('ข้อมูลผิดพลาด', 'จำนวนต้องมากกว่า 0', 'warning');
        }

        const remainingQty = currentQty - packQty;

        // Create History Entry
        const historyEntry = {
            startTime: selectedPackingJob.outTime || new Date().toISOString(),
            batchId: selectedPackingJob.batchId,
            tankId: selectedPackingJob.tankId || '-',
            product: packingForm.product,
            chemicalAmount: selectedPackingJob.chemicalAmount || '-',
            status: 'PACKED',
            lotNo: packingForm.lot,
            packedQty: packQty
        };

        // Update History
        setHistoryLog(prev => [historyEntry, ...prev]);

        if (remainingQty <= 0) {
            // Fully packed or over-packed -> Remove from queue
            setPackingQueue(prev => prev.filter(j => j.batchId !== selectedPackingJob.batchId));
            Swal.fire({ 
                icon: 'success', 
                title: 'แพ็คสินค้าครบถ้วน', 
                text: `Lot: ${packingForm.lot}, แพ็คไป: ${packQty}kg (หมด)`,
                timer: 1500, 
                showConfirmButton: false 
            });
        } else {
            // Partial pack -> Update queue with remaining quantity
            setPackingQueue(prev => prev.map(j => {
                if (j.batchId === selectedPackingJob.batchId) {
                    return { ...j, weight: remainingQty };
                }
                return j;
            }));
            Swal.fire({ 
                icon: 'success', 
                title: 'แพ็คสินค้าบางส่วน', 
                text: `Lot: ${packingForm.lot}, แพ็คไป: ${packQty}kg, คงเหลือ: ${remainingQty}kg`,
                timer: 1500, 
                showConfirmButton: false 
            });
        }
        
        setPackingModalOpen(false);
    };

    const handleCardClick = (tank: any, batch: any) => {
        setSelectedTank(tank);
        setModalMainTab('control'); // Reset tab to Control

        if (batch) {
            setForm({ ...batch, formulaIdx: 0 });
            setActiveModalTab('status');
        } else if (selectedQueueJob) {
            const df = FORMULA_OPTIONS[0];
            setForm({
                batchId: selectedQueueJob.id, product: selectedQueueJob.product, weight: selectedQueueJob.weight,
                formulaIdx: 0, chemicalAmount: String(df.chem), targetMinutes: df.time, fromFreezer: selectedQueueJob.from
            });
            setActiveModalTab('new');
        } else {
            const df = FORMULA_OPTIONS[0];
            setForm({
                batchId: `B-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${tank.id}`,
                product: 'วุ้นเส้นสด', weight: String(tank.capacity),
                formulaIdx: 0, chemicalAmount: String(df.chem), targetMinutes: df.time, fromFreezer: ''
            });
            setActiveModalTab('new');
        }
        setModalOpen(true);
    };

    const handleStart = () => {
        if(!form.batchId || !form.chemicalAmount) return Swal.fire('Error', 'Missing Data', 'warning');
        setIncomingJobs(prev => prev.filter(j => j.id !== form.batchId));
        if (selectedQueueJob?.id === form.batchId) setSelectedQueueJob(null);
        setBatches((prev: any) => ({ ...prev, [selectedTank.id]: { ...form, tankId: selectedTank.id, status: 'SOAKING', startTime: new Date().toISOString() } }));
        setModalOpen(false);
    };

    const handleFinish = () => {
        setBatches((prev: any) => ({ ...prev, [selectedTank.id]: { ...prev[selectedTank.id], status: 'FINISHED', finishTime: new Date().toISOString() } }));
        setModalOpen(false);
    };

    const handleClear = () => {
        const finishedBatch = batches[selectedTank.id];
        // Record basic info for packing queue
        setPackingQueue(prev => [...prev, { 
            ...finishedBatch, 
            outTime: new Date().toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) 
        }]);
        
        const newBatches = { ...batches };
        delete newBatches[selectedTank.id];
        setBatches(newBatches);
        setModalOpen(false);
    };

    const handleFormulaChange = (idx: number) => {
        const f = FORMULA_OPTIONS[idx];
        setForm({ ...form, formulaIdx: idx, chemicalAmount: String(f.chem), targetMinutes: f.time });
    };

    const selectFromQueue = (job: any) => {
        const df = FORMULA_OPTIONS[0];
        setForm({
            batchId: job.id, product: job.product, weight: job.weight,
            formulaIdx: 0, chemicalAmount: String(df.chem), targetMinutes: df.time, fromFreezer: job.from
        });
        setActiveModalTab('new');
    };

    const handlePrint = () => window.print();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#D9D9D9] text-[#4A5568]">
            {/* Background Decorations */}
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#B91C1C]/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#B91C1C]/5 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F4F3EF]">
                
                {/* Top Bar (No Sidebar style) */}
                <header className="h-20 px-8 flex items-center justify-between z-10 no-print">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A1D24] to-[#1A1D24] flex items-center justify-center shadow-lg text-white">
                            <Waves size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#1A1D24] uppercase tracking-tight">Sulfur <span className="text-[#1A1D24]">Control</span></h2>
                            <p className="text-xs text-gray-500 font-mono mt-0.5 tracking-wider">MES MODULE • S1-S100</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Navigation Tabs */}
                        <div className="flex bg-white/60 p-1 rounded-xl backdrop-blur-sm border border-white/50 shadow-inner">
                            <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/30' : 'text-gray-500 hover:text-[#1A1D24] hover:bg-white/50'}`}>
                                <LayoutDashboard size={16} /> DASHBOARD
                            </button>
                            <button onClick={() => setActiveTab('tanks')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'tanks' ? 'bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/30' : 'text-gray-500 hover:text-[#1A1D24] hover:bg-white/50'}`}>
                                <Grid3x3 size={16} /> TANKS
                            </button>
                            <button onClick={() => setActiveTab('report')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/30' : 'text-gray-500 hover:text-[#1A1D24] hover:bg-white/50'}`}>
                                <FileText size={16} /> REPORT
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6 custom-scrollbar relative z-0">
                    
                    {/* TAB 1: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <GlassCard className="flex items-center justify-between group hover:border-[#B91C1C]/30">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Soaking Active</p>
                                        <h3 className="text-3xl font-extrabold text-[#B91C1C] mt-1">{stats.soaking} <span className="text-sm text-gray-400 font-normal">Batches</span></h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/10 flex items-center justify-center text-[#B91C1C] group-hover:scale-110 transition-transform">
                                        <Waves size={24} />
                                    </div>
                                </GlassCard>
                                <GlassCard className="flex items-center justify-between group hover:border-[#1A1D24]/30">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Today</p>
                                        <h3 className="text-3xl font-extrabold text-[#1A1D24] mt-1">{stats.finished} <span className="text-sm text-gray-400 font-normal">Batches</span></h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#1A1D24]/10 flex items-center justify-center text-[#1A1D24] group-hover:scale-110 transition-transform">
                                        <CheckCircle size={24} />
                                    </div>
                                </GlassCard>
                                <GlassCard className="flex items-center justify-between group hover:border-[#D97706]/30">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chemical Usage</p>
                                        <h3 className="text-3xl font-extrabold text-[#D97706] mt-1">{stats.chemicals} <span className="text-sm text-gray-400 font-normal">g</span></h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 flex items-center justify-center text-[#D97706] group-hover:scale-110 transition-transform">
                                        <FlaskConical size={24} />
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Workflow */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                                {/* Inbound */}
                                <GlassCard className={`flex flex-col h-full overflow-hidden transition-all ${selectedQueueJob ? 'border-[#B91C1C] ring-2 ring-[#B91C1C]/20' : ''}`}>
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <h3 className="font-bold text-[#1A1D24] flex items-center gap-2">
                                            <Snowflake size={18} className="text-[#B91C1C]" /> Waiting for Soak
                                        </h3>
                                        <span className="bg-[#B91C1C]/10 text-[#B91C1C] text-xs px-2 py-0.5 rounded-full font-bold">{incomingJobs.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {incomingJobs.map((job, idx) => (
                                            <div key={idx} onClick={() => handleJobSelect(job)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedQueueJob?.id === job.id ? 'bg-[#B91C1C]/5 border-[#B91C1C] shadow-md' : 'bg-white border-gray-100 hover:border-[#B91C1C]/50'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-[#1A1D24] text-sm">{job.id}</span>
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">From {job.from}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>{job.product} ({job.weight}kg)</span>
                                                    <span className="font-mono">{job.timeOut}</span>
                                                </div>
                                                {selectedQueueJob?.id === job.id && (
                                                    <div className="mt-2 text-center text-[10px] font-bold text-[#B91C1C] bg-white rounded py-1 border border-[#B91C1C]/20 animate-pulse">
                                                        Selected &bull; Go to Tanks tab
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {incomingJobs.length === 0 && <div className="text-center text-gray-400 text-sm py-10">No pending jobs</div>}
                                    </div>
                                    <button onClick={() => setIncomingJobs(p => [...p, generateFreezerJob()])} className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-lg border border-dashed border-gray-300">
                                        + Simulate Incoming Job
                                    </button>
                                </GlassCard>

                                {/* Outbound */}
                                <GlassCard className="flex flex-col h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <h3 className="font-bold text-[#1A1D24] flex items-center gap-2">
                                            <Package size={18} className="text-[#B91C1C]" /> Ready to Pack
                                        </h3>
                                        <span className="bg-[#B91C1C]/10 text-[#B91C1C] text-xs px-2 py-0.5 rounded-full font-bold">{packingQueue.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {packingQueue.map((job, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => handlePackingClick(job)}
                                                className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex justify-between items-center cursor-pointer hover:border-[#B91C1C]/50 hover:bg-amber-50 transition-all group"
                                            >
                                                <div>
                                                    <p className="font-bold text-[#1A1D24] text-sm group-hover:text-[#B91C1C] transition-colors">{job.batchId}</p>
                                                    <p className="text-xs text-gray-500">{job.product} ({job.weight}kg)</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] bg-[#1A1D24]/10 text-[#1A1D24] px-2 py-0.5 rounded-full font-bold">COMPLETED</span>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-1">{job.outTime}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TANKS */}
                    {activeTab === 'tanks' && (
                        <div className="flex flex-col h-full animate-fadeIn">
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search Tank ID..." 
                                        className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/50 shadow-sm bg-white/60"
                                        value={tankSearch}
                                        onChange={e => setTankSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 text-xs font-bold text-gray-500 bg-white/40 p-1.5 rounded-lg border border-white/50">
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white"><span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span> Active</span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white"><span className="w-2 h-2 rounded-full bg-[#1A1D24]"></span> Done</span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white"><span className="w-2 h-2 rounded-full bg-gray-200 border border-gray-300"></span> Empty</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-10">
                                {filteredTanks.map(tank => (
                                    <TankCard 
                                        key={tank.id} 
                                        config={tank} 
                                        batch={batches[tank.id]} 
                                        onAction={handleCardClick}
                                        isJobSelected={!!selectedQueueJob}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: REPORT */}
                    {activeTab === 'report' && (
                        <div className="flex justify-center animate-fadeIn pb-10">
                            <div id="printable-report" className="bg-white w-full max-w-[210mm] min-h-[297mm] p-10 shadow-2xl text-[#1A1D24]">
                                <div className="flex justify-between items-start mb-8 border-b-2 border-[#1A1D24] pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#1A1D24] text-white flex items-center justify-center rounded-lg">
                                            <ClipboardList size={24}/>
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold uppercase tracking-wide">Production Log</h1>
                                            <p className="text-xs text-gray-500">Sulfur Soaking Department</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-gray-500 mt-1">Date: {new Date().toLocaleDateString('th-TH')}</p>
                                        <button onClick={handlePrint} className="mt-2 bg-gray-100 hover:bg-gray-200 text-[#1A1D24] text-xs px-3 py-1 rounded no-print flex items-center gap-1 ml-auto">
                                            <Printer size={12}/> Print
                                        </button>
                                    </div>
                                </div>

                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-100 text-gray-600 font-mono uppercase tracking-wider">
                                        <tr>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Batch ID</th>
                                            <th className="p-3">Tank</th>
                                            <th className="p-3">Product</th>
                                            <th className="p-3 text-right">Chemical (g)</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-mono">
                                        {Object.values(batches).map((b: any, i) => (
                                            <tr key={i}>
                                                <td className="p-3">{new Date(b.startTime).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</td>
                                                <td className="p-3 font-bold">{b.batchId}</td>
                                                <td className="p-3">{b.tankId}</td>
                                                <td className="p-3">{b.product}</td>
                                                <td className="p-3 text-right">{b.chemicalAmount}</td>
                                                <td className="p-3 text-center"><span className="font-bold text-[#B91C1C]">{b.status}</span></td>
                                            </tr>
                                        ))}
                                        {packingQueue.map((b, i) => (
                                            <tr key={`q-${i}`} className="bg-amber-50/50">
                                                <td className="p-3">{b.outTime}</td>
                                                <td className="p-3 font-bold">{b.batchId}</td>
                                                <td className="p-3">{b.tankId || '-'}</td>
                                                <td className="p-3">{b.product}</td>
                                                <td className="p-3 text-right">{b.chemicalAmount || '-'}</td>
                                                <td className="p-3 text-center"><span className="font-bold text-amber-600">WAIT PACK</span></td>
                                            </tr>
                                        ))}
                                        {historyLog.map((b, i) => (
                                            <tr key={`h-${i}`} className="opacity-50 bg-gray-50 grayscale">
                                                <td className="p-3">{b.startTime ? new Date(b.startTime).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : '-'}</td>
                                                <td className="p-3 font-bold">{b.batchId}</td>
                                                <td className="p-3">{b.tankId}</td>
                                                <td className="p-3">{b.product}</td>
                                                <td className="p-3 text-right">{b.chemicalAmount}</td>
                                                <td className="p-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
                                                        PACKED (Lot: {b.lotNo})
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* MODAL 1: TANK CONTROL */}
            {modalOpen && selectedTank && (
                <div className="fixed inset-0 bg-[#1A1D24]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setModalOpen(false)}>
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#1A1D24] p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-lg"><Settings2 size={20}/></div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedTank.name}</h3>
                                    <p className="text-xs text-gray-400 font-mono">Status: {batches[selectedTank.id] ? batches[selectedTank.id].status : 'Empty'}</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)}><X size={24} className="text-gray-400 hover:text-white"/></button>
                        </div>

                        {/* NEW: Modal Tab Navigation */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setModalMainTab('control')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${modalMainTab === 'control' ? 'text-[#B91C1C] border-b-2 border-[#B91C1C] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Sliders size={14}/> Control
                                </div>
                            </button>
                            <button
                                onClick={() => setModalMainTab('history')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${modalMainTab === 'history' ? 'text-[#B91C1C] border-b-2 border-[#B91C1C] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <History size={14}/> History Log
                                </div>
                            </button>
                        </div>

                        <div className="p-6">
                            {modalMainTab === 'control' ? (
                                batches[selectedTank.id] ? (
                                    <div className="text-center space-y-4">
                                        {batches[selectedTank.id].status !== 'FINISHED' ? (
                                            <>
                                                <div className="w-20 h-20 mx-auto bg-[#B91C1C]/10 rounded-full flex items-center justify-center text-[#B91C1C] relative overflow-hidden border-4 border-[#B91C1C]/20">
                                                    <Waves size={32} className="relative z-10 animate-pulse"/>
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-[#1A1D24]">Processing...</h2>
                                                    <p className="text-sm text-gray-500">{batches[selectedTank.id].batchId}</p>
                                                </div>
                                                <button onClick={handleFinish} className="w-full bg-gray-100 hover:bg-[#1A1D24] hover:text-white text-gray-600 font-bold py-3 rounded-xl transition-all">Finish Job</button>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={56} className="text-[#1A1D24] mx-auto"/>
                                                <h2 className="text-xl font-bold text-[#1A1D24]">Finished</h2>
                                                <p className="text-sm text-gray-500">Ready to move to Packing</p>
                                                <button onClick={handleClear} className="w-full bg-[#1A1D24] hover:bg-[#1A1D24] text-white font-bold py-3 rounded-xl shadow-lg mt-2">Clear Tank & Send</button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                            <button onClick={() => setActiveModalTab('queue')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeModalTab === 'queue' ? 'bg-white text-[#1A1D24] shadow-sm' : 'text-gray-500'}`}>Select Queue</button>
                                            <button onClick={() => setActiveModalTab('new')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeModalTab === 'new' ? 'bg-white text-[#1A1D24] shadow-sm' : 'text-gray-500'}`}>Manual Entry</button>
                                        </div>
                                        {activeModalTab === 'new' && (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <div className="flex-1"><label className="text-[10px] font-bold text-gray-500 uppercase">Batch ID</label><input type="text" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} className="w-full border rounded-lg p-2 font-mono text-sm bg-gray-50" /></div>
                                                    {form.fromFreezer && <div className="text-right"><label className="text-[10px] font-bold text-gray-500 uppercase block">From</label><span className="text-xs bg-[#B91C1C]/10 text-[#B91C1C] px-2 py-1 rounded inline-block mt-1 font-bold">{form.fromFreezer}</span></div>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase">Product</label><input type="text" value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full border rounded-lg p-2 text-sm" /></div>
                                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase">Weight (Kg)</label><input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full border rounded-lg p-2 text-sm" /></div>
                                                </div>
                                                <div className="bg-[#D97706]/10 p-3 rounded-xl border border-[#D97706]/20">
                                                    <label className="text-[10px] font-bold text-[#D97706] uppercase flex items-center gap-1 mb-2"><FlaskConical size={12}/> Chemical Mix</label>
                                                    <div className="space-y-2">
                                                        <select className="w-full border rounded p-1.5 text-xs" onChange={(e) => handleFormulaChange(e.target.selectedIndex)} value={form.formulaIdx}>{FORMULA_OPTIONS.map((f, i) => <option key={i} value={i}>{f.name}</option>)}</select>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1"><span className="text-[9px] text-gray-500">Amount (g)</span><input type="number" value={form.chemicalAmount} onChange={e => setForm({...form, chemicalAmount: e.target.value})} className="w-full border rounded p-1.5 text-center font-bold text-[#1A1D24] text-sm"/></div>
                                                            <div className="flex-1"><span className="text-[9px] text-gray-500">Time (Min)</span><input type="number" value={form.targetMinutes} onChange={e => setForm({...form, targetMinutes: e.target.value})} className="w-full border rounded p-1.5 text-center font-bold text-[#B91C1C] text-sm"/></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={handleStart} className="w-full bg-[#B91C1C] hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"><Play size={16}/> Start Soaking</button>
                                            </div>
                                        )}
                                        {activeModalTab === 'queue' && (
                                            <div className="space-y-2 max-h-48 overflow-y-auto queue-scroll pr-1">
                                                {incomingJobs.map((job) => (
                                                    <div key={job.id} onClick={() => selectFromQueue(job)} className="p-3 border rounded-lg hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all flex justify-between items-center group">
                                                        <div>
                                                            <div className="text-xs font-bold text-grandNavy">{job.id}</div>
                                                            <div className="text-[10px] text-slate-500">{job.product} • {job.weight}kg</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono block mb-1">From {job.from}</span>
                                                            <ArrowRightCircle size={16} className="text-red-400 opacity-0 group-hover:opacity-100 ml-auto"/>
                                                        </div>
                                                    </div>
                                                ))}
                                                {incomingJobs.length === 0 && <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-xl">ไม่มีงานในคิว</div>}
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="space-y-0">
                                    {historyLog.filter(h => h.tankId === selectedTank.id).length > 0 ? (
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {historyLog.filter(h => h.tankId === selectedTank.id).map((h, idx) => (
                                                <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm flex justify-between items-center hover:border-red-100 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-[#1A1D24]">{h.batchId}</span>
                                                            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded font-mono">Lot: {h.lotNo}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Clock size={10}/>
                                                            {new Date(h.startTime).toLocaleDateString('th-TH')} {new Date(h.startTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-[#1A1D24]">{h.product}</div>
                                                        <div className="text-[10px] text-gray-400">{h.chemicalAmount}g Chem</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-300">
                                            <History size={40} className="mx-auto mb-2 opacity-50"/>
                                            <p className="text-xs">No history for this tank</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: PACKING DETAILS */}
            {packingModalOpen && selectedPackingJob && (
                <div className="fixed inset-0 bg-[#B91C1C]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPackingModalOpen(false)}>
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-[#B91C1C]/20" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#B91C1C] p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-lg"><Package size={20}/></div>
                                <div>
                                    <h3 className="font-bold text-lg">Packing Process</h3>
                                    <p className="text-xs text-amber-100 font-mono">Final Step</p>
                                </div>
                            </div>
                            <button onClick={() => setPackingModalOpen(false)}><X size={24} className="text-amber-200 hover:text-white"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                <div className="text-xs text-gray-400 font-bold uppercase">Batch ID</div>
                                <div className="text-lg font-bold text-[#1A1D24] font-mono">{selectedPackingJob.batchId}</div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Finished Product Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2 text-sm font-bold text-[#1A1D24] focus:ring-2 focus:ring-[#B91C1C]/20 outline-none"
                                        value={packingForm.product}
                                        onChange={e => setPackingForm({...packingForm, product: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Lot No.</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-[#B91C1C]/20 outline-none"
                                            value={packingForm.lot}
                                            onChange={e => setPackingForm({...packingForm, lot: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Total Qty (Kg)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border rounded-lg p-2 text-sm text-center font-bold text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 outline-none"
                                            value={packingForm.qty}
                                            onChange={e => setPackingForm({...packingForm, qty: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleConfirmPack} className="w-full bg-[#B91C1C] hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2">
                                <CheckCircle size={18}/> Confirm Pack
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
