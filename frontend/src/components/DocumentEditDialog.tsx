import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

interface DocumentEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (document: any) => void;
  relatedEntityId?: string;
  relatedEntityType?: string;
  relatedEntityData?: any;
  editingDocument?: any;
}

interface DocumentType {
  value: string;
  label: string;
  description: string;
}

const documentTypes: DocumentType[] = [
  { value: 'TENDER_DOCUMENTATION', label: 'Документация тендера', description: 'Техническое задание, условия тендера' },
  { value: 'TECHNICAL_SPECIFICATION', label: 'Техническое задание', description: 'Детальное описание требований' },
  { value: 'COMMERCIAL_OFFER', label: 'Коммерческое предложение', description: 'Предложение поставщика' },
  { value: 'CONTRACT', label: 'Договор', description: 'Контракт между сторонами' },
  { value: 'INVOICE', label: 'Счет', description: 'Счет на оплату' },
  { value: 'DELIVERY_NOTE', label: 'Накладная', description: 'Накладная на поставку' },
  { value: 'QUALITY_CERTIFICATE', label: 'Сертификат качества', description: 'Сертификат качества товара' },
  { value: 'OTHER', label: 'Прочее', description: 'Другие документы' }
];

const DocumentEditDialog: React.FC<DocumentEditDialogProps> = ({
  open,
  onClose,
  onSave,
  relatedEntityId,
  relatedEntityType,
  relatedEntityData,
  editingDocument
}) => {
  const [formData, setFormData] = useState({
    documentNumber: '',
    title: '',
    documentType: '',
    description: '',
    version: '1.0'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Автоматическое заполнение полей при открытии
  useEffect(() => {
    if (open) {
      if (editingDocument) {
        // Редактирование существующего документа
        setFormData({
          documentNumber: editingDocument.documentNumber || '',
          title: editingDocument.title || '',
          documentType: editingDocument.documentType || '',
          description: editingDocument.description || '',
          version: editingDocument.version || '1.0'
        });
      } else {
        // Создание нового документа
        const autoTitle = generateAutoTitle();
        const autoNumber = generateAutoNumber();
        
        setFormData({
          documentNumber: autoNumber,
          title: autoTitle,
          documentType: '',
          description: '',
          version: '1.0'
        });
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [open, editingDocument, relatedEntityData]);

  const generateAutoTitle = (): string => {
    if (!relatedEntityData) return '';
    
    const baseTitle = relatedEntityType === 'CONTRACT' ? 'Документ по контракту' :
                     relatedEntityType === 'TENDER' ? 'Документ тендера' :
                     relatedEntityType === 'REQUEST' ? 'Документ заявки' :
                     'Документ';
    
    if (relatedEntityData.contractNumber) {
      return `${baseTitle} ${relatedEntityData.contractNumber}`;
    }
    if (relatedEntityData.tenderNumber) {
      return `${baseTitle} ${relatedEntityData.tenderNumber}`;
    }
    if (relatedEntityData.requestNumber) {
      return `${baseTitle} ${relatedEntityData.requestNumber}`;
    }
    
    return baseTitle;
  };

  const generateAutoNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `DOC-${year}${month}${day}-${random}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Создаем превью для изображений
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      // Автоматически заполняем название если оно пустое
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Убираем расширение
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile && !editingDocument) {
      setError('Необходимо выбрать файл');
      return;
    }

    if (!formData.documentType) {
      setError('Необходимо выбрать тип документа');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('documentNumber', formData.documentNumber);
      submitData.append('title', formData.title);
      submitData.append('documentType', formData.documentType);
      submitData.append('description', formData.description);
      submitData.append('version', formData.version);
      
      if (relatedEntityId) {
        submitData.append('relatedEntityId', relatedEntityId);
      }
      if (relatedEntityType) {
        submitData.append('relatedEntityType', relatedEntityType);
      }
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      let response;
      if (editingDocument) {
        // Обновление существующего документа
        response = await api.put(`/api/documents/${editingDocument.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Создание нового документа
        response = await api.post('/api/documents/upload', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      onSave(response.data);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Ошибка при сохранении документа');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      documentNumber: '',
      title: '',
      documentType: '',
      description: '',
      version: '1.0'
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {editingDocument ? 'Редактировать документ' : 'Создать документ'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Информация о связанной сущности */}
        {relatedEntityData && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Связанная сущность:
            </Typography>
            <Grid container spacing={2}>
              {relatedEntityData.contractNumber && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Контракт:</strong> {relatedEntityData.contractNumber}
                  </Typography>
                </Grid>
              )}
              {relatedEntityData.tenderNumber && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Тендер:</strong> {relatedEntityData.tenderNumber}
                  </Typography>
                </Grid>
              )}
              {relatedEntityData.requestNumber && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Заявка:</strong> {relatedEntityData.requestNumber}
                  </Typography>
                </Grid>
              )}
              {relatedEntityData.supplierName && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Поставщик:</strong> {relatedEntityData.supplierName}
                  </Typography>
                </Grid>
              )}
              {relatedEntityData.customerName && (
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Заказчик:</strong> {relatedEntityData.customerName}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Номер документа *"
              value={formData.documentNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Версия"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название документа *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Тип документа *</InputLabel>
              <Select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                label="Тип документа *"
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body2">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
          
          {/* Загрузка файла */}
          <Grid item xs={12}>
            <Box sx={{ border: '2px dashed', borderColor: 'grey.300', borderRadius: 2, p: 3, textAlign: 'center' }}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              />
              <label htmlFor="file-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? 'Изменить файл' : 'Выбрать файл'}
                </Button>
              </label>
              
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={<AttachFileIcon />}
                    label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
                    onDelete={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    color="primary"
                  />
                </Box>
              )}
              
              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading || (!selectedFile && !editingDocument)}
        >
          {loading ? 'Сохранение...' : (editingDocument ? 'Обновить' : 'Создать')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentEditDialog; 