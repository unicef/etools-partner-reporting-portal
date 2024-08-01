import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import {completedStatusIcon} from './status-icons';

export interface EtoolsStatusItem {
  status?: string;
  label?: string;
}

export interface EtoolsStatusModel extends EtoolsStatusItem {
  // some statuses may share the same position
  statusOptions?: EtoolsStatusItem[];
}

/**
 * @LitElement
 * @customElement
 */

@customElement('etools-status')
export class EtoolsStatus extends LitElement {
  public render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid var(--light-divider-color);
          border-top: 1px solid var(--light-divider-color);
          padding: 22px 14px 0;
          flex-wrap: wrap;
          background-color: var(--primary-background-color);
          margin-top: 4px;
          justify-content: center;
        }

        .status {
          display: flex;
          flex-direction: row;
          align-items: center;
          color: var(--secondary-text-color);
          font-size: 16px;
          margin-bottom: 22px;
        }

        .status:not(:last-of-type)::after {
          content: '';
          display: inline-block;
          vertical-align: middle;
          width: 40px;
          height: 1px;
          margin-right: 16px;
          margin-left: 24px;
          border-top: 1px solid var(--secondary-text-color);
        }

        .status .icon {
          display: inline-block;
          text-align: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #fff;
          background-color: var(--secondary-text-color);
          margin-right: 8px;
          margin-left: 8px;
          font-size: 14px;
          line-height: 24px;
        }

        .status.active .icon {
          background-color: var(--primary-color);
        }

        .status.completed .icon {
          background-color: var(--success-color);
          fill: #ffffff;
        }
      </style>
      ${this.filteredStatuses.map((item: any, index: number) => this.getStatusHtml(item, index))}
    `;
  }

  @property({type: String})
  activeStatus = 'submitted-accepted';

  @property({type: Number})
  activeStatusIndex = 0;

  // init with a default list of statuses (for testing)
  @property({type: Array})
  statuses: EtoolsStatusModel[] = [
    {
      status: 'draft',
      label: 'Draft'
    },
    {
      status: 'submitted-accepted',
      label: 'Submitted/Accepted'
    },
    {
      statusOptions: [
        // some statuses may share the same position
        {
          status: 'report-submitted',
          label: 'Report submitted'
        },
        {
          status: 'rejected',
          label: 'Rejected'
        }
      ]
    },
    {
      status: 'completed',
      label: 'Completed'
    }
  ];

  get filteredStatuses() {
    return this.filterStatuses(this.statuses, this.activeStatus);
  }

  getStatusHtml(item: any, index: number) {
    const completed = this.isCompleted(index, this.activeStatusIndex);
    return html`
      <div class="status ${this.getStatusClasses(index, this.activeStatusIndex)}">
        <span class="icon">
          ${completed ? html`${completedStatusIcon}` : html`${this.getBaseOneIndex(index)}`}
        </span>
        <span class="label">${item.label}</span>
      </div>
    `;
  }

  /**
   * Filter statuses list and prepare the ones that will be displayed
   * @param statuses
   * @param activeStatus
   */
  filterStatuses(statuses: EtoolsStatusModel[], activeStatus: string): EtoolsStatusItem[] {
    let displayStatuses: EtoolsStatusItem[] = [];
    if (statuses.length > 0) {
      displayStatuses = statuses.map((s: EtoolsStatusModel, index: number) => {
        if (s.statusOptions && s.statusOptions.length > 0) {
          const aStatus: EtoolsStatusModel | undefined = s.statusOptions.find(
            (st: EtoolsStatusModel) => st.status === activeStatus
          );
          // return the active status from a list of statuses that can share the same position
          // if active status is not in this list, return first IEtoolsStatusItem
          if (aStatus) {
            // set active status index
            this.activeStatusIndex = index;
          }
          return aStatus ? aStatus : s.statusOptions[0];
        } else {
          if (s.status === activeStatus) {
            this.activeStatusIndex = index;
          }
          return s;
        }
      });
    }
    return displayStatuses;
  }

  /**
   * Get status icon or icon placeholder
   * @param index
   */
  getBaseOneIndex(index: number): number | string {
    return index + 1;
  }

  isCompleted(index: number, activeStatusIndex: number): boolean {
    return index < activeStatusIndex || activeStatusIndex === this.statuses.length - 1;
  }

  getStatusClasses(index: number, activeStatusIndex: number): string {
    const classes: string[] = [];
    if (index === activeStatusIndex) {
      classes.push('active');
    }
    if (this.isCompleted(index, activeStatusIndex)) {
      classes.push('completed');
    }
    return classes.join(' ');
  }
}
