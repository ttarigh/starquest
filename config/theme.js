// Theme configuration for easy reskinning
// External partners can modify these values to customize the appearance

export const theme = {
  // Brand colors
  colors: {
    primary: '#000000',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF'
    },
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },

  // Button styles
  buttons: {
    primary: {
      background: 'var(--color-primary)',
      text: 'var(--color-background)',
      hover: {
        background: 'var(--color-text-primary)'
      }
    },
    secondary: {
      background: 'transparent',
      text: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
      hover: {
        background: 'var(--color-primary)',
        text: 'var(--color-background)'
      }
    },
    danger: {
      background: 'var(--color-error)',
      text: 'var(--color-background)',
      hover: {
        background: '#DC2626'
      }
    }
  },

  // Status colors
  status: {
    'prompt not yet generated': {
      color: 'var(--color-text-muted)',
      background: 'var(--color-surface)'
    },
    'prompt generated': {
      color: 'var(--color-text-primary)',
      background: 'var(--color-background)'
    },
    'shots generated': {
      color: 'var(--color-text-secondary)',
      background: 'var(--color-surface)'
    },
    'shot selected': {
      color: 'var(--color-success)',
      background: '#ECFDF5',
      fontWeight: 'bold'
    }
  }
};

// CSS Variables for easy theming
export const cssVariables = `
  :root {
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-accent: ${theme.colors.accent};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-muted: ${theme.colors.text.muted};
    --color-border: ${theme.colors.border};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    
    --font-family-sans: ${theme.typography.fontFamily.sans.join(', ')};
    --font-family-mono: ${theme.typography.fontFamily.mono.join(', ')};
    
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-2xl: ${theme.spacing['2xl']};
    
    --border-radius-sm: ${theme.borderRadius.sm};
    --border-radius-md: ${theme.borderRadius.md};
    --border-radius-lg: ${theme.borderRadius.lg};
    --border-radius-xl: ${theme.borderRadius.xl};
    
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
  }
`;

// Utility functions for applying theme
export const applyTheme = (element, variant = 'primary') => {
  const buttonTheme = theme.buttons[variant];
  if (!buttonTheme) return '';
  
  return `
    background: ${buttonTheme.background};
    color: ${buttonTheme.text};
    border: ${buttonTheme.border || 'none'};
    transition: all 0.2s ease;
    
    &:hover {
      background: ${buttonTheme.hover?.background || buttonTheme.background};
      color: ${buttonTheme.hover?.text || buttonTheme.text};
    }
  `;
};

export const getStatusStyle = (status) => {
  const statusTheme = theme.status[status];
  if (!statusTheme) return '';
  
  return `
    color: ${statusTheme.color};
    background: ${statusTheme.background};
    font-weight: ${statusTheme.fontWeight || 'normal'};
  `;
}; 