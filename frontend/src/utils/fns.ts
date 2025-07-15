// Функции для работы с ФНС
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
    const response = await fetch(`http://localhost:8080/api/fns/search?inn=${inn}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при получении данных о компании');
    }

    const data = await response.json();
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