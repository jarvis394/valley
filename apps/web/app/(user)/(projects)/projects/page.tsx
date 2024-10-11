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
    api({ isAccessTokenRequired: true }),
    {
      suspense: true,
      fallbackData: {
        projects: [],
      },
    }
  )

  return (
    <div className={styles.projects}>
      <Button asChild>
        <Link href="/">Go back</Link>
      </Button>
      <Button asChild variant="secondary-dimmed">
        <Link
          href={{ pathname: '/projects', query: { modal: 'create-project' } }}
        >
          /projects/create-project
        </Link>
      </Button>
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
