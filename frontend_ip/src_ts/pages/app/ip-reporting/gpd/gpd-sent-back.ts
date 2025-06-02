import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles.js';
import {programmeDocumentReportsCurrent} from '../../../../redux/selectors/programmeDocumentReports.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

@customElement('gpd-sent-back')
export class GpdSentBack extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: Object})
  currentReport: any = {};

  @property({type: Boolean})
  hasFeedback = false;

  @property({type: Boolean})
  expanded = false;

  @property({type: Number})
  threshold = 250;

  @property({type: Boolean})
  collapsible = false;

  @property({type: String})
  containerClass = '';

  @property({type: String})
  buttonText = '';

  static styles = css`
    :host {
      etools-content-panel::part(ecp-content) {
        padding: 30px 30px 30px 70px;
      }
    }

    :host {
      display: block;
    }
    .sent-back-feedback {
      width: 100%;
      margin-bottom: 25px;
      border-top: 2px solid var(--sl-color-danger-700);
      position: relative;
    }
    .ribbon {
      width: 30px;
      height: 30px;
      position: absolute;
      left: 16px;
      top: 0;
      z-index: 2;
      background: var(--sl-color-danger-700);
    }
    .ribbon::before,
    .ribbon::after {
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      top: 15px;
      border-top: 15px solid transparent;
      border-bottom: 15px solid transparent;
    }
    .ribbon::before {
      left: 0;
      border-left: 15px solid var(--sl-color-danger-700);
    }
    .ribbon::after {
      right: 0;
      border-right: 15px solid var(--sl-color-danger-700);
    }
    h3 {
      margin: 0 0 1em;
      text-transform: uppercase;
      color: var(--sl-color-danger-700);
    }
    etools-button {
      margin: 0;
    }
    .collapsed {
      max-height: 100px;
      overflow: hidden;
      position: relative;
    }
    .collapsed::after {
      content: '';
      height: 50%;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      background: linear-gradient(transparent, white);
    }
  `;

  render() {
    return html`${buttonsStyles}
    ${this.hasFeedback
      ? html`
          <etools-content-panel no-header class="sent-back-feedback">
            <div class="ribbon" aria-hidden="true"></div>
            <div class="card-content">
              <h3>Report was sent back</h3>
              <div class="${this.containerClass}" inner-text="${this.currentReport.sent_back_feedback}"></div>
            </div>
            ${this.collapsible
              ? html`
                  <div class="card-actions">
                    <etools-button variant="primary" @click="${this._toggle}">${this.buttonText}</etools-button>
                  </div>
                `
              : ''}
          </etools-content-panel>
        `
      : html``} `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('currentReport')) {
      this.hasFeedback = this._hasFeedback(this.currentReport);
    }

    if (changedProperties.has('threshold') || changedProperties.has('currentReport')) {
      this.collapsible = this._computeCollapsible(this.threshold, this.currentReport);
    }

    if (changedProperties.has('expanded') || changedProperties.has('collapsible')) {
      this.containerClass = this._computeContainerClass(this.expanded, this.collapsible);
    }

    if (changedProperties.has('expanded')) {
      this.buttonText = this._computeButtonText(this.expanded);
    }
  }

  stateChanged(state: RootState) {
    this.currentReport = programmeDocumentReportsCurrent(state);
  }

  _hasFeedback(currentReport: any) {
    return !!(this._equals(currentReport.status, 'Sen') && currentReport.sent_back_feedback);
  }

  _computeButtonText(expanded) {
    return expanded ? 'Collapse message' : 'Expand message';
  }

  _computeCollapsible(threshold: number, currentReport: any) {
    if (currentReport) {
      return currentReport.sent_back_feedback && currentReport.sent_back_feedback.length >= threshold;
    }
    return false;
  }

  _computeContainerClass(expanded, collapsible) {
    return collapsible && !expanded ? 'collapsed' : '';
  }

  _toggle() {
    this.expanded = !this.expanded;
  }
}
