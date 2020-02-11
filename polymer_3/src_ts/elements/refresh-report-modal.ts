import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/polymer/lib/elements/dom-if';
import {GenericObject} from '../typings/globals.types';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import './error-modal';
import './etools-prp-number';
import './etools-prp-ajax';
import '../styles/buttons-styles';
import '../styles/modal-styles';

// <!-- behaviors: [
// App.Behaviors.ReduxBehavior,
// App.Behaviors.ModalBehavior,
// App.Behaviors.UtilsBehavior,
// App.Behaviors.RoutingBehavior,
// App.Behaviors.LocalizeBehavior,
// Polymer.AppLocalizeBehavior,

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class RefreshReportModal extends LocalizeMixin(RoutingMixin(UtilsMixin(ModalMixin(ReduxConnectedElement)))) {

  static get template() {
    return html`
    <style include="button-styles modal-styles app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        --paper-dialog: {
          width: 750px;

          &>* {
            margin: 0;
          }
        }
        ;
      }
    </style>

    <iron-location
      path="{{path}}">
    </iron-location>

    <etools-prp-ajax
        id="refreshReport"
        url="[[refreshUrl]]"
        body="[[data]]"
        method="post"
        content-type="application/json">
    </etools-prp-ajax>

    <paper-dialog with-backdrop opened=[[opened]]>
      <div class="header layout horizontal justified">
        <h2>[[localize('are_you_sure')]]?</h2>

        <paper-icon-button class="self-center" on-tap="close" icon="icons:close">
        </paper-icon-button>
      </div>
      <paper-dialog-scrollable>

        <h3>
            <template
                is="dom-if"
                if="[[_equals(data.report_type, 'PR')]]"
                restamp="true">
                [[localize('you_are_about_to_delete')]]
            </template>

            <template
                is="dom-if"
                if="[[_equals(data.report_type, 'IR')]]"
                restamp="true">
                You are about to reset all location data and entered info for this Indicator Report; including Overall status, Narrative Assessment, and Report Status. New location data entries will be generated. <!-- Localize this line! -->
                This action is irreversible. Please click "Refresh" if you wish to proceed.  <!-- Localize this line! -->
            </template>
        </h3>

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
          class="btn-primary"
          on-tap="_refresh"
          raised
          disabled="[[busy]]">
          [[localize('refresh')]]
        </paper-button>
        <paper-button
          class="btn-primary"
          on-tap="_cancel"
          disabled="[[busy]]">
          [[localize('cancel')]]
        </paper-button>
      </div>
    </paper-dialog>
    <error-modal id="error"></error-modal>
`;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  busy: boolean = false;

  _refresh() {
    const self = this;
    this.set('busy', true);

    const refreshThunk = this.$.refreshReport.thunk();
    refreshThunk()
      .then(function() {
        window.location.reload();
      })
      .catch(function(res) {
        console.log(res);
        self.set('busy', false);
      });
  }

  _cancel() {
    this.close();
  }
}

window.customElements.define('refresh-report-modal', RefreshReportModal);

export {RefreshReportModal as RefreshReportModalEl};

