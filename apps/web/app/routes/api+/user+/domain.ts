import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireUser } from 'app/server/auth/auth.server'
import { redirectWithToast } from 'app/server/toast.server'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const MAX_USER_DOMAIN_HISTORY_LENGTH = 5
export const DomainSchema = z.string().max(32).min(4)
export const UserDomainAddSchema = z.object({
  domain: DomainSchema,
})

type FormData = z.infer<typeof UserDomainAddSchema>

const resolver = zodResolver(UserDomainAddSchema)

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

  const newDomain = submissionData.domain
  const exists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          domains: {
            has: newDomain,
          },
        },
        {
          serviceDomain: newDomain,
        },
      ],
    },
  })

  if (exists && exists.id !== user.id) {
    return redirectWithToast('/settings/general', {
      type: 'error',
      title: 'Domain Taken',
      description: 'Domain "' + newDomain + '" is already taken',
    })
  }

  try {
    let newDomains: string[]

    // Move new domain to be the first if it is included in user domains history
    if (user.domains.includes(newDomain)) {
      newDomains = [
        newDomain,
        ...user.domains.filter((e) => e !== newDomain),
      ].slice(0, MAX_USER_DOMAIN_HISTORY_LENGTH)
    }
    // Or just add it to the front
    else {
      newDomains = [newDomain, ...user.domains].slice(
        0,
        MAX_USER_DOMAIN_HISTORY_LENGTH
      )
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        domains: newDomains,
      },
    })

    return redirectWithToast('/settings/general', {
      type: 'info',
      title: 'Domain Updated',
      description: 'Updated user domain to "' + newDomain + '"',
    })
  } catch (e) {
    return data(
      {
        ok: false,
        errors: {
          root: `Error occurred: ${(e as Error).message}`,
        },
        defaultValues,
      },
      {
        status: 500,
      }
    )
  }
}
