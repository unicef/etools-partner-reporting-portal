import {customElement, html, LitElement, property} from 'lit-element';

// These are the shared styles needed by this element.
import {ROOT_PATH} from '../../config/config';
import {elevationStyles} from '../styles/lit-styles/elevation-styles';
import {pageLayoutStyles} from '../styles/page-layout-styles';
import {SharedStylesLit} from '../styles/shared-styles-lit';

/**
 * @customElement
 * @LitElement
 */
@customElement('page-not-found')
export class PageNotFound extends LitElement {
  static get styles() {
    return [elevationStyles, pageLayoutStyles];
  }

  render() {
    return html`
      ${SharedStylesLit}
      <section class="page-content elevation" elevation="1">
        <h2>Oops! You hit a 404</h2>
        <p>
          The page you're looking for doesn't seem to exist. Head back <a href="${this.rootPath}">home</a> and try
          again?
        </p>
      </section>
    `;
  }

  @property({type: String})
  rootPath: string = ROOT_PATH;
}
