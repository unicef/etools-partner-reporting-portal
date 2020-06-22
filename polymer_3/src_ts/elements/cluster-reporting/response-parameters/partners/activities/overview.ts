import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '../../../../cluster-reporting/planned-action/activities/editing-modal';
import {PlannedActionActivityEditingModalEl} from '../../../../cluster-reporting/planned-action/activities/editing-modal';
import '../../../../page-body';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import '../../../activity-details';
import '../../../../etools-prp-permissions';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {GenericObject} from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class RpPartnerActivityDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
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
        <template is="dom-if" if="[[_canEditActivity(permissions, activityData)]]" restamp="true">
          <div id="action">
            <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
              [[localize('edit_activity')]]
            </paper-button>
          </div>
          <planned-action-activity-editing-modal id="modal" edit-data="[[activityData]]">
          </planned-action-activity-editing-modal>
        </template>
        <activity-details-display activity-data="[[activityData]]"></activity-details-display>
      </page-body>
    `;
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionActivityEditingModalEl).open();
  }

  @property({type: Object})
  activityData!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  _canEditActivity(permissions: GenericObject, activityData: GenericObject) {
    if (!permissions || !activityData) {
      return;
    }
    if (activityData.cluster) {
      return permissions.createPartnerEntitiesByResponsePlan([activityData.cluster]);
    }
    return false;
  }
}

window.customElements.define('rp-partner-activity-details-overview', RpPartnerActivityDetailsOverview);

export {RpPartnerActivityDetailsOverview as RpPartnerActivityDetailsOverviewEl};
