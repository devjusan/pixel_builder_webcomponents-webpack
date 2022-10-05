export default async function scopedStyles(container) {
  const style = document.createElement("style");
  style.innerHTML = ` 
    :root {
        font-size: 10px;
      }
      
      :not(h1, h2, h3, strong, b) {
        font-weight: 500;
      }
      
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        text-shadow: rgba(0, 0, 0, 0.01) 0 0 0.1rem;
      }
      
      *,
      body,
      button {
        font-family: var(--fontFamily-primary);
        color: var(--text-primary);
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-size: 1.2rem;
      }
      
      widget-stage input[type='number'],
      input[type='date'],
      widget-stage input[type='time'] {
        font-family: var(--fontFamily-secondary) !important;
        font-weight: normal !important;
      }
      
      widget-stage :not(input) input,
      widget-stage textarea {
        color: var(--text-secondary);
      }
      
      widget-stage input::-webkit-calendar-picker-indicator {
        filter: opacity(60%);
      }
      
      widget-stage h1 {
        font-size: 2.4rem;
      }
      
      widget-stage h2 {
        font-size: 1.8rem;
      }
      
      widget-stage h3,
      widget-stage h3 a {
        font-size: 1.6rem;
      }
      
      widget-stage a {
        color: inherit;
        text-decoration: none;
        font-weight: normal;
      }
      
      .toast {
        font-family: 'Raleway', 'OpenSans' !important;
        width: 60rem !important;
        padding: 2rem !important;
        background-position: 3rem !important;
        opacity: 1 !important;
      }
      
      #toast-container > div {
        opacity: 1 !important;
      }
      
      #toast-container > .toast-warning,
      #toast-container > .toast-error {
        background-image: url('./assets/toasts/error-icon.svg') !important;
      }
      
      .toast-warning {
        background-color: var(--status-on-hold) !important;
      }
      
      .toast-error {
        background-color: var(--status-inactive) !important;
      }
      
      .toast-success {
        background-color: var(--status-active) !important;
      }
      
      .toast-title,
      .toast-message {
        color: var(--background-primary) !important;
        margin-left: 6.5rem !important;
      }
      
      .toast-message {
        font-size: 1.6rem !important;
      }
      
      .toast-title {
        font-size: 2rem !important;
        font-weight: 500 !important;
        line-height: 4rem !important;
      }
      
      /*
        jquery-resizable - fix
        previous: {
          bottom: -2px;
        }
        it messed with overflow calcs
      */
      .ui-resizable-s {
        bottom: 0px;
      }
      
      .ui-resizable-e {
        right: 0px;
      }
      
      /* ck editor */
      
      .ck-content * {
        font-family: unset;
        color: unset;
        padding: unset;
        margin: unset;
        font-size: unset;
        box-sizing: unset;
      }

      .button {
        position: relative;
        overflow: hidden;
        cursor: pointer;
      }
      
      .button.btn-primary {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-primary);
        font-size: 1.2rem;
        font-weight: bold;
        padding: 0.9rem;
        border-radius: 0.4rem;
        outline: 0;
        border: 0.1rem solid var(--color-primary);
        color: var(--background-primary);
        height: 3rem;
      
        transition-property: color, background;
        transition: 200ms ease;
      }
      
      .button.btn-primary:disabled {
        cursor: inherit;
        background: var(--color-secondary-shadow) !important;
        border-color: var(--border-primary) !important;
        color: var(--text-secondary) !important;
      }
      
      .button.btn-tiny {
        font-size: 1.3rem;
        padding: 0.3rem;
      }
      
      .button.btn-primary:not(:disabled):hover {
        background: var(--background-primary);
        color: var(--color-primary);
      }
      
      .button.btn-icon {
        background: var(--background-primary);
        border: none;
        outline: 0;
        color: var(--background-primary);
      }
      
      .button.borderless {
        border: 0;
        background: transparent;
        color: var(--text-primary);
        padding: 0;
        outline: 0;
      }
      
      .button.underlined {
        border: 0;
        background: transparent;
        text-decoration: underline;
        color: var(--text-primary);
        padding: 0;
        outline: 0;
      }
      
      .button.underlined:hover,
      .button.borderless:hover {
        color: var(--color-primary);
      }
      
      input[type='range'] {
        cursor: pointer;
        width: 100%;
        height: 0.5rem;
        padding: 0;
        border: none;
        border-radius: 0.2rem;
        outline: 0;
      
        -webkit-appearance: none;
        -moz-appearance: none;
      }
      
      input[type='range']::-webkit-slider-thumb {
        height: 1.6rem;
        width: 1.6rem;
        border-radius: 5rem;
        background: var(--color-primary);
      
        -webkit-appearance: none;
        -moz-appearance: none;
      }
      
      .on-error {
        color: var(--status-inactive) !important;
        padding: 0.5rem 0;
      }
      
      .on-success {
        color: var(--status-active) !important;
      }
      
      label.input-radio {
        margin: 1rem 0;
        display: none;
        position: relative;
        cursor: pointer;
        padding-left: 2.5rem;
      
        color: var(--background-primary);
        font-size: 1.2rem;
      }
      
      label.input-radio input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
      }
      
      label.input-radio .check-mark,
      label.input-checkbox .check-mark {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        height: 2rem;
        width: 2rem;
        border: 0.1rem solid var(--color-secondary-shadow);
        background: var(--background-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      label.input-radio app-icon,
      label.input-checkbox app-icon {
        display: none;
      }
      
      label.input-radio .check-mark:after,
      label.input-checkbox .check-mark:after {
        color: var(--background-primary);
      
        display: none;
      }
      
      label.input-radio input:checked ~ .check-mark,
      label.input-checkbox input:checked ~ .check-mark {
        background-color: var(--color-primary);
        border: none;
      }
      
      label.input-radio input:checked ~ .check-mark app-icon,
      label.input-checkbox input:checked ~ .check-mark app-icon {
        display: inline-flex;
      }
      
      label.input-radio input:checked ~ .check-mark:after,
      label.input-checkbox input:checked ~ .check-mark:after {
        display: block;
      }
      
      .loader-instance-backdrop {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.3);
      
        display: none;
        align-items: center;
        justify-content: center;
      
        z-index: 80;
      }
      
      .loader-instance-backdrop.show {
        display: flex !important;
      }
      
      .loader-instance-backdrop.show-recall {
        display: flex;
        border: 2px solid var(--status-inactive);
        backdrop-filter: blur(0.11rem);
        background: rgba(255, 255, 255, 0.3);
      }
      
      .rounded-question-mark {
        position: relative;
      
        width: 1.2rem;
        height: 1.2rem;
      
        margin-left: 0.6rem;
      
        display: flex;
        align-items: center;
        justify-content: center;
      
        font-size: 1rem;
        border-radius: 50%;
        border: 0.1rem solid var(--color-secondary-dark);
        color: var(--background-containers);
        background: var(--color-secondary-dark);
      }
      
      .tool-tip::before {
        display: block;
        position: absolute;
        content: attr(tool-tip);
        white-space: pre-line;
        transform: translateY(30%);
        left: calc(50% + 1.5rem);
        z-index: 3;
      
        background: var(--color-primary-dark);
        color: var(--background-containers);
        box-shadow: 0 0.1rem 0.5rem 0 var(--color-primary-shadow);
        padding: 1rem;
      
        width: max-content;
        max-width: 16rem;
      
        font-size: 1rem;
        word-break: break-word;
      
        visibility: hidden;
        opacity: 0;
      
        transition: opacity 200ms ease, visibility 200ms ease;
      }
      
      .tool-tip[orientation='top']::before {
        transform: translateY(-30%);
      }
      
      .tool-tip::after {
        display: block;
        position: absolute;
        content: '';
      
        top: 0.2rem;
        left: calc(50% + 1.2rem);
      
        width: 0.6rem;
        height: 0.6rem;
      
        transform: rotate(45deg);
        background: var(--color-primary-dark);
      
        visibility: hidden;
        opacity: 0;
      
        transition: opacity 200ms ease, visibility 200ms ease;
      }
      
      .tool-tip:hover::before,
      .tool-tip:hover::after {
        opacity: 1;
        visibility: visible;
      }
      
      .scrollbar::-webkit-scrollbar-thumb {
        background: var(--color-secondary);
        border-radius: 0.4rem;
      }
      
      .scrollbar.vertical::-webkit-scrollbar {
        width: 0.4rem;
      }
      
      .scrollbar.horizontal::-webkit-scrollbar {
        height: 0.4rem;
      }
      
      .helper-text {
        display: block;
        cursor: pointer;
      
        color: var(--text-primary);
      
        font-size: 1.2rem;
        text-decoration: underline;
      }
      
      /* #region SCROLLABLE */
      .scrollable-vertical {
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .scrollable-horizontal {
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      .scrollable,
      .scrollable-vertical.scrollable-horizontal {
        overflow: auto;
      }
      
      .scrollable,
      .scrollable-vertical,
      .scrollable-horizontal {
        --scrollbar-size: 0.4rem;
      }
      
      .scrollable::-webkit-scrollbar,
      .scrollable-vertical::-webkit-scrollbar,
      .scrollable-horizontal::-webkit-scrollbar {
        width: var(--scrollbar-size);
        height: var(--scrollbar-size);
      }
      
      .scrollable::-webkit-scrollbar-thumb,
      .scrollable-vertical::-webkit-scrollbar-thumb,
      .scrollable-horizontal::-webkit-scrollbar-thumb {
        background: var(--color-secondary);
        border-radius: var(--scrollbar-size);
      }
      /* #endregion */
      
      :root {
        --fontFamily-primary: 'Raleway', sans-serif;
        --fontFamily-secondary: 'Roboto', sans-serif;
      
        --color-primary: #550073;
        --color-primary-dark: #312636;
        --color-primary-shadow: #3b3041;
        --color-secondary: #7a7a7a;
        --color-secondary-dark: #323232;
        --color-secondary-lighten: #f5f5f5;
        --color-secondary-shadow: #e9e9e9;
      
        --background-primary: #ffffff;
        --background-containers: var(--color-secondary-lighten);
        --background-hover: var(--color-secondary-shadow);
      
        --text-primary: #000000;
        --text-secondary: var(--color-secondary);
      
        --border-primary: var(--color-secondary-shadow);
        --border-hover: var(--color-secondary);
        --border-divider: var(--color-primary);
      
        --status-active: #33c15d;
        --status-on-hold: #febd01;
        --status-inactive: #f4282d;
      }
      
  `;
  container.appendChild(style);
}
