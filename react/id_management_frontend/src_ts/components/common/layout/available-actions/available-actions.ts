import {GenericObject} from '@unicef-polymer/etools-types/dist/global.types';
import {customElement, html, LitElement, property} from 'lit-element';
import {fireEvent} from '../../../utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {get as getTranslation} from 'lit-translate';
import {PaperMenuButton} from '@polymer/paper-menu-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import '../are-you-sure';
import '../export-data';
import {openDialog} from '../../../utils/dialog.js';

import {arrowLeftIcon} from '../../../styles/app-icons.js';
import {ActionsStyles} from './actions-styles';

@customElement('available-actions')
export class AvailableActions extends LitElement {
  EXPORT_ACTIONS: string[] = [];
  BACK_ACTIONS: string[] = [];
  CANCEL = 'cancel';
  ACTIONS_WITHOUT_CONFIRM: string[] = [];
  ACTIONS_WITH_INPUT: string[] = [];
  namesMap: GenericObject<string> = {};

  static get styles() {
    return [ActionsStyles];
  }
  protected render() {
    if (!this.actions) {
      return '';
    }
    const actions: Set<string> = new Set(this.actions);
    const exportActions: string[] = this.EXPORT_ACTIONS.filter((action: string) => actions.has(action));
    const backAction: string | undefined = this.BACK_ACTIONS.find((action: string) => actions.has(action));
    const [mainAction, ...groupedActions] = this.actions.filter(
      (action: string) => !exportActions.includes(action) && action !== backAction
    );
    return html`
      ${this.renderExport(exportActions)}${this.renderBackAction(backAction)}
      ${this.renderGroupedActions(mainAction, groupedActions)}
    `;
  }

  @property({type: Array})
  actions = [];

  @property({type: String})
  entityId!: string;

  actionsNamesMap = new Proxy(this.namesMap, {
    get(target: GenericObject<string>, property: string): string {
      return target[property] || property.replace('_', ' ');
    }
  });

  private renderExport(actions: string[]) {
    const preparedExportActions = actions.map((action: string) => ({
      name: this.actionsNamesMap[action],
      type: action
    }));
    return actions.length
      ? html` <export-data .exportLinks="${preparedExportActions}" .tripId="${this.entityId}"></export-data> `
      : html``;
  }

  private renderBackAction(action?: string) {
    return action
      ? html`
          <paper-button class="main-button back-button" @click="${() => this.processAction(action)}">
            ${arrowLeftIcon} <span>${this.actionsNamesMap[action]}</span>
          </paper-button>
        `
      : html``;
  }

  private renderGroupedActions(mainAction: string, actions: string[]) {
    const withAdditional = actions.length ? ' with-additional' : '';
    const onlyCancel = !actions.length && mainAction === this.CANCEL ? ` cancel-background` : '';
    const className = `main-button${withAdditional}${onlyCancel}`;
    return mainAction
      ? html`
          <paper-button class="${className}" @click="${() => this.processAction(mainAction)}">
            ${this.actionsNamesMap[mainAction]} ${this.getAdditionalTransitions(actions)}
          </paper-button>
        `
      : html``;
  }

  private getAdditionalTransitions(actions?: string[]) {
    if (!actions || !actions.length) {
      return html``;
    }
    return html`
      <paper-menu-button horizontal-align="right" @click="${(event: MouseEvent) => event.stopImmediatePropagation()}">
        <paper-icon-button slot="dropdown-trigger" class="option-button" icon="expand-more"></paper-icon-button>
        <div slot="dropdown-content">
          ${actions.map(
            (action: string) => html`
              <div class="other-options" @click="${() => this.processAction(action)}">
                ${this.actionsNamesMap[action]}
              </div>
            `
          )}
        </div>
      </paper-menu-button>
    `;
  }

  async confirmAction(action: string) {
    if (this.ACTIONS_WITHOUT_CONFIRM.includes(action)) {
      return true;
    }
    const {message, btn} = this.getConfirmDialogDetails(action)!;
    return await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: message,
        confirmBtnText: btn || getTranslation('GENERAL.YES')
      }
    }).then(({confirmed}) => confirmed);
  }

  // Override in child component
  afterActionPatch(_entity: any) {
    throw new Error('Not Implemented');
  }

  // Override in child component
  getConfirmDialogDetails(_action: string) {
    throw new Error('Not Implemented');
  }

  getActionEndpoint(_action: string) {
    throw new Error('Not Implemented');
  }

  async processAction(action: string): Promise<void> {
    this.closeDropdown();

    if (!(await this.confirmAction(action))) {
      return;
    }
    const body = this.ACTIONS_WITH_INPUT.includes(action) ? await this.openActionsWithInputsDialogs(action) : {};
    if (body === null) {
      return;
    }

    const endpoint = this.getActionEndpoint(action)!;
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'entity-actions'
    });
    sendRequest({
      endpoint,
      body,
      method: 'PATCH'
    })
      .then((entity: any) => {
        this.afterActionPatch(entity);
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      })
      .finally(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'entity-actions'
        });
      });
  }

  private closeDropdown(): void {
    const element: PaperMenuButton | null = this.shadowRoot!.querySelector('paper-menu-button');
    if (element) {
      element.close();
    }
  }

  private openActionsWithInputsDialogs(action: string) {
    // TODO
    switch (action) {
      case 'cancel':
        return this.openCancelReason(action);
      case 'reject':
        return this.openCancelReason(action);
      default:
        return;
    }
  }

  private openCancelReason(action: string): Promise<any> {
    // TODO
    return openDialog({
      dialog: 'reason-popup',
      dialogData: {
        popupTitle: `${this.actionsNamesMap[action]} reason`,
        label: `${this.actionsNamesMap[action]} comment`
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      if (action === 'cancel') {
        return {comment: response.comment};
      }
      if (action === 'reject') {
        return {comment: response.comment};
      }
      return null;
    });
  }
}
