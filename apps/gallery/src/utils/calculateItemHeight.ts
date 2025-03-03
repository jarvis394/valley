const BREAKPOINT_XXL = '1440px'
const BREAKPOINT_XL = '1200px'
const BREAKPOINT_SM = '576px'

export type CalculateItemHeightArguments = {
  width: number
  height: number
  masonrySizerWidth: number
}

export const calculateItemHeight = ({
  width,
  height,
  masonrySizerWidth,
}: CalculateItemHeightArguments) => {
  if (typeof document === 'undefined') return null

  let columnWidth = null

  columnWidth = masonrySizerWidth / 5

  if (window.matchMedia(`(max-width: ${BREAKPOINT_XXL})`).matches) {
    columnWidth = masonrySizerWidth / 4
  }

  if (window.matchMedia(`(max-width: ${BREAKPOINT_XL})`).matches) {
    columnWidth = masonrySizerWidth / 3
  }

  if (window.matchMedia(`(max-width: ${BREAKPOINT_SM})`).matches) {
    columnWidth = masonrySizerWidth / 2
  }

  // Vertical photo
  if (height > width) {
    const aspectRatio = height / width
    return columnWidth * aspectRatio
  }

  // Horizontal photo
  if (width > height) {
    const aspectRatio = width / height
    return columnWidth / aspectRatio
  }

  // Square photo
  if (width === height) {
    return columnWidth
  }

  return columnWidth
}
