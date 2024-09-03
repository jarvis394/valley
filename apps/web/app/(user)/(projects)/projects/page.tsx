'use client'
import React from 'react'
import Button from '@valley/ui/Button'
import Link from 'next/link'
import styles from './Projects.module.css'
import ProjectCard from '../../../components/ProjectCard/ProjectCard'
import useSWR from 'swr'
import { api } from '../../../api'
import { ProjectGetAllReq, ProjectGetAllRes } from '@valley/shared'
import Wrapper from '@valley/ui/Wrapper'

const ProjectsPage: React.FC = () => {
  const { data, isLoading } = useSWR<ProjectGetAllRes, ProjectGetAllReq>(
    '/projects',
    api({ isAccessTokenRequired: true })
  )

  return (
    <div className={styles.projects}>
      <Link style={{ textDecoration: 'none' }} href="/">
        <Button>Go back</Button>
      </Link>
      <Link
        style={{ textDecoration: 'none' }}
        href={{ pathname: '/projects', query: { modal: 'create-project' } }}
      >
        <Button variant="secondary-dimmed">projects/create-project</Button>
      </Link>
      <Wrapper>
        <div className={styles.projects__list}>
          {isLoading && <h2>Loading...</h2>}
          {data?.projects.map((project, i) => (
            <ProjectCard data={project} key={i} />
          ))}
        </div>
      </Wrapper>
    </div>
  )
}

export default ProjectsPage
