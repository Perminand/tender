import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import DocumentEditDialog from '../components/DocumentEditDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { api } from '../utils/api';

interface DocumentItem {
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

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/documents/${id}`);
      setDocument(response.data);
    } catch (error) {
      showSnackbar('Документ не найден', 'error');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!document) return;
    
    try {
      await api.delete(`/api/documents/${document.id}`);
      showSnackbar('Документ удален', 'success');
      navigate('/documents');
    } catch (error) {
      showSnackbar('Ошибка при удалении документа', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const response = await api.get(`/api/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.documentNumber || 'document'}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      showSnackbar('Документ скачан', 'success');
    } catch (error) {
      showSnackbar('Ошибка при скачивании документа', 'error');
    }
  };

  const handleSign = async () => {
    if (!document) return;
    
    try {
      await api.post(`/api/documents/${document.id}/sign`);
      showSnackbar('Документ подписан', 'success');
      fetchDocument(); // Обновляем данные
    } catch (error) {
      showSnackbar('Ошибка при подписании документа', 'error');
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Документ не найден</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/documents')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Документ: {document.documentNumber}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleEdit} color="primary">
            <EditIcon />
          </IconButton>
          {document.filePath && (
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          )}
          {document.status === 'UPLOADED' && (
            <IconButton onClick={handleSign} color="success">
              <DescriptionIcon />
            </IconButton>
          )}
          <IconButton onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Основная информация */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Номер документа
                  </Typography>
                  <Typography variant="body1">
                    {document.documentNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Название
                  </Typography>
                  <Typography variant="body1">
                    {document.title}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Тип документа
                  </Typography>
                  <Typography variant="body1">
                    {getDocumentTypeText(document.documentType)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Статус
                  </Typography>
                  <Chip
                    label={getStatusText(document.status)}
                    color={getStatusColor(document.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Контракт ID
                  </Typography>
                  <Typography variant="body1">
                    {document.contractId || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Поставщик ID
                  </Typography>
                  <Typography variant="body1">
                    {document.supplierId || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Файл
              </Typography>
              {document.filePath ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Размер файла
                    </Typography>
                    <Typography variant="body1">
                      {formatFileSize(document.fileSize)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Тип файла
                    </Typography>
                    <Typography variant="body1">
                      {document.mimeType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Путь к файлу
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {document.filePath}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Файл не загружен
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Даты */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Даты
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Дата создания
              </Typography>
              <Typography variant="body1">
                {document.createdAt ? dayjs(document.createdAt).format('DD.MM.YYYY HH:mm') : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Дата обновления
              </Typography>
              <Typography variant="body1">
                {document.updatedAt ? dayjs(document.updatedAt).format('DD.MM.YYYY HH:mm') : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Дата загрузки
              </Typography>
              <Typography variant="body1">
                {document.uploadedAt ? dayjs(document.uploadedAt).format('DD.MM.YYYY HH:mm') : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Дата подписания
              </Typography>
              <Typography variant="body1">
                {document.signedAt ? dayjs(document.signedAt).format('DD.MM.YYYY HH:mm') : '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Примечания */}
      {document.notes && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Примечания
            </Typography>
            <Typography variant="body1">
              {document.notes}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Диалог редактирования */}
      <DocumentEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={(savedDocument) => {
          setDocument(savedDocument);
          showSnackbar('Документ успешно обновлен', 'success');
          setEditDialogOpen(false);
        }}
        editingDocument={document}
      />

      {/* Диалог подтверждения удаления */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить этот документ? Это действие нельзя отменить."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
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

export default DocumentDetailPage; 