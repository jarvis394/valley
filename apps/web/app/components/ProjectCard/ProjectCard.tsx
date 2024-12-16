import React from 'react'
import styles from './ProjectCard.module.css'
import {
  Copy,
  Download,
  Heart,
  LineChart,
  Link as LinkIcon,
  MoreHorizontal,
  Share,
} from 'geist-ui-icons'
import IconButton from '@valley/ui/IconButton'
import dayjs from 'dayjs'
import { Link } from '@remix-run/react'
import Skeleton from '@valley/ui/Skeleton'
import { ProjectWithFolders } from '@valley/shared'

type ProjectCardProps =
  | {
      project: ProjectWithFolders
      loading?: false
    }
  | {
      project?: never
      loading: true
    }

const ProjectCard: React.FC<ProjectCardProps> = ({ project, loading }) => {
  const timestamp = dayjs(project?.dateShot).format('MMMM D, YYYY')
  const defaultFolderId =
    project?.folders.find((e) => e.isDefaultFolder)?.id ||
    project?.folders[0]?.id
  const projectLink = `/projects/${project?.id}/folder/${defaultFolderId}`

  return (
    <div className={styles.projectCard}>
      {loading && <div className={styles.projectCard__cover} />}
      {!loading && (
        <Link to={projectLink} className={styles.projectCard__cover}>
          {/* <Image priority height={424} src={cover} alt={'Cover'} /> */}
        </Link>
      )}
      {loading && (
        <div className={styles.projectCard__header}>
          <h3 className={styles.projectCard__contentTitle}>
            <Skeleton width={'40%'} height={25} />
            <Skeleton width={'25%'} height={25} />
          </h3>
          <p className={styles.projectCard__contentSubtitle}>
            <Skeleton width={'30%'} height={20} />
            <Skeleton width={'50%'} height={20} />
          </p>
        </div>
      )}
      {!loading && (
        <Link to={projectLink} className={styles.projectCard__header}>
          <h3 className={styles.projectCard__contentTitle}>{project?.title}</h3>
          <p className={styles.projectCard__contentSubtitle}>
            {project?.totalFiles} photos
            <span className={styles.projectCard__bullet}>•</span>
            {timestamp}
          </p>
        </Link>
      )}
      {loading && (
        <div className={styles.projectCard__linkContainer}>
          <div className={styles.projectCard__link} style={{ height: 32 }}>
            <Skeleton variant="rectangular" width={16} height={16} />
            <Skeleton variant="rectangular" width={'30%'} height={16} />
            <Skeleton variant="rectangular" width={'45%'} height={16} />
          </div>
        </div>
      )}
      {!loading && (
        <div className={styles.projectCard__linkContainer}>
          <div className={styles.projectCard__link}>
            <LinkIcon />
            <div>{project?.url}</div>
          </div>
          <IconButton size="sm" variant="secondary-dimmed">
            <Copy />
          </IconButton>
        </div>
      )}
      <div className={styles.projectCard__divider} />
      <div className={styles.projectCard__bottomBar}>
        <div className={styles.projectCard__statistics}>
          <div className={styles.projectCard__statisticsItem}>
            {loading && (
              <Skeleton variant="rectangular" width={40} height={16} />
            )}
            {!loading && (
              <>
                <LineChart />0
              </>
            )}
          </div>
          <div className={styles.projectCard__statisticsItem}>
            {loading && (
              <Skeleton variant="rectangular" width={40} height={16} />
            )}
            {!loading && (
              <>
                <Download />0
              </>
            )}
          </div>
          <div className={styles.projectCard__statisticsItem}>
            {loading && (
              <Skeleton variant="rectangular" width={40} height={16} />
            )}
            {!loading && (
              <>
                <Heart />0
              </>
            )}
          </div>
        </div>
        {!loading && (
          <div className={styles.projectCard__shareButton}>
            <IconButton size="sm" variant="secondary-dimmed">
              <Share />
            </IconButton>
          </div>
        )}
      </div>
      {!loading && (
        <IconButton
          className={styles.projectCard__menu}
          size="sm"
          variant="secondary-dimmed"
        >
          <MoreHorizontal />
        </IconButton>
      )}
    </div>
  )
}

export default ProjectCard
