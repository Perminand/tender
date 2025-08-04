import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Collapse,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface RequestProcessBriefProps {
  request: {
    requestId: string;
    requestNumber: string;
    requestDate: string;
    organization: string;
    project: string;
    location: string;
    applicant: string;
    approver: string;
    performer: string;
    deliveryDeadline: string;
    status: string;
    notes: string;
    requestTotalAmount: number;
    tenderTotalAmount: number;
    deltaAmount: number;
    materialsCount: number;
    tendersCount: number;
    proposalsCount: number;
    contractsCount: number;
    invoicesCount: number;
    deliveriesCount: number;
    receiptsCount: number;
  };
  onExpand?: () => void;
  expanded?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out'
  }
}));

const ProcessStep = styled(Box)(({ theme, color }: { theme: any; color: string }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '48px'
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme: any; status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
      case 'RECEIVED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
      case 'PARTIALLY_PAID':
      case 'PARTIALLY_RECEIVED':
        return theme.palette.warning.main;
      case 'CANCELLED':
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return {
    backgroundColor: getStatusColor(status),
    color: theme.palette.getContrastText(getStatusColor(status)),
    fontWeight: 'bold'
  };
});

export default function RequestProcessBrief({ request, onExpand, expanded = false }: RequestProcessBriefProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Черновик';
      case 'SUBMITTED':
        return 'Подана';
      case 'APPROVED':
        return 'Одобрена';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершена';
      case 'CANCELLED':
        return 'Отменена';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
      case 'RECEIVED':
        return <CheckCircleIcon />;
      case 'IN_PROGRESS':
      case 'PARTIALLY_PAID':
      case 'PARTIALLY_RECEIVED':
        return <WarningIcon />;
      case 'CANCELLED':
      case 'REJECTED':
        return <ErrorIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getStepColor = (step: string, count: number) => {
    if (count === 0) return '#f5f5f5'; // Серый для отсутствующих шагов
    switch (step) {
      case 'request':
        return '#fff3cd'; // Желтый для заявки
      case 'tender':
        return '#d1ecf1'; // Голубой для тендера
      case 'proposals':
        return '#d4edda'; // Зеленый для предложений
      case 'contracts':
        return '#e2e3e5'; // Серый для контрактов
      case 'invoices':
        return '#f8d7da'; // Красный для счетов
      case 'deliveries':
        return '#fff3cd'; // Желтый для поставок
      default:
        return '#f8f9fa';
    }
  };

  return (
    <StyledCard>
      <CardContent>
        {/* Заголовок заявки */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" component="h2" color="primary">
              Заявка № {request.requestNumber}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formatDate(request.requestDate)} • {request.location}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StatusChip
              label={getStatusLabel(request.status)}
              status={request.status}
              icon={getStatusIcon(request.status)}
              size="small"
            />
            {onExpand && (
              <IconButton onClick={onExpand} size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Основная информация */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Организация:</strong> {request.organization}
            </Typography>
            <Typography variant="body2">
              <strong>Проект:</strong> {request.project}
            </Typography>
            <Typography variant="body2">
              <strong>Заявитель:</strong> {request.applicant}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Согласователь:</strong> {request.approver}
            </Typography>
            <Typography variant="body2">
              <strong>Исполнитель:</strong> {request.performer}
            </Typography>
            <Typography variant="body2">
              <strong>Срок поставки:</strong> {formatDate(request.deliveryDeadline)}
            </Typography>
          </Grid>
        </Grid>

        {/* Финансовая информация */}
        <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Финансовые показатели
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Заявка
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(request.requestTotalAmount)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Тендер
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(request.tenderTotalAmount)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Дельта
              </Typography>
              <Typography variant="h6" color={request.deltaAmount >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(request.deltaAmount)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Цепочка процесса */}
        <Typography variant="subtitle2" gutterBottom>
          Цепочка процесса
        </Typography>
        
        <ProcessStep color={getStepColor('request', 1)}>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon />
            <Typography variant="body2">
              Заявка № {request.requestNumber}
            </Typography>
          </Box>
          <Typography variant="body2">
            {request.materialsCount} материалов
          </Typography>
        </ProcessStep>

        <ProcessStep color={getStepColor('tender', request.tendersCount)}>
          <Box display="flex" alignItems="center" gap={1}>
            <GavelIcon />
            <Typography variant="body2">
              Тендер к Заявке № {request.requestNumber}
            </Typography>
          </Box>
          <Typography variant="body2">
            {request.tendersCount} тендеров, {request.proposalsCount} предложений
          </Typography>
        </ProcessStep>

        <ProcessStep color={getStepColor('contracts', request.contractsCount)}>
          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon />
            <Typography variant="body2">
              Контракты
            </Typography>
          </Box>
          <Typography variant="body2">
            {request.contractsCount} контрактов
          </Typography>
        </ProcessStep>

        <ProcessStep color={getStepColor('invoices', request.invoicesCount)}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptIcon />
            <Typography variant="body2">
              Счета
            </Typography>
          </Box>
          <Typography variant="body2">
            {request.invoicesCount} счетов
          </Typography>
        </ProcessStep>

        <ProcessStep color={getStepColor('deliveries', request.deliveriesCount)}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeliveryIcon />
            <Typography variant="body2">
              Поставка по Заявке № {request.requestNumber}
            </Typography>
          </Box>
          <Typography variant="body2">
            {request.deliveriesCount} поставок, {request.receiptsCount} поступлений
          </Typography>
        </ProcessStep>

        {/* Дополнительная информация при развернутом виде */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          {request.notes && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Примечания
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {request.notes}
              </Typography>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </StyledCard>
  );
} 