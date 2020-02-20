import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-char-counter.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '../labelled-item';
import '../etools-prp-permissions';
import './report-attachments';

import {GenericObject} from '../../typings/globals.types';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../../elements/filter-list';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {reportInfoCurrent} from '../../redux/selectors/reportInfo';
import {computeMode, computeUpdateUrl} from './js/pd-report-info-functions';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdReportsUpdate} from '../../redux/actions/pdReports';
import '../../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../elements/etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportInfo extends LocalizeMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {

  public static get template() {
    return html`
    <style include="app-grid-style">
      :host {
        display: block;
        margin-bottom: 25px;

        --app-grid-columns: 8;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 7;
      }

      .app-grid {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .toggle-button-container {
        max-width: calc((100% - 0.1px) / 8 * 7 - 25px) ;

        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      #toggle-button {
        background-color: #0099ff;
        color: #fff;
        font-size: 14px;
      }

      .row {
        @apply --app-grid-expandible-item;
      }

      .value {
        font-size: 16px;
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put">
    </etools-prp-ajax>

    <etools-content-panel panel-title="Other info" no-header="[[noHeader]]">
      <div class="app-grid">
        <div class="row">
          <labelled-item label="[[localize('partner_contribution')]]">
            <template
                is="dom-if"
                if="[[_equals(computedMode, 'view')]]"
                restamp="true">
              <span class="value">[[_withDefault(data.partner_contribution_to_date)]]</span>
            </template>

            <template
                is="dom-if"
                if="[[!_equals(computedMode, 'view')]]"
                restamp="true">
              <paper-input
                  id="partner_contribution_to_date"
                  value="[[data.partner_contribution_to_date]]"
                  no-label-float
                  char-counter
                  maxlength="2000">
              </paper-input>
            </template>
          </labelled-item>
        </div>

        <div class="row">
          <labelled-item label="[[localize('challenges_bottlenecks')]]">
            <template
                is="dom-if"
                if="[[_equals(computedMode, 'view')]]"
                restamp="true">
              <span class="value">[[_withDefault(data.challenges_in_the_reporting_period)]]</span>
            </template>

            <template
                is="dom-if"
                if="[[!_equals(computedMode, 'view')]]"
                restamp="true">
              <paper-input
                  id="challenges_in_the_reporting_period"
                  value="[[data.challenges_in_the_reporting_period]]"
                  no-label-float
                  char-counter
                  maxlength="2000">
              </paper-input>
            </template>
          </labelled-item>
        </div>

        <div class="row">
          <labelled-item label="[[localize('proposed_way_forward')]]">
            <template
                is="dom-if"
                if="[[_equals(computedMode, 'view')]]"
                restamp="true">
              <span class="value">[[_withDefault(data.proposed_way_forward)]]</span>
            </template>

            <template
                is="dom-if"
                if="[[!_equals(computedMode, 'view')]]"
                restamp="true">
              <paper-input
                  id="proposed_way_forward"
                  value="[[data.proposed_way_forward]]"
                  no-label-float
                  char-counter
                  maxlength="2000">
              </paper-input>
            </template>
          </labelled-item>
        </div>

        <div class="toggle-button-container row">
          <template
              is="dom-if"
              if="[[!_equals(computedMode, 'view')]]">
            <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
              [[localize('save')]]
            </paper-button>
          </template>
        </div>

        <div class="row">
          <report-attachments
              readonly="[[_equals(computedMode, 'view')]]">
          </report-attachments>
        </div>
      </div>
    </etools-content-panel>
`;
  }


  @property({type: Object})
  localData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Boolean})
  noHeader!: boolean;

  @property({type: Object, computed: 'reportInfoCurrent(rootState)'})
  data!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: '_computeUpdateUrl(locationId, reportId)'})
  updateUrl!: string;

  @property({type: String})
  overrideMode = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode'})
  mode!: string;

  @property({type: String, computed: '_computeMode(mode, overrideMode, currentReport, permissions)'})
  computedMode!: string;

  @property({type: Object, computed: 'programmeDocumentReportsCurrent(rootState)'})
  currentReport!: GenericObject;

  updateDebouncer!: Debouncer | null;

  public static get observers() {
    return [
      '_updateData(localData.*)',
    ]
  }

  _handleInput() {
    const self = this;
    const textInputs = this.shadowRoot!.querySelectorAll('paper-input');

    textInputs.forEach(function(input) {
      self.set(['localData', input.id], input.$.input.value.trim());
    });
  }

  _updateData(change: GenericObject) {
    const self = this;

    if (change.path.split('.').length < 2) {
      // Skip the initial assignment
      return;
    }

    this.updateDebouncer = Debouncer.debounce(this.updateDebouncer,
      timeOut.after(250),
      () => {
        const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();

        (this.$.update as EtoolsPrpAjaxEl).abort();

        this.reduxStore.dispatch(
          pdReportsUpdate(
            updateThunk,
            this.pdId,
            this.reportId
          )
        )
        // (dci) clarify then on dispatch
        // .then(function() {
        //   self._notifyChangesSaved();
        // })
        // .catch(function(err) { // jshint ignore:line
        //   // TODO: error handling
        // });
      });
  }

  _computeUpdateUrl(locationId: string, reportId: string) {
    return computeUpdateUrl(locationId, reportId);
  }

  _computeMode(mode: string, overrideMode: string, report: any, permissions: GenericObject) {
    return computeMode(mode, overrideMode, report, permissions);
  }

  connectedCallback() {
    super.connectedCallback();

    this.set('localData', {});
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.updateDebouncer && this.updateDebouncer.isActive()) {
      this.updateDebouncer.cancel();
    }
  }

}

window.customElements.define('pd-report-info', PdReportInfo);

export {PdReportInfo as PdReportInfoEl};
