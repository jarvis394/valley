import type { Config } from 'tailwindcss'
import tailwindcssRadix from 'tailwindcss-radix'

// We want each package to be responsible for its own content
const config: Omit<Config, 'content'> = {
  darkMode: 'class',
  theme: {
    /** Adapted from https://vercel.com/geist */
    extend: {
      fontSize: {
        // Heading Sizes
        'heading-72': [
          '72px',
          { lineHeight: '72px', letterSpacing: '-4.32px' },
        ],
        'heading-64': [
          '64px',
          { lineHeight: '64px', letterSpacing: '-3.84px' },
        ],
        'heading-56': [
          '56px',
          { lineHeight: '56px', letterSpacing: '-3.36px' },
        ],
        'heading-48': [
          '48px',
          { lineHeight: '56px', letterSpacing: '-2.88px' },
        ],
        'heading-40': ['40px', { lineHeight: '48px', letterSpacing: '-2.4px' }],
        'heading-32': [
          '32px',
          { lineHeight: '40px', letterSpacing: '-1.28px' },
        ],
        'heading-24': [
          '24px',
          { lineHeight: '32px', letterSpacing: '-0.96px' },
        ],
        'heading-20': ['20px', { lineHeight: '26px', letterSpacing: '-0.4px' }],
        'heading-16': [
          '16px',
          { lineHeight: '24px', letterSpacing: '-0.32px' },
        ],
        'heading-14': [
          '14px',
          { lineHeight: '20px', letterSpacing: '-0.28px' },
        ],

        // Button Sizes
        'button-16': ['16px', { lineHeight: '20px' }],
        'button-14': ['14px', { lineHeight: '20px' }],
        'button-12': ['12px', { lineHeight: '16px' }],

        // Label Sizes
        'label-20': ['20px', { lineHeight: '32px' }],
        'label-18': ['18px', { lineHeight: '20px' }],
        'label-16': ['16px', { lineHeight: '20px' }],
        'label-14': ['14px', { lineHeight: '20px' }],
        'label-13': ['13px', { lineHeight: '16px' }],
        'label-12': ['12px', { lineHeight: '16px' }],

        // Copy Sizes
        'copy-24': ['24px', { lineHeight: '36px' }],
        'copy-20': ['20px', { lineHeight: '36px' }],
        'copy-18': ['18px', { lineHeight: '28px' }],
        'copy-16': ['16px', { lineHeight: '24px' }],
        'copy-14': ['14px', { lineHeight: '20px' }],
        'copy-13': ['13px', { lineHeight: '18px' }],
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          'var(--font-geist-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      keyframes: {
        'clip-grow': {
          from: { clipPath: 'circle(0% at 50% 50%)' },
          to: { clipPath: 'circle(60% at 50% 50%)' },
        },
      },
      animation: {
        ['clip-grow']: 'clip-grow 200ms cubic-bezier(0.62, 0, 0, 1)',
      },
    },
  },
  plugins: [tailwindcssRadix({})],
}

export default config
