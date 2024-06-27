import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../etools-prp-common/elements/etools-prp-progress-bar';

/**
 * @customElement
 */
@customElement('etools-prp-progress-bar-alt')
export class EtoolsPrpProgressBarAlt extends LitElement {
  @property({type: String})
  displayType!: string;

  @property({type: Number})
  number!: number;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      --paper-progress-active-color: var(--paper-orange-a400);
    }
    etools-prp-progress-bar {
      --etools-prp-progress-bar: {
        /* Add specific styles if needed */
      }
    }
  `;

  render() {
    return html`
      <etools-prp-progress-bar .displayType="${this.displayType}" .number="${this.number}"></etools-prp-progress-bar>
    `;
  }
}

export {EtoolsPrpProgressBarAlt as EtoolsPrpProgressBarAltEl};
