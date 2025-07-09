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
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
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

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      showSnackbar('Документ удален', 'success');
      fetchDocuments();
    } catch (error) {
      showSnackbar('Ошибка при удалении документа', 'error');
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSnackbar('Документ скачан', 'success');
    } catch (error) {
      showSnackbar('Ошибка при скачивании документа', 'error');
    }
  };

  const handleSign = async (id: number) => {
    try {
      await fetch(`/api/documents/${id}/sign`, { method: 'POST' });
      showSnackbar('Документ подписан', 'success');
      fetchDocuments();
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
        await fetch(`/api/documents/${editingDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Документ обновлен', 'success');
      } else {
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Документ создан', 'success');
      }
      
      setDialogOpen(false);
      fetchDocuments();
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
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      DRAFT: 'Черновик',
      UPLOADED: 'Загружен',
      SIGNED: 'Подписан',
      EXPIRED: 'Истек',
    };
    return texts[status] || status;
  };

  const getDocumentTypeText = (type: string) => {
    const texts: { [key: string]: string } = {
      CONTRACT: 'Контракт',
      INVOICE: 'Счет',
      ACT: 'Акт',
      SPECIFICATION: 'Спецификация',
      CERTIFICATE: 'Сертификат',
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Документы
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего документов
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Черновики
              </Typography>
              <Typography variant="h4">
                {stats.draft}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Загружены
              </Typography>
              <Typography variant="h4">
                {stats.uploaded}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Подписаны
              </Typography>
              <Typography variant="h4">
                {stats.signed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Общий размер
              </Typography>
              <Typography variant="h4">
                {formatFileSize(stats.totalSize)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            {documents.map((document) => (
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
                    onClick={() => handleDelete(document.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Редактировать документ' : 'Создать документ'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="documentNumber"
                  label="Номер документа"
                  fullWidth
                  required
                  defaultValue={editingDocument?.documentNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Тип документа</InputLabel>
                  <Select name="documentType" defaultValue={editingDocument?.documentType || 'CONTRACT'}>
                    <MenuItem value="CONTRACT">Контракт</MenuItem>
                    <MenuItem value="INVOICE">Счет</MenuItem>
                    <MenuItem value="ACT">Акт</MenuItem>
                    <MenuItem value="SPECIFICATION">Спецификация</MenuItem>
                    <MenuItem value="CERTIFICATE">Сертификат</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Название"
                  fullWidth
                  required
                  defaultValue={editingDocument?.title}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="contractId"
                  label="ID контракта"
                  type="number"
                  fullWidth
                  required
                  defaultValue={editingDocument?.contractId}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="supplierId"
                  label="ID поставщика"
                  type="number"
                  fullWidth
                  required
                  defaultValue={editingDocument?.supplierId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Примечания"
                  multiline
                  rows={3}
                  fullWidth
                  defaultValue={editingDocument?.notes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {editingDocument ? 'Обновить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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