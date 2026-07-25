Prompt
   https://claude.ai/chat/e638afd1-993d-4b32-8e34-d66175e1bdf6
--------------------------------------------------------------------------------

Welche Aufgabe und Funktion haben die Slider-Parameter der SwiperJS-API?


Claude
--------------------------------------------------------------------------------

Die SwiperJS-API bietet eine umfangreiche Sammlung von Parametern, mit denen sich nahezu jeder Aspekt eines Sliders konfigurieren lässt. Sie werden als zweites Argument bei der Initialisierung übergeben:

```js
const swiper = new Swiper('.swiper', {
  speed: 400,
  spaceBetween: 100,
});
```

Funktional lassen sich die Parameter in mehrere Gruppen einteilen:

## Layout & Darstellung

Diese Parameter bestimmen, wie viele Slides sichtbar sind und wie sie angeordnet werden:

- `slidesPerView` – Anzahl der gleichzeitig sichtbaren Slides; akzeptiert auch `'auto'`
- `spaceBetween` – Abstand zwischen den Slides in Pixeln
- `direction` – `'horizontal'` oder `'vertical'`
- `slidesPerGroup` – Gruppengröße beim Weiterschieben (sinnvoll bei `slidesPerView > 1`)
- `centeredSlides` – aktive Folie wird zentriert statt linksbündig dargestellt
- `autoHeight` – passt die Höhe des Wrappers automatisch an die aktive Folie an
- `initialSlide` – Index der zu Beginn angezeigten Folie

## Verhalten & Bewegung

- `speed` – Übergangsdauer zwischen Folien in Millisekunden (Standard 300)
- `loop` – Endlosschleife aktivieren
- `rewind` – springt nach der letzten Folie zurück zur ersten (Alternative zu `loop`)
- `effect` – Übergangseffekt: `'slide'`, `'fade'`, `'cube'`, `'coverflow'`, `'flip'`, `'creative'` oder `'cards'`
- `freeMode` – aktiviert freies Scrollen ohne Einrasten an Folien
- `grabCursor` – zeigt den „Greifen"-Cursor beim Hover

## Touch- und Swipe-Steuerung

- `allowTouchMove` – wenn `false`, kann der Slider nur über die API (z. B. `slideNext`) bedient werden
- `threshold` – minimale Touch-Distanz in px, bevor eine Bewegung registriert wird
- `touchRatio` – Empfindlichkeit der Touch-Steuerung
- `simulateTouch` – Mausklicks werden wie Touch-Events behandelt
- `longSwipes` / `shortSwipes` – kurze und lange Wischbewegungen separat (de)aktivieren
- `resistance` und `resistanceRatio` – steuern den Widerstand an den Rändern

## Module-Parameter (Navigation, Pagination etc.)

Viele Parameter sind Objekte, die einzelne Module konfigurieren:

- `navigation` – Vor-/Zurück-Buttons (`nextEl`, `prevEl`)
- `pagination` – Bullets, Fraction, Progressbar oder Custom (`el`, `type`, `clickable`, `dynamicBullets`)
- `scrollbar` – Scrollbar mit optionalem `draggable`
- `autoplay` – automatischer Wechsel mit `delay`, `disableOnInteraction`, `pauseOnMouseEnter`, `reverseDirection`
- `keyboard` und `mousewheel` – Steuerung per Tastatur bzw. Mausrad
- `zoom` – Pinch-Zoom auf Bildern mit `maxRatio`/`minRatio`
- `thumbs` – Verknüpfung mit einem zweiten Swiper als Thumbnail-Leiste
- `grid` – Mehrzeiliges Raster mit `rows` und `fill`
- `virtual` – Virtuelle Slides für große Datenmengen (nur das Nötigste bleibt im DOM)
- `parallax` – Parallax-Effekte für Slide-Inhalte

## Responsive Verhalten

`breakpoints` – erlaubt unterschiedliche Parameter je Bildschirmbreite. Allerdings funktionieren nicht alle Parameter in Breakpoints, sondern nur jene ohne grundlegende Layout-/Logikänderung (z. B. `slidesPerView`, `spaceBetween`, `grid.rows`); `loop` und `effect` lassen sich darüber nicht ändern:

```js
breakpoints: {
  640:  { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 30 },
}
```

## Effekt-spezifische Parameter

Jeder Effekt hat ein eigenes Konfigurationsobjekt, z. B. `coverflowEffect` (mit `rotate`, `depth`, `scale`, `stretch`, `slideShadows`), `fadeEffect` (`crossFade`), `cubeEffect` (`shadow`, `shadowOffset`, `slideShadows`) oder `creativeEffect` mit eigenen `prev`/`next`-Transformationen (translate, rotate, opacity, scale).

## Events & Callbacks

Über den `on`-Parameter lassen sich Event-Handler direkt bei der Initialisierung registrieren – z. B. `init`, `slideChange`, `reachEnd`, `transitionStart`. Alternativ geht das nach der Initialisierung mit `swiper.on('slideChange', …)`.

## Sonstiges Nützliches

- `observer` – reagiert auf DOM-Mutationen und initialisiert den Swiper bei Änderungen neu
- `watchOverflow` – deaktiviert den Slider automatisch, wenn zu wenige Slides vorhanden sind
- `a11y` – Accessibility-Einstellungen mit anpassbaren Screenreader-Texten
- `hashNavigation` und `history` – URL-basierte Navigation (Hash bzw. History-API)
- `cssMode` – nutzt die native CSS Scroll Snap API für bessere Performance, allerdings mit eingeschränktem Funktionsumfang

Die vollständige Referenz mit allen Standardwerten findest du unter https://swiperjs.com/swiper-api – aktuell ist Version 12.1.4.

