// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// App Configuration
export const APP_NAME = 'Varia';
export const APP_DESCRIPTION = 'Create intelligent AI agents with advanced knowledge bases';

// UI Constants
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  page: 0.6
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md']
};

// Chat Constants
export const MAX_MESSAGE_LENGTH = 1000;
export const TYPING_INDICATOR_DELAY = 500;

// Agent Constants
export const MAX_AGENT_NAME_LENGTH = 100;
export const MAX_AGENT_DESCRIPTION_LENGTH = 500;

// Colors
export const COLORS = {
  primary: {
    purple: '#8b5cf6',
    blue: '#3b82f6',
    cyan: '#06b6d4'
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
};