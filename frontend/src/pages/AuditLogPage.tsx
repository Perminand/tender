import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { api } from '../utils/api';

interface AuditLog {
  id: string;
  user?: { id: string; name: string } | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  sessionId: string;
  description: string;
  level: string;
}

const levelColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return 'error';
    case 'ERROR': return 'error';
    case 'WARNING': return 'warning';
    case 'INFO': return 'info';
    case 'DEBUG': return 'default';
    default: return 'default';
  }
};

const PAGE_SIZE = 20;

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = (pageNum: number) => {
    setLoading(true);
    api.get(`/api/audit-logs?page=${pageNum - 1}&size=${PAGE_SIZE}`)
      .then(res => {
        setLogs(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError('Ошибка при загрузке журнала аудита'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line
  }, [page]);

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Журнал аудита</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата/время</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Действие</TableCell>
              <TableCell>Сущность</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Уровень</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{log.user?.name || '-'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.entityType}</TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>
                  <Chip label={log.level} color={levelColor(log.level)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AuditLogPage; 