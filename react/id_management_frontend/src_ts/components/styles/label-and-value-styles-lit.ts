import {css} from 'lit-element';

// language=CSS
export const labelAndvalueStylesLit = css`
  .paper-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding-top: 6px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    padding-bottom: 6px;
    min-width: 0;
    font-size: 16px;
  }

  .input-label[empty]::after {
    content: '—';
    color: var(--secondary-text-color);
  }
`;
