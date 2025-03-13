import Paper from '@valley/ui/Paper'
import Stack from '@valley/ui/Stack'
import {
  PROVIDER_ICONS,
  PROVIDER_LABELS,
  PROVIDER_MANAGE_LINKS,
  PROVIDER_WEBSITES,
} from 'app/config/connections'
import { AccountData } from 'app/routes/_user+/_home+/settings+/auth'
import React, { Suspense, useState } from 'react'
import styles from './AccountCard.module.css'
import Menu from '@valley/ui/Menu'
import IconButton from '@valley/ui/IconButton'
import { MoreHorizontal } from 'geist-ui-icons'
import { lowerFirstLetter } from 'app/utils/misc'
import Hidden from '@valley/ui/Hidden'
import Modal from '@valley/ui/Modal'
import ConfirmConnectionDeleteModal from '../Modals/ConfirmConnectionDelete'
import { Await } from '@remix-run/react'
import dayjs from 'dayjs'
import { useHydrated } from 'remix-utils/use-hydrated'

type AccountCardProps = {
  data: AccountData
  canDelete: Promise<boolean> | boolean
}

const AccountCard: React.FC<AccountCardProps> = ({ data, canDelete }) => {
  const icon = PROVIDER_ICONS[data.provider]
  const label = PROVIDER_LABELS[data.provider]
  const manageLink =
    data.provider !== 'credential' && PROVIDER_MANAGE_LINKS[data.provider]
  const manageLinkLabel =
    data.provider !== 'credential' && PROVIDER_WEBSITES[data.provider]
  const [isDeletionModalOpen, setDeletionModalOpen] = useState(false)
  const isHydrated = useHydrated()
  const createdAtFormatted = isHydrated
    ? lowerFirstLetter(dayjs(data.createdAt).calendar())
    : ''

  const handleDeletionModalOpen = () => {
    setDeletionModalOpen(true)
  }

  const handleDeletionModalClose = () => {
    setDeletionModalOpen(false)
  }

  return (
    <Stack asChild align={'center'} gap={4} padding={[3, 4]} direction={'row'}>
      <Paper className={styles.accountCard} variant="secondary">
        {icon}
        <Stack direction={'column'} flex={'1 1'}>
          {label}
        </Stack>
        <Hidden asChild sm>
          <p
            className={styles.accountCard__subtitle + ' fade'}
            data-fade-in={isHydrated}
          >
            Connected {createdAtFormatted}
          </p>
        </Hidden>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton variant="tertiary" size="md">
              <MoreHorizontal />
            </IconButton>
          </Menu.Trigger>
          <Menu.Content align="end">
            <Hidden asChild md lg xl>
              <Stack
                className={styles.accountCard__menuHeader + ' fade'}
                data-fade-in={isHydrated}
                padding={2}
              >
                <p>Connected {createdAtFormatted}</p>
              </Stack>
            </Hidden>
            <Hidden asChild md lg xl>
              <Menu.Separator />
            </Hidden>
            {manageLink && (
              <Menu.Item href={manageLink}>
                Manage on {manageLinkLabel}
              </Menu.Item>
            )}
            <Suspense
              fallback={<Menu.Item disabled>Disconnect {label}</Menu.Item>}
            >
              <Await resolve={canDelete}>
                {(resolvedCanDelete) => (
                  <>
                    {resolvedCanDelete && (
                      <Menu.Item onClick={handleDeletionModalOpen}>
                        {data.provider === 'credential' && 'Remove password'}
                        {data.provider !== 'credential' &&
                          'Disconnect ' + label}
                      </Menu.Item>
                    )}
                    {!resolvedCanDelete && (
                      <Menu.Item disabled>
                        You cannot delete your last connection
                      </Menu.Item>
                    )}
                  </>
                )}
              </Await>
            </Suspense>
          </Menu.Content>
        </Menu.Root>
        <Modal
          isOpen={isDeletionModalOpen}
          onDismiss={handleDeletionModalClose}
        >
          <ConfirmConnectionDeleteModal
            data={data}
            onClose={handleDeletionModalClose}
          />
        </Modal>
      </Paper>
    </Stack>
  )
}

export default React.memo(AccountCard)
