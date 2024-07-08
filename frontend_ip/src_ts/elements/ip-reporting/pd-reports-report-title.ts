import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../etools-prp-common/elements/etools-prp-permissions';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import {
  shouldDisplayLink,
  getReportTitleFull,
  getReportTitle,
  getReportLink
} from './js/pd-reports-report-title-functions';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';

@customElement('pd-reports-report-title')
export class PdReportsReportTitle extends LocalizeMixin(
  ProgressReportUtilsMixin(UtilsMixin(RoutingMixin(connect(store)(LitElement))))
) {
  static styles = css`
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
    .link-mode-icon {
      height: 15px;
      margin-right: 2px;
    }
    a {
      color: var(--primary-color);
    }
  `;

  @property({type: Object})
  permissions!: any;

  @property({type: Object})
  report!: any;

  @property({type: Boolean})
  displayLink = false;

  @property({type: Boolean})
  displayLinkIcon = false;

  @property({type: Boolean, attribute: false})
  showLink = false;

  render() {
    return html`
      <etools-prp-permissions .permissions=${this.permissions}></etools-prp-permissions>

      ${this.showLink
        ? html`
            <a href="${this._getReportLink(this.report, this.permissions)}">
              ${this.displayLinkIcon
                ? html`<iron-icon
                    class="link-mode-icon"
                    icon="${this._getReportIcon(this.report, this.permissions)}"
                  ></iron-icon>`
                : html``}
              ${this._getReportTitle(this.report, this.localize)}
            </a>
          `
        : html`${this._getReportTitleFull(this.report, this.localize)}`}
      ${this._isFinalReport(this.report) ? html`<div class="final-badge">final</div>` : html``}
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (
      changedProperties.has('displayLink') ||
      changedProperties.has('report') ||
      changedProperties.has('permissions')
    ) {
      this.showLink = !!this._shouldDisplayLink(this.displayLink, this.report, this.permissions);
    }
  }

  _shouldDisplayLink(displayLink: any, report: any, permissions: any) {
    if (!permissions) {
      return false;
    }
    return shouldDisplayLink(displayLink, report, permissions, this._canNavigateToReport);
  }

  _getReportTitleFull(report: any, localize: (x: string) => string) {
    return report ? getReportTitleFull(report, localize) : '';
  }

  _getReportTitle(report: any, localize: (x: string) => string) {
    return getReportTitle(report, localize);
  }

  _getReportLink(report: any, permissions: any) {
    if (!permissions) {
      return '';
    }
    const suffix = this._getMode(report, permissions);
    return getReportLink(report, suffix, this.buildUrl, this._baseUrl);
  }

  _getReportIcon(report: any, permissions: any) {
    if (!permissions) {
      return 'icons:visibility';
    }
    const suffix = this._getMode(report, permissions);
    return suffix === 'view' ? 'icons:visibility' : 'icons:create';
  }
}

export {PdReportsReportTitle as PdReportsReportTitleEl};
