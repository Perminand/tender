import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface TenderInfo {
  id: string;
  tenderNumber: string;
  title: string;
  status: string;
}

interface InvoiceInfo {
  id: string;
  invoiceNumber: string;
  status: string;
  supplierName: string;
}

interface RelatedEntitiesData {
  requestId: string;
  requestNumber: string;
  tenders: TenderInfo[];
  invoices: InvoiceInfo[];
  hasRelatedEntities: boolean;
}

interface RelatedEntitiesDialogProps {
  open: boolean;
  onClose: () => void;
  data: RelatedEntitiesData | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'default';
    case 'SAVED': return 'primary';
    case 'SUBMITTED': return 'warning';
    case 'APPROVED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    case 'SENT': return 'warning';
    case 'CONFIRMED': return 'success';
    case 'PAID': return 'success';
    case 'PARTIALLY_PAID': return 'info';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Черновик';
    case 'SAVED': return 'Сохранен';
    case 'SUBMITTED': return 'Подана';
    case 'APPROVED': return 'Одобрена';
    case 'IN_PROGRESS': return 'В работе';
    case 'COMPLETED': return 'Завершена';
    case 'CANCELLED': return 'Отменена';
    case 'SENT': return 'Отправлен';
    case 'CONFIRMED': return 'Подтвержден';
    case 'PAID': return 'Оплачен';
    case 'PARTIALLY_PAID': return 'Частично оплачен';
    default: return status;
  }
};

export const RelatedEntitiesDialog: React.FC<RelatedEntitiesDialogProps> = ({
  open,
  onClose,
  data
}) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Невозможно удалить заявку
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Заявка <strong>{data.requestNumber}</strong> не может быть удалена, 
          так как с ней связаны следующие сущности:
        </Typography>

        {data.tenders.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Тендеры ({data.tenders.length})
            </Typography>
            <List dense>
              {data.tenders.map((tender) => (
                <ListItem key={tender.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={tender.title || tender.tenderNumber}
                    secondary={`Номер: ${tender.tenderNumber}`}
                  />
                  <Chip
                    label={getStatusLabel(tender.status)}
                    color={getStatusColor(tender.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {data.invoices.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Счета ({data.invoices.length})
            </Typography>
            <List dense>
              {data.invoices.map((invoice) => (
                <ListItem key={invoice.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={invoice.invoiceNumber}
                    secondary={`Поставщик: ${invoice.supplierName}`}
                  />
                  <Chip
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          Для удаления заявки необходимо сначала удалить или отвязать все связанные сущности.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Понятно
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 