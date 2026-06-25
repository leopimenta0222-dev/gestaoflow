import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('monta cabeçalho + linhas', () => {
    expect(toCsv([{ a: 1, b: 'x' }], ['a', 'b'])).toBe('a,b\n1,x')
  })
  it('escapa vírgula entre aspas', () => {
    expect(toCsv([{ a: 'x,y' }], ['a'])).toBe('a\n"x,y"')
  })
  it('lista vazia retorna só o cabeçalho', () => {
    expect(toCsv([], ['a', 'b'])).toBe('a,b')
  })
})
