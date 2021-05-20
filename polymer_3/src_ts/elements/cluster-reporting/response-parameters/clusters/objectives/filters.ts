import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../../etools-prp-common/elements/filter-list';
import '../../../../filters/text-filter/text-filter';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import {filterStyles} from '../../../../../styles/filter-styles';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ClusterObjectivesFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
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

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <text-filter
            class="item"
            label="[[localize('search_cluster_objective')]]"
            name="ref_title"
            value="[[queryParams.ref_title]]"
          >
          </text-filter>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;
}

window.customElements.define('cluster-objectives-filters', ClusterObjectivesFilters);

export {ClusterObjectivesFilters as ClusterObjectivesFiltersEl};
