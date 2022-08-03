import {css} from 'lit-element';

// language=CSS
export const pageHeaderStyles = css`
  app-toolbar {
    padding: 0 16px 0 0;
    height: 60px;
  }

  .titlebar {
    color: var(--header-color);
  }

  #menuButton {
    display: block;
    color: var(--header-color);
  }

  etools-profile-dropdown {
    margin-left: 16px;
  }

  .titlebar {
    flex: 1;
    font-size: 28px;
    font-weight: 300;
  }

  .titlebar img {
    width: 34px;
    margin: 0 8px 0 24px;
  }

  .content-align {
    display: flex;
    align-items: center;
  }

  #app-logo {
    height: 32px;
    width: auto;
  }

  .envWarning {
    color: var(--nonprod-text-warn-color);
    font-weight: 700;
    font-size: 18px;
  }

  @media (min-width: 850px) {
    #menuButton {
      display: none;
    }
  }

  @media (max-width: 768px) {
    #envWarning {
      display: none;
    }
    .envLong {
      display: none;
    }
    .titlebar img {
      margin: 0 8px 0 12px;
    }
    etools-profile-dropdown {
      margin-left: 12px;
      width: 40px;
    }
  }

  @media (max-width: 576px) {
    etools-app-selector {
      --app-selector-button-padding: 18px 8px;
    }
    #app-logo {
      display: none;
    }
    .titlebar img {
      margin: 0 8px 0 4px;
    }
    .envWarning {
      font-size: 10px;
      line-height: 12px;
      white-space: nowrap;
      margin-left: 2px;
    }
    app-toolbar {
      padding-right: 0px;
    }
  }
`;
