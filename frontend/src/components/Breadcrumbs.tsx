import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const pathToBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Дашборд', path: '/dashboard', icon: <HomeIcon /> }],
  '/requests/registry': [
    { label: 'Тендерные процедуры', path: '/requests/registry' },
    { label: 'Реестр заявок', path: '/requests/registry' }
  ],
  '/tenders': [
    { label: 'Тендерные процедуры', path: '/tenders' },
    { label: 'Тендеры', path: '/tenders' }
  ],
  '/proposals': [
    { label: 'Тендерные процедуры', path: '/proposals' },
    { label: 'Предложения', path: '/proposals' }
  ],
  '/contracts': [
    { label: 'Контрактная работа', path: '/contracts' },
    { label: 'Контракты', path: '/contracts' }
  ],
  '/deliveries': [
    { label: 'Контрактная работа', path: '/deliveries' },
    { label: 'Поставки', path: '/deliveries' }
  ],
  '/payments': [
    { label: 'Контрактная работа', path: '/payments' },
    { label: 'Платежи', path: '/payments' }
  ],
  '/counterparties': [
    { label: 'Справочники', path: '/counterparties' },
    { label: 'Контрагенты', path: '/counterparties' }
  ],
  '/materials': [
    { label: 'Справочники', path: '/materials' },
    { label: 'Материалы', path: '/materials' }
  ],
  '/reference/categories': [
    { label: 'Справочники', path: '/reference/categories' },
    { label: 'Категории', path: '/reference/categories' }
  ],
  '/reference/material-types': [
    { label: 'Справочники', path: '/reference/material-types' },
    { label: 'Типы материалов', path: '/reference/material-types' }
  ],
  '/reference/units': [
    { label: 'Справочники', path: '/reference/units' },
    { label: 'Единицы измерения', path: '/reference/units' }
  ],
  '/warehouses': [
    { label: 'Справочники', path: '/warehouses' },
    { label: 'Склады', path: '/warehouses' }
  ],
  '/reference/projects': [
    { label: 'Справочники', path: '/reference/projects' },
    { label: 'Проекты', path: '/reference/projects' }
  ],
  '/reference/contact-types': [
    { label: 'Справочники', path: '/reference/contact-types' },
    { label: 'Типы контактов', path: '/reference/contact-types' }
  ],
  '/documents': [
    { label: 'Документооборот', path: '/documents' },
    { label: 'Документы', path: '/documents' }
  ],
  '/notifications': [
    { label: 'Документооборот', path: '/notifications' },
    { label: 'Уведомления', path: '/notifications' }
  ],
  '/price-analysis': [
    { label: 'Аналитика', path: '/price-analysis' },
    { label: 'Анализ цен', path: '/price-analysis' }
  ],
  '/settings': [
    { label: 'Администрирование', path: '/settings' },
    { label: 'Настройки', path: '/settings' }
  ]
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Находим подходящие хлебные крошки для текущего пути
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    // Ищем точное совпадение
    if (pathToBreadcrumbs[pathname]) {
      return pathToBreadcrumbs[pathname];
    }

    // Ищем частичное совпадение для вложенных путей
    const matchingPath = Object.keys(pathToBreadcrumbs).find(path => 
      pathname.startsWith(path)
    );

    if (matchingPath) {
      return pathToBreadcrumbs[matchingPath];
    }

    // Если не найдено, не показываем хлебные крошки
    return [];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <MuiBreadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ 
        mb: 2,
        '& .MuiBreadcrumbs-separator': {
          color: 'text.secondary'
        }
      }}
    >
      {breadcrumbs.length === 0 ? null : breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return isLast ? (
          <Typography 
            key={item.path} 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              fontWeight: 600 
            }}
          >
            {item.icon}
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.path}
            component={RouterLink}
            to={item.path}
            color="inherit"
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs; 