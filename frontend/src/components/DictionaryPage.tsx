import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ArrowBack as ArrowBackIcon, 
  FileDownload as FileDownloadIcon, 
  FileUpload as FileUploadIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ConfirmationDialog from './ConfirmationDialog';

export interface DictionaryItem {
  id: string;
  [key: string]: any;
}

export interface DictionaryField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email';
  required?: boolean;
}

export interface DictionaryPageProps {
  title: string;
  description: string;
  apiEndpoint: string;
  fields: DictionaryField[];
  backUrl: string;
  exportFileName: string;
  searchFields?: string[];
  renderRow?: (item: DictionaryItem) => React.ReactNode;
  transformData?: (data: any) => DictionaryItem;
  validateForm?: (formData: any) => string | null;
}

const DictionaryPage: React.FC<DictionaryPageProps> = ({
  title,
  description,
  apiEndpoint,
  fields,
  backUrl,
  exportFileName,
  searchFields = ['name'],
  renderRow,
  transformData,
  validateForm
}) => {
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [importLog, setImportLog] = useState<{imported: number, errors: {row: number, message: string}[]} | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DictionaryItem | null>(null);

  // Инициализация formData
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  }, [fields]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(apiEndpoint);
      const data = response.data;
        const transformedData = transformData ? data.map(transformData) : data;
        setItems(transformedData);
    } catch (error) {
      console.error('Error fetching items:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка сети при загрузке данных',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [apiEndpoint]);

  const handleOpenDialog = (item?: DictionaryItem) => {
    if (item) {
      setEditingItem(item);
      const itemData: Record<string, any> = {};
      fields.forEach(field => {
        itemData[field.name] = item[field.name] || '';
      });
      setFormData(itemData);
    } else {
      setEditingItem(null);
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  };

  const handleSubmit = async () => {
    // Валидация формы
    if (validateForm) {
      const error = validateForm(formData);
      if (error) {
        setSnackbar({
          open: true,
          message: error,
          severity: 'error'
        });
        return;
      }
    }

    try {
      const url = editingItem 
        ? `${apiEndpoint}/${editingItem.id}`
        : apiEndpoint;
      
      let response;
      if (editingItem) {
        response = await api.put(url, formData);
      } else {
        response = await api.post(url, formData);
      }

        handleCloseDialog();
        fetchItems();
        setSnackbar({
          open: true,
          message: editingItem ? 'Элемент успешно обновлен' : 'Элемент успешно добавлен',
          severity: 'success'
        });
    } catch (error: any) {
      console.error('Error saving item:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Ошибка при сохранении';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = (item: DictionaryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`${apiEndpoint}/${itemToDelete.id}`);
        fetchItems();
        setSnackbar({
          open: true,
          message: 'Элемент успешно удален',
          severity: 'success'
        });
    } catch (error: any) {
      console.error('Error deleting item:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Ошибка при удалении';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`${apiEndpoint}/export`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'Экспорт выполнен успешно',
        severity: 'success'
      });
    } catch (error) {
      console.error("Failed to export:", error);
      setSnackbar({
        open: true,
        message: 'Ошибка при экспорте',
        severity: 'error'
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`${apiEndpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data;
      setImportLog(result);
      setImportDialogOpen(true);
      fetchItems();
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Ошибка сети или сервера';
      setImportLog({imported: 0, errors: [{row: 0, message: errorMessage}]});
      setImportDialogOpen(true);
    }
  };

  const filteredItems = items.filter(item =>
    searchFields.some(field => 
      item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const defaultRenderRow = (item: DictionaryItem) => (
    <TableRow key={item.id}>
      {fields.map(field => (
        <TableCell key={field.name}>{item[field.name]}</TableCell>
      ))}
      <TableCell align="right">
        <IconButton
          onClick={() => handleOpenDialog(item)}
          color="primary"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => handleDelete(item)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(backUrl)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleExport}
            >
              Экспорт в Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleImportClick}
            >
              Импорт из Excel
            </Button>
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <TextField
              fullWidth
              label="Поиск"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {fields.map(field => (
                      <TableCell key={field.name}>{field.label}</TableCell>
                    ))}
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderRow ? 
                    filteredItems.map(renderRow) : 
                    filteredItems.map(defaultRenderRow)
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingItem ? 'Редактировать' : 'Добавить'}
          </DialogTitle>
          <DialogContent>
            {fields.map((field, index) => (
              <TextField
                key={field.name}
                autoFocus={index === 0}
                margin="dense"
                label={field.label}
                type={field.type || 'text'}
                fullWidth
                variant="outlined"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
                sx={{ mb: 2 }}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingItem ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Результат импорта</DialogTitle>
          <DialogContent>
            <Typography>Успешно импортировано: <b>{importLog?.imported ?? 0}</b></Typography>
            <Typography>Ошибок: <b>{importLog?.errors?.length ?? 0}</b></Typography>
            {importLog?.errors && importLog.errors.length > 0 && (
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Строка</TableCell>
                    <TableCell>Ошибка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importLog.errors.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell>{err.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <ConfirmationDialog
          open={deleteDialogOpen}
          title="Удаление"
          message={`Вы уверены, что хотите удалить этот элемент?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
          }}
        />
      </Box>
    </Container>
  );
};

export default DictionaryPage; 