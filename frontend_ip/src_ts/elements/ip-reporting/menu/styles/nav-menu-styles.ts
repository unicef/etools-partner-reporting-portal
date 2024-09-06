import {css} from 'lit';

// language=CSS
export const navMenuStyles = css`
  *[hidden] {
    display: none !important;
  }
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: var(--side-bar-scrolling);
    overflow-x: hidden;
    border-right: 1px solid var(--light-divider-color);
  }

  :host([small-menu]) {
    overflow-x: visible;
  }

  @media (max-height: 600px) {
    :host([small-menu]) {
      overflow-x: hidden;
    }
  }

  .menu-header,
  :host([small-menu]) .menu-header .ripple-wrapper.main,
  .nav-menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .menu-header {
    justify-content: space-between;
    background-color: var(--primary-color);
    color: white;
    min-height: 60px;
    padding: 0 16px;
    font-size: var(--etools-font-size-14, 14px);
    line-height: 18px;
    text-transform: uppercase;
  }

  :host([small-menu]) .menu-header {
    padding: 0;
  }
  :host([small-menu]) .menu-header .ripple-wrapper.main {
    width: 60px;
    height: 60px;
  }

  :host([small-menu]) .menu-header,
  .nav-menu-item.section-title,
  :host([small-menu]) .nav-menu-item,
  :host([small-menu]) .menu-header .ripple-wrapper.main {
    justify-content: center;
  }

  :host([small-menu]) #app-name,
  :host #menu-header-top-icon,
  :host([small-menu]) .nav-menu-item .name,
  :host(:not([small-menu])) #expand-menu,
  :host([small-menu]) .section-title span,
  :host([small-menu]) #minimize-menu,
  :host([small-menu]) .menu-header .ripple-wrapper:not(.main) {
    display: none;
  }
  :host([small-menu]) #menu-header-top-icon,
  :host([small-menu]) #expand-menu,
  :host(:not([small-menu])) #minimize-menu {
    display: block;
  }

  .menu-header etools-icon-button {
    --etools-icon-font-size: var(--etools-font-size-24, 24px);
    padding: 0;
  }

  #menu-header-top-icon,
  #minimize-menu,
  #expand-menu {
    cursor: pointer;
  }

  .chev-right {
    position: relative;
  }

  #menu-header-top-icon {
    --etools-icon-font-size: var(--etools-font-size-36, 36px);
  }

  .divider {
    margin: 8px 0;
    border-bottom: 1px solid var(--light-divider-color);
  }
  .nav-menu {
    display: flex;
    flex-direction: column;
    background: var(--primary-background-color);
    padding: 8px 0 0;
  }
  .nav-menu,
  .nav-menu .menu-selector[role='navigation'] {
    flex: 1;
  }

  .nav-menu-item {
    width: 100%;
    font-size: var(--etools-font-size-14, 14px);
    font-weight: 500;
    position: relative;
    height: 48px;
    cursor: pointer;
    text-decoration: none;
    text-transform: capitalize;
  }

  .nav-menu-item.section-title {
    color: var(--primary-text-color);
    font-size: var(--etools-font-size-13, 13px);
    font-weight: 500;
    text-transform: none;
    border-top: 1px solid var(--light-divider-color);
  }

  :host([small-menu]) .nav-menu-item.section-title {
    height: 0;
  }

  .nav-menu-item.selected {
    background-color: var(--secondary-background-color);
  }

  .nav-menu-item.selected:active {
    background-color: var(--light-divider-color);
  }

  .nav-menu-item .name {
    margin-left: 16px;
    color: var(--primary-text-color);
  }

  .nav-menu-item etools-icon {
    margin: 0 16px;
    color: var(--dark-icon-color);
    --etools-icon-font-size: var(--etools-font-size-24, 24px);
  }

  :host([small-menu]) .nav-menu-item etools-icon {
    margin: 0;
  }

  .nav-menu-item.selected .name,
  .nav-menu-item.selected etools-icon {
    color: var(--primary-color);
  }

  .nav-menu-item.lighter-item .name,
  .nav-menu-item.lighter-item etools-icon {
    color: var(--secondary-text-color);
  }

  .last-one {
    margin-bottom: 18px;
  }
  .ripple-wrapper {
    position: relative;
  }

  hr {
    color: #212121;
    opacity: 0.2;
  }
`;
