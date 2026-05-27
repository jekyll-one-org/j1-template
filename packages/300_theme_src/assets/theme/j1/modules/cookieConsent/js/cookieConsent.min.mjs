/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/cookieConsent/js/cookieConsent.min.mjs
 # Provides JS Core for J1 Module BS Cookie Consent
 # Version 1.0.2
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2026 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

"use strict";
import{LitElement,html,nothing}from"https://cdn.jsdelivr.net/npm/lit@3/+esm";
import{unsafeHTML}from"https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm";
const Cookie={set(t,e,i,o,s,n){const a=window.btoa(e);let c="; expires=Thu, 01 Jan 1970 00:00:00 UTC";
if(i>0){const t=new Date;t.setTime(t.getTime()+24*i*60*60*1e3),c="; expires="+t.toUTCString()}const l=[t+"="+(a||""),c,"Path=/","SameSite="+o];s&&l.push("Domain="+s),n&&l.push("Secure="+n),document.cookie=l.join("; ")+";"},get(t){const e=t+"=",i=document.cookie.split(";");for(let t=0;t<i.length;t++){let o=i[t];for(;" "===o.charAt(0);)o=o.substring(1);if(0===o.indexOf(e)){const t=o.substring(e.length);try{return window.atob(t)}catch(t){return}}}}};function executeFunctionByName(t,e,i){if(!t)return;const o=t.split("."),s=o.pop();for(let t=0;t<o.length;t++)if(!(e=e[o[t]]))return;return void 0===i||Array.isArray(i)||(i=[i]),"function"==typeof e[s]?e[s].apply(e,i):void 0}class J1CookieConsent extends LitElement{createRenderRoot(){return this}static properties={content:{type:Object},cookieName:{type:String},cookieStorageDays:{type:Number},cookieSameSite:{type:String},cookieDomain:{type:String},cookieSecure:{type:Boolean},autoShowDialog:{type:Boolean},whitelisted:{type:Array},postSelectionCallback:{type:String},_open:{state:!0},_detailed:{state:!0},_showPrivacy:{state:!0},_options:{state:!0}};constructor(){super(),this.content=null,this.cookieName="j1.user.consent",this.cookieStorageDays=365,this.cookieSameSite="Strict",this.cookieDomain="",this.cookieSecure=window.location.protocol.includes("https"),this.autoShowDialog=!0,this.whitelisted=[],this.postSelectionCallback="",this._open=!1,this._detailed=!1,this._showPrivacy=!1,this._options={necessary:!0,analysis:!0,personalization:!0},this._dataChanged=null}connectedCallback(){super.connectedCallback();const t=this.getSettings();t&&"object"==typeof t&&(this._options={...this._options,...t,necessary:!0});const e=(this.whitelisted||[]).indexOf(window.location.pathname)>-1,i=Cookie.get(this.cookieName);void 0!==i&&"false"!==i||!this.autoShowDialog||e||(this._open=!0)}updated(t){t.has("_open")&&this._syncBodyClasses(this._open)}disconnectedCallback(){super.disconnectedCallback(),this._syncBodyClasses(!1)}_syncBodyClasses(t){const e=document.body;e&&(t?e.classList.add("modal-open","stop-scrolling"):e.classList.remove("modal-open","stop-scrolling"))}static _fallbackConfig(){return{title:"Cookie Consent",bodyText:"This site uses cookies. Please review your settings.",privacyNotice:"No privacy notice available.",labels:{privacyNotice:"Privacy Notice",mySettings:"My Settings",necessary:"Necessary",necessaryDesc:["Required to run the website"],analysis:"Analysis",analysisDesc:[],personalization:"Personalization",personalizationDesc:[],buttonDoNotAgree:"I Do not Agree",buttonShowPrivacyNotice:"Show Privacy Notice",buttonHidePrivacyNotice:"Hide Privacy Notice",buttonShowSettings:"Show Settings",buttonHideSettings:"Hide Settings",buttonAgree:"I Agree",buttonSave:"Save selection",buttonAgreeAll:"Agree on all",close:"Close"}}}
render(){if(!this._open)return nothing;const t=this.content||J1CookieConsent._fallbackConfig(),e=t.labels||{};return html`
      <div class="modal-backdrop fade show"
           @click=${this._onBackdropClick}></div>

      <div class="modal fade show"
           style="display: block;"
           tabindex="-1"
           role="dialog"
           aria-modal="true"
           aria-labelledby="bccs-title">
        <div class="modal-dialog modal-frame modal-top modal-notify modal-primary"
             role="document">
          <div class="modal-content">

            <div class="modal-header">
              <p id="bccs-title" class="lead">${t.title}</p>
              <button type="button"
                      class="btn-close"
                      aria-label=${e.close||"Close"}
                      @click=${this._onClose}></button>
            </div>

            <div class="modal-body mt-4">
              <div class="bccs-body-text r-text-300 mb-3">
                ${unsafeHTML(t.bodyText||"")}
              </div>

              ${this._showPrivacy?html`
                <div id="bccs-privacy">
                  <p class="tagline mt-4 mb-1"><b>${e.privacyNotice||"Privacy Notice"}</b></p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  <div class="bccs-body-text r-text-200">
                    ${unsafeHTML(t.privacyNotice||"")}
                  </div>
                </div>
              `:nothing}

              ${this._detailed?html`
                <div id="bccs-options">
                  <p class="tagline mt-4 mb-1"><b>${e.mySettings||"My Settings"}</b></p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  ${this._renderOption("necessary",e.necessary||"Necessary",e.necessaryDesc,!0)}
                  ${this._renderOption("analysis",e.analysis||"Analysis",e.analysisDesc,!1)}
                  ${this._renderOption("personalization",e.personalization||"Personalization",e.personalizationDesc,!1)}
                </div>
              `:nothing}
            </div>

            <div class="modal-footer">
              ${this._detailed?this._renderDetailedButtons(e):this._renderDefaultButtons(e)}
            </div>

          </div>
        </div>
      </div>
    `}
    _renderDefaultButtons(t){const e=this._showPrivacy?t.buttonHidePrivacyNotice||"Hide Privacy Notice":t.buttonShowPrivacyNotice||"Show Privacy Notice",i=this._detailed?t.buttonHideSettings||"Hide Settings":t.buttonShowSettings||"Show Settings";return html`
      <button type="button"
              class="btn btn-danger mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onDoNotAgree}>${t.buttonDoNotAgree||"I Do not Agree"}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._showPrivacy?"true":"false"}
              @click=${this._togglePrivacy}>${e}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._detailed?"true":"false"}
              @click=${this._toggleOptions}>${i}</button>
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onAgree}>${t.buttonAgree||"I Agree"}</button>
    `}
    _renderDetailedButtons(t){const e=this._detailed?t.buttonHideSettings||"Hide Settings":t.buttonShowSettings||"Show Settings";return html`
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._detailed?"true":"false"}
              @click=${this._toggleOptions}>${e}</button>
      <button type="button"
              class="btn btn-warning mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onSave}>${t.buttonSave||"Save selection"}</button>
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onAgreeAll}>${t.buttonAgreeAll||"Agree on all"}</button>
    `}
    _renderOption(t,e,i,o){return html`
      <div class="bccs-option" data-name=${t}>
        <div class="switch">
          <label>
            <input type="checkbox"
                   name="bccs-checkbox-${t}"
                   ?checked=${this._options[t]}
                   ?disabled=${o}
                   @change=${e=>this._onOptionToggle(t,e.target.checked)}>
            ${e}
            <span class="bmd-switch-track"></span>
          </label>
          <ul>
            ${(i||[]).map((t,e)=>html`
              <li class=${0===e?"mt-2":nothing}
                  style="list-style-type: none;">${t}</li>
            `)}
          </ul>
        </div>
      </div>
    `}
    _onOptionToggle(t,e){"necessary"!==t&&(this._options={...this._options,[t]:e})}_togglePrivacy(t){t.preventDefault(),this._showPrivacy=!this._showPrivacy}_toggleOptions(t){t.preventDefault(),this._showPrivacy=!1,this._detailed=!this._detailed}_onClose(){this._close()}_onBackdropClick(){}_onAgree(){this._dataChanged=!0,this._options={necessary:!0,analysis:!0,personalization:!0},this._persist(this.cookieStorageDays),this._close()}_onAgreeAll(){this._dataChanged=!0,this._options={necessary:!0,analysis:!0,personalization:!0},this._persist(this.cookieStorageDays),this._detailed=!1,this._close()}_onSave(){this._dataChanged=!0,this._persist(this.cookieStorageDays),this._detailed=!1,this._close()}_onDoNotAgree(){this._dataChanged=!0,this._options={necessary:!0,analysis:!1,personalization:!1},this._persist(0),this._close(),window.location.href="/445.html"}_persist(t){Cookie.set(this.cookieName,JSON.stringify(this._options),t,this.cookieSameSite,this.cookieDomain,this.cookieSecure)}_close(){this._open=!1,executeFunctionByName(this.postSelectionCallback,window,{dataChanged:this._dataChanged})}showDialog(){(this.whitelisted||[]).indexOf(window.location.pathname)>-1||(this._open=!0)}getSettings(t){const e=Cookie.get(this.cookieName);if(!e)return;let i;try{i=JSON.parse(e)}catch(t){return}return void 0===t?i:!!i&&i[t]}}customElements.define("j1-cookie-consent",J1CookieConsent);export function CookieConsent(t){let e=document.querySelector("j1-cookie-consent");const i=!e;i&&(e=document.createElement("j1-cookie-consent"));for(const i in t||{})Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);i&&document.body.appendChild(e),this.showDialog=()=>e.showDialog(),this.getSettings=t=>e.getSettings(t)}"undefined"!=typeof window&&(window.CookieConsent=CookieConsent);
