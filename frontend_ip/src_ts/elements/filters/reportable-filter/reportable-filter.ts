import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import '../dropdown-filter/searchable-dropdown-filter';
import {llosAll} from '../../../redux/selectors/llos';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {RootState} from '../../../typings/redux.types';

@customElement('reportable-filter')
export class ReportableFilters extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Array})
  options: any[] = [];

  @property({type: String})
  value = '';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <searchable-dropdown-filter
        class="item"
        .label="${translate('PD_OUTPUT')}"
        name="llo"
        .value="${this.value}"
        .data="${this.options}"
      >
      </searchable-dropdown-filter>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('data')) {
      this.options = this._computeOptions();
    }
  }

  stateChanged(state: RootState) {
    this.data = llosAll(state);
  }

  _computeOptions() {
    const other = this.data?.map((item: any) => {
      return {
        id: String(item.id),
        title: item.title
      };
    });

    return [
      {
        id: '-1',
        title: 'All'
      }
    ].concat(other);
  }
}

export {ReportableFilters as ReportableFiltersEl};
