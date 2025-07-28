import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/generate-prompt'

// Mock the localStorage module
jest.mock('../../lib/localStorage', () => ({
  getShots: jest.fn(),
  updateShot: jest.fn(),
}))

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}))

const { getShots, updateShot } = require('../../lib/localStorage')
const { GoogleGenerativeAI } = require('@google/generative-ai')

describe('/api/generate-prompt', () => {
  let mockModel

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock model with proper response structure
    mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Generated AI prompt for the shot'
        }
      }),
    }
    
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel,
    }))
  })

  describe('POST /api/generate-prompt', () => {
    it('should generate prompt successfully', async () => {
      const mockShots = [
        createMockShot({ 
          id: 'shot_1', 
          title: 'Test Shot',
          character: 'Test Character',
          description: 'Test description'
        })
      ]
      const formData = createMockFormData()
      const generatedPrompt = 'Generated AI prompt for the shot'

      getShots.mockReturnValue(mockShots)
      updateShot.mockReturnValue(true)
      // The mock is already set up in beforeEach

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_1',
          formData: formData
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(updateShot).toHaveBeenCalledWith('shot_1', {
        prompt: 'Generated AI prompt for the shot',
        status: 'prompt generated'
      })
      
      const responseData = JSON.parse(res._getData())
      expect(responseData.prompt).toBe('Generated AI prompt for the shot')
      expect(responseData.shot).toBeDefined()
      expect(responseData.allShots).toBeDefined()
    })

    it('should return 400 for missing shotId', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Shot ID and form data are required'
      })
    })

    it('should return 404 for non-existent shot', async () => {
      getShots.mockReturnValue([])

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'non_existent',
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Shot not found'
      })
    })

    it('should return 500 when API key is missing', async () => {
      // Temporarily remove the API key
      const originalApiKey = process.env.GEMINI_API_KEY
      delete process.env.GEMINI_API_KEY

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_1',
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.'
      })

      // Restore the API key
      process.env.GEMINI_API_KEY = originalApiKey
    })

    it('should return 500 when prompt generation fails', async () => {
      const mockShots = [createMockShot({ id: 'shot_1' })]
      
      getShots.mockReturnValue(mockShots)
      mockModel.generateContent.mockRejectedValue(new Error('AI generation failed'))

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_1',
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to generate prompt'
      })
    })

    it('should return 500 when prompt is empty', async () => {
      const mockShots = [createMockShot({ id: 'shot_1' })]
      
      getShots.mockReturnValue(mockShots)
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => ''
        }
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_1',
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to generate prompt'
      })
    })

    it('should return 500 when shot update fails', async () => {
      const mockShots = [createMockShot({ id: 'shot_1' })]

      getShots.mockReturnValue(mockShots)
      updateShot.mockReturnValue(false)
      // Mock is already set up in beforeEach

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_1',
          formData: createMockFormData()
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to save generated prompt'
      })
    })

    it('should handle character consistency analysis', async () => {
      const mockShots = [
        createMockShot({ 
          id: 'shot_1',
          character: 'Main Character',
          prompt: 'Previous prompt with Main Character wearing a blue dress'
        }),
        createMockShot({ 
          id: 'shot_2',
          character: 'Main Character',
          description: 'Test description'
        })
      ]
      const formData = createMockFormData({
        characters: ['Main Character']
      })

      getShots.mockReturnValue(mockShots)
      updateShot.mockReturnValue(true)
      // Mock is already set up in beforeEach

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          shotId: 'shot_2',
          formData: formData
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(mockModel.generateContent).toHaveBeenCalled()
      
      // Check that the prompt context includes character consistency
      const promptContext = mockModel.generateContent.mock.calls[0][0]
      expect(promptContext).toContain('CHARACTER CONSISTENCY')
      expect(promptContext).toContain('Main Character')
    })
  })

  describe('unsupported methods', () => {
    it('should return 405 for non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed'
      })
    })
  })
}) 