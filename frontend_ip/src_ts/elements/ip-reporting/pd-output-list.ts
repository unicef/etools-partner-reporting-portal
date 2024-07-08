import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {computeViewData} from './js/pd-output-list-functions';
import {llosAll} from '../../redux/selectors/llos';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '../../etools-prp-common/elements/list-placeholder';
import '../ip-reporting/pd-output';
// import '../../etools-prp-common/styles/iron-flex-styles.js'; // Ensure you have iron-flex-styles imported properly
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

@customElement('pd-output-list')
export class PdOutputList extends LocalizeMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    .loader {
      padding: 2em 0;
    }

    pd-output {
      margin-bottom: 25px;
    }

    pd-output:not(:first-of-type) {
      border-top: 1px solid var(--paper-grey-300);
    }
  `;

  @property({type: String})
  overrideMode!: string;

  @property({type: Boolean})
  loading = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: Array})
  viewData: any[] = [];

  @property({type: String})
  reportId!: string;

  @property({type: String})
  workspaceId!: string;

  @property({type: Number})
  pdId!: any;

  @property({type: Object})
  currentPd!: any;

  render() {
    return html`
      <etools-content-panel panel-title="${this.localize('pd_output_results')}">
        ${this.loading
          ? html`
              <div class="loader layout horizontal center-center">
                <div>
                  <etools-loading no-overlay active></etools-loading>
                </div>
              </div>
            `
          : html`
              ${(this.viewData || []).map(
                (item) => html`
                  <pd-output
                    data="${item}"
                    current-pd="${this.currentPd}"
                    override-mode="${this.overrideMode}"
                    workspace-id="${this.workspaceId}"
                  ></pd-output>
                `
              )}
              <list-placeholder .data="${this.viewData}" .loading="${this.loading}"></list-placeholder>
            `}
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState) {
    this.data = llosAll(state);
    this.currentPd = currentProgrammeDocument(state);

    if (this.loading !== state.programmeDocumentReports.current.loading) {
      this.loading = state.programmeDocumentReports.current.loading;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }

    if (this.workspaceId !== state.location.id) {
      this.workspaceId = state.location.id;
    }

    if (this.pdId !== state.programmeDocuments.current) {
      this.pdId = state.programmeDocuments.current;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('data')) {
      this.viewData = computeViewData(this.data);
    }
  }
}

export {PdOutputList as PdOutputListEl};
