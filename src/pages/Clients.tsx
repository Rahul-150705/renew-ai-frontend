import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { clientAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

interface Client {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getMyClients();
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await clientAPI.createClient(formData);
      toast.success('Client created successfully');
      setShowModal(false);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
      });
      fetchClients();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create client';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="spinner" />
          <p className="text-muted-foreground">Loading clients...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">Manage your insurance clients</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
              font-medium hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            <FaPlus /> Add Client
          </button>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <FaUser className="text-5xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first client</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white
                font-medium hover:opacity-90 transition-all duration-200"
            >
              <FaPlus /> Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="bg-card rounded-xl border border-border p-6 
                  transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                  hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center
                    text-xl font-bold text-white flex-shrink-0">
                    {client.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{client.fullName}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FaEnvelope className="flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FaPhone className="flex-shrink-0" />
                        <span>{client.phoneNumber}</span>
                      </div>
                      {client.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FaMapMarkerAlt className="flex-shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Add Client Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Add New Client</h2>
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
                  <label className="text-sm font-medium text-foreground">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890 (E.164 format)"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address (optional)"
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
                    Create Client
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

export default Clients;
