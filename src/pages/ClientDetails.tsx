import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileContract, FaPlus, FaTimes } from 'react-icons/fa';
import { clientAPI, policyAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Layout from '../components/Layout';

interface Client {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
}

interface Policy {
  id: number;
  policyNumber: string;
  policyType: string;
  status: string;
  startDate: string;
  expiryDate: string;
  premium: number;
  premiumFrequency: string;
  description?: string;
}

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    policyNumber: '',
    policyType: 'LIFE',
    startDate: '',
    expiryDate: '',
    premium: '',
    premiumFrequency: 'YEARLY',
    description: '',
  });

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const clientResponse = await clientAPI.getClientById(clientId!);
      setClient(clientResponse.data);

      // Note: The API might need adjustment based on your backend
      // For now, we'll assume policies come with the client or from a separate endpoint
      setPolicies(clientResponse.data.policies || []);
    } catch (error) {
      toast.error('Failed to fetch client details');
      console.error('Fetch error:', error);
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
      clientFullName: client?.fullName || '',
      clientEmail: client?.email || '',
      clientPhoneNumber: client?.phoneNumber || '',
      clientAddress: client?.address || '',
      policyNumber: formData.policyNumber,
      policyType: formData.policyType,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      premium: parseFloat(formData.premium),
      premiumFrequency: formData.premiumFrequency,
      policyDescription: formData.description,
    };

    try {
      await policyAPI.createPolicyWithClient(policyData);
      toast.success('Policy created successfully');
      setShowModal(false);
      setFormData({
        policyNumber: '',
        policyType: 'LIFE',
        startDate: '',
        expiryDate: '',
        premium: '',
        premiumFrequency: 'YEARLY',
        description: '',
      });
      fetchClientDetails();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create policy';
      toast.error(errorMessage);
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="spinner" />
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-semibold text-foreground">Client not found</h2>
          <button
            onClick={() => navigate('/clients')}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium
              hover:opacity-90 transition-all"
          >
            Back to Clients
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaArrowLeft /> Back to Clients
        </button>

        {/* Client Header Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center
              text-3xl font-bold text-white flex-shrink-0">
              {client.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.fullName}</h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FaEnvelope /> {client.email}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FaPhone /> {client.phoneNumber}
                </span>
                {client.address && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FaMapMarkerAlt /> {client.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Insurance Policies</h2>
              <p className="text-muted-foreground">
                {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
                font-medium hover:opacity-90 transition-all duration-200 shadow-glow"
            >
              <FaPlus /> Add Policy
            </button>
          </div>

          {policies.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <FaFileContract className="text-5xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No policies yet</h3>
              <p className="text-muted-foreground mb-4">Add a policy to start tracking renewals</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
                  font-medium hover:opacity-90 transition-all duration-200"
              >
                <FaPlus /> Add Policy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((policy) => {
                const daysUntilExpiry = getDaysUntilExpiry(policy.expiryDate);
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                return (
                  <div key={policy.id} className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{policy.policyType}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{policy.policyNumber}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Premium</span>
                        <p className="font-semibold text-foreground">₹{policy.premium}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency</span>
                        <p className="font-semibold text-foreground">{policy.premiumFrequency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <p className="font-semibold text-foreground">
                          {format(new Date(policy.startDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expiry Date</span>
                        <p className="font-semibold text-foreground">
                          {format(new Date(policy.expiryDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>

                    {isExpiringSoon && (
                      <div className="mt-4 p-3 rounded-lg bg-warning/20 text-warning text-sm font-medium">
                        ⚠️ Expires in {daysUntilExpiry} days
                      </div>
                    )}

                    {policy.description && (
                      <p className="mt-4 text-sm text-muted-foreground">{policy.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Policy Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-lg"
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional details (optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border
                      text-foreground placeholder:text-muted-foreground resize-none
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
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

export default ClientDetails;
