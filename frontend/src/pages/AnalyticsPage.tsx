import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalyticsStats, AnalyticsStats } from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnalyticsStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = stats ? [
    { label: 'Всего тендеров', value: stats.totalTenders },
    { label: 'Тендеров с предложениями', value: stats.tendersWithProposals },
    { label: 'Тендеров без предложений', value: stats.tendersWithoutProposals },
    { label: 'Всего предложений', value: stats.totalProposals },
    { label: 'Среднее предложений на тендер', value: stats.averageProposalsPerTender.toFixed(1) },
    { label: 'Активных тендеров', value: stats.activeTenders },
    { label: 'Завершённых тендеров', value: stats.completedTenders },
    { label: 'Отменённых тендеров', value: stats.cancelledTenders },
  ] : [];

  const coverageData = stats ? [
    { name: 'С предложениями', value: stats.tendersWithProposals },
    { name: 'Без предложений', value: stats.tendersWithoutProposals },
  ] : [];

  const statusData = stats ? [
    { name: 'Активные', value: stats.activeTenders },
    { name: 'Завершённые', value: stats.completedTenders },
    { name: 'Отменённые', value: stats.cancelledTenders },
  ] : [];

  const proposalsData = stats ? [
    { name: 'Всего предложений', value: stats.totalProposals },
    { name: 'Среднее на тендер', value: Math.round(stats.averageProposalsPerTender * 10) / 10 },
  ] : [];

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Аналитика тендеров</Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Карточки со статистикой */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">{stat.label}</Typography>
                <Typography variant="h4" color="primary">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Графики и диаграммы */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>Качество отклика на тендеры</Typography>
      
      <Grid container spacing={3}>
        {/* Круговая диаграмма покрытия тендеров предложениями */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Покрытие тендеров предложениями</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={coverageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {coverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Столбчатая диаграмма статусов тендеров */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Статусы тендеров</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Столбчатая диаграмма предложений */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Статистика предложений</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proposalsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Экспорт отчётов */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>Экспорт отчётов</Typography>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>Выгрузить тендеры в Excel</Button>
        <Button variant="contained" color="secondary">Выгрузить предложения в Excel</Button>
      </Box>
    </Box>
  );
};

export default AnalyticsPage; 