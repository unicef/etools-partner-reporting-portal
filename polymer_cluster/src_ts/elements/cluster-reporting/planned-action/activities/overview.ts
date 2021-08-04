import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../../../../etools-prp-common/elements/page-body';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import '../../activity-details';
import './editing-modal';
import {PlannedActionActivityEditingModalEl} from './editing-modal';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @appliesMixin LocalizeMixin
 */
class PaActivityDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
      ${buttonsStyles}
      <style>
        :host {
          display: block;
        }

        div#action {
          margin: 25px 0;
          @apply --layout-horizontal;
          @apply --layout-end-justified;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <page-body>
        <template is="dom-if" if="[[permissions.createPartnerEntities]]" restamp="true">
          <planned-action-activity-editing-modal
            id="modal"
            edit-data="[[activityData]]"
          ></planned-action-activity-editing-modal>

          <div id="action">
            <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
              [[localize('edit_activity')]]
            </paper-button>
          </div>
        </template>

        <activity-details-display activity-data="[[activityData]]"></activity-details-display>
      </page-body>
    `;
  }

  @property({type: Object})
  activityData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionActivityEditingModalEl).open();
  }
}

window.customElements.define('pa-activity-details-overview', PaActivityDetailsOverview);

export {PaActivityDetailsOverview as PaActivityDetailsOverviewEl};
