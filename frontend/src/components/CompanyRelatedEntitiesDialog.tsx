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

interface RequestInfo {
  id: string;
  requestNumber: string;
  status: string;
}

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
  role: string;
}

interface PaymentInfo {
  id: string;
  paymentNumber: string;
  status: string;
  role: string;
}

interface ContractInfo {
  id: string;
  contractNumber: string;
  status: string;
  role: string;
}

interface DeliveryInfo {
  id: string;
  deliveryNumber: string;
  status: string;
}

interface DocumentInfo {
  id: string;
  fileName: string;
  documentType: string;
}

interface CompanyRelatedEntitiesData {
  companyId: string;
  companyName: string;
  requests: RequestInfo[];
  tenders: TenderInfo[];
  invoices: InvoiceInfo[];
  payments: PaymentInfo[];
  contracts: ContractInfo[];
  deliveries: DeliveryInfo[];
  documents: DocumentInfo[];
  hasRelatedEntities: boolean;
}

interface CompanyRelatedEntitiesDialogProps {
  open: boolean;
  onClose: () => void;
  data: CompanyRelatedEntitiesData | null;
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
    case 'PENDING': return 'warning';
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
    case 'PENDING': return 'В ожидании';
    default: return status;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'supplier': return 'Поставщик';
    case 'customer': return 'Заказчик';
    default: return role;
  }
};

export const CompanyRelatedEntitiesDialog: React.FC<CompanyRelatedEntitiesDialogProps> = ({
  open,
  onClose,
  data
}) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Невозможно удалить компанию
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Компания <strong>{data.companyName}</strong> не может быть удалена, 
          так как с ней связаны следующие сущности:
        </Typography>

        {data.requests.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Заявки ({data.requests.length})
            </Typography>
            <List dense>
              {data.requests.map((request) => (
                <ListItem key={request.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={request.requestNumber}
                    secondary="Заявка"
                  />
                  <Chip
                    label={getStatusLabel(request.status)}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Счета ({data.invoices.length})
            </Typography>
            <List dense>
              {data.invoices.map((invoice) => (
                <ListItem key={invoice.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={invoice.invoiceNumber}
                    secondary={`Роль: ${getRoleLabel(invoice.role)}`}
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

        {data.payments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Платежи ({data.payments.length})
            </Typography>
            <List dense>
              {data.payments.map((payment) => (
                <ListItem key={payment.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={payment.paymentNumber}
                    secondary={`Роль: ${getRoleLabel(payment.role)}`}
                  />
                  <Chip
                    label={getStatusLabel(payment.status)}
                    color={getStatusColor(payment.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {data.contracts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Договоры ({data.contracts.length})
            </Typography>
            <List dense>
              {data.contracts.map((contract) => (
                <ListItem key={contract.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={contract.contractNumber}
                    secondary={`Роль: ${getRoleLabel(contract.role)}`}
                  />
                  <Chip
                    label={getStatusLabel(contract.status)}
                    color={getStatusColor(contract.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {data.deliveries.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Поставки ({data.deliveries.length})
            </Typography>
            <List dense>
              {data.deliveries.map((delivery) => (
                <ListItem key={delivery.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={delivery.deliveryNumber}
                    secondary="Поставка"
                  />
                  <Chip
                    label={getStatusLabel(delivery.status)}
                    color={getStatusColor(delivery.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {data.documents.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Документы ({data.documents.length})
            </Typography>
            <List dense>
              {data.documents.map((document) => (
                <ListItem key={document.id} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={document.fileName}
                    secondary={document.documentType}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          Для удаления компании необходимо сначала удалить или отвязать все связанные сущности.
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