import type {
  AllowedQualities,
  EmbedOptions,
  Logger as LoggerType,
  PublicApi,
  MediaData,
  PublicApiOptions,
  PlayerState,
  Players,
  WistiaLocalStorage,
} from '../types/e-v1-player-api-types.d.ts';
import type {
  EmailChangeEventData,
  PlayerColorChangeEventData,
} from '../types/custom-event-data.js';
import type { DynamicImportOptions } from '../utilities/dynamicImport.ts';
import { dynamicImport } from '../utilities/dynamicImport.ts';
import { elemWidth } from '../utilities/elem.js';
import { setEmbedOptionStore } from '../utilities/embedOptionStore.ts';
import { extractEmailFromParams } from '../utilities/extractEmailFromParams.ts';
import { inferPageUrl } from '../utilities/inferPageUrl.ts';
import {
  getWistiaLocalStorage,
  updateWistiaLocalStorage,
} from '../utilities/wistiaLocalStorage.js';
import { sanePlayerColor } from '../utilities/sane-player-color.js';
import { wlog } from '../utilities/wlog.js';

// The component will not run without these attributes.
const requiredAttributes = ['media-id'];

// Optional attributes surfaced in documentation to our customers.
const optionalPublicAttributes = [
  'aspect',
  'autoplay',
  'big-play-button',
  'disable-fullscreen-on-rotate-to-landscape',
  'do-not-track',
  'email',
  'end-video-behavior',
  'fullscreen-control',
  'hide-controls-on-load',
  'hide-copy-link-and-thumbnail',
  'muted',
  'playback-rate-control',
  'play-bar-control',
  'player-color',
  'playlist-links',
  'playlist-loop',
  'play-pause-control',
  'play-pause-notifier',
  'poster',
  'preload',
  'quality-control',
  'quality-max',
  'quality-min',
  'resumable',
  'seo',
  'settings-control',
  'silent-autoplay',
  'transparent-letterbox',
  'volume',
  'volume-control',
];

// Optional attributes used by Wistia developers.
const optionalPrivateAttributes = [
  'big-play-button-border-radius',
  'control-bar-border-radius',
  'embed-host',
  'page-url',
  'player-border-radius',
  'player-force',
  'rounded-player',
  'stats-url',
  'use-web-component',
];

const defaultEmbedOptions = {
  autoplay: false,
  bigPlayButton: true,
  bigPlayButtonBorderRadius: 0,
  controlBarBorderRadius: 0,
  fullscreenControl: true,
  hideControlsOnLoad: false,
  hideCopyLinkAndThumbnail: false,
  playBarControl: true,
  playerBorderRadius: 0,
  playerColor: '636155',
  playPauseControl: true,
  playPauseNotifier: true,
  playbackRateControl: true,
  qualityControl: true,
  roundedPlayer: 0,
  seo: true,
  settingsControl: true,
  silentAutoplay: false,
  state: 'beforeplay' as PlayerState,
  transparentLetterbox: false,
  volumeControl: true,
};

export class WistiaPlayer extends HTMLElement {
  public plugin: object | null;

  private readonly _logger: LoggerType;

  // can be null when doing document.createElement and referencing an attribute/property
  // before being injected into the dom
  #_api: PublicApi | null;

  #hasElementConnectedToDOM = false;

  #mediaDataServerJson: MediaData = {};

