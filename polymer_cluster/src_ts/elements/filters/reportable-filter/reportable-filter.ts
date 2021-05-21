import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {llosAll} from '../../../redux/selectors/llos';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {RootState} from '../../../etools-prp-common/typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ReportableFilters extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <searchable-dropdown-filter
        class="item"
        label="[[localize('pd_output')]]"
        name="llo"
        value="[[value]]"
        data="[[options]]"
      >
      </searchable-dropdown-filter>
    `;
  }

  @property({type: Array, computed: '_computeOptions(data)'})
  options!: any;

  @property({type: String})
  value!: string;

  @property({type: Array, computed: '_llosAll(rootState)'})
  data = [];

  _llosAll(rootState: RootState) {
    return llosAll(rootState);
  }

  _computeOptions(data: any) {
    const other = data.map((item: any) => {
      return {
        id: String(item.id),
        title: item.title
      };
    });

    return [
      {
        id: '',
        title: 'All'
      }
    ].concat(other);
  }
}

window.customElements.define('reportable-filter', ReportableFilters);
