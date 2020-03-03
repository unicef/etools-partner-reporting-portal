import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../filter-list';
import '../../../../filters/partner-filter/partner-filter';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import {filterStyles} from '../../../../../styles/filter-styles';
import { GenericObject } from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ContributingPartnersFilters extends UtilsMixin(PolymerElement) {
  public static get template() {
    // language=HTML
    return html`
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

        --app-grid-columns: 1;
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
        <partner-filter
            value="[[_withDefault(queryParams.partner, '')]]">
        </partner-filter>
      </div>
    </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;
}

window.customElements.define('cluster-activities-contributing-partners-filters', ContributingPartnersFilters);

export {ContributingPartnersFilters as ContributingPartnersFiltersEl};
