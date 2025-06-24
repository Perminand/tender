import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Toolbar, Typography, Button, TextField, Box, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface RequestRegistryRowDto {
  requestId: string;
  requestNumber: string;
  requestDate: string;
  organization: string;
  project: string;
  status: string;
  materialName: string;
  section: string;
  workType: string;
  size: string;
  quantity: number;
  unit: string;
  note: string;
  deliveryDate: string;
}

const columns = [
  { key: 'requestNumber', label: 'Номер заявки' },
  { key: 'requestDate', label: 'Дата заявки' },
  { key: 'organization', label: 'Организация' },
  { key: 'project', label: 'Проект' },
  { key: 'status', label: 'Статус' },
  { key: 'materialName', label: 'Материал' },
  { key: 'section', label: 'Участок' },
  { key: 'workType', label: 'Вид работ' },
  { key: 'size', label: 'Размер' },
  { key: 'quantity', label: 'Кол-во' },
  { key: 'unit', label: 'Ед. изм.' },
  { key: 'note', label: 'Примечание' },
  { key: 'deliveryDate', label: 'Поставить к дате' },
  { key: 'actions', label: 'Действия' },
];

export default function RequestRegistryPage() {
  const [data, setData] = useState<RequestRegistryRowDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    organization: '',
    project: '',
    status: '',
    fromDate: '',
    toDate: '',
    materialName: '',
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    const res = await axios.get<RequestRegistryRowDto[]>('/api/requests/registry', { params });
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleExport = async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    const res = await axios.get('/api/requests/registry/export', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registry.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" component="div">Реестр заявок</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/requests/new')}
            sx={{ mr: 2 }}
          >
            Создать заявку
          </Button>
          <Box component="form" onSubmit={handleFilterSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField name="organization" label="Организация" size="small" value={filters.organization} onChange={handleFilterChange} />
            <TextField name="project" label="Проект" size="small" value={filters.project} onChange={handleFilterChange} />
            <TextField name="status" label="Статус" size="small" value={filters.status} onChange={handleFilterChange} />
            <TextField name="fromDate" label="С даты" type="date" size="small" value={filters.fromDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
            <TextField name="toDate" label="По дату" type="date" size="small" value={filters.toDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
            <TextField name="materialName" label="Материал" size="small" value={filters.materialName} onChange={handleFilterChange} />
            <Button type="submit" variant="contained" color="primary">Фильтровать</Button>
            <Button type="button" variant="outlined" onClick={handleExport}>Экспорт в Excel</Button>
          </Box>
        </Box>
      </Toolbar>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => <TableCell key={col.key}>{col.label}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : data.map((row, idx) => (
              <TableRow key={row.requestId + '-' + idx}>
                {columns.slice(0, -1).map(col => (
                  <TableCell key={col.key}>{(row as any)[col.key]}</TableCell>
                ))}
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/requests/${row.requestId}/edit`)}
                  >
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 