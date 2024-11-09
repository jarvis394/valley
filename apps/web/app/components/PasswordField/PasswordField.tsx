import IconButton from '@valley/ui/IconButton'
import TextField, { TextFieldProps } from '@valley/ui/TextField'
import { Eye, EyeOff } from 'geist-ui-icons'
import React, { useState } from 'react'

const PasswordField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function PasswordField({ type = 'password', ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false)

    const handleClickShowPassword = () => setShowPassword((show) => !show)

    return (
      <TextField
        type={showPassword ? 'text' : type}
        ref={ref}
        after={
          <IconButton
            onClick={handleClickShowPassword}
            type="button"
            variant="tertiary"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </IconButton>
        }
        {...props}
      />
    )
  }
)

export default PasswordField
