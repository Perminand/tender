export interface EmailProvider {
  name: string;
  smtpHost: string;
  smtpPort: string;
  useSsl: boolean;
  useTls: boolean;
  requiresAuth: boolean;
  description: string;
  instructions: string[];
}

export const emailProviders: EmailProvider[] = [
  {
    name: 'Gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    useSsl: false,
    useTls: true,
    requiresAuth: true,
    description: 'Google Gmail - популярный провайдер с хорошей поддержкой',
    instructions: [
      'Включите двухфакторную аутентификацию в Google аккаунте',
      'Перейдите в настройки безопасности Google (https://myaccount.google.com/security)',
      'Найдите раздел "Пароли приложений"',
      'Создайте новый пароль для приложения "Почта"',
      'Используйте этот 16-значный пароль вместо обычного пароля',
      'Если не видите "Пароли приложений", убедитесь что включена двухфакторная аутентификация'
    ]
  },
  {
    name: 'Yandex',
    smtpHost: 'smtp.yandex.ru',
    smtpPort: '465',
    useSsl: true,
    useTls: false,
    requiresAuth: true,
    description: 'Яндекс Почта - российский провайдер',
    instructions: [
      'Включите двухфакторную аутентификацию в Яндекс',
      'Перейдите в настройки безопасности',
      'Создайте "Пароль приложения"',
      'Используйте этот пароль в настройках'
    ]
  },
  {
    name: 'Mail.ru',
    smtpHost: 'smtp.mail.ru',
    smtpPort: '465',
    useSsl: true,
    useTls: false,
    requiresAuth: true,
    description: 'Mail.ru - популярный российский провайдер',
    instructions: [
      'Включите двухфакторную аутентификацию',
      'Создайте пароль для приложения',
      'Используйте пароль приложения в настройках'
    ]
  },
  {
    name: 'Outlook/Hotmail',
    smtpHost: 'smtp-mail.outlook.com',
    smtpPort: '587',
    useSsl: false,
    useTls: true,
    requiresAuth: true,
    description: 'Microsoft Outlook/Hotmail',
    instructions: [
      'Включите двухфакторную аутентификацию',
      'Создайте пароль приложения',
      'Используйте пароль приложения'
    ]
  },
  {
    name: 'Yahoo',
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: '587',
    useSsl: false,
    useTls: true,
    requiresAuth: true,
    description: 'Yahoo Mail',
    instructions: [
      'Включите двухфакторную аутентификацию',
      'Создайте пароль приложения',
      'Используйте пароль приложения'
    ]
  },
  {
    name: 'MailHog (Development)',
    smtpHost: 'localhost',
    smtpPort: '1025',
    useSsl: false,
    useTls: false,
    requiresAuth: false,
    description: 'MailHog для разработки и тестирования',
    instructions: [
      'Убедитесь, что MailHog запущен в Docker',
      'Оставьте поля username и password пустыми',
      'Используйте любой email в поле отправителя'
    ]
  },
  {
    name: 'Custom SMTP',
    smtpHost: '',
    smtpPort: '',
    useSsl: false,
    useTls: false,
    requiresAuth: false,
    description: 'Настройка произвольного SMTP сервера',
    instructions: [
      'Введите настройки вашего SMTP сервера',
      'Уточните настройки у вашего провайдера',
      'Проверьте правильность портов и протоколов'
    ]
  }
];

export function detectEmailProvider(email: string): EmailProvider | null {
  if (!email) return null;
  
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return null;

  if (domain.includes('gmail.com')) {
    return emailProviders.find(p => p.name === 'Gmail') || null;
  }
  
  if (domain.includes('yandex.ru') || domain.includes('yandex.com')) {
    return emailProviders.find(p => p.name === 'Yandex') || null;
  }
  
  if (domain.includes('mail.ru') || domain.includes('inbox.ru') || domain.includes('bk.ru')) {
    return emailProviders.find(p => p.name === 'Mail.ru') || null;
  }
  
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    return emailProviders.find(p => p.name === 'Outlook/Hotmail') || null;
  }
  
  if (domain.includes('yahoo.com')) {
    return emailProviders.find(p => p.name === 'Yahoo') || null;
  }
  
  return null;
}

export function getProviderByName(name: string): EmailProvider | null {
  return emailProviders.find(p => p.name === name) || null;
}

export function getProviderSuggestions(email: string): EmailProvider[] {
  const detected = detectEmailProvider(email);
  if (detected) {
    return [detected, ...emailProviders.filter(p => p.name !== detected.name)];
  }
  return emailProviders;
} 