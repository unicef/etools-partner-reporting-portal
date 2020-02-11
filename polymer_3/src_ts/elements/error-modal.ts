import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/polymer/lib/elements/dom-repeat';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from 'pwa-helpers/demo/store';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';
import {buttonsStyles} from '../styles/buttons-styles';

// <link rel="import" href="../redux/store.html">
// <link rel="import" href="../redux/actions/localize.html">


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ErrorModal extends connect(store)(LocalizeMixin(UtilsMixin(PolymerElement))){
  public static get template(){
    return html`
        ${buttonsStyles}
      <style>
        :host {
          --paper-dialog: {
            width: 500px;
            padding: 24px;
  
            & > * {
              margin: 0;
            }
          }
        }
      </style>
    
      <paper-dialog
          with-backdrop
          opened="{{opened}}">
        <div>
          <ul>
            <template
                is="dom-repeat"
                items="[[localizedErrors]]"
                as="localizedError">
              <li>[[localizedError]]</li>
            </template>
          </ul>
          <div class="layout horizontal-reverse">
            <paper-button
                class="btn-primary"
                dialog-dismiss>
              Close
            </paper-button>
          </div>
        </div>
      </paper-dialog>
    `;
  }

  @property({type: Array})
  errors!: GenericObject[];

  @property({type: Array, computed: '_localizeErrors(errors, localize)'})
  localizedErrors!: string[];

  @property({type: Boolean})
  opened: boolean = false;

  @property({type: Object})
  _result!: GenericObject;


  open(errors: GenericObject[]) {
    let self = this;

    this.set('errors', errors);
    this.set('opened', true);

    this.set('_result', new Promise(function (resolve) {
      self.addEventListener('opened-changed', function onOpenedChanged() {
        self.removeEventListener('opened-changed', onOpenedChanged);

        resolve();
      });
    }));

    return this._result;
  }

  _localizeErrors(errors: string[], localize: any) {
    if (errors.length === 0) {
      return;
    }

    let localizedErrors = errors.map(function (error) {
      switch (error) {
        case 'You have not selected overall status for one of Outputs':
          return localize('not_selected_overall_status');
        case 'You have not completed Partner Contribution To Date field on Other Info tab.':
          return localize('not_completed_partner_contribution');
        case 'You have not completed Challenges / bottlenecks in the reporting period field on Other Info tab.':
          return localize('not_completed_challenges_bottlenecks');
        case 'You have not completed Proposed way forward field on Other Info tab.':
          return localize('not_completed_proposed_way');
        case 'You have not completed all indicator location data across all indicator reports for this progress' +
        ' report.':
          return localize('not_completed_indicator_location');
        default:
          return error;
      }
    });

    return localizedErrors;
  }

  close() {
    this.set('errors', []);
    this.set('opened', false);
  }

}

window.customElements.define('error-modal', ErrorModal);
