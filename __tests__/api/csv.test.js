import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/csv'

// Mock the localStorage module
jest.mock('../../lib/localStorage', () => ({
  importFromCSV: jest.fn(),
  exportToCSV: jest.fn(),
}))

const { importFromCSV, exportToCSV } = require('../../lib/localStorage')

describe('/api/csv', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/csv (import)', () => {
    it('should import CSV data successfully', async () => {
      const csvData = 'SHOT TITLE,ID,CHARACTER\n"Test Shot",shot_1,"Test Character"'
      importFromCSV.mockReturnValue(true)

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          csvData: csvData
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(importFromCSV).toHaveBeenCalledWith(csvData)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'CSV imported successfully'
      })
    })

    it('should return 400 for missing CSV data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'CSV data is required'
      })
    })

    it('should return 500 when import fails', async () => {
      const csvData = 'invalid,csv,data'
      importFromCSV.mockReturnValue(false)

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          csvData: csvData
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to import CSV'
      })
    })

    it('should handle import errors gracefully', async () => {
      const csvData = 'SHOT TITLE,ID\n"Test Shot",shot_1'
      importFromCSV.mockImplementation(() => {
        throw new Error('Import error')
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          csvData: csvData
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to import CSV'
      })
    })
  })

  describe('GET /api/csv (export)', () => {
    it('should export CSV data successfully', async () => {
      const csvData = 'SHOT TITLE,ID,CHARACTER\n"Test Shot",shot_1,"Test Character"'
      exportToCSV.mockReturnValue(csvData)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(res._getData()).toBe(csvData)
      expect(res._getHeaders()['content-type']).toBe('text/csv')
      expect(res._getHeaders()['content-disposition']).toBe('attachment; filename="shots-export.csv"')
    })

    it('should return 500 when export fails', async () => {
      exportToCSV.mockReturnValue(null)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to export CSV'
      })
    })

    it('should handle export errors gracefully', async () => {
      exportToCSV.mockImplementation(() => {
        throw new Error('Export error')
      })

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to export CSV'
      })
    })
  })

  describe('unsupported methods', () => {
    it('should return 405 for unsupported HTTP methods', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      expect(res._getData()).toBe('Method PUT Not Allowed')
    })
  })
}) 