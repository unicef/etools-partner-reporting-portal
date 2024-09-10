import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {translate} from 'lit-translate';
import {computeViewData} from './js/pd-output-list-functions';
import {llosAll} from '../../redux/selectors/llos';
import {repeat} from 'lit/directives/repeat.js';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '../../etools-prp-common/elements/list-placeholder';
import '../ip-reporting/pd-output';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

@customElement('pd-output-list')
export class PdOutputList extends connect(store)(LitElement) {
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
      border-top: 1px solid var(--sl-color-neutral-300);
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
      <etools-content-panel panel-title="${translate('PD_OUTPUT_RESULTS')}">
        ${this.loading
          ? html`
              <div class="loader layout-horizontal center-center">
                <div>
                  <etools-loading no-overlay active></etools-loading>
                </div>
              </div>
            `
          : html`
              ${repeat(
                this.viewData || [],
                (item: any, _index: number) => html`
                  <pd-output
                    .data="${item}"
                    .currentPd="${this.currentPd}"
                    .overrideMode="${this.overrideMode}"
                    .workspaceId="${this.workspaceId}"
                  ></pd-output>
                `
              )}
              <list-placeholder .data="${this.viewData}" .loading="${this.loading}"></list-placeholder>
            `}
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState) {   
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

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }
    this.data = llosAll(state);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('data')) {
      this.viewData = computeViewData(this.data);
    }
  }
}

export {PdOutputList as PdOutputListEl};
