import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import DevicesView from './components/DevicesView';
import PoliciesView from './components/PoliciesView';
import AccessRequestsView from './components/AccessRequestsView';
import SecurityEventsView from './components/SecurityEventsView';
import IntegrationView from './components/IntegrationView';
import { api } from './api';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Data States
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [engineStatus, setEngineStatus] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        overviewData,
        usersData,
        devicesData,
        policiesData,
        requestsData,
        eventsData,
        engineData,
        bcData
      ] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getUsers().catch(() => []),
        api.getDevices().catch(() => []),
        api.getPolicies().catch(() => []),
        api.getAccessRequests().catch(() => []),
        api.getSecurityEvents().catch(() => []),
        api.getEngineStatus().catch(() => null),
        api.getBlockchainStatus().catch(() => null),
      ]);

      setOverview(overviewData);
      setUsers(usersData);
      setDevices(devicesData);
      setPolicies(policiesData);
      setRequests(requestsData);
      setEvents(eventsData);
      setEngineStatus(engineData);
      setBlockchainStatus(bcData);
      setError(null);
    } catch (err) {
      console.error('Error fetching TrustChain data:', err);
      setError(err.message || 'Failed to communicate with TrustChain API');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Auto refresh every 30 seconds for live zero trust telemetry
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#151119] text-[#f3f0e6] flex flex-col font-sans selection:bg-[#cda84f] selection:text-[#151119]">
      {/* Top Professional Header */}
      <Header
        systemHealth={overview?.system_health || 'OPTIMAL'}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#151119]">
          <div className="max-w-7xl mx-auto space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong className="font-semibold">Backend Connection Alert: </strong>
                  <span>{error}. Ensure the FastAPI server is running on port 8000.</span>
                </div>
              </div>
            )}

            {/* Dynamic View Switching */}
            {activeTab === 'dashboard' && (
              <DashboardView
                overview={overview}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                users={users}
                onRefresh={fetchAllData}
                api={api}
              />
            )}

            {activeTab === 'devices' && (
              <DevicesView
                devices={devices}
                users={users}
                onRefresh={fetchAllData}
                api={api}
              />
            )}

            {activeTab === 'policies' && (
              <PoliciesView
                policies={policies}
                onRefresh={fetchAllData}
                api={api}
              />
            )}

            {activeTab === 'access' && (
              <AccessRequestsView
                requests={requests}
                users={users}
                devices={devices}
                onRefresh={fetchAllData}
                api={api}
              />
            )}

            {activeTab === 'security' && (
              <SecurityEventsView
                events={events}
                blockchainStatus={blockchainStatus}
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'integration' && (
              <IntegrationView
                engineStatus={engineStatus}
                blockchainStatus={blockchainStatus}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
