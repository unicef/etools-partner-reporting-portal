import {css} from 'lit-element';
import {appDrawerStyles} from './menu/styles/app-drawer-styles';

export const AppShellStyles = css`
  ${appDrawerStyles}
  :host {
    display: block;
  }

  app-header-layout {
    position: relative;
  }

  .main-content {
    flex: 1;
  }

  .page {
    display: none;
  }

  .page[active] {
    display: block;
  }
`;
