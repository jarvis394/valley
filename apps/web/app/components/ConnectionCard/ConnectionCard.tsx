import Paper from '@valley/ui/Paper'
import Stack from '@valley/ui/Stack'
import {
  PROVIDER_ICONS,
  PROVIDER_LABELS,
  PROVIDER_MANAGE_LINKS,
  PROVIDER_WEBSITES,
} from 'app/config/connections'
import { ConnectionData } from 'app/routes/_user+/_home+/settings+/auth'
import React, { Suspense, useState } from 'react'
import styles from './ConnectionCard.module.css'
import Link from '../Link/Link'
import Menu from '@valley/ui/Menu'
import IconButton from '@valley/ui/IconButton'
import { MoreHorizontal } from 'geist-ui-icons'
import { lowerFirstLetter } from 'app/utils/misc'
import Hidden from '@valley/ui/Hidden'
import Modal from '@valley/ui/Modal'
import ConfirmConnectionDeleteModal from '../Modals/ConfirmConnectionDelete'
import { Await } from '@remix-run/react'

type ConnectionCardProps = {
  data: ConnectionData
  canDelete: Promise<boolean> | boolean
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ data, canDelete }) => {
  const icon = PROVIDER_ICONS[data.providerName]
  const label = PROVIDER_LABELS[data.providerName]
  const manageLink = PROVIDER_MANAGE_LINKS[data.providerName]
  const manageLinkLabel = PROVIDER_WEBSITES[data.providerName]
  const [isDeletionModalOpen, setDeletionModalOpen] = useState(false)

  const handleDeletionModalOpen = () => {
    setDeletionModalOpen(true)
  }

  const handleDeletionModalClose = () => {
    setDeletionModalOpen(false)
  }

  return (
    <Stack asChild align={'center'} gap={4} padding={4} direction={'row'}>
      <Paper className={styles.connectionCard} variant="secondary">
        {icon}
        <Stack direction={'column'} flex={'1 1'}>
          {label}
          <div className={styles.connectionCard__subtitle}>
            {data.displayName}
            {data.link && (
              <>
                {' ('}
                <Link to={data.link} className="underline">
                  {data.alias}
                </Link>
                {')'}
              </>
            )}
          </div>
        </Stack>
        <Hidden asChild sm>
          <p className={styles.connectionCard__subtitle}>
            Connected {lowerFirstLetter(data.createdAtFormatted)}
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
              <Stack className={styles.connectionCard__menuHeader} padding={2}>
                <p>Connected {lowerFirstLetter(data.createdAtFormatted)}</p>
              </Stack>
            </Hidden>
            <Hidden asChild md lg xl>
              <Menu.Separator />
            </Hidden>
            <Menu.Item href={manageLink}>Manage on {manageLinkLabel}</Menu.Item>
            <Suspense
              fallback={<Menu.Item disabled>Disconnect {label}</Menu.Item>}
            >
              <Await resolve={canDelete}>
                {(resolvedCanDelete) => (
                  <>
                    {resolvedCanDelete && (
                      <Menu.Item onClick={handleDeletionModalOpen}>
                        Disconnect {label}
                      </Menu.Item>
                    )}
                    {!resolvedCanDelete && (
                      <Menu.Item disabled>
                        You cannot delete your last connection unless you have a
                        password
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

export default React.memo(ConnectionCard)
