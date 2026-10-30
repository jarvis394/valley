import type { CSSProperties } from 'react'
import { cn } from '../cn'
import analytics from './analytics.svg'
import chevronDownSmall from './chevron-down-small.svg'
import chevronDown from './chevron-down.svg'
import external from './external.svg'
import eyeOff from './eye-off.svg'
import eye from './eye.svg'
import file from './file.svg'
import folderClosed from './folder-closed.svg'
import footer from './footer.svg'
import globe from './globe.svg'
import heart from './heart.svg'
import image from './image.svg'
import kv from './kv.svg'
import logo from './logo.svg'
import menuExpand from './menu-expand.svg'
import plus from './plus.svg'
import portfolio from './portfolio.svg'
import projects from './projects.svg'
import settings from './settings.svg'
import share from './share.svg'
import slashBack from './slash-back.svg'
import textFormat from './text-format.svg'
import toolbar from './toolbar.svg'

export type IconComponent = (props: { className?: string }) => React.ReactElement

/**
 * Design-system icons (Geist set, exported from Figma). They render as a CSS mask over
 * `currentColor`, so color and opacity come from the surrounding text styles.
 */
const createIcon = (src: string, name: string): IconComponent => {
  const style: CSSProperties = {
    maskImage: `url("${src}")`,
    maskSize: '100% 100%',
    maskRepeat: 'no-repeat',
  }
  const Icon: IconComponent = ({ className }) => (
    <span
      aria-hidden
      data-icon={name}
      className={cn('inline-block size-4 shrink-0 bg-current', className)}
      style={style}
    />
  )
  return Icon
}

export const AnalyticsIcon = createIcon(analytics, 'analytics')
export const ChevronDownIcon = createIcon(chevronDown, 'chevron-down')
export const ChevronDownSmallIcon = createIcon(chevronDownSmall, 'chevron-down-small')
export const ExternalIcon = createIcon(external, 'external')
export const EyeIcon = createIcon(eye, 'eye')
export const EyeOffIcon = createIcon(eyeOff, 'eye-off')
export const FileIcon = createIcon(file, 'file')
export const FolderIcon = createIcon(folderClosed, 'folder-closed')
export const FooterIcon = createIcon(footer, 'footer')
export const GlobeIcon = createIcon(globe, 'globe')
export const HeartIcon = createIcon(heart, 'heart')
export const ImageIcon = createIcon(image, 'image')
export const KvIcon = createIcon(kv, 'kv')
export const LogoIcon = createIcon(logo, 'logo')
export const MenuExpandIcon = createIcon(menuExpand, 'menu-expand')
export const PlusIcon = createIcon(plus, 'plus')
export const PortfolioIcon = createIcon(portfolio, 'portfolio')
export const ProjectsIcon = createIcon(projects, 'projects')
export const SettingsIcon = createIcon(settings, 'settings')
export const ShareIcon = createIcon(share, 'share')
export const SlashBackIcon = createIcon(slashBack, 'slash-back')
export const TextFormatIcon = createIcon(textFormat, 'text-format')
export const ToolbarIcon = createIcon(toolbar, 'toolbar')
