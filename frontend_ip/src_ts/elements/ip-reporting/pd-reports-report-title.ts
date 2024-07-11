import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../etools-prp-common/elements/etools-prp-permissions';
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
import { buildUrl } from '../../etools-prp-common/utils/util';

@customElement('pd-reports-report-title')
export class PdReportsReportTitle extends LocalizeMixin(
  ProgressReportUtilsMixin(UtilsMixin(LitElement))
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

  @property({type: String})
  baseUrl!: string

  @property({type: Boolean, attribute: 'display-link'})
  displayLink = false;

  @property({type: Boolean, attribute: 'display-link-icon'})
  displayLinkIcon = false;

  @property({type: Boolean, attribute: false})
  showLink = false;

  render() {
    return html`
      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      ${this.showLink
        ? html`
            <a href="${this._getReportLink(this.report, this.permissions, this.baseUrl)}">
              ${this.displayLinkIcon
                ? html`<iron-icon
                    class="link-mode-icon"
                    icon="${this._getReportIcon(this.report, this.permissions)}"
                  ></iron-icon>`
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
    return report ? getReportTitleFull(report, this.localize.bind(this)) : '';
  }

  _getReportTitle(report: any) {
    return getReportTitle(report, this.localize.bind(this));
  }

  _getReportLink(report: any, permissions: any, baseUrl: any) {
    if (!permissions || !report || !baseUrl) {
      return '';
    }
    const suffix = this._getMode(report, permissions);
    return getReportLink(report, suffix, buildUrl, baseUrl);
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
