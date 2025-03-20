import React from 'react'
import BannerBlock from '../BannerBlock'
import GalleryIcon from '../../svg/Gallery'
import styles from './CreateProjectButton.module.css'
import cx from 'classnames'
import { Link } from 'react-router'

const CreateProjectButton = () => {
  return (
    <BannerBlock
      button
      asChild
      style={{ gap: 2 }}
      className={styles.createProjectButton}
      variant="primary"
    >
      <Link preventScrollReset to={{ search: 'modal=create-project' }}>
        <h3>
          Create new
          <br />
          project
        </h3>
        <p>or just drop files here</p>
        <GalleryIcon
          className={cx(styles.createProjectButton__icon, 'svg-own-color')}
        />
      </Link>
    </BannerBlock>
  )
}

export default CreateProjectButton
