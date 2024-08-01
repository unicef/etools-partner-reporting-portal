import {LitElement, html, property, customElement} from 'lit-element';

/**
 * @LitElement
 * @customElement
 */
@customElement('page-content-header')
export class PageContentHeader extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          flex: 1;

          background-color: var(--primary-background-color);
          padding: 0 24px;
          min-height: 85px;
          border-bottom: 1px solid var(--dark-divider-color);

          --page-title: {
            margin: 0;
            font-weight: normal;
            text-transform: capitalize;
            font-size: 24px;
            line-height: 1.3;
            min-height: 31px;
          }
        }

        :host([with-tabs-visible]) {
          min-height: 114px;
        }

        .content-header-row {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
        }

        .title-row {
          align-items: center;
          margin: 30px 0 0;
          padding: 0 24px;
        }

        .title-row h1 {
          flex: 1;
          @apply --page-title;
        }

        .tabs {
          margin-top: 5px;
        }

        @media print {
          :host {
            padding: 0;
            border-bottom: none;
            min-height: 0 !important;
            margin-bottom: 16px;
          }

          .title-row h1 {
            font-size: 18px;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
          .title-row {
            padding: 0 5px 5px 5px;
          }
        }
      </style>

      <div class="content-header-row title-row">
        <h1>
          <slot name="page-title"></slot>
        </h1>
        <slot name="title-row-actions"></slot>
      </div>

      <div class="content-header-row tabs" ?hidden="${this.withTabsVisible}">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean, reflect: true})
  withTabsVisible = false;
}
