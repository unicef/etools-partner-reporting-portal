import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';

import LocalizeMixin from '../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-ajax';
import Endpoints from '../../../../endpoints';
//Actions.PartnerActivities.indicators.fetch
import {fetchIndicatorDetails} from '../../../../redux/actions/indicators';
import '../../../etools-prp-permissions';
import '../../../page-body';
import '../../../list-view-indicators';
//@Lajos: bellow not merged yet
import '../../indicator-modal';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {tableStyles} from '../../../../styles/table-styles';
import {GenericObject} from '../../../../typings/globals.types';

/**
* @polymer
* @appliesMixin LocalizeMixin
* @appliesMixin UtilsBehavior
*/
class Filters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    ${buttonsStyles} ${tableStyles}
    <style include="iron-flex data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="indicators"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>

      <template is="dom-if" if="[[isCustom]]">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_activity_indicator')]]
          </paper-button>
        </div>
      </template>

      <indicator-modal
        id="indicatorModal"
        object-id="[[activityId]]"
        activity-data="[[activityData]]"
        object-type="partner.partneractivity"
        modal-title="Add Activity Indicator">
      </indicator-modal>

      <list-view-indicators
          data="[[data]]"
          type="pa"
          total-results="[[totalResults]]"
          is-custom="[[isCustom]]"
          can-edit="[[permissions.editIndicatorDetails]]">
      </list-view-indicators>
    </page-body>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object})
  activityData!: GenericObject;

  @property({type: Number})
  activityId!: number;

  @property({type: Array, computed: '_computeCurrentIndicators(activityId, allIndicators)'})
  data!: any[];

  @property({type: Number, computed: '_computeCurrentIndicatorsCount(activityId, allIndicatorsCount)'})
  totalResults!: number;

  @property({type: String, computed: '_computeUrl(activityId, queryParams)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partnerActivities.indicators)'})
  allIndicators!: GenericObject;

  @property({type: Number, computed: 'getReduxStateValue(rootState.partnerActivities.indicatorsCount)'})
  allIndicatorsCount!: number;

  static get observers() {
    return [
      '_indicatorsAjax(queryParams, activityId)',
    ];
  }

  _openModal() {
    this.$.indicatorModal.open();
  }

  _onSuccess() {
    this._indicatorsAjax();
  }

  _computeCurrentIndicators(activityId: number, allIndicators: GenericObject) {
    return allIndicators[activityId];
  }

  _computeCurrentIndicatorsCount(activityId: number, allIndicatorsCount: any) {
    //@Lajos: defined as number ....
    return allIndicatorsCount[activityId];
  }

  _computeUrl() {
    //Make sure the queryParams are updated before the thunk is created:
    this.set('queryParams.object_id', this.activityId);

    return Endpoints.indicators('pa');
  }

  _indicatorsAjax() {
    const thunk = (this.$.indicators as EtoolsPrpAjaxEl).thunk();

    (this.$.indicators as EtoolsPrpAjaxEl).abort();
    this.reduxStore.dispatch(fetchIndicatorDetails(thunk, this.activityId.toString()))
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling.
      });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('indicatorModal.indicator-added', this._onSuccess);
    this.addEventListener('indicator-edited', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('indicatorModal.indicator-added', this._onSuccess);
    this.removeEventListener('indicator-edited', this._onSuccess);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('pa-activity-details-indicators', Filters);

export {Filters as PaActivityDetailsIndicatorsEl};
