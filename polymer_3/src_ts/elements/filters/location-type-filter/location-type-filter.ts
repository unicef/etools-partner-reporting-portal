import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import Settings from '../../../settings';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class LocationTypeFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      label="[[localize('location_type')]]"
      name="loc_type"
      value="[[value]]"
      data="[[data]]">
    </dropdown-filter>
  `;
  }


  @property({type: Number})
  maxLocType = Settings.cluster.maxLocType;

  @property({type: Array, computed: '_computeData(maxLocType)'})
  data!: any;

  @property({type: String})
  value = '';

  _computeData(maxLocType: number) {
    return Array.apply(null, Array(maxLocType + 1))
      .map(function(_, index) {
        return {
          id: String(index),
          title: 'Admin' + index,
        };
      });
  };
}

window.customElements.define('location-type-filter', LocationTypeFilter);
