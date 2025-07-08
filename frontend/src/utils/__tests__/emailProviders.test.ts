import { detectEmailProvider, getProviderByName, emailProviders } from '../emailProviders';

describe('Email Providers', () => {
  describe('detectEmailProvider', () => {
    it('should detect Gmail provider', () => {
      const provider = detectEmailProvider('test@gmail.com');
      expect(provider?.name).toBe('Gmail');
      expect(provider?.smtpHost).toBe('smtp.gmail.com');
      expect(provider?.smtpPort).toBe('587');
    });

    it('should detect Yandex provider', () => {
      const provider = detectEmailProvider('test@yandex.ru');
      expect(provider?.name).toBe('Yandex');
      expect(provider?.smtpHost).toBe('smtp.yandex.ru');
      expect(provider?.smtpPort).toBe('465');
    });

    it('should detect Mail.ru provider', () => {
      const provider = detectEmailProvider('test@mail.ru');
      expect(provider?.name).toBe('Mail.ru');
      expect(provider?.smtpHost).toBe('smtp.mail.ru');
    });

    it('should detect Outlook provider', () => {
      const provider = detectEmailProvider('test@outlook.com');
      expect(provider?.name).toBe('Outlook/Hotmail');
      expect(provider?.smtpHost).toBe('smtp-mail.outlook.com');
    });

    it('should return null for unknown domain', () => {
      const provider = detectEmailProvider('test@unknown.com');
      expect(provider).toBeNull();
    });

    it('should return null for empty email', () => {
      const provider = detectEmailProvider('');
      expect(provider).toBeNull();
    });

    it('should return null for invalid email', () => {
      const provider = detectEmailProvider('invalid-email');
      expect(provider).toBeNull();
    });
  });

  describe('getProviderByName', () => {
    it('should return Gmail provider', () => {
      const provider = getProviderByName('Gmail');
      expect(provider?.name).toBe('Gmail');
      expect(provider?.smtpHost).toBe('smtp.gmail.com');
    });

    it('should return null for unknown provider', () => {
      const provider = getProviderByName('Unknown');
      expect(provider).toBeNull();
    });
  });

  describe('emailProviders', () => {
    it('should contain all expected providers', () => {
      const providerNames = emailProviders.map(p => p.name);
      expect(providerNames).toContain('Gmail');
      expect(providerNames).toContain('Yandex');
      expect(providerNames).toContain('Mail.ru');
      expect(providerNames).toContain('Outlook/Hotmail');
      expect(providerNames).toContain('Yahoo');
      expect(providerNames).toContain('MailHog (Development)');
      expect(providerNames).toContain('Custom SMTP');
    });

    it('should have valid configuration for each provider', () => {
      emailProviders.forEach(provider => {
        expect(provider.name).toBeTruthy();
        expect(provider.smtpHost).toBeTruthy();
        expect(provider.smtpPort).toBeTruthy();
        expect(provider.description).toBeTruthy();
        expect(Array.isArray(provider.instructions)).toBe(true);
        expect(provider.instructions.length).toBeGreaterThan(0);
      });
    });
  });
}); 