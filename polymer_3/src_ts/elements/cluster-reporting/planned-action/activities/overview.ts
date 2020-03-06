import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../../../page-body';
import '../../../etools-prp-permissions';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../mixins/localize-mixin';
//@Lajos: not merged yet
import '../../activity-details';
import './editing-modal';
import {GenericObject} from '../../../../typings/globals.types';

/**
* @polymer
* @appliesMixin LocalizeMixin
*/
class Overview extends LocalizeMixin(ReduxConnectedElement) {

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

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <page-body>

      <template is="dom-if"
        if="[[permissions.createPartnerEntities]]"
        restamp="true">
        <planned-action-activity-editing-modal id="modal" edit-data="[[activityData]]"></planned-action-activity-editing-modal>

        <div id="action">
          <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_activity')]]
          </paper-button>
        </div>
      </template>

      <activity-details-display activity-data=[[activityData]]></activity-details-display>
    </page-body>
  `;
  }

  @property({type: Object})
  activityData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  _openModal() {
    this.shadowRoot!.querySelector('#modal').open();
  }
}

window.customElements.define('pa-activity-details-overview', Overview);

export {Overview as PaActivityDetailsOverviewEl};
