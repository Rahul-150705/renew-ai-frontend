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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to Renew AI Insurance Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const content = (
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${card.color}/20 flex items-center justify-center`}>
                  <card.icon className={`text-2xl ${card.textColor}`} />
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">{card.title}</h3>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
            );

            const className = `bg-card rounded-xl border border-border p-6 
              transition-all duration-300 hover:shadow-lg hover:-translate-y-1
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
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/policies"
              className="bg-card rounded-xl border border-border p-6 
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                hover:border-primary/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center
                  group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <FaFileContract className="text-xl text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View All Policies</h3>
                  <p className="text-sm text-muted-foreground">Browse and manage all policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/policies?action=add"
              className="bg-card rounded-xl border border-border p-6 
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                hover:border-success/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center
                  group-hover:bg-success group-hover:text-white transition-all duration-300">
                  <FaPlus className="text-xl text-success group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Add New Policy</h3>
                  <p className="text-sm text-muted-foreground">Create a new insurance policy</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
