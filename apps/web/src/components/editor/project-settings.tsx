import {
  formatBytes,
  formatShortDate,
  formatUsDate,
  summarizeAssets,
  useAssets,
  useEditor,
  useMeta,
  useSettings,
  useTheme,
  ROLE_LABELS,
  TEXT_ROLES,
  TextStyleFields,
  type DocumentMeta,
  type ProjectSettings as Settings,
} from '@valley/canvas'
import {
  Button,
  EyeIcon,
  EyeOffIcon,
  Field,
  IconButton,
  Section,
  SelectField,
  StatRow,
  SwitchField,
  TextField,
  FieldButton,
  FieldGroup,
} from '@valley/ui'
import { Archive, CalendarDays, RefreshCw, Trash2, UserLock } from 'lucide-react'
import { useRef, useState } from 'react'
import { DeleteProjectDialog } from '../projects/delete-project-dialog'

const storeUntilOptions = [
  { value: 'week', label: '1 week' },
  { value: 'month', label: '1 month' },
  { value: 'year', label: '1 year' },
  { value: 'forever', label: 'Forever' },
] as const

const visibilityOptions = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
] as const

const VISIBILITY_DESCRIPTION = {
  private:
    'This project will not be listed in your portfolio and can only be viewed through a direct link',
  public: 'This project is listed in your portfolio and visible to everyone',
} as const

const randomPassword = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(9)), (n) => n.toString(36).slice(-1)).join('')

/** Project tab of the inspector: document meta, access, statistics and actions. */
export function ProjectSettings({ onDelete }: { onDelete?: () => Promise<void> }) {
  const editor = useEditor()
  const meta = useMeta()
  const settings = useSettings()
  const theme = useTheme()
  const { galleryUrl } = editor
  const files = summarizeAssets(useAssets())
  const visibility = settings.visibility ?? 'private'
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const set = <K extends keyof DocumentMeta>(key: K, value: DocumentMeta[K]) =>
    editor.commands.updateMeta((m) => void (m[key] = value), { mergeKey: `meta.${key}` })
  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    editor.updateSettings((s) => void (s[key] = value))

  return (
    <div className="flex flex-col">
      <Section title="Project">
        <Field label="Title">
          <TextField
            value={meta.title}
            placeholder="Japan Trip"
            onChange={(title) => set('title', title)}
          />
        </Field>
        <Field label="Short URL">
          <TextField
            prefix={galleryUrl && `${galleryUrl.replace(/^https?:\/\//, '')}/`}
            value={settings.slug ?? ''}
            placeholder="my-project"
            onChange={(slug) => setSetting('slug', slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase())}
          />
        </Field>
        <div className="flex gap-2">
          <Field label="Date shot" className="flex-1">
            <DateField value={meta.date} onChange={(date) => set('date', date)} />
          </Field>
          <Field label="Store until" className="flex-1">
            <SelectField
              value={settings.storeUntil ?? 'month'}
              options={storeUntilOptions}
              onChange={(storeUntil) => setSetting('storeUntil', storeUntil)}
            />
          </Field>
        </div>
        <Field label="Location">
          <TextField
            value={meta.location ?? ''}
            placeholder="Japan, Kyoto..."
            onChange={(location) => set('location', location)}
          />
        </Field>
      </Section>

      {TEXT_ROLES.map((role) => (
        <Section key={role} title={`${ROLE_LABELS[role]} style`}>
          <TextStyleFields
            value={theme.typography[role]}
            onChange={(patch, options) =>
              editor.commands.updateTheme(
                (t) => void Object.assign(t.typography[role], patch),
                options && { mergeKey: `theme.${role}.${options.mergeKey}` },
              )
            }
          />
        </Section>
      ))}

      <Section title="Access">
        <Field label="Visibility" description={VISIBILITY_DESCRIPTION[visibility]}>
          <SelectField
            value={visibility}
            options={visibilityOptions}
            icon={
              visibility === 'private' ? <EyeOffIcon opacity={0.63} /> : <EyeIcon opacity={0.63} />
            }
            onChange={(next) => setSetting('visibility', next)}
          />
        </Field>
        <Field label="Password">
          <PasswordControl
            enabled={settings.usePassword ?? false}
            password={settings.password ?? ''}
            onEnabledChange={(usePassword) => setSetting('usePassword', usePassword)}
            onPasswordChange={(password) => setSetting('password', password)}
          />
        </Field>
      </Section>

      <Section title="Content">
        <div className="flex flex-col gap-2">
          <StatRow label="Photos" value={files.images} />
          <StatRow label="Videos" value={files.videos} />
          <StatRow label="Size" value={formatBytes(files.bytes)} />
          {meta.createdAt && <StatRow label="Created at" value={formatUsDate(meta.createdAt)} />}
          {meta.updatedAt && <StatRow label="Updated at" value={formatUsDate(meta.updatedAt)} />}
        </div>
      </Section>

      <Section title="Actions">
        <Field description="The project will still be accessible from the archive section but will be hidden from everywhere else, including statistics.">
          <Button variant="secondary" size="md" icon={<Archive className="size-4" />}>
            Archive this project
          </Button>
        </Field>
        {onDelete && (
          <Field description="The project will be permanently deleted, including all its files, folders and settings. This action is irreversible and cannot be undone.">
            <Button
              variant="danger"
              size="md"
              icon={<Trash2 className="size-4" />}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete this project
            </Button>
            <DeleteProjectDialog
              title={meta.title}
              open={confirmingDelete}
              onOpenChange={setConfirmingDelete}
              onDelete={onDelete}
            />
          </Field>
        )}
      </Section>
    </div>
  )
}

/** Shows the formatted date; clicking opens the native date picker anchored under it. */
function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <FieldButton
        icon={<CalendarDays className="size-4" opacity={0.63} />}
        onClick={() => inputRef.current?.showPicker()}
      >
        {formatShortDate(value)}
      </FieldButton>
      <input
        ref={inputRef}
        type="date"
        value={value.slice(0, 10)}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => event.target.value && onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
    </div>
  )
}

function PasswordControl({
  enabled,
  password,
  onEnabledChange,
  onPasswordChange,
}: {
  enabled: boolean
  password: string
  onEnabledChange: (enabled: boolean) => void
  onPasswordChange: (password: string) => void
}) {
  const [visible, setVisible] = useState(false)

  return (
    <FieldGroup.Root>
      <SwitchField
        label="Use password"
        checked={enabled}
        onChange={(next) => {
          onEnabledChange(next)
          if (next && !password) onPasswordChange(randomPassword())
        }}
      />
      {enabled && (
        <>
          <FieldGroup.Separator />
          <TextField
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={onPasswordChange}
            icon={<UserLock className="size-4" opacity={0.63} />}
            end={
              <>
                <IconButton
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((v) => !v)}
                >
                  {visible ? <EyeIcon /> : <EyeOffIcon />}
                </IconButton>
                <IconButton
                  aria-label="Generate new password"
                  onClick={() => onPasswordChange(randomPassword())}
                >
                  <RefreshCw className="size-4" />
                </IconButton>
              </>
            }
          />
        </>
      )}
    </FieldGroup.Root>
  )
}
