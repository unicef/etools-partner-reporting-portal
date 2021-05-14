import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../ip-reporting/partner-details';
import '../etools-prp-number';
import '../labelled-item';
import {buttonsStyles} from '../../styles/buttons-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProjectDetailsDisplay extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${buttonsStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          --app-grid-columns:4;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 3;
        }

        .app-grid {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .extended {
          @apply --app-grid-expandible-item;
        }

        .location {
          margin: 2px 0px;
        }

        .top-row {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          flex-direction: row;
        }

        .top-element {
          margin-right: 50px;
          min-width: 200px;
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

        #detailsIcon {
          padding-left: 5px;
          color: #9e9e9e;
        }

        #detailsIcon iron-icon:hover {
          color: rgba(0, 0, 0, 0.87);
        }

        #detailsIcon iron-icon[hidden] {
          display: none !important;
        }
      </style>

      <etools-content-panel panel-title="[[localize('project_details')]]">
        <div class="row">
          <ul class="app-grid">
            <li class="item">
              <labelled-item label="[[localize('title')]]">
                <span class="value">[[projectData.title]]</span>
              </labelled-item>
            </li>

            <li class="item extended">
              <labelled-item label="[[localize('locations_plural')]]">
                <template
                    is="dom-repeat"
                    items="[[projectData.locations]]">
                  <p class="location value">[[item.title]]</p>
                </template>
              </labelled-item>
            </li>

            <li class="item">
              <labelled-item label="[[localize('clusters')]]">
                <span class="value">[[_commaSeparatedDictValues(projectData.clusters, 'title')]]</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('start_date')]]">
                <span class="value">[[projectData.start_date]]</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('end_date')]]">
                <span class="value">[[projectData.end_date]]</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('total_budget')]]">
                <span class="value">
                  <etools-prp-number value="[[projectData.total_budget]]"></etools-prp-number>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="[[localize('funding_source')]]">
                <span class="value">[[projectData.funding_source]]</span>
              </labelled-item>
            </li>

            <li class="item">
              <labelled-item label="[[localize('description')]]">
                <span class="value">[[projectData.description]]</span>
              </labelled-item>
            </li>

            <li class="item">
              <labelled-item label="[[localize('additional_information')]]">
                [[_withDefault(projectData.additional_information)]]
              </labelled-item>
            </li>



          </ul>
          <div class="app-grid">

          </div>
          <div id="action">
            <paper-button
              class="btn-primary"
              on-tap="_handleDetailsChange">
                [[_computeDetailsButtonMsg(detailsOpened, localize)]]
                <div id="detailsIcon">
                  <iron-icon
                    icon="expand-more"
                    hidden$="[[detailsOpened]]">
                  </iron-icon>
                  <iron-icon
                    icon="expand-less"
                    hidden$="[[!detailsOpened]]">
                  </iron-icon>
                </div>
              </paper-button>
            </div>
            <iron-collapse id="collapse" opened="{{detailsOpened}}">
              <ul class="app-grid">
                <li class="item">
                  <labelled-item label="[[localize('name_of_agency')]]">
                    <span class="value">[[_withDefault(projectData.agency_name)]]</span>
                  </labelled-item>
                </li>
               <li class="item">
                  <labelled-item label="[[localize('type_of_agency')]]">
                    <span class="value">[[_withDefault(projectData.agency_type)]]</span>
                  </labelled-item>
               </li>
              <li class="item full-width">
                <labelled-item label="[[localize('additional_implementing_partners')]]">
                  <span class="value">[[_withDefault(projectData.additional_partners)]]</span>
                </labelled-item>
              </li>
              <li class="item">
                <labelled-item label="[[localize('prioritization_classification')]]">
                  <span class="value">[[_withDefault(projectData.prioritization)]]</span>
                </labelled-item>
              </li>
              <li class="item">
                <labelled-item label="[[localize('project_code_hrp')]]">
                  <span class="value">[[_withDefault(projectData.code)]]</span>
                </labelled-item>
              </li>
              <li class="item full-width">
                <labelled-item label="[[localize('funding_requirements')]]">
                    <span class="value">[[_withDefault(projectData.funding.required_funding)]]</span>
                  </labelled-item>
              </li>
              <li class="item full-width">
                <labelled-item label="[[localize('funding_received_confirmed_own_agency')]]">
                  <span class="value">[[_withDefault(projectData.funding.internal_funding)]]</span>
                </labelled-item>
              </li>
              <li class="item full-width">
                <labelled-item label="[[localize('funding_received_confirmed_cerf')]]">
                  <span class="value">[[_withDefault(projectData.funding.cerf_funding)]]</span>
                </labelled-item>
              </li>
              <li class="item full-width">
                <labelled-item label="[[localize('funding_received_confirmed_cbpf')]]">
                  <span class="value">
                     [[_withDefault(projectData.funding.cbpf_funding)]]
                  </span>
                </labelled-item>
              </li>
              <li class="item full-width">
                <labelled-item label="[[localize('funding_received_confirmed_bilateral')]]">
                  <span class="value">
                     [[_withDefault(projectData.funding.bilateral_funding)]]
                  </span>
                </labelled-item>
             </li>
             <li class="item full-width">
              <labelled-item label="[[localize('funding_received_confirmed_unicef')]]">
                <span class="value">
                   [[_withDefault(projectData.funding.unicef_funding)]]
                </span>
              </labelled-item>
            </li>
            <li class="item full-width">
              <labelled-item label="[[localize('funding_received_confirmed_wfp')]]">
                <span class="value">
                   [[_withDefault(projectData.funding.wfp_funding)]]
                </span>
              </labelled-item>
            </li>
            <li class="item full-width">
              <labelled-item label="[[localize('funding_gap')]]">
                  <span class="value">
                     [[_withDefault(projectData.funding.funding_gap)]]
                  </span>
              </labelled-item>
            </li>

            <template is="dom-repeat" items="[[projectData.custom_fields]]" as="field">
              <span class="item full-width">
                <labelled-item label="[[field.name]]">
                  <span class="value">[[field.value]]</span>
                </labelled-item>
              </span>
            </template>
          </iron-collapse>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Boolean})
  detailsOpened = false;

  _handleDetailsChange() {
    this.detailsOpened = !this.detailsOpened;
  }

  _computeDetailsButtonMsg(detailsOpened: boolean, localize: (x: string) => string) {
    if (detailsOpened) {
      return localize('show_less_details');
    }
    return localize('show_more_details');
  }
}

window.customElements.define('project-details-display', ProjectDetailsDisplay);
