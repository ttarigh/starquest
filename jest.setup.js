import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock fetch globally
global.fetch = jest.fn()

// Mock file system operations for tests
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

// Setup environment variables for tests
process.env.GEMINI_API_KEY = 'test-api-key'

// Global test utilities
global.createMockShot = (overrides = {}) => ({
  id: 'shot_1',
  title: 'Test Shot',
  character: 'Test Character',
  description: 'Test description',
  prompt: '',
  caption: '',
  status: 'prompt not yet generated',
  videoUrl: '',
  ...overrides,
})

global.createMockFormData = (overrides = {}) => ({
  characters: ['Test Character'],
  costume: ['Test Costume'],
  emotion: ['Happy'],
  setting: ['Studio'],
  additionalDetails: 'Test details',
  ...overrides,
}) 