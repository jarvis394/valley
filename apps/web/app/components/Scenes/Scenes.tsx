import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useSearchParams,
} from '@remix-run/react'

export const sceneSearchKey = 'sc'

type SceneType = string | number
export type ScenesProps<T extends SceneType = SceneType> =
  React.PropsWithChildren<{
    scene: T
  }>
export type SceneProps<T extends SceneType = SceneType> =
  React.PropsWithChildren<{
    id: T
  }>

/**
 * Wraps Scene components to create animated layout
 * (ex. to show sub forms in login layout on button click)
 *
 * @example
 * ```tsx
 * type SceneType = 'language-select' | 'onboarding' | 'contacts'
 * const [currentScene, setCurrentScene] = useState<SceneType>(
 *   'onboarding'
 * )
 *
 * return (
 *   <Scenes scene={currentScene}>
 *     <Scenes.Scene id="language-select">...</Scenes.Scene>
 *     <Scenes.Scene id="onboarding">...</Scenes.Scene>
 *     <Scenes.Scene id="contacts">...</Scenes.Scene>
 *   </Scenes>
 * )
 * ```
 */
const Scenes = <T extends string | number>({
  scene,
  children,
}: ScenesProps<T>): React.ReactNode => {
  const [_, setSearchParams] = useSearchParams()

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set(sceneSearchKey, scene.toString())
      return prev
    })
  }, [scene, setSearchParams])

  return <AnimatePresence>{children}</AnimatePresence>
}

const Scene = ({ id, children }: SceneProps): React.ReactNode => {
  const [searchParams] = useSearchParams()
  const activeScene = searchParams.get(sceneSearchKey)

  if (activeScene === id) {
    return <motion.div>{children}</motion.div>
  } else {
    return null
  }
}

Scenes.Scene = Scene

export default Scenes
