import React, { useState, useMemo, useRef } from 'react';
import { 
    ShoppingCart, Kanban, List, FileText, Search, Clock, CheckCircle, 
    Plus, UploadCloud, Pencil, FolderCheck, Stamp, Printer, Eye, 
    X, FilePlus, Save, History, Trash2, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Components ---

const KpiCard = ({ title, val, color, icon: Icon, desc }: any) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-white/60 relative overflow-hidden group h-full cursor-pointer">
        <div className="absolute -right-6 -bottom-6 opacity-[0.08] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0" style={{ color }}>
            <Icon size={120} strokeWidth={1.5} />
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

export default function PurchaseRequisitionPage() {
    const [activeTab, setActiveTab] = useState('kanban');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Mock Data
    const mockItems = [
        { code: 'RM-STMB-001', name: 'แป้งมันสำปะหลัง (Mung Bean Starch)', price: 1500 },
        { code: 'RM-STTP-001', name: 'แป้งมันเทศ (Tapioca Starch)', price: 800 },
        { code: 'PM-BAG-500', name: 'ถุงพลาสติก 500g (Plastic Bag)', price: 4.5 },
        { code: 'PT-SPP-001', name: 'อะไหล่เครื่องตัด (Cutter Part)', price: 2500 },
        { code: 'RM-OIL-001', name: 'น้ำมันพืช (Vegetable Oil)', price: 450 }
    ];

    const [prData, setPrData] = useState<any[]>([
        { 
            id: 'PR-2601-001', date: '2026-01-15', requester: 'Somchai', department: 'Production (Mixing)', urgency: 'Normal', status: 'Pending Verify', 
            items: [{code: 'RM-STMB-001', name: 'แป้งมันสำปะหลัง (Mung Bean Starch)', qty: 50, price: 1500}], totalAmount: 75000, 
            history: [{date: '2026-01-15 09:00', user: 'Somchai', action: 'Created', note: 'วัตถุดิบใกล้หมดสต็อก'}] 
        },
        { 
            id: 'PR-2601-002', date: '2026-01-16', requester: 'Wipa', department: 'Warehouse', urgency: 'Urgent', status: 'Approved', 
            items: [{code: 'PM-BAG-500', name: 'ถุงพลาสติก 500g (Plastic Bag)', qty: 5000, price: 4.5}], totalAmount: 22500, 
            history: [
                {date: '2026-01-16 10:00', user: 'Wipa', action: 'Created', note: 'แผนผลิตใหม่เพิ่มขึ้น ต้องการถุงด่วน'}, 
                {date: '2026-01-16 11:00', user: 'Purchaser', action: 'Verified', note: 'ติดต่อ Supplier แล้ว มีของพร้อมส่ง'}, 
                {date: '2026-01-16 14:00', user: 'Manager', action: 'Approved', note: 'อนุมัติให้ออก PO ทันที'}
            ] 
        },
        { 
            id: 'PR-2601-003', date: '2026-01-18', requester: 'Nop', department: 'Engineering', urgency: 'Normal', status: 'Pending Approve', 
            items: [{code: 'PT-SPP-001', name: 'อะไหล่เครื่องตัด (Cutter Part)', qty: 2, price: 2500}], totalAmount: 5000, 
            history: [
                {date: '2026-01-18 09:00', user: 'Nop', action: 'Created', note: 'เปลี่ยนตามรอบ PM ประจำเดือน'}, 
                {date: '2026-01-18 10:30', user: 'Purchaser', action: 'Verified', note: 'ราคาตรงตามสัญญา'}
            ] 
        },
        {
            id: 'PR-2601-004', date: '2026-01-19', requester: 'Suda', department: 'Production (Packing)', urgency: 'Normal', status: 'Revise',
            items: [{code: 'PM-BAG-500', name: 'ถุงพลาสติก 500g (Plastic Bag)', qty: 20000, price: 4.5}], totalAmount: 90000,
            history: [
                {date: '2026-01-19 08:30', user: 'Suda', action: 'Created', note: 'ขอซื้อล่วงหน้าสำหรับเดือนหน้า'},
                {date: '2026-01-19 09:00', user: 'Purchaser', action: 'Revise', note: 'ปริมาณมากเกินไป พื้นที่เก็บไม่พอ รบกวนปรับลดจำนวนลงเหลือ 10,000 ก่อน'}
            ]
        },
        {
            id: 'PR-2601-005', date: '2026-01-20', requester: 'Chai', department: 'Office', urgency: 'Critical', status: 'Rejected',
            items: [{code: 'RM-OIL-001', name: 'น้ำมันพืช (Vegetable Oil)', qty: 500, price: 450}], totalAmount: 225000,
            history: [
                {date: '2026-01-20 10:00', user: 'Chai', action: 'Created', note: 'ด่วนมาก'},
                {date: '2026-01-20 10:15', user: 'Purchaser', action: 'Verified', note: 'ยอดสูงมาก'},
                {date: '2026-01-20 11:00', user: 'Manager', action: 'Rejected', note: 'งบประมาณแผนกเต็มแล้วสำหรับไตรมาสนี้ ให้ใช��ของเดิมที่มีอยู่ไปก่อน'}
            ]
        },
        {
            id: 'PR-2601-006', date: '2026-01-21', requester: 'Somchai', department: 'Production (Mixing)', urgency: 'Normal', status: 'Cancelled',
            items: [{code: 'RM-STTP-001', name: 'แป้งมันเทศ (Tapioca Starch)', qty: 10, price: 800}], totalAmount: 8000,
            history: [
                {date: '2026-01-21 09:00', user: 'Somchai', action: 'Created', note: ''},
                {date: '2026-01-21 09:30', user: 'Somchai', action: 'Cancelled', note: 'คีย์ซ้ำกับใบก่อนหน้า'}
            ]
        }
    ]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [formData, setFormData] = useState<any>({ id: '', date: '', department: '', requester: '', urgency: 'Normal', items: [], history: [] });
    const [itemInput, setItemInput] = useState({ code: '', qty: 1 });

    // Computed
    const stats = useMemo(() => ({
        total: prData.length,
        pendingVerify: prData.filter(p => p.status === 'Pending Verify').length,
        pendingApprove: prData.filter(p => p.status === 'Pending Approve').length,
        approved: prData.filter(p => p.status === 'Approved').length
    }), [prData]);

    const filteredData = useMemo(() => {
        let data = prData;
        if (filterStatus !== 'All') data = data.filter(p => p.status === filterStatus);
        if (searchQuery) data = data.filter(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()));
        return data;
    }, [prData, filterStatus, searchQuery]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    const getStatusCount = (s: string) => {
        if (s === 'All') return prData.length;
        return prData.filter(p => p.status === s).length;
    };

    // Helper Functions
    const getStatusBadgeClass = (s: string) => {
        const map: any = { 
            'Pending Verify': 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20', 
            'Pending Approve': 'bg-[#718096]/10 text-[#718096] border-[#718096]/20', 
            'Approved': 'bg-[#1A1D24]/10 text-[#1A1D24] border-[#1A1D24]/20', 
            'Rejected': 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/20',
            'Revise': 'bg-[#B91C1C]/10 text-[#EF4444] border-[#B91C1C]/20',
            'Cancelled': 'bg-slate-100 text-slate-500 border-slate-200' 
        };
        return map[s] || 'bg-slate-100 text-slate-500 border-slate-200';
    };

    const getUrgencyClass = (u: string) => {
        switch(u) {
            case 'Critical': return 'bg-red-50 text-red-600 border-red-200';
            case 'Urgent': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-500 border-gray-200';
        }
    };

    const getBoardItems = (status: string) => {
        if (status === 'Rejected') return prData.filter(p => ['Rejected', 'Cancelled'].includes(p.status));
        return prData.filter(p => p.status === status);
    };

    const getLastNote = (pr: any) => {
        if (pr.history && pr.history.length > 0) return pr.history[pr.history.length - 1].note || '-';
        return '-';
    };

    const formatCurrency = (val: number) => '฿' + (val || 0).toLocaleString();

    // Actions
    const openModal = (mode: string, pr: any = null) => {
        setModalMode(mode);
        if (mode === 'create') {
            setFormData({ 
                id: `PR-2601-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`, 
                date: new Date().toISOString().split('T')[0], 
                department: 'Production (Mixing)', requester: 'Admin', urgency: 'Normal', items: [],
                history: []
            });
        } else {
            setFormData(JSON.parse(JSON.stringify(pr)));
        }
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const addItem = () => {
        const item = mockItems.find(i => i.code === itemInput.code);
        if (item && itemInput.qty > 0) {
            setFormData({ ...formData, items: [...formData.items, { ...item, qty: itemInput.qty }] });
            setItemInput({ code: '', qty: 1 });
        }
    };

    const removeItem = (idx: number) => {
        const newItems = [...formData.items];
        newItems.splice(idx, 1);
        setFormData({ ...formData, items: newItems });
    };

    const savePR = () => {
        if (formData.items.length === 0) return Swal.fire('Error', 'กรุณาเพิ่มรายการสินค้า', 'error');
        const total = formData.items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);
        
        const newLog = {
            date: new Date().toLocaleString('en-GB'),
            user: 'Admin', 
            action: 'Created',
            note: 'New PR Request'
        };
        
        let newData = [...prData];
        if (modalMode === 'edit') {
            const idx = newData.findIndex(p => p.id === formData.id);
            if (idx !== -1) {
                newData[idx] = { ...formData, totalAmount: total, status: 'Pending Verify', history: [...(formData.history || []), { ...newLog, action: 'Edited', note: 'Modified Details' }] };
            }
        } else {
             newData.unshift({ ...formData, status: 'Pending Verify', totalAmount: total, history: [newLog] });
        }
        
        setPrData(newData);
        closeModal();
        Swal.fire({ icon: 'success', title: 'Success', text: 'PR Saved Successfully', timer: 1500, showConfirmButton: false, confirmButtonColor: '#1A1D24' });
    };

    const updateStatus = async (status: string) => {
        let note = '';
        if (['Revise', 'Cancelled', 'Rejected'].includes(status)) {
            const { value: text } = await Swal.fire({
                input: 'textarea',
                inputLabel: 'Reason / Note (Required)',
                inputPlaceholder: `Please enter reason for ${status}...`,
                showCancelButton: true,
                confirmButtonColor: '#1A1D24',
                inputValidator: (value) => { if (!value) return 'You need to write something!' }
            });
            if (!text) return; 
            note = text;
        }

        const idx = prData.findIndex(p => p.id === formData.id);
        if (idx !== -1) {
            const newData = [...prData];
            newData[idx].status = status;
            
            const userRole = modalMode === 'verify' ? 'Purchaser' : (modalMode === 'approve' ? 'Manager' : 'User');
            const newLog = {
                date: new Date().toLocaleString('en-GB'),
                user: userRole,
                action: status,
                note: note
            };
            
            if(!newData[idx].history) newData[idx].history = [];
            newData[idx].history.push(newLog);
            setPrData(newData);
        }
        
        closeModal();
        Swal.fire({ icon: 'success', title: 'Updated', text: `Status updated to ${status}`, timer: 1500, showConfirmButton: false });
    };

    const handlePrint = (id: string) => {
        // In a real app, this would generate a PDF. For now, we'll simulate it.
        Swal.fire({ icon: 'info', title: 'Print Preview', text: `Printing PR ${id}... (Feature simulated)`, timer: 1500, showConfirmButton: false });
    };

    const handleExcelImport = () => fileInputRef.current?.click();
    const processExcelFile = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        Swal.fire({ icon: 'success', title: 'Import Successful', text: `Demo: File loaded.`, timer: 1500, showConfirmButton: false });
        event.target.value = '';
    };

    return (
        <div className="flex flex-col h-full bg-[#D9D9D9]">
            {/* Header */}
            <div className="px-4 py-2 flex justify-between items-center z-10 shrink-0 no-print">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1A1D24] text-white shadow-lg shadow-[#1A1D24]/20 flex-shrink-0 border border-white/20">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A1D24] tracking-tight whitespace-nowrap">PURCHASE REQUISITION</h1>
                        <p className="text-[#718096] text-[10px] font-medium uppercase tracking-widest mt-0.5">ระบบขอซื้อวัตถุดิบและอุปกรณ์</p>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-white/40 p-1 rounded-md overflow-x-auto no-scrollbar max-w-full border border-white/50 shadow-inner w-fit flex-shrink-0 backdrop-blur-sm">
                    <button onClick={() => setActiveTab('kanban')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'kanban' ? 'bg-[#1A1D24] text-[#D97706] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                        <Kanban size={14} /> BOARD VIEW
                    </button>
                    <button onClick={() => setActiveTab('log')} className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${activeTab === 'log' ? 'bg-[#1A1D24] text-[#D97706] shadow-md' : 'text-[#718096] hover:text-[#1A1D24] hover:bg-white/50'}`}>
                        <List size={14} /> PR LIST
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-4 pt-2 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <KpiCard title="Total PR" val={stats.total} color="#718096" icon={FileText} desc="All Records" />
                    <KpiCard title="Pending Verify" val={stats.pendingVerify} color="#D97706" icon={Search} desc="Purchaser Review" />
                    <KpiCard title="Pending Approve" val={stats.pendingApprove} color="#B91C1C" icon={Clock} desc="Manager Approval" />
                    <KpiCard title="Approved" val={stats.approved} color="#1A1D24" icon={CheckCircle} desc="Ready for PO" />
                </div>

                {/* Content Area */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-soft border border-white/60 flex flex-col overflow-hidden flex-1 min-h-0">
                    
                    {/* Toolbar */}
                    {activeTab === 'log' && (
                        <div className="px-4 py-3 border-b border-gray-100/50 flex flex-col xl:flex-row items-center justify-between gap-3 bg-white/40 backdrop-blur-sm shrink-0">
                            <div className="flex flex-1 items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar">
                                <div className="flex items-center gap-1 p-1 bg-white/50 rounded-lg border border-white/50 backdrop-blur-sm shrink-0 shadow-inner">
                                    {['All', 'Pending Verify', 'Pending Approve', 'Revise', 'Approved', 'Rejected', 'Cancelled'].map(status => (
                                        <button key={status} onClick={() => setFilterStatus(status)} 
                                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-2 font-mono ${filterStatus === status ? 'bg-[#1A1D24] text-[#D97706] shadow-sm' : 'text-[#718096] hover:text-[#1A1D24]'}`}>
                                            <span>{status}</span>
                                            <span className={`flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold transition-all ${filterStatus === status ? 'bg-[#D97706] text-[#1A1D24]' : 'bg-gray-200 text-gray-500'}`}>{getStatusCount(status)}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="h-6 w-px bg-gray-200 mx-1 hidden xl:block shrink-0"></div>
                                <div className="relative w-full xl:w-64 shrink-0">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search PR..." className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-gray-200/60 focus:outline-none focus:border-[#D97706] bg-white/60 backdrop-blur-sm transition-colors font-mono" />
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 flex-nowrap items-center ml-auto">
                                <button onClick={handleExcelImport} className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-[#1A1D24] border border-gray-200 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2 font-mono uppercase tracking-wide whitespace-nowrap">
                                    <UploadCloud size={14} /> <span className="hidden sm:inline">Import</span>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={processExcelFile} />
                                </button>
                                <button onClick={() => openModal('create')} className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1A1D24] text-[#D97706] hover:bg-[#1A1D24]/90 hover:shadow-lg shadow-md transition-all flex items-center gap-2 font-mono uppercase tracking-wide whitespace-nowrap">
                                    <Plus size={14} /> CREATE PR
                                </button>
                            </div>
                        </div>
                    )}

                    {/* KANBAN BOARD VIEW */}
                    {activeTab === 'kanban' && (
                        <div className="flex-1 overflow-x-auto custom-scrollbar p-4 bg-gray-50/30">
                            <div className="flex gap-4 h-full min-w-max">
                                {/* Columns */}
                                {[
                                    { title: 'รอตรวจสอบ (Verify)', status: 'Pending Verify', color: '#D97706' },
                                    { title: 'ส่งคืนแก้ไข (Revise)', status: 'Revise', color: '#B91C1C' },
                                    { title: 'รออนุมัติ (Approve)', status: 'Pending Approve', color: '#718096' },
                                    { title: 'อนุมัติแล้ว (Approved)', status: 'Approved', color: '#1A1D24' },
                                    { title: 'ยกเลิก/ไม่อนุมัติ', status: 'Rejected', color: '#1A1D24' }
                                ].map((col, idx) => (
                                    <div key={idx} className="w-80 flex-shrink-0 flex flex-col h-full bg-white/50 rounded-xl p-3 border border-white shadow-sm">
                                        <div className="flex justify-between items-center mb-3 px-1">
                                            <h4 className="font-bold text-[#1A1D24] text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: col.color}}></div> {col.title}</h4>
                                            <span className="bg-white text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200 shadow-sm">
                                                {col.status === 'Rejected' ? getBoardItems('Rejected').length : getBoardItems(col.status).length}
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                            {getBoardItems(col.status).map(pr => (
                                                <div key={pr.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative ${col.status === 'Revise' ? 'border-l-4 border-l-[#B91C1C]' : ''}`} onClick={() => openModal(col.status === 'Pending Verify' ? 'verify' : (col.status === 'Pending Approve' ? 'approve' : (col.status === 'Revise' ? 'edit' : 'view')), pr)}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-mono text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{pr.id}</span>
                                                        <span className="text-[10px] text-gray-400 font-mono">{pr.date}</span>
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="text-xs font-bold text-[#1A1D24]">{pr.department}</div>
                                                        <div className="text-[10px] text-[#718096]">Req: {pr.requester}</div>
                                                        {col.status === 'Revise' && <div className="text-[10px] text-[#B91C1C] bg-amber-50 p-1 rounded mt-1 italic line-clamp-2">Note: {getLastNote(pr)}</div>}
                                                    </div>
                                                    <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                        <div className="text-[10px] text-gray-500">{pr.items.length} Items</div>
                                                        <span className="text-xs font-bold text-[#1A1D24]">{formatCurrency(pr.totalAmount)}</span>
                                                    </div>
                                                    
                                                    {/* Action Buttons based on status */}
                                                    <div className="mt-3">
                                                        {col.status === 'Pending Verify' && <button className="w-full bg-[#D97706] text-[#1A1D24] text-[10px] py-1.5 rounded hover:bg-yellow-500 transition-colors font-bold shadow-sm">Verify Request</button>}
                                                        {col.status === 'Revise' && <button className="w-full bg-[#B91C1C] text-white text-[10px] py-1.5 rounded hover:bg-amber-800 transition-colors font-bold shadow-sm">Edit & Resubmit</button>}
                                                        {col.status === 'Pending Approve' && <button className="w-full bg-[#718096] text-white text-[10px] py-1.5 rounded hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-1 shadow-sm"><Stamp size={12}/> Approve</button>}
                                                        {col.status === 'Approved' && (
                                                            <div className="flex items-center gap-1 text-[#1A1D24] text-[10px] font-bold justify-center bg-emerald-50 py-1 rounded">
                                                                <CheckCircle size={12}/> Ready for PO
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {activeTab === 'log' && (
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">PR ID</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">Date</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono">Department / Requestor</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Items / Total Qty</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-right">Total Amount</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Urgency</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-[#718096] uppercase bg-[#F4F3EF]/95 border-b-2 border-[#D97706] font-mono text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {paginatedData.map(pr => (
                                        <tr key={pr.id} className="hover:bg-[#D97706]/5 transition-colors group bg-white/50">
                                            <td className="px-4 py-3 font-mono font-bold text-xs text-[#D97706]">{pr.id}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 font-mono">{pr.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-[#1A1D24] text-xs">{pr.department}</div>
                                                <div className="text-[10px] text-[#718096] mt-0.5 flex items-center gap-1"><User size={10}/> {pr.requester}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="font-bold text-[#1A1D24] text-xs font-mono">{pr.items.length} List</div>
                                                <div className="text-[10px] text-[#718096] font-mono mt-0.5">{pr.items.reduce((acc: number, i: any) => acc + (parseInt(i.qty) || 0), 0).toLocaleString()} Units</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs font-bold text-[#B91C1C]">{formatCurrency(pr.totalAmount)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getUrgencyClass(pr.urgency)}`}>{pr.urgency}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusBadgeClass(pr.status)}`}>{pr.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    {pr.status === 'Pending Verify' && (
                                                        <>
                                                            <button onClick={() => openModal('edit', pr)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-[#D97706] hover:border-[#D97706] hover:bg-gray-50 rounded shadow-sm transition-all"><Pencil size={14}/></button>
                                                            <button onClick={() => openModal('verify', pr)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-yellow-600 hover:text-white hover:bg-yellow-500 hover:border-yellow-500 rounded shadow-sm transition-all"><FolderCheck size={14}/></button>
                                                        </>
                                                    )}
                                                    {pr.status === 'Pending Approve' && (
                                                        <button onClick={() => openModal('approve', pr)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-500 rounded shadow-sm transition-all"><Stamp size={14}/></button>
                                                    )}
                                                    {pr.status === 'Approved' && (
                                                        <button onClick={() => handlePrint(pr.id)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-white hover:bg-[#1A1D24] hover:border-[#1A1D24] rounded shadow-sm transition-all"><Printer size={14}/></button>
                                                    )}
                                                    {['Revise', 'Cancelled', 'Rejected'].includes(pr.status) && (
                                                        <button onClick={() => openModal('view', pr)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-[#1A1D24] hover:bg-gray-100 rounded shadow-sm transition-all"><Eye size={14}/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-xs italic bg-white/50">No PR records found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {activeTab === 'log' && (
                        <div className="px-4 py-3 border-t border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-sm shrink-0 rounded-b-xl">
                            <div className="flex items-center gap-2 text-xs text-[#718096] font-bold font-mono">
                                <span>Show</span>
                                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="bg-white/80 border border-gray-200/60 rounded-md px-2 py-1 focus:outline-none focus:border-[#D97706] cursor-pointer">
                                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200/60 bg-white/80 hover:bg-white disabled:opacity-50 transition-colors text-[#718096]"><ChevronLeft size={14}/></button>
                                <span className="text-xs font-bold text-[#1A1D24] px-2 bg-white/80 border border-gray-200/60 py-2 rounded-lg">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200/60 bg-white/80 hover:bg-white disabled:opacity-50 transition-colors text-[#718096]"><ChevronRight size={14}/></button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D24]/60 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
                    <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden transform scale-100 transition-all" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1A1D24] flex items-center justify-center rounded-xl shadow-lg text-[#D97706]">
                                    <FilePlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1A1D24] uppercase tracking-tight">
                                        {modalMode === 'create' ? 'Create New PR' : (modalMode === 'edit' ? 'Edit PR' : (modalMode === 'verify' ? 'Verify PR' : (modalMode === 'approve' ? 'Approve PR' : 'View PR')))}
                                    </h3>
                                    <div className="text-xs text-[#718096] font-mono mt-1 flex items-center gap-2">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">PR ID: {formData.id}</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusBadgeClass(formData.status)}`}>{formData.status}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1D24] transition-all"><X size={20}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#F4F3EF]">
                            {/* General Info */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative mb-6">
                                <h4 className="text-xs font-bold text-[#718096] uppercase mb-4 tracking-widest border-b border-gray-100 pb-2">General Information</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div><label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Date</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} readOnly={!['create', 'edit'].includes(modalMode)} className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-mono focus:outline-none focus:border-[#D97706]" /></div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Department</label>
                                        <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} disabled={!['create', 'edit'].includes(modalMode)} className="w-full bg-transparent border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-[#D97706]">
                                            <option>Production (Mixing)</option><option>Production (Packing)</option><option>Warehouse</option><option>Engineering</option><option>Office</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Requester</label><input type="text" value={formData.requester} onChange={e => setFormData({...formData, requester: e.target.value})} readOnly={!['create', 'edit'].includes(modalMode)} className="w-full bg-transparent border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-[#D97706]" /></div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Urgency</label>
                                        <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} disabled={!['create', 'edit'].includes(modalMode)} className="w-full bg-transparent border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-[#D97706]">
                                            <option>Normal</option><option>Urgent</option><option>Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative mb-6">
                                <h4 className="text-xs font-bold text-[#718096] uppercase mb-4 tracking-widest border-b border-gray-100 pb-2">Items</h4>
                                {['create', 'edit'].includes(modalMode) && (
                                    <div className="flex gap-2 mb-4 items-end bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Select Item</label>
                                            <select className="w-full bg-white border border-gray-200 rounded p-2 text-xs" value={itemInput.code} onChange={e => setItemInput({...itemInput, code: e.target.value})}>
                                                <option value="">-- Choose RM / Part --</option>
                                                {mockItems.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[10px] font-bold text-[#718096] uppercase mb-1.5 font-mono">Qty</label>
                                            <input type="number" className="w-full bg-white border border-gray-200 rounded p-2 text-xs text-center" value={itemInput.qty} onChange={e => setItemInput({...itemInput, qty: Number(e.target.value)})} min="1" />
                                        </div>
                                        <button onClick={addItem} className="bg-[#1A1D24] text-[#D97706] p-2.5 rounded-lg font-bold text-xs shadow-md hover:bg-[#1A1D24]/90 uppercase tracking-wide font-mono transition-transform active:scale-95">Add</button>
                                    </div>
                                )}
                                
                                <div className="overflow-hidden border border-gray-200 rounded-xl">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-gray-100 text-[10px] text-[#718096] uppercase font-bold font-mono">
                                            <tr>
                                                <th className="p-3">Code</th>
                                                <th className="p-3">Item Name</th>
                                                <th className="p-3 text-right">Qty</th>
                                                <th className="p-3 text-right">Est. Price</th>
                                                <th className="p-3 text-right">Total</th>
                                                {['create', 'edit'].includes(modalMode) && <th className="p-3 text-center"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {formData.items.map((i: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-3 font-mono font-bold text-[#1A1D24]">{i.code}</td>
                                                    <td className="p-3 text-gray-600">{i.name}</td>
                                                    <td className="p-3 text-right font-mono font-bold text-[#1A1D24]">{i.qty}</td>
                                                    <td className="p-3 text-right font-mono text-gray-500">{i.price.toLocaleString()}</td>
                                                    <td className="p-3 text-right font-mono font-bold text-[#B91C1C]">{(i.qty * i.price).toLocaleString()}</td>
                                                    {['create', 'edit'].includes(modalMode) && (
                                                        <td className="p-3 text-center">
                                                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"><Trash2 size={14}/></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {formData.items.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400 italic">No items added.</td></tr>}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200 font-mono text-sm">
                                            <tr>
                                                <td colSpan={4} className="p-3 text-right font-bold text-gray-600">Grand Total:</td>
                                                <td className="p-3 text-right font-bold text-[#1A1D24]">฿{formData.items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0).toLocaleString()}</td>
                                                {['create', 'edit'].includes(modalMode) && <td></td>}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* History */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                                <h4 className="text-xs font-bold text-[#718096] uppercase mb-4 tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <History size={14}/> History Log
                                </h4>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {formData.history && formData.history.length > 0 ? (
                                        formData.history.map((log: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-start text-xs border-b border-dashed border-gray-100 pb-2 last:border-0">
                                                <div>
                                                    <div className="font-bold text-[#1A1D24] flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${log.action.includes('Approved') ? 'bg-[#1A1D24]' : (log.action.includes('Rejected') || log.action.includes('Cancelled') ? 'bg-[#B91C1C]' : (log.action.includes('Revise') ? 'bg-[#D97706]' : 'bg-[#718096]'))}`}></span>
                                                        {log.action}
                                                    </div>
                                                    <div className="text-[10px] text-[#718096] mt-0.5 font-mono">by {log.user}</div>
                                                    {log.note && <div className="text-[10px] text-gray-600 italic mt-1 bg-gray-50 p-1.5 rounded border border-gray-100">"{log.note}"</div>}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono text-right">{log.date}</div>
                                            </div>
                                        ))
                                    ) : <div className="text-center text-gray-400 italic text-xs py-2">No history available.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0 z-10 rounded-b-2xl">
                             <button onClick={closeModal} className="px-6 py-2.5 text-[#718096] hover:text-[#1A1D24] text-xs font-bold hover:bg-gray-200 rounded-xl transition duration-300 uppercase tracking-widest font-mono">Cancel</button>
                             
                             {['create', 'edit'].includes(modalMode) && (
                                 <>
                                     {modalMode === 'edit' && <button onClick={() => updateStatus('Cancelled')} className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl transition duration-300 uppercase tracking-widest font-mono">Cancel PR</button>}
                                     <button onClick={savePR} className="px-8 py-2.5 bg-[#1A1D24] hover:bg-[#1A1D24]/90 text-[#D97706] text-xs font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 flex items-center gap-2 uppercase tracking-widest font-mono">
                                         <Save size={14}/> Submit PR
                                     </button>
                                 </>
                             )}
                             
                             {modalMode === 'verify' && (
                                 <>
                                     <button onClick={() => updateStatus('Revise')} className="px-6 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 text-xs font-bold rounded-xl transition duration-300 uppercase tracking-widest font-mono">Revise</button>
                                     <button onClick={() => updateStatus('Cancelled')} className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl transition duration-300 uppercase tracking-widest font-mono">Cancel</button>
                                     <button onClick={() => updateStatus('Pending Approve')} className="px-8 py-2.5 bg-[#D97706] hover:bg-yellow-500 text-[#1A1D24] text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 uppercase tracking-widest font-mono">
                                         <FolderCheck size={14}/> Verify
                                     </button>
                                 </>
                             )}
                             
                             {modalMode === 'approve' && (
                                 <>
                                     <button onClick={() => updateStatus('Revise')} className="px-6 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 text-xs font-bold rounded-xl transition duration-300 uppercase tracking-widest font-mono">Revise</button>
                                     <button onClick={() => updateStatus('Rejected')} className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl transition duration-300 uppercase tracking-widest font-mono">Reject</button>
                                     <button onClick={() => updateStatus('Approved')} className="px-8 py-2.5 bg-[#1A1D24] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 uppercase tracking-widest font-mono">
                                         <Stamp size={14}/> Approve
                                     </button>
                                 </>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
