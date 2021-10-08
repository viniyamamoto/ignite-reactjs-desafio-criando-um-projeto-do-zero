import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.content}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
