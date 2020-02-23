import {html} from '@polymer/polymer';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import ModalMixin from '../../mixins/modal-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import '../confirm-box';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin LocalizeMixin
 */
class DisaggregationModal extends ModalMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
    ${buttonsStyles}
    ${modalStyles}
    <style include="iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --paper-dialog: {
          width: 700px;

          & > * {
            margin: 0;
          }
        };
      }

      ::content disaggregation-table {
        margin-bottom: 1em;
      }
    </style>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('enter_data')]]</h2>

        <div class="layout horizontal">
          <p>[[localize('reporting_period')]]: [[reportingPeriod]]</p>

          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>
      </div>

      <paper-dialog-scrollable>
        <content select=".meta"></content>
        <content
            select="disaggregation-table"
            class="table">
        </content>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
            class="btn-primary"
            on-tap="_save"
            raised>
          [[localize('save')]]
        </paper-button>

        <paper-button
            on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <confirm-box id="confirm"></confirm-box>

      <etools-loading active="[[updatePending]]"></etools-loading>
    </paper-dialog>
    `;
  }

  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  updatePending = false;


  _save() {
    var table = this.getContentChildNodes('.table')[0];
    var self = this;

    this.set('updatePending', true);

    table.save()
      .then(function() {
        self.set('updatePending', false);
        self.close();
      })
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling

        self.set('updatePending', false);
      });
  };

  _confirm(e: CustomEvent) {
    e.stopPropagation();

    this.$.confirm.run({
      body: 'Changing disaggregation will cause your previous data to be lost. ' +
        'Do you want to continue?',
      result: e.detail,
    });
  };

  _addEventListeners() {
    this.close = this.close.bind(this);
    this.addEventListener('dialog.iron-overlay-closed', this.close);
    this.adjustPosition = this.adjustPosition.bind(this);
    this.addEventListener('disaggregation-modal-refit', this.adjustPosition as any);
    this._confirm = this._confirm.bind(this);
    this.addEventListener('disaggregation-modal-confirm', this._confirm as any);
  };

  _removeEventListeners() {
    this.removeEventListener('dialog.iron-overlay-closed', this.close);
    this.removeEventListener('disaggregation-modal-refit', this.adjustPosition as any);
    this.removeEventListener('disaggregation-modal-confirm', this._confirm as any);
  };

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  };

}

window.customElements.define('disaggregation-modal', DisaggregationModal);
