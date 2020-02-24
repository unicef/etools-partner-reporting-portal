import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-styles/typography';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/iron-location/iron-location';
import '../error-modal';
import ModalMixin from '../../mixins/modal-mixin';
import {buttonsStyles} from '../../styles/buttons-styles'
import {modalStyles} from '../../styles/modal-styles'
import '../etools-prp-number';
import '../../redux/selectors/programmeDocumentDetails';
import '../../redux/selectors/programmeDocuments';
import {pdReportsUpdateSingle} from '../../redux/actions/pdReports';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-permissions';
import {GenericObject} from '../../typings/globals.types';
import {store} from '../../redux/store';
import {computePostBody, computeAuthorizedPartners} from './js/authorized-officer-modal-functions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class AuthorizedOfficerModal extends LocalizeMixin(RoutingMixin(ModalMixin(UtilsMixin(ReduxConnectedElement)))) {

  static get template() {
    return html`
    ${buttonsStyles}
    ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
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
      id="submit"
      url="[[submitUrl]]"
      body="[[postBody]]"
      content-type="application/json"
      method="post">
    </etools-prp-ajax>

    <paper-dialog with-backdrop opened=[[opened]]>
      <div class="header layout horizontal justified">
        <h2>[[localize('select_authorized_officer')]]</h2>

        <paper-icon-button class="self-center" on-tap="close" icon="icons:close">
        </paper-icon-button>
      </div>
      <paper-dialog-scrollable>

        <h3>[[localize('could_not_be_submitted')]]</h3>

        <paper-dropdown-menu
          id="officerDropdown"
          class="validate"
          label="[[localize('authorized_officer')]]"
          placeholder="[[localize('select')]]"
          on-value-changed="_validate"
          always-float-label
          required>
          <paper-listbox
            selected="{{selectedFocalPoint}}"
            attr-for-selected="value"
            slot="dropdown-content"
            class="dropdown-content">
            <template is="dom-repeat" items="[[currentAuthorizedPartners]]">
              <paper-item value="[[item.value]]">[[item.title]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
          class="btn-primary"
          on-tap="_save"
          raised
          disabled="[[busy]]">
          [[localize('submit')]]
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

  @property({type: Array})
  emails!: any;

  @property({type: String})
  userMail!: string;

  @property({type: Boolean})
  busy = false;

  @property({type: String})
  selectedFocalPoint!: string;

  @property({type: Object, computed: 'getReducStateObject(state.App.Selectors.ProgrammeDocuments.current)'})
  currentPd!: GenericObject;

  @property({type: Array, computed: '_computeAuthorizedPartners(currentPd)'})
  currentAuthorizedPartners!: any;

  @property({type: Object, computed: '_computePostBody(selectedFocalPoint)'})
  postBody!: GenericObject;

  _computePostBody(selectedFocalPoint: string) {
    return computePostBody(selectedFocalPoint);
  };

  _computeAuthorizedPartners(pd: string) {
    return computeAuthorizedPartners(pd);
  };

  _validate(e: CustomEvent) {
    e.target.validate();
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }
    var self = this;
    this.set('busy', true);

    this.$.submit.thunk()()
      .then(function(res: any) {
        var newPath = self.buildUrl(
          self._baseUrl,
          'pd/' + self.pdId + '/view/reports'
        );

        store.dispatch(pdReportsUpdateSingle(
          self.pdId,
          self.reportId,
          res.data
        ));
        self.set('busy', false);
        self.set('path', newPath);
      })
      .catch(function(res: any) {
        var errors = res.data.non_field_errors;
        self.close();
        return self.$.error.open(errors);
      })
      .then(function() {
        self.set('busy', false);
      });
  };

  _cancel() {
    this.close();
  }

}

window.customElements.define('authorized-officer-modal', AuthorizedOfficerModal);