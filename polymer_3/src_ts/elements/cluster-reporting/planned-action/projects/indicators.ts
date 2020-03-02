import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../etools-prp-ajax';
import '../../../etools-prp-permissions';
import '../../../page-body';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import Endpoints from '../../../../endpoints';
import {tableStyles} from '../../../../styles/table-styles';
import {buttonsStyles} from '../../../../styles/buttons-styles';
// <link rel='import' href='../../indicator-modal.html'>
import '../../../list-view-indicators';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../typings/globals.types';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import {partnerProjIndicatorsFetch} from '../../../../redux/actions/partnerProjects';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Indicators extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)){
  public static get template(){
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
        <template
            is="dom-if"
            if="[[permissions.createPartnerEntities]]"
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
          object-type="partner.partnerproject"
          modal-title="Add Project Indicator">
        </indicator-modal>
  
        <list-view-indicators
            data="[[data]]"
            total-results="[[totalResults]]"
            can-edit="[[permissions.editIndicatorDetails]]">
        </list-view-indicators>
      </page-body>
    `;
  }

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Number})
  projectId!: number;

  @property({type: Array, computed: '_computeCurrentIndicators(projectId, allIndicators)'})
  data!: GenericObject[];

  @property({type: Number, computed: '_computeCurrentIndicatorsCount(projectId, allIndicatorsCount)'})
  totalResults!: number;

  @property({type: String, computed: '_computeUrl(projectId, queryParams)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.indicators)'})
  allIndicators!: GenericObject;

  @property({type: Number, computed: 'getReduxStateValue(rootState.partnerProjects.indicatorsCount)'})
  allIndicatorsCount!: number;


  static get observers(){
    return ['_indicatorsAjax(queryParams, projectId)'];
  }

  _openModal() {
    this.shadowRoot!.querySelector('indicatorModal')!.open();
  }

  _onSuccess() {
    this._indicatorsAjax();
  }

  _computeCurrentIndicators(projectId: number, allIndicators: GenericObject) {
    return allIndicators[projectId];
  }

  _computeCurrentIndicatorsCount(projectId: number, allIndicatorsCount: number) {
    return allIndicatorsCount[projectId];
  }

  _computeUrl() {
    //Make sure the queryParams are updated before the thunk is created:
    this.set('queryParams.object_id', this.projectId);

    return Endpoints.indicators('pp');
  }

  _indicatorsAjax() {
    let thunk = (this.$.indicators as EtoolsPrpAjaxEl).thunk();

    (this.$.indicators as EtoolsPrpAjaxEl).abort();

    this.reduxStore.dispatch(partnerProjIndicatorsFetch(thunk, this.projectId))
      .catch(function (err) { // jshint ignore:line
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

window.customElements.define('indicators', Indicators);
