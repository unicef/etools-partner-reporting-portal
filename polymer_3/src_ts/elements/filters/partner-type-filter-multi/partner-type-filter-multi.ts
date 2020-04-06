import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../dropdown-filter/dropdown-filter-multi';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PartnerTypeFilterMulti extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter-multi
        label="[[localize('partner_type')]]"
        name="partner_types"
        value="[[value]]"
        data="[[data]]"
        hide-search>
    </dropdown-filter-multi>
  `;
  }
  @property({type: String})
  value!: string;

  @property({type: Array})
  data = [
    {
      id: 'B/M',
      title: 'Bilateral / Multilateral',
    },
    {
      id: 'CSO',
      title: 'Civil Society Organization',
    },
    {
      id: 'Gov',
      title: 'Government',
    },
    {
      id: 'UNA',
      title: 'UN Agency',
    },
  ];
}

window.customElements.define('partner-type-filter-multi', PartnerTypeFilterMulti);
