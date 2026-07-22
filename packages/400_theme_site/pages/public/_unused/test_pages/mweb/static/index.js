/// <reference types="bootstrap">
/// <reference types="datatables.net">
/// <reference types="jquery">
/// <reference types="lodash">
/// <reference types="socket.io-client">
/// <reference types="video.js">
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c, _d, _e;
var allowCookiesKey = 'allowCookies';
var lastAllowCookiesAskedKey = 'allowCookiesAsked';
var debugResponse = false;
var socket = io();
var pv_id = randomString(6);
var itemsPerPage = 15;
var currentPage = 0;
var mediathekTable;
var connectingModal;
var contactModal;
var cookieModal;
var indexingModal;
var uid;
var playingInterval;
var playStartTimestamp;
var lastQueryString = null;
var ignoreNextHashChange = false;
var impressum = null;
var datenschutz = null;
var donate = null;
var queryInputClearButtonState = 'hidden';
var video;
var sortBy = 'timestamp';
var sortOrder = 'desc';



socket.on('connect', function () {
    console.log('connected');
});
socket.on('disconnect', function () {
    console.log('disconnected');
    socket.connect();
});
socket.on('reconnect', function (attemptNumber) {
    console.log('reconnected', attemptNumber);
});
socket.on('reconnect_attempt', function (attemptNumber) {
    console.log('attempting reconnect', attemptNumber);
});
socket.on('reconnect_failed', function () {
    console.log('reconnect failed');
});
socket.on('reconnect_error', function (error) {
    console.error('reconnect_error', error);
});
socket.on('connect_error', function (error) {
    console.error('connect_error', error);
});

XMLHttpRequest.prototype.baseOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {

  if (url.startsWith('http://srfvodhd-vh.akamaihd.net') || url.startsWith('http://hdvodsrforigin-f.akamaihd.net')) {
    url = 'https' + url.slice(4);
  } else if (url.startsWith('https://mediathekviewweb.de')) {
    this.baseOpen(method, url, async, user, password);
  } else if (url.startsWith('http://localhost:41000')) {
    url = 'https://mediathekviewweb.de/socket.io/?EIO=4&transport=polling&t=OM6fpnN&sid=Wzzj9vV-nAu1pbImBGNk';
    this.baseOpen(method, url, async, user, password);
  }  else {
    // url = 'https://mediathekviewweb.de/socket.io/?EIO=4&transport=polling&t=OM6fpnN&sid=Wzzj9vV-nAu1pbImBGNk';
    // this.baseOpen(method, url, async, user, password);
    return false;
  }

};

