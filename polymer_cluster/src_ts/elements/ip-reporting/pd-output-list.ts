import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import './pd-output';
import '../list-placeholder';
import '../ip-reporting/pd-output';
import LocalizeMixin from '../../mixins/localize-mixin';
import {computeViewData} from './js/pd-output-list-functions';
import {llosAll} from '../../redux/selectors/llos';
import {RootState} from '../../typings/redux.types';
import {GenericObject} from '../../typings/globals.types';
import {currentProgrammeDocument} from '../../redux/selectors/programmeDocuments';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PdOutputList extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .loader {
          padding: 2em 0;
        }

        pd-output {
          margin-bottom: 25px;
        }

        pd-output:not(:first-of-type) {
          border-top: 1px solid var(--paper-grey-300);
        }
      </style>

      <etools-content-panel panel-title="[[localize('pd_output_results')]]">
        <template is="dom-if" if="[[loading]]" restamp="true">
          <div class="loader layout horizontal center-center">
            <div>
              <etools-loading no-overlay active></etools-loading>
            </div>
          </div>
        </template>

        <template is="dom-if" if="[[!loading]]">
          <template is="dom-repeat" items="[[viewData]]">
            <pd-output
              data="[[item]]"
              current-pd="[[currentPd]]"
              override-mode="[[overrideMode]]"
              workspace-id="[[workspaceId]]"
            >
            </pd-output>
          </template>

          <list-placeholder data="[[viewData]]" loading="[[loading]]"> </list-placeholder>
        </template>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  overrideMode!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.loading)'})
  loading!: boolean;

  @property({type: Array, computed: '_llosAll(rootState)'})
  data!: any[];

  @property({type: Array, computed: '_computeViewData(data)'})
  viewData!: any[];

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  workspaceId!: string;

  @property({type: Number, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: number;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  currentPd!: GenericObject;

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _computeViewData(data: any[]) {
    return computeViewData(data);
  }

  _llosAll(rootState: RootState) {
    return llosAll(rootState);
  }
}

window.customElements.define('pd-output-list', PdOutputList);

export {PdOutputList as PdOutputListEl};
