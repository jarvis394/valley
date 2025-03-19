import React from 'react'
import * as E from '@react-email/components'

type VerifyEmailProps = {
  code: string
  email: string
  magicLink?: string | null
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  code,
  email,
  magicLink,
}) => {
  return (
    <E.Html lang="en" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Welcome to Valley</E.Text>
        </h1>
        <p>
          <E.Text>
            Here&apos;s your verification code: <strong>{code}</strong>
          </E.Text>
        </p>
        <p>
          <E.Text>Your authentication email is {email}</E.Text>
        </p>
        {magicLink && (
          <>
            <p>
              <E.Text>Or click the link to get started:</E.Text>
            </p>
            <E.Link href={magicLink}>{magicLink}</E.Link>
          </>
        )}
      </E.Container>
    </E.Html>
  )
}

export default VerifyEmail