/*polyfills for stupid internet explorer*/
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
function pad(value, size) {
    var stringValue = value.toString();
    while (stringValue.length < (size || 2)) {
        stringValue = "0" + stringValue;
    }
    return stringValue;
}
function modalIsOpen(modalDOM) {
    return (modalDOM.data('bs.modal') || {}).isShown;
}
function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function formatDate(epochSeconds) {
    return new Date(epochSeconds * 1000).toLocaleDateString('de', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}
function formatTime(epochSeconds) {
    return new Date(epochSeconds * 1000).toLocaleTimeString('de', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
function formatDuration(seconds) {
    return pad(Math.floor(seconds / 60), 2) + ':' + pad(seconds % 60, 2);
}
function formatBytes(bytes, decimals) {
    if (!(parseInt(bytes) >= 0))
        return '?';
    else if (bytes == 0)
        return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
function parseQuery(query) {
    var channels = [];
    var topics = [];
    var titles = [];
    var descriptions = [];
    var generics = [];
    var duration_min = undefined;
    var duration_max = undefined;
    var splits = query.trim().toLowerCase().split(/\s+/).filter(function (split) {
        return (split.length > 0);
    });
    for (var i = 0; i < splits.length; i++) {
        var split = splits[i];
        if (split[0] == '!') {
            var c = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (c.length > 0) {
                channels.push(c);
            }
        }
        else if (split[0] == '#') {
            var t = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (t.length > 0) {
                topics.push(t);
            }
        }
        else if (split[0] == '+') {
            var t = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (t.length > 0) {
                titles.push(t);
            }
        }
        else if (split[0] == '*') {
            var d = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (d.length > 0) {
                descriptions.push(d);
            }
        }
        else if (split[0] == '>') {
            var d = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (d.length > 0 && !isNaN(d[0])) {
                duration_min = d[0] * 60;
            }
        }
        else if (split[0] == '<') {
            var d = split.slice(1, split.length).split(',').filter(function (split) {
                return (split.length > 0);
            });
            if (d.length > 0 && !isNaN(d[0])) {
                duration_max = d[0] * 60;
            }
        }
        else {
            generics = generics.concat(split.split(/\s+/));
        }
    }
    return {
        channels: channels,
        topics: topics,
        titles: titles,
        descriptions: descriptions,
        duration_min: duration_min,
        duration_max: duration_max,
        generics: generics
    };
}
function track(action) {
    var date = new Date();
    socket.emit('track', {
        uid: uid,
        pv_id: pv_id,
        ua: navigator.userAgent,
        lang: navigator.language,
        res: window.screen.width + "x" + window.screen.height,
        urlref: document.referrer,
        action_name: action,
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        rand: randomString(10),
        href: window.location.href
    });
}
uid = (_e = (_d = window.localStorage) === null || _d === void 0 ? void 0 : _d.getItem) === null || _e === void 0 ? void 0 : _e.call(_d, 'uid');
if (!!uid) {
    uid = uid.trim();
}
else {
    uid = Cookies.get('uid');
    if (!!uid) {
        uid = uid.trim();
    }
}
if (!!uid && uid.length == 32) {
    track('index');
}
else {
    socket.on('uid', function (_uid) {
        var _a, _b;
        (_b = (_a = window.localStorage) === null || _a === void 0 ? void 0 : _a.setItem) === null || _b === void 0 ? void 0 : _b.call(_a, 'uid', _uid);
        Cookies.set('uid', _uid, {
            expires: 99999
        });
        uid = _uid;
        track('index');
    });
    socket.emit('requestUid');
}
setInterval(function () {
    if (socket.connected && !isVideoPlaying()) {
        track('heartbeat');
    }
}, 20 * 60 * 1000); /*every 20 minutes*/
socket.on('indexState', function (state) {
    var parsingProgress = (state.parserProgress * 100).toFixed(0);
    var indexingProgress = (state.indexingProgress * 100).toFixed(0);
    $('#parsingProgressbar').css('width', (parsingProgress + '%')).text(parsingProgress + '%');
    $('#indexingProgressbar').css('width', (indexingProgress + '%')).text(indexingProgress + '%');
    $('#indexingMessage').text(state.entries);
    $('#indexingTimeLabel').text((state.time / 1000).toFixed(0) + ' Sekunden');
    if (!state.done && !state.error) {
        if (!modalIsOpen(indexingModal)) {
            indexingModal.modal('show');
        }
    }
    else if (state.error) {
        $('#indexingMessage').text(state.error);
        setTimeout(function () { return indexingModal.modal('hide'); }, 3000);
    }
    else {
        indexingModal.modal('hide');
        currentPage = 0;
        query();
    }
});
var trackQuery = _.debounce(function () { return track('query'); }, 2000);
function getQueryString() {
    return $('#queryInput').val().toString().trim();
}
function setQueryFromURIHash() {
    var props = parseURIHash(window.location.hash);
    if (props['query']) {
        $('#queryInput').val(props['query']).trigger('input');
    }
    else {
        $('#queryInput').val('').trigger('input');
    }
    if (props['everywhere'] === 'true') {
        $('#everywhereCheckbox').prop('checked', true);
    }
    else {
        $('#everywhereCheckbox').prop('checked', false);
    }
    if (props['future'] === 'false') {
        $('#futureCheckbox').prop('checked', false);
    }
    else {
        $('#futureCheckbox').prop('checked', true);
    }
    if (!isNaN(parseInt(props['page']))) {
        currentPage = parseInt(props['page']) - 1;
    }
    else {
        currentPage = 0;
    }
}
function parseURIHash(hash) {
    if (hash[0] == '#') {
        hash = hash.slice(1);
    }
    var props = hash.split('&');
    var elements = {};
    for (var i = 0; i < props.length; i++) {
        var element = props[i].split('=');
        elements[element[0]] = decodeURIComponent(element[1]);
    }
    return elements;
}
function createURIHash(elements) {
    var props = [];
    for (var prop in elements) {
        props.push(prop + '=' + encodeURIComponent(elements[prop].toString()));
    }
    return props.join('&');
}
var query = _.throttle(function () {
    var queryString = getQueryString();
    var future = !!$('#futureCheckbox').prop('checked');
    var everywhere = !!$('#everywhereCheckbox').prop('checked');
    currentPage = Math.min(currentPage, Math.floor(10000 / itemsPerPage - 1));
    var elements = {};
    if (queryString.length > 0) {
        elements['query'] = queryString;
    }
    if (everywhere === true) {
        elements['everywhere'] = true;
    }
    if (future === false) {
        elements['future'] = false;
    }
    if (currentPage > 0) {
        elements['page'] = currentPage + 1;
    }
    var oldHash = window.location.hash;
    if (oldHash[0] == '#') {
        oldHash = oldHash.slice(1);
    }
    var newHash = createURIHash(elements);
    if (oldHash !== newHash) {
        var url = new URL(window.location.toString());
        url.hash = newHash;
        history.replaceState(undefined, '', url.toString());
        ignoreNextHashChange = true;
    }
    var parsedQuery = parseQuery(queryString);
    var queries = [];
    for (var i = 0; i < parsedQuery.channels.length; i++) {
        queries.push({
            fields: ['channel'],
            query: parsedQuery.channels[i].join(' ')
        });
    }
    for (var i = 0; i < parsedQuery.topics.length; i++) {
        queries.push({
            fields: ['topic'],
            query: parsedQuery.topics[i].join(' ')
        });
    }
    for (var i = 0; i < parsedQuery.titles.length; i++) {
        queries.push({
            fields: ['title'],
            query: parsedQuery.titles[i].join(' ')
        });
    }
    for (var i = 0; i < parsedQuery.descriptions.length; i++) {
        queries.push({
            fields: ['description'],
            query: parsedQuery.descriptions[i].join(' ')
        });
    }
    if (parsedQuery.generics.length > 0) {
        queries.push({
            fields: everywhere ? ['channel', 'topic', 'title', 'description'] : ((parsedQuery.topics.length == 0) ? ['topic', 'title'] : ['title']),
            query: parsedQuery.generics.join(' ')
        });
    }
    var queryObj = {
        queries: queries,
        sortBy: sortBy,
        sortOrder: sortOrder,
        future: future,
        duration_min: parsedQuery.duration_min,
        duration_max: parsedQuery.duration_max,
        offset: currentPage * itemsPerPage,
        size: itemsPerPage
    };
    socket.emit('queryEntries', queryObj, function (message) {
        if (debugResponse) {
            console.log(message);
        }
        handleQueryResult(message.result, message.err);
    });
    trackQuery();
}, 20);
function handleQueryResult(result, err) {
    mediathekTable.clear();
    mediathekTable.draw();
    if (err) {
        $('#queryInfoLabel').html('Fehler:<br>' + err.join('<br>'));
        $('#pagination').empty();
        return;
    }
    if (!result) {
        return;
    }
    for (var i = 0; i < result.results.length; i++) {
        var data = result.results[i];
        if (data.timestamp == 0) {
            data.dateString = data.timeString = '?';
        }
        else {
            data.dateString = formatDate(data.timestamp);
            data.timeString = formatTime(data.timestamp);
        }
        data.durationString = isNaN(data.duration) ? '?' : formatDuration(data.duration);
        mediathekTable.row.add(data);
    }
    mediathekTable.draw();
    var actualPagesCount = Math.ceil(result.queryInfo.totalResults / itemsPerPage);
    var shownPagesCount = Math.min(actualPagesCount, Math.floor(10000 / itemsPerPage));
    createPagination(shownPagesCount);
    var filmlisteTime = "am ".concat(formatDate(result.queryInfo.filmlisteTimestamp), " um ").concat(formatTime(result.queryInfo.filmlisteTimestamp), " Uhr");
    $('#queryInfoLabel').html('Die Suche dauerte ' + result.queryInfo.searchEngineTime.toString().replace('.', ',') + ' ms. Zeige Treffer ' + Math.min(result.queryInfo.totalResults, (currentPage * itemsPerPage + 1)) +
        ' bis ' + Math.min(result.queryInfo.totalResults, ((currentPage + 1) * itemsPerPage)) + ' von insgesamt ' + result.queryInfo.totalResults + '.</br>Filmliste zuletzt ' + filmlisteTime + ' aktualisiert.');
}
function createPaginationButton(html, active, enabled, callback) {
    var button = $('<li>').addClass(active ? 'active' : '').addClass(enabled ? '' : 'disabled').append($('<a>', {
        href: '#',
        html: html,
        click: function () {
            if (enabled && !active) {
                callback();
                query();
            }
            return false;
        }
    }));
    return button;
}
function createPagination(totalPages) {
    var pagination = $('#pagination');
    pagination.empty();
    var backButton = createPaginationButton('<i class="material-icons" style="margin: -6px;">keyboard_arrow_left</i>', false, currentPage > 0, function () {
        currentPage--;
    });
    pagination.append(backButton);
    var pagingBegin = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
    var pagingEnd = Math.min(totalPages, pagingBegin + 5);
    var _loop_1 = function (i) {
        var button = createPaginationButton(i + 1, currentPage == i, true, function () {
            currentPage = i;
        });
        pagination.append(button);
    };
    for (var i = pagingBegin; i < pagingEnd; i++) {
        _loop_1(i);
    }
    var nextButton = createPaginationButton('<i class="material-icons" style="margin: -6px">keyboard_arrow_right</i>', false, currentPage < (totalPages - 1), function () {
        currentPage++;
    });
    pagination.append(nextButton);
}
function getContentLength(url, callback) {
    socket.emit('getContentLength', url, function (contentLength) {
        callback(contentLength);
    });
}
function getDescription(id, callback) {
    socket.emit('getDescription', id, function (description) {
        callback(description);
    });
}
function createSubtitleRow(text, url, filename, filesize) {
    var tableRow = $('<tr>');
    var downloadButton = $('<a>', {
        target: '_blank',
        href: url,
        download: filename
    });
    downloadButton.click(function () { return track('download-subtitle'); });
    var downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');
    downloadButton.append(downloadIcon);
    var filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2));
    tableRow.append($('<td>').text(text));
    tableRow.append(filesizeCell);
    tableRow.append($('<td>').append(downloadButton));
    return tableRow;
}
function createVideoRow(text, url, videoTitle, filename, filesize) {
    var tableRow = $('<tr>');
    var watchButton = $('<a>', {
        target: '_blank',
        href: url,
        click: function () {
            playVideo(videoTitle, url);
            return false;
        }
    });
    var watchIcon = $('<i>').addClass('material-icons floatLeft').text('ondemand_video');
    watchButton.click(function () { watchIcon.addClass('pulse'); setTimeout(function () { return watchIcon.removeClass('pulse'); }, 500); });
    watchButton.append(watchIcon);
    var downloadButton = $('<a>', {
        target: '_blank',
        href: url,
        download: filename
    });
    var downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');
    downloadButton.click(function () { downloadIcon.addClass('pulse'); setTimeout(function () { return downloadIcon.removeClass('pulse'); }, 500); track('download-video'); });
    downloadButton.append(downloadIcon);
    var clipboardButton = $('<a>', {
        target: '_blank',
        href: url,
        download: filename
    });
    var clipboardIcon = $('<i>').addClass('material-icons floatRight').text('assignment');
    clipboardButton.click(function () { copyToClipboard(url); clipboardIcon.addClass('pulse'); setTimeout(function () { return clipboardIcon.removeClass('pulse'); }, 500); return false; });
    clipboardButton.append(clipboardIcon);
    var filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2)).addClass('filesizeCell');
    tableRow.append($('<td>').text(text));
    tableRow.append(filesizeCell);
    tableRow.append($('<td>').append($('<div>').append(watchButton).append(clipboardButton).append(downloadButton).addClass('watchDownloadField')));
    return tableRow;
}
function hidePopoverIfNotHovered(button, callback) {
    setTimeout(function () {
        var popoverID = button.attr('aria-describedby');
        var popover = $('#' + popoverID);
        if (popover.length) {
            if (!popover.is(':hover') && !button.is(':hover')) {
                button.popover('hide');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        }
    }, 150);
}
function createDescriptionButton(entry) {
    var state = false;
    var description = null;
    var icon = $('<i>').addClass('material-icons').text('expand_more');
    var popoverContent = $('<div>').html('<i class="material-icons spin-right" style="display: inline-flex; vertical-align: middle; font-size: 2.5em;">autorenew</i> <span style="font-size:1.2em; vertical-align: middle;">Laden...</span>');
    var button = $('<a>', {
        target: '_blank',
        href: '#',
        click: function () {
            if (!state) {
                if (description == null) {
                    getDescription(entry.id, function (dscrp) {
                        popoverContent.text(dscrp);
                        if (state) {
                            button.popover('show');
                        }
                    });
                }
                button.popover('show');
                icon.addClass('rotateLeft');
                state = true;
            }
            else {
                button.popover('hide');
                icon.removeClass('rotateLeft');
                state = false;
            }
            return false;
        }
    });
    button.popover({
        trigger: 'manual',
        //toggle: 'popover',
        placement: 'auto right',
        container: '#blur',
        template: '<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
        content: popoverContent,
        html: true,
        animation: true
    });
    button.on('mouseleave', function () {
        hidePopoverIfNotHovered(button, function () {
            state = false;
            icon.removeClass('rotateLeft');
        });
    });
    button.append(icon);
    return button;
}
function resetVideoActionButton(button) {
    button.removeClass('text-warning');
    button.children().first().removeClass('icon-big');
    button.clicked = false;
}
function createVideoActionButton(entry) {
    var highestQualityUrl = entry.url_video_hd ? entry.url_video_hd : (entry.url_video ? entry.url_video : entry.url_video_low);
    var button = $('<a>', {
        target: '_blank',
        href: highestQualityUrl,
        click: function () {
            if (!button.clicked) {
                button.clicked = true;
                button.addClass('text-warning');
                button.children().first().addClass('icon-big');
            }
            else {
                playVideo(entry.title, highestQualityUrl);
            }
            return false;
        }
    });
    var icon = $('<i>').addClass('material-icons movie-icon').text('movie');
    button.append(icon);
    var table = $('<table>').addClass('table-condensed');
    table.append("<thead>\n          <tr>\n            <th>Qualit\u00E4t</th>\n            <th>Gr\u00F6\u00DFe</th>\n            <th>Aktion</th>\n          </tr>\n        </thead>");
    var tableHead = $('<thead>');
    var tableBody = $('<tbody>');
    var filenamebase = entry.channel + ' - ' + entry.topic + ' - ' + entry.title + ' - ' + formatDate(entry.timestamp) + ' ' + formatTime(entry.timestamp);
    var lowRow, midRow, highRow, subtitleRow;
    if (entry.url_video_hd) {
        highRow = createVideoRow('Hoch', entry.url_video_hd, entry.title, filenamebase + '.' + entry.url_video_hd.split('.').pop());
        tableBody.append(highRow);
    }
    if (entry.url_video) {
        midRow = createVideoRow('Mittel', entry.url_video, entry.title, filenamebase + '.' + entry.url_video.split('.').pop(), entry.size);
        tableBody.append(midRow);
    }
    if (entry.url_video_low) {
        lowRow = createVideoRow('Niedrig', entry.url_video_low, entry.title, filenamebase + '.' + entry.url_video_low.split('.').pop());
        tableBody.append(lowRow);
    }
    if (entry.url_subtitle) {
        subtitleRow = createSubtitleRow('UT', entry.url_subtitle, filenamebase + '.' + entry.url_subtitle.split('.').pop());
        tableBody.append(subtitleRow);
    }
    table.append(tableBody);
    button.popover({
        trigger: 'manual',
        // toggle: 'popover',
        placement: 'auto right',
        container: '#blur',
        content: table,
        html: true,
        animation: true
    });
    var requestedFilesize = false;
    button.on('mouseenter', function () {
        button.popover('show');
        var popoverID = button.attr('aria-describedby');
        var popover = $('#' + popoverID);
        if (popover.length) {
            popover.on('mouseleave', function () {
                hidePopoverIfNotHovered(button, function () { return resetVideoActionButton(button); });
            });
        }
        if (!requestedFilesize) {
            requestedFilesize = true;
            if (highRow) {
                getContentLength(entry.url_video_hd, function (bytes) {
                    highRow.find('td:eq(1)').text(formatBytes(bytes, 2));
                });
            }
            if (midRow) {
                getContentLength(entry.url_video, function (bytes) {
                    midRow.find('td:eq(1)').text(formatBytes(bytes, 2));
                });
            }
            if (lowRow) {
                getContentLength(entry.url_video_low, function (bytes) {
                    lowRow.find('td:eq(1)').text(formatBytes(bytes, 2));
                });
            }
            if (subtitleRow) {
                getContentLength(entry.url_subtitle, function (bytes) {
                    subtitleRow.find('td:eq(1)').text(formatBytes(bytes, 2));
                });
            }
        }
    });
    button.on('mouseleave', function () {
        hidePopoverIfNotHovered(button, function () { return resetVideoActionButton(button); });
    });
    return button;
}
function isFullscreen() {
    return document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullScreenElement
        || document.msFullscreenElement;
}
function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}
function isVideoPlaying() {
    if (!video) {
        return false;
    }
    else {
        return !video.paused();
    }
}
function toggleVideoPause() {
    if (video) {
        video.paused() ? video.play() : video.pause();
    }
}
function playVideo(title, url) {
    if (url.startsWith('http://')) {
        playVideoInNewWindow(url);
        return;
    }
    $('#videooverlay').show(200, function () {
        $('#blur').addClass('blur');
        var vid = $('<video>', {
            "class": 'video-js vjs-default-skin vjs-big-play-centered vjs-16-9',
            id: 'video-player',
            preload: 'auto',
            controls: '',
            width: '100%'
        });
        var source = $('<source>', {
            src: url
        });
        if (url.endsWith('m3u8')) {
            source.attr('type', 'application/x-mpegURL');
        }
        vid.append(source);
        $('#videocontent').append(vid);
        video = videojs('video-player');
        vid.dblclick(function () {
            if (isFullscreen()) {
                exitFullscreen();
            }
            else {
                requestFullscreen(video);
            }
        });
    }).focus();
    clearInterval(playingInterval); /*in case it wasn't stopped for any reason*/
    playingInterval = setInterval(function () {
        if (socket.connected) {
            if (isVideoPlaying()) {
                track('playing');
            }
            else {
                track('paused');
            }
        }
    }, 1 * 60 * 1000); /*every minute*/
    track('play');
    playStartTimestamp = Date.now();
}
function playVideoInNewWindow(url) {
    return __awaiter(this, void 0, void 0, function () {
        var playerWindow, start, playDuration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playerWindow = window.open(url);
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    if (!((playerWindow === null || playerWindow === void 0 ? void 0 : playerWindow.closed) === false)) return [3 /*break*/, 3];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    playDuration = Date.now() - start;
                    if (playDuration >= 1000 * 30) {
                        location.reload();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function closeVideo() {
    var playDuration = Date.now() - playStartTimestamp;
    if (playDuration >= 1000 * 30) {
        location.reload();
    }
    video.dispose();
    $('#videocontent').empty();
    $('#videooverlay').hide(200);
    $('#blur').removeClass('blur');
    clearInterval(playingInterval);
}
function openContactsModal() {
    contactModal.modal('show');
    track('contact');
}
function returnEmptyString() {
    return '';
}
function copyToClipboard(text) {
    var dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
}
$(function () {
    var _a, _b;
    $.fn.dataTable.ext.errMode = 'none';
    $('#browserWarning').remove();
    cookieModal = $('#cookieModal');
    cookieModal.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
    connectingModal = $('#connectingModal');
    connectingModal.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
    indexingModal = $('#indexingModal');
    indexingModal.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
    contactModal = $('#contactModal');
    contactModal.modal({
        backdrop: true,
        keyboard: true,
        show: false
    });
    var allowCookies = (_b = (_a = window.localStorage) === null || _a === void 0 ? void 0 : _a.getItem) === null || _b === void 0 ? void 0 : _b.call(_a, allowCookiesKey);
    if ((allowCookies != 'true') && (allowCookies != 'false')) {
        cookieModal = $('#cookieModal');
        cookieModal.modal('show');
        var cookieAcceptButtonElement = document.getElementById('cookieAcceptButton');
        var cookieDenyButtonElement = document.getElementById('cookieDenyButton');
        cookieAcceptButtonElement.addEventListener('click', function () {
            var _a, _b, _c, _d;
            (_b = (_a = window.localStorage) === null || _a === void 0 ? void 0 : _a.setItem) === null || _b === void 0 ? void 0 : _b.call(_a, allowCookiesKey, 'true');
            (_d = (_c = window.localStorage) === null || _c === void 0 ? void 0 : _c.setItem) === null || _d === void 0 ? void 0 : _d.call(_c, lastAllowCookiesAskedKey, Date.now().toString());
            cookieModal.modal('hide');
            location.reload();
        });
        cookieDenyButtonElement.addEventListener('click', function () {
            var _a, _b, _c, _d;
            (_b = (_a = window.localStorage) === null || _a === void 0 ? void 0 : _a.setItem) === null || _b === void 0 ? void 0 : _b.call(_a, allowCookiesKey, 'false');
            (_d = (_c = window.localStorage) === null || _c === void 0 ? void 0 : _c.setItem) === null || _d === void 0 ? void 0 : _d.call(_c, lastAllowCookiesAskedKey, Date.now().toString());
            cookieModal.modal('hide');
        });
    }
    socket.on('connect', function () {
        connectingModal.modal('hide');
    });
    socket.on('disconnect', function () {
        indexingModal.modal('hide');
        if (!modalIsOpen(connectingModal)) {
            connectingModal.modal('show');
        }
    });
    setInterval(function () {
        if (socket.disconnected) {
            if (!modalIsOpen(connectingModal)) {
                connectingModal.modal('show');
            }
        }
    }, 1500);
    mediathekTable = $('#mediathek').DataTable({
        columns: [{
                width: '1%',
                data: null,
                render: returnEmptyString,
                createdCell: function (td, cellData, rowData, row, col) {
                    var link = $('<a>', {
                        target: '_blank',
                        text: rowData.channel,
                        href: rowData.url_website
                    });
                    $(td).append(link);
                }
            }, {
                width: '30%',
                data: 'topic'
            }, {
                width: '70%',
                data: 'title'
            }, {
                width: '1%',
                data: null,
                render: returnEmptyString,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).append(createDescriptionButton(rowData));
                }
            }, {
                width: '1%',
                data: 'dateString'
            }, {
                width: '1%',
                data: 'timeString'
            }, {
                width: '1%',
                data: 'durationString'
            }, {
                width: '1%',
                data: null,
                render: returnEmptyString,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).append(createVideoActionButton(rowData));
                }
            }],
        language: {
            emptyTable: 'Keine Einträge vorhanden'
        },
        searching: false,
        ordering: false,
        info: false,
        paging: false,
        scrollX: true
    });
    $('#rssFeedButton').click(function () {
        var search = window.location.hash.replace('#', '');
        window.open(window.location.origin + window.location.pathname + 'feed' + (search.length > 0 ? '?' : '') + search, '_blank');
        track('feed-create');
    });
    var newQuery = function () {
        currentPage = 0;
        query();
    };
    $('th[data-onclick-sort]').on('click', function (e) {
        var sort = $(e.target).attr("data-onclick-sort");
        if (sort === sortBy && sortOrder) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        else {
            sortBy = sort;
            sortOrder = sort === 'timestamp' ? 'desc' : 'asc';
        }
        $(e.target).parent().attr("data-sort", sortBy + '-' + sortOrder);
        newQuery();
    });
    $('#queryInput').on('input', function () {
        var currentQueryString = getQueryString();
        if (currentQueryString != lastQueryString) {
            newQuery();
            lastQueryString = currentQueryString;
        }
        var clearButton = $('#queryInputClearButton');
        if (currentQueryString.length == 0 && queryInputClearButtonState == 'shown') {
            clearButton.animate({
                opacity: 0
            }, {
                easing: 'swing',
                duration: 20
            });
            queryInputClearButtonState = 'hidden';
        }
        else if (currentQueryString.length > 0 && queryInputClearButtonState == 'hidden') {
            clearButton.animate({
                opacity: 1
            }, {
                easing: 'swing',
                duration: 20
            });
            queryInputClearButtonState = 'shown';
        }
    });
    $('#queryParameters input:radio').change(function () { return newQuery(); });
    $('#queryParameters input:checkbox').change(function () { return newQuery(); });
    $('#videocloseButton').click(function () {
        closeVideo();
    });
    $('#videooverlay').keydown(function (e) {
        if (e.key == 'Escape' || e.keyCode == 27) {
            if (isFullscreen()) {
                exitFullscreen();
            }
            else {
                closeVideo();
            }
            e.preventDefault();
        }
        else if (e.key === ' ' || e.keyCode == 32) { /*32 = Space*/
            toggleVideoPause();
            e.preventDefault();
        }
    });
    $('#queryInputClearButton').click(function () {
        $('#queryInput').val('').trigger('input').focus();
    });
    $('#contactButton').click(function () { return openContactsModal(); });
    $('#githubButton').click(function () { return track('github'); });
    $('#forumButton').click(function () { return track('forum'); });
    $('#logo').click(function () {
        $('#generic-html-view').hide(250);
        $('#main-view').show(250);
        return false;
    });
    $('#donateButton').click(function () {
        track('donate');
        $('#main-view').hide(250);
        $('#generic-html-view').show(250);
        if (donate == null) {
            socket.emit('getDonate', function (response) {
                donate = response;
                $('#genericHtmlContent').html(response);
            });
        }
        else {
            $('#genericHtmlContent').html(donate);
        }
        return false;
    });
    $('#datenschutzButton').click(function () {
        track('datenschutz');
        $('#main-view').hide(250);
        $('#generic-html-view').show(250);
        if (datenschutz == null) {
            socket.emit('getDatenschutz', function (response) {
                datenschutz = response;
                $('#genericHtmlContent').html(response);
            });
        }
        else {
            $('#genericHtmlContent').html(datenschutz);
        }
        return false;
    });
    $('#impressumButton').click(function () {
        track('impressum');
        $('#main-view').hide(250);
        $('#generic-html-view').show(250);
        if (impressum == null) {
            socket.emit('getImpressum', function (response) {
                impressum = response;
                $('#genericHtmlContent').html(response);
            });
        }
        else {
            $('#genericHtmlContent').html(impressum);
        }
        return false;
    });
    $('#genericHtmlViewBackButton').click(function () {
        $('#generic-html-view').hide(250);
        $('#main-view').show(250);
    });
    window.addEventListener("hashchange", function () {
        if (!ignoreNextHashChange) {
            setQueryFromURIHash();
            query();
        }
        else {
            ignoreNextHashChange = false;
        }
    }, false);
    $('#searchSpan').popover();
    $('[data-onclick-return-false]').click(function () {
        return false;
    });
    $('#helpButton').click(function () {
        window.open('https://github.com/mediathekview/mediathekviewweb/blob/master/README.md', '_blank');
    });
    setQueryFromURIHash();
    query();
});
