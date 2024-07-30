import React from 'react'
import styles from './ProjectCard.module.css'
import Image from 'next/image'
import cover from '../../assets/cover.jpg'
import {
  Copy,
  Download,
  Heart,
  LineChart,
  Link as LinkIcon,
  MoreHorizontal,
  Share,
} from 'geist-ui-icons'
import Button from '../Button/Button'
import IconButton from '../IconButton/IconButton'
import { Project } from '@prisma/client'
import dayjs from 'dayjs'
import Link from 'next/link'

type ProjectCardProps = {
  data: Project
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
  const timestamp = dayjs(data.dateShot).format('MMMM D, YYYY')
  const projectLink = `/projects/${data.id}`

  return (
    <div className={styles.projectCard}>
      <Link href={projectLink} className={styles.projectCard__cover}>
        <Image height={424} src={cover} alt={'Cover'} />
      </Link>
      <div className={styles.projectCard__content}>
        <Link href={projectLink} className={styles.projectCard__header}>
          <h3 className={styles.projectCard__contentTitle}>{data.title}</h3>
          <p className={styles.projectCard__contentSubtitle}>
            {data.totalFiles} photos
            <span className={styles.projectCard__bullet}>•</span>
            {timestamp}
          </p>
        </Link>
        <div className={styles.projectCard__linkContainer}>
          <div className={styles.projectCard__link}>
            <LinkIcon />
            <div>{data.url}</div>
          </div>
          <Button size="sm" variant="secondary-dimmed" before={<Copy />}>
            Copy URL
          </Button>
        </div>
      </div>
      <div className={styles.projectCard__divider} />
      <div className={styles.projectCard__bottomBar}>
        <div className={styles.projectCard__statistics}>
          <div className={styles.projectCard__statisticsItem}>
            <LineChart />
            128
          </div>
          <div className={styles.projectCard__statisticsItem}>
            <Download />
            11
          </div>
          <div className={styles.projectCard__statisticsItem}>
            <Heart />1
          </div>
        </div>
        <div className={styles.projectCard__shareButton}>
          <IconButton size="sm" variant="secondary-dimmed">
            <Share />
          </IconButton>
        </div>
      </div>
      <IconButton
        className={styles.projectCard__menu}
        size="sm"
        variant="secondary-dimmed"
      >
        <MoreHorizontal />
      </IconButton>
    </div>
  )
}

export default ProjectCard
