import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/shots'

// Mock the localStorage module
jest.mock('../../lib/localStorage', () => ({
  getShots: jest.fn(),
  saveShots: jest.fn(),
  updateShot: jest.fn(),
  addShot: jest.fn(),
  deleteShot: jest.fn(),
}))

const { getShots, saveShots, updateShot, addShot, deleteShot } = require('../../lib/localStorage')

describe('/api/shots', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/shots', () => {
    it('should return existing shots', async () => {
      const mockShots = [createMockShot()]
      getShots.mockReturnValue(mockShots)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockShots)
    })

    it('should return empty array when no shots exist', async () => {
      getShots.mockReturnValue([])

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual([])
    })

    it('should handle errors gracefully', async () => {
      getShots.mockImplementation(() => {
        throw new Error('Database error')
      })

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to fetch shots'
      })
    })
  })

  describe('PUT /api/shots', () => {
    it('should update existing shot successfully', async () => {
      const mockShots = [createMockShot({ id: 'shot_1' })]
      updateShot.mockReturnValue(true)
      getShots.mockReturnValue(mockShots)

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          shotId: 'shot_1',
          updates: { title: 'Updated Title' }
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(updateShot).toHaveBeenCalledWith('shot_1', { title: 'Updated Title' })
      expect(JSON.parse(res._getData())).toEqual(mockShots)
    })

    it('should return 400 for missing shotId', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          updates: { title: 'Updated Title' }
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Shot ID and updates are required'
      })
    })

    it('should return 500 when update fails', async () => {
      updateShot.mockReturnValue(false)

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          shotId: 'shot_1',
          updates: { title: 'Updated Title' }
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to update shot'
      })
    })
  })

  describe('POST /api/shots', () => {
    it('should add new shot successfully', async () => {
      const newShot = createMockShot({ id: 'shot_new' })
      const updatedShots = [newShot]
      
      addShot.mockReturnValue(true)
      getShots.mockReturnValue(updatedShots)

      const { req, res } = createMocks({
        method: 'POST',
        body: newShot,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(addShot).toHaveBeenCalledWith(newShot)
      expect(JSON.parse(res._getData())).toEqual(updatedShots)
    })

    it('should return 400 for missing required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields like title
          character: 'Test Character'
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Title and ID are required'
      })
    })

    it('should return 500 when add fails', async () => {
      const newShot = createMockShot()
      addShot.mockReturnValue(false)

      const { req, res } = createMocks({
        method: 'POST',
        body: newShot,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to add shot'
      })
    })
  })

  describe('DELETE /api/shots', () => {
    it('should delete shot successfully', async () => {
      const remainingShots = [createMockShot({ id: 'shot_2' })]
      
      deleteShot.mockReturnValue(true)
      getShots.mockReturnValue(remainingShots)

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          shotId: 'shot_1'
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(deleteShot).toHaveBeenCalledWith('shot_1')
      expect(JSON.parse(res._getData())).toEqual(remainingShots)
    })

    it('should return 400 for missing shotId', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        body: {},
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Shot ID is required'
      })
    })

    it('should return 500 when delete fails', async () => {
      deleteShot.mockReturnValue(false)

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          shotId: 'shot_1'
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to delete shot'
      })
    })
  })

  describe('unsupported methods', () => {
    it('should return 405 for unsupported HTTP methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed'
      })
    })
  })
}) 