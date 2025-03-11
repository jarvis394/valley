import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db, projects } from '@valley/db'
import { requireUser } from 'app/server/auth/auth.server'
import { UrlService } from 'app/server/services/url.server'
import dayjs from 'dayjs'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const ProjectsCreateSchema = z.object({
  projectName: z.string(),
  storedUntil: z.coerce.date().or(z.null()).optional(),
  visibility: z.enum(['public', 'private']),
  dateShot: z.coerce.date().or(z.null()).optional(),
  password: z.string().or(z.null()).optional(),
  withPassword: z.boolean().optional().default(false),
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
    return data(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  const password =
    submissionData.visibility === 'private' &&
    submissionData.withPassword &&
    submissionData.password
  const storedUntil = submissionData.storedUntil
    ? dayjs(submissionData.storedUntil)
        .set('hours', 23)
        .set('minutes', 59)
        .set('seconds', 59)
        .set('milliseconds', 0)
        .toDate()
    : null
  const [project] = await db
    .insert(projects)
    .values({
      title: submissionData.projectName,
      dateShot: submissionData.dateShot || undefined,
      storedUntil,
      protected: submissionData.visibility === 'private',
      passwordHash: password || null,
      slug: UrlService.generateURL(submissionData.projectName),
      userId: user.id,
    })
    .returning()

  return redirect('/projects/' + project.id)
}
