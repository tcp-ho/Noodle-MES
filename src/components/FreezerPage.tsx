import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Snowflake, Power, PauseCircle, ThermometerSun, Flame, PackageCheck, 
  AlertCircle, AlertTriangle, Box, CheckCircle, Plus, X, Settings2, 
  RefreshCw, Table2, LayoutGrid, PieChart, PlayCircle, PlusCircle, 
  LogOut, Server, Clock
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';

Chart.register(...registerables);

// --- CONSTANTS ---
const F_SERIES = Array.from({length: 6}, (_, i) => ({ id: `F${Math.floor(i/2)+1}/${i%2+1}`, name: `F${Math.floor(i/2)+1}/${i%2+1}`, model: 'F', stdHrs: 38, thawHrs: 5, maxBatch: 8 }));
const C_SERIES = Array.from({length: 5}, (_, i) => ({ id: `C${i+1}`, name: `C${i+1}`, model: 'C', stdHrs: 25, thawHrs: 4, maxBatch: 1.6 }));
const R_SERIES = Array.from({length: 8}, (_, i) => ({ id: `R${i+1}`, name: `R${i+1}`, model: 'R', stdHrs: 48, thawHrs: 4, maxBatch: 2 }));
const FREEZER_MASTER_CONFIG = [...F_SERIES, ...C_SERIES, ...R_SERIES];
const INITIAL_FREEZERS = FREEZER_MASTER_CONFIG;

const FORMULA_OPTIONS = ["Fresh Vermicelli", "Dried Vermicelli", "Glass Noodle", "Kelp Noodle", "Instant TomYum", "Instant Pork", "Rice Stick", "Egg Noodle", "3/6", "9/2", "5/8", "MB100"];

// --- HELPER FUNCTIONS ---
const normalizeStatus = (status: string) => {
    if (!status) return 'EMPTY';
    const s = String(status).toUpperCase().trim();
    if (s.includes('WAIT') && s.includes('START')) return 'WAITING_START';
    if (s.includes('FREEZ') || s.includes('RUNNING')) return 'FREEZING';
    if (s.includes('PAUSE')) return 'PAUSED';
    if (s.includes('WAIT') && s.includes('THAW')) return 'WAITING_THAW';
    if (s.includes('THAW')) return 'THAWING';
    if (s.includes('UNLOAD')) return 'WAITING_UNLOAD';
    return 'EMPTY';
};

const getRealStatus = (b: any, c: any) => { 
    if (!b) return 'EMPTY'; 
    const stdThawHrs = c?.thawHrs || 4;
    const base = normalizeStatus(b.status);
    if (base === 'THAWING') {
        const start = new Date(b.thawStartTime || b.startTime).getTime();
        if ((Date.now() - start) >= stdThawHrs * 3600000) return 'WAITING_UNLOAD';
    }
    return base; 
};

const checkOverdue = (b: any, c: any) => {
    if (!b) return false;
    const s = normalizeStatus(b.status);
    if (s !== 'FREEZING' && s !== 'PAUSED') return false;
    return (Date.now() - new Date(b.startTime).getTime()) > c.stdHrs * 3600000;
};

const calculateCurrentLoad = (json: any) => { 
    try { 
        if(!json) return 0;
        const list = typeof json === 'string' ? JSON.parse(json) : json;
        return Array.isArray(list) ? list.reduce((s,i)=>s+(parseFloat(i.qty)||0),0)||0 : 0; 
    } catch(e){ return 0; } 
};

const calculateFinishTime = (s: string, h: number) => s ? new Date(new Date(s).getTime() + h*3600000).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : '-';

const getElapsedTimeDisplay = (s: string) => {
    if(!s) return '-';
    const diff = Date.now() - new Date(s).getTime();
    if (diff < 0) return '0m';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
};

const getFormulaText = (b: any) => {
    try {
        const f = typeof b.formulas === 'string' ? JSON.parse(b.formulas) : b.formulas;
        const total = f.reduce((s: number, i: any)=>s+Number(i.qty),0);
        return f.length > 0 ? `${f[0].name} (${total})` : '-';
    } catch(e) { return '-'; }
};

const getChipStyle = (model: string) => {
     const colors: Record<string, { bg: string; text: string; border: string }> = {
         'F': { bg: '#93BBBF', text: '#1F5373', border: '#7A9A9E' },
         'C': { bg: '#BFA3AA', text: '#5E2C36', border: '#9E868C' },
         'R': { bg: '#A69B63', text: '#3E3A24', border: '#8A8152' }
     };
     return colors[model] || { bg: '#ddd', text: '#333', border: '#ccc' };
};

// --- COMPONENTS ---
const SummaryCard = ({ title, value, colorClass, icon: Icon, textColor }: any) => (
    <div className={`p-4 rounded-xl border flex flex-col justify-between h-24 transition-all hover:shadow-lg ${colorClass} bg-white relative overflow-hidden group`}>
         <div className="absolute -right-3 -bottom-3 opacity-[0.1] transform rotate-12 group-hover:scale-110 transition-all duration-500 pointer-events-none">
            <Icon size={60} className={textColor} />
        </div>
        <div className="flex justify-between items-start z-10">
            <span className={`text-[10px] font-bold uppercase tracking-wider opacity-90 ${textColor || 'text-slate-600'}`}>{title}</span>
            <Icon size={18} className={`${textColor || 'text-slate-400'} opacity-80`}/>
        </div>
        <h3 className={`text-2xl font-extrabold tracking-tight font-mono z-10 ${textColor || 'text-[#1A1D24]'}`}>{value}</h3>
    </div>
);

