import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/app-layout/app-grid/app-grid-style';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import './editing-modal';
import {ClusterActivitiesEditingModalEl} from './editing-modal';
import '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '../../../../labelled-item';
import {GenericObject} from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class RpClustersActivityOverview extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
    ${buttonsStyles}
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

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
        id="overview"
        url="[[overviewUrl]]">
    </etools-prp-ajax>

    <page-body>

      <template is="dom-if"
        if="[[_canEditActivity(permissions, data.cluster)]]"
        restamp="true">
        <cluster-activities-editing-modal id="modal" edit-data="[[data]]">
        </cluster-activities-editing-modal>
        <div id="action">
          <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_activity')]]
          </paper-button>
        </div>
      </template>

      <etools-content-panel panel-title="[[localize('activity_details')]]">
        <div class="row">
          <ul class="app-grid">
            <li class="item full-width">
              <labelled-item label="[[localize('title')]]">
                <span class="value">[[_withDefault(data.title, '')]]</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('cluster')]]">
                <span class="value">[[_withDefault(data.cluster_title)]]</span>
              </labelled-item>
            </li>
          </ul>
        </div>
      </etools-content-panel>
    </page-body>
    `;
  }

  @property({type: Object})
  properties!: GenericObject;


  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as ClusterActivitiesEditingModalEl).open();
  }

  _canEditActivity(permissions: GenericObject, clusterId: number) {
    if (clusterId && permissions && permissions.createClusterEntities) {
      return permissions.createClusterEntitiesForCluster(clusterId);
    }
    return false;
  }
}

window.customElements.define('rp-clusters-activity-overview', RpClustersActivityOverview);

export {RpClustersActivityOverview as RpClusterActivityOverviewEl};
