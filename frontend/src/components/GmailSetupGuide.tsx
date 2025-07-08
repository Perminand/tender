import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Alert,
  Link
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';

interface GmailSetupGuideProps {
  open: boolean;
  onClose: () => void;
}

const GmailSetupGuide: React.FC<GmailSetupGuideProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" />
          Настройка Gmail для отправки email
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Внимание:</strong> Gmail требует использования пароля приложения для SMTP. 
            Обычный пароль от аккаунта не подойдет!
          </Typography>
        </Alert>

        <Typography variant="h6" gutterBottom>
          Пошаговая инструкция:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="1. Включите двухфакторную аутентификацию"
              secondary="Перейдите в настройки безопасности Google"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="2. Откройте настройки безопасности"
              secondary={
                <>
                  Перейдите по ссылке:{' '}
                  <Link href="https://myaccount.google.com/security" target="_blank" rel="noopener">
                    https://myaccount.google.com/security
                  </Link>
                </>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="3. Найдите раздел 'Пароли приложений'"
              secondary="Прокрутите вниз до раздела 'Вход в аккаунт Google'"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="4. Создайте пароль приложения"
              secondary="Выберите 'Почта' и нажмите 'Создать'"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="5. Скопируйте 16-значный пароль"
              secondary="Этот пароль будет показан только один раз!"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="6. Вставьте пароль в настройки"
              secondary="Используйте этот пароль вместо обычного пароля от Gmail"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Совет:</strong> Если вы не видите раздел "Пароли приложений", 
            убедитесь что двухфакторная аутентификация включена и прошло некоторое время 
            после её активации.
          </Typography>
        </Alert>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Настройки SMTP для Gmail:
          </Typography>
          <Typography variant="body2" component="div">
            <strong>SMTP хост:</strong> smtp.gmail.com<br/>
            <strong>SMTP порт:</strong> 587<br/>
            <strong>Безопасность:</strong> TLS (включено)<br/>
            <strong>Аутентификация:</strong> Да<br/>
            <strong>Пароль:</strong> Пароль приложения (16 символов)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Понятно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GmailSetupGuide; 