import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import {filterStyles} from '../../../../../styles/filter-styles';
import '../../../../filter-list';
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
class PartnerProjectsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 3;
          --app-grid-item-height: auto;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <cluster-partner-filter class="item" value="[[_withDefault(queryParams.partner, '')]]">
          </cluster-partner-filter>

          <text-filter class="item" label="[[localize('project')]]" name="title" value="[[queryParams.title]]">
          </text-filter>

          <project-status-filter value="[[_withDefault(queryParams.status, '')]]"> </project-status-filter>

          <cluster-location-filter class="item" value="[[_withDefault(queryParams.location, '')]]">
          </cluster-location-filter>
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

window.customElements.define('partner-projects-filters', PartnerProjectsFilters);

export {PartnerProjectsFilters as PartnerProjectsFiltersEl};
