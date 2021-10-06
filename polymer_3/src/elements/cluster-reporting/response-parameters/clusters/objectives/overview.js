var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import './editing-modal';
import '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import '../../../../frequency-of-reporting';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '../../../../labelled-item';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class RpClustersDetailsOverview extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        // language=HTML
        return html `
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
        if="[[_canEditObjective(permissions, data.cluster)]]"
        restamp="true">
        <cluster-objectives-editing-modal id="modal" edit-data="[[data]]">
        </cluster-objectives-editing-modal>
        <div id="action">
          <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_objective')]]
          </paper-button>
        </div>
      </template>
      <etools-content-panel panel-title="[[localize('cluster_objective_details')]]">
        <div class="row">
          <ul class="app-grid">
            <li class="item full-width">
              <labelled-item label="[[localize('title')]]">
                <span class="value">[[_withDefault(data.title, '')]]</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('cluster')]]">
                <span class="value">[[_withDefault(data.cluster_title, '')]]</span>
              </labelled-item>
            </li>
          </ul>
        </div>
      </etools-content-panel>
    </page-body>
    `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _canEditObjective(permissions, clusterId) {
        if (clusterId && permissions && permissions.createClusterEntities) {
            return permissions.createClusterEntitiesForCluster(clusterId);
        }
        return false;
    }
}
__decorate([
    property({ type: Object })
], RpClustersDetailsOverview.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], RpClustersDetailsOverview.prototype, "permissions", void 0);
window.customElements.define('rp-clusters-details-overview', RpClustersDetailsOverview);
export { RpClustersDetailsOverview as RpClustersDetailsOverviewEl };
