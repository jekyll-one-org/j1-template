/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.mjs
 # Provides JS Core for J1 Module BS Translator
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
const Cookie={set(t,e,n,a,s,i){const o=window.btoa(e);let l="; expires=Thu, 01 Jan 1970 00:00:00 UTC";if(n>0){const t=new Date;t.setTime(t.getTime()+24*n*60*60*1e3),l="; expires="+t.toUTCString()}const r=[t+"="+(o||""),l,"Path=/","SameSite="+a];s&&r.push("Domain="+s),i&&r.push("Secure="+i),document.cookie=r.join("; ")+";"},get(t){const e=t+"=",n=document.cookie.split(";");for(let t=0;t<n.length;t++){let a=n[t];for(;" "===a.charAt(0);)a=a.substring(1);if(0===a.indexOf(e)){const t=a.substring(e.length);try{return window.atob(t)}catch(t){return}}}}};function executeFunctionByName(t,e,n){if(!t)return;const a=t.split("."),s=a.pop();for(let t=0;t<a.length;t++)if(!(e=e[a[t]]))return;return void 0===n||Array.isArray(n)||(n=[n]),"function"==typeof e[s]?e[s].apply(e,n):void 0}class J1Translator extends LitElement{createRenderRoot(){return this}static properties={content:{type:Object},translatorName:{type:String},cookieConsentName:{type:String},cookieStorageDays:{type:Number},cookieSameSite:{type:String},cookieDomain:{type:String},cookieSecure:{type:Boolean},translatorLocalStorageKey:{type:String},translatorLanguagesFile:{type:String},translatorLanguagesElement:{type:String},translationLanguages:{type:Array},defaultLanguage:{type:String},siteLanguage:{type:String},disableLanguageSelector:{type:Boolean},whitelisted:{type:Array},postSelectionCallback:{type:String},_open:{state:!0},_detailed:{state:!0},_showPrivacy:{state:!0},_settings:{state:!0},_languages:{state:!0}};constructor(){super(),this.content=null,this.translatorName="google",this.cookieConsentName="j1.user.consent",this.cookieStorageDays=365,this.cookieSameSite="Strict",this.cookieDomain="",this.cookieSecure=window.location.protocol.includes("https"),this.translatorLocalStorageKey="user_translate",this.translatorLanguagesFile="/assets/data/iso-639-language-codes-flags.json",this.translatorLanguagesElement="translator-languages",this.translationLanguages=["en","de","es","fr","it"],this.defaultLanguage="en",this.siteLanguage="",this.disableLanguageSelector=!1,this.whitelisted=[],this.postSelectionCallback="",this._open=!1,this._detailed=!1,this._showPrivacy=!1,this._settings=J1Translator._defaultSettings(),this._languages=[],this._cbAction="none",this._msDropdown=null}static _defaultSettings(){return{translatorName:"google",translationEnabled:!1,translateAllPages:!0,useLanguageFromBrowser:!0,translationLanguage:"de",analysis:!0,personalization:!0}}connectedCallback(){super.connectedCallback();const t=this._readLocalStorage();t&&"object"==typeof t?this._settings={...this._settings,...t}:this._writeLocalStorage(this._settings),this._loadLanguages()}updated(t){t.has("_open")&&(this._syncBodyClasses(this._open),this._open||this._destroyMsDropdown()),this._open&&(t.has("_open")||t.has("_languages"))&&queueMicrotask(()=>this._initMsDropdown())}disconnectedCallback(){super.disconnectedCallback(),this._syncBodyClasses(!1),this._destroyMsDropdown()}_syncBodyClasses(t){const e=document.body;e&&(t?e.classList.add("modal-open","stop-scrolling"):e.classList.remove("modal-open","stop-scrolling"))}async _loadLanguages(){try{const t=await fetch(this.translatorLanguagesFile);if(!t.ok)throw new Error("HTTP "+t.status);const e=(await t.json())[this.translatorLanguagesElement]||[],n=this.translationLanguages||[];this._languages=n.includes("all")?e:e.filter(t=>n.includes(t.value))}catch(t){this._languages=[{value:this.defaultLanguage,text:this.defaultLanguage}],console.warn("[j1-translator] failed to load language list:",t)}}_readLocalStorage(){try{const t=localStorage.getItem(this.translatorLocalStorageKey);return t?JSON.parse(t):void 0}catch(t){return}}_writeLocalStorage(t){try{localStorage.setItem(this.translatorLocalStorageKey,JSON.stringify(t))}catch(t){}}static _fallbackConfig(){return{title:"Google Translator",bodyText:"This website uses Google Translate to translate its content.",privacyNotice:"No privacy notice available.",languageSelectorTitle:"Current language",labels:{mySettings:"My Settings",privacyNotice:"Privacy Notice",analysis:"Analysis",analysisDesc:["Usage monitoring for this site"],personalization:"Personalization",personalizationDesc:["Storage of personal preferences"],buttonDisableTranslation:"Don't translate",buttonTranslate:"Translate",buttonSave:"Save settings",buttonShowPrivacyNotice:"Show Privacy Notice",buttonHidePrivacyNotice:"Hide Privacy Notice",buttonShowSettings:"Show Settings",buttonHideSettings:"Hide Settings",close:"Close"}}}render(){if(!this._open)return nothing;const t=this.content||J1Translator._fallbackConfig(),e=t.labels||{};return html`
<div class="modal-backdrop fade show" @click=${this._onBackdropClick}></div>
<div class="modal fade show"
      style="display: block;"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="j1tr-title">
  <div class="modal-dialog modal-frame modal-top modal-notify modal-primary"
        role="document">
    <div class="modal-content">

      <div class="modal-header">
        <p id="j1tr-title" class="lead">${t.title}</p>
        <button type="button"
                class="btn-close"
                aria-label=${e.close||"Close"}
                @click=${this._onClose}></button>
      </div>

      <div class="modal-body mt-4">
        <div class="j1tr-body-text r-text-300">
          ${unsafeHTML(t.bodyText||"")}
        </div>

        <p class="tagline mt-4 mb-1">
          <b>${t.languageSelectorTitle||"Current language"}</b>
        </p>
        <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
        <div class="j1tr-language-selector mb-3">
          <div id="dropdownJSON"
                class="ms-dropdown notranslate"
                style="width: 400px;"></div>
        </div>

        ${this._showPrivacy?html`
          <div id="j1tr-privacy">
            <p class="tagline mt-4 mb-1">
              <b>${e.privacyNotice||"Privacy Notice"}</b>
            </p>
            <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
            <div class="j1tr-body-text r-text-200">
              ${unsafeHTML(t.privacyNotice||"")}
            </div>
          </div>
        `:nothing}

        ${this._detailed?html`
          <div id="j1tr-options">
            <p class="tagline mt-4 mb-1">
              <b>${e.mySettings||"My Settings"}</b>
            </p>
            <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
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
_renderDefaultButtons(t){const e=this._showPrivacy?t.buttonHidePrivacyNotice||"Hide Privacy Notice":t.buttonShowPrivacyNotice||"Show Privacy Notice",n=this._detailed?t.buttonHideSettings||"Hide Settings":t.buttonShowSettings||"Show Settings";return html`
<button type="button"
        class="btn btn-danger mb-1 mr-2"
        style="min-width: 20rem"
        @click=${this._onDisableTranslation}>${t.buttonDisableTranslation||"Don't translate"}</button>
<button type="button"
        class="btn btn-info mb-1 mr-2"
        style="min-width: 20rem"
        aria-expanded=${this._showPrivacy?"true":"false"}
        @click=${this._togglePrivacy}>${e}</button>
<button type="button"
        class="btn btn-info mb-1 mr-2"
        style="min-width: 20rem"
        aria-expanded=${this._detailed?"true":"false"}
        @click=${this._toggleOptions}>${n}</button>
<button type="button"
        class="btn btn-success mb-1 mr-2"
        style="min-width: 20rem"
        @click=${this._onTranslate}>${t.buttonTranslate||"Translate"}</button>
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
        @click=${this._onSave}>${t.buttonSave||"Save settings"}</button>
`}
_renderOption(t,e,n,a){return html`
<div class="translator-option" data-name=${t}>
  <div class="switch">
    <label>
      <input type="checkbox"
              name="j1tr-checkbox-${t}"
              ?checked=${this._settings[t]}
              ?disabled=${a}
              @change=${e=>this._onOptionToggle(t,e.target.checked)}>
      ${e}
      <span class="bmd-switch-track"></span>
    </label>
    <ul>
      ${(n||[]).map((t,e)=>html`
        <li class=${0===e?"mt-2":nothing}
            style="list-style-type: none;">${t}</li>
      `)}
    </ul>
  </div>
</div>
`}
_onOptionToggle(t,e){this._settings={...this._settings,[t]:e}}_onLanguageChange(t){this._settings={...this._settings,translationLanguage:t.target.value}}_onLanguageChangeMS(t){const e=t&&t.data&&t.data.value||t&&t.option&&t.option.value||this._msDropdown&&this._msDropdown.value;null!=e&&(this._settings={...this._settings,translationLanguage:e})}_resolveSelectedLanguage(){let t=this._settings.translationLanguage;if("auto"===t){t=(navigator.language||navigator.userLanguage||this.defaultLanguage).split("-")[0]}return t}_initMsDropdown(){if(this._msDropdown)return;if(!this._open)return;if(!this._languages||!this._languages.length)return;const t=this.querySelector("#dropdownJSON");if(!t)return;if("undefined"==typeof window||"function"!=typeof window.MsDropdown)return console.warn("[j1-translator] window.MsDropdown not available — language selector will fall back to a native <select>. Ensure msDropdown.js is loaded before translator.mjs."),void this._renderFallbackSelect(t);for(;t.firstChild;)t.removeChild(t.firstChild);const e=this._resolveSelectedLanguage(),n=this._languages;let a=n.findIndex(t=>t.value===e);a<0&&(a=0);try{if(this._msDropdown=new window.MsDropdown(t,{byJson:{data:n,selectedIndex:a,width:400},visibleRows:8,on:{change:t=>this._onLanguageChangeMS(t)}}),this.disableLanguageSelector)try{this._msDropdown.disabled=!0}catch(e){t.classList.add("disabled")}}catch(e){console.warn("[j1-translator] failed to initialise MsDropdown:",e),this._msDropdown=null,this._renderFallbackSelect(t)}}_destroyMsDropdown(){this._msDropdown=null}_renderFallbackSelect(t){for(;t.firstChild;)t.removeChild(t.firstChild);const e=document.createElement("select");e.id="j1tr-language",e.className="form-control",e.disabled=!!this.disableLanguageSelector;const n=this._resolveSelectedLanguage();for(const t of this._languages||[]){const a=document.createElement("option");a.value=t.value,a.textContent=t.text||t.value,t.value===n&&(a.selected=!0),e.appendChild(a)}e.addEventListener("change",t=>this._onLanguageChange(t)),t.appendChild(e)}_togglePrivacy(t){t.preventDefault(),this._showPrivacy=!this._showPrivacy}_toggleOptions(t){t.preventDefault(),this._showPrivacy=!1,this._detailed=!this._detailed}_onClose(){this._cbAction="exitOnly",this._close()}_onBackdropClick(){}_onExit(){this._cbAction="exitOnly",this._close()}_onTranslate(){const t=this._resolveSelectedLanguage(),e=this._resolveCurrentLanguage();if(t&&t===e)return this._cbAction="exitOnly",void this._close();const n={...this._settings,analysis:!0,personalization:!0,translationEnabled:!0};this._settings=n,this._writeLocalStorage(n),this._syncConsentCookie(n),this._cbAction="process",this._close()}_onDisableTranslation(){const t=new URL(window.location.href).hostname,e=t.substring(t.lastIndexOf(".",t.lastIndexOf(".")-1)+1);["",t,"."+e].forEach(t=>{const e="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/";document.cookie=t?e+"; Domain="+t:e});const n=this._resolveResetLanguage(),a={...this._settings,translationEnabled:!1,translationLanguage:n};this._settings=a,this._writeLocalStorage(a),this._syncMsDropdownSelection(n),window.location.reload()}_resolveResetLanguage(){return this.siteLanguage||this.defaultLanguage||"en"}_resolveCurrentLanguage(){const t=this._readLocalStorage();if(t&&t.translationEnabled&&t.translationLanguage){let e=t.translationLanguage;if("auto"===e){e=(navigator.language||navigator.userLanguage||this.defaultLanguage||"").split("-")[0]}return e}return this.siteLanguage||this.defaultLanguage||"en"}_syncMsDropdownSelection(t){if(this._msDropdown&&null!=t)try{this._msDropdown.value=t}catch(e){const n=this.querySelector("#dropdownJSON select");n&&(n.value=t)}}_onSave(){this._writeLocalStorage(this._settings),this._syncConsentCookie(this._settings),this._cbAction="process",this._detailed=!1,this._close()}_syncConsentCookie(t){const e=Cookie.get(this.cookieConsentName);if(!e)return;let n;try{n=JSON.parse(e)}catch(t){return}n.analysis=t.analysis,n.personalization=t.personalization,Cookie.set(this.cookieConsentName,JSON.stringify(n),this.cookieStorageDays,this.cookieSameSite,this.cookieDomain,this.cookieSecure)}_close(){this._open=!1,executeFunctionByName(this.postSelectionCallback,window,this._cbAction),this._cbAction="none"}showDialog(){(this.whitelisted||[]).indexOf(window.location.pathname)>-1||(this._open=!0)}getSettings(t){const e=this._readLocalStorage();if(e)return void 0===t?e:void 0!==e[t]&&e[t]}}customElements.define("j1-translator",J1Translator);export function Translator(t){let e=document.querySelector("j1-translator");const n=!e;n&&(e=document.createElement("j1-translator"));for(const n in t||{})Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);n&&document.body.appendChild(e),this.showDialog=()=>e.showDialog(),this.getSettings=t=>e.getSettings(t)}"undefined"!=typeof window&&(window.Translator=Translator);
