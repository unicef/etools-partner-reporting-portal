import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';
import {store} from '../redux/store';

@customElement('reporting-period')
export class ReportingPeriod extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: inline-block;
      padding: 1px 3px;
      border: 1px solid var(--sl-color-neutral-500);
      font-size: 10px;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--sl-color-neutral-500);
    }

    .range {
      color: var(--theme-primary-text-color-dark);
    }
  `;

  @property({type: String})
  range = '';

  render() {
    return html` ${translate('REPORTING_PERIOD')}: <span class="range">${valueWithDefault(this.range)}</span> `;
  }
}
