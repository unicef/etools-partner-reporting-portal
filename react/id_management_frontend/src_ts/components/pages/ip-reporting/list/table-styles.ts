import {css} from 'lit-element';

export const TableStyles = css`
  .details {
    display: flex;
  }
  .details > div {
    margin-right: 40px;
  }
  .title {
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    color: rgba(0, 0, 0, 0.54);
  }
  .detail {
    font-size: 13px;
    line-height: 15px;
    color: rgba(0, 0, 0, 0.87);
  }
  .circle {
    border-radius: 50%;
    width: 10px;
    height: 10px;
    margin-right: 5px;
    display: inline-flex;
  }
  .ACTIVE {
    background: #4caf50;
  }
  .INVITED {
    background: #f44336;
  }
  .INCOMPLETE {
    background: #616161;
  }
`;
