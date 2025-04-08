import React, { useEffect, useRef } from 'react'
import SelectButton from './SelectButton'
import { Form, useFetchers } from 'react-router'
import { capitalizeFirstLetter, enumEntries, enumValues } from 'app/utils/misc'
import {
  ProjectCoverVariant,
  ProjectGalleryOrientation,
  ProjectGallerySpacing,
  ProjectGalleryTheme,
  ProjectHeadingFont,
} from '@valley/db/config/constants'
import SelectField from '@valley/ui/SelectField'
import Select from '@valley/ui/Select'
import FocalPointSelector from './FocalPointSelector'
import IconButton from '@valley/ui/IconButton'
import { DesktopDevice, Image, Trash } from 'geist-ui-icons'
import Button from '@valley/ui/Button'
import { useProjectsStore } from 'app/stores/projects'
import { useProject } from 'app/utils/project'
import {
  CoverVariantCenter,
  CoverVariantSplit,
  CoverVariantLeft,
  CoverVariantAlbum,
  CoverVariantClassic,
  CoverVariantLine,
  CoverVariantTop,
  CoverVariantInvert,
} from 'app/components/svg/CoverVariants'
import {
  GalleryOrientationHorizontal,
  GalleryOrientationVertical,
} from 'app/components/svg/GalleryOrientation'
import {
  GallerySpacingSmall,
  GallerySpacingMedium,
  GallerySpacingLarge,
} from 'app/components/svg/GallerySpacing'

const COVER_VARIANTS_ICONS_MAP: Record<ProjectCoverVariant, React.ReactNode> = {
  [ProjectCoverVariant.CENTER]: (
    <CoverVariantCenter className="svg-own-color" />
  ),
  [ProjectCoverVariant.SPLIT]: <CoverVariantSplit className="svg-own-color" />,
  [ProjectCoverVariant.LEFT]: <CoverVariantLeft className="svg-own-color" />,
  [ProjectCoverVariant.ALBUM]: <CoverVariantAlbum className="svg-own-color" />,
  [ProjectCoverVariant.CLASSIC]: (
    <CoverVariantClassic className="svg-own-color" />
  ),
  [ProjectCoverVariant.LINE]: <CoverVariantLine className="svg-own-color" />,
  [ProjectCoverVariant.TOP]: <CoverVariantTop className="svg-own-color" />,
  [ProjectCoverVariant.INVERT]: (
    <CoverVariantInvert className="svg-own-color" />
  ),
}

const GALLERY_ORIENTATIONS_ICONS_MAP: Record<
  ProjectGalleryOrientation,
  React.ReactNode
> = {
  [ProjectGalleryOrientation.HORIZONTAL]: (
    <GalleryOrientationHorizontal className="svg-own-color" />
  ),
  [ProjectGalleryOrientation.VERTICAL]: (
    <GalleryOrientationVertical className="svg-own-color" />
  ),
}

const GALLERY_SPACINGS_ICONS_MAP: Record<
  ProjectGallerySpacing,
  React.ReactNode
> = {
  [ProjectGallerySpacing.SMALL]: (
    <GallerySpacingSmall className="svg-own-color" />
  ),
  [ProjectGallerySpacing.MEDIUM]: (
    <GallerySpacingMedium className="svg-own-color" />
  ),
  [ProjectGallerySpacing.LARGE]: (
    <GallerySpacingLarge className="svg-own-color" />
  ),
}

const GALLERY_THEMES_ICONS_MAP: Record<ProjectGalleryTheme, React.ReactNode> = {
  [ProjectGalleryTheme.DARK]: (
    <div className="border-alpha-transparent-12 size-4 rounded-full border-1 bg-black" />
  ),
  [ProjectGalleryTheme.LIGHT]: (
    <div className="size-4 rounded-full border-1 border-black/12 bg-white" />
  ),
  [ProjectGalleryTheme.SYSTEM]: <DesktopDevice className="text-secondary" />,
}

