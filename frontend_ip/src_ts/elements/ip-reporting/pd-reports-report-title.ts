import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../etools-prp-common/elements/etools-prp-permissions';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {
  shouldDisplayLink,
  getReportTitleFull,
  getReportTitle,
  getReportLink
} from './js/pd-reports-report-title-functions';
import {buildUrl} from '../../etools-prp-common/utils/util';

@customElement('pd-reports-report-title')
export class PdReportsReportTitle extends ProgressReportUtilsMixin(UtilsMixin(LitElement)) {
  static styles = css`
    .final-badge {
      display: inline-block;
      border-radius: 1px;
      padding: 1px 6px;
      font-size: 10px;
      text-transform: uppercase;
      background-color: var(--sl-color-neutral-300);
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

  @property({type: String})
  baseUrl!: string;

  @property({type: Boolean})
  isGdd = false;

  @property({type: Boolean, attribute: 'display-link'})
  displayLink = false;

  @property({type: Boolean, attribute: 'display-link-icon'})
  displayLinkIcon = false;

  @property({type: Boolean, attribute: 'show-link'})
  showLink = false;

  render() {
    return html`
      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      ${this.showLink
        ? html`
            <a href="${this._getReportLink(this.report, this.permissions, this.baseUrl, this.isGdd)}">
              ${this.displayLinkIcon
                ? html`<etools-icon
                    class="link-mode-icon"
                    name="${this._getReportIcon(this.report, this.permissions)}"
                  ></etools-icon>`
                : html``}
              ${this._getReportTitle(this.report)}
            </a>
          `
        : html`${this._getReportTitleFull(this.report)}`}
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
      this.showLink = !!this._shouldDisplayLink();
    }
  }

  _shouldDisplayLink() {
    if (!this.permissions) {
      return false;
    }

    return shouldDisplayLink(this.displayLink, this.report, this.permissions, this._canNavigateToReport);
  }

  _getReportTitleFull(report: any) {
    return report ? getReportTitleFull(report) : '';
  }

  _getReportTitle(report: any) {
    return getReportTitle(report);
  }

  _getReportLink(report: any, permissions: any, baseUrl: any, isGdd: boolean) {
    if (!permissions || !report || !baseUrl) {
      return '';
    }
    const suffix = this._getMode(report, permissions);
    return getReportLink(report, suffix, buildUrl, baseUrl, isGdd);
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
