import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import {filterStyles} from '../../../../styles/filter-styles';
import '../../../../etools-prp-common/elements/filter-list';
import '../../../filters/text-filter/text-filter';
import '../../../filters/dropdown-filter/dropdown-filter';
import '../../../filters/checkbox-filter/checkbox-filter';
import '../../../filters/date-filter/date-filter';
import '../../../filters/status-filter/project-status-filter';
import '../../../filters/cluster-location-filter/cluster-location-filter';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
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

        .start-date,
        .end-date {
          max-width: 200px;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <text-filter
            class="item filter-2-col"
            label="[[localize('project')]]"
            name="title"
            value="[[queryParams.title]]"
          >
          </text-filter>

          <date-filter
            format="YYYY-MM-DD"
            class="item start-date"
            label="[[localize('start_date')]]"
            name="start_date"
            value="[[_withDefault(queryParams.start_date, '')]]"
          >
          </date-filter>

          <date-filter
            format="YYYY-MM-DD"
            class="item end-date"
            label="[[localize('end_date')]]"
            name="end_date"
            value="[[_withDefault(queryParams.end_date, '')]]"
          >
          </date-filter>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;
}

window.customElements.define('planned-action-projects-filters', PlannedActionProjectsFilters);

export {PlannedActionProjectsFilters as PlannedActionProjectsFiltersEl};
