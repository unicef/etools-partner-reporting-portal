import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';

import LocalizeMixin from '../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import {filterStyles} from '../../../../styles/filter-styles';
import '../../../filter-list';
import '../../../filter/text-filter/text-filter';
import '../../../filter/dropdown-filter/dropdown-filter';
import '../../../filter/checkbox-filter/checkbox-filter';
import '../../../filter/date-filter/date-filter';
import '../../../filter/status-filter/project-status-filter';
import '../../../filter/cluster-location-filter/cluster-location-filter';
import '../../../filter/cluster-project-filter/cluster-project-filter';
import {GenericObject} from '../../../../typings/globals.types';

/**
* @polymer
* @appliesMixin LocalizeMixin
* @appliesMixin UtilsBehavior
*/
class Filters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        padding: 0;
        display: block;
        --app-grid-columns: 4;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;
      }

      .filter-2-col {
        @apply --app-grid-expandible-item;
      }

      .checkbox {
        padding-left: 30px;
        padding-top: 30px;
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
        <cluster-project-filter
            class="item"
            value="[[_withDefault(queryParams.project, '')]]">
        </cluster-project-filter>

        <project-status-filter
          value="[[_withDefault(queryParams.status, '')]]">
        </project-status-filter>

        <cluster-location-filter
          class="item filter-2-col"
          value="[[_withDefault(queryParams.location, '')]]">
        </cluster-location-filter>

        <text-filter
          class="item filter-2-col"
          label="[[localize('search_activity_title')]]"
          name="activity"
          value="[[_withDefault(queryParams.activity, '')]]">
        </text-filter>

        <checkbox-filter
          class="item filter-2-col checkbox"
          name="custom"
          value="[[_withDefault(queryParams.custom, '')]]">
          <span class="checkbox-label">[[localize('show_only_custom_activities')]]</span>
        </checkbox-filter>
      </div>
    </filter-list>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;
}

window.customElements.define('planned-action-activities-filters', Filters);

export {Filters as PlannedActionActivitiesFiltersEl};
