import type { Cover, File, Project } from '@valley/db'

export type CoverDesignProps = {
  type: 'desktop' | 'mobile'
  cover: Cover & { file: File }
  theme: 'dark' | 'light'
  timeZone?: string
  imageHost?: string
} & Pick<Project, 'title' | 'dateShot'> &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
