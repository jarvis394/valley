import React from 'react'
import Stack from '@valley/ui/Stack'
import Logo from '../Logo/Logo'
import styles from './Footer.module.css'
import Wrapper from '@valley/ui/Wrapper'
import IconButton from '@valley/ui/IconButton'
import { LogoGithub } from 'geist-ui-icons'
import Divider from '@valley/ui/Divider'
import {
  GITHUB_REPOSITORY_URL,
  TELEGRAM_PHOTOS_URL,
} from '../../config/constants'
import { Link } from '@remix-run/react'

const TelegramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
    width="16px"
    height="16px"
    fill="currentColor"
  >
    <path d="M25,2c12.703,0,23,10.297,23,23S37.703,48,25,48S2,37.703,2,25S12.297,2,25,2z M32.934,34.375	c0.423-1.298,2.405-14.234,2.65-16.783c0.074-0.772-0.17-1.285-0.648-1.514c-0.578-0.278-1.434-0.139-2.427,0.219	c-1.362,0.491-18.774,7.884-19.78,8.312c-0.954,0.405-1.856,0.847-1.856,1.487c0,0.45,0.267,0.703,1.003,0.966	c0.766,0.273,2.695,0.858,3.834,1.172c1.097,0.303,2.346,0.04,3.046-0.395c0.742-0.461,9.305-6.191,9.92-6.693	c0.614-0.502,1.104,0.141,0.602,0.644c-0.502,0.502-6.38,6.207-7.155,6.997c-0.941,0.959-0.273,1.953,0.358,2.351	c0.721,0.454,5.906,3.932,6.687,4.49c0.781,0.558,1.573,0.811,2.298,0.811C32.191,36.439,32.573,35.484,32.934,34.375z" />
  </svg>
)

const Footer: React.FC = () => {
  return (
    <>
      <Divider variant="dimmed" />
      <Stack
        className={styles.Footer}
        padding={6}
        align={'center'}
        justify={'center'}
        asChild
        direction={'column'}
        gap={2}
      >
        <Wrapper>
          <Link to="/">
            <Logo className={styles.Footer__logo} withBrandName />
          </Link>
          <Stack gap={0} align={'center'}>
            <IconButton asChild variant="tertiary-dimmed" size="md">
              <a href={GITHUB_REPOSITORY_URL} target="_blank" rel="noreferrer">
                <LogoGithub />
              </a>
            </IconButton>
            <IconButton asChild variant="tertiary-dimmed" size="md">
              <a href={TELEGRAM_PHOTOS_URL} target="_blank" rel="noreferrer">
                <TelegramIcon />
              </a>
            </IconButton>
          </Stack>
        </Wrapper>
      </Stack>
    </>
  )
}

export default Footer
