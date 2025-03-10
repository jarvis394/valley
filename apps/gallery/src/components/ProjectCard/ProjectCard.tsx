'use client'

import React, { useTransition } from 'react'
import styles from './ProjectCard.module.css'
import { Share } from 'geist-ui-icons'
import IconButton from '@valley/ui/IconButton'
import dayjs from 'dayjs'
import Skeleton from '@valley/ui/Skeleton'
import cx from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from '@valley/ui/Image'
import { WEB_SERVICE_URL } from '../../config/constants'
import { Cover, Project, File } from '@valley/db'

export type ProjectCardOwnProps =
  | {
      project: Project & {
        cover?: Array<Cover & { file: File }> | null
      }
      domain: string
      loading?: false
    }
  | { project?: never; domain?: never; loading: true }

export type ProjectCardProps = ProjectCardOwnProps &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  loading,
  className,
  domain,
  ...props
}) => {
  const timestamp = dayjs(project?.dateShot || project?.createdAt).format(
    'MMMM D, YYYY'
  )
  const projectLink = `/${domain}/gallery/${project?.slug}`
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
      className={cx(styles.projectCard, className, { shimmer: isPending })}
    >
      {loading && <div className={styles.projectCard__cover} />}
      {!loading && (
        <Link
          onClick={handleLinkClick}
          href={projectLink}
          className={styles.projectCard__cover}
        >
          {project.cover && project.cover.length > 0 && (
            <Image
              alt={project.title}
              file={project.cover[0].file}
              thumbnail="md"
              imageHost={WEB_SERVICE_URL}
            />
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
