import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-collapse/iron-collapse';
import '../../../etools-prp-common/elements/etools-prp-progress-bar';
import '../../etools-prp-progress-bar-alt';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import './indicator-details';
import {sharedStyles} from '../../../etools-prp-common/styles/shared-styles';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import '../../cluster-reporting/analysis/indicator-details';
import {IndicatorDetailsEl} from '../../cluster-reporting/analysis/indicator-details';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class IndicatorBucket extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
      ${sharedStyles}
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
          margin-bottom: 25px;

          --etools-prp-progress-bar: {
            display: block;
            width: 120px;
            margin-right: 10px;
          }

          --etools-prp-progress-bar-height: 14px;

          --paper-progress-container-color: var(--paper-grey-100);
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .cluster-objective {
          margin: 0;
          padding: 25px;
          font-size: 12px;
        }

        .cluster-objective dt,
        .cluster-objective dd {
          display: inline;
          margin: 0;
        }

        .cluster-objective dt {
          color: var(--theme-primary-text-color-medium);
        }

        .partner-project {
          margin: 0;
          padding-top: 0px;
          padding-left: 25px;
          padding-right: 25px;
          padding-bottom: 25px;
          font-size: 12px;
        }

        .partner-project dt,
        .partner-project dd {
          display: inline;
          margin: 0;
        }

        .partner-project dt {
          color: var(--theme-primary-text-color-medium);
        }

        .indicator {
          padding: 5px 12px;
          background: var(--paper-grey-300);
        }

        .indicator:not(:last-of-type) {
          margin-bottom: 1px;
        }

        .toggle-button {
          margin-right: 10px;
        }

        .indicator-title {
          margin: 0;
          font-size: 14px;

          @apply --truncate;
        }

        .indicator-progress {
          margin: 0;
          font-size: 11px;
          line-height: 1;
        }

        .indicator-progress:not(:last-child) {
          margin-bottom: 6px;
        }

        .indicator-progress dt {
          width: 100px;
          margin-right: 10px;
          text-align: right;
          color: var(--theme-secondary-text-color);
        }

        .indicator-progress dd {
          margin: 0;
        }

        etools-prp-progress-bar {
          @apply --etools-prp-progress-bar;
        }
      </style>

      <etools-content-panel panel-title="[[prefix]] [[_computeIndicatorTitle(data)]]">
        <dl class="cluster-objective">
          <dt>[[localize('cluster_objective')]]:</dt>
          <dd>[[_computeObjectiveTitle(data)]]</dd>
        </dl>

        <template is="dom-if" if="[[_computePartnerProjectTitle(data)]]" restamp="true">
          <dl class="partner-project">
            <dt>[[localize('partner_project')]]:</dt>
            <dd>[[_computePartnerProjectTitle(data)]]</dd>
          </dl>
        </template>

        <template is="dom-repeat" items="[[data.indicators]]" as="indicator">
          <div class="indicator layout horizontal justified">
            <div class="toggle-button flex-none">
              <paper-icon-button toggles="[[index]]" on-tap="_toggle" icon="[[_computeIcon(indicator.opened)]]">
              </paper-icon-button>
            </div>

            <h3 class="indicator-title self-center flex">[[indicator.title]]</h3>

            <div class="self-center flex-none">
              <dl class="indicator-progress layout horizontal">
                <dt class="flex-none self-center">[[localize('against_target')]]:</dt>
                <dd class="flex-none">
                  <etools-prp-progress-bar
                    number="[[indicator.total_against_target]]"
                    display-type="[[indicator.display_type]]"
                  >
                  </etools-prp-progress-bar>
                </dd>
              </dl>

              <dl class="indicator-progress layout horizontal">
                <dt class="flex-none self-center">[[localize('against_in_need')]]:</dt>
                <dd class="flex-none">
                  <etools-prp-progress-bar-alt
                    number="[[indicator.total_against_in_need]]"
                    display-type="[[indicator.display_type]]"
                  >
                  </etools-prp-progress-bar-alt>
                </dd>
              </dl>
            </div>
          </div>

          <iron-collapse
            id="collapse-[[index]]"
            opened="{{indicator.opened}}"
            on-opened-changed="_handleOpenedChanged"
            no-animation
          >
            <analysis-indicator-details indicator-id="[[indicator.id]]"> </analysis-indicator-details>
          </iron-collapse>
        </template>
      </etools-content-panel>
    `;
  }
  //
  @property({type: Object})
  data!: GenericObject;

  @property({type: String, computed: '_computePrefix(data)'})
  prefix!: string;

  _computeIcon(opened: string) {
    return opened ? 'icons:expand-less' : 'icons:expand-more';
  }

  _toggle(e: CustomEvent) {
    (this.shadowRoot!.querySelector('#collapse-' + (e.target! as any).toggles) as any).toggle();
  }

  _computeObjectiveTitle(data: GenericObject) {
    if (data.type === 'partneractivityprojectcontext') {
      return data.cluster_objective_name;
    } else {
      return data.cluster_objective_title === undefined ? data.title : data.cluster_objective_title;
    }
  }

  _computePartnerProjectTitle(data: GenericObject) {
    if (data.type === 'partneractivityprojectcontext') {
      return data.project_name;
    } else {
      return undefined;
    }
  }

  _computeIndicatorTitle(data: GenericObject) {
    return data.type === 'partneractivityprojectcontext' ? data.activity_name : data.title;
  }

  _computePrefix(data: GenericObject) {
    const localizations: GenericObject = {
      partneractivity: this.localize('partner_activity'),
      partnerproject: this.localize('partner_project'),
      clusterobjective: this.localize('cluster_objective'),
      clusteractivity: this.localize('cluster_activity'),
      partneractivityprojectcontext: this.localize('partner_activity_project_context')
    };

    return localizations[data.type] ? localizations[data.type] + ':' : '';
  }

  _handleOpenedChanged(e: CustomEvent, data: GenericObject) {
    e.stopPropagation();

    if (data.value) {
      const indicatorDetails = (e.target as HTMLElement)!.querySelector('analysis-indicator-details');
      try {
        if (indicatorDetails) {
          (indicatorDetails as IndicatorDetailsEl).init();
        }
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }
  }
}

window.customElements.define('analysis-indicator-bucket', IndicatorBucket);
