import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-spinner/paper-spinner';
import '@unicef-polymer/etoolsetools-loading/etools-loading';
import '../../settings';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {tableStyles} from '../../styles/table-styles';

//<link rel="import" href="js/pd-details-doc-download-functions">
//<link rel="import" href="js/pd-details-calculation-methods-functions.html">
// @Lajos
// behaviors: [
//   behaviors: [
  // App.Behaviors.UtilsBehavior,
  //       App.Behaviors.ReduxBehavior,
  //       App.Behaviors.LocalizeBehavior,
  //       Polymer.AppLocalizeBehavior,
// ],
// ],

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdDetailsReportingRequirements extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
//not sure about data table styles....
  static get template() {
    return html`
    ${tableStyles}
    <style include="data-table-styles">
      :host {
        display: block;

        --header-title: {
          display: none;
        };

        --data-table-header: {
          height: auto;
        };
      }

      h3 {
        padding: 0 24px;
        margin: 0;
      }
    </style>

    <section>
      <h3>[[title]]</h3>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column field="">
          [[localize('report_number')]]
        </etools-data-table-column>
        <etools-data-table-column field="">
          [[localize('due_date')]]
        </etools-data-table-column>
        <etools-data-table-column field="">
          [[localize('reporting_period')]]
        </etools-data-table-column>
      </etools-data-table-header>

      <template
          is="dom-repeat"
          items="[[data]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell">
              [[_getReportName(item.report_type, index, localize)]]
            </div>
            <div class="table-cell table-cell--text">
              [[item.due_date]]
            </div>
            <div class="table-cell table-cell--text">
              [[item.start_date]] - [[item.end_date]]
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <list-placeholder
          data="[[data]]"
          loading="[[loading]]"
          message="No reports found">
      </list-placeholder>
    </section>
  `;
  }

  @property({type: Array})
  data!: any;

  @property({type: Boolean})
  loading!: boolean;

  @property({type: String})
  title!: String;
  

  _getReportName(type: any, index: any, localize: any) {
    return PdDetailsReportingRequirementsUtils.getReportName(type, index, localize);
  };
}

window.customElements.define('pd-details-reporting-requirements', PdDetailsReportingRequirements);
