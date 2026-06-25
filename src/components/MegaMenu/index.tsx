import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {MENUS, type MegaMenuKey, type MegaMenuLink} from './menus';
import styles from './styles.module.css';

function Icon({
  icon,
  className,
}: {
  icon?: string;
  className: string;
}): ReactNode {
  const src = useBaseUrl(`/img/lang/${icon ?? ''}`);
  if (!icon) {
    return null;
  }
  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
    />
  );
}

function RowInner({link}: {link: MegaMenuLink}): ReactNode {
  return (
    <>
      <Icon icon={link.icon} className={styles.icon} />
      <span className={styles.linkText}>
        <span className={styles.linkLabel}>
          {link.label}
          {link.comingSoon ? (
            <span className={styles.soon}>👷 Coming soon</span>
          ) : null}
        </span>
        {link.desc ? (
          <span className={styles.linkDesc}>{link.desc}</span>
        ) : null}
      </span>
    </>
  );
}

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
                {l.comingSoon ? (
                  <span
                    className={`menu__link ${styles.mobileDisabled}`}
                    aria-disabled="true"
                  >
                    <Icon icon={l.icon} className={styles.mobileIcon} />
                    {l.label}
                    <span className={styles.soon}>👷 Coming soon</span>
                  </span>
                ) : (
                  <Link className="menu__link" href={l.href}>
                    <Icon icon={l.icon} className={styles.mobileIcon} />
                    {l.label}
                  </Link>
                )}
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
                    {l.comingSoon ? (
                      <div
                        className={`${styles.link} ${styles.linkDisabled}`}
                        aria-disabled="true"
                      >
                        <RowInner link={l} />
                      </div>
                    ) : (
                      <Link
                        className={styles.link}
                        href={l.href}
                        role="menuitem"
                      >
                        <RowInner link={l} />
                      </Link>
                    )}
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
