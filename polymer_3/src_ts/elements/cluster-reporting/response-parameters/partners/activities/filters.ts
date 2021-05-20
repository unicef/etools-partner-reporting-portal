import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import {filterStyles} from '../../../../../styles/filter-styles';
import '../../../../../etools-prp-common/elements/filter-list';
import '../../../../filters/text-filter/text-filter';
import '../../../../filters/dropdown-filter/dropdown-filter';
import '../../../../filters/checkbox-filter/checkbox-filter';
import '../../../../filters/date-filter/date-filter';
import '../../../../filters/status-filter/project-status-filter';
import '../../../../filters/cluster-location-filter/cluster-location-filter';
import '../../../../filters/cluster-partner-filter/cluster-partner-filter';
import '../../../../filters/cluster-project-filter/cluster-project-filter';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PartnerContactsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${filterStyles}
      <style include="app-grid-styl">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 3;
          --app-grid-item-height: auto;
        }
        .checkbox {
          padding-top: 30px;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <cluster-partner-filter class="item" value="[[_withDefault(queryParams.partner, '')]]">
          </cluster-partner-filter>

          <cluster-project-filter class="item" value="[[_withDefault(queryParams.project, '')]]">
          </cluster-project-filter>

          <project-status-filter value="[[_withDefault(queryParams.status, '')]]"> </project-status-filter>

          <cluster-location-filter class="item filter-2-col" value="[[_withDefault(queryParams.location, '')]]">
          </cluster-location-filter>

          <text-filter
            class="item filter-2-col"
            label="[[localize('search_activity_title')]]"
            name="activity"
            value="[[_withDefault(queryParams.activity, '')]]"
          >
          </text-filter>

          <checkbox-filter class="item checkbox" name="custom" value="[[_withDefault(queryParams.custom, '')]]">
            <span class="checkbox-label">[[localize('show_only_custom_activities')]]</span>
          </checkbox-filter>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object, notify: true})
  filters!: GenericObject;

  @property({type: Array})
  locations = [
    {
      title: 'All',
      id: ''
    }
  ];
}

window.customElements.define('partner-contacts-filters', PartnerContactsFilters);

export {PartnerContactsFilters as PartnerContactsFiltersEl};
