import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-input/paper-input';
import './labelled-item';
import './report-status';
import {RefreshReportModalEl} from './refresh-report-modal';
import './refresh-report-modal';
import '@polymer/app-layout/app-grid/app-grid-style';
import {GenericObject} from '../typings/globals.types';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import {fireEvent} from '../utils/fire-custom-event';
import Endpoints from '../endpoints';
import {buttonsStyles} from '../styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ReportableMeta extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    ${buttonsStyles}
    <style>
      :host {
        display: block;

        --paper-input-container-disabled: {
          opacity: 0.67
        };

      }

      labelled-item {
        font-size: 16px;
      }

      labelled-item:not(:last-child) {
        margin-bottom: 25px;
      }

      #input-button-container {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: row;
      }

      paper-input {
        width: 100%;
        padding-right: 18px;
      }

      paper-radio-group {
        margin-left: -12px;
      }

      #toggle-button {
        font-size: 14px;
      }

      status-badge {
        position: relative;
        top: -2px;
      }

      #refresh-button {
        margin-block-end: 1rem;
      }
    </style>

    <template
      is="dom-if"
      if="[[canRefresh]]"
      restamp="true">
      <paper-button
        id="refresh-button"
        class="btn-primary"
        on-tap="_refresh"
        disabled="[[busy]]"
        raised>
        [[localize('refresh')]]
      </paper-button>
    </template>

    <labelled-item label="[[localize('overall_status')]]">
      <template
          is="dom-if"
          if="[[!_equals(mode, 'view')]]"
          restamp="true">
        <paper-radio-group
            id="overall_status"
            selected="[[data.overall_status]]"
            on-selected-changed="_handleInput">
          <paper-radio-button name="Met">[[_computeMetLabel(completed, localize)]]</paper-radio-button>
          <template
            is="dom-if"
            if="[[!completed]]"
            restamp="true">
            <paper-radio-button name="OnT">[[localize('on_track')]]</paper-radio-button>
            <paper-radio-button name="NoP">[[localize('no_progress')]]</paper-radio-button>
          </template>
          <paper-radio-button name="Con">[[_computeConstrainedLabel(completed, localize)]]</paper-radio-button>
          <template
              is="dom-if"
              if="[[allowNoStatus]]"
              restamp="true">
            <paper-radio-button name="NoS">[[localize('no_status')]]</paper-radio-button>
          </template>
        </paper-radio-group>
      </template>

      <template
          is="dom-if"
          if="[[_equals(mode, 'view')]]"
          restamp="true">
          <report-status final="[[completed]]" status="[[data.overall_status]]"></report-status>
      </template>
    </labelled-item>

    <labelled-item id="labelled-narrative" label="[[localize('narrative_assessment')]]">
      <template
          is="dom-if"
          if="[[!_equals(mode, 'view')]]"
          restamp="true">
        <div id="input-button-container">
          <paper-input
              id="narrative_assessment"
              value="[[data.narrative_assessment]]"
              disabled
              char-counter
              no-label-float
              maxlength="2000">
          </paper-input>
          <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
            {{localizedToggle}}
          </paper-button>
        </div>
      </template>

      <template
          is="dom-if"
          if="[[_equals(mode, 'view')]]"
          restamp="true">
        [[data.narrative_assessment]]
      </template>
    </labelled-item>
    <refresh-report-modal
        id="refresh"
        data="[[refreshData]]"
        refresh-url="[[refreshUrl]]">
    </refresh-report-modal>
  `;
  }

  @property({type: String})
  mode!: String;

  @property({type: String})
  toggle: string = 'Edit';

  @property({type: String, computed: '_localizeToggle(toggle, localize)'})
  localizedToggle!: string;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Boolean, reflectToAttribute: true})
  allowNoStatus: boolean = false;

  @property({type: Boolean, reflectToAttribute: true})
  isCluster: boolean = false;

  @property({type: Boolean, reflectToAttribute: true})
  completed: boolean = false;

  @property({type: Object, computed: '_computeRefreshData(data.id)'})
  refreshData!: object;

  @property({type: Boolean, computed: '_computeCanRefresh(isCluster, data)'})
  canRefresh: boolean = false;

  @property({type: String})
  refreshUrl: string = Endpoints.reportProgressReset();

  static get observers() {
    return [
      '_localDataChanged(localData.*)',
    ]
  }

  _handleInput(event: CustomEvent) {
    let field = event.composedPath()[0] as GenericObject;
    const narrativeTextInput = this.shadowRoot!.querySelector('#narrative_assessment');

    if (narrativeTextInput && this.toggle === 'Edit' && field.id === 'toggle-button') {
      narrativeTextInput.disabled = false;
      narrativeTextInput.focus();
      this.set('toggle', 'Save');
      return;
    }

    if (field.id === 'toggle-button') {
      const parent = event.composedPath().find(function(node) {
        return node.id === 'labelled-narrative';
      });
      if (parent) {
        field = parent.querySelector('paper-input');
      }
    }

    const id = field.id;
    switch (id) {
      case 'overall_status':
        this.set(['localData', id], field.selected);
        break;

      case 'narrative_assessment':
        if (field.value !== null && this.data.narrative_assessment === field.value.trim()
          || field.value === null && this.data.narrative_assessment === null
        ) {
          this.set('toggle', 'Edit');
          narrativeTextInput.disabled = true;
          break;
        }
        this.set(['localData', id], field.value.trim());
        this.set('toggle', 'Edit');
        narrativeTextInput.disabled = true;
        break;
    }
  }

  _computeMetLabel(completed: boolean, localize: Function) {
    if (completed) {
      return localize('met_results');
    }
    return localize('met');
  }

  _computeConstrainedLabel(completed: boolean, localize: Function) {
    if (completed) {
      return localize('constrained_partially');
    }
    return localize('constrained');
  }

  _localizeToggle(toggle: string, localize: Function) {
    return localize(toggle.toLowerCase());
  }

  _localDataChanged(change: GenericObject) {
    if (change.path.split('.').length < 2) {
      return;
    }

    fireEvent(this, 'reportable-meta-changed', this.localData);
  }

  _computeRefreshData(reportId: string) {
    return {'report_id': reportId, 'report_type': 'IR'};
  }

  _computeCanRefresh(isCluster: boolean, data: GenericObject) {
    return isCluster && data.can_submit;
  }

  _refresh() {
    (this.$.refresh as RefreshReportModalEl).open();
  }

  connectedCallback() {
    super.connectedCallback();

    this.set('localData', {});
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    const labelledItem = this.shadowRoot!.querySelectorAll('labelled-item');
    if (labelledItem && labelledItem.length > 1 && labelledItem[1] && labelledItem[1].querySelector('paper-input') !== null) {
      const paperButton = labelledItem[1].querySelector('paper-button');
      if (paperButton && paperButton.textContent.trim() === 'Save') {
        this.set(['localData', 'narrative_assessment'], labelledItem[1].querySelector('paper-input').value);
      }
      // (dci) need to get the Debouncer here
      // if (this.isDebouncerActive('local-data-changed')) {
      //   this.cancelDebouncer('local-data-changed');
      // }
      (this.$.refresh as RefreshReportModalEl).close();
    }
  }

}
window.customElements.define('reportable-meta', ReportableMeta);

export {ReportableMeta as ReportableMetaEl};

