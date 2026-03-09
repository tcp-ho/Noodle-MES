import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import PurchaseRequisitionPage from './components/PurchaseRequisitionPage';
import PurchaseOrderPage from './components/PurchaseOrderPage';
import PRAnalysisPage from './components/PRAnalysisPage';
import POAnalysisPage from './components/POAnalysisPage';
import SoakingPage from './components/SoakingPage';
import FreezerPage from './components/FreezerPage';
import FreezingProductivityPage from './components/FreezingProductivityPage';
import { LayoutDashboard, ShoppingBag, Container, Truck, ClipboardList, Factory, Microscope, Coins, FileJson, Database, CalendarDays, Settings, FileText, BarChart2, User, CreditCard, MessageSquare, Smile, Calendar, ArrowLeftRight, Layers, FileStack, RotateCcw, Receipt, History, Users, Wheat, ShieldAlert, Box, FileBarChart, Ruler, Scroll } from 'lucide-react';

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
  'book-open': FileText,
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
  'alert-circle': ShieldAlert,
  'scroll': Scroll,
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
          { id: 'soaking', label: 'SOAKING PROCESS' },
          { id: 'freezer', label: 'FREEZER PROCESS' },
          { id: 'freezing_productivity', label: 'FREEZING PRODUCTIVITY' },
          { id: 'prod_report', label: 'PRODUCTION REPORT' },
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

const GenericView = ({ title, iconName, desc }: { title: string, iconName: string, desc: string }) => {
  const Icon = IconMap[iconName] || LayoutDashboard;
  return (
    <div className="animate-fadeIn mt-32 pb-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1D24] uppercase tracking-widest">{title}</h2>
          <p className="text-xs text-[#718096] mt-1 font-mono">{desc || 'Noodle System Module'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 backdrop-blur-xl shadow-sm border border-gray-200 bg-white flex flex-col items-center justify-center min-h-[300px] text-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-6 bg-[#1A1D24]/5 rounded-full mb-4">
            <Icon size={48} className="text-[#B91C1C]" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1D24] uppercase tracking-wider">Module Ready</h3>
          <p className="text-sm text-[#718096] max-w-xs mt-2">
            This is the dashboard for {title}. Data visualization for noodle manufacturing processes will appear here.
          </p>
          <button className="mt-6 px-6 py-3 bg-[#1A1D24] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors shadow-md">
            Manage Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // DEV MODE: bypass login by setting isAuthenticated to true initially
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [currentUser, setCurrentUser] = useState<any>({
    username: 'admin',
    email: 'admin@noodlemaster.com',
    role: 'QA Manager'
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (username: string) => {
    setCurrentUser({
      username,
      email: 'admin@noodlemaster.com',
      role: 'QA Manager'
    });
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Find active module info
  let activeModuleInfo = { title: 'MODULE', icon: 'layout-dashboard', desc: 'System Module' };
  for (const module of SYSTEM_MODULES) {
    if (module.id === activeTab) {
      activeModuleInfo = { title: module.label, icon: module.icon, desc: 'Main Module' };
      break;
    }
    if (module.subItems) {
      const sub = module.subItems.find(s => s.id === activeTab);
      if (sub) {
        activeModuleInfo = { title: sub.label, icon: module.icon, desc: `${module.label} Module` };
        break;
      }
    }
  }

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-[#F4F3EF] text-[#2D3748]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
      />
      
      <main className="flex-1 relative transition-all duration-300 overflow-hidden">
        <Header />
        
        <div className="absolute inset-0 top-0 bottom-0 overflow-y-auto px-8 custom-scrollbar">
          {activeTab === 'dashboard' ? (
            <Dashboard />
          ) : activeTab === 'pr' ? (
            <PurchaseRequisitionPage />
          ) : activeTab === 'po' ? (
            <PurchaseOrderPage />
          ) : activeTab === 'pr_analysis' ? (
            <PRAnalysisPage />
          ) : activeTab === 'po_analysis' ? (
            <POAnalysisPage />
          ) : activeTab === 'soaking' ? (
            <SoakingPage />
          ) : activeTab === 'freezer' ? (
            <FreezerPage />
          ) : activeTab === 'freezing_productivity' ? (
            <FreezingProductivityPage />
          ) : (
            <GenericView title={activeModuleInfo.title} iconName={activeModuleInfo.icon} desc={activeModuleInfo.desc} />
          )}
          
          {/* Footer */}
          <footer className="mt-8 py-4 text-center border-t border-gray-200">
            <div className="flex flex-col items-center justify-center gap-1">
              <p className="text-[10px] font-bold text-[#1A1D24] tracking-widest uppercase flex items-center gap-2">
                <span className="text-[#D97706]">✨</span>
                NOODLE KING | THE FUTURE OF FOOD MANUFACTURING | GHPS/HACCP, ISO 9001, HALAL CERTIFIED
              </p>
              <p className="text-xs text-gray-500 font-mono tracking-wide flex items-center gap-2">
                System by <span className="font-bold text-[#1A1D24]">T All Intelligence</span> | <span className="text-[#B91C1C]">📞</span> 082-5695654 | <span className="text-[#2E7D32]">✉️</span> tallintelligence.ho@gmail.com
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
