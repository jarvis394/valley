import React from 'react'
import Button from '@valley/ui/Button'
import Link from 'next/link'
import styles from './Projects.module.css'
import { Project } from '@prisma/client'
import { Metadata } from 'next'
import ProjectCard from '../../components/ProjectCard/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects | Valley',
  description: 'Platform for your photography sessions',
}

const REMOVEME_PROJECT_DATA: Project = {
  id: 1,
  dateCreated: new Date(),
  dateUpdated: new Date(),
  dateShot: new Date(),
  storedUntil: 0,
  language: 'ru',
  protected: false,
  title: 'Безымянный Исполнитель — Неизвестно',
  totalFiles: 21,
  url: '/test',
  userId: 1,
  password: null,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  translationStringsId: null,
}

const ProjectsPage = () => {
  return (
    <div className={styles.projects}>
      <Link style={{ textDecoration: 'none' }} href="/">
        <Button>Go back</Button>
      </Link>
      <div className={styles.projects__list}>
        <ProjectCard data={REMOVEME_PROJECT_DATA} />
      </div>
    </div>
  )
}

export default ProjectsPage
