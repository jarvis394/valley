import { describe, expect, test } from 'bun:test'
import type { Asset } from '../../core/document'
import { assetId } from '../../core/ids'
import { islandMeasure, normalizedTracks, planAlbum, type AlbumNode } from './layout'

const photo = (index: number, width: number, height: number): Asset => ({
  id: assetId(`a_${index}`),
  kind: 'image',
  name: `photo-${index}.jpg`,
  src: `/demo/${index}.jpg`,
  width,
  height,
})

const portrait = (index: number) => photo(index, 1066, 1600)
const landscape = (index: number) => photo(index, 1600, 1066)

function flattenIds(node: AlbumNode | null): string[] {
  if (!node) return []
  if (node.kind === 'photo') return [node.asset.id]

  return node.children.flatMap(flattenIds)
}

function renderedRatios(node: AlbumNode, width: number, height: number): number[] {
  if (node.kind === 'photo') return [width / height]
  if (node.kind === 'row') {
    const total = node.children.reduce((sum, child) => sum + child.ratio, 0)

    return node.children.flatMap((child) =>
      renderedRatios(child, width * (child.ratio / total), height),
    )
  }
  const total = node.children.reduce((sum, child) => sum + 1 / child.ratio, 0)

  return node.children.flatMap((child) =>
    renderedRatios(child, width, height * (1 / child.ratio / total)),
  )
}

describe('planAlbum', () => {
  test('preserves exact photo order and zero-crop aspect ratios across counts 0 to 12', () => {
    const cases: Asset[][] = [
      [],
      [portrait(1)],
      [landscape(1)],
      [portrait(1), portrait(2)],
      [landscape(1), landscape(2)],
      [landscape(1), portrait(2)],
      [portrait(1), portrait(2), portrait(3)],
      [landscape(1), landscape(2), landscape(3)],
      [portrait(1), landscape(2), portrait(3)],
      [portrait(1), landscape(2), landscape(3)],
      [landscape(1), landscape(2), portrait(3)],
      [portrait(1), portrait(2), portrait(3), portrait(4)],
      [portrait(1), landscape(2), portrait(3), landscape(4)],
      [landscape(1), portrait(2), portrait(3), portrait(4)],
      [portrait(1), landscape(2), landscape(3), landscape(4)],
      [portrait(1), portrait(2), portrait(3), portrait(4), portrait(5)],
      [landscape(1), portrait(2), portrait(3), portrait(4), portrait(5), portrait(6)],
      [portrait(1), portrait(2), portrait(3), portrait(4), portrait(5), portrait(6), portrait(7)],
      Array.from({ length: 12 }, (_, i) => (i % 3 === 0 ? landscape(i + 1) : portrait(i + 1))),
    ]

    for (const items of cases) {
      const album = planAlbum(items)
      expect(flattenIds(album)).toEqual(items.map((item) => item.id))
      if (!album) continue
      const actual = renderedRatios(album, 720, 720 / album.ratio)
      for (let i = 0; i < items.length; i++) {
        const expected = items[i]!.width / items[i]!.height
        expect(Math.abs(actual[i]! - expected)).toBeLessThan(0.001)
      }
    }
  })

  test('produces Telegram album shapes for 2, 3, 4 and 5 photos', () => {
    const twoLandscapes = planAlbum([landscape(1), landscape(2)])
    expect(twoLandscapes?.kind).toBe('col')

    const threePortraits = planAlbum([portrait(1), portrait(2), portrait(3)])
    expect(threePortraits?.kind).toBe('row')
    if (threePortraits?.kind === 'row') {
      expect(threePortraits.children[0]?.kind).toBe('photo')
      expect(threePortraits.children[1]?.kind).toBe('col')
      expect(threePortraits.ratio).toBeCloseTo(1, 2)
    }

    const threeLandscapes = planAlbum([landscape(1), landscape(2), landscape(3)])
    expect(threeLandscapes?.kind).toBe('col')
    if (threeLandscapes?.kind === 'col') {
      expect(threeLandscapes.children[0]?.kind).toBe('photo')
      expect(threeLandscapes.children[1]?.kind).toBe('row')
      expect(threeLandscapes.ratio).toBeCloseTo(1, 2)
    }

    const heroPlusThree = planAlbum([landscape(1), portrait(2), portrait(3), portrait(4)])
    expect(heroPlusThree?.kind).toBe('col')
    if (heroPlusThree?.kind === 'col') {
      expect(heroPlusThree.children[0]?.kind).toBe('photo')
      expect(heroPlusThree.children[1]?.kind).toBe('row')
    }

    const fivePortraits = planAlbum([
      portrait(1),
      portrait(2),
      portrait(3),
      portrait(4),
      portrait(5),
    ])
    expect(fivePortraits?.kind).toBe('col')
    if (fivePortraits?.kind === 'col') {
      const lengths = fivePortraits.children.map((c) => (c.kind === 'row' ? c.children.length : 1))
      expect(lengths).toEqual([2, 3])
    }
  })

  test('always normalizes CSS Grid tracks to sum to 100fr', () => {
    for (const weights of [[0.666], [0.666, 0.666], [1.5, 0.666], [0.666, 1.5, 0.666]]) {
      const sum = normalizedTracks(weights)
        .split(' ')
        .reduce((acc, token) => acc + Number.parseFloat(token), 0)
      expect(sum).toBeCloseTo(100, 2)
    }
  })

  test('bounds tall albums by height instead of stretching them', () => {
    const singleP = [portrait(1)]
    const singleL = [landscape(1)]
    const fourP = [portrait(1), portrait(2), portrait(3), portrait(4)]

    const wP = islandMeasure(240, singleP, 'collage', true, planAlbum(singleP))
    const wL = islandMeasure(240, singleL, 'collage', true, planAlbum(singleL))
    const w4 = islandMeasure(240, fourP, 'collage', true, planAlbum(fourP))

    expect(wP).toBeLessThan(wL)
    expect(w4).toBeLessThan(wL)
  })
})
