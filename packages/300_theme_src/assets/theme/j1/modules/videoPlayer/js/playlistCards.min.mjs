/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videoPlayer/js/playlistCards.min.mjs
 # Drop-in Lit web component for J1 Module videoPlayer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

import{LitElement,html,nothing}from"https://cdn.jsdelivr.net/npm/lit@3/+esm";
import{repeat}from"https://cdn.jsdelivr.net/npm/lit@3/directives/repeat.js/+esm";
import{classMap}from"https://cdn.jsdelivr.net/npm/lit@3/directives/class-map.js/+esm";

const DEFAULT_POSTER="/assets/image/icon/videojs/videojs-poster.png",YOUTUBE_POSTER_QUALITY="hqdefault",YOUTUBE_ID_RE=/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/,CARDS_PER_ROW_CSS_VAR="--playlist-cards-per-row",CARDS_PER_ROW_MIN=1,CARDS_PER_ROW_MAX=6;export class PlaylistCards extends LitElement{createRenderRoot(){return this}static properties={entries:{attribute:!1},activeVideoId:{attribute:!1},cardsPerRow:{attribute:!1},showRateButton:{attribute:!1},showEditButton:{attribute:!1},showDeleteButton:{attribute:!1}};constructor(){super(),this.entries=[],this.activeVideoId=null,this.cardsPerRow=null,this.showRateButton=!0,this.showEditButton=!0,this.showDeleteButton=!0,this._uiFlagsObserver=null}connectedCallback(){super.connectedCallback(),this.style.display="contents",this._applyCardsPerRow(),this._applyUiElementFlags(),this._observeUiElementFlags()}disconnectedCallback(){super.disconnectedCallback(),this._uiFlagsObserver&&(this._uiFlagsObserver.disconnect(),this._uiFlagsObserver=null)}_observeUiElementFlags(){const t=this.closest('[id^="videoplayer_playlist_parent_"]');t&&"undefined"!=typeof MutationObserver&&(this._uiFlagsObserver&&this._uiFlagsObserver.disconnect(),this._uiFlagsObserver=new MutationObserver(()=>this._applyUiElementFlags()),this._uiFlagsObserver.observe(t,{attributes:!0,attributeFilter:["data-playlist-rate-button","data-playlist-edit-button","data-playlist-delete-button"]}))}_applyUiElementFlags(){const t=this.closest('[id^="videoplayer_playlist_parent_"]');if(!t||!t.dataset)return;const e=t.dataset;void 0!==e.playlistRateButton&&(this.showRateButton="false"!==e.playlistRateButton),void 0!==e.playlistEditButton&&(this.showEditButton="false"!==e.playlistEditButton),void 0!==e.playlistDeleteButton&&(this.showDeleteButton="false"!==e.playlistDeleteButton)}updated(t){super.updated(t),t.has("cardsPerRow")&&this._applyCardsPerRow()}_applyCardsPerRow(){const t=this.parentElement;if(!t||null===this.cardsPerRow||void 0===this.cardsPerRow)return;const e=parseInt(this.cardsPerRow,10);if(!Number.isFinite(e)||e<1)return t.style.removeProperty(CARDS_PER_ROW_CSS_VAR),void t.style.removeProperty("grid-template-columns");const i=Math.min(e,6);t.style.setProperty(CARDS_PER_ROW_CSS_VAR,String(i)),t.style.gridTemplateColumns=`repeat(${i}, 1fr)`}_formatDuration(t){if(!t||t<=0)return"";const e=Math.floor(t/3600),i=Math.floor(t%3600/60),s=Math.floor(t%60);return e>0?`${e}:${String(i).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${i}:${String(s).padStart(2,"0")}`}_getTimeAgo(t){const e=Date.now()-t.getTime(),i=Math.floor(e/6e4),s=Math.floor(e/36e5),a=Math.floor(e/864e5),l=Math.floor(a/7),r=Math.floor(a/30);return i<1?"Just now":i<60?`${i} minute${i>1?"s":""} ago`:s<24?`${s} hour${s>1?"s":""} ago`:a<7?`${a} day${a>1?"s":""} ago`:l<5?`${l} week${l>1?"s":""} ago`:`${r} month${r>1?"s":""} ago`}_resolvedPoster(t){if(t.poster&&t.poster!==DEFAULT_POSTER)return t.poster;let e=null;if(t.videoId&&/^[A-Za-z0-9_-]{11}$/.test(t.videoId)&&(e=t.videoId),!e){const i=(t.url||t.source||"").match(YOUTUBE_ID_RE);i&&(e=i[1])}return e?`https://img.youtube.com/vi/${e}/hqdefault.jpg`:DEFAULT_POSTER}_isValidUrl(t){if(!t||"string"!=typeof t)return!1;try{const e=new URL(t);return"http:"===e.protocol||"https:"===e.protocol}catch(t){return!1}}_onPlayClick(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("playlist-play",{bubbles:!0,composed:!1,detail:{videoId:e}}))}_onDeleteClick(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("playlist-delete",{bubbles:!0,composed:!1,detail:{videoId:e}}))}_cardTemplate(t){const e=this._formatDuration(t.duration),i=t.author&&t.author.trim().length>0,s=this._getTimeAgo(new Date(t.watchDate)),a=Number(t.rating)||0,l=a>0,r=this._isValidUrl(t.infoLink),o={"playlist-btn":!0,rate:!0,rated:l},n=!!this.activeVideoId&&t.videoId===this.activeVideoId,d=!1!==this.showRateButton,h=!1!==this.showEditButton,p=!1!==this.showDeleteButton,c=d||h||p;return html`

  <div class="playlist-card card-base"
        data-item-active="${n?"true":"false"}"
        data-video-id=${t.videoId}>

    <div class="playlist-thumb-wrapper">
      <img class="playlist-thumb"
            src=${this._resolvedPoster(t)}
            alt="playlist-thumb">
      <div class="playlist-play-overlay"
            @click=${e=>this._onPlayClick(e,t.videoId)}>
        <i class="fas fa-play"></i>
      </div>
      ${e?html`<div class="playlist-duration">${e}</div>`:nothing}
      ${l?html`
            <div class="playlist-rating">
              ${Array.from({length:a},()=>html`<i class="fas fa-star"></i>`)}
            </div>`:nothing}
    </div>

    <div class="playlist-info">
      <div class="playlist-title">
        ${t.title}
        ${r?html`
              <a class="playlist-info-link"
                  href=${t.infoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="More info">
                <i class="fas fa-info-circle"></i>
              </a>`:nothing}
      </div>

      ${i?html`<div class="playlist-author">${t.author}</div>`:nothing}

      <div class="playlist-time-info">${s}</div>

      ${c?html`

      <div class="playlist-card-actions">
        ${d?html`
        <button class=${classMap(o)}
                title=${"Set rating"+(l?` (${a}/5)`:"")}
                aria-label="Set rating">
          <i class="fas fa-star"></i>
        </button>
        `:nothing}
        ${h?html`
        <button class="playlist-btn edit"
                title="Edit item"
                aria-label="Edit item">
          <i class="fas fa-edit"></i>
        </button>
        `:nothing}
        ${p?html`

        <button class="playlist-btn delete"
                title="Delete from playlist"
                aria-label="Delete from playlist"
                @click=${e=>this._onDeleteClick(e,t.videoId)}>
          <i class="fas fa-trash"></i>
        </button>
        `:nothing}
      </div>
      `:nothing}
    </div>
  </div>
`}

render(){const t=Array.isArray(this.entries)?this.entries:[];return html`${repeat(t,t=>t.videoId,t=>this._cardTemplate(t))}`}}customElements.define("playlist-cards",PlaylistCards);
