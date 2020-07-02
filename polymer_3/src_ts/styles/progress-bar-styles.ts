import {html} from '@polymer/polymer';

export const progressBarStyles = html`
  <style>
    :host {
      width: 100%;
      min-width: 50px;
      max-width: 300px;
    }

    paper-progress {
      --paper-progress-height: var(--etools-prp-progress-bar-height, 15px);
      width: 87%;
      margin-right: 3%;
      float: left;
    }

    span {
      display: block;
      float: left;
      width: 10%;
    }

    #primaryProgress,
    #secondaryProgress {
      height: 15px;
    }
  </style>
`;
