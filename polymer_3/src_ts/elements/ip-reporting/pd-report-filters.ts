import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/paper-button/paper-button.js';
import {GenericObject} from '../../typings/globals.types';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {filterStyles} from '../../styles/filter-styles';
import '../../elements/filter-list';
// <link rel="import" href = "../../elements/filters/dropdown-filter/dropdown-filter.html" >
// (dci)

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <filter-list filters="{{filters}}">
      <div class="app-grid">
        <dropdown-filter
            class="item"
            label="[[localize('status')]]"
            name="status"
            value="[[_withDefault(queryParams.status, '')]]"
            data="[[statuses]]">
        </dropdown-filter>
      </div>
    </filter-list>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  @property({type: Array, computed: '_localizeStatuses(localize)'})
  statuses!: any[];

  _localizeStatuses(localize: Function) {
    return [
      {title: localize('overdue'), id: 'Ove'},
      {title: localize('sent_back'), id: 'Sen'},
      {title: localize('due'), id: 'Due'},
      {title: localize('all'), id: ''},
      {title: localize('submitted'), id: 'Sub'},
      {title: localize('accepted'), id: 'Acc'},
    ];
  }

}
window.customElements.define('pd-report-filters', PdReportFilters);

export {PdReportFilters as PdReportFiltersEl};
