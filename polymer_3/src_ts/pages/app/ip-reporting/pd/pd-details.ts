import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '../../../../elements/page-body';
import '../../../../elements/page-header';
import '../../../../elements/message-box';
import '../../../../elements/ip-reporting/pd-details-overview';
import '../../../../elements/ip-reporting/pd-details-reports';
import '../../../../elements/ip-reporting/pd-details-calculation-methods';

import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import {GenericObject} from '../../../../typings/globals.types';
import {sharedStyles} from '../../../../styles/shared-styles';
import {currentProgrammeDocument} from '../../../../redux/selectors/programmeDocuments';
import {RootState} from '../../../../typings/redux.types';
import {IronPagesElement} from '@polymer/iron-pages/iron-pages';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class PageIpReportingPdDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  public static get template() {
    return html`
    ${sharedStyles}
    <style>
      :host {
        display: block;
      }

      .header-content {
        margin: .5em 0;
      }

    </style>

    <app-route
      route="{{route}}"
      pattern="/:dashTab"
      data="{{routeData}}">
    </app-route>

    <page-header title="[[pd.title]]" back="pd?&status=Sig%2CAct%2CSus">
      <template
          is="dom-if"
          if="[[_equals(pd.status, 'Suspended')]]"
          restamp="true">
        <message-box
            slot="header-content"
            type="warning">
          PD is suspended, please contact UNICEF programme focal person to confirm reporting requirement.
        </message-box>
      </template>

      <div slot="tabs">
        <paper-tabs
            selected="{{routeData.dashTab}}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="details">[[localize('details')]]</paper-tab>
          <paper-tab name="reports">[[localize('reports')]]</paper-tab>
          <paper-tab name="calculation-methods">[[localize('calculation_methods')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <iron-pages
        id="tabContent"
        attr-for-selected="name"
        fallback-selection="details"
        on-iron-items-changed="_updateTabSelection">
      <template is="dom-if" if="[[_equals(pdTab, 'details')]]" restamp="true">
        <pd-details-overview name="details"></pd-details-overview>
      </template>

      <template is="dom-if" if="[[_equals(pdTab, 'reports')]]" restamp="true">
        <pd-details-reports name="reports" ></pd-details-reports>
      </template>

      <template is="dom-if" if="[[_equals(pdTab, 'calculation-methods')]]" restamp="true">
        <pd-details-calculation-methods name="calculation-methods"></pd-details-calculation-methods>
      </template>
    </iron-pages>

  `;
  }

  @property({type: String})
  pdTab!: string;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  pd: GenericObject = {};

  public static get observers() {
    return [
      '_updateUrlTab(routeData.dashTab)',
    ]
  }

  _updateTabSelection() {
    (this.$.tabContent as IronPagesElement).select(this.pdTab);
  }

  _updateUrlTab(dashTab: string) {
    this.set('pdTab', dashTab);
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

}

window.customElements.define('page-ip-reporting-pd-details', PageIpReportingPdDetails);
