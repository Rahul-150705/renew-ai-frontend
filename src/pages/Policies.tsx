import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFileContract, FaUser, FaClock, FaCheckCircle, FaPlus, FaEnvelope, FaPhone, FaTimes, FaTrash } from 'react-icons/fa';
import { policyAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Layout from '../components/Layout';

interface Policy {
  policyId: number;
  policyNumber: string;
  policyType: string;
  policyStatus: string;
  startDate: string;
  expiryDate: string;
  premium: number;
  premiumFrequency: string;
  policyDescription?: string;
  clientFullName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress?: string;
}

const Policies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientFullName: '',
    clientEmail: '',
    clientPhoneNumber: '',
    clientAddress: '',
    policyNumber: '',
    policyType: 'LIFE',
    startDate: '',
    expiryDate: '',
    premium: '',
    premiumFrequency: 'YEARLY',
    policyDescription: '',
  });

  useEffect(() => {
    fetchAllPolicies();
    
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
      setSearchParams({});
    }
  }, []);

  const fetchAllPolicies = async () => {
    try {
      const response = await policyAPI.getAllMyPolicies();
      const sortedPolicies = response.data.sort((a: Policy, b: Policy) => 
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
      setPolicies(sortedPolicies);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Fetch policies error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const policyData = {
      ...formData,
      premium: parseFloat(formData.premium),
    };

    try {
      await policyAPI.createPolicyWithClient(policyData);
      toast.success('Policy created successfully!');
      setShowModal(false);
      
      setFormData({
        clientFullName: '',
        clientEmail: '',
        clientPhoneNumber: '',
        clientAddress: '',
        policyNumber: '',
        policyType: 'LIFE',
        startDate: '',
        expiryDate: '',
        premium: '',
        premiumFrequency: 'YEARLY',
        policyDescription: '',
      });
      
      fetchAllPolicies();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create policy';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (policy: Policy) => {
    setPolicyToDelete(policy);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    setDeleting(true);
    try {
      await policyAPI.deletePolicy(policyToDelete.policyId);
      toast.success('Policy deleted successfully!');
      setShowDeleteModal(false);
      setPolicyToDelete(null);
      fetchAllPolicies();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete policy';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPolicyToDelete(null);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-success',
      EXPIRED: 'bg-destructive',
      RENEWED: 'bg-info',
      CANCELLED: 'bg-muted',
    };
    return colors[status] || 'bg-muted';
  };

  const filteredPolicies = policies.filter(policy => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return policy.policyStatus === 'ACTIVE';
    if (filter === 'EXPIRING') {
      const daysUntilExpiry = getDaysUntilExpiry(policy.expiryDate);
      return policy.policyStatus === 'ACTIVE' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }
    if (filter === 'EXPIRED') return policy.policyStatus === 'EXPIRED';
    return true;
  });

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.policyStatus === 'ACTIVE').length,
    expiring: policies.filter(p => {
      const days = getDaysUntilExpiry(p.expiryDate);
      return p.policyStatus === 'ACTIVE' && days <= 30 && days > 0;
    }).length,
    expired: policies.filter(p => p.policyStatus === 'EXPIRED').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="spinner" />
          <p className="text-muted-foreground">Loading policies...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Policies</h1>
            <p className="text-muted-foreground mt-1">Track and manage insurance policies</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
              font-medium hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            <FaPlus /> Add Policy
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all
              ${filter === 'ALL' ? 'border-primary shadow-glow' : 'border-border hover:border-primary/50'}`}
          >
            <FaFileContract className="text-2xl text-primary" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all
              ${filter === 'ACTIVE' ? 'border-success shadow-lg' : 'border-border hover:border-success/50'}`}
          >
            <FaCheckCircle className="text-2xl text-success" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-foreground">{stats.active}</p>
            </div>
          </button>
          <button
            onClick={() => setFilter('EXPIRING')}
            className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all
              ${filter === 'EXPIRING' ? 'border-warning shadow-lg' : 'border-border hover:border-warning/50'}`}
          >
            <FaClock className="text-2xl text-warning" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Expiring</p>
              <p className="text-xl font-bold text-foreground">{stats.expiring}</p>
            </div>
          </button>
          <button
            onClick={() => setFilter('EXPIRED')}
            className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all
              ${filter === 'EXPIRED' ? 'border-destructive shadow-lg' : 'border-border hover:border-destructive/50'}`}
          >
            <FaFileContract className="text-2xl text-destructive" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-xl font-bold text-foreground">{stats.expired}</p>
            </div>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ACTIVE', 'EXPIRING', 'EXPIRED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {f === 'ALL' ? `All (${stats.total})` : 
               f === 'ACTIVE' ? `Active (${stats.active})` :
               f === 'EXPIRING' ? `Expiring Soon (${stats.expiring})` :
               `Expired (${stats.expired})`}
            </button>
          ))}
        </div>

        {/* Policies Table */}
        {filteredPolicies.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <FaFileContract className="text-5xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'ALL' ? 'Start by adding your first policy' : `No ${filter.toLowerCase()} policies`}
            </p>
            {filter === 'ALL' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
                  font-medium hover:opacity-90 transition-all duration-200"
              >
                <FaPlus /> Add Policy
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Policy Number</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Client Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Premium</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expiry Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Days Left</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPolicies.map((policy) => {
                    const daysUntilExpiry = getDaysUntilExpiry(policy.expiryDate);
                    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                    return (
                      <tr 
                        key={policy.policyId} 
                        className={`hover:bg-secondary/30 transition-colors ${isExpiringSoon ? 'bg-warning/5' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-foreground">{policy.policyNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-primary" />
                            <span className="font-medium text-foreground">{policy.clientFullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FaEnvelope className="text-xs" />
                              <span>{policy.clientEmail}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FaPhone className="text-xs" />
                              <span>{policy.clientPhoneNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 rounded bg-secondary text-sm text-foreground">
                            {policy.policyType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-semibold text-foreground">₹{policy.premium}</span>
                            <span className="text-xs text-muted-foreground ml-1">/{policy.premiumFrequency}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">
                          {format(new Date(policy.expiryDate), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(policy.policyStatus)}`}>
                            {policy.policyStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {policy.policyStatus === 'ACTIVE' ? (
                            <span className={`font-medium ${
                              daysUntilExpiry <= 7 ? 'text-destructive' : 
                              daysUntilExpiry <= 30 ? 'text-warning' : 
                              'text-success'
                            }`}>
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDeleteClick(policy)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 
                              transition-all duration-200"
                            title="Delete policy"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && policyToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={handleDeleteCancel}
          >
            <div 
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Delete Policy</h2>
                <button 
                  onClick={handleDeleteCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                    hover:bg-secondary hover:text-foreground transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10">
                  <FaTrash className="text-2xl text-destructive" />
                  <div>
                    <p className="font-semibold text-foreground">Are you sure?</p>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Policy Number:</strong> {policyToDelete.policyNumber}</p>
                  <p><strong>Client:</strong> {policyToDelete.clientFullName}</p>
                  <p><strong>Type:</strong> {policyToDelete.policyType}</p>
                  <p><strong>Premium:</strong> ₹{policyToDelete.premium}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-secondary text-foreground font-medium
                      hover:bg-secondary/80 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-destructive text-white font-medium
                      hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Policy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Policy Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Add New Policy</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                    hover:bg-secondary hover:text-foreground transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    Client Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Client Full Name *</label>
                      <input
                        type="text"
                        name="clientFullName"
                        value={formData.clientFullName}
                        onChange={handleInputChange}
                        placeholder="Enter client full name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Client Email *</label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        placeholder="client@example.com"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Client Phone Number *</label>
                      <input
                        type="tel"
                        name="clientPhoneNumber"
                        value={formData.clientPhoneNumber}
                        onChange={handleInputChange}
                        placeholder="+919876543210"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Client Address</label>
                      <input
                        type="text"
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleInputChange}
                        placeholder="Full address (optional)"
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Policy Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    Policy Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Policy Number *</label>
                      <input
                        type="text"
                        name="policyNumber"
                        value={formData.policyNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., POL-2024-001"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Policy Type *</label>
                      <select
                        name="policyType"
                        value={formData.policyType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="LIFE">Life Insurance</option>
                        <option value="HEALTH">Health Insurance</option>
                        <option value="AUTO">Auto Insurance</option>
                        <option value="HOME">Home Insurance</option>
                        <option value="TRAVEL">Travel Insurance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Expiry Date *</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Premium Amount *</label>
                      <input
                        type="number"
                        name="premium"
                        value={formData.premium}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground placeholder:text-muted-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Frequency *</label>
                      <select
                        name="premiumFrequency"
                        value={formData.premiumFrequency}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border
                          text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-foreground">Policy Description</label>
                    <textarea
                      name="policyDescription"
                      value={formData.policyDescription}
                      onChange={handleInputChange}
                      placeholder="Additional policy details (optional)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border
                        text-foreground placeholder:text-muted-foreground resize-none
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-secondary text-foreground font-medium
                      hover:bg-secondary/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium
                      hover:opacity-90 transition-all shadow-glow"
                  >
                    Create Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Policies;