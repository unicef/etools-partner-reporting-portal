import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../etools-prp-common/elements/etools-prp-progress-bar';

/**
 * @customElement
 */
@customElement('etools-prp-progress-bar-cluster')
export class EtoolsPrpProgressBarCluster extends LitElement {
  @property({type: String})
  displayType!: string;

  @property({type: Number})
  number!: number;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    etools-prp-progress-bar {
      --etools-indicator-color: #88c245;
    }
  `;

  render() {
    return html`
      <etools-prp-progress-bar .displayType="${this.displayType}" .number="${this.number}"></etools-prp-progress-bar>
    `;
  }
}

export {EtoolsPrpProgressBarCluster as EtoolsPrpProgressBarClusterEl};
