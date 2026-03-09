import { 
  BarChart2, Box, Calendar, CalendarDays, ClipboardList, Coins, 
  Container, Database, Factory, FileBarChart, FileJson, FileStack, 
  FileText, History, Layers, LayoutDashboard, Microscope, PackageCheck, 
  PackageOpen, Receipt, RotateCcw, Ruler, Scroll, Settings, ShieldAlert, 
  ShoppingBag, ShoppingCart, Smile, Thermometer, Truck, User, Users, 
  Waves, Wheat, Wind, ArrowLeftRight, MessageSquare, CreditCard,
  ChevronDown, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

// Map icon names to components
const IconMap: Record<string, any> = {
  'layout-dashboard': LayoutDashboard,
  'shopping-bag': ShoppingBag,
  'container': Container,
  'truck': Truck,
  'clipboard-list': ClipboardList,
  'factory': Factory,
  'microscope': Microscope,
  'coins': Coins,
  'file-json': FileJson,
  'database': Database,
  'calendar-days': CalendarDays,
  'settings': Settings,
  'book-open': FileText, // Approximation
  'file-text': FileText,
  'bar-chart-2': BarChart2,
  'user': User,
  'credit-card': CreditCard,
  'message-square': MessageSquare,
  'smile': Smile,
  'calendar': Calendar,
  'arrow-left-right': ArrowLeftRight,
  'layers': Layers,
  'file-stack': FileStack,
  'rotate-ccw': RotateCcw,
  'receipt': Receipt,
  'history': History,
  'users': Users,
  'wheat': Wheat,
  'shield-alert': ShieldAlert,
  'box': Box,
  'file-bar-chart': FileBarChart,
  'ruler': Ruler,
  'alert-circle': ShieldAlert, // Approximation
  'scroll': Scroll,
  'package-check': PackageCheck,
  'shopping-cart': ShoppingCart,
  'shield-check': ShieldCheck,
  'wind': Wind,
  'waves': Waves,
  'flask-conical': Thermometer, // Approximation
  'package': Box, // Approximation
  'thermometer': Thermometer,
  'package-open': PackageOpen,
};

const SYSTEM_MODULES = [
  { id: 'dashboard', label: 'DASHBOARD', icon: 'layout-dashboard' },
  {
      id: 'sales', label: 'SALE', icon: 'shopping-bag',
      subItems: [
          { id: 'catalogue', label: 'NOODLE CATALOGUE' },
          { id: 'quotation', label: 'QUOTATION' },
          { id: 'orders', label: 'ORDERS' },
          { id: 'analysis', label: 'SALE ANALYSIS' },
          { id: 'customer', label: 'CUSTOMER' },
          { id: 'credit', label: 'CREDIT ANALYSIS' },
          { id: 'cust_feedback', label: 'CUST FEEDBACK' },
          { id: 'csat', label: 'CSAT' },
          { id: 'sale_calendar', label: 'SALE CALENDAR' },
      ]
  },
  {
      id: 'warehouse', label: 'WAREHOUSE', icon: 'container', 
      subItems: [
          { id: 'transaction', label: 'TRANSACTION' },
          { id: 'inventory_planning', label: 'INVENTORY & PLANNING' },
          { id: 'inventory_lot', label: 'INVENTORY BY LOT' },
          { id: 'stock_card', label: 'STOCK CARD' },
          { id: 'logistics', label: 'LOGISTICS' },
          { id: 'return_goods', label: 'RETURN GOODS' },
          { id: 'wh_calendar', label: 'WH CALENDAR' },
      ]
  },
  {
      id: 'procurement', label: 'PROCUREMENT', icon: 'truck',
      subItems: [
          { id: 'pr', label: 'PR' },
          { id: 'pr_analysis', label: 'PR ANALYSIS' },
          { id: 'pq', label: 'PQ' },
          { id: 'po', label: 'PO' },
          { id: 'po_analysis', label: 'PO ANALYSIS' },
          { id: 'purchase_history', label: 'PURCHASE HISTORY' },
          { id: 'supplier', label: 'SUPPLIER' },
          { id: 'materials', label: 'RAW MATERIALS' }, 
          { id: 'debt', label: 'DEBT MANAGEMENT' },
          { id: 'scar', label: 'SCAR' },
      ]
  },
  {
      id: 'planning', label: 'PLANNING', icon: 'clipboard-list',
      subItems: [
          { id: 'job_planning', label: 'JOB PLANNING' },
          { id: 'mat_requirement', label: 'MAT. REQUIREMENT' },
          { id: 'prod_schedule', label: 'PRODUCTION SCHEDULE' },
      ]
  },
  {
      id: 'production', label: 'PRODUCTION', icon: 'factory',
      subItems: [
          { id: 'plan_tracking', label: 'PLAN TRACKING' },
          { id: 'prod_report', label: 'PRODUCTION REPORT' },
          { id: 'soaking', label: 'SOAKING' },
          { id: 'freezer', label: 'FREEZER' },
          { id: 'freezing_productivity', label: 'FREEZING PRODUCTIVITY' },
      ]
  },
  {
      id: 'qc', label: 'QC/QA (HALAL)', icon: 'microscope',
      subItems: [
          { id: 'product_spec', label: 'PRODUCT SPEC' },
          { id: 'nc_control', label: 'NC CONTROL' },
      ]
  },
  {
      id: 'cost', label: 'COST CONTROL', icon: 'coins',
      subItems: [
          { id: 'product_cost', label: 'PRODUCT COST' },
          { id: 'cost_analysis', label: 'COST ANALYSIS' },
      ]
  },
  {
      id: 'bom', label: 'RECIPE / BOM', icon: 'file-json',
      subItems: [
          { id: 'product_bom', label: 'RECIPE BOM' },
      ]
  },
  {
      id: 'master', label: 'CODE MASTER', icon: 'database',
      subItems: [
          { id: 'code_master', label: 'CODE MASTER' },
          { id: 'item_master', label: 'ITEM MASTER' },
      ]
  },
  { id: 'mes_calendar', label: 'MES CALENDAR', icon: 'calendar-days' },
  {
      id: 'setting', label: 'SETTING', icon: 'settings',
      subItems: [
          { id: 'user_permission', label: 'USER PERMISSIONS' },
          { id: 'system_config', label: 'SYSTEM CONFIG' }
      ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
}

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab, currentUser }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
    if (!isOpen) setIsOpen(true);
  };

  return (
    <aside className={`flex-shrink-0 flex flex-col transition-all duration-500 z-30 shadow-2xl relative bg-[#1A1D24] ${isOpen ? 'w-72' : 'w-24'}`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 w-6 h-6 bg-[#448C11] text-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(68,140,17,0.5)] hover:scale-110 transition-transform z-50 border-2 border-[#1A1D24]"
      >
        {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Brand Header */}
      <div className="h-32 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center gap-3 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#448C11] to-[#2d5e0b] flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <Waves size={28} className="text-white transform -rotate-90" strokeWidth={2.5} />
          </div>
          <div className={`transition-all duration-500 overflow-hidden flex flex-col items-center ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <h1 className="text-white font-sans text-xl tracking-widest whitespace-nowrap">
              <span className="font-light">NOODLE</span><span className="font-bold text-[#B91C1C]">KING</span>
            </h1>
            <p className="text-[#718096] text-[10px] font-bold uppercase tracking-[0.65em] text-center whitespace-nowrap ml-1 mt-1">MES SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-4 relative z-10">
        {SYSTEM_MODULES.map(module => {
          const Icon = IconMap[module.icon] || LayoutDashboard;
          const hasSubItems = module.subItems && module.subItems.length > 0;
          const isDirectActive = activeTab === module.id && !hasSubItems;
          const isParentActive = hasSubItems && (module.id === activeTab || module.subItems?.some(s => s.id === activeTab));
          const isExpanded = expandedMenus[module.id];

          return (
            <div key={module.id} className="mb-2">
              <button
                onClick={() => hasSubItems ? toggleMenu(module.id) : setActiveTab(module.id)}
                className={`w-full flex items-center px-4 py-3 transition-all duration-300 group relative rounded-xl mx-auto overflow-hidden
                  ${isDirectActive
                    ? 'text-white shadow-[0_0_20px_rgba(185,28,28,0.4)] border border-[#B91C1C]/50 bg-gradient-to-r from-[#B91C1C] to-[#991B1B]'
                    : isParentActive
                    ? 'text-[#B91C1C] bg-[#B91C1C]/10 border border-[#B91C1C]/20'
                    : 'text-[#718096] hover:text-white hover:bg-white/5'
                  }
                  ${!isOpen ? 'justify-center w-12 px-0' : 'w-[90%]'}
                `}
              >
                <Icon size={20} strokeWidth={isDirectActive || isParentActive ? 2.5 : 2} className={`relative z-10 transition-transform duration-300 
                  ${isDirectActive ? 'scale-110 text-white' : ''}
                  ${isParentActive ? 'text-[#B91C1C]' : ''}
                  ${!isDirectActive && !isParentActive ? 'group-hover:scale-110' : ''} 
                `} />
                
                <div className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-between flex-1
                  ${isOpen ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}
                `}>
                  <span className={`text-sm tracking-wide uppercase ${isDirectActive || isParentActive ? 'font-bold' : 'font-medium group-hover:font-semibold'}`}>
                    {module.label}
                  </span>
                  {hasSubItems && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </button>

              {/* Submenu */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded && isOpen ? 'max-h-[500px] opacity-100 mt-2 pl-4' : 'max-h-0 opacity-0'}`}>
                <div className="border-l border-[#B91C1C]/20 pl-2 space-y-1">
                  {hasSubItems && module.subItems?.map((sub, idx) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(sub.id);
                        }}
                        className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-xs font-medium uppercase relative overflow-hidden group/sub
                          ${isSubActive 
                            ? 'text-white shadow-[0_0_15px_rgba(185,28,28,0.3)] border border-[#B91C1C]/50 font-bold bg-gradient-to-r from-[#B91C1C] to-[#991B1B]'
                            : 'text-[#718096] hover:text-[#B91C1C] hover:bg-[#B91C1C]/10' 
                          }
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 relative z-10 transition-all duration-300 ${isSubActive ? 'opacity-100 shadow-[0_0_5px_currentColor] bg-white' : 'opacity-50 group-hover/sub:opacity-100 group-hover/sub:shadow-[0_0_5px_#B91C1C]'}`}></span>
                        <span className="relative z-10">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-white/5 bg-[#111318] relative z-10">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full border-2 border-[#448C11] bg-[url('https://i.pravatar.cc/150?img=12')] bg-cover"></div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-[#D9D9D9] text-sm font-bold uppercase truncate w-32">T-DCC DEVELOPER</p>
              <p className="text-[#448C11] text-[10px] uppercase font-bold flex items-center gap-1">
                LOGGED IN
              </p>
            </div>
          )}
          {isOpen && <Settings size={18} className="ml-auto text-[#718096] hover:text-white cursor-pointer" />}
        </div>
      </div>
    </aside>
  );
}
