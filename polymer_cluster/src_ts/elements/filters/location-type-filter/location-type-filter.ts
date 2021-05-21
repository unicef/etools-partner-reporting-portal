import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import Settings from '../../../etools-prp-common/settings';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';

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

      <dropdown-filter label="[[localize('location_type')]]" name="loc_type" value="[[value]]" data="[[data]]">
      </dropdown-filter>
    `;
  }

  @property({type: Number})
  maxLocType = Settings.cluster.maxLocType;

  @property({type: Array, computed: '_computeData(maxLocType)'})
  data!: any;

  @property({type: String})
  value!: string;

  _computeData(maxLocType: number) {
    return Array(maxLocType + 1)
      .fill(0)
      .map((_, index) => {
        return {id: String(index), title: 'Admin' + index};
      });
  }
}

window.customElements.define('location-type-filter', LocationTypeFilter);
