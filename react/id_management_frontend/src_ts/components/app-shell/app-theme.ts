import '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/custom-style.js';

const documentContainer = document.createElement('template');
documentContainer.innerHTML = `
  <custom-style>
    <style>
      html {
        --primary-color: #0099ff;
        --primary-background-color: #FFFFFF;
        --secondary-background-color: #eeeeee;

        --primary-text-color: rgba(0, 0, 0, 0.87);
        --secondary-text-color: rgba(0, 0, 0, 0.54);

        --header-color: #ffffff;
        --header-bg-color: #233944;
        --header-icon-color: rgba(250, 250, 250, 0.70);
        --nonprod-header-color: #a94442;
        --nonprod-text-warn-color: #e6e600;

        --light-divider-color: rgba(0, 0, 0, 0.12);
        --dark-divider-color: rgba(0, 0, 0, 0.40);

        --dark-icon-color: rgba(0, 0, 0, 0.65);
        --light-icon-color: rgba(255, 255, 255, 1);

        --side-bar-scrolling: visible;

        --success-color: #72c300;
        --error-color: #ea4022;

        --primary-shade-of-green: #1A9251;
        --primary-shade-of-red: #E32526;
        --primary-shade-of-orange: orange;

        --info-color: #cebc06;
        --light-info-color: #fff176;
        --warning-background-color: #fff3cd;
        --warning-color: #856404;
        --warning-border-color: #ffeeba;

        --error-box-heading-color: var(--error-color);
        --error-box-bg-color: #f2dede;
        --error-box-border-color: #ebccd1;
        --error-box-text-color: var(--error-color);

        --ecp-header-color: var(--primary-text-color);
      
        --paper-input-container-label: {
          color: var(--secondary-text-color, #737373);
        }
        --paper-input-container-label-floating: {
          color: var(--secondary-text-color, #737373);
        }
        --paper-input-prefix: {
          color: var(--secondary-text-color, #737373);
          margin-right: 10px;
        };
        --esmm-external-wrapper: {
          width: 100%;
          margin: 0;
        };
        --paper-checkbox-checked-color: var(--primary-color);
        --paper-checkbox-unchecked-color: var(--secondary-text-color);
        --paper-radio-button-checked-color: var(--primary-color);
        --paper-radio-button-unchecked-color: var(--secondary-text-color);

      }

      html[dir="rtl"] {
        --list-row-wrapper-padding: 0;

        --required-star-style: {
          background: url('./images/required.svg') no-repeat 99% 20%/8px;
          right: auto;
          padding-right: 15px;
        }
      }

    </style>
  </custom-style>`;

document.head.appendChild(documentContainer.content);
