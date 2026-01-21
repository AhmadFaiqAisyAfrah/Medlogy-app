import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Smoke Test', () => {
    it('should pass basic math', () => {
        expect(1 + 1).toBe(2)
    })
})
