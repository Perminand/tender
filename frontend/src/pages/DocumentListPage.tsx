import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import DocumentEditDialog from '../components/DocumentEditDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { api } from '../utils/api';

interface Document {
  id: number;
  documentNumber: string;
  title: string;
  documentType: string;
  status: string;
  contractId: number;
  supplierId: number;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  signedAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const DocumentListPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [statusStats, setStatusStats] = useState<{ [key: string]: number }>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Загрузка статистики по статусам
  const fetchStatusStats = async () => {
    try {
      const response = await api.get('/api/documents/status-stats');
      setStatusStats(response.data);
    } catch (e) {}
  };
  useEffect(() => { fetchStatusStats(); }, []);
  const reloadAll = () => { fetchDocuments(); fetchStatusStats(); };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/document-registry/export', {
        responseType: 'blob'
      });
      // Получаем имя файла из заголовка Content-Disposition
      let fileName = 'Реестр_документов.xlsx';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=\"(.+?)\"/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
      }
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.data.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showSnackbar('Ошибка при экспорте в Excel', 'error');
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке документов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setDialogOpen(true);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setDialogOpen(true);
  };

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      await api.delete(`/api/documents/${documentToDelete.id}`);
      showSnackbar('Документ удален', 'success');
      reloadAll();
    } catch (error) {
      showSnackbar('Ошибка при удалении документа', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Получаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `document_${id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
      }
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      showSnackbar('Документ скачан', 'success');
    } catch (error) {
      showSnackbar('Ошибка при скачивании документа', 'error');
    }
  };

  const handleSign = async (id: number) => {
    try {
      await api.post(`/api/documents/${id}/sign`);
      showSnackbar('Документ подписан', 'success');
      reloadAll();
    } catch (error) {
      showSnackbar('Ошибка при подписании документа', 'error');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const submitData = {
        documentNumber: formData.get('documentNumber'),
        title: formData.get('title'),
        documentType: formData.get('documentType'),
        contractId: Number(formData.get('contractId')),
        supplierId: Number(formData.get('supplierId')),
        notes: formData.get('notes'),
      };

      if (editingDocument) {
        await api.put(`/api/documents/${editingDocument.id}`, submitData);
        showSnackbar('Документ обновлен', 'success');
      } else {
        await api.post('/api/documents', submitData);
        showSnackbar('Документ создан', 'success');
      }
      
      setDialogOpen(false);
      reloadAll();
    } catch (error) {
      showSnackbar('Ошибка при сохранении документа', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      DRAFT: 'default',
      UPLOADED: 'info',
      SIGNED: 'success',
      EXPIRED: 'error',
      ACTIVE: 'success', // Added ACTIVE status
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      DRAFT: 'Черновик',
      UPLOADED: 'Загружен',
      SIGNED: 'Подписан',
      EXPIRED: 'Истёк',
      ACTIVE: 'Активный', // Added ACTIVE status
    };
    return texts[status] || status;
  };

  const getDocumentTypeText = (type: string) => {
    const texts: { [key: string]: string } = {
      CONTRACT: 'Контракт',
      INVOICE: 'Счёт',
      ACT: 'Акт',
      SPECIFICATION: 'Спецификация',
      CERTIFICATE: 'Сертификат',
      COMMERCIAL_OFFER: 'Коммерческое предложение',
      TECHNICAL_SPECIFICATION: 'Техническое задание',
      PROTOCOL: 'Протокол',
      TENDER_DOCUMENTATION: 'Тендерная документация',
    };
    return texts[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'DRAFT').length,
    uploaded: documents.filter(d => d.status === 'UPLOADED').length,
    signed: documents.filter(d => d.status === 'SIGNED').length,
    totalSize: documents.reduce((sum, d) => sum + (d.fileSize || 0), 0),
  };

  // Фильтрация документов по статусу
  const filteredDocuments = statusFilter ? documents.filter(d => d.status === statusFilter) : documents;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Документы
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={handleExportExcel}
        >
          Экспорт в Excel
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={2.4}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === '' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего документов
              </Typography>
              <Typography variant="h4">
                {Object.values(statusStats).reduce((a, b) => a + b, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'DRAFT' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('DRAFT')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Черновики
              </Typography>
              <Typography variant="h4">
                {statusStats.DRAFT || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'UPLOADED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('UPLOADED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Загружены
              </Typography>
              <Typography variant="h4">
                {statusStats.UPLOADED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'SIGNED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('SIGNED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Подписаны
              </Typography>
              <Typography variant="h4">
                {statusStats.SIGNED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'EXPIRED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('EXPIRED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Истёкшие
              </Typography>
              <Typography variant="h4">
                {statusStats.EXPIRED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Панель фильтров */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="DRAFT">Черновик</MenuItem>
                  <MenuItem value="UPLOADED">Загружен</MenuItem>
                  <MenuItem value="SIGNED">Подписан</MenuItem>
                  <MenuItem value="EXPIRED">Истёк</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Номер документа"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по номеру документа при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Поставщик"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по поставщику при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата от"
                  value={null}
                  onChange={() => {}}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                  disabled
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата до"
                  value={null}
                  onChange={() => {}}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                  disabled
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="outlined"
                onClick={() => setStatusFilter('')}
                fullWidth
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Кнопка создания */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Создать документ
        </Button>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Контракт</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell>Дата загрузки</TableCell>
              <TableCell>Дата подписания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{document.documentNumber}</TableCell>
                <TableCell>{document.title}</TableCell>
                <TableCell>{getDocumentTypeText(document.documentType)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(document.status)}
                    color={getStatusColor(document.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{document.contractId}</TableCell>
                <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                <TableCell>
                  {document.uploadedAt ? dayjs(document.uploadedAt).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  {document.signedAt ? dayjs(document.signedAt).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/documents/${document.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(document)}
                  >
                    <EditIcon />
                  </IconButton>
                  {document.filePath && (
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(document.id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                  {document.status === 'UPLOADED' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleSign(document.id)}
                    >
                      <DescriptionIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(document)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог создания/редактирования документа */}
      <DocumentEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(savedDocument) => {
          setDocuments(prev => [...prev, savedDocument]);
          showSnackbar('Документ успешно создан', 'success');
          setDialogOpen(false);
        }}
        editingDocument={editingDocument}
      />

      {/* Диалог подтверждения удаления */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить документ "${documentToDelete?.title || documentToDelete?.documentNumber}"? Это действие нельзя отменить.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        }}
        confirmText="Удалить"
        cancelText="Отмена"
        severity="error"
      />

      {/* Снэкбар для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentListPage; 