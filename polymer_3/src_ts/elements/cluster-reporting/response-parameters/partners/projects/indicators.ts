import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../etools-prp-common/elements/etools-prp-permissions';
import '../../../../../etools-prp-common/elements/page-body';
import '../../../indicator-modal';
import {IndicatorModalEl} from '../../../indicator-modal';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import {tableStyles} from '../../../../../styles/table-styles';
import {buttonsStyles} from '../../../../../etools-prp-common/styles/buttons-styles';
import '../../../../list-view-indicators';
import Endpoints from '../../../../../etools-prp-common/endpoints';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';
import {partnerProjIndicatorsFetch} from '../../../../../etools-prp-common/redux/actions/partnerProjects';

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

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <iron-location query="{{query}}"></iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="indicators" url="[[url]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-body>
        <template is="dom-if" if="[[canEdit]]" restamp="true">
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
          modal-title="Add Project Indicator"
        >
        </indicator-modal>

        <list-view-indicators data="[[data]]" total-results="[[totalResults]]" can-edit="[[canEdit]]">
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

  @property({type: Number, computed: 'getReduxStateObject(rootState.partnerProjects.indicatorsCount)'})
  allIndicatorsCount!: GenericObject;

  @property({type: Boolean, computed: '_computeCanEdit(permissions, projectData)'})
  canEdit!: boolean;

  static get observers() {
    return ['_indicatorsAjax(queryParams, projectId)'];
  }

  _computeCurrentIndicators(projectId: number, allIndicators: GenericObject) {
    if (!projectId || !allIndicators) {
      return;
    }
    return allIndicators[projectId];
  }

  _computeCurrentIndicatorsCount(projectId: number, allIndicatorsCount: any) {
    if (!projectId || !allIndicatorsCount) {
      return;
    }
    return allIndicatorsCount[projectId] || 0;
  }

  _computeUrl() {
    // Make sure the queryParams are updated before the thunk is created:
    this.set('queryParams.object_id', this.projectId);

    return Endpoints.indicators('pp');
  }

  _computeCanEdit(permissions: any, projectData: GenericObject) {
    if (!permissions || !projectData) {
      return;
    }
    return projectData.clusters ? permissions.editPartnerEntities(projectData.clusters) : false;
  }

  _onSuccess() {
    this._indicatorsAjax();
  }

  _openModal() {
    (this.$.indicatorModal as IndicatorModalEl).open();
  }

  _indicatorsAjax() {
    if (!this.projectId || !this.url || !this.queryParams) {
      return;
    }
    const thunk = (this.$.indicators as EtoolsPrpAjaxEl).thunk();

    (this.$.indicators as EtoolsPrpAjaxEl).abort();
    this.reduxStore
      .dispatch(partnerProjIndicatorsFetch(thunk, String(this.projectId)))
      // @ts-ignore
      .catch((_err: any) => {
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
