import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../ip-reporting/partner-details';
import '../etools-prp-number';
import '../labelled-item';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class CreationModalProjectDetails extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)){
  public static get template(){
    return html`
      <style include="app-grid-style">
        :host {
          display: block;
          --app-grid-columns:2;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 4;
          padding: 15px;
          background: var(--paper-grey-300);
        }
  
        .app-grid {
          padding: 0;
          margin: 0;
          list-style: none;
        }
  
        .full-width {
          @apply --app-grid-expandible-item;
        }
  
        .indicators-list {
          padding-left: 15px;
        }
  
        ul {
          padding-left: 0;
        }
      </style>  
      
      <div class="row">
        <ul class="app-grid">
          <li class="item full-width">
            <labelled-item label="[[localize('title')]]">
              <span class="value">[[projectData.name]]</span>
            </labelled-item>
          </li>

          <li class="item">
            <labelled-item label="[[localize('clusters')]]">
              <span class="value">[[_commaSeparatedValues(projectData.clusters)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('start_date')]]">
              <span class="value">[[projectData.startDate]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('end_date')]]">
              <span class="value">[[projectData.endDate]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_budget')]]">
              <span class="value">
                <etools-prp-number value="[[projectData.totalBudgetUSD]]"></etools-prp-number>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('funding_source')]]">
              <span class="value">[[projectData.fundingSources]]</span>
              </labelled-item>
          </li>

          <li class="item">
            <labelled-item label="[[localize('description')]]">
              <span class="value">[[projectData.objective]]</span>
            </labelled-item>
          </li>

          <li class="item">
            <labelled-item label="[[localize('additional_information')]]">
              [[_withDefault(projectData.additional_information)]]
            </labelled-item>
          </li>

          <li class="item">
            <labelled-item label="[[localize('indicators')]]">
              <ul class="indicators-list">
                <template
                  is="dom-repeat"
                  items="[[projectData.attachments]]">
                  <li>[[item]]</li>
                </template>
              </ul>
            </labelled-item>
          </li>

        </ul>
      </div>
    `;
  }

  @property({type: Object})
  projectData!: GenericObject;

}

window.customElements.define('creation-modal-project-details', CreationModalProjectDetails);
