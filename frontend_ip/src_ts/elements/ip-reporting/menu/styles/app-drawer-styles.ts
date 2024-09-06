import {css} from 'lit';

// language=HTML
export const appDrawerStyles = css`
  /** app-drawer-layout and app-drawer are using the same width variable, we need to apply it only at parent level*/
  app-drawer-layout:not([small-menu]) {
    --app-drawer-width: 240px;
  }

  app-drawer-layout[small-menu] {
    --app-drawer-width: 73px;
  }

  /** This extra definition is required for IE*/
  app-drawer:not([small-menu]) {
    --app-drawer-width: 240px;
  }

  app-drawer[small-menu] {
    --app-drawer-width: 73px;
  }

  app-drawer {
    z-index: 100;
  }
`;
