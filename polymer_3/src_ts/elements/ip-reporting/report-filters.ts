import {html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import UtilsMixin from "../../mixins/utils-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";
import {filterStyles} from "../../styles/filter-styles";
import '../../elements/filter-list';
import {ReduxConnectedElement} from "../../ReduxConnectedElement";
import {GenericObject} from "../../typings/globals.types";
import '../../elements/filters/reportable-filter/reportable-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/report-location-filter/report-location-filter';


/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class ReportFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 4;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 4;
        }

        .incomplete {
          @apply --app-grid-expandible-item;
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
          <reportable-filter
              class="item"
              value="[[_withDefault(queryParams.llo, '')]]">
          </reportable-filter>

          <report-location-filter
              class="item"
              value="[[_withDefault(queryParams.location, '')]]">
          </report-location-filter>

          <checkbox-filter
              class="incomplete"
              name="incomplete"
              value="[[_withDefault(queryParams.incomplete, '')]]">
            <span class="checkbox-label">[[localize('show_incomplete_only')]]</span>
          </checkbox-filter>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object})
  filters!: GenericObject;

}

window.customElements.define('report-filters', ReportFilters);
