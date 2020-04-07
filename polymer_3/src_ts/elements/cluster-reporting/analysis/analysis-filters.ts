import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import {filterStyles} from '../../../styles/filter-styles'

import '../../filter-list';
import '../../filters/cluster-filter-multi/cluster-filter-multi';
import '../../filters/partner-type-filter-multi/partner-type-filter-multi';
import '../../filters/cluster-objective-filter-multi/cluster-objective-filter-multi'
import '../../filters/location-type-filter/location-type-filter';
import '../../filters/narrow-location-type-filter/narrow-location-type-filter';
import '../../filters/location-filter-multi/location-filter-multi-narrowed';
import UtilsMixin from '../../../mixins/utils-mixin';

import Settings from '../../../settings';
import {GenericObject} from '../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class AnalysisFilter extends UtilsMixin(ReduxConnectedElement) {

  static get template() {
    return html`
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

        --app-grid-columns: 4;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;
      }

      .filter-2-col {
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

    <filter-list
        filters="{{filters}}"
        ignore="loc_type">
      <div class="app-grid">
        <cluster-filter-multi
            id="clusters"
            class="item"
            value="[[_withDefault(queryParams.clusters, '')]]">
        </cluster-filter-multi>

        <partner-type-filter-multi
            class="item"
            value="[[_withDefault(queryParams.partner_types, '')]]">
        </partner-type-filter-multi>

        <cluster-objective-filter-multi
            class="item filter-2-col"
            value="[[_withDefault(queryParams.cluster_objectives, '')]]"
            dependencies="clusters">
        </cluster-objective-filter-multi>

        <location-type-filter
            id="locationType"
            class="item"
            value="[[_withDefault(queryParams.loc_type, '')]]">
        </location-type-filter>

        <location-filter-multi-narrowed
            class="item filter-2-col"
            value="[[_withDefault(queryParams.locs, '')]]"
            dependencies="loc_type">
        </location-filter-multi-narrowed>

        <narrow-location-type-filter
            class="item"
            value="[[_withDefault(queryParams.narrow_loc_type, '')]]"
            dependencies="loc_type">
        </narrow-location-type-filter>
      </div>
    </filter-list>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  static get observers() {
    return [
      '_resetNarrowLocType(queryParams.loc_type)'
    ];
  }

  private _narrowLocTypeDebouncer!: Debouncer;

  private _clusterObjectivesTypeDebouncer!: Debouncer;

  private _locationsDebouncer!: Debouncer;

  _resetClusterObjectives() {

    this._clusterObjectivesTypeDebouncer = Debouncer.debounce(this._clusterObjectivesTypeDebouncer,
      timeOut.after(100), () => {

        this.set('queryParams.cluster_objectives', null);
      });
  }

  _resetLocations() {
    this._locationsDebouncer = Debouncer.debounce(this._locationsDebouncer,
      timeOut.after(100), () => {

        this.set('queryParams.locs', null);
      });
  }

  _resetNarrowLocType(locType: any) {
    this._narrowLocTypeDebouncer = Debouncer.debounce(this._narrowLocTypeDebouncer,
      timeOut.after(100), () => {
        if (locType === String(Settings.cluster.maxLocType)) {
          this.set('queryParams.narrow_loc_type', null);
        }
      });
  }

  _addEventListeners() {
    this._resetClusterObjectives = this._resetClusterObjectives.bind(this);
    this.addEventListener('clusters.selected-values-changed', this._resetClusterObjectives);
    this._resetLocations = this._resetLocations.bind(this);
    this.addEventListener('locationType.iron-select', this._resetLocations);
  }

  _removeEventListeners() {
    this.removeEventListener('clusters.selected-values-changed', this._resetClusterObjectives);
    this.removeEventListener('locationType.iron-select', this._resetLocations);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._narrowLocTypeDebouncer && this._narrowLocTypeDebouncer.isActive()) {
      this._narrowLocTypeDebouncer.cancel();
    }

    if (this._clusterObjectivesTypeDebouncer && this._clusterObjectivesTypeDebouncer.isActive()) {
      this._clusterObjectivesTypeDebouncer.cancel();
    }

    if (this._locationsDebouncer && this._locationsDebouncer.isActive()) {
      this._locationsDebouncer.cancel();
    }
    this._removeEventListeners();
  }
}

window.customElements.define('analysis-filters', AnalysisFilter);
