import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestRegistryPage from '../RequestRegistryPage';
import * as api from '../../utils/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/api', () => ({
  get: vi.fn(),
}));

describe('RequestRegistryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает список заявок', async () => {
    (api.get as any).mockResolvedValue({ data: [
      { id: '1', title: 'Заявка 1' },
      { id: '2', title: 'Заявка 2' }
    ] });
    render(<RequestRegistryPage />);
    expect(await screen.findByText('Заявка 1')).toBeInTheDocument();
    expect(await screen.findByText('Заявка 2')).toBeInTheDocument();
  });

  it('отображает ошибку при сбое API', async () => {
    (api.get as any).mockRejectedValue(new Error('Ошибка сети'));
    render(<RequestRegistryPage />);
    expect(await screen.findByText(/ошибка/i)).toBeInTheDocument();
  });
}); 