import { html } from '@polymer/polymer/polymer-element.js';
import "@polymer/iron-flex-layout/iron-flex-layout";
// <link rel="import" href="../../bower_components/polymer/polymer.html">
// <link rel="import" href="../../bower_components/iron-flex-layout/iron-flex-layout.html">

export const Modal = html`
        <style>
        :host {
            --paper-item-selected: {
                color: var(--theme-primary-color);
                background: var(--theme-selected-item-background-color);
        };

        --paper-item-focused-before: {
             background: transparent;
        };

        --paper-menu-focused-item-after: {
            background: transparent;
        };

        /*
        Normal?

        --paper-item-selected-weight: normal;

        --paper-menu-selected-item: {
            font-weight: normal;
        };
        */
        }

        a {
            @apply --layout;
            @apply --layout-vertical;
            @apply --layout-center-justified;

            color: inherit;
            text-decoration: none;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            padding: 0 16px;
            font-size: 14px;
        }

        iron-icon {
            margin-right: 10px;
        }

        paper-item:not(.iron-selected) iron-icon {
            color: var(--paper-grey-600);
        }

        paper-submenu paper-menu a {
            font-size: 12px;
        }

        .menu-trigger {
            --paper-item-selected: {
                color: inherit;
                background: var(--theme-selected-item-background-color);
            };
        }

        .menu-content {
            padding-top: 0;
            background: var(--theme-selected-item-background-color);
        }

        .menu-content paper-item {
            --paper-item: {
                min-height: 32px;
                font-size: 12px;
            };
        }

        .menu-content a {
            padding-left: 50px;
        }

        .nav-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100vh - 80px);
        }
        </style>`;
