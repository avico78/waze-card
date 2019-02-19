import { css } from 'lit-element';

const style = css`

    ha-card {
        padding: 0 16px 4px;
    }
    
    .header {
        font-family: var(--paper-font-headline_-_font-family);
        -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: var(--paper-font-headline_-_line-height);
        text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
        opacity: var(--dark-primary-opacity);
        padding: 24px 0px 0px;
    }

    table {
        padding: 0 0 10px;
        font-size: 1.1em;
    }

    th {
        padding: 0 15px 0 0;
        text-transform: capitalize;
    }   

    .waze-card-pointer {
        cursor: pointer;
    }

    td {
        padding-top: 10px;
        padding-bottom: 10px;
    }
`;

export default style;
