import {html} from '@polymer/polymer';
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../mixins/localize-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../page-body';
import '../ip-reporting/partner-details';
import '../etools-prp-number';
import '../labelled-item';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class ActivityDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
     <style include="app-grid-style">
      :host {
        display: block;
        --app-grid-columns:4;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 4;
      }

      .app-grid {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      ul {
        padding-left: 0;
      }

      li {
        list-style-type: none;
      }
    </style>

    <etools-content-panel panel-title="[[localize('activity_details')]]">
        <div class="row">
          <ul class="app-grid">
            <li class="item full-width">
              <labelled-item label="[[localize('title')]]">
                <span class="value">[[activityData.title]]</span>
              </labelled-item>
            </li>

            <li class="item">
              <labelled-item label="[[localize('cluster')]]">
                <span class="value">[[activityData.cluster.name]]</span>
              </labelled-item>
            </li>

            <template
              is="dom-if"
              if="[[activityData.cluster_activity]]">
              <li class="item">
                <labelled-item label="[[localize('cluster_activity')]]">
                  <span class="value">[[activityData.cluster_activity.title]]</span>
                </labelled-item>
              </li>
            </template>

            <template
              is="dom-if"
              if="[[!activityData.cluster_activity]]">
              <li class="item">
                <labelled-item label="[[localize('cluster_activity')]]">
                  <span class="value">---</span>
                </labelled-item>
              </li>
            </template>

            <template
              is="dom-if"
              if="[[activityData.cluster_objective]]">
              <li class="item">
                <labelled-item label="[[localize('cluster_objective')]]">
                  <span class="value">[[activityData.cluster_objective.title]]</span>
                </labelled-item>
              </li>
            </template>

            <li class="item">
              <labelled-item label="[[localize('partner')]]">
                <span class="value">[[activityData.partner.title]]</span>
              </labelled-item>
            </li>

            <template
              is="dom-repeat"
              items="[[activityData.projects]]">

              <div>
                <li class="item">
                  <labelled-item label="[[localize('partner_project')]]">
                    <span class="value">[[item.project_name]]</span>
                  </labelled-item>
                </li>
                <li class="item">
                  <labelled-item label="[[localize('start_date')]]">
                    <span class="value">[[item.start_date]]</span>
                  </labelled-item>
                </li>
                <li class="item">
                  <labelled-item label="[[localize('end_date')]]">
                    <span class="value">[[item.end_date]]</span>
                  </labelled-item>
                </li>
              </div>
            </template>

          </ul>
        </div>
    </etools-content-panel>
    `;
  }

  @property({type: Object})
  activityData!: GenericObject;
}

window.customElements.define('activity-details', ActivityDetails);