  /**
   * Represents one embedded Wistia media player.
   * @constructor
   */
  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Set up a prefixed logger
    this._logger = (wlog as unknown as LoggerType).getPrefixedFunctions(
      'WistiaPlayer',
    ) as LoggerType;
  }

  // --------------------------------------------------
  // Public properties
  // --------------------------------------------------

  /**
   * Return an array of the attributes that we want to observe for changes.
   * If one of these attributes changes, the attributeChangedCallback will be called.
   * @returns {string[]}
   */
  public static get observedAttributes(): string[] {
    return [...requiredAttributes, ...optionalPublicAttributes, ...optionalPrivateAttributes];
  }

  /**
   * Returns the public api instance.
   * TODO: Not sure if we want to expose this.
   * @returns {PublicApi | null}
   */
  public get api(): PublicApi | null {
    return this.#_api;
  }

  /**
   * Returns the aspect ratio (width / height) of the originally uploaded video or given aspect ratio.
   * @returns {number}
   * @see https://wistia.com/support/developers/player-api#aspect
   */
  public get aspect(): number {
    // Attributes set on wistia-player override all other options
    if (this.hasAttribute('aspect')) {
      return Number(this.getAttribute('aspect'));
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?.aspect() ?? this.offsetWidth / this.offsetHeight;
  }

  /**
   * Sets the aspect ratio (width / height) of the video.
   * @returns {void}
   */
  public set aspect(newAspect: number) {
    this.setAttribute('aspect', newAspect.toString());
    if (this.api) {
      this.api._attrs.aspect = newAspect;
      // By re-setting width to the same value, we trigger the aspect ratio to be recalculated.
      this.api.width(elemWidth(this) as number, { constrain: true });
    }
  }

  /**
   * Returns if the player should attempt to autoplay as soon as it's ready.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#autoplay
   */
  public get autoplay(): boolean {
    return this.#isAttributePresentOrTrue('autoplay');
  }

  /**
   * Sets the attribute to enable/disable autoplay.
   * @param {boolean} shouldSetAutoplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#autoplay
   */
  public set autoplay(shouldSetAutoplay: boolean) {
    if (shouldSetAutoplay) {
      this.setAttribute('autoplay', '');
    } else {
      this.removeAttribute('autoplay');
    }
  }

  /**
   * If set to true, the big play button control will appear in the center of the video before play.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#playbutton
   */
  public get bigPlayButton(): boolean {
    // Attributes set on wistia-player override all other options
    if (this.hasAttribute('big-play-button')) {
      return this.getAttribute('big-play-button') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.bigPlayButton ?? defaultEmbedOptions.bigPlayButton;
  }

  /**
   * If set to true, the big play button control will appear in the center of the video before play.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#playbutton
   */
  public set bigPlayButton(shouldDisplay: boolean) {
    this.setAttribute('big-play-button', shouldDisplay.toString());
    this.api?._impl.bigPlayButtonEnabled(shouldDisplay);
  }

  public get bigPlayButtonBorderRadius(): number {
    return this.api?._attrs.bigPlayButtonBorderRadius ?? 0;
  }

  public set bigPlayButtonBorderRadius(radius: number) {
    this.api?._impl.setBigPlayButtonBorderRadius(Number(radius));
  }

  /**
   * Returns a new static normalized TimeRanges object that represents the ranges of the media resource,
   * if any, that the user agent has buffered at the moment the buffered property is accessed.
   * @returns {TimeRanges}
   */
  public get buffered(): TimeRanges {
    return this.api?._impl.getStandardBuffered() ?? ({} as TimeRanges);
  }

  public get controlBarBorderRadius(): number {
    return this.api?._attrs.controlBarBorderRadius ?? 0;
  }

  public set controlBarBorderRadius(radius: number) {
    this.api?._impl.setControlBarBorderRadius(Number(radius));
  }

  /**
   * Returns the current time of the video as a decimal in seconds.
   * @returns {number}
   * @see https://wistia.com/support/developers/player-api#time
   */
  public get currentTime(): number {
    return this.api?.time() ?? 0;
  }

  /**
   * Sets the current time of the video as a decimal in seconds.
   * @param {number} shouldSetAutoplay
   * @returns {void}
   * @see https://wistia.com/support/developers/player-api#time
   */
  public set currentTime(newTime: number) {
    this.#_api?.time(newTime);
  }

  /**
   * If set to true, the video will not automatically go to true fullscreen on a mobile device.
   * The player will rotate, and the viewer can still click on the fullscreen option after rotating.
   * @returns {boolean}
   */
  public get disableFullscreenOnRotateToLandscape(): boolean {
    return this.#isAttributePresentOrTrue('disable-fullscreen-on-rotate-to-landscape');
  }

  /**
   * If set to true, the video will not automatically go to true fullscreen on a mobile device.
   * The player will rotate, and the viewer can still click on the fullscreen option after rotating.
   * @param {boolean} shouldDisable
   * @returns {void}
   */
  public set disableFullscreenOnRotateToLandscape(shouldDisable: boolean) {
    this.setAttribute('disable-fullscreen-on-rotate-to-landscape', shouldDisable.toString());

    if (this.api) {
      this.api._attrs.fullscreenOnRotateToLandscape = !shouldDisable;
    }
  }

  /**
   * return the status of the do not track embed option that controls whether the player
   * sends tracking pings.
   * @returns {boolean}
   */
  public get doNotTrack(): boolean {
    return this.#isAttributePresentOrTrue('do-not-track');
  }

  /**
   * When present the player will not send tracking events for stats.
   * Note that this must be set at the time of embed to have any impact
   */
  public set doNotTrack(dontTrack: boolean) {
    this.setAttribute('do-not-track', dontTrack.toString());

    if (this.api) {
      this.api._attrs.doNotTrack = dontTrack;
    }
  }

  /**
   * Returns the duration of the video in seconds.
   * @returns {number}
   */
  public get duration(): number {
    return this.api?._impl.duration() ?? 0;
  }

  /**
   * Returns the email associated with this viewing session.
   * If no email is associated, it will return undefined.
   * NOTE: This attribute will impact the entire page and is not scoped to the player.
   * @returns {string | undefined}
   */
  public get email(): string | undefined {
    return (
      this.getAttribute('email') ??
      extractEmailFromParams(this.#pageUrl) ??
      ((getWistiaLocalStorage() as WistiaLocalStorage)[this.#pageUrl]?.trackEmail as
        | string
        | undefined) ??
      undefined
    );
  }

  /**
   * Associates the view of this media with the given email value.
   * This email will appear in stats for the video.
   * NOTE: This attribute will impact the entire page and is not scoped to the player.
   * @param {string} newEmail
   * @returns {void}
   */
  public set email(newEmail: string) {
    if (this.email === newEmail) {
      return;
    }

    this.setAttribute('email', newEmail);
    this.#updateEmail(newEmail);
  }

  /**
   * Returns the overridding embed host for the player.
   * Internal use only.
   * @returns {string}
   */
  public get embedHost(): string {
    return this.getAttribute('embed-host') ?? '';
  }

  /**
   * Sets the overridding embed host for the player.
   * Internal use only.
   * @param {string} newEmbedHost
   * @returns {void}
   */
  public set embedHost(newEmbedHost: string) {
    this.setAttribute('embed-host', newEmbedHost);
  }

  /**
   * Returns whether the video has ended playback.
   * @returns {boolean}
   */
  public get ended(): boolean {
    return this.api?.state() === 'ended';
  }

  /**
   * @returns { string } returns the current end video behavior value
   */
  public get endVideoBehavior(): string {
    const value = this.getAttribute('end-video-behavior') ?? 'default';

    if (['default', 'loop', 'reset'].includes(value)) {
      return value;
    }

    return 'default';
  }

  /**
   * @param {'default' | 'loop' | 'reset'} behavior set the behavior for what the video should
   * do when it ends.
   * @returns {void}
   */
  public set endVideoBehavior(behavior: 'default' | 'loop' | 'reset') {
    // loop is a slightly odd option, as it's set as an attribute directly on the
    // underlying <video /> element. So we must do more than just change the api._attrs
    // for it to be updated.
    if (behavior === 'loop') {
      this.api?._impl.addLoopBehavior();
    } else {
      this.api?._impl.removeLoopBehavior();
    }

    this.setAttribute('end-video-behavior', behavior.toString());

    if (this.api) {
      this.api._attrs.endVideoBehavior = behavior;
    }
  }

  public get eventKey(): string | undefined {
    return this.api?._impl.eventKey();
  }

  /**
   * If set to true, the fullscreen button control will appear in the control bar.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#fullscreenbutton
   */
  public get fullscreenControl(): boolean {
    if (this.hasAttribute('fullscreen-control')) {
      return this.getAttribute('fullscreen-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.fullscreenControl ?? defaultEmbedOptions.fullscreenControl;
  }

  /**
   * enable or disable the fullscreen button control in the control bar.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#fullscreenbutton
   */
  public set fullscreenControl(shouldDisplay: boolean) {
    this.setAttribute('fullscreen-control', shouldDisplay.toString());
    this.api?._impl.fullscreenControlEnabled(shouldDisplay);
  }

  /**
   * returns whether or not to hide the controls on load
   * @returns {boolean}
   */
  public get hideControlsOnLoad(): boolean {
    if (this.hasAttribute('hide-controls-on-load')) {
      return this.getAttribute('hide-controls-on-load') !== 'false';
    }

    return !this.api?._attrs.controlsVisibleOnLoad;
  }

  /**
   * enable or disable the control on load.
   * @param {boolean} shouldHide
   * @returns {void}
   */
  public set hideControlsOnLoad(shouldHide: boolean) {
    this.setAttribute('hide-controls-on-load', shouldHide.toString());

    if (this.api) {
      this.api._attrs.controlsVisibleOnLoad = !shouldHide;
      this.api._impl.renderUI();
    }
  }

  /**
   * returns whether or the copy link and thumbnail option from the context menu
   * is available.
   * @returns {boolean}
   */
  public get hideCopyLinkAndThumbnail(): boolean {
    if (this.hasAttribute('hide-copy-link-and-thumbnail')) {
      return this.getAttribute('hide-copy-link-and-thumbnail') !== 'false';
    }

    return !this.api?._attrs.copyLinkAndThumbnailEnabled;
  }

  /**
   * enable or disable the copy link and thumbnail option from the context menu.
   * @param {boolean} shouldHide
   * @returns {void}
   */
  public set hideCopyLinkAndThumbnail(shouldHide: boolean) {
    const prevVal = this.getAttribute('hide-copy-link-and-thumbnail');

    if (this.api) {
      this.api._attrs.copyLinkAndThumbnailEnabled = !shouldHide;
    }

    if (prevVal !== shouldHide.toString()) {
      this.dispatchEvent(
        new CustomEvent('hide-copy-link-and-thumbnail-change', {
          detail: { copyLinkAndThumbnailEnabled: !shouldHide },
        }),
      );
    }

    this.setAttribute('hide-copy-link-and-thumbnail', shouldHide.toString());
  }

  /**
   * Returns whether the video is currently in fullscreen
   * @returns {boolean}
   */
  public get inFullscreen(): boolean {
    return this.api?._impl.inFullscreen() ?? false;
  }

  /**
   * Returns the hashed id of the media.
   * @returns {string}
   */
  public get mediaId(): string {
    return this.getAttribute('media-id') ?? '';
  }

  /**
   * Replaces the content of the current video with the video identified by the given mediaId.
   * @param {string} newMediaId
   * @returns {void}
   */
  public set mediaId(newMediaId: string) {
    const prevMediaId = this.mediaId;
    this.setAttribute('media-id', newMediaId);

    if (prevMediaId !== newMediaId) {
      this.api?.replaceWith(newMediaId);
    }
  }

  /**
   * Returns if player is currently muted
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#muted
   */
  public get muted(): boolean {
    if (this.hasAttribute('muted')) {
      return this.getAttribute('muted') !== 'false';
    }

    return Boolean(this.#_api?._impl.isMuted());
  }

  /**
   * Change player muted state
   * @param {boolean} val
   * @see https://wistia.com/support/developers/embed-options#muted
   */
  public set muted(val: boolean) {
    if (val) {
      void this.#_api?._impl.mute();
      this.setAttribute('muted', '');
    } else {
      void this.#_api?._impl.unmute();
      this.removeAttribute('muted');
    }
  }

  /**
   * Returns the name of the media as it is in the Wistia application.
   * Returns undefined until media data is loaded.
   * @returns {string | undefined}
   */
  public get name(): string | undefined {
    return this.#mediaDataServerJson.name ?? this.api?._mediaData?.name ?? undefined;
  }

  /**
   * Returns a boolean that indicates whether the video is paused.
   * @returns {boolean}
   */
  public get paused(): boolean {
    return this.api?.state() === 'paused';
  }

  /**
   * Returns the percent of the video that has been watched as a decimal between 0 and 1.
   * @returns {number}
   */
  public get percentWatched(): number {
    return this.api?.percentWatched() ?? 0;
  }

  /**
   * Returns the playback rate of the video.
   * @returns {number}
   */
  public get playbackRate(): number {
    return this.api?._impl.playbackRate() ?? 1;
  }

  /**
   * Set the playback rate of the video.
   * @param {number} rate
   * @returns {void}
   */
  public set playbackRate(rate: number) {
    this.api?._impl.playbackRate(rate);
  }

  /**
   * If set to true, the playback rate control will appear in the setting control.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#playbackratecontrol
   */
  public get playbackRateControl(): boolean {
    if (this.hasAttribute('playback-rate-control')) {
      return this.getAttribute('playback-rate-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.playbackRateControl ?? defaultEmbedOptions.playbackRateControl;
  }

  /**
   * enable or disable the playback rate control in the settings control.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#playbackratecontrol
   */
  public set playbackRateControl(shouldDisplay: boolean) {
    this.setAttribute('playback-rate-control', shouldDisplay.toString());
    this.api?._impl.playbackRateControlEnabled(shouldDisplay);
  }

  /**
   * If set to true, the playbar - which includes the playhead, current time, and scrubbing functionality - will be available.
   * @returns {boolean}
   */
  public get playBarControl(): boolean {
    if (this.hasAttribute('play-bar-control')) {
      return this.getAttribute('play-bar-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.playBarControl ?? defaultEmbedOptions.playBarControl;
  }

  /**
   * If set to true, the playbar - which includes the playhead, current time, and scrubbing functionality - will be available.
   * @param {boolean} shouldDisplay
   * @returns {void}
   */
  public set playBarControl(shouldDisplay: boolean) {
    this.setAttribute('play-bar-control', shouldDisplay.toString());
    this.api?._impl.playbarControlEnabled(shouldDisplay);
  }

  public get playerBorderRadius(): number {
    return this.api?._attrs.playerBorderRadius ?? 0;
  }

  public set playerBorderRadius(radius: number) {
    this.api?._impl.setPlayerBorderRadius(Number(radius));
  }

  /**
   * Returns the base color of the player.
   * @returns {string}
   * @see https://wistia.com/support/developers/embed-options#playercolor
   */
  public get playerColor(): string {
    return this.getAttribute('player-color') ?? defaultEmbedOptions.playerColor;
  }

  /**
   * Changes the base color of the player.
   * Expects a hexadecimal rgb string like “ff0000” (red), “000000” (black), “ffffff” (white), or “0000ff” (blue).
   * @param {string} newColor
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#playercolor
   */
  public set playerColor(newColor: string) {
    this._logger.info('set playerColor', newColor);
    const prevPlayerColor = this.playerColor;
    const finalHexColor = sanePlayerColor(newColor) as string;
    this.setAttribute('player-color', finalHexColor);

    if (prevPlayerColor !== finalHexColor) {
      this.dispatchEvent(
        new CustomEvent<PlayerColorChangeEventData>('playercolorchange', {
          detail: { color: finalHexColor, prevColor: prevPlayerColor },
        }),
      );
    }
  }

  /**
   * Returns the overridding player.
   * Internal use only.
   * @returns {Players | undefined}
   */
  public get playerForce(): Players | undefined {
    return (this.getAttribute('player-force') as Players | null) ?? undefined;
  }

  /**
   * Sets the overridding player.
   * Internal use only.
   * @param {string} newPlayer
   * @returns {void}
   */
  public set playerForce(newPlayer: Players) {
    this.setAttribute('player-force', newPlayer);
  }

  /**
   * Returns the strategy for associating specially crafted links on a page with a video, turning them into a playlist.
   * auto: For each video on the page, look for links after the video, until we come to another Wistia video.
   * manual: Given each link element, look at its ’container' option to determine which video it should connect to.
   * "container": For all embed links in a container whose id matches this given string, connect them to this specific video.
   * @returns {'auto' | 'manual' | string}
   * @see https://wistia.com/support/developers/embed-links#advanced-embed-links-targeting
   */
  public get playlistLinks(): string {
    return this.getAttribute('playlist-links') ?? '';
  }

  /**
   * Sets the strategy for associating specially crafted links on a page with a video, turning them into a playlist.
   * @param {'auto' | 'manual' | string} newStrategy
   */
  public set playlistLinks(newStrategy: string) {
    this.setAttribute('playlist-links', newStrategy.toString());

    if (this.api) {
      this.api._attrs.playlistLinks = newStrategy;
    }
  }

  /**
   * When present or set to true and this video has a playlist, it will loop back to
   * the first video and replay it once the last video has finished.
   * @returns {boolean}
   */
  public get playlistLoop(): boolean {
    return this.#isAttributePresentOrTrue('playlist-loop');
  }

  /**
   * When present or set to true and this video has a playlist, it will loop back to
   * the first video and replay it once the last video has finished.
   */
  public set playlistLoop(shouldLoop: boolean) {
    this.setAttribute('playlist-loop', shouldLoop.toString());

    if (this.api) {
      this.api._attrs.playlistLoop = shouldLoop;
    }
  }

  /**
   * If set to true, the small play button control will be available.
   * @returns {boolean}
   */
  public get playPauseControl(): boolean {
    if (this.hasAttribute('play-pause-control')) {
      return this.getAttribute('play-pause-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.playPauseControl ?? defaultEmbedOptions.playPauseControl;
  }

  /**
   * If set to true, the small play button control will be available.
   * @param {boolean} shouldDisplay
   * @returns {void}
   */
  public set playPauseControl(shouldDisplay: boolean) {
    this.setAttribute('play-pause-control', shouldDisplay.toString());
    this.api?._impl.playPauseControlEnabled(shouldDisplay);
  }

  /**
   * By default, pausing a video will display a brief animation of the pause symbol
   * and resuming the video will display an animation of the play symbol.
   * Setting this embed option to false will remove those animations.
   * @returns {boolean}
   */
  public get playPauseNotifier(): boolean {
    if (this.hasAttribute('play-pause-notifier')) {
      return this.getAttribute('play-pause-notifier') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.playPauseNotifier ?? defaultEmbedOptions.playPauseNotifier;
  }

  /**
   * By default, pausing a video will display a brief animation of the pause symbol
   * and resuming the video will display an animation of the play symbol.
   * Setting this embed option to false will remove those animations.
   * @param {boolean} shouldDisplay
   * @returns {void}
   */
  public set playPauseNotifier(shouldDisplay: boolean) {
    this.setAttribute('play-pause-notifier', shouldDisplay.toString());
    this.api?._impl.playPauseNotifierEnabled(shouldDisplay);
  }

  /**
   * Overrides the thumbnail image that appears before the video plays.
   * Expects an absolute URL to an image.
   * @returns {string}
   */
  public get poster(): string {
    return this.getAttribute('poster') ?? this.api?._attrs.poster ?? '';
  }

  /**
   * Overrides the thumbnail image that appears before the video plays.
   * Expects an absolute URL to an image.
   * @param {string} newUrl
   * @returns {void}
   */
  public set poster(newUrl: string) {
    const prevUrl = this.poster;
    this.setAttribute('poster', newUrl);
    if (this.api) {
      this.api._attrs.poster = newUrl;
    }

    if (prevUrl !== newUrl) {
      this.dispatchEvent(new CustomEvent('thumbnailchange'));
    }
  }

  /**
   * Returns the preload setting for the player.
   * @returns {string | undefined}
   * @see https://wistia.com/support/developers/embed-options#preload
   * undefined is allowed as a return type because there may be situations
   * where the player and/or engine has not loaded and we don't know what
   * preload setting will be used
   */
  public get preload(): string | undefined {
    const value = this.getAttribute('preload') ?? '';

    if (['auto', 'metadata', 'none'].includes(value)) {
      return value;
    }

    return this.api?._impl.preloadValue();
  }

  /**
   * sets the preload value for the player. Note that changing this option
   * after player initialization has no impact.
   * @param {'auto'| 'metadata' | 'none'} preloadValue
   * @returns {void}
   * @see https://wistia.com/support/developers/player-api#preload
   */
  public set preload(preloadValue: 'auto' | 'metadata' | 'none') {
    if (this.api) {
      this.api._attrs.preload = preloadValue;
    }

    this.setAttribute('preload', preloadValue.toString());
  }

  /**
   * If set to true, the quality control will appear in the setting control.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#qualitycontrol
   */
  public get qualityControl(): boolean {
    if (this.hasAttribute('quality-control')) {
      return this.getAttribute('quality-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.qualityControl ?? defaultEmbedOptions.qualityControl;
  }

  /**
   * enable or disable the quality control in the settings control.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#qualitycontrol
   */
  public set qualityControl(shouldDisplay: boolean) {
    this.setAttribute('quality-control', shouldDisplay.toString());
    this.api?._impl.qualityControlEnabled(shouldDisplay);
  }

  /**
   * Return the max quality allowed for the 'Auto' asset in HLS playback
   * @returns {number}
   * @see https://wistia.com/support/developers/embed-options#qualityMax
   */
  public get qualityMax(): number | undefined {
    if (this.hasAttribute('quality-max')) {
      return Number(this.getAttribute('quality-max'));
    }

    // If no attribute is set, get the value straight from the api.
    return this.api?._attrs.qualityMax;
  }

  /**
   * Set the max quality to be used for "Auto" in the HLS stream.
   * @param {number} quality
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#qualityMax
   */
  public set qualityMax(quality: AllowedQualities) {
    this.setAttribute('quality-max', quality.toString());

    if (this.api) {
      this.api._attrs.qualityMax = quality;
      this.api._impl.qualityMax(quality);
    }
  }

  /**
   * Return the min quality allowed for the 'Auto' asset in HLS playback
   * @returns {number}
   * @see https://wistia.com/support/developers/embed-options#qualityMin
   */
  public get qualityMin(): number | undefined {
    if (this.hasAttribute('quality-min')) {
      return Number(this.getAttribute('quality-min'));
    }

    // If no attribute is set, get the value straight from the api.
    return this.api?._attrs.qualityMin;
  }

  /**
   * Set the min quality to be used for "Auto" in the HLS stream.
   * @param {number} quality
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#qualityMin
   */
  public set qualityMin(quality: AllowedQualities) {
    this.setAttribute('quality-min', quality.toString());

    if (this.api) {
      this.api._attrs.qualityMin = quality;
      this.api._impl.qualityMin(quality);
    }
  }

  /**
   * Returns the readyState of the inner video HTML element.
   * @returns {number}
   */
  public get readyState(): number {
    return this.api?._impl.getReadyState() ?? 0;
  }

  /* Returns the current state of the video.
   * Returns the current resumable status of the video.
   * @returns {'auto' | boolean}
   * @see https://wistia.com/support/developers/embed-options#resumable
   */
  public get resumable(): boolean | string {
    const attr = this.getAttribute('resumable');
    if (attr === 'true') {
      return true;
    }

    if (attr === 'false') {
      return false;
    }

    // If not set explicitly, then we're 'auto' for resumable - which may or may not actually resume
    return 'auto';
  }

  /**
   * set the resumable state of the video to 'auto' | true | false.
   * note that this can be changed 'beforeplay', however changing the
   * value after play will have no effect
   * @param {'auto' | boolean} resumableState
   * @see https://wistia.com/support/developers/embed-options#resumable
   */
  public set resumable(resumableState: boolean | 'auto') {
    this.setAttribute('resumable', resumableState.toString());

    if (this.api) {
      this.api._impl.setResumable(resumableState);
    }
  }

  public get roundedPlayer(): number {
    return this.api?._attrs.roundedPlayer ?? 0;
  }

  public set roundedPlayer(radius: number) {
    this.api?._impl.setRoundedPlayer(Number(radius));
  }

  /**
   * Returns the number of unique seconds that have been watched for the video.
   * This does not include seconds that have been skipped by seeking.
   * @returns {number}
   */
  public get secondsWatched(): number {
    return this.api?._impl.secondsWatched() ?? 0;
  }

  /**
   * Returns an array where each index represents the number of times the viewer has watched each second of the video.
   * @returns {number[]}
   */
  public get secondsWatchedVector(): number[] {
    return this.api?._impl.secondsWatchedVector() ?? [];
  }

  /* Returns whether JSON+LD seo data will be injected.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#seo
   */
  public get seo(): boolean {
    if (this.hasAttribute('seo')) {
      return this.getAttribute('seo') !== 'false';
    }

    // If no attribute is set, get the value straight from the api or use the default
    return this.api?._attrs.seo ?? defaultEmbedOptions.seo;
  }

  /**
   * Set whether JSON+LD seo data will be injected.
   * Note that changing this value after embed has no impact as JSON+LD needs
   * to be injected as soon as possible.
   * @param {boolean} val
   * @see https://wistia.com/support/developers/embed-options#seo
   */
  public set seo(val: boolean) {
    this.setAttribute('seo', val.toString());

    if (this.api) {
      this.api._attrs.seo = val;
    }
  }

  /**
   * If set to true, the settings control will appear in the control bar.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#settingscontrol
   */
  public get settingsControl(): boolean {
    if (this.hasAttribute('settings-control')) {
      return this.getAttribute('settings-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.settingsControl ?? defaultEmbedOptions.settingsControl;
  }

  /**
   * enable or disable the settings control in the control bar.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#settingscontrol
   */
  public set settingsControl(shouldDisplay: boolean) {
    this.setAttribute('settings-control', shouldDisplay.toString());
    this.api?._impl.settingsControlEnabled(shouldDisplay);
  }

  /**
   * This option allows videos to autoplay in a muted state in contexts where normal autoplay
   * is blocked or not supported (e.g. iOS, Safari 11+, Chrome 66+).
   * allow: The video will default to normal autoplay, with silent autoplay as a fallback if needed.
   * false: The video will not autoplay silently.
   * true: The video will default to autoplaying silently.
   * @returns {boolean | 'allow'}
   */
  public get silentAutoplay(): boolean | 'allow' {
    switch (this.getAttribute('silent-autoplay')) {
      case 'allow':
        return 'allow';
      case 'false':
        return false;
      case 'true':
        return true;
      default:
        return this.api?._attrs.silentAutoplay ?? defaultEmbedOptions.silentAutoplay;
    }
  }

  /**
   * This option allows videos to autoplay in a muted state in contexts where normal autoplay
   * is blocked or not supported (e.g. iOS, Safari 11+, Chrome 66+).
   * @param {boolean | 'allow'} silentAutoplayValue
   * @returns {void}
   */
  public set silentAutoplay(silentAutoplayValue: boolean | 'allow') {
    if (this.api) {
      this.api._attrs.silentAutoplay = silentAutoplayValue;
    }

    this.setAttribute('silent-autoplay', silentAutoplayValue.toString());
  }

  /**
   * Returns the current state of the video.
   * @returns {PlayerState}
   * @see https://wistia.com/support/developers/player-api#state
   */
  public get state(): PlayerState {
    return this.api?.state() ?? defaultEmbedOptions.state;
  }

  /**
   * Returns the current state of the video.
   * @returns {string | null}
   */
  public get statsUrl(): string | null {
    if (this.hasAttribute('stats-url')) {
      return this.getAttribute('stat-url');
    }

    return this.api?._attrs.statsUrl ?? null;
  }

  public set statsUrl(url: string) {
    this.setAttribute('stats-url', url);

    if (this.api) {
      this.api._attrs.statsUrl = url;
    }
  }

  /**
   * If present, the background behind the video player will be transparent
   * allowing the page color to show through instead of black.
   * @returns {boolean}
   */
  public get transparentLetterbox(): boolean {
    return this.#isAttributePresentOrTrue('transparent-letterbox');
  }

  /**
   * Sets the letterbox to be transparent or not.
   * @param {boolean} shouldSetTransparentLetterbox
   * @returns {void}
   */
  public set transparentLetterbox(shouldSetTransparentLetterbox: boolean) {
    if (shouldSetTransparentLetterbox) {
      this.setAttribute('transparent-letterbox', '');
    } else {
      this.removeAttribute('transparent-letterbox');
    }

    if (this.api) {
      this.api._attrs.transparentLetterbox = shouldSetTransparentLetterbox;
    }
  }

  /**
   * @returns {boolean} the value for the `use-web-component` attribute or property
   */
  public get useWebComponent(): boolean {
    const val = this.getAttribute('use-web-component');

    return val === 'true';
  }

  /**
   * @param {boolean} val Value for the `use-web-component` attribute or property
   */
  public set useWebComponent(val: boolean) {
    if (val) {
      this.setAttribute('use-web-component', String(val));
    } else {
      this.removeAttribute('use-web-component');
    }
  }

  public get videoQuality(): number | 'auto' {
    if (this.api) {
      return this.api._impl.getVideoQuality();
    }

    return 'auto';
  }

  public set videoQuality(quality: number | 'auto') {
    this.api?._impl.setVideoQuality(quality);
  }

  /**
   * get the current volume set on the player
   * @returns {number}
   * @see https://wistia.com/support/developers/embed-options#volume
   */
  public get volume(): number {
    if (this.hasAttribute('volume')) {
      const vol = this.getAttribute('volume');
      if (vol !== null) {
        return Number(vol);
      }
      return 1;
    }

    return this.api?._attrs.volume ?? 1;
  }

  /**
   * get the current volume set on the player
   * @param {number} level - a Number from 0 - 1
   * @see https://wistia.com/support/developers/embed-options#volume
   */
  public set volume(level: number) {
    this.setAttribute('volume', level.toString());
    this.api?._impl.volume(level);
  }

  /**
   * If set to true, the volume control will appear in the control bar.
   * Note that on mobile, we never show a volume control, as the device
   * volume is used.
   * @returns {boolean}
   * @see https://wistia.com/support/developers/embed-options#volumecontrol
   */
  public get volumeControl(): boolean {
    if (this.hasAttribute('volume-control')) {
      return this.getAttribute('volume-control') !== 'false';
    }

    // If no attribute is set, get the value straight from the api, or fallback to the default.
    return this.api?._attrs.volumeControl ?? defaultEmbedOptions.volumeControl;
  }

  /**
   * enable or disable the volume control in the control bar.
   * @param {boolean} shouldDisplay
   * @returns {void}
   * @see https://wistia.com/support/developers/embed-options#volumecontrol
   */
  public set volumeControl(shouldDisplay: boolean) {
    this.setAttribute('volume-control', shouldDisplay.toString());
    this.api?._impl.volumeControlEnabled(shouldDisplay);
  }

  /**
   * @returns {MediaData} object containing the final mediaData object that will be given to the PublicApi
   */
  get #mediaDataConfig(): MediaData {
    const result = { ...this.#mediaDataServerJson };

    const embedOptionsFromAttributes = { ...this.#getEmbedOptionsFromAttributes() };
    // we want to strip any null/undefined embed options so they don't override
    // anything from the mediaData response :/
    const cleanEmbedOptions = Object.fromEntries(
      Object.entries(embedOptionsFromAttributes).filter(([_k, val]) => !(val === null)),
    );

    result.embedOptions = {
      ...result.embedOptions,
      ...cleanEmbedOptions,
    };

    return result;
  }

  get #pageUrl(): string {
    return this.getAttribute('page-url') ?? inferPageUrl();
  }

  // --------------------------------------------------
  // Public api methods
  // --------------------------------------------------

  /**
   * Adds a media to the playlist.
   * @param {string} mediaId - the id of the media to add
   * @param {object} options - embed options to apply for this media in the playlist
   * @param {object} position - position to add the media in the playlist
   * @returns {Promise<void>}
   */
  public async addToPlaylist(mediaId: string, options: object, position: object): Promise<void> {
    if (this.api) {
      this.api.addToPlaylist(mediaId, options, position);
      return Promise.resolve();
    }

    return Promise.reject(new Error(`Playlist cannot be accessed`));
  }

  /**
   * Attempt to enter fullscreen mode.
   * @returns {Promise<void>}
   * @see https://wistia.com/support/developers/player-api#cancelfullscreen
   */
  public async cancelFullscreen(): Promise<void> {
    return this.api?._impl.cancelFullscreen();
  }

  /**
   * Defines a plugin on the player.
   * @param {string} name name of the plugin to define
   * @param {object} options object of plugin options related to the specific plugin
   * @returns {Promise<void>} returns a Promise that resolves with the defined plugin
   */
  public async definePlugin(name: string, options: object): Promise<void> {
    const addPlugin = async (): Promise<void> => {
      return (
        this.api?.addPlugin(name, options) ??
        Promise.reject(new Error(`plugin ${name} cannot be defined`))
      );
    };

    if (this.api) {
      return addPlugin();
    }

    return new Promise((resolve, reject) => {
      const handler = () => {
        this.removeEventListener('ready', handler);
        addPlugin()
          .then((plugin) => resolve(plugin))
          .catch((err) => {
            reject(err);
          });
      };

      this.addEventListener('ready', handler);
    });
  }

  /**
   * Gets a plugin from the player.
   * @param {string} name name of the plugin to retrieve
   * @returns {Promise<void>} returns a Promise that resolves with the request plugin
   */
  public async getPlugin(name: string): Promise<void> {
    if (this.api) {
      return this.api.plugin(name);
    }

    return Promise.reject(new Error(`plugin ${name} is not yet defined`));
  }

  /**
   * Attempts to load the media data from the server.
   * Public so it can be mocked in tests.
   * @param {number | string} mediaId
   * @param {DynamicImportOptions} options
   * @returns {void}
   */
  public async importMediaData(
    mediaId: number | string,
    options: DynamicImportOptions,
  ): Promise<unknown> {
    return dynamicImport(`embed/${String(mediaId)}.js`, options);
  }

  /**
   * Pauses the video.
   * If this is called and the video’s state is “playing,”
   * it’s expected that it will change to “paused.”
   * @returns {Promise<void>}
   */
  public async pause(): Promise<void> {
    return this.api?._impl.pause();
  }

  /**
   * Plays the video.
   * If this is called, it is expected that the state will change to “playing.”
   * @returns {Promise<void>}
   */
  public async play(): Promise<void> {
    return this.api?._impl.play();
  }

  /**
   * Attempt to enter fullscreen mode.
   * @returns {Promise<void>}
   * @see https://wistia.com/support/developers/player-api#requestfullscreen
   */
  public async requestFullscreen(): Promise<void> {
    return this.api?._impl.requestFullscreen();
  }

  // --------------------------------------------------
  // Custom element lifecycle methods
  // --------------------------------------------------

  /**
   * Called when an observed attribute has been added, removed, updated, or replaced.
   * Also called for initial values when an element is created by the parser, or upgraded.
   * Note: only attributes listed in the observedAttributes property will receive this callback.
   * @param {string} name - The name of the attribute that changed.
   * @param {string} oldValue - The previous value of the attribute, or null if it was added for the first time.
   * @param {string} newValue - The new value of the attribute, or null if it was removed.
   * @returns {void}
   */
  protected attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    // We need this to make sure we don't needlessly call api methods during initial component setup
    if (!this.#hasElementConnectedToDOM) {
      return;
    }

    if (oldValue === newValue) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (oldValue === null && newValue === '') {
      return;
    }

    // Attribute names must match their corresponding property names (kebab-case -> camelCase)
    // So the player-color attribute maps to the playerColor property
    this[this.#kebabToCamelCase(name)] = newValue;
  }

  protected connectedCallback(): void {
    const mediaId = this.getAttribute('media-id');
    if (mediaId == null) {
      throw new Error('media-id attribute is required');
    }

    const options: DynamicImportOptions = {};

    if (this.#getValueFromAttribute('embed-host') !== null) {
      options.host = this.embedHost;
    }

    // if we're coming from a legacy E-v1.js embed, it is likely to already have JSONP on the page.
    // use the old init flow.
    if (this.useWebComponent) {
      const embedOptions = this.#getEmbedOptionsFromAttributes();

      // Create and save the public api instance
      this.#initPublicApi(mediaId, { ...embedOptions, container: this.id });
    } else {
      // Sometimes if an attribute is set on the player, we want to do something immediately
      this.#runMethodsFromAttributes();

      const domOptions = Object.fromEntries(
        Object.entries(this.attributes).map(([, value]) => [
          this.#kebabToCamelCase(value.name),
          value.value,
        ]),
      );
      setEmbedOptionStore(`__${this.id}_dom_options__`, domOptions);

      this.importMediaData(mediaId, options)
        .then((module: PublicApiOptions) => {
          const { mediaData } = module;
          this.#mediaDataServerJson = mediaData;

          // Create and save the public api instance
          this.#initPublicApi(mediaId, {
            mediaData: this.#mediaDataConfig,
          });
        })
        .catch((error: Error) => {
          throw new Error(error.message);
        });
    }

    // Add our responsive embed template to the shadow DOM
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(this.#createEmbedTemplate().content.cloneNode(true));
    }

    this.#hasElementConnectedToDOM = true;
  }

  // --------------------------------------------------
  // Private methods
  // --------------------------------------------------

  /**
   * Creates a template for the embed code
   * @returns {HTMLTemplateElement}
   */
  #createEmbedTemplate(): HTMLTemplateElement {
    const template = document.createElement('template');

    // web components always default to display: inline, which we don't want.
    template.innerHTML = /* html */ `
      <style>
        :host {
          display: block;
        }
      </style>
  `;

    return template;
  }

  /**
   * Gets the embed options from the element's attributes
   * @returns {Record<string, boolean | number | object | string | null>}
   */
  #getEmbedOptionsFromAttributes(): Record<string, boolean | number | object | string | null> {
    return WistiaPlayer.observedAttributes.reduce(
      (acc: Record<string, boolean | number | object | string | null>, attr) => {
        // Automatically convert kebab-case attributes to camelCase embed options
        acc[this.#kebabToCamelCase(attr)] = this.#getValueFromAttribute(attr);

        // Add any additional legacy embed options which don't exist in Aurora
        acc.videoFoam = !(this.style.width || this.style.height);

        return acc;
      },
      {},
    );
  }

  /**
   * Gets the value of an attribute if it exists, returns null if not
   * @param {string} name - Name of the attribute
   * @returns {boolean | string | null}
   */
  #getValueFromAttribute(name: string): boolean | string | null {
    if (this.hasAttribute(name)) {
      // Boolean attributes are set to '' when they are present
      // so we need to convert them to true
      return this.getAttribute(name) === '' ? true : this.getAttribute(name);
    }

    // If no attribute is present, return null instead of an explicit false
    // so our media data config doesn't get overridden
    return null;
  }

  /**
   * Initializes the public api instance and sends a ready event
   * @param {number | string} mediaId - The media id
   * @param {EmbedOptions | PublicApiOptions | undefined} options - The public api options
   * @returns {void}
   */
  #initPublicApi(
    mediaId: number | string,
    options: EmbedOptions | PublicApiOptions | undefined,
  ): void {
    const { Wistia } = window;
    if (!Wistia?.PublicApi) {
      throw new Error('Wistia.PublicApi is not defined');
    }

    this.#_api = new Wistia.PublicApi(mediaId, options) as PublicApi;

    this.api?.ready(() => {
      this.dispatchEvent(new CustomEvent('ready', { detail: { mediaId, api: this.#_api } }));
    });
  }

  /**
   * Checks if an attribute is present and is not set to false
   * @param {string} name - Name of the attribute
   * @returns {boolean}
   */
  #isAttributePresentOrTrue(name: string): boolean {
    return (
      this.#getValueFromAttribute(name) !== 'false' && this.#getValueFromAttribute(name) !== null
    );
  }

  /**
   * Takes a string in kebab-case and converts it to camelCase
   * This is a pretty generic helper function, so it could be moved to a utility file if needed
   * @param {string} kebabString - String in kebab-case
   * @returns {string}
   */
  #kebabToCamelCase(kebabString: string): string {
    return kebabString.replace(/-./g, (word) => word[1].toUpperCase());
  }

  /**
   * Runs any methods associated with set attributes when the element is connected to the DOM
   * @returns {void}
   * @private
   */
  #runMethodsFromAttributes(): void {
    if (this.#getValueFromAttribute('email') !== null) {
      this.#updateEmail(this.#getValueFromAttribute('email') as string);
    }
  }

  /**
   * Saves new email within localstorage and dispatches an emailchange event
   * @param {string} email - The new email
   * @returns {void}
   * @emits {EmailChangeEventData}
   * @private
   */
  #updateEmail(email: string): void {
    updateWistiaLocalStorage((localStorage: WistiaLocalStorage) => {
      const updatedLocalStorage = { ...localStorage };
      updatedLocalStorage[this.#pageUrl] = {
        ...localStorage[this.#pageUrl],
        trackEmail: email,
      };
    });
    this.dispatchEvent(
      new CustomEvent<EmailChangeEventData>('emailchange', {
        detail: { email },
      }),
    );
  }
}

if (customElements.get('wistia-player') === undefined) {
  customElements.define('wistia-player', WistiaPlayer);
}
