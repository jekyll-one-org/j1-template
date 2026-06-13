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

const DEFAULT_POSTER="/assets/image/icon/videojs/videojs-poster.png",YOUTUBE_POSTER_QUALITY="hqdefault",YOUTUBE_ID_RE=/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/;
export class PlaylistCards extends LitElement{createRenderRoot(){return this}static properties={entries:{attribute:!1}};
constructor(){super(),this.entries=[]}connectedCallback(){super.connectedCallback(),this.style.display="contents"}_formatDuration(t){if(!t||t<=0)return"";const e=Math.floor(t/3600),i=Math.floor(t%3600/60),a=Math.floor(t%60);return e>0?`${e}:${String(i).padStart(2,"0")}:${String(a).padStart(2,"0")}`:`${i}:${String(a).padStart(2,"0")}`}_getTimeAgo(t){const e=Date.now()-t.getTime(),i=Math.floor(e/6e4),a=Math.floor(e/36e5),s=Math.floor(e/864e5),l=Math.floor(s/7),o=Math.floor(s/30);return i<1?"Just now":i<60?`${i} minute${i>1?"s":""} ago`:a<24?`${a} hour${a>1?"s":""} ago`:s<7?`${s} day${s>1?"s":""} ago`:l<5?`${l} week${l>1?"s":""} ago`:`${o} month${o>1?"s":""} ago`}_resolvedPoster(t){if(t.poster&&t.poster!==DEFAULT_POSTER)return t.poster;let e=null;if(t.videoId&&/^[A-Za-z0-9_-]{11}$/.test(t.videoId)&&(e=t.videoId),!e){const i=(t.url||t.source||"").match(YOUTUBE_ID_RE);i&&(e=i[1])}return e?`https://img.youtube.com/vi/${e}/hqdefault.jpg`:DEFAULT_POSTER}_isValidUrl(t){if(!t||"string"!=typeof t)return!1;try{const e=new URL(t);return"http:"===e.protocol||"https:"===e.protocol}catch(t){return!1}}_onPlayClick(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("playlist-play",{bubbles:!0,composed:!1,detail:{videoId:e}}))}_onDeleteClick(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("playlist-delete",{bubbles:!0,composed:!1,detail:{videoId:e}}))}_cardTemplate(t){const e=this._formatDuration(t.duration),i=t.author&&t.author.trim().length>0,a=this._getTimeAgo(new Date(t.watchDate)),s=Number(t.rating)||0,l=s>0,o=this._isValidUrl(t.infoLink),r={"playlist-btn":!0,rate:!0,rated:l};return html`
<div class="playlist-card card-base" data-video-id=${t.videoId}>
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
            ${Array.from({length:s},()=>html`<i class="fas fa-star"></i>`)}
          </div>`:nothing}
  </div>
  <div class="playlist-info">
    <div class="playlist-title">
      ${t.title}
      ${o?html`
            <a class="playlist-info-link"
                href=${t.infoLink}
                target="_blank"
                rel="noopener noreferrer"
                title="More info">
              <i class="fas fa-info-circle"></i>
            </a>`:nothing}
    </div>
    ${i?html`<div class="playlist-author">${t.author}</div>`:nothing}
    <div class="playlist-time-info">${a}</div>
    <div class="playlist-card-actions">
      <button class=${classMap(r)}
              title=${"Set rating"+(l?` (${s}/5)`:"")}
              aria-label="Set rating">
        <i class="fas fa-star"></i>
      </button>
      <button class="playlist-btn edit"
              title="Edit item"
              aria-label="Edit item">
        <i class="fas fa-edit"></i>
      </button>
      <button class="playlist-btn delete"
              title="Delete from playlist"
              aria-label="Delete from playlist"
              @click=${e=>this._onDeleteClick(e,t.videoId)}>
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</div>
`}render(){const t=Array.isArray(this.entries)?this.entries:[];
return html`${repeat(t,t=>t.videoId,t=>this._cardTemplate(t))}`}}
customElements.define("playlist-cards",PlaylistCards);
