/**
 * Форматирует телефонный номер в российском формате
 * @param phone - строка с телефонным номером
 * @returns отформатированный номер в формате +7 (XXX) XXX-XX-XX
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Убираем все нецифровые символы
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Если 10 цифр, добавляем префикс +7
  if (digitsOnly.length === 10) {
    return `+7 (${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6, 8)}-${digitsOnly.substring(8)}`;
  }
  
  // Если 11 цифр и начинается с 8, заменяем на +7
  if (digitsOnly.length === 11 && digitsOnly.startsWith('8')) {
    const numberWithout8 = digitsOnly.substring(1);
    return `+7 (${numberWithout8.substring(0, 3)}) ${numberWithout8.substring(3, 6)}-${numberWithout8.substring(6, 8)}-${numberWithout8.substring(8)}`;
  }
  
  // Если 11 цифр и начинается с 7, форматируем как +7
  if (digitsOnly.length === 11 && digitsOnly.startsWith('7')) {
    const numberWithout7 = digitsOnly.substring(1);
    return `+7 (${numberWithout7.substring(0, 3)}) ${numberWithout7.substring(3, 6)}-${numberWithout7.substring(6, 8)}-${numberWithout7.substring(8)}`;
  }
  
  // Если уже начинается с +7, форматируем остальную часть
  if (phone.startsWith('+7')) {
    const numberPart = phone.substring(2).replace(/\D/g, '');
    if (numberPart.length === 10) {
      return `+7 (${numberPart.substring(0, 3)}) ${numberPart.substring(3, 6)}-${numberPart.substring(6, 8)}-${numberPart.substring(8)}`;
    }
  }
  
  // В остальных случаях возвращаем исходный номер
  return phone;
};

/**
 * Очищает телефонный номер от всех символов кроме цифр
 * @param phone - строка с телефонным номером
 * @returns только цифры номера
 */
export const cleanPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Проверяет, является ли номер российским мобильным
 * @param phone - строка с телефонным номером
 * @returns true если номер российский мобильный
 */
export const isRussianMobile = (phone: string): boolean => {
  const cleaned = cleanPhone(phone);
  
  // Российские мобильные номера начинаются с 9
  if (cleaned.length === 11 && cleaned.startsWith('89')) {
    return true;
  }
  
  // Или если уже с +7 и вторая цифра 9
  if (cleaned.length === 11 && cleaned.startsWith('79')) {
    return true;
  }
  
  return false;
};
