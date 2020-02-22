import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import Settings from '../../../settings';
import '../dropdown-filter/dropdown-filter';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';


/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class NarrowLocationTypeFilter extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <dropdown-filter
        label="[[localize('narrow_location_type')]]"
        name="narrow_loc_type"
        value="[[fieldValue]]"
        data="[[data]]"
        disabled="[[disabled]]">
    </dropdown-filter>
  `;
  }


  @property({type: Number})
  maxLocType = Settings.cluster.maxLocType;

  @property({type: Array, computed: '_computeData(params, maxLocType)'})
  data!: any;

  @property({type: Boolean, computed: '_computeDisabled(data)'})
  disabled!: boolean;

  @property({type: String, computed: '_computeFieldValue(value, data, params.loc_type, maxLocType)'})
  fieldValue!: string;

  @property({type: String})
  value = '';

  _computeData(params: any, maxLocType: number) {
    var validData = Array.apply(null, Array(maxLocType + 1))
      .map(function(_, index) {
        return {
          id: String(index),
          title: 'Admin' + index,
        };
      })
      .slice(Number(params.loc_type) + 1);

    return [
      {
        id: '',
        title: 'None',
      },
    ].concat(validData);
  }

  _computeDisabled(data: any) {
    return data && data.length === 1;
  }

  _computeFieldValue(value: string, data: any, locType: string, maxLocType: number) {
    switch (true) {
      case !value:
      case data.length === 1:
        return data[0].id;

      default:
        return Math.min(Math.max(Number(value), Number(locType) + 1), maxLocType);
    }
  }

}

window.customElements.define('narrow-location-type-filter', NarrowLocationTypeFilter);
