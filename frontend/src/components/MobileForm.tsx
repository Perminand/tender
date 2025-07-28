import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'switch' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  mobile?: boolean; // Показывать ли на мобильных
}

interface MobileFormProps {
  title?: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  isEdit?: boolean;
}

const MobileForm: React.FC<MobileFormProps> = ({
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitText = 'Сохранить',
  cancelText = 'Отмена',
  loading = false,
  isEdit = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Фильтруем поля для мобильных устройств
  const mobileFields = fields.filter(field => field.mobile !== false);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    mobileFields.forEach(field => {
      if (field.required && (!values[field.name] || values[field.name] === '')) {
        newErrors[field.name] = 'Это поле обязательно для заполнения';
      }
      
      if (field.type === 'email' && values[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[field.name])) {
          newErrors[field.name] = 'Введите корректный email';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(values);
    }
  };

  const renderField = (field: FormField) => {
    const value = values[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <FormControl 
            fullWidth 
            error={!!error}
            size={isMobile ? 'small' : 'medium'}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl 
            fullWidth 
            error={!!error}
            size={isMobile ? 'small' : 'medium'}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              label={field.label}
              onChange={(e) => handleChange(field.name, e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const option = field.options?.find(opt => opt.value === value);
                    return (
                      <Chip 
                        key={value} 
                        label={option?.label || value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={!!error}
            helperText={error}
            multiline
            rows={field.rows || 3}
            size={isMobile ? 'small' : 'medium'}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={!!error}
            helperText={error}
            size={isMobile ? 'small' : 'medium'}
          />
        );
    }
  };

  if (isMobile) {
    return (
      <Dialog 
        open={true} 
        fullScreen 
        onClose={onCancel}
        PaperProps={{
          sx: { 
            borderRadius: 0,
            '& .MuiDialogContent-root': {
              padding: 2
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">
            {title || (isEdit ? 'Редактирование' : 'Создание')}
          </Typography>
          {onCancel && (
            <IconButton onClick={onCancel} size="small">
              <CancelIcon />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              {mobileFields.map((field) => (
                <Grid item xs={12} key={field.name}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          {onCancel && (
            <Button 
              onClick={onCancel} 
              variant="outlined" 
              fullWidth
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Сохранение...' : submitText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {mobileFields.map((field) => (
            <Grid item xs={12} key={field.name}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button 
              onClick={onCancel} 
              variant="outlined"
              disabled={loading}
              startIcon={<CancelIcon />}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Сохранение...' : submitText}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MobileForm; 