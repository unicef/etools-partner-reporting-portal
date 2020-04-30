import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-styles/typography';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../etools-prp-ajax';
import '../../../../elements/etools-prp-permissions';
import '../../../message-box';
import '../../../../elements/cluster-reporting/creation-modal-project-details';
import '../../../../elements/cluster-reporting/planned-action/projects/custom-fields-widget';
import '../../../form-fields/dropdown-form-input';
import '../../../form-fields/cluster-dropdown-content';
import '../../../form-fields/partner-dropdown-content';
import ModalMixin from '../../../../mixins/modal-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {modalStyles} from '../../../../styles/modal-styles';
import '../../../labelled-item';
import '../../../error-box';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import Endpoints from '../../../../endpoints';
import Constants from '../../../../constants';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import '../../indicator-locations-widget';
import Settings from '../../../../settings';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModalMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsModal extends LocalizeMixin(ModalMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
  public static get template() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 15px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;

          --paper-dialog: {
            width: 700px;
          }
        }

        .full-width {
          @apply --app-grid-expandible-item;
        }

        .header {
          height: 48px;
          padding: 0 24px;
          margin: 0;
          color: white;
          background: var(--theme-primary-color);
        }

        .infobox {
          display: block;
          --app-grid-columns: 2;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          padding: 15px;
          background: var(--paper-grey-300);
        }

        .infobox h4 {
          display: inline;
          color: #737373;
          font-weight: 400;
          font-size: 12px
        }

        .red {
          color: red;
          display: inline;
        }

        .justify-right {
          float: right;
        }

        .show-more-details {
          display: block;
          padding: 15px;
          background: var(--paper-grey-300);
        }

        .show-more-details .justify-right {
          float: right;
        }

        .header h2 {
          @apply --paper-font-title;
          margin: 0;
          line-height: 48px;
        }

        .header paper-icon-button {
          margin: 0 -13px 0 20px;
          color: white;
        }

        .buttons {
          padding: 24px;
        }

        .details-section {
          padding: 15px;
          background: var(--paper-grey-200);
        }

        .details-text {
          font-size: 12px;
          color: #757575;
        }

        #detailsIcon {
          padding-left: 5px;
          color: #9e9e9e;
        }

        #detailsIcon iron-icon:hover {
          color: rgba(0, 0, 0, 0.87);
        }

        #detailsIcon iron-icon[hidden] {
          display: none !important;
        }

        paper-radio-group {
          display: block;
          padding-top: 16px;
          outline: none;
        }

        paper-radio-group > .fields {
          padding: calc(var(--app-grid-gutter) / 2) 0;
        }

        paper-radio-group > .fields[empty] {
          padding: 0;
        }

        paper-radio-group .app-grid {
          margin: -var(--app-grid-gutter);
        }

        paper-radio-button {
          margin-left: -12px;
        }

        #mode paper-radio-button {
          display: block;
        }

        etools-dropdown {
          width: 100%;
        }

        iron-icon {
          color: var(--list-icon-color, #2b2b2b);
          height: 40px;
          width: 40px;
        }

        iron-icon:hover {
          color: var(--list-icon-hover-color, rgba(0, 0, 0, 0.87));
        }

        message-box {
          margin-bottom: 1em;
        }
        custom-fields-widget{
          min-width: 100%;
        }

      </style>

      <etools-prp-permissions
        permissions="{{permissions}}">
      </etools-prp-permissions>

      <iron-location path="{{ path }}"></iron-location>

      <cluster-dropdown-content clusters="{{clusters}}" partner="{{partnerForClusters}}"></cluster-dropdown-content>

      <template
        is="dom-if"
        if="[[permissions.addPartnerToProject]]"
        restamp="true">
        <partner-dropdown-content
          partners="{{partners}}"
          clusters="[[imoClusters]]">
        </partner-dropdown-content>
      </template>

      <etools-prp-ajax
        id="projectAjax"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="[[_computeAjaxMethod(edit)]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="projects"
        timeout="100000"
        url="[[ochaProjectsUrl]]"
        params="[[ochaProjectsParams]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="projectDetails"
        url="[[ochaProjectDetailsUrl]]"
        body="[[ochaProjectRequestId]]"
        content-type="application/json"
        timeout="100000">
      </etools-prp-ajax>

      <paper-dialog
        id="dialog"
        with-backdrop
        on-iron-overlay-closed="_close"
        opened="{{ opened }}">
        <div class="header layout horizontal justified">
          <h2>[[_computeLocalizedTitle(edit, localize)]]</h2>
          <paper-icon-button
            class="self-center"
            on-tap="_close"
            icon="icons:close">
          </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <error-box errors="[[errors]]"></error-box>
          <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
            <template
              is="dom-if"
              if="[[permissions.addPartnerToProject]]"
              restamp="true">
              <template
                is="dom-if"
                if="[[!edit]]"
                restamp="true">
                <etools-dropdown
                    class="item validate full-width"
                    label="[[localize('partner')]]"
                    options="[[partners]]"
                    option-value="id"
                    option-label="title"
                    selected="{{data.partner_id}}"
                    selected-item="{{selectedPartner}}"
                    required>
               </etools-dropdown>
              </template>
            </template>
            <paper-radio-group id="mode" selected="{{ mode }}" on-change="adjustPosition">
                <template is="dom-if" if="[[!edit]]" restamp="true">
                  <template is="dom-if" if="[[canAddOchaProjects]]" restamp="true">
                    <paper-radio-button
                      disabled="[[fromOchaDisabled]]"
                      name="ocha">
                      <strong>[[localize('from_ocha')]]</strong>
                    </paper-radio-button>
                  </template>
                </template>
                <template is="dom-if" if="[[!edit]]" restamp="true">
                  <template
                    is="dom-if"
                    if="[[canAddOchaProjects]]"
                    restamp="true">
                    <paper-radio-button
                      disabled="[[customDisabled]]"
                      name="custom">
                      <strong>[[localize('custom')]]</strong>
                    </paper-radio-button>
                  </template>
                </template>
             </paper-radio-group>

              <div class="fields" empty$="[[!_equals(mode, 'ocha')]]">
                <template is="dom-if" if="[[_equals(mode, 'ocha')]]" restamp="true">
                  <div>
                    <etools-dropdown
                        class="item validate full-width"
                        label="[[localize('project')]]"
                        options="[[formattedProjects]]"
                        option-value="id"
                        option-label="title"
                        selected="{{selectedProject}}"
                        disabled="[[projectsLoading]]"
                        required>
                    </etools-dropdown>
                    <template
                      is="dom-if"
                      if="[[_equals(formattedProjects.length, 0)]]"
                      restamp="true">
                      <message-box
                        type="warning">
                        [[localize('there_are_no_ocha_projects')]].
                      </message-box>
                    </template>

                    <creation-modal-project-details
                      id="details"
                      project-data="[[projectDetails]]"
                      loading="[[projectDetailsLoading]]">
                    </creation-modal-project-details>
                    <etools-loading active$="[[projectsLoading]]"></etools-loading>
                  </div>
                </template>
              </div>

              <div empty$="[[!_equals(mode, 'custom')]]">
                <template
                  is="dom-if"
                  if="[[_equals(mode, 'custom')]]"
                  restamp="true">
                  <div class="item full-width infobox">
                    <span class="item">
                      <h4>[[localize('basic_project_details')]]</h4>
                    </span>
                    <span class="item justify-right">
                      <div class="red">*</div>
                      <h4>[[localize('fields_required')]]</h4>
                    </span>
                  </div>
                  <div class="app-grid">
                    <paper-input
                      class="item validate full-width"
                      id="title"
                      label="[[localize('title')]] *"
                      value="{{ data.title }}"
                      type="string"
                      required
                      on-input="_validate">
                    </paper-input>

                    <div class="item full-width">
                      <etools-dropdown-multi
                        class="validate"
                        label="[[localize('clusters')]] *"
                        options="[[formattedClusters]]"
                        selected-values="{{selectedClusters}}"
                        required>
                      </etools-dropdown-multi>
                    </div>

                    <div class="item">
                      <datepicker-lite
                        class="start-date"
                        label="[[localize('start_date')]] *"
                        value="{{data.start_date}}"
                        input-date-format="[[dateFormat]]"
                        selected-date-display-format="[[dateFormat]]"
                        error-message=""
                        required>
                      </datepicker-lite>
                    </div>

                    <div class="item">
                      <datepicker-lite
                        class="end-date"
                        label="[[localize('end_date')]] *"
                        value="{{data.end_date}}"
                        input-date-format="[[dateFormat]]"
                        selected-date-display-format="[[dateFormat]]"
                        error-message=""
                        required>
                      </datepicker-lite>
                    </div>
                    <div class="row">
                      <etools-dropdown
                        class="item validate"
                        label="[[localize('status')]] *"
                        options="[[statuses]]"
                        option-value="id"
                        option-label="title"
                        selected="{{data.status}}"
                        hide-search
                        required>
                      </etools-dropdown>
                    </div>

                    <div class="item full-width">
                      <indicator-locations-widget
                        class="validate"
                        value="{{data.locations}}">
                      </indicator-locations-widget>
                    </div>

                    <paper-input
                      class="item validate full-width"
                      id="description"
                      label="[[localize('description')]] *"
                      value="{{ data.description }}"
                      type="string"
                      required
                      on-input="_validate">
                    </paper-input>

                    <paper-input
                      class="item validate"
                      id="total_budget"
                      label="[[localize('total_budget')]]"
                      value="{{ data.total_budget }}"
                      type="number"
                      allowed-pattern="[+\\-\\d.]"
                      step="0.01"
                      on-input="_validate">
                    </paper-input>

                    <paper-input
                      class="item validate full-width"
                      id="funding_source"
                      label="[[localize('funding_source')]]"
                      value="{{ data.funding_source }}"
                      type="string"
                      on-input="_validate">
                    </paper-input>

                    <paper-input
                      class="item validate full-width"
                      id="additional_information"
                      label="[[localize('additional_information')]]"
                      value="{{ data.additional_information }}"
                      type="string"
                      on-input="_validate">
                    </paper-input>

                    <div class="details-section item full-width">
                      <div class="layout horizontal center justified">
                        <span class="details-text">[[localize('want_to_add')]]</span>
                        <paper-button
                          class="btn-primary"
                          on-tap="_handleDetailsChange">
                          [[_computeLocalizedDetailsButtonMsg(detailsOpened, localize)]]
                          <div id="detailsIcon">
                            <iron-icon
                              icon="expand-more"
                              hidden$="[[detailsOpened]]">
                            </iron-icon>
                            <iron-icon
                              icon="expand-less"
                              hidden$="[[!detailsOpened]]">
                            </iron-icon>
                          </div>
                        </paper-button>
                      </div>
                      <iron-collapse
                        id="collapse"
                        opened="{{ detailsOpened }}">
                        <div class="app-grid">
                          <paper-input
                            id="agencyAcronyms"
                            class="item validate"
                            label="[[localize('name_of_funding_agency')]]"
                            value="{{ data.agency_name }}"
                            type="string"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>
                          <etools-dropdown
                              class="item validate"
                              label="[[localize('type_of_agency')]]"
                              options="[[agencyTypes]]"
                              option-value="title"
                              option-label="title"
                              selected="{{data.agency_type}}"
                              hide-search>
                          </etools-dropdown>
                          <paper-input
                            class="item validate full-width"
                            id="additional_implementing_partners"
                            label="[[localize('additional_implementing_partners')]]"
                            value="{{ data.additional_partners }}"
                            type="string"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <div class="full-width">
                            <labelled-item label="[[localize('is_this_project_hrp_fa')]]">
                              <paper-radio-group
                                selected="{{ data.part }}">
                                <paper-radio-button name="hrp">HRP</paper-radio-button>
                                <paper-radio-button name="fa">FA</paper-radio-button>
                                <paper-radio-button name="no">[[localize('no')]]</paper-radio-button>
                              </paper-radio-group>
                            </labelled-item>
                          </div>
                          <etools-dropdown
                              class="item validate"
                              label="[[localize('prioritization_classification')]]"
                              options="[[classifications]]"
                              option-value="title"
                              option-label="title"
                              selected="{{data.prioritization}}"
                              hide-search>
                          </etools-dropdown>
                          <paper-input
                            class="item validate"
                            id="project_code"
                            label="[[localize('project_code_hrp')]]"
                            value="{{ data.code }}"
                            type="string"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="funding_requirements"
                            label="[[localize('funding_requirements')]]"
                            value="{{ data.funding.required_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="own_funding"
                            label="[[localize('funding_received_confirmed_own_agency')]]"
                            value="{{ data.funding.internal_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="cerf_funding"
                            label="[[localize('funding_received_confirmed_cerf')]]"
                            value="{{ data.funding.cerf_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="cbpf_funding"
                            label="[[localize('funding_received_confirmed_cbpf')]]"
                            value="{{ data.funding.cbpf_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="bilateral_funding"
                            label="[[localize('funding_received_confirmed_bilateral')]]"
                            value="{{ data.funding.bilateral_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="unicef_funding"
                            label="[[localize('funding_received_confirmed_unicef')]]"
                            value="{{ data.funding.unicef_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="wfp_funding"
                            label="[[localize('funding_received_confirmed_wfp')]]"
                            value="{{ data.funding.wfp_funding }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <paper-input
                            class="item validate full-width"
                            id="funding_gap"
                            label="[[localize('funding_gap')]]"
                            value="{{ data.funding.funding_gap }}"
                            type="number"
                            allowed-pattern="[+\\-\\d.]"
                            step="0.01"
                            on-input="_validate"
                            always-float-label>
                          </paper-input>

                          <custom-fields-widget
                            custom-fields="{{ data.custom_fields }}"
                            edit="[[edit]]">
                          </custom-fields-widget>

                          <div>
                      </iron-collapse>
                    </div>
                </template>

                <div class="buttons layout horizontal-reverse">
                  <paper-button class="btn-primary" on-tap="_save" raised>
                    [[localize('save')]]
                  </paper-button>

                  <paper-button class="btn-cancel" on-tap="_close">
                    [[localize('cancel')]]
                  </paper-button>
                </div>

                <etools-loading active="[[updatePending]]"></etools-loading>

              </div>
          </template>
        </paper-dialog-scrollable>
      </paper-dialog>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.responsePlans.current.can_import_ocha_projects)'})
  canAddOchaProjects!: boolean;

  @property({type: String})
  path!: string;

  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  opened!: boolean;

  @property({type: Boolean})
  detailsOpened: boolean = false;

  @property({type: Boolean})
  updatePending: boolean = false;

  @property({type: String, observer: '_setDefaults'})
  mode!: string;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  refresh: boolean = false;

  @property({type: String, computed: '_computeUrl(responsePlanID, mode, edit, data)'})
  url!: string;

  @property({type: String, computed: '_computeOchaProjectsUrl(responsePlanID)'})
  ochaProjectsUrl!: string;

  @property({type: Object, computed: '_computeOchaProjectsParams(partner, selectedPartner)'})
  ochaProjectsParams!: GenericObject;

  @property({type: String, computed: '_computeOchaProjectDetailsUrl(selectedProject)'})
  ochaProjectDetailsUrl!: string;

  @property({type: Object, computed: '_computeOchaProjectRequestId(selectedProject)'})
  ochaProjectRequestId!: GenericObject;

  @property({type: Array})
  clusters: any[] = [];

  @property({type: String, computed: 'getReduxStateValue(rootState.partner.current)'})
  partner!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.partner.current.id)'})
  partnerID!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.partnerProjects.all)'})
  partnerProjects!: any[];

  @property({type: Array, computed: '_formatForMultiselect(clusters)'})
  formattedClusters!: any[];

  @property({type: String})
  partnerForClusters: string = '';

  @property({type: Array, computed: '_computeLocalizedStatuses(resources)'})
  statuses!: any[];

  @property({type: Array})
  frequencies: GenericObject[] = [
    {title: 'Weekly', id: 'Wee'},
    {title: 'Monthly', id: 'Mon'},
    {title: 'Quarterly', id: 'Qua'}
  ];

  @property({type: Array})
  projects: any[] = [];

  @property({type: String, computed: '_computeFormattedProjects(projects)'})
  formattedProjects!: string;

  @property({type: String})
  selectedProject!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  @property({type: Array, computed: '_computeImoClusters(profile)'})
  imoClusters!: any[];

  @property({type: Array, computed: '_computeLocalizedAgencyTypes(resources)'})
  agencyTypes!: any[];

  @property({type: Array, computed: '_computeLocalizedClassifications(resources)'})
  classifications!: any[];

  @property({type: Array})
  selectedClusters!: any[];

  @property({type: Boolean})
  edit: boolean = false;

  @property({type: Object})
  selectedPartner: GenericObject = {};

  @property({type: Boolean, computed: '_computeFromOchaDisabled(partner, selectedPartner)'})
  fromOchaDisabled!: boolean;

  @property({type: Boolean, computed: '_computeCustomDisabled(selectedPartner)'})
  customDisabled!: boolean;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: String})
  dateFormat: string = Settings.dateFormat;

  @property({type: Object})
  editData!: GenericObject;

  private _setModeDebouncer!: Debouncer;
  private _fetchOchaProjectDebouncer!: Debouncer;


  static get observers() {
    return ['_resetOchaProjects(selectedPartner)',
      '_fetchOchaProjectsList(partner, selectedPartner, ochaProjectsUrl)',
      '_computeOchaProjectDetailsUrl(selectedProject)',
      '_fetchOchaProjectDetails(selectedProject)',
      '_saveClusters(selectedClusters.splices)',
      '_updateMode(fromOchaDisabled, customDisabled)',
      '_updatePartnerForClusters(selectedPartner.id)',
      '_updatePartnerForClusters(partnerID)'];
  }

  _computeLocalizedStatuses() {
    return [
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'}
    ];
  }

  _computeLocalizedAgencyTypes() {
    return [
      {title: this.localize('un_agency'), id: 'UN Agency'},
      {title: this.localize('government_organization'), id: 'Government Organisation'},
      {title: this.localize('international_ngo'), id: 'International NGO'},
      {title: this.localize('national_ngo'), id: 'National NGO'},
      {title: this.localize('community_based_organization'), id: 'Community based organisation'},
      {title: this.localize('other'), id: 'Other'}
    ];
  }

  _computeLocalizedClassifications() {
    return [
      {title: this.localize('high'), id: 'High'},
      {title: this.localize('medium'), id: 'Medium'},
      {title: this.localize('low'), id: 'Low'}
    ];
  }

  _computeFromOchaDisabled(partner: GenericObject, selectedPartner: GenericObject) {
    return (!partner || !partner.ocha_external_id) &&
      (!selectedPartner || !selectedPartner.ocha_external_id);
  }

  _computeCustomDisabled(selectedPartner: GenericObject) {
    return !selectedPartner;
  }

  _updateMode(fromOchaDisabled: boolean, customDisabled: boolean) {
    this._setModeDebouncer = Debouncer.debounce(this._setModeDebouncer,
      timeOut.after(100),
      () => {
        if (fromOchaDisabled && !customDisabled) {
          this.set('mode', 'custom');
        }
      });
  }

  _updatePartnerForClusters(partner: string) {
    this.set('clusters', []);
    this.set('partnerForClusters', partner);
  }

  _computeUrl(responsePlanID: string, mode: string, edit: boolean, data: GenericObject) {
    if ((edit && !data) || (!mode || !responsePlanID)) {
      return;
    }

    if (edit) {
      return Endpoints.plannedActionsProjectOverview(data.id);
    } else if (mode === 'custom') {
      return Endpoints.plannedActions(responsePlanID);
    } else if (mode === 'ocha') {
      return Endpoints.ochaProjectsList(responsePlanID);
    }
    return;
  }

  _computeOchaProjectsUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }

    return Endpoints.ochaProjectsList(responsePlanID);
  }

  _computeOchaProjectsParams(partner: GenericObject, selectedPartner: GenericObject) {
    const ocha_external_id = (partner && partner.ocha_external_id) ||
      (selectedPartner && selectedPartner.ocha_external_id);

    return ocha_external_id ? {
      ocha_external_id: ocha_external_id
    } : {};
  }

  _computeOchaProjectDetailsUrl(selectedProject: string) {
    return Endpoints.ochaProjectDetails(selectedProject);
  }

  _close(e: CustomEvent & any) {
    if (e.target.nodeName === 'PAPER-DIALOG' ||
      e.target.nodeName === 'PAPER-BUTTON' ||
      e.target.nodeName === 'PAPER-ICON-BUTTON') {
      this.set('data', {});
      this.set('opened', false);
      this.set('refresh', false);
      this.set('detailsOpened', false);
      this.set('errors', {});
      this.set('mode', '');

      this.close();
    } else {
      return;
    }
  }

  open() {
    if (this.edit && this.editData) {
      this.set('data', Object.assign({}, this.editData));
      this.selectedClusters = this.editData.clusters.map((cluster: GenericObject) => {
        return cluster.id;
      });
      this.set('mode', 'custom');
    } else {
      if (!this.canAddOchaProjects) {
        this.set('mode', 'custom');
      }
      this.data = {
        'custom_fields': [],
        'funding': {},
        'locations': [],
        'description': ''
      };
      this.selectedClusters = [];
    }
    this.set('opened', true);
    this.set('refresh', true);
  }

  _handleDetailsChange() {
    this.detailsOpened = !this.detailsOpened;
  }

  _computeLocalizedTitle(edit: boolean, localize: Function) {
    return edit ? localize('edit_project') : localize('add_project');
  }

  _computeAjaxMethod(edit: boolean) {
    return edit ? 'patch' : 'post';
  }

  _computeImoClusters(profile: GenericObject) {
    return profile.prp_roles ?
      profile.prp_roles.filter(function(item: GenericObject) {
        return item.role === Constants.PRP_ROLE.CLUSTER_IMO && item.cluster;
      }).map(function(item: GenericObject) {return item.cluster.id;}) : [];
  }

  _computeLocalizedDetailsButtonMsg(detailsOpened: boolean, localize: Function) {
    if (detailsOpened) {
      return localize('show_less_funding_details');
    }
    return localize('show_more_funding_details');
  }

  _resetOchaProjects(partner: GenericObject) {
    if (partner && partner.id) {
      this.set('selectedProject', '');

      setTimeout(() => {
        this.set('projectDetails', {});
        fireEvent(this, 'details-loaded');
      });
    }
  }

  _fetchOchaProjectsList(partner: GenericObject, selectedPartner: GenericObject) {
    this._fetchOchaProjectDebouncer = Debouncer.debounce(this._fetchOchaProjectDebouncer,
      timeOut.after(100),
      () => {
        if (
          (!partner || !partner.ocha_external_id) &&
          (!selectedPartner || !selectedPartner.ocha_external_id)
        ) {
          return;
        }

        this.set('projectsLoading', true);
        const self = this;

        const projectThunk = (this.$.projects as EtoolsPrpAjaxEl);
        projectThunk.abort();
        projectThunk.thunk()()
          .then(function(res: GenericObject) {
            self.set('projectsLoading', false);

            const filteredPartnerProjects = self.partnerProjects.filter((item) => {
              return item.is_ocha_imported === true;
            });

            const filteredResData = res.data.filter((item: GenericObject) => {
              return filteredPartnerProjects.find((element) => {
                return element.title.trim() === item.name.trim();
              }) === undefined;
            });

            self.set('projects', filteredResData);
            fireEvent(self, 'details-loaded');
          })
          .catch((err: GenericObject) => {
            if (err.code === 504) {
              fireEvent(self, 'notify', {type: 'ocha-timeout'});
            }
            self.set('projectsLoading', false);
            self.set('errors', err.data);
          });
      });
  }

  _computeOchaProjectRequestId(selectedProject: string) {
    const ob = Object.assign({}, {'project': selectedProject});
    const obb = Object.assign(ob, {'partner_id': this.data.partner_id});
    return obb;
  }

  _fetchOchaProjectDetails(project: string) {
    if (!project) {
      return;
    }
    this.set('projectDetailsLoading', true);
    const self = this;
    (this.$.projectDetails as EtoolsPrpAjaxEl).abort();
    (this.$.projectDetails as EtoolsPrpAjaxEl).thunk()()
      .then((res: GenericObject) => {
        self.set('projectDetailsLoading', false);
        self.set('projectDetails', res.data);
        fireEvent(self, 'details-loaded');
      })
      .catch((err: GenericObject) => {
        if (err.code === 504) {
          fireEvent(self, 'notify', {type: 'ocha-timeout'});
        }
        self.set('projectDetailsLoading', false);
        self.set('errors', err.data);
      });
  }

  _computeFormattedProjects(projects: GenericObject[]) {
    return projects.map((project) => {
      return {id: project.id, title: project.name};
    });
  }

  _saveClusters() {
    this.set('data.clusters', this.selectedClusters.map(function(cluster) {
      return {'id': cluster};
    }));
  }

  _displayPartnerReadOnly(permissions: GenericObject, edit: boolean) {
    return permissions.addPartnerToProject && edit;
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _redirectToDetail(id: number) {
    const path = this.permissions.addPartnerToProject ?
      'response-parameters/partners/project/' + String(id) :
      '/planned-action/project/' + String(id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _formatForMultiselect(list: GenericObject[]) {
    return list.map((item: GenericObject) => {
      return {
        id: item.id,
        value: item.id,
        label: item.title
      };
    });
  }

  _computePartnerForClusters() {
    let partnerId = null;
    if (this.selectedPartner !== undefined) {
      partnerId = this.selectedPartner;
    } else {
      partnerId = this.partnerID;
    }

    return partnerId;
  }

  _setDefaults(edit: boolean) {
    if (edit) {
      return;
    }
    this.set('selectedProject', '');
    this.set('projectLoading', false);
    this.set('selectedPartner', {});
    this.set('data', {
      'custom_fields': [],
      'funding': {},
      'locations': [],
      'description': ''
    });
    this.set('projectDetails', {});
    this.set('errors', {});
  }

  _save() {
    const self = this;

    let locationError = false;
    const rawLocations = this.get('data.locations') || [];

    const changedLocations = rawLocations.map((location: GenericObject) => {
      if (location.location) {
        return location.location;
      } else {
        return location;
      }
    });

    changedLocations.forEach((location: GenericObject) => {
      if (!location || !location.title) {
        self.set('errors', 'No location set - please set a location.');
        locationError = true;
      } else if (changedLocations[0].admin_level !== location.admin_level) {
        self.set('errors', 'All locations need to have the same admin level.');
        locationError = true;
      }
    });

    if (locationError) {
      return;
    }

    this.set('data.locations', changedLocations);

    if (!this.data.partner_id) {
      this.data.partner_id = this.partnerForClusters;
    }
    if (!this.data.partner_id) {
      this.set('errors', 'No partner set - please set a partner.');
      return;
    }

    if (this.mode === 'ocha') {
      (this.$.projectAjax as EtoolsPrpAjaxEl).body = Object.assign({}, this.ochaProjectRequestId);
    } else {
      (this.$.projectAjax as EtoolsPrpAjaxEl).body = Object.assign({}, this.data);
    }
    this.updatePending = true;
    const thunk = (this.$.projectAjax as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: GenericObject) => {
        self.updatePending = false;
        if (self.edit) {
          fireEvent(self, 'project-edited', res.data);
          self.close();
          self.set('errors', {});
        } else {
          self.close();
          setTimeout(() => {
            self._redirectToDetail(res.data.id);
          }, 100);
        }
      })
      .catch((err: GenericObject) => {
        self.updatePending = false;
        self.set('errors', err.data);
        self.set('data.locations', rawLocations); // If there are backend validation errors, reset locations
      }); // to what they were before request was sent!
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);
    this.addEventListener('details-loaded', this.adjustPosition as any);
  }

  _removeEventListeners() {
    this.removeEventListener('details-loaded', this.adjustPosition as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    if (this._fetchOchaProjectDebouncer && this._fetchOchaProjectDebouncer.isActive()) {
      this._fetchOchaProjectDebouncer.cancel();
    }
    if (this._setModeDebouncer && this._setModeDebouncer.isActive()) {
      this._setModeDebouncer.cancel();
    }
  }
}

window.customElements.define('planned-action-projects-modal', PlannedActionProjectsModal);

export {PlannedActionProjectsModal as PlannedActionProjectsModalEl};
