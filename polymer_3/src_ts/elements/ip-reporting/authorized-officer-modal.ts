import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '../error-modal';
import {ErrorModalEl} from '../error-modal';
import ModalMixin from '../../mixins/modal-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import '../etools-prp-ajax';
import {currentProgrammeDocument} from '../../redux/selectors/programmeDocuments';
import {pdReportsUpdateSingle} from '../../redux/actions/pdReports';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-permissions';
import {GenericObject} from '../../typings/globals.types';
import {computePostBody, computeAuthorizedPartners} from './js/authorized-officer-modal-functions';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {RootState} from '../../typings/redux.types';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {waitForIronOverlayToClose} from '../../utils/util';

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
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        --paper-dialog: {
          width: 750px;
        }
      }
      .dialog-content {
        padding-bottom: 24px;
      }
      .buttons {
        justify-content: flex-start;
      }
      paper-dialog-scrollable {
        margin-top: 0px;
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

    <paper-dialog modal opened=[[opened]]>
      <div class="header layout horizontal justified">
        <h2>[[localize('select_authorized_officer')]]</h2>

        <paper-icon-button class="self-center" on-tap="close" icon="icons:close">
        </paper-icon-button>
      </div>
      <paper-dialog-scrollable>
        <div class="dialog-content">
            <h3>[[localize('could_not_be_submitted')]]</h3>
            <etools-dropdown
              id="officerDropdown"
              class="validate"
              label="[[localize('authorized_officer')]]"
              placeholder="[[localize('select')]]"
              options="[[currentAuthorizedPartners]]"
              option-value="value"
              option-label="title"
              required
              selected="{{selectedFocalPoint}}"
              with-backdrop
              hide-search>
            </etools-dropdown>
        </div>
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
  emails!: any[];

  @property({type: String})
  userMail!: string;

  @property({type: Boolean})
  busy = false;

  @property({type: String})
  selectedFocalPoint!: string;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  currentPd!: GenericObject;

  @property({type: Array, computed: '_computeAuthorizedPartners(currentPd)'})
  currentAuthorizedPartners!: any;

  @property({type: Object, computed: '_computePostBody(selectedFocalPoint)'})
  postBody!: GenericObject;

  @property({type: String})
  pdId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  submitUrl!: string;

  _computePostBody(selectedFocalPoint: string) {
    return computePostBody(selectedFocalPoint);
  }

  _computeAuthorizedPartners(pd: GenericObject) {
    return computeAuthorizedPartners(pd);
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }

    const self = this;
    this.set('busy', true);
    (this.$.submit as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        const newPath = self.buildUrl(
          self._baseUrl,
          'pd/' + self.pdId + '/view/reports'
        );

        self.reduxStore.dispatch(pdReportsUpdateSingle(
          self.pdId,
          self.reportId,
          res.data
        ));

        self.set('busy', false);
        self.close();
        waitForIronOverlayToClose(300).then(() => self.set('path', newPath));
      })
      .catch((res: any) => {
        const errors = res.data.non_field_errors;
        self.close();
        return (self.$.error as ErrorModalEl).open(errors);
      })
      .then(() => {
        self.set('busy', false);
      });
  }

  _cancel() {
    this.close();
  }

}

window.customElements.define('authorized-officer-modal', AuthorizedOfficerModal);

export {AuthorizedOfficerModal as AuthorizedOfficerModalEl}