const FreezingSummary = ({ stats }: any) => {
     return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 shrink-0">
             <SummaryCard title="Available" value={stats.available} colorClass="border-[#1A1D24]/30 bg-[#1A1D24]/5" textColor="text-[#1A1D24]" icon={CheckCircle}/>
             <SummaryCard title="Wait Start" value={stats.waitingStart} colorClass="border-[#D97706]/30 bg-[#D97706]/5" textColor="text-[#D97706]" icon={Power}/>
             <SummaryCard title="Freezing" value={stats.freezing} colorClass="border-[#B91C1C]/30 bg-[#B91C1C]/5" textColor="text-[#B91C1C]" icon={Snowflake}/>
             <SummaryCard title="Refreeze" value={stats.refreeze} colorClass="border-[#BF344D]/30 bg-[#BF344D]/5" textColor="text-[#BF344D]" icon={AlertTriangle}/>
             <SummaryCard title="Wait Thaw" value={stats.waitingThaw} colorClass="border-[#8EA3BF]/30 bg-[#8EA3BF]/5" textColor="text-[#8EA3BF]" icon={ThermometerSun}/>
             <SummaryCard title="Thawing" value={stats.thawing} colorClass="border-[#B91C1C]/30 bg-[#B91C1C]/5" textColor="text-[#B91C1C]" icon={Flame}/>
             <SummaryCard title="Wait Unload" value={stats.waitingUnload} colorClass="border-[#1A1D24]/30 bg-[#1A1D24]/5" textColor="text-[#1A1D24]" icon={PackageCheck}/>
             <SummaryCard title="Total" value={stats.total} colorClass="border-slate-300 bg-slate-50" textColor="text-slate-600" icon={Server}/>
        </div>
    );
};

