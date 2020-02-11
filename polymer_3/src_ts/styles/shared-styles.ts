import {html} from '@polymer/polymer/polymer-element';


export const sharedStyles = html`
    
  <style>
    :host {
      --truncate: {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      };

      --link: {
        color: var(--theme-primary-color);
        text-decoration: none;
      }
    }
  </style>

`;
