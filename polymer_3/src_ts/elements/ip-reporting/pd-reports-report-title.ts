import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '../etools-prp-permissions';
import {GenericObject} from '../../typings/globals.types';
import RoutingMixin from '../../mixins/routing-mixin';
import ProgressReportUtilsBehavior from '../../mixins/progress-report-utils-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {shouldDisplayLink, getReportTitleFull, getReportTitle, getReportLink} from './js/pd-reports-report-title-functions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportsReportTitle extends LocalizeMixin(ProgressReportUtilsBehavior(
  UtilsMixin(RoutingMixin(ReduxConnectedElement)))) {

  public static get template() {
    return html`
    <style>
      .final-badge {
        display: inline-block;
        border-radius: 1px;
        padding: 1px 6px;
        font-size: 10px;
        text-transform: uppercase;
        background-color: var(--paper-grey-300);
        margin-left: 5px;
        font-weight: bold;
      }
    </style>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <template
      is="dom-if"
      if="[[showLink]]"
      restamp="true">
      <a href="[[_getReportLink(report, permissions)]]">[[_getReportTitle(report, localize)]]</a>
    </template>
    <template
      is="dom-if"
      if="[[!showLink]]"
      restamp="true">
      [[_getReportTitleFull(report, localize)]]
    </template>
    <template
      is="dom-if"
      if="[[_isFinalReport(report)]]"
      restamp="true">
      <div class="final-badge">final</div>
    </template>
  `;
  }

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  report!: GenericObject;

  @property({type: Boolean})
  displayLink = false;

  @property({type: Boolean, computed: '_shouldDisplayLink(displayLink, report, permissions)'})
  showLink!: boolean;

  _shouldDisplayLink(displayLink: string, report: GenericObject, permissions: GenericObject) {
    return shouldDisplayLink(displayLink, report, permissions, this._canNavigateToReport);
  }

  _getReportTitleFull(report: GenericObject, localize: Function) {
    if (report) {
      return getReportTitleFull(report, localize);
    }
    return '';
  }

  _getReportTitle(report: GenericObject, localize: Function) {
    return getReportTitle(report, localize);
  }

  _getReportLink(report: GenericObject, permissions: GenericObject) {
    const suffix = this._getMode(report, permissions);
    return getReportLink(report, suffix, this.buildUrl, this._baseUrl);
  }
}

window.customElements.define('pd-reports-report-title', PdReportsReportTitle);

export {PdReportsReportTitle as PdReportsReportTitleEl};