const StatusBadge = ({ status, overdue }: any) => {
    let badgeClass = 'bg-gray-100 text-gray-400 border-gray-200';
    let label = status;

    if(overdue) {
        badgeClass = 'bg-red-100 text-red-700 border-red-200 animate-pulse';
        label = '! Overdue';
    } else {
         switch(status) {
            case 'WAITING_START': badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200'; label = 'Wait Start'; break;
            case 'FREEZING': badgeClass = 'bg-red-100 text-red-800 border-red-200'; label = 'Freezing'; break;
            case 'PAUSED': badgeClass = 'bg-slate-200 text-slate-700 border-slate-300'; label = 'Paused'; break;
            case 'WAITING_THAW': badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'; label = 'Wait Thaw'; break;
            case 'THAWING': badgeClass = 'bg-slate-100 text-slate-700 border-slate-200 animate-pulse'; label = 'Thawing'; break;
            case 'WAITING_UNLOAD': badgeClass = 'bg-slate-100 text-slate-700 border-slate-200'; label = 'Wait Unload'; break;
            case 'EMPTY': label = 'Empty'; break;
        }
    }
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono whitespace-nowrap ${badgeClass}`}>{label}</span>;
};

const FreezerCard = ({ config, activeData, onSelect }: any) => {
    const activeBatch = activeData.find((d: any) => String(d.freezerId) === String(config.id));
    const realStatus = getRealStatus(activeBatch, config);
    const isOverdue = checkOverdue(activeBatch, config);
    const maxBatch = parseFloat(config.maxBatch) || 0;
    const currentLoad = activeBatch ? calculateCurrentLoad(activeBatch.formulas) : 0;
    const availableSpace = Math.max(0, maxBatch - currentLoad);
    const spaceDisplay = availableSpace === 0 ? '0' : parseFloat(availableSpace.toFixed(1));
    const formulaText = getFormulaText(activeBatch || {});
    const chipStyle = getChipStyle(config.model);

    let statusConfig = { label: "���่าง", style: "bg-white border-slate-200 hover:border-red-300", icon: Box, pulse: false };

    if (activeBatch) {
        if (isOverdue) {
            statusConfig = { label: "เกินเวลา!", style: "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200", icon: AlertTriangle, pulse: true };
        } else {
            switch(realStatus) {
                case 'WAITING_START':  statusConfig = { label: "รอเปิดเครื่อง", style: "bg-yellow-50 border-yellow-400 shadow-md", icon: Power, pulse: true }; break;
                case 'FREEZING':       statusConfig = { label: "Freeze", style: "bg-[#FEE2E2] border-red-400 shadow-md text-[#B91C1C]", icon: Snowflake, pulse: false }; break;
                case 'PAUSED':         statusConfig = { label: "หยุดชั่วคราว", style: "bg-slate-100 border-slate-400 text-slate-700", icon: PauseCircle, pulse: false }; break;
                case 'WAITING_THAW':   statusConfig = { label: "รอละลาย", style: "bg-[#FEF2F2] border-[#FCA5A5] text-[#FCA5A5]", icon: ThermometerSun, pulse: false }; break;
                case 'THAWING':        statusConfig = { label: "กำลังละลาย", style: "bg-slate-50 border-slate-400 text-slate-700 shadow-md", icon: Flame, pulse: true }; break;
                case 'WAITING_UNLOAD': statusConfig = { label: "รอเอาออก", style: "bg-slate-50 border-slate-500 text-slate-700 shadow-lg ring-2 ring-slate-200", icon: PackageCheck, pulse: true }; break;
                default: break;
            }
        }
    }

    return (
        <div 
            onClick={() => onSelect(config)} 
            className={`relative rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer h-full flex flex-col justify-between ${statusConfig.style} ${statusConfig.pulse ? 'animate-pulse' : ''}`}
        >
            {activeBatch && activeBatch.refreezeReason && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-md z-10 animate-bounce" title="Refreeze">
                    <AlertCircle size={14} />
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                 <div 
                    className="px-3 py-1 rounded-lg border text-sm shadow-sm flex items-center justify-center min-w-[3.5rem] font-bold" 
                    style={{ backgroundColor: chipStyle.bg, color: chipStyle.text, borderColor: chipStyle.border }}
                >
                    {config.name}
                </div>
                <div className="text-right flex flex-col items-end">
                    <statusConfig.icon size={20} className="opacity-70 mb-1" />
                    {activeBatch ? (
                        <span className={`text-[10px] font-bold ${availableSpace <= 0.2 ? 'text-red-500' : 'text-emerald-700'}`}>เหลือ {spaceDisplay}</span>
                    ) : (
                        <span className="text-[10px] font-bold text-emerald-700">ว่าง {maxBatch}</span>
                    )}
                </div>
            </div>
            
            <div className="space-y-1">
                {activeBatch ? (
                    <div className="bg-white/60 rounded-lg p-2 text-xs space-y-1">
                        <div className="text-center mb-1">
                            <span className="font-bold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-black/5 text-[10px]">
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">สูตร:</span>
                            <span className="font-bold text-red-800 truncate max-w-[80px]" title={formulaText}>{formulaText}</span>
                        </div>
                        {realStatus === 'THAWING' ? (
                            <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1 mt-1">
                                <span>เสร็จ:</span>
                                <span>{calculateFinishTime(activeBatch.thawStartTime || activeBatch.startTime, config.thawHrs)}</span>
                            </div>
                        ) : (realStatus === 'WAITING_UNLOAD' ? (
                            <div className="text-center text-slate-700 font-bold border-t border-slate-200 pt-1 mt-1">พร้อมเอาของออก</div>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">เริ่ม:</span>
                                    <span className="font-medium">{activeBatch.startTime ? new Date(activeBatch.startTime).toLocaleTimeString('th-TH', {hour:'2-digit',minute:'2-digit'}) : '-'}</span>
                                </div>
                                {!isOverdue && realStatus === 'FREEZING' && (
                                    <div className="flex justify-between border-t border-dashed pt-1 mt-1">
                                        <span className="text-slate-600 font-bold">เสร็จ:</span>
                                        <span className="font-bold text-red-700">{calculateFinishTime(activeBatch.startTime, config.stdHrs)}</span>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">
                        <div className="flex justify-center mb-1 opacity-20"><Box size={32}/></div>
                        <p>ว่าง</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardCharts = ({ stats }: any) => {
    const utilChartRef = useRef<HTMLCanvasElement>(null);
    const statusChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{util?: Chart, status?: Chart}>({});

    useEffect(() => {
        Chart.defaults.font.family = "'JetBrains Mono', 'Noto Sans Thai', sans-serif";

        if (chartInstances.current.util) chartInstances.current.util.destroy();
        if (chartInstances.current.status) chartInstances.current.status.destroy();

        if (utilChartRef.current && statusChartRef.current) {
            const utilChart = new Chart(utilChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['F Series', 'C Series', 'R Series'],
                    datasets: [{ label: 'Usage %', data: [85, 60, 45], backgroundColor: ['#1A1D24', '#B91C1C', '#B91C1C'], borderRadius: 4 }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
            });

            const statusChart = new Chart(statusChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Freezing', 'Thawing', 'Waiting', 'Empty'],
                    datasets: [{ data: [stats.freezing, stats.thawing, stats.waitingStart + stats.waitingThaw + stats.waitingUnload, stats.available], backgroundColor: ['#B91C1C', '#B91C1C', '#D97706', '#E2E8F0'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
            });
            
            chartInstances.current = { util: utilChart, status: statusChart };
        }

        return () => {
            if (chartInstances.current.util) chartInstances.current.util.destroy();
            if (chartInstances.current.status) chartInstances.current.status.destroy();
        };
    }, [stats]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 h-full min-h-[300px]">
             <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-soft rounded-2xl p-6 flex flex-col h-full min-h-0">
                <h3 className="font-bold text-[#1A1D24] text-sm mb-4 shrink-0">Utilization Rate</h3>
                <div className="flex-1 relative w-full min-h-0"><canvas ref={utilChartRef}></canvas></div>
            </div>
            <div className="bg-white/85 backdrop-blur-xl border border-white/90 shadow-soft rounded-2xl p-6 flex flex-col h-full min-h-0">
                <h3 className="font-bold text-[#1A1D24] text-sm mb-4 shrink-0">Status Distribution</h3>
                <div className="flex-1 relative w-full flex justify-center min-h-0"><canvas ref={statusChartRef}></canvas></div>
            </div>
        </div>
    );
};

const AddFreezerModal = ({ isOpen, onClose, onAdd }: any) => {
    const [form, setForm] = useState({ name: '', model: 'F', stdHrs: '38', thawHrs: '5', maxBatch: '8' });
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-[#1A1D24] mb-4">เพิ่มตู้แช่ใหม่</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500">ชื่อตู้ (ID)</label>
                        <input className="w-full border rounded p-2 text-sm" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Ex. F9/1"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">รุ่น (Model)</label>
                        <select className="w-full border rounded p-2 text-sm" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}>
                            <option value="F">F Series</option><option value="C">C Series</option><option value="R">R Series</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div><label className="text-[10px] text-gray-500">Std Time</label><input type="number" className="w-full border rounded p-2 text-sm" value={form.stdHrs} onChange={e=>setForm({...form, stdHrs:e.target.value})}/></div>
                        <div><label className="text-[10px] text-gray-500">Thaw Time</label><input type="number" className="w-full border rounded p-2 text-sm" value={form.thawHrs} onChange={e=>setForm({...form, thawHrs:e.target.value})}/></div>
                        <div><label className="text-[10px] text-gray-500">Max Batch</label><input type="number" className="w-full border rounded p-2 text-sm" value={form.maxBatch} onChange={e=>setForm({...form, maxBatch:e.target.value})}/></div>
                    </div>
                    <button onClick={() => { onAdd(form); onClose(); }} className="w-full bg-[#1A1D24] text-white font-bold py-2 rounded-lg mt-2">ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

const RenderModalContent = ({ 
    selectedFreezer, currentBatch,
    hgForm, mnForm, handleAction, setMnForm, 
    addFormulaRow, removeFormulaRow, updateFormula,
    addMode, setAddMode, newItems, setNewItems, removedQty, setRemovedQty
}: any) => {
    const status = getRealStatus(currentBatch, selectedFreezer);
    const canHg = true; // Simulating roles
    const canMn = true;
    const canSu = true;

    // 1. HG Load
    if (!currentBatch) {
        if (!canHg) return <div className="text-center text-red-500 py-4">สำหรับพนักงาน HG เท่านั้น</div>;
        const currentTotal = hgForm.reduce((sum: number, item: any) => sum + (Number(item.qty) || 0), 0);
        const max = Number(selectedFreezer.maxBatch) || 0;
        const isExceeded = currentTotal > max;

        return (
            <div className="space-y-4">
                 <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-yellow-800 text-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold flex items-center gap-2"><Box size={14}/> Capacity Control</span>
                        <span className={`font-bold ${isExceeded ? 'text-red-600' : 'text-emerald-700'}`}>{currentTotal} / {max} Batch</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${isExceeded ? 'bg-red-500' : 'bg-emerald-600'}`} style={{width: `${max > 0 ? Math.min((currentTotal/max)*100, 100) : 0}%`}}></div>
                    </div>
                    {isExceeded && <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> จำนวนเกินความจุของตู้!</p>}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {hgForm.map((row: any, idx: number) => (
                         <div key={idx} className="flex gap-2 items-end">
                             <div className="flex-1">
                                <label className="text-xs text-slate-500">สูตร</label>
                                <select className="w-full border rounded p-2 text-sm" value={row.name} onChange={e => updateFormula(idx, 'name', e.target.value)}>
                                    {FORMULA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                             </div>
                             <div className="w-20">
                                 <label className="text-xs text-slate-500">จำนวน</label>
                                 <input type="number" className="w-full border rounded p-2 text-sm" value={row.qty} onChange={e => updateFormula(idx, 'qty', e.target.value)} placeholder="0"/>
                             </div>
                             {hgForm.length > 1 && <button onClick={() => removeFormulaRow(idx)} className="p-2 text-red-400 hover:text-red-600"><X size={16}/></button>}
                        </div>
                    ))}
                </div>
                <button onClick={addFormulaRow} className="text-sm text-red-700 font-bold flex items-center gap-1"><Plus size={14}/> เพิ่มรายการ</button>
                <button onClick={() => handleAction('HG_LOAD')} disabled={isExceeded} className={`w-full font-bold py-3 rounded-xl shadow-lg mt-2 ${isExceeded ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'}`}>บันทึกข้อมูล</button>
            </div>
        );
    }
    
    // 2. Waiting Start
    if (status === 'WAITING_START') {
         const formulas = JSON.parse(currentBatch.formulas || '[]').map((f: any)=>`${f.name}(${f.qty})`).join(', ');
         if (!canMn) return <div className="text-center py-4 bg-slate-50 rounded border-dashed text-slate-500">รอ MN เปิดเครื่อง...<br/>{formulas}</div>;
        
         return (
            <div className="space-y-4">
                <div className="bg-red-50 p-2 rounded border border-red-200 text-red-800 text-sm font-bold flex items-center">
                    <span className="bg-red-200 px-2 rounded mr-2 text-xs">MN</span> เดินเครื่อง (Start)
                </div>
                <div className="p-3 bg-slate-50 rounded text-sm text-slate-600 space-y-1">
                    <p><b>Batch:</b> {currentBatch.id}</p>
                    <p><b>สูตร:</b> {formulas}</p>
                </div>
                <div>
                    <label className="text-sm text-slate-700">มิเตอร์เริ่ม</label>
                    <input type="number" className="w-full border rounded-xl p-3 text-lg font-mono" autoFocus value={mnForm.meter} onChange={e => setMnForm({...mnForm, meter: e.target.value})} placeholder="0000.0"/>
                </div>
                <button onClick={() => handleAction('MN_START')} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <PlayCircle size={20}/> START FREEZE
                </button>
            </div>
        );
    }

    // 3. Freezing / Paused
    if (status === 'FREEZING' || status === 'PAUSED') {
        if (!canMn) return <div className="text-center text-red-500 py-4">สำหรับพนักงาน MN เท่านั้น</div>;
        const currentLoad = calculateCurrentLoad(currentBatch.formulas);
        const max = Number(selectedFreezer.maxBatch) || 0;
        const available = Math.max(0, max - currentLoad);
        const showAddItem = status === 'PAUSED' && available > 0;

        const handleAddItem = () => {
            const addQty = newItems.reduce((s: number, i: any) => s + (Number(i.qty)||0), 0);
            if ((currentLoad + addQty) > max) return Swal.fire('เกินความจุ', `รับเพิ่มได้อีก ${available} เท่านั้น`, 'warning');
            
            const oldItems = JSON.parse(currentBatch.formulas);
            const updatedFormulas = JSON.stringify([...oldItems, ...newItems.filter((i: any)=>i.qty)]);
            handleAction('MN_RESUME', { formulas: updatedFormulas });
            setAddMode(false);
        };

        return (
            <div className="space-y-4">
                 <div className="bg-red-50 p-2 rounded border border-red-200 text-red-800 text-sm font-bold flex items-center">
                    <span className="bg-red-200 px-2 rounded mr-2 text-xs">MN</span> ควบคุมการทำงาน
                </div>
                {currentBatch.refreezeReason && (
                    <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700 mb-2"><b>Refreeze:</b> {currentBatch.refreezeReason}</div>
                )}
                {status === 'FREEZING' ? (
                     <button onClick={() => handleAction('MN_PAUSE')} className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                        <PauseCircle size={20}/> หยุดชั่วคราว (Pause)
                    </button>
                ) : (
                    <div className="bg-slate-50 p-3 rounded space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-600">สถานะ: หยุดชั่วคราว</span>
                            <span className="text-emerald-700 font-bold">ว่าง {available} Batch</span>
                        </div>
                        {showAddItem && !addMode && (
                            <button onClick={()=>setAddMode(true)} className="w-full py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm hover:bg-emerald-200 flex items-center justify-center gap-2">
                                <PlusCircle size={16}/> เติมสินค้าเพิ่ม
                            </button>
                        )}
                        {addMode && (
                            <div className="bg-white p-3 rounded border border-emerald-200 animate-fade-in-up">
                                <h4 className="text-xs font-bold text-emerald-800 mb-2">ระบุสินค้าที่เติมเพิ่ม</h4>
                                {newItems.map((row: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <select className="flex-1 border rounded text-xs p-1" value={row.name} onChange={e=>{const n=[...newItems]; n[idx].name=e.target.value; setNewItems(n);}}>
                                            {FORMULA_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <input type="number" className="w-16 border rounded text-xs p-1" placeholder="qty" value={row.qty} onChange={e=>{const n=[...newItems]; n[idx].qty=e.target.value; setNewItems(n);}} />
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <button onClick={handleAddItem} className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded hover:bg-emerald-700">ยืนยันเติมของ</button>
                                    <button onClick={()=>{setAddMode(false); setNewItems([{ name: FORMULA_OPTIONS[0], qty: '' }]);}} className="px-3 bg-gray-200 text-gray-600 text-xs py-2 rounded hover:bg-gray-300">ยกเลิก</button>
                                </div>
                            </div>
                        )}
                        <hr className="border-slate-200"/>
                        <label className="text-sm text-slate-600">เหตุผล Refreeze (ถ้ามี)</label>
                        <textarea className="w-full border rounded p-2 text-sm" value={mnForm.refreezeReason} onChange={e=>setMnForm({...mnForm, refreezeReason:e.target.value})} placeholder="เช่น ไฟดับ, เครื่องเสีย"></textarea>
                        <button onClick={()=>handleAction('MN_RESUME')} className="w-full bg-red-100 text-red-800 hover:bg-red-200 font-bold py-2 rounded-lg">เดินเครื่องต่อ</button>
                    </div>
                )}
                {status === 'FREEZING' && (
                    <div className="pt-4 border-t space-y-2">
                        <label className="text-sm font-bold text-slate-700">จบงาน (Stop)</label>
                        <div className="flex gap-2">
                            <input type="number" className="flex-1 border rounded-lg px-3" placeholder="เลขมิเตอร์จบ" value={mnForm.meter} onChange={e=>setMnForm({...mnForm, meter:e.target.value})} />
                            <button onClick={()=>handleAction('MN_STOP')} className="bg-red-500 text-white font-bold px-4 rounded-lg shadow hover:bg-red-600">STOP</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 4. Waiting Thaw / Thawing / Unload
    if (['WAITING_THAW', 'THAWING', 'WAITING_UNLOAD'].includes(status)) {
         if (!canSu) return <div className="text-center text-red-500 py-4">สำหรับพนักงาน SU เท่านั้น</div>;
         return (
            <div className="space-y-4">
                {status === 'WAITING_THAW' ? (
                    <>
                        <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-800 text-sm font-bold flex items-center"><span className="bg-amber-200 px-2 rounded mr-2 text-xs">SU</span> เตรียมทำละลาย</div>
                        <button onClick={() => handleAction('SU_START_THAW')} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                            <ThermometerSun size={24}/> เริ่มทำละลาย
                        </button>
                    </>
                ) : (
                    <>
                        <div className={`p-2 rounded border text-sm font-bold flex items-center ${status === 'WAITING_UNLOAD' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <span className={`px-2 rounded mr-2 text-xs ${status === 'WAITING_UNLOAD' ? 'bg-slate-200' : 'bg-slate-200'}`}>SU</span> 
                            {status === 'WAITING_UNLOAD' ? 'ขั้นตอนสุดท้าย: เอาของออก' : 'กำลังทำละลาย...'}
                        </div>
                        {status === 'WAITING_UNLOAD' && (
                            <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="text-emerald-600 flex justify-center mb-1"><CheckCircle size={32}/></div>
                                <p className="font-bold text-emerald-800">ละลายเสร็จแล้ว!</p>
                                <p className="text-xs text-emerald-700">พร้อมเอาของออก</p>
                            </div>
                        )}
                        <div className="border-t pt-2">
                            <label className="text-xs text-slate-500">จำนวนที่เอาออก (Batch)</label>
                            <input type="number" className="w-full border rounded p-2 text-sm mt-1" placeholder="ระบุจำนวน (ถ้ามี)" value={removedQty} onChange={e=>setRemovedQty(e.target.value)} />
                        </div>
                        <button onClick={() => handleAction('SU_FINISH', { removedQty })} className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${status === 'WAITING_UNLOAD' ? 'bg-emerald-700 hover:bg-emerald-800 text-white animate-pulse' : 'bg-slate-200 hover:bg-emerald-700 hover:text-white text-slate-500'}`}>
                            <LogOut size={24}/> ยืนยันเอาของออก / จบงาน
                        </button>
                    </>
                )}
            </div>
        );
    }

    return <div className="text-center text-gray-400">สถานะอื่นๆ (Demo)</div>;
};

export default function FreezerPage() {
    const [activeTab, setActiveTab] = useState('card');
    const [filterModel, setFilterModel] = useState('ALL');
    const [freezers, setFreezers] = useState(INITIAL_FREEZERS);
    const [activeData, setActiveData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFreezer, setSelectedFreezer] = useState<any>(null);
    
    // Form State
    const [hgForm, setHgForm] = useState([{ name: FORMULA_OPTIONS[0], qty: '' }]);
    const [mnForm, setMnForm] = useState({ meter: '', refreezeReason: '' });
    
    // Advance Form State (Add Item / Finish)
    const [addMode, setAddMode] = useState(false);
    const [newItems, setNewItems] = useState([{ name: FORMULA_OPTIONS[0], qty: '' }]);
    const [removedQty, setRemovedQty] = useState('');
    
    // Mock Data
    const fetchData = (bg: boolean) => {
        if(!bg) setIsLoading(true);
        setTimeout(() => {
            setActiveData(prev => {
                if(prev.length > 0 && bg) return prev; 
                return [
                    { freezerId: 'F1/1', id: 'B-001', status: 'FREEZING', formulas: JSON.stringify([{name: 'Fresh Vermicelli', qty: 4}]), startTime: new Date(Date.now() - 36000000).toISOString() },
                    { freezerId: 'C1', id: 'B-002', status: 'WAITING_START', formulas: JSON.stringify([{name: 'Glass Noodle', qty: 1.5}]), hgLoadTime: new Date().toISOString() },
                    { freezerId: 'R2', id: 'B-003', status: 'THAWING', formulas: JSON.stringify([{name: 'Dried Vermicelli', qty: 2}]), startTime: new Date(Date.now() - 150000000).toISOString(), thawStartTime: new Date(Date.now() - 7200000).toISOString() },
                    { freezerId: 'R5', id: 'B-004', status: 'WAITING_UNLOAD', formulas: JSON.stringify([{name: 'Dried Vermicelli', qty: 2}]), startTime: new Date(Date.now() - 200000000).toISOString() },
                    { freezerId: 'F2/1', id: 'B-005', status: 'PAUSED', formulas: JSON.stringify([{name: 'MB100', qty: 4}]), startTime: new Date(Date.now() - 10000000).toISOString(), refreezeReason: 'ไฟตกชั่วคราว' }
                ];
            });
            if(!bg) setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchData(false);
    }, []);

    const handleAddFreezer = (newFreezer: any) => {
        const id = newFreezer.name;
        setFreezers([...freezers, { ...newFreezer, id }]);
        Swal.fire({ icon: 'success', title: 'เพิ่มตู้สำเร็จ', timer: 1000, showConfirmButton: false });
    };

    const filteredFreezers = useMemo(() => {
        return filterModel === 'ALL' ? freezers : freezers.filter(f => f.model === filterModel);
    }, [filterModel, freezers]);

    const enrichedFreezers = useMemo(() => {
         return filteredFreezers.map(f => {
            const b = activeData.find(d => String(d.freezerId) === String(f.id));
            const s = getRealStatus(b, f);
            const od = checkOverdue(b, f);
            const load = b ? calculateCurrentLoad(b.formulas) : 0;
            
            let timeLabel = '-';
            let timeProgress = 0;
            let accTime = '-';
            if (b) {
                const start = new Date(s === 'THAWING' ? b.thawStartTime : b.startTime || b.hgLoadTime);
                if(start && !isNaN(start.getTime())) {
                     accTime = getElapsedTimeDisplay(start.toISOString());
                     if (s === 'FREEZING' || s === 'THAWING') {
                        const duration = s === 'THAWING' ? f.thawHrs : f.stdHrs;
                        const elapsed = (Date.now() - start.getTime()) / 3600000;
                        timeProgress = Math.min((elapsed/duration)*100, 100);
                        timeLabel = `${elapsed.toFixed(1)} / ${duration} hrs`;
                     }
                }
            }
            return { ...f, batch: b, realStatus: s, isOverdue: od, load, formulaText: getFormulaText(b), timeLabel, timeProgress, accTime };
         });
    }, [filteredFreezers, activeData]);

    const stats = useMemo(() => {
        const total = freezers.length;
        const running = activeData.length;
        return { 
            total, available: total - running, 
            waitingStart: activeData.filter(d => d.status.includes('WAIT') && d.status.includes('START')).length,
            freezing: activeData.filter(d => d.status.includes('FREEZ')).length,
            refreeze: activeData.filter(d => d.refreezeReason).length, 
            waitingThaw: activeData.filter(d => d.status.includes('WAIT') && d.status.includes('THAW')).length,
            thawing: activeData.filter(d => d.status.includes('THAW') && !d.status.includes('WAIT')).length,
            waitingUnload: activeData.filter(d => d.status.includes('UNLOAD')).length 
        };
    }, [activeData, freezers]);

    const handleCardClick = (f: any) => {
        const b = activeData.find(d => String(d.freezerId) === String(f.id));
        setSelectedFreezer({ ...f, currentBatch: b });
        
        if (b?.formulas) {
            try { setHgForm(JSON.parse(b.formulas)); } catch(e) { setHgForm([{ name: FORMULA_OPTIONS[0], qty: '' }]); }
        } else {
            setHgForm([{ name: FORMULA_OPTIONS[0], qty: '' }]);
        }
        setMnForm({ meter: '', refreezeReason: '' });
        
        setAddMode(false);
        setNewItems([{ name: FORMULA_OPTIONS[0], qty: '' }]);
        setRemovedQty('');

        setIsModalOpen(true);
    };

    const handleAction = (action: string, payload: any = {}) => {
        const newActiveData = [...activeData];
        const fId = selectedFreezer.id;
        const idx = newActiveData.findIndex(d => d.freezerId === fId);

        if (action === 'HG_LOAD') {
            if(hgForm.some(x=>!x.qty)) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุจำนวน', 'warning');
            const newBatch = { freezerId: fId, id: `B-${Date.now().toString().slice(-4)}`, status: 'WAITING_START', formulas: JSON.stringify(hgForm), hgLoadTime: new Date().toISOString() };
            if(idx >= 0) newActiveData[idx] = newBatch; else newActiveData.push(newBatch);
        } else if (action === 'MN_START') {
            if(!mnForm.meter) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุเลขมิเตอร์', 'warning');
            if(idx >= 0) newActiveData[idx] = { ...newActiveData[idx], status: 'FREEZING', startTime: new Date().toISOString() };
        } else if (action === 'MN_PAUSE') {
            if(idx >= 0) newActiveData[idx] = { ...newActiveData[idx], status: 'PAUSED' };
        } else if (action === 'MN_RESUME') {
            if(idx >= 0) {
                const updates: any = { status: 'FREEZING' };
                if(payload.formulas) updates.formulas = payload.formulas;
                if(mnForm.refreezeReason) updates.refreezeReason = mnForm.refreezeReason;
                newActiveData[idx] = { ...newActiveData[idx], ...updates };
            }
        } else if (action === 'MN_STOP') {
            if(idx >= 0) newActiveData[idx] = { ...newActiveData[idx], status: 'WAITING_THAW' };
        } else if (action === 'SU_START_THAW') {
            if(idx >= 0) newActiveData[idx] = { ...newActiveData[idx], status: 'THAWING', thawStartTime: new Date().toISOString() };
        } else if (action === 'SU_FINISH') {
            if(idx >= 0) newActiveData.splice(idx, 1);
        }

        setActiveData(newActiveData);
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1000, showConfirmButton: false });
        setIsModalOpen(false);
    };

    const addFormulaRow = () => setHgForm([...hgForm, { name: FORMULA_OPTIONS[0], qty: '' }]);
    const removeFormulaRow = (i: number) => setHgForm(hgForm.filter((_, idx) => idx !== i));
    const updateFormula = (i: number, field: string, val: string) => {
        const n: any = [...hgForm]; n[i][field] = val; setHgForm(n);
    };

    return (
        <div className="flex flex-col h-full">
            <AddFreezerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddFreezer} />

            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/20 flex-shrink-0">
                        <Snowflake size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1D24] tracking-tight whitespace-nowrap">Freezer Management</h1>
                        <p className="text-[#718096] text-xs font-medium uppercase tracking-widest mt-1">ควบคุมสถานะตู้แช่และห้องเย็น</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/50 p-1 rounded-md overflow-x-auto no-scrollbar max-w-full border border-white/60 shadow-inner w-fit flex-shrink-0 backdrop-blur-sm">
                        <button onClick={() => setActiveTab('monitor')} className={`px-6 py-2.5 rounded-sm text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'monitor' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <Table2 size={16} /> MONITOR
                        </button>
                        <button onClick={() => setActiveTab('card')} className={`px-6 py-2.5 rounded-sm text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'card' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <LayoutGrid size={16} /> CARD
                        </button>
                        <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2.5 rounded-sm text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'dashboard' ? 'bg-[#1A1D24] text-white shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                            <PieChart size={16} /> DASHBOARD
                        </button>
                    </div>
                    <button onClick={() => fetchData(false)} className="w-10 h-10 bg-white text-[#718096] rounded-lg shadow-sm border border-slate-200 hover:text-[#1A1D24] transition flex items-center justify-center">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 pb-6 pt-6 relative z-10 overflow-hidden flex flex-col gap-6 min-h-0">
                {/* Summary Cards */}
                <div className="px-6">
                    <FreezingSummary stats={stats} />
                </div>

                {/* Monitor Tab (Table) */}
                {activeTab === 'monitor' && (
                    <div className="flex-1 h-full flex flex-col overflow-hidden animate-fade-in-up bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm mx-6 mb-6">
                        {/* Toolbar */}
                        <div className="px-6 py-4 flex justify-between items-center shrink-0 border-b border-white/50">
                            <span className="text-xs text-[#718096] font-mono flex items-center gap-2">
                                <Clock size={14}/> Last updated: {new Date().toLocaleTimeString()}
                            </span>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-white/80 p-1 rounded-lg border border-gray-200 shadow-sm">
                                    {['ALL', 'F', 'C', 'R'].map(m => (
                                        <button key={m} onClick={() => setFilterModel(m)} 
                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterModel === m ? 'bg-[#1A1D24] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                                            {m === 'ALL' ? 'All' : m}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowAddModal(true)} className="bg-[#1A1D24] hover:bg-[#1A1D24] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5">
                                    <Plus size={16} /> Add Freezer
                                </button>
                            </div>
                        </div>
                        
                        {/* Table Header */}
                        <div className="overflow-auto custom-scrollbar flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-20 bg-[#F8FAFC] text-[#64748B] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-200">Freezer</th>
                                        <th className="px-6 py-3 border-b border-gray-200">Status</th>
                                        <th className="px-6 py-3 border-b border-gray-200">Formula</th>
                                        <th className="px-6 py-3 border-b border-gray-200 text-center">Load</th>
                                        <th className="px-6 py-3 border-b border-gray-200">Timing</th>
                                        <th className="px-6 py-3 border-b border-gray-200 w-1/5">Progress</th>
                                        <th className="px-6 py-3 border-b border-gray-200">Note</th>
                                        <th className="px-6 py-3 border-b border-gray-200 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white/50">
                                    {enrichedFreezers.map(f => (
                                        <tr key={f.id} className="hover:bg-white transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#1A1D24] text-sm">{f.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">Std: {f.stdHrs}h</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={f.realStatus} overdue={f.isOverdue} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700 text-xs truncate max-w-[150px]" title={f.formulaText}>{f.formulaText}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-mono font-bold text-xs ${f.load > 0 ? 'text-[#1A1D24]' : 'text-slate-300'}`}>{f.load > 0 ? f.load : '-'}</span>
                                                    <span className="text-[9px] text-slate-400">/ {f.maxBatch}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>In:</span>
                                                        <span className="font-mono font-bold text-slate-700">{f.batch ? new Date(f.batch.startTime || f.batch.hgLoadTime).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>Out:</span>
                                                        <span className="font-mono font-bold text-red-700">{f.batch && (f.realStatus === 'FREEZING' || f.realStatus === 'PAUSED') ? calculateFinishTime(f.batch.startTime, f.stdHrs) : '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-bold text-slate-600">{f.timeLabel}</span>
                                                        <span className="text-[10px] font-mono text-slate-400">{f.accTime}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                                        <div className={`h-full transition-all duration-1000 ${f.realStatus === 'THAWING' ? 'bg-slate-500' : 'bg-[#B91C1C]'}`} style={{width: f.timeProgress + '%'}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {f.batch?.refreezeReason ? (
                                                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1 w-fit">
                                                        <AlertCircle size={10}/> {f.batch.refreezeReason}
                                                    </span>
                                                ) : <span className="text-slate-300 text-xs">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleCardClick(f)} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-500 hover:text-[#1A1D24] hover:border-[#1A1D24] hover:shadow-md transition-all">
                                                    <Settings2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CARD TAB (GRID View) */}
                {activeTab === 'card' && (
                     <div className="flex-1 h-full overflow-y-auto custom-scrollbar animate-fade-in-up px-6">
                        <div className="flex justify-end gap-3 mb-4">
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                {['ALL', 'F', 'C', 'R'].map(m => (
                                    <button key={m} onClick={() => setFilterModel(m)} 
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterModel === m ? 'bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/30' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        {m === 'ALL' ? 'All Models' : 'Model ' + m}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowAddModal(true)} className="bg-[#1A1D24] hover:bg-[#1A1D24] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5">
                                <Plus size={16} /> Add Freezer
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {enrichedFreezers.map(freezer => (
                                <div key={freezer.id} className="h-48">
                                    <FreezerCard 
                                        config={freezer} 
                                        activeData={activeData} 
                                        onSelect={handleCardClick} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                     <div className="h-full overflow-y-auto custom-scrollbar pb-6 animate-fade-in-up px-6">
                         <DashboardCharts stats={stats} />
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && selectedFreezer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-[95%] max-w-[500px] max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#1A1D24] text-white px-6 py-4 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2"><Snowflake size={20} className="text-[#D97706]"/> {selectedFreezer.name}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">Model {selectedFreezer.model} • Capacity {selectedFreezer.maxBatch}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white"><X size={24}/></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <RenderModalContent 
                                    selectedFreezer={selectedFreezer}
                                    currentBatch={selectedFreezer.currentBatch}
                                    hgForm={hgForm} 
                                    mnForm={mnForm}
                                    handleAction={handleAction}
                                    setMnForm={setMnForm}
                                    addFormulaRow={addFormulaRow}
                                    removeFormulaRow={removeFormulaRow}
                                    updateFormula={updateFormula}
                                    addMode={addMode}
                                    setAddMode={setAddMode}
                                    newItems={newItems}
                                    setNewItems={setNewItems}
                                    removedQty={removedQty}
                                    setRemovedQty={setRemovedQty}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
