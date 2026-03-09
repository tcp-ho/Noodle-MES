import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    ShoppingBag, Kanban, ClipboardList, List, FileClock, Truck, CheckSquare, 
    Coins, Search, UploadCloud, Plus, PlusCircle, Stamp, Printer, Send, 
    FilePen, Store, ListChecks, CheckCircle, X
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Components ---

const KpiCard = ({ title, val, color, icon: Icon, desc }: any) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-white/60 relative overflow-hidden group h-full cursor-pointer">
        <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
            <Icon size={120} strokeWidth={1.5} color="#1A1D24" />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-[#768C70] uppercase tracking-widest font-mono opacity-90 truncate">{title}</p>
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md border border-white/60 bg-[#1A1D24]">
                <Icon size={24} color="#FFFFFF" />
            </div>
        </div>
        
        <div className="w-full bg-white/50 rounded-full h-1.5 mt-4 overflow-hidden relative z-10">
            <div className="h-full rounded-full transition-all duration-1000 bg-[#1A1D24]" style={{ width: '70%' }}></div>
        </div>
    </div>
);

// --- Main Page Component ---

export default function PurchaseOrderPage() {
    const [activeTab, setActiveTab] = useState('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedPR, setSelectedPR] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [pendingPRs, setPendingPRs] = useState<any[]>([]);
    const [poList, setPoList] = useState<any[]>([]);
    
    const [poForm, setPoForm] = useState<any>({
        vendor: '', vendorAddress: '', paymentTerm: 'Credit 30 Days', deliveryDate: '', remarks: '', items: []
    });

    useEffect(() => {
        // Mock Data
        setPendingPRs([
            { id: 'PR-2601-002', date: '2026-01-16', requester: 'Wipa', department: 'Warehouse', totalAmount: 22500, items: [{code: 'PM-BAG-500', name: 'ถุงพลาสติก 500g (Plastic Bag)', qty: 5000, price: 4.5}] },
            { id: 'PR-2601-005', date: '2026-01-20', requester: 'Chai', department: 'Production', totalAmount: 75000, items: [{code: 'RM-STMB-001', name: 'แป้งมันสำปะหลัง (Mung Bean Starch)', qty: 50, price: 1500}] }
        ]);

        setPoList([
            { id: 1, poNumber: 'PO-2026-001', date: '2026-01-18', vendor: 'Thai Starch Co.', prRef: 'PR-2601-001', grandTotal: 80250, status: 'Sent', items: [{code: 'RM-STMB-001', name: 'แป้งมันสำปะหลัง', qty: 50, price: 1500}], paymentTerm: 'Credit 30 Days', deliveryDate: '2026-01-25', remarks: 'Urgent delivery required' },
            { id: 2, poNumber: 'PO-2026-002', date: '2026-01-19', vendor: 'Mung Bean Supply', prRef: 'PR-2601-003', grandTotal: 8560, status: 'Completed', items: [{code: 'RM-STTP-001', name: 'แป้งมันเทศ (Tapioca Starch)', qty: 10, price: 800}], paymentTerm: 'Cash', deliveryDate: '2026-01-20', remarks: '-' },
            { id: 3, poNumber: 'PO-2026-003', date: '2026-01-22', vendor: 'Engineering Parts Ltd.', prRef: 'PR-2601-004', grandTotal: 5350, status: 'Pending Approve', items: [{code: 'PT-SPP-001', name: 'อะไหล่เครื่องตัด (Cutter Part)', qty: 2, price: 2500}], paymentTerm: 'Credit 30 Days', deliveryDate: '2026-01-30', remarks: '-' },
            { id: 4, poNumber: 'PO-2026-004', date: '2026-01-23', vendor: 'Cooking Oil Center', prRef: 'PR-2601-006', grandTotal: 240750, status: 'Approved', items: [{code: 'RM-OIL-001', name: 'น้ำมันพืช (Vegetable Oil)', qty: 500, price: 450}], paymentTerm: 'Credit 60 Days', deliveryDate: '2026-02-05', remarks: 'Deliver to warehouse 2' }
        ]);
    }, []);

    const filteredPOList = useMemo(() => {
        let result = poList;
        if (filterStatus !== 'All') {
            result = result.filter(p => p.status === filterStatus);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.poNumber.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q));
        }
        return result;
    }, [poList, filterStatus, searchQuery]);

    const stats = useMemo(() => ({
        totalOrders: poList.length,
        pending: pendingPRs.length,
        approved: poList.filter(p => p.status === 'Sent').length,
        completed: poList.filter(p => p.status === 'Completed').length
    }), [poList, pendingPRs]);
    
    const totalSpend = useMemo(() => poList.reduce((acc, p) => acc + p.grandTotal, 0), [poList]);

    const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();
    
    const getStatusClass = (status: string) => {
        switch(status) {
            case 'Completed': return 'bg-[#1A1D24]/10 text-[#1A1D24] border-[#1A1D24]/20';
            case 'Sent': return 'bg-[#718096]/10 text-[#B91C1C] border-[#718096]/20'; 
            case 'Pending Approve': return 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20';
            case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Partial': return 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/20';
            case 'Cancelled': case 'Rejected': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getStatusCount = (s: string) => {
        if (s === 'All') return poList.length;
        return poList.filter(p => p.status === s).length;
    };
    
    const getBoardItems = (status: string) => {
        let items = poList.filter(p => p.status === status);
        if (status === 'Completed') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            items = items.filter(p => new Date(p.date) >= oneMonthAgo);
        }
        return items;
    };

    const getBoardCount = (status: string) => getBoardItems(status).length;

    const openGenerateModal = (pr: any) => {
        if (!pr) {
             setSelectedPR(null);
             setPoForm({ vendor: '', vendorAddress: '', paymentTerm: 'Credit 30 Days', deliveryDate: '', remarks: '', items: [] });
        } else {
             setSelectedPR(pr);
             setPoForm({ 
                 vendor: '', vendorAddress: '', paymentTerm: 'Credit 30 Days', deliveryDate: '', remarks: '', 
                 items: JSON.parse(JSON.stringify(pr.items)) 
             });
        }
        setShowModal(true);
    };

    const openCreateModal = () => openGenerateModal(null);
    
    const openModal = (type: string, po: any) => {
        if(type === 'approve') {
             Swal.fire({
                 title: 'Approve PO?',
                 text: `Approve ${po.poNumber} for ${formatCurrency(po.grandTotal)}?`,
                 icon: 'question',
                 showCancelButton: true,
                 confirmButtonColor: '#B91C1C',
                 confirmButtonText: 'Yes, Approve'
             }).then((r) => {
                 if(r.isConfirmed) updateStatus('Approved', po.id);
             });
        }
    };

    const closeModal = () => setShowModal(false);

    const calculateSubtotal = () => poForm.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0);

    const confirmGeneratePO = () => {
        if(!poForm.vendor) return Swal.fire('Error', 'Please enter Vendor Name', 'error');
        
        const subT = calculateSubtotal();
        const newPO = {
            id: Date.now(),
            poNumber: `PO-${new Date().getFullYear()}-${String(poList.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().slice(0, 10),
            vendor: poForm.vendor, vendorAddress: poForm.vendorAddress,
            prRef: selectedPR ? selectedPR.id : '-', 
            paymentTerm: poForm.paymentTerm,
            deliveryDate: poForm.deliveryDate || '-', remarks: poForm.remarks || '-',
            items: poForm.items,
            grandTotal: subT * 1.07, subTotal: subT, vat: subT * 0.07,
            status: 'Pending Approve' 
        };
        
        setPoList([newPO, ...poList]);
        if (selectedPR) {
             setPendingPRs(pendingPRs.filter(p => p.id !== selectedPR.id)); 
        }
        
        closeModal();
        Swal.fire({ icon: 'success', title: 'PO Generated', text: `PO Number: ${newPO.poNumber}`, confirmButtonColor: '#1A1D24' });
    };
    
    const updateStatus = (newStatus: string, id: number) => {
        const idx = poList.findIndex(p => p.id === id);
        if(idx !== -1) {
            const newList = [...poList];
            newList[idx].status = newStatus;
            setPoList(newList);
            Swal.fire({icon: 'success', title: 'Updated', text: `Status changed to ${newStatus}`, timer: 1500, showConfirmButton: false});
        }
    };

    const handleExcelImport = () => fileInputRef.current?.click();

    const processExcelFile = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        Swal.fire({ icon: 'success', title: 'Import Successful', text: `Demo: File loaded.`, timer: 1500, showConfirmButton: false });
        event.target.value = '';
    };

    const printPO = (po: any) => {
        Swal.fire({ icon: 'info', title: 'Print Preview', text: `Printing PO ${po.poNumber}... (Feature simulated)`, timer: 1500, showConfirmButton: false });
    };

    return (
        <div className="flex flex-col h-full bg-[#D9D9D9]">
            {/* Header */}
            <div className="px-4 py-2 flex justify-between items-center z-10 shrink-0 no-print">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1D24] text-white shadow-lg flex-shrink-0 border border-white/20">
                        <ShoppingBag size={24} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A1D24] tracking-tight whitespace-nowrap">PURCHASE ORDER</h1>
                        <p className="text-[#718096] text-[10px] font-medium uppercase tracking-widest mt-0.5">ระบบสั่งซื้อสินค้า (PO)</p>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-white/40 p-1 rounded-md overflow-x-auto no-scrollbar max-w-full border border-white/50 shadow-inner w-fit flex-shrink-0 backdrop-blur-sm">
                    <button onClick={() => setActiveTab('kanban')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'kanban' ? 'bg-[#1A1D24] text-[#1A1D24] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                        <Kanban size={14} /> BOARD
                    </button>
                    <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'pending' ? 'bg-[#1A1D24] text-[#1A1D24] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                        <ClipboardList size={14} /> PENDING PR
                    </button>
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'list' ? 'bg-[#1A1D24] text-[#1A1D24] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                        <List size={14} /> PO LIST
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-4 pt-2 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <KpiCard title="PR to Process" val={pendingPRs.length} color="#D97706" icon={FileClock} desc="Wait for PO" />
                    <KpiCard title="Open POs" val={poList.filter(p=>['Pending Approve', 'Approved', 'Sent'].includes(p.status)).length} color="#B91C1C" icon={Truck} desc="In Process" />
                    <KpiCard title="Completed" val={poList.filter(p=>p.status==='Completed').length} color="#1A1D24" icon={CheckSquare} desc="Received All" />
                    <KpiCard title="Total Spend (Mo)" val={formatCurrency(totalSpend)} color="#1A1D24" icon={Coins} desc="Current Month" />
                </div>

                {/* Content Area */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-soft border border-white/60 flex flex-col overflow-hidden flex-1 min-h-0">
                    
                    {/* Toolbar */}
                    {activeTab === 'list' && (
                        <div className="px-4 py-3 border-b border-gray-100/50 flex flex-col xl:flex-row items-center justify-between gap-3 bg-white/40 backdrop-blur-sm shrink-0">
                            <div className="flex flex-1 items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar">
                                <div className="flex items-center gap-1 p-1 bg-white/50 rounded-lg border border-white/50 backdrop-blur-sm shrink-0 shadow-inner">
                                    {['All', 'Pending Verify', 'Pending Approve', 'Revise', 'Approved', 'Rejected', 'Cancelled'].map(status => (
                                        <button key={status} onClick={() => setFilterStatus(status)} 
                                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-2 font-mono ${filterStatus === status ? 'bg-[#1A1D24] text-[#1A1D24] shadow-sm' : 'text-[#718096] hover:text-[#1A1D24]'}`}>
                                            <span>{status}</span>
                                            <span className={`flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold transition-all ${filterStatus === status ? 'bg-[#1A1D24] text-white' : 'bg-gray-200 text-gray-500'}`}>{getStatusCount(status)}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="h-6 w-px bg-gray-200 mx-1 hidden xl:block shrink-0"></div>
                                <div className="relative w-full xl:w-64 shrink-0">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search PO..." className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-gray-200/60 focus:outline-none focus:border-[#1A1D24] bg-white/60 backdrop-blur-sm transition-colors font-mono" />
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 flex-nowrap items-center ml-auto">
                                <button onClick={handleExcelImport} className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-[#1A1D24] border border-gray-200 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2 font-mono uppercase tracking-wide whitespace-nowrap">
                                    <UploadCloud size={14} color="#1A1D24" /> <span className="hidden sm:inline">Import</span>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={processExcelFile} />
                                </button>
                                <button onClick={openCreateModal} className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1A1D24] text-white hover:bg-[#1A1D24]/90 hover:shadow-lg shadow-md transition-all flex items-center gap-2 font-mono uppercase tracking-wide whitespace-nowrap">
                                    <Plus size={14} /> CREATE PO
                                </button>
                            </div>
                        </div>
                    )}

                    {/* KANBAN BOARD VIEW */}
                    {activeTab === 'kanban' && (
                        <div className="flex-1 overflow-x-auto custom-scrollbar p-4 bg-gray-50/30">
                            <div className="flex gap-4 h-full min-w-max">
                                {/* Column 1: Ready to PO */}
                                <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#D97706]"></div> รอสร้างใบสั่งซื้อ (PR Approved)</h4>
                                        <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">{pendingPRs.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                        {pendingPRs.map(pr => (
                                            <div key={pr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#D97706]/50 hover:shadow-md transition-all cursor-pointer group relative" onClick={() => openGenerateModal(pr)}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">{pr.id}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{pr.date}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-xs font-bold text-[#1A1D24]">{pr.department}</div>
                                                    <div className="text-[10px] text-[#718096]">Req: {pr.requester}</div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-2 flex justify-between items-center">
                                                    <div className="text-[10px] text-gray-500">{pr.items.length} Items</div>
                                                    <span className="text-xs font-bold text-[#D97706]">{formatCurrency(pr.totalAmount)}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <button onClick={(e) => { e.stopPropagation(); openGenerateModal(pr); }} className="w-full bg-[#D97706] text-[#1A1D24] text-[10px] py-1.5 rounded hover:bg-yellow-500 transition-colors font-bold uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm">
                                                        <PlusCircle size={12}/> Generate PO
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {pendingPRs.length === 0 && <div className="text-center text-gray-400 text-xs py-8 italic">No pending PRs</div>}
                                    </div>
                                </div>

                                {/* Column 2: PO Waiting Approve */}
                                <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div> รออนุมัติ (Pending Approval)</h4>
                                        <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">{getBoardCount('Pending Approve')}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                        {getBoardItems('Pending Approve').map(po => (
                                            <div key={po.poNumber} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => openModal('approve', po)}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-[#B91C1C] bg-red-50 px-1.5 py-0.5 rounded">{po.poNumber}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{po.date}</span>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-xs font-bold text-[#1A1D24] truncate">{po.vendor}</div>
                                                    <div className="text-[10px] text-[#718096]">Ref: {po.prRef}</div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                    <span className="text-xs font-bold text-[#1A1D24]">{formatCurrency(po.grandTotal)}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <button onClick={(e) => { e.stopPropagation(); openModal('approve', po); }} className="w-full bg-[#B91C1C] hover:bg-red-800 text-white text-[10px] py-1.5 rounded transition-colors font-bold flex items-center justify-center gap-1 uppercase tracking-widest shadow-sm">
                                                        <Stamp size={12} color="#FFFFFF"/> Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 3: PO Approved */}
                                <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1A1D24]"></div> อนุมัติแล้ว (Approved)</h4>
                                        <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">{getBoardCount('Approved')}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                        {getBoardItems('Approved').map(po => (
                                            <div key={po.poNumber} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#1A1D24]/50 hover:shadow-md transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-[#1A1D24] bg-emerald-50 px-1.5 py-0.5 rounded">{po.poNumber}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{po.date}</span>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-xs font-bold text-[#1A1D24] truncate">{po.vendor}</div>
                                                    <div className="text-[10px] text-[#718096]">{po.items.length} Items</div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                    <span className="text-xs font-bold text-[#1A1D24]">{formatCurrency(po.grandTotal)}</span>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                     <button onClick={(e) => { e.stopPropagation(); printPO(po); }} className="flex-1 bg-[#718096] hover:bg-[#B91C1C] text-white text-[10px] py-1.5 rounded transition-colors font-bold flex items-center justify-center gap-1 uppercase tracking-widest shadow-sm">
                                                        <Printer size={12} color="#FFFFFF"/> Print
                                                     </button>
                                                     <button onClick={(e) => { e.stopPropagation(); updateStatus('Sent', po.id); }} className="flex-1 bg-[#B91C1C] hover:bg-red-800 text-white text-[10px] py-1.5 rounded transition-colors font-bold flex items-center justify-center gap-1 uppercase tracking-widest shadow-sm">
                                                        <Send size={12} color="#FFFFFF"/> Send
                                                     </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 4: PO Waiting Delivery */}
                                <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div> รอรับสินค้า (Waiting)</h4>
                                        <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">{getBoardCount('Sent') + getBoardCount('Partial')}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                        {[...getBoardItems('Sent'), ...getBoardItems('Partial')].map(po => (
                                            <div key={po.poNumber} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#B91C1C]/50 hover:shadow-md transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-[#B91C1C] bg-amber-50 px-1.5 py-0.5 rounded">{po.poNumber}</span>
                                                    {po.status === 'Partial' ? <span className="text-[9px] font-bold text-white bg-[#B91C1C] px-1.5 py-0.5 rounded uppercase">Partial</span> : <span className="text-[10px] text-gray-400 font-mono">{po.date}</span>}
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-xs font-bold text-[#1A1D24] truncate">{po.vendor}</div>
                                                    <div className="text-[10px] text-[#718096]">Waiting Delivery</div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                    <span className="text-xs font-bold text-[#1A1D24]">{formatCurrency(po.grandTotal)}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <button onClick={(e) => { e.stopPropagation(); updateStatus('Completed', po.id); }} className="w-full bg-[#B91C1C] hover:bg-amber-800 text-white text-[10px] py-1.5 rounded transition-colors font-bold flex items-center justify-center gap-1 uppercase tracking-widest shadow-sm">
                                                        <CheckSquare size={12} color="#FFFFFF"/> Receive
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 5: PO Closed */}
                                <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500"></div> รับสินค้าครบ (Completed)</h4>
                                        <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">{getBoardCount('Completed')}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                        {getBoardItems('Completed').map(po => (
                                            <div key={po.poNumber} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group opacity-75 hover:opacity-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{po.poNumber}</span>
                                                    <span className="text-[10px] text-[#1A1D24] font-bold bg-emerald-50 px-1.5 py-0.5 rounded uppercase border border-emerald-200">Completed</span>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-xs font-bold text-gray-600 truncate">{po.vendor}</div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                    <span className="text-xs font-bold text-gray-500">{formatCurrency(po.grandTotal)}</span>
                                                    <CheckCircle size={14} className="text-[#1A1D24]"/>
                                                </div>
                                                <div className="mt-3">
                                                    <button onClick={(e) => { e.stopPropagation(); printPO(po); }} className="w-full bg-[#1A1D24] hover:bg-[#1A1D24]/90 text-white text-[10px] py-1.5 rounded transition-colors font-bold flex items-center justify-center gap-1 uppercase tracking-widest shadow-sm">
                                                         <Printer size={12} color="#FFFFFF"/> Print Copy
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PENDING PR VIEW (TABLE) */}
                    {activeTab === 'pending' && (
                        <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl rounded-xl shadow-soft border border-white/60 p-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h3 className="text-lg font-bold text-[#1A1D24] flex items-center gap-2">
                                    <ClipboardList size={20} className="text-[#1A1D24]" /> Approved PR (Ready for PO)
                                </h3>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
                                <div className="overflow-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono">PR No.</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono">Date</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono">Department</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono">Requester</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono text-center">Items</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono text-right">Est. Amount</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase font-mono text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {pendingPRs.map(pr => (
                                                <tr key={pr.id} className="hover:bg-[#D97706]/5">
                                                    <td className="px-4 py-3 font-bold text-[#1A1D24] text-xs font-mono">{pr.id}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{pr.date}</td>
                                                    <td className="px-4 py-3 text-xs">{pr.department}</td>
                                                    <td className="px-4 py-3 text-xs">{pr.requester}</td>
                                                    <td className="px-4 py-3 text-center text-xs font-mono">{pr.items.length}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-[#B91C1C] text-xs font-mono">{formatCurrency(pr.totalAmount)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button onClick={() => openGenerateModal(pr)} className="text-[#1A1D24] hover:text-white font-bold text-[10px] border border-[#1A1D24] hover:bg-[#1A1D24] px-3 py-1.5 rounded transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto shadow-sm">
                                                            <PlusCircle size={12}/> Create PO
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {pendingPRs.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400 italic text-xs">No pending PRs available.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PO LIST VIEW */}
                    {activeTab === 'list' && (
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">PO Number</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">Date</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">Vendor</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">Ref PR</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-right">Total</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#768C70] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {filteredPOList.map(po => (
                                        <tr key={po.poNumber} className="hover:bg-[#D97706]/5 transition-colors group bg-white/50">
                                            <td className="px-4 py-3 font-mono font-bold text-xs text-[#1A1D24]">{po.poNumber}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 font-mono">{po.date}</td>
                                            <td className="px-4 py-3 text-xs font-bold">{po.vendor}</td>
                                            <td className="px-4 py-3 text-xs text-[#718096] font-mono">{po.prRef}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs font-bold text-[#1A1D24]">{formatCurrency(po.grandTotal)}</td>
                                            <td className="px-4 py-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusClass(po.status)}`}>{po.status}</span></td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => printPO(po)} className="p-1.5 text-gray-400 hover:text-[#1A1D24] hover:bg-white rounded transition-colors border border-transparent hover:border-gray-200" title="Print PDF">
                                                    <Printer size={16} color="#1A1D24"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPOList.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs italic bg-white/50">No Purchase Orders found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Generate PO Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D24]/60 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
                    <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden transform scale-100 transition-all" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1A1D24] text-white flex items-center justify-center rounded-xl shadow-lg">
                                    <FilePen size={24} color="#FFFFFF" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A1D24] uppercase tracking-widest">Generate Purchase Order</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">From PR: {selectedPR?.id}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                                <X size={20} className="text-gray-400 hover:text-[#B91C1C]" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#F4F3EF]">
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                                 <h4 className="text-xs font-bold text-[#1A1D24] uppercase mb-4 border-b border-gray-100 pb-2 tracking-widest flex items-center gap-2">
                                     <Store size={14} color="#1A1D24" /> Vendor Information
                                 </h4>
                                 <div className="grid grid-cols-2 gap-4 mb-4">
                                     <div>
                                         <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1">Vendor Name</label>
                                         <input value={poForm.vendor} onChange={e => setPoForm({...poForm, vendor: e.target.value})} className="w-full bg-white border border-gray-200 rounded p-2 text-xs focus:outline-none focus:border-[#1A1D24]" placeholder="Enter Vendor Name" />
                                     </div>
                                     <div>
                                         <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1">Payment Term</label>
                                         <select value={poForm.paymentTerm} onChange={e => setPoForm({...poForm, paymentTerm: e.target.value})} className="w-full bg-white border border-gray-200 rounded p-2 text-xs focus:outline-none focus:border-[#1A1D24]">
                                             <option>Credit 30 Days</option><option>Credit 60 Days</option><option>Cash</option>
                                         </select>
                                     </div>
                                     <div className="col-span-2">
                                         <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1">Address</label>
                                         <input value={poForm.vendorAddress} onChange={e => setPoForm({...poForm, vendorAddress: e.target.value})} className="w-full bg-white border border-gray-200 rounded p-2 text-xs focus:outline-none focus:border-[#1A1D24]" placeholder="Vendor Address" />
                                     </div>
                                     <div>
                                         <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1">Delivery Date</label>
                                         <input type="date" value={poForm.deliveryDate} onChange={e => setPoForm({...poForm, deliveryDate: e.target.value})} className="w-full bg-white border border-gray-200 rounded p-2 text-xs focus:outline-none focus:border-[#1A1D24]" />
                                     </div>
                                     <div>
                                         <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1">Remarks</label>
                                         <input value={poForm.remarks} onChange={e => setPoForm({...poForm, remarks: e.target.value})} className="w-full bg-white border border-gray-200 rounded p-2 text-xs focus:outline-none focus:border-[#1A1D24]" placeholder="Optional notes..." />
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                 <h4 className="text-xs font-bold text-[#1A1D24] uppercase mb-4 border-b border-gray-100 pb-2 tracking-widest flex items-center gap-2">
                                     <ListChecks size={14} color="#1A1D24" /> Order Items
                                 </h4>
                                 <table className="w-full text-left text-xs">
                                     <thead className="bg-gray-50 text-[#718096] uppercase font-bold font-mono">
                                         <tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Unit Price</th><th className="p-3 text-right">Total</th></tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100">
                                         {poForm.items.map((item: any, idx: number) => (
                                             <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                 <td className="p-3 font-mono font-bold text-[#1A1D24]">{item.code}</td>
                                                 <td className="p-3 text-gray-600">{item.name}</td>
                                                 <td className="p-3 text-right font-mono">{item.qty}</td>
                                                 <td className="p-3 text-right">
                                                     <input type="number" value={item.price} onChange={e => {
                                                         const newItems = [...poForm.items];
                                                         newItems[idx].price = Number(e.target.value);
                                                         setPoForm({...poForm, items: newItems});
                                                     }} className="border border-gray-200 rounded px-2 py-1 w-24 text-right text-xs font-mono focus:outline-none focus:border-[#1A1D24]" />
                                                 </td>
                                                 <td className="p-3 text-right font-bold font-mono text-[#B91C1C]">{(item.qty * item.price).toLocaleString()}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                                 <div className="mt-6 text-right border-t border-gray-200 pt-4">
                                     <div className="text-xs text-gray-500 font-mono mb-1">Subtotal: {formatCurrency(calculateSubtotal())}</div>
                                     <div className="text-xs text-gray-500 font-mono mb-2">VAT (7%): {formatCurrency(calculateSubtotal() * 0.07)}</div>
                                     <div className="text-xl font-black text-white mt-1 font-mono bg-[#1A1D24] inline-block px-4 py-2 rounded-lg border border-emerald-600 shadow-md">Total: {formatCurrency(calculateSubtotal() * 1.07)}</div>
                                 </div>
                             </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={closeModal} className="px-6 py-2.5 text-[#718096] font-bold text-xs hover:bg-gray-100 rounded-xl transition uppercase tracking-widest font-mono">Cancel</button>
                            <button onClick={confirmGeneratePO} className="px-8 py-2.5 bg-[#1A1D24] text-white font-bold text-xs rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2 uppercase tracking-widest font-mono hover:bg-[#1A1D24]/90">
                                <CheckCircle size={16} color="#FFFFFF" /> Create PO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
