import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderFunctionArgs, redirect } from '@vercel/remix'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { UrlService } from 'app/server/services/url.server'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const ProjectsCreateSchema = z.object({
  projectName: z.string(),
  dateShot: z.coerce.date(),
})

type FormData = z.infer<typeof ProjectsCreateSchema>

const resolver = zodResolver(ProjectsCreateSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request)

  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return Response.json(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  const project = await prisma.project.create({
    data: {
      title: submissionData.projectName,
      dateShot: submissionData.dateShot,
      url: UrlService.generateURL(submissionData.projectName),
      User: {
        connect: {
          id: user.id,
        },
      },
      folders: {
        create: {
          isDefaultFolder: true,
          title: 'Default',
          description: null,
        },
      },
    },
  })

  return redirect('/projects/' + project.url)
}
