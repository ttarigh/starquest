import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../../pages/index'

// Mock fetch globally
global.fetch = jest.fn()

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default fetch mock for getting shots
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [createMockShot()],
    })
  })

  describe('Page Rendering', () => {
    it('should render the main page with header', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('STARQUEST SHOT LIST')).toBeInTheDocument()
      })
      
      expect(screen.getByText('OVERALL PROGRESS')).toBeInTheDocument()
      expect(screen.getByText('FILTER BY STATUS')).toBeInTheDocument()
    })

    it('should display loading state initially', () => {
      render(<Home />)
      
      expect(screen.getByText('LOADING...')).toBeInTheDocument()
      expect(screen.getByText('Fetching shot list')).toBeInTheDocument()
    })

    it('should render shots after loading', async () => {
      const mockShots = [
        createMockShot({ 
          id: 'shot_1', 
          title: 'Test Shot 1',
          character: 'Test Character'
        })
      ]
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockShots,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('01. Test Shot 1')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Character: Test Character')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should display correct progress for empty list', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('0% COMPLETE (0 selected, 0 ready)')).toBeInTheDocument()
      })
    })

    it('should calculate progress correctly', async () => {
      const mockShots = [
        createMockShot({ status: 'prompt not yet generated' }),
        createMockShot({ status: 'prompt generated' }),
        createMockShot({ status: 'shot selected' }),
      ]
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockShots,
      })

      render(<Home />)
      
      await waitFor(() => {
        // 2 out of 3 shots are complete (generated + selected)
        expect(screen.getByText('67% COMPLETE (1 selected, 1 ready)')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('should filter shots by status', async () => {
      const mockShots = [
        createMockShot({ id: 'shot_1', title: 'Not Started', status: 'prompt not yet generated' }),
        createMockShot({ id: 'shot_2', title: 'Ready', status: 'prompt generated' }),
        createMockShot({ id: 'shot_3', title: 'Selected', status: 'shot selected' }),
      ]
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockShots,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('01. Not Started')).toBeInTheDocument()
        expect(screen.getByText('02. Ready')).toBeInTheDocument()
        expect(screen.getByText('03. Selected')).toBeInTheDocument()
      })

      // Filter by "prompt generated"
      const promptReadyButton = screen.getByText('Prompt Ready (1)')
      fireEvent.click(promptReadyButton)

      await waitFor(() => {
        expect(screen.getByText('01. Ready')).toBeInTheDocument()
        expect(screen.queryByText('Not Started')).not.toBeInTheDocument()
        expect(screen.queryByText('Selected')).not.toBeInTheDocument()
      })
    })

    it('should clear filters', async () => {
      const mockShots = [
        createMockShot({ title: 'Shot 1', status: 'prompt not yet generated' }),
        createMockShot({ title: 'Shot 2', status: 'prompt generated' }),
      ]
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockShots,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('01. Shot 1')).toBeInTheDocument()
      })

      // Apply filter
      const notStartedButton = screen.getByText('Not Started (1)')
      fireEvent.click(notStartedButton)

      // Clear filters
      const clearButton = screen.getByText('Clear filters')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText('01. Shot 1')).toBeInTheDocument()
        expect(screen.getByText('02. Shot 2')).toBeInTheDocument()
      })
    })
  })

  describe('Add New Shot', () => {
    it('should show add shot form when button is clicked', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('+ ADD NEW SHOT')).toBeInTheDocument()
      })

      const addButton = screen.getByText('+ ADD NEW SHOT')
      fireEvent.click(addButton)

      expect(screen.getByText('ADD NEW SHOT')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g., Solo Routine: Dramatic Turn')).toBeInTheDocument()
    })

    it('should add new shot successfully', async () => {
      const user = userEvent.setup()
      
      // Mock successful add
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [createMockShot()],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [createMockShot(), createMockShot({ id: 'shot_2', title: 'New Shot' })],
        })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('+ ADD NEW SHOT')).toBeInTheDocument()
      })

      // Open form
      const addButton = screen.getByText('+ ADD NEW SHOT')
      fireEvent.click(addButton)

      // Fill form
      const titleInput = screen.getByPlaceholderText('e.g., Solo Routine: Dramatic Turn')
      await user.type(titleInput, 'New Shot')

      const characterInput = screen.getByPlaceholderText('e.g., Brunette, Asian Girl, etc.')
      await user.type(characterInput, 'New Character')

      // Submit form
      const submitButton = screen.getByText('ADD SHOT')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/shots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('New Shot'),
        })
      })
    })
  })

  describe('CSV Import/Export', () => {
    it('should show CSV import area when button is clicked', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('IMPORT CSV')).toBeInTheDocument()
      })

      const importButton = screen.getByText('IMPORT CSV')
      fireEvent.click(importButton)

      expect(screen.getByText('IMPORT CSV')).toBeInTheDocument()
      expect(screen.getByText('📁 Drag & drop CSV file here or click to browse')).toBeInTheDocument()
    })

    it('should trigger CSV export', async () => {
      // Mock window.open
      global.open = jest.fn()

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('EXPORT CSV')).toBeInTheDocument()
      })

      const exportButton = screen.getByText('EXPORT CSV')
      fireEvent.click(exportButton)

      expect(global.open).toHaveBeenCalledWith('/api/csv', '_blank')
    })
  })

  describe('Shot Actions', () => {
    it('should show appropriate buttons based on shot status', async () => {
      const mockShots = [
        createMockShot({ 
          id: 'shot_1', 
          title: 'Not Started', 
          status: 'prompt not yet generated' 
        }),
        createMockShot({ 
          id: 'shot_2', 
          title: 'Generated', 
          status: 'prompt generated',
          prompt: 'Test prompt'
        }),
        createMockShot({ 
          id: 'shot_3', 
          title: 'Selected', 
          status: 'shot selected',
          prompt: 'Test prompt'
        }),
      ]
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockShots,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('GENERATE PROMPT')).toBeInTheDocument()
        expect(screen.getAllByText('EDIT PROMPT')).toHaveLength(2) // Both prompt generated and shot selected have edit buttons
        expect(screen.getByText('SELECT SHOT')).toBeInTheDocument()
        expect(screen.getByText('ADD VIDEO')).toBeInTheDocument()
      })
    })

    it('should update shot status', async () => {
      const mockShot = createMockShot({ 
        status: 'prompt generated',
        prompt: 'Test prompt'
      })
      
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockShot],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ ...mockShot, status: 'shot selected' }],
        })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('SELECT SHOT')).toBeInTheDocument()
      })

      const selectButton = screen.getByText('SELECT SHOT')
      fireEvent.click(selectButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/shots', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('shot selected'),
        })
      })
    })

    it('should delete shot with confirmation', async () => {
      const mockShot = createMockShot({ title: 'Test Shot' })
      
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockShot],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

      // Mock window.confirm
      global.confirm = jest.fn(() => true)

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('01. Test Shot')).toBeInTheDocument()
      })

      const deleteButton = screen.getByTitle('Delete shot')
      fireEvent.click(deleteButton)

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Shot"?')
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/shots', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(mockShot.id),
        })
      })
    })
  })

  describe('Caption Editing', () => {
    it('should show "Enter to save" only when editing', async () => {
      const mockShot = createMockShot()
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [mockShot],
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add caption...')).toBeInTheDocument()
      })

      // Should not show "Enter to save" initially
      expect(screen.queryByText('Enter to save')).not.toBeInTheDocument()

      // Focus on caption textarea
      const captionTextarea = screen.getByPlaceholderText('Add caption...')
      fireEvent.focus(captionTextarea)

      // Should show "Enter to save" when focused
      expect(screen.getByText('Enter to save')).toBeInTheDocument()

      // Should hide when blurred
      fireEvent.blur(captionTextarea)
      
      await waitFor(() => {
        expect(screen.queryByText('Enter to save')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'))

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.queryByText('LOADING...')).not.toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('should handle API errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.queryByText('LOADING...')).not.toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })
}) 