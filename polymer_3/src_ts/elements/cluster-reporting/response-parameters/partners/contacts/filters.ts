import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import {filterStyles} from '../../../../../styles/filter-styles';
import '../../../../filter-list';
import '../../../../filters/cluster-partner-filter/cluster-partner-filter';
import { GenericObject } from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Filters extends UtilsMixin(PolymerElement) {
  public static get template(){
    return html`
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

        --app-grid-item-height: auto;
      }

    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <filter-list filters="{{filters}}">
      <div class="app-grid">
        <cluster-partner-filter
            class="item"
            value="[[_withDefault(queryParams.partner, '')]]">
        </cluster-partner-filter>
      </div>
    </filter-list>
    `;
  }

  @property({type: Object, notify: true})
  properties!: GenericObject;

  @property({type: Array})
  locations = [
    {
      title: 'All', 
      id: ''
    }
  ];
}

window.customElements.define('partner-activities-filters', Filters);

export {Filters as ContactFiltersEl};
