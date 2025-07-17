// Функции для работы с ФНС
import { api } from './api';

export interface CompanyData {
  name: string;
  shortName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  ogrnDate: string;
  legalForm: string;
  address: string;
  head: string;
  phone: string;
  email: string;
}

export const searchCompanyByInn = async (inn: string): Promise<CompanyData> => {
  try {
    const response = await api.get(`/api/fns/search?inn=${inn}`);

    const data = response.data;
    console.log('Ответ от бэкенда:', data);

    return {
      name: data.name || '',
      shortName: data.shortName || '',
      inn: data.inn || '',
      kpp: data.kpp || '',
      ogrn: data.ogrn || '',
      ogrnDate: data.ogrnDate || '',
      legalForm: data.legalForm || '',
      address: data.address || '',
      head: data.head || '',
      phone: data.phone || '',
      email: data.email || '',
    };
  } catch (error) {
    console.error('Ошибка при поиске компании:', error);
    throw error;
  }
}; 