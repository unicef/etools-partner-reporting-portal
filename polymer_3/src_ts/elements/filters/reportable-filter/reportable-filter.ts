import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import '../../../redux/selectors/llos';


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
        data="[[options]]">
    </searchable-dropdown-filter>
  `;
  }


  @property({type: Array, computed: '_computeOptions(data)'})
  options!: any;

  @property({type: String})
  value!: string;

  @property({type: Array, computed: 'getReduxStateArray(state.App.Selectors.LLOs.all)'})
  data = [];

  _computeOptions(data: any) {
    var other = data.map(function(item: any) {
      return {
        id: String(item.id),
        title: item.title,
      };
    });

    return [{
      id: '',
      title: 'All',
    }].concat(other);
  };
}

window.customElements.define('reportable-filter', ReportableFilters);
