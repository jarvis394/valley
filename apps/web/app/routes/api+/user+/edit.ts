import { zodResolver } from '@hookform/resolvers/zod'
import { data, redirect } from 'react-router'
import { db, users, userSettings } from '@valley/db'
import { InterfaceLanguagesSchema } from 'app/config/language'
import { requireUser } from 'app/server/auth/auth.server'
import { redirectWithToast } from 'app/server/toast.server'
import { FullnameSchema } from 'app/utils/user-validation'
import { eq } from 'drizzle-orm'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { Route } from './+types/edit'

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
    fullname: FullnameSchema,
    settings: UserSettingsEditSchema,
  })
  .partial()

type FormData = z.infer<typeof UserEditSchema>

const resolver = zodResolver(UserEditSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request }: Route.ActionArgs) => {
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
    await db.transaction(async (tx) => {
      if (submissionData.fullname) {
        await tx
          .update(users)
          .set({
            name: submissionData.fullname,
          })
          .where(eq(users.id, user.id))
      }

      if (submissionData.settings) {
        await tx
          .update(userSettings)
          .set(submissionData.settings)
          .where(eq(userSettings.userId, user.id))
      }
    })

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
