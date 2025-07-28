import { theme, cssVariables, applyTheme, getStatusStyle } from '../../config/theme'

describe('Theme Configuration', () => {
  describe('theme object', () => {
    it('should have all required theme properties', () => {
      expect(theme).toHaveProperty('colors')
      expect(theme).toHaveProperty('typography')
      expect(theme).toHaveProperty('spacing')
      expect(theme).toHaveProperty('borderRadius')
      expect(theme).toHaveProperty('shadows')
      expect(theme).toHaveProperty('buttons')
      expect(theme).toHaveProperty('status')
    })

    it('should have properly structured colors', () => {
      expect(theme.colors).toHaveProperty('primary')
      expect(theme.colors).toHaveProperty('secondary')
      expect(theme.colors).toHaveProperty('background')
      expect(theme.colors).toHaveProperty('text')
      expect(theme.colors).toHaveProperty('border')
      expect(theme.colors).toHaveProperty('success')
      expect(theme.colors).toHaveProperty('warning')
      expect(theme.colors).toHaveProperty('error')
    })

    it('should have button variants', () => {
      expect(theme.buttons).toHaveProperty('primary')
      expect(theme.buttons).toHaveProperty('secondary')
      expect(theme.buttons).toHaveProperty('danger')
    })

    it('should have status styles', () => {
      expect(theme.status).toHaveProperty('prompt not yet generated')
      expect(theme.status).toHaveProperty('prompt generated')
      expect(theme.status).toHaveProperty('shot selected')
    })
  })

  describe('cssVariables', () => {
    it('should generate valid CSS variables string', () => {
      expect(typeof cssVariables).toBe('string')
      expect(cssVariables).toContain(':root')
      expect(cssVariables).toContain('--color-primary')
      expect(cssVariables).toContain('--color-secondary')
    })

    it('should include all color variables', () => {
      expect(cssVariables).toContain('--color-primary')
      expect(cssVariables).toContain('--color-background')
      expect(cssVariables).toContain('--color-text-primary')
      expect(cssVariables).toContain('--color-border')
    })
  })

  describe('applyTheme function', () => {
    let mockElement

    beforeEach(() => {
      mockElement = {
        style: {},
        className: ''
      }
    })

    it('should apply primary theme by default', () => {
      const result = applyTheme(mockElement)
      
      expect(result).toContain(theme.buttons.primary.background)
      expect(result).toContain(theme.buttons.primary.text)
    })

    it('should apply secondary theme when specified', () => {
      const result = applyTheme(mockElement, 'secondary')
      
      expect(result).toContain(theme.buttons.secondary.background)
      expect(result).toContain(theme.buttons.secondary.text)
    })

    it('should apply danger theme when specified', () => {
      const result = applyTheme(mockElement, 'danger')
      
      expect(result).toContain(theme.buttons.danger.background)
      expect(result).toContain(theme.buttons.danger.text)
    })

    it('should handle invalid theme variant gracefully', () => {
      const result = applyTheme(mockElement, 'invalid')
      
      // Should return empty string for invalid variant
      expect(result).toBe('')
    })
  })

  describe('getStatusStyle function', () => {
    it('should return correct styles for all status types', () => {
      const notStartedStyle = getStatusStyle('prompt not yet generated')
      expect(notStartedStyle).toContain('var(--color-text-muted)')

      const inProgressStyle = getStatusStyle('prompt generated')
      expect(inProgressStyle).toContain('var(--color-text-primary)')

      const selectedStyle = getStatusStyle('shot selected')
      expect(selectedStyle).toContain('var(--color-success)')
    })

    it('should return default style for unknown status', () => {
      const unknownStyle = getStatusStyle('unknown status')
      expect(unknownStyle).toBe('')
    })

    it('should handle null/undefined status', () => {
      const nullStyle = getStatusStyle(null)
      expect(nullStyle).toBe('')

      const undefinedStyle = getStatusStyle(undefined)
      expect(undefinedStyle).toBe('')
    })
  })

  describe('theme consistency', () => {
    it('should have consistent color format', () => {
      // Check non-nested colors
      const flatColors = { ...theme.colors }
      delete flatColors.text // Remove nested object
      
      Object.values(flatColors).forEach(color => {
        expect(typeof color).toBe('string')
        // Should be hex color or valid CSS color
        expect(color).toMatch(/^(#[0-9A-Fa-f]{3,8}|rgb|hsl|[a-z]+)/)
      })
      
      // Check nested text colors
      Object.values(theme.colors.text).forEach(color => {
        expect(typeof color).toBe('string')
        expect(color).toMatch(/^(#[0-9A-Fa-f]{3,8}|rgb|hsl|[a-z]+)/)
      })
    })

    it('should have consistent spacing values', () => {
      Object.values(theme.spacing).forEach(spacing => {
        expect(typeof spacing).toBe('string')
        // Should be valid CSS unit
        expect(spacing).toMatch(/^\d+(\.\d+)?(px|rem|em|%)$/)
      })
    })

    it('should have consistent button structure', () => {
      Object.values(theme.buttons).forEach(button => {
        expect(button).toHaveProperty('background')
        expect(button).toHaveProperty('text')
        expect(button).toHaveProperty('hover')
      })
    })
  })
}) 