const ProjectDesignSettings: React.FC = () => {
  const project = useProject()
  const cover = project.cover
  const hasCover = cover?.file && cover.file.canHaveThumbnails
  const setProjectFields = useProjectsStore((state) => state.setProjectFields)
  const fetchers = useFetchers()
  const deleteCoverFetcher = fetchers.find((e) => e.key === 'delete-cover')
  const isDeleteCoverPending = deleteCoverFetcher?.state === 'loading'
  const coverVariantContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!coverVariantContainer.current) return
    const selectedCoverVariantId =
      'project-cover-variant-' + project.coverVariant
    const selectedCoverVariantElement = document.getElementById(
      selectedCoverVariantId
    )

    if (selectedCoverVariantElement) {
      coverVariantContainer.current.scrollTo({
        left: selectedCoverVariantElement.offsetLeft - 95 / 2,
        behavior: 'smooth',
      })
    }
  }, [project.coverVariant])

  return (
    <div className="flex w-full flex-col gap-6 py-6 md:max-w-[320px]">
      <div className="flex flex-col gap-3 px-4">
        <h3 className={'text-sm font-semibold'}>Cover Image</h3>
        <div className="flex gap-3">
          <Button variant="primary" size="md" before={<Image />}>
            Upload image
          </Button>
          {hasCover && (
            <Form
              navigate={false}
              fetcherKey="delete-cover"
              method="post"
              preventScrollReset
            >
              <input name="intent" value="delete-cover" readOnly hidden />
              <IconButton
                loading={isDeleteCoverPending}
                disabled={isDeleteCoverPending}
                type="submit"
                variant="danger-dimmed"
                size="md"
              >
                <Trash />
              </IconButton>
            </Form>
          )}
        </div>
      </div>

      {hasCover && (
        <div className="flex flex-col gap-3 px-4">
          <h3 className={'text-sm font-semibold'}>Focal Point</h3>
          <FocalPointSelector cover={cover} file={cover.file} />
        </div>
      )}

      <Form
        method="post"
        preventScrollReset
        navigate={false}
        className="flex flex-col gap-3 px-4"
      >
        <input name="intent" value="heading-font" readOnly hidden />
        <h3 className={'text-sm font-semibold'}>Heading Font</h3>
        <SelectField
          id="heading-font-select"
          defaultValue={project.headingFont}
          fullWidth
          name="value"
          onChange={(e) => {
            e.target.form?.requestSubmit()
          }}
          formHelperTextProps={{ style: { paddingBottom: 0 } }}
        >
          {enumValues(ProjectHeadingFont).map((value, i) => (
            <Select.Item
              onClick={setProjectFields.bind(
                null,
                { headingFont: value },
                project.id
              )}
              key={'project-heading-font-' + i}
              value={value}
            >
              {value}
            </Select.Item>
          ))}
        </SelectField>
      </Form>

      <Form method="post" preventScrollReset className="flex flex-col gap-3">
        <input name="intent" value="cover-variant" readOnly hidden />
        <h3 className={'px-4 text-sm font-semibold'}>Cover Variant</h3>
        <div
          className="flex gap-2 overflow-x-auto px-4 pb-1"
          ref={coverVariantContainer}
        >
          {enumValues(ProjectCoverVariant).map((value) => (
            <SelectButton
              key={'project-cover-variant-' + value}
              selected={project.coverVariant === value}
              name="value"
              value={value}
              onClick={setProjectFields.bind(
                null,
                { coverVariant: value },
                project.id
              )}
              id={'project-cover-variant-' + value}
            >
              {COVER_VARIANTS_ICONS_MAP[value]}
            </SelectButton>
          ))}
        </div>
      </Form>

      <Form method="post" preventScrollReset className="flex flex-col gap-3">
        <input name="intent" value="gallery-orientation" readOnly hidden />
        <h3 className={'px-4 text-sm font-semibold'}>Gallery Orientation</h3>
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {enumEntries(ProjectGalleryOrientation).map(([label, value]) => (
            <SelectButton
              key={'project-gallery-orientation-' + value}
              id={'project-gallery-orientation-' + value}
              selected={project.galleryOrientation === value}
              label={capitalizeFirstLetter(label.toString().toLowerCase())}
              name="value"
              value={value}
              onClick={setProjectFields.bind(
                null,
                { galleryOrientation: value },
                project.id
              )}
            >
              {GALLERY_ORIENTATIONS_ICONS_MAP[value]}
            </SelectButton>
          ))}
        </div>
      </Form>

      <Form method="post" preventScrollReset className="flex flex-col gap-3">
        <input name="intent" value="gallery-spacing" readOnly hidden />
        <h3 className={'px-4 text-sm font-semibold'}>Gallery Spacing</h3>
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {enumEntries(ProjectGallerySpacing).map(([label, value]) => (
            <SelectButton
              key={'project-gallery-spacing-' + value}
              id={'project-gallery-spacing-' + value}
              selected={project.gallerySpacing === value}
              label={capitalizeFirstLetter(label.toString().toLowerCase())}
              name="value"
              value={value}
              onClick={setProjectFields.bind(
                null,
                { gallerySpacing: value },
                project.id
              )}
            >
              {GALLERY_SPACINGS_ICONS_MAP[value]}
            </SelectButton>
          ))}
        </div>
      </Form>

      <Form method="post" preventScrollReset className="flex flex-col gap-3">
        <input name="intent" value="gallery-theme" readOnly hidden />
        <h3 className={'px-4 text-sm font-semibold'}>Gallery Theme</h3>
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {enumEntries(ProjectGalleryTheme).map(([label, value]) => (
            <SelectButton
              key={'project-gallery-theme-' + value}
              id={'project-gallery-theme-' + value}
              selected={project.galleryTheme === value}
              label={capitalizeFirstLetter(label.toString().toLowerCase())}
              name="value"
              value={value}
              onClick={setProjectFields.bind(
                null,
                { galleryTheme: value },
                project.id
              )}
            >
              {GALLERY_THEMES_ICONS_MAP[value]}
            </SelectButton>
          ))}
        </div>
      </Form>
    </div>
  )
}

export default React.memo(ProjectDesignSettings)
