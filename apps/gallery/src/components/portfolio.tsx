import { formatLongDate } from '@valley/canvas'
import type { Home } from '../data/gallery'

type Portfolio = Extract<Home, { kind: 'portfolio' }>['portfolio']

export function Portfolio({ owner, projects }: Portfolio) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-300 flex-col gap-10 px-4 py-12 sm:px-8 sm:py-20">
      <header className="flex items-center gap-4">
        {owner.avatar && (
          <img src={owner.avatar} alt="" className="size-14 rounded-full object-cover" />
        )}
        <div className="flex flex-col">
          <h1 className="text-display font-medium">{owner.name}</h1>
          <p className="text-body text-white/50">
            {projects.length === 1 ? '1 gallery' : `${projects.length} galleries`}
          </p>
        </div>
      </header>

      {projects.length > 0 ? (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <GalleryCard {...project} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-white/50">Nothing published yet.</p>
      )}
    </main>
  )
}

function GalleryCard({ slug, title, shotOn, cover, assetCount }: Portfolio['projects'][number]) {
  return (
    <a href={`/${slug}`} className="group flex flex-col gap-3 outline-none">
      <div className="aspect-4/3 overflow-hidden rounded-2xl bg-white/5 ring-accent/60 group-focus-visible:ring-2">
        {cover && (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-title font-medium">{title}</h2>
        <p className="text-small text-white/50">
          {formatLongDate(shotOn)} · {assetCount === 1 ? '1 file' : `${assetCount} files`}
        </p>
      </div>
    </a>
  )
}
