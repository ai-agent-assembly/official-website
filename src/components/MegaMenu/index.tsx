import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {MENUS, type MegaMenuKey} from './menus';
import styles from './styles.module.css';

interface Props {
  menuKey: MegaMenuKey;
  label: string;
  mobile?: boolean;
  cta?: boolean;
  align?: 'left' | 'right';
}

function MobileMenu({menuKey, label}: Props): ReactNode {
  const {columns} = MENUS[menuKey];
  return (
    <li className="menu__list-item">
      <span className={styles.mobileLabel}>{label}</span>
      {columns.map((col) => (
        <div key={col.title} className={styles.mobileGroup}>
          <span className={styles.mobileGroupTitle}>{col.title}</span>
          <ul className="menu__list">
            {col.links.map((l) => (
              <li key={l.label} className="menu__list-item">
                <Link className="menu__link" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </li>
  );
}

export default function MegaMenu(props: Props): ReactNode {
  const {menuKey, label, mobile, cta, align = 'left'} = props;

  if (mobile) {
    return <MobileMenu {...props} />;
  }

  const {columns} = MENUS[menuKey];
  const triggerClass = cta
    ? `${styles.trigger} ${styles.ctaTrigger}`
    : styles.trigger;
  const panelClass =
    align === 'right' ? `${styles.panel} ${styles.panelRight}` : styles.panel;

  return (
    <div className={styles.megaMenu}>
      <button type="button" className={triggerClass} aria-haspopup="true">
        {label}
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>
      <div className={panelClass} role="menu">
        <div className={styles.columns}>
          {columns.map((col) => (
            <div key={col.title} className={styles.column}>
              <div className={styles.columnTitle}>{col.title}</div>
              <ul className={styles.linkList}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link className={styles.link} href={l.href} role="menuitem">
                      <span className={styles.linkLabel}>{l.label}</span>
                      {l.desc ? (
                        <span className={styles.linkDesc}>{l.desc}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
