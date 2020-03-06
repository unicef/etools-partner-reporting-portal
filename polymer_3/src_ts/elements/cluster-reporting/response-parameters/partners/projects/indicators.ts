import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import '../../../indicator-modal';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import {tableStyles} from '../../../../../styles/table-styles';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import '../../../../list-view-indicators';
import Endpoints from '../../../../../endpoints';
import {GenericObject} from '../../../../../typings/globals.types';
import {partnerProjIndicatorsFetch} from '../../../../../redux/actions/partnerProjects';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Indicators extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
    ${tableStyles} ${buttonsStyles}
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
      <template
          is="dom-if"
          if="[[canEdit]]"
          restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_project_indicator')]]
          </paper-button>
        </div>
      </template>

      <indicator-modal
          id="indicatorModal"
          object-id="[[projectId]]"
          project-data="[[projectData]]"
          object-type="partner.partnerproject"
          modal-title="Add Project Indicator">
      </indicator-modal>

      <list-view-indicators
          data="[[data]]"
          total-results="[[totalResults]]"
          can-edit="[[canEdit]]">
      </list-view-indicators>
    </page-body>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Number})
  projectId!: number;



  @property({type: Array, computed: '_computeCurrentIndicators(projectId, allIndicators)'})
  data!: any[];

  @property({type: Number, computed: '_computeCurrentIndicatorsCount(projectId, allIndicatorsCount)'})
  totalResults!: number;

  @property({type: String, computed: '_computeUrl(projectId, queryParams)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.indicators)'})
  allIndicators!: GenericObject;

  @property({type: Number, computed: 'getReduxStateValue(rootState.partnerProjects.indicatorsCount)'})
  allIndicatorsCount!: number;

  @property({type: Boolean, computed: '_computeCanEdit(permissions, projectData)'})
  canEdit!: boolean;

  static get observers() {
    return ['_indicatorsAjax(queryParams, projectId)'];
  }

  _computeCurrentIndicators(projectId: number, allIndicators: GenericObject) {
    return allIndicators[projectId];
  }

  _computeCurrentIndicatorsCount(projectId: number, allIndicatorsCount: any) {
    return allIndicatorsCount[projectId];
  }

  _computeUrl() {
    //Make sure the queryParams are updated before the thunk is created:
    this.set('queryParams.object_id', this.projectId);

    return Endpoints.indicators('pp');
  }

  _computeCanEdit(permissions: any, projectData: GenericObject) {
    return projectData.clusters ?
      permissions.editPartnerEntities(projectData.clusters) :
      false;
  }

  _onSuccess() {
    this._indicatorsAjax();
  }

  _openModal() {
    this.$.indicatorModal.open();
  }

  _indicatorsAjax() {
    const thunk = (this.$.indicators as EtoolsPrpAjaxEl).thunk();

    (this.$.indicators as EtoolsPrpAjaxEl).abort();

    //@Lajos: again this is defined as number but it expects a string
    this.reduxStore.dispatch(partnerProjIndicatorsFetch(thunk, this.projectId))
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling.
      });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('indicator-edited', this._onSuccess);
    this.addEventListener('indicator-added', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('indicator-edited', this._onSuccess);
    this.removeEventListener('indicator-added', this._onSuccess);
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

window.customElements.define('rp-partner-project-details-indicators', Indicators);

export {Indicators as RpPartnerProjectDetailsIndicatorsEl};
