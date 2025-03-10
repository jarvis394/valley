import Wrapper from '@valley/ui/Wrapper'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { db } from '@valley/db'
import { notFound } from 'next/navigation'
import { queryUserByDomainSql } from '../../server/user'

export default async function DomainHome({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const domain = (await params).domain
  const user = await db.query.users.findFirst({
    columns: {
      domains: true,
      name: true,
    },
    where: () => queryUserByDomainSql(domain),
    with: {
      avatar: true,
      projects: {
        with: {
          cover: {
            with: {
              file: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return notFound()
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <h1 className="text-2xl font-medium">{user?.name}</h1>
      <Wrapper>
        <div className="grid min-sm:grid-cols-2 min-lg:grid-cols-3 min-xl:grid-cols-4 grid-cols-1 gap-4 w-full">
          {user.projects.map((project) => (
            <ProjectCard key={project.id} domain={domain} project={project} />
          ))}
        </div>
      </Wrapper>
    </div>
  )
}
