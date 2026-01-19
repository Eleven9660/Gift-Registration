import { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { client } from '../client';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, value: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, we would run an aggregation query or maintain a counter.
      // Here we fetch list and calculate client-side for MVP.
      const { data: items } = await client.models.Declaration.list();
      
      const total = items.length;
      const pending = items.filter(i => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length;
      const value = items.reduce((acc, curr) => acc + curr.estimatedValue, 0);

      setStats({ total, pending, value });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center' }}>
      <Typography variant="h4" color={color} fontWeight="bold">
        {loading ? <CircularProgress size={30} /> : value}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the Gift Registration System. Please declare all gifts received or provided.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <KPICard title="My Declarations" value={stats.total} color="primary.main" />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard title="Pending Approval" value={stats.pending} color="warning.main" />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard title="Total Value (KES)" value={`KES ${stats.value.toLocaleString()}`} color="success.main" />
        </Grid>
      </Grid>

      {/* Quick Actions or Recent List could go here */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        <Typography variant="body2" color="text.secondary">
             No recent activity to display.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
