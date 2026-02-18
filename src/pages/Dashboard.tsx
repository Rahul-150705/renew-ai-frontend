import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileContract, FaClock, FaCheckCircle, FaPlus } from 'react-icons/fa';
import { policyAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

interface Policy {
  policyId: number;
  policyStatus: string;
  expiryDate: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    expiringPolicies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await policyAPI.getAllMyPolicies();
      const policies: Policy[] = response.data;

      const activePolicies = policies.filter(p => p.policyStatus === 'ACTIVE').length;
      
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const expiringPolicies = policies.filter(p => {
        if (p.policyStatus !== 'ACTIVE') return false;
        const expiryDate = new Date(p.expiryDate);
        return expiryDate >= today && expiryDate <= thirtyDaysLater;
      }).length;

      setStats({
        totalPolicies: policies.length,
        activePolicies,
        expiringPolicies,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Policies',
      value: stats.totalPolicies,
      icon: FaFileContract,
      color: 'bg-primary',
      textColor: 'text-primary',
      link: '/policies',
    },
    {
      title: 'Active Policies',
      value: stats.activePolicies,
      icon: FaCheckCircle,
      color: 'bg-success',
      textColor: 'text-success',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringPolicies,
      icon: FaClock,
      color: 'bg-warning',
      textColor: 'text-warning',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="spinner" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Overview</p>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to Renew AI Insurance Management</p>
          </div>
          <Link
            to="/policies?action=add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white
              font-semibold hover:opacity-90 hover:shadow-glow transition-all duration-300 active:scale-[0.98]"
          >
            <FaPlus /> Add Policy
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const content = (
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl ${card.color}/10 flex items-center justify-center`}>
                  <card.icon className={`text-2xl ${card.textColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-4xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
              </div>
            );

            const className = `bg-card rounded-2xl border border-border p-6 shadow-sm
              transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20
              ${card.link ? 'cursor-pointer' : ''}`;
            
            return card.link ? (
              <Link key={index} to={card.link} className={className}>
                {content}
              </Link>
            ) : (
              <div key={index} className={className}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              to="/policies"
              className="bg-card rounded-2xl border border-border p-6 shadow-sm
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                hover:border-primary/30 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center
                  group-hover:bg-gradient-primary group-hover:shadow-glow transition-all duration-300">
                  <FaFileContract className="text-2xl text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    View All Policies
                  </h3>
                  <p className="text-sm text-muted-foreground">Browse and manage all policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/policies?action=add"
              className="bg-card rounded-2xl border border-border p-6 shadow-sm
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                hover:border-success/30 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center
                  group-hover:bg-gradient-success group-hover:shadow-lg transition-all duration-300">
                  <FaPlus className="text-2xl text-success group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-success transition-colors">
                    Add New Policy
                  </h3>
                  <p className="text-sm text-muted-foreground">Create a new insurance policy</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FaClock className="text-xl text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Policy Renewals</h3>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-semibold text-warning">{stats.expiringPolicies}</span> policies 
                expiring within the next 30 days
              </p>
            </div>
            <Link
              to="/policies"
              className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;