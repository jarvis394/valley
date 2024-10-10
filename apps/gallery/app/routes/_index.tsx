import type { MetaFunction } from '@remix-run/node'
import styles from './App.module.css'

export const meta: MetaFunction = () => {
  return [
    { title: 'Gallery' },
    { name: 'description', content: 'Gallery for a Valley project' },
  ]
}

export default function Index() {
  return <div className={styles.App}>test</div>
}
