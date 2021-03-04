import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import DateMixin from '../../mixins/date-mixin';
import '../ip-reporting/partner-details';
import '../etools-prp-number';
import '../labelled-item';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DateMixin
 */
class ResponsePlanDetails extends DateMixin(UtilsMixin(PolymerElement)) {
  public static get template() {
    return html`
      <style include="app-grid-style">
        :host {
          display: block;
          --app-grid-columns: 2;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          padding: 15px;
          background: var(--paper-grey-300);
        }

        .app-grid {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        ul {
          padding-left: 0;
        }

        li {
          list-style-type: none;
        }

        .error {
          color: var(--paper-deep-orange-a700);
          font-size: 0.8em;
        }
      </style>
      <ul class="app-grid">
        <li class="item">
          <labelled-item label="Plan Type">
            <span class="value">[[planData.planType]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="Clusters">
            <template is="dom-repeat" items="[[planData.clusterNames]]">
              <div class="value">[[item]]</div>
            </template>
            <template is="dom-if" if="[[error]]">
              <span class="error">Cannot import plan without clusters</span>
            </template>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="Start Date">
            <span class="value">[[planData.startDate]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="End Date">
            <span class="value">[[planData.endDate]]</span>
          </labelled-item>
        </li>
      </ul>
      <etools-loading active$="[[loading]]"></etools-loading>
    `;
  }

  @property({type: Object})
  planData!: GenericObject;

  @property({type: Boolean})
  loading!: boolean;
}

window.customElements.define('response-plan-details', ResponsePlanDetails);
