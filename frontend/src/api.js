const BASE_URL = '/api';

export const api = {
  // Overview
  getOverview: async () => {
    const res = await fetch(`${BASE_URL}/overview`);
    if (!res.ok) throw new Error('Failed to load dashboard overview');
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create user');
    }
    return res.json();
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete user');
    }
    return res.json();
  },

  // Devices
  getDevices: async () => {
    const res = await fetch(`${BASE_URL}/devices`);
    if (!res.ok) throw new Error('Failed to load devices');
    return res.json();
  },

  registerDevice: async (deviceData) => {
    const res = await fetch(`${BASE_URL}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to register device');
    }
    return res.json();
  },

  updateDevice: async (id, deviceData) => {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    if (!res.ok) throw new Error('Failed to update device');
    return res.json();
  },

  toggleDeviceStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/devices/${id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to toggle device status');
    return res.json();
  },

  deleteDevice: async (id) => {
    const res = await fetch(`${BASE_URL}/devices/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete device');
    }
    return res.json();
  },

  // Policies
  getPolicies: async () => {
    const res = await fetch(`${BASE_URL}/policies`);
    if (!res.ok) throw new Error('Failed to load policies');
    return res.json();
  },

  createPolicy: async (policyData) => {
    const res = await fetch(`${BASE_URL}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create policy');
    }
    return res.json();
  },

  updatePolicy: async (id, policyData) => {
    const res = await fetch(`${BASE_URL}/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return res.json();
  },

  deletePolicy: async (id) => {
    const res = await fetch(`${BASE_URL}/policies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete policy');
    return res.json();
  },

  // Access Requests & Simulation
  getAccessRequests: async (decisionFilter = null) => {
    let url = `${BASE_URL}/access-requests`;
    if (decisionFilter) {
      url += `?decision=${decisionFilter}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load access requests');
    return res.json();
  },

  evaluateAccess: async (evalData) => {
    const res = await fetch(`${BASE_URL}/evaluate-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evalData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to evaluate access request');
    }
    return res.json();
  },

  // Security Events
  getSecurityEvents: async () => {
    const res = await fetch(`${BASE_URL}/security-events`);
    if (!res.ok) throw new Error('Failed to load security events');
    return res.json();
  },

  // Status integrations
  getEngineStatus: async () => {
    const res = await fetch(`${BASE_URL}/engine-status`);
    if (!res.ok) throw new Error('Failed to load engine status');
    return res.json();
  },

  getBlockchainStatus: async () => {
    const res = await fetch(`${BASE_URL}/blockchain-status`);
    if (!res.ok) throw new Error('Failed to load blockchain status');
    return res.json();
  },

  verifyBlockchainHash: async (hash) => {
    const res = await fetch(`${BASE_URL}/blockchain/verify-hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash }),
    });
    if (!res.ok) throw new Error('Failed to verify audit hash');
    return res.json();
  },

  recordAdminAction: async (actionData) => {
    const res = await fetch(`${BASE_URL}/blockchain/record-admin-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData),
    });
    if (!res.ok) throw new Error('Failed to record admin action');
    return res.json();
  },
};

