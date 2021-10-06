import { html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
export const pageNavStyles = html ` <style>
  :host {
    @apply --layout-vertical;
    height: 100%;
    overflow-y: auto;
  }

  a {
    @apply --layout;
    @apply --layout-vertical;
    @apply --layout-center-justified;

    color: inherit;
    text-decoration: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 0 16px;
    font-size: 14px;
  }

  iron-icon {
    margin-right: 10px;
  }

  paper-item:not(.iron-selected) iron-icon {
    color: var(--paper-grey-600);
  }

  paper-submenu paper-menu a {
    font-size: 12px;
  }

  .menu-content {
    padding-left: 34px;
  }

  .menu-content paper-item {
    padding-top: 0px;
    padding-bottom: 0px;
    min-height: 32px;
  }

  .menu-content paper-item a {
    font-size: 12px;
  }

  .menu-trigger {
    --paper-item-selected: {
      color: inherit;
      background: var(--theme-selected-item-background-color);
    }
  }

  .menu-trigger-opened {
    background: var(--theme-selected-item-background-color);
  }

  .menu-content {
    padding-top: 0;
    background: var(--theme-selected-item-background-color);
  }

  .nav-menu {
    @apply --layout-vertical;
    background: var(--primary-background-color);
    min-height: 400px;
    padding: 8px 0 0;
  }

  .nav-menu,
  .nav-menu iron-selector[role='navigation'] {
    @apply --layout-flex;
  }

  .nav-menu-item {
    min-height: 48px;
    padding: 0px 16px;
  }

  .nav-menu-item.section-title {
    width: 100%;
    height: 60px;
    margin-bottom: 60px;
    padding: 0px 0px 20px 0px;
  }

  .iron-selected {
    color: var(--theme-primary-color);
    background: var(--theme-selected-item-background-color);
  }

  .iron-selected .name,
  .iron-selected iron-icon {
    color: var(--theme-primary-color);
  }
</style>`;
