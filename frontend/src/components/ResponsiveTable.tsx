import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Column {
  id: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobile?: boolean; // Показывать ли на мобильных
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  getRowKey: (row: any) => string;
  title?: string;
  loading?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick,
  getRowKey,
  title,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Фильтруем колонки для мобильных устройств
  const mobileColumns = columns.filter(col => col.mobile !== false);

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  if (isMobile) {
    return (
      <Box>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        <Grid container spacing={2}>
          {data.map((row) => (
            <Grid item xs={12} key={getRowKey(row)}>
              <Card 
                sx={{ 
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  } : {}
                }}
                onClick={() => handleRowClick(row)}
              >
                <CardContent sx={{ p: 2 }}>
                  {mobileColumns.map((column) => {
                    const value = row[column.id];
                    const renderedValue = column.render ? column.render(value, row) : value;
                    
                    return (
                      <Box key={column.id} sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'block', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {column.label}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {typeof renderedValue === 'string' || typeof renderedValue === 'number' ? (
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {renderedValue}
                            </Typography>
                          ) : (
                            renderedValue
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {data.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Данные не найдены
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: 'background.default',
                    fontSize: '0.875rem'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                onClick={() => handleRowClick(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {},
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                {columns.map((column) => {
                  const value = row[column.id];
                  const renderedValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <TableCell key={column.id} sx={{ fontSize: '0.875rem' }}>
                      {renderedValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Данные не найдены
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ResponsiveTable; 