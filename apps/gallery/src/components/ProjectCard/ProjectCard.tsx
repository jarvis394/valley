'use client'

import React, { useTransition } from 'react'
import styles from './ProjectCard.module.css'
import { Share } from 'geist-ui-icons'
import IconButton from '@valley/ui/IconButton'
import dayjs from 'dayjs'
import Skeleton from '@valley/ui/Skeleton'
import { ProjectWithFolders } from '@valley/shared'
import cx from 'classnames'
import { UPLOAD_SERVICE_URL } from '../../config/constants'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type ProjectCardOwnProps =
  | {
      project: ProjectWithFolders
      domain: string
      loading?: false
    }
  | {
      project?: never
      domain?: never
      loading: true
    }

export type ProjectCardProps = ProjectCardOwnProps &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  loading,
  className,
  domain,
  ...props
}) => {
  const timestamp = dayjs(project?.dateShot).format('MMMM D, YYYY')
  const projectLink = `/${domain}/gallery/${project?.url}`
  const coverImage =
    project?.coverImage?.File.thumbnailKey &&
    UPLOAD_SERVICE_URL + '/api/files/' + project.coverImage.File.key
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLinkClick: React.MouseEventHandler = (e) => {
    e.preventDefault()
    startTransition(() => {
      router.push(projectLink)
    })
  }

  return (
    <div
      {...props}
      className={cx(styles.projectCard, className, {
        shimmer: isPending,
      })}
    >
      {loading && <div className={styles.projectCard__cover} />}
      {!loading && (
        <Link
          onClick={handleLinkClick}
          href={projectLink}
          className={styles.projectCard__cover}
        >
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={project.title} src={coverImage} />
          )}
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
        <Link
          onClick={handleLinkClick}
          href={projectLink}
          className={styles.projectCard__header}
        >
          <h3 className={styles.projectCard__contentTitle}>{project?.title}</h3>
          <p className={styles.projectCard__contentSubtitle}>
            {project?.totalFiles} photos
            <span className={styles.projectCard__bullet}>•</span>
            {timestamp}
          </p>
        </Link>
      )}
      {!loading && (
        <IconButton
          className={styles.projectCard__menu}
          size="sm"
          variant="secondary-dimmed"
        >
          <Share />
        </IconButton>
      )}
    </div>
  )
}

export default React.memo(ProjectCard)
