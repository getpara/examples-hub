import React from 'react';
import ReactDOM from 'react-dom/client';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { App } from '../src/index';
import { defineCustomElements } from '@getpara/react-components';

vi.mock('react-dom/client', () => {
  return {
    default: {
      createRoot: vi.fn(() => ({
        render: vi.fn(),
      })),
    },
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  };
});

vi.mock('../src/pages/Recovery/Recovery', () => ({
  default: () => <div data-testid="recovery-component">Recovery Component</div>,
}));

vi.mock('../src/components/ModalLayout', () => ({
  ModalLayout: () => <div data-testid="modal-layout">Modal Layout</div>,
}));

vi.mock('../src/components/ParaContext', () => ({
  ParaProvider: ({ children }) => <div data-testid="para-provider">{children}</div>,
}));

function createSearchParams(params = {}) {
  return {
    get: key => params[key] || null,
  };
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [createSearchParams(), vi.fn()],
  };
});

describe('Portal Root Rendering', () => {
  beforeEach(() => {
    defineCustomElements(window);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should call ReactDOM.createRoot and render with BrowserRouter', async () => {
    const mockElement = document.createElement('div');
    const mockRender = vi.fn();

    document.getElementById = vi.fn(() => mockElement);

    const mockCreateRoot = vi.fn(() => ({ render: mockRender }));
    ReactDOM.createRoot = mockCreateRoot as any;

    vi.resetModules();
    const { App: AppComponent } = await import('../src/index.tsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
    expect(mockRender).toHaveBeenCalled();

    const renderArg = mockRender.mock.calls[0][0];
    expect(renderArg.type).toBe(BrowserRouter);
    expect(renderArg.props.children.type).toEqual(AppComponent);
  });

  it('renders the App with ParaProvider and Recovery component on root route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('para-provider')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByTestId('recovery-component')).toBeDefined();
    });
  });

  it('renders the App with ModalLayout for web routes', async () => {
    document.body.innerHTML = '';

    render(
      <MemoryRouter initialEntries={['/web/biometrics/login']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('para-provider')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByTestId('modal-layout')).toBeDefined();
    });
  });
});
