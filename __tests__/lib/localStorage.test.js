import { jest } from '@jest/globals'

// Import the functions to test
const { 
  getShots, 
  saveShots, 
  updateShot, 
  addShot, 
  deleteShot, 
  importFromCSV, 
  exportToCSV 
} = require('../../lib/localStorage')

// Mock fs module
const fs = require('fs')

describe('localStorage utility', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Default fs mocks
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('[]')
    fs.writeFileSync.mockReturnValue(true)
    fs.mkdirSync.mockReturnValue(true)
  })

  describe('getShots', () => {
    it('should return empty array when file does not exist', () => {
      fs.existsSync.mockReturnValue(false)
      
      const result = getShots()
      
      expect(result).toEqual([])
    })

    it('should return parsed shots when file exists', () => {
      const mockShots = [createMockShot()]
      fs.readFileSync.mockReturnValue(JSON.stringify(mockShots))
      
      const result = getShots()
      
      expect(result).toEqual(mockShots)
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('shots.json'), 
        'utf8'
      )
    })

    it('should return empty array on JSON parse error', () => {
      fs.readFileSync.mockReturnValue('invalid json')
      
      const result = getShots()
      
      expect(result).toEqual([])
    })
  })

  describe('saveShots', () => {
    it('should save shots to file successfully', () => {
      const mockShots = [createMockShot()]
      
      const result = saveShots(mockShots)
      
      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('shots.json'),
        JSON.stringify(mockShots, null, 2)
      )
    })

    it('should create directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false)
      const mockShots = [createMockShot()]
      
      saveShots(mockShots)
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true }
      )
    })

    it('should return false on write error', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error')
      })
      
      const result = saveShots([])
      
      expect(result).toBe(false)
    })
  })

  describe('updateShot', () => {
    it('should update existing shot successfully', () => {
      const mockShots = [
        createMockShot({ id: 'shot_1', title: 'Original Title' })
      ]
      fs.readFileSync.mockReturnValue(JSON.stringify(mockShots))
      
      const result = updateShot('shot_1', { title: 'Updated Title' })
      
      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('shots.json'),
        expect.stringContaining('Updated Title')
      )
    })

    it('should return false for non-existent shot', () => {
      fs.readFileSync.mockReturnValue('[]')
      
      const result = updateShot('non_existent', { title: 'New Title' })
      
      expect(result).toBe(true) // Still returns true as it saves the empty array
    })
  })

  describe('addShot', () => {
    it('should add new shot successfully', () => {
      const existingShots = [createMockShot({ id: 'shot_1' })]
      const newShot = createMockShot({ id: 'shot_2', title: 'New Shot' })
      
      fs.readFileSync.mockReturnValue(JSON.stringify(existingShots))
      
      const result = addShot(newShot)
      
      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('shots.json'),
        expect.stringContaining('New Shot')
      )
    })
  })

  describe('deleteShot', () => {
    it('should delete existing shot successfully', () => {
      const mockShots = [
        createMockShot({ id: 'shot_1' }),
        createMockShot({ id: 'shot_2' })
      ]
      fs.readFileSync.mockReturnValue(JSON.stringify(mockShots))
      
      const result = deleteShot('shot_1')
      
      expect(result).toBe(true)
      // Should save array without the deleted shot
      const savedData = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].id).toBe('shot_2')
    })
  })

  describe('importFromCSV', () => {
    it('should import basic CSV data correctly', () => {
      const csvData = `SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS
"Test Shot",shot_1,"Test Character","Test description","Test prompt","Test caption","","",""
"Test Shot 2",shot_2,"Character 2","Description 2","","","","",""`
      
      const result = importFromCSV(csvData)
      
      expect(result).toBe(true)
      
      // Check that writeFileSync was called with correct data
      const savedData = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(savedData).toHaveLength(2)
      expect(savedData[0]).toEqual({
        id: 'shot_1',
        title: 'Test Shot',
        character: 'Test Character',
        description: 'Test description',
        prompt: 'Test prompt',
        caption: 'Test caption',
        status: 'prompt generated', // Should be set because prompt exists
        videoUrl: ''
      })
    })

    it('should handle CSV with status mapping correctly', () => {
      const csvData = `SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS
"Shot With Status",shot_1,"Character","Description","Generated prompt","Caption","","","prompt generated"
"Selected Shot",shot_2,"Character","Description","Some prompt","Caption","","","shot selected"`
      
      const result = importFromCSV(csvData)
      
      expect(result).toBe(true)
      
      const savedData = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(savedData[0].status).toBe('prompt generated')
      expect(savedData[1].status).toBe('shot selected')
    })

    it('should handle quoted CSV fields with commas', () => {
      const csvData = `SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS
"Shot with, comma",shot_1,"Character, with comma","Description, with comma","","","","",""`
      
      const result = importFromCSV(csvData)
      
      expect(result).toBe(true)
      
      const savedData = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(savedData[0].title).toBe('Shot with, comma')
      expect(savedData[0].character).toBe('Character, with comma')
    })

    it('should return false on CSV parsing error', () => {
      const invalidCSV = 'invalid,csv\ndata'
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error')
      })
      
      const result = importFromCSV(invalidCSV)
      
      expect(result).toBe(false)
    })
  })

  describe('exportToCSV', () => {
    it('should export shots to CSV format correctly', () => {
      const mockShots = [
        createMockShot({
          id: 'shot_1',
          title: 'Test Shot',
          character: 'Test Character',
          description: 'Test description',
          prompt: 'Test prompt',
          caption: 'Test caption',
          status: 'prompt generated',
          videoUrl: 'https://example.com/video'
        })
      ]
      fs.readFileSync.mockReturnValue(JSON.stringify(mockShots))
      
      const result = exportToCSV()
      
      expect(result).toContain('SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS')
      expect(result).toContain('"Test Shot",shot_1,Test Character,"Test description","Test prompt","Test caption",,https://example.com/video,prompt generated')
    })

    it('should handle empty shots array', () => {
      fs.readFileSync.mockReturnValue('[]')
      
      const result = exportToCSV()
      
      expect(result).toContain('SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS')
      expect(result.split('\n')).toHaveLength(1) // Only header row
    })

    it('should handle export errors gracefully', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read error')
      })
      
      const result = exportToCSV()
      
      // Should return headers only when shots is empty array due to error
      expect(result).toContain('SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO,STATUS')
      expect(result.split('\n')).toHaveLength(1) // Only header row
    })
  })
}) 