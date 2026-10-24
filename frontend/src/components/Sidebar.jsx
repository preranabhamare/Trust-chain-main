import React from 'react';
import {
  LayoutDashboard,
  Users,
  Laptop,
  ShieldCheck,
  Radio,
  FileText,
  Network
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'devices', label: 'Device Inventory', icon: Laptop },
    { id: 'policies', label: 'Policy Engine', icon: ShieldCheck },
    { id: 'access', label: 'Access Requests', icon: Radio },
    { id: 'security', label: 'Security & Audit Log', icon: FileText },
    { id: 'integration', label: 'Team Architecture', icon: Network },
  ];

  return (
    <aside className="w-64 bg-[#18131e] border-r border-[#382e44] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 mb-4">
          
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#482d5a] text-[#e3cb85] border border-[#cda84f]/40 shadow-md shadow-[#482d5a]/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#241e2c]'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-[#e3cb85]' : 'text-stone-400'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

     
    </aside>
  );
}
