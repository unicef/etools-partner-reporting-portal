import {css} from 'lit-element';

/**
 * LitElement css version for used paper-material-styles
 * TODO:
 *  - use only in new litElements
 *  - add more elevations if needed
 *  - replace all paper-material-styles with this css module
 */

export const elevation1 = css`
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
`;

export const elevation2 = css`
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
`;

export const elevation3 = css`
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4);
`;

export const elevation4 = css`
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4);
`;

export const elevation5 = css`
  box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12),
    0 8px 10px -5px rgba(0, 0, 0, 0.4);
`;

// language=CSS
export const elevationStyles = css`
  .elevation,
  :host(.elevation) {
    display: block;
    position: relative;
  }

  .elevation[elevation='1'],
  :host(.elevation[elevation='1']) {
    ${elevation1}
  }

  .elevation[elevation='2'],
  :host(.elevation[elevation='2']) {
    ${elevation2}
  }

  .elevation[elevation='3'],
  :host(.elevation[elevation='3']) {
    ${elevation3}
  }

  .elevation[elevation='4'],
  :host(.elevation[elevation='4']) {
    ${elevation4}
  }

  .elevation[elevation='5'],
  :host(.elevation[elevation='5']) {
    ${elevation5}
  }
`;
