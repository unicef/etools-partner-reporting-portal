import {PolymerElement, html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
import "@polymer/polymer/lib/elements/dom-if";
import "@polymer/paper-styles/typography";
import "@polymer/iron-icons/iron-icons";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/app-localize-behavior/app-localize-behavior";

import "../style/shared-styles";
import LocalizeMixin from '../mixins/localize-mixin';
import RoutingMixin from '../mixins/routing-mixin';

// <link rel="import" href="../behaviors/localize.html">
// <link rel="import" href="../redux/store.html">
// <link rel="import" href="../behaviors/routing.html">
// <link rel="import" href="../styles/shared-styles.html">

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class PageHeader extends LocalizeMixin(RoutingMixin(PolymerElement)) {
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment iron-flex-factors shared-styles">
        :host {
          --header-gutter: 25px;

          display: block;
          padding: var(--header-gutter);
          background: white;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, .1);

          --paper-icon-button: {
              color: #666;
          };
        }

        .title {
          min-width: 0;
          position: relative;
        }

        .title h1 {
          @apply --paper-font-title;
          @apply --truncate;
          max-width: 100%;
          margin: 0;
        }

        .above-title {
          margin-left: 40px;
        }

        .back-button {
          text-decoration: none;
        }

        .toolbar {
          text-align: right;
        }

        .tabs ::content paper-tabs {
          margin-bottom: -var(--header-gutter);
        }
      </style>

      <div class="layout horizontal baseline">
        <div class="title flex">
          <div class="above-title">
            <content select=".above-title"></content>
          </div>
          <div class="layout horizontal center">
            <template is="dom-if" if="[[back]]">
              <a href="[[backUrl]]" class="back-button">
                <paper-icon-button icon="chevron-left"></paper-icon-button>
              </a>
            </template>
            <h1>[[title]]<content select=".in-title"></content></h1>
          </div>
        </div>

        <div class="toolbar flex">
          <content select=".toolbar"></content>
        </div>
      </div>

      <div class="header-content">
        <content select=".header-content"></content>
      </div>

      <div class="tabs">
        <content select=".tabs"></content>
      </div>`
      ;
  }

  @property({type: String})
  title!: string;

  @property({type: String})
  back!: string;

  @property({type: String, compute: '_computeBackUrl(back, _baseUrl, app)'})
  backUrl!: string;

  //TODO @lajos, check fi correct
  // statePath: 'app.current',
  @property({type: String})
  app!: string;

  //@lajos: defined tail as back is defined String
  _computeBackUrl(tail: string, baseUrl: string, app: string) {
    if (app === 'cluster-reporting') {
      return this.buildUrl(this._baseUrlCluster, tail);
    }
    return tail ? this.buildUrl(baseUrl, tail) : '';
  }
}

window.customElements.define('page-header', PageHeader);
