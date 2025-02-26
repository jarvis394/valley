import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { InterfaceLanguagesSchema } from 'app/config/language'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { redirectWithToast } from 'app/server/toast.server'
import { FullnameSchema } from 'app/utils/user-validation'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const UserSettingsEditSchema = z
  .object({
    interfaceLanguage: InterfaceLanguagesSchema,
    phone: z.string().nullable(),
    website: z.string().nullable(),
    telegram: z.string().nullable(),
    whatsapp: z.string().nullable(),
    vk: z.string().nullable(),
    instagram: z.string().nullable(),
    youtube: z.string().nullable(),
    vimeo: z.string().nullable(),
    facebook: z.string().nullable(),
  })
  .partial()

export const UserEditSchema = z
  .object({
    email: z.string(),
    fullname: FullnameSchema,
    settings: UserSettingsEditSchema,
  })
  .partial()

type FormData = z.infer<typeof UserEditSchema>

const resolver = zodResolver(UserEditSchema)

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

  try {
    const updateUser = prisma.user.update({
      where: { id: user.id },
      data: {
        fullname: submissionData.fullname,
        email: submissionData.email,
      },
    })
    const updateUserSettings = prisma.userSettings.update({
      where: { userId: user.id },
      data: submissionData.settings || {},
    })
    await prisma.$transaction([updateUser, updateUserSettings])

    return redirectWithToast('/settings/general', {
      type: 'info',
      description: 'Updated user details',
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
