var Main_ItemsLimitMax = 100;
var ChannelClip_game = '';
var ChannelClip_views = '';
var ChannelClip_title = '';
var ChannelClip_playUrl = '';
var ChannelClip_createdAt = '';
var ChannelClip_language = '';

var Vod_DoAnimateThumb = 1;

var AGame_fallowing = false;

//Screens
var Clip;
var ChannelClip;
var AGameClip;
var Game;
var UserGames;
var Live;
var Featured;
var AGame;
var Vod;
var AGameVod;

var Base_obj = {
    posX: 0,
    posY: 0,
    currY: 0,
    row_id: 0,
    coloumn_id: 0,
    dataEnded: false,
    idObject: {},
    loadingData: false,
    itemsCount: 0,
    loadingDataTryMax: 5,
    loadingDataTimeout: 3500,
    MaxOffset: 0,
    offset: 0,
    status: false,
    emptyContent: false,
    itemsCountCheck: false,
    FirstLoad: false,
    row: 0,
    data: null,
    data_cursor: 0,
    loadDataSuccess: Screens_loadDataSuccess,
    set_ThumbSize: function() {
        this.ThumbCssText = 'width: ' + this.ThumbSize + '%; display: inline-block; padding: 3px;';
    },
    key_exit: function(CenterLables) {
        if (Main_isControlsDialogShown()) Main_HideControlsDialog();
        else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
        else {
            if (Main_ThumbNull(this.posY, this.posX, this.ids[0])) {
                Main_removeFocus(this.posY + '_' + this.posX, this.ids);
            } else if (this.posY < 0) {
                Screens_removeFocusFallow();
                this.posY = 0;
            }
            if (!CenterLables) Main_CenterLablesStart(Screens_handleKeyDown);
        }
        Sidepannel_RestoreScreen();
    },
};

var Base_Vod_obj = {
    ThumbSize: 32.65,
    visiblerows: 3,
    ItemsLimit: Main_ItemsLimitVideo,
    ItemsReloadLimit: Main_ItemsReloadLimitVideo,
    ColoumnsCount: Main_ColoumnsCountVideo,
    addFocus: function(y, x, idArray, forceScroll) {
        this.AnimateThumb(this);
        Screens_addFocusVideo(y, x, idArray, forceScroll);
    },
    img_404: IMG_404_VIDEO,
    HasSwitches: true,
    period: ['day', 'week', 'month', 'all'],
    empty_str: function() {
        return STR_NO + (this.highlight ? STR_PAST_HIGHL : STR_PAST_BROA);
    },
    SwitchesIcons: ['movie-play', 'history'],
    addSwitches: function() {
        this.TopRowCreated = true;
        this.row = document.createElement('div');
        var SwitchesStrings = [STR_SPACE + STR_SPACE + STR_SWITCH_VOD, STR_SPACE + STR_SPACE + STR_SWITCH_CLIP];
        var thumbfallow, div, i = 0;

        for (i; i < SwitchesStrings.length; i++) {
            thumbfallow = '<i class="icon-' + this.SwitchesIcons[i] + ' stream_channel_fallow_icon"></i>' + SwitchesStrings[i];
            div = document.createElement('div');
            div.setAttribute('id', this.ids[8] + 'y_' + i);
            div.className = 'stream_cell_period';
            div.innerHTML = '<div id="' + this.ids[0] +
                'y_' + i + '" class="stream_thumbnail_channel_vod" ><div id="' + this.ids[3] +
                'y_' + i + '" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
            this.row.appendChild(div);
        }
        document.getElementById(this.table).appendChild(this.row);
    },
    key_play: function() {
        if (this.posY === -1) {
            if (this.posX === 0) {
                this.highlight = !this.highlight;
                this.SetPeriod();
                Screens_StartLoad();
                Main_setItem(this.highlightSTR, this.highlight ? 'true' : 'false');
            } else {
                this.periodPos++;
                if (this.periodPos > 4) this.periodPos = 1;
                this.SetPeriod();
                Screens_StartLoad();
            }
        } else Main_OpenVod(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
    },
    AnimateThumbId: null,
    HasAnimateThumb: true,
    AnimateThumb: function(screen) {
        window.clearInterval(this.AnimateThumbId);
        if (!Vod_DoAnimateThumb) return;
        var div = document.getElementById(this.ids[0] + this.posY + '_' + this.posX);

        // Only load the animation if it can be loaded
        // This prevent starting animating before it has loaded or animated a empty image
        Vod_newImg.onload = function() {
            this.onload = null;
            Main_HideElement(screen.ids[1] + screen.posY + '_' + screen.posX);
            // background-size: 612px from  div.offsetWidth
            div.style.backgroundSize = "612px";
            var frame = 0;
            screen.AnimateThumbId = window.setInterval(function() {
                // 10 = quantity of frames in the preview img, 344 img height from the div.offsetHeight
                // But this img real height is 180 thus the quality is affected, higher resolution aren't available
                div.style.backgroundPosition = "0px " + ((++frame % 10) * (-344)) + "px";
            }, 650);
        };

        Vod_newImg.src = div.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
    },
    concatenate: function(responseText) {
        if (this.data) {

            var tempObj = JSON.parse(responseText);

            this.MaxOffset = tempObj._total;
            this.data = this.data.concat(tempObj.vods);

            this.offset = this.data.length;
            if (this.offset > this.MaxOffset) this.dataEnded = true;

            this.loadingData = false;
        } else {
            this.data = JSON.parse(responseText);

            this.MaxOffset = this.data._total;
            this.data = this.data.vods;

            this.offset = this.data.length;
            if (this.offset > this.MaxOffset) this.dataEnded = true;

            this.loadDataSuccess();
            this.loadingData = false;
        }
    },
    addCell: function(cell) {
        if (!this.idObject[cell._id] && (cell.preview.template + '').indexOf('404_processing') === -1) {

            this.itemsCount++;
            this.idObject[cell._id] = 1;

            this.row.appendChild(Screens_createCellVod(
                this.row_id,
                this.coloumn_id,
                [cell._id, cell.length, cell.channel.broadcaster_language, cell.game, cell.channel.name, cell.increment_view_count_url], this.ids,
                [cell.preview.template.replace("{width}x{height}", Main_VideoSize),
                    cell.channel.display_name, STR_STREAM_ON + Main_videoCreatedAt(cell.created_at),
                    twemoji.parse(cell.title) + STR_BR + (cell.game !== "" && cell.game !== null ? STR_STARTED + STR_PLAYING + cell.game : ""), Main_addCommas(cell.views) + STR_VIEWS,
                    Main_videoqualitylang(cell.resolutions.chunked.slice(-4), (parseInt(cell.fps.chunked) || 0), cell.channel.broadcaster_language),
                    STR_DURATION + Play_timeS(cell.length), cell.animated_preview_url
                ]));

            this.coloumn_id++;
        }
    }
};

function ScreensObj_InitVod() {
    Vod = Screens_assign({
        ids: Screens_ScreenIds('Vod'),
        table: 'stream_table_vod',
        screen: Main_Vod,
        highlightSTR: 'Vod_highlight',
        highlight: Main_getItemBool('Vod_highlight', false),
        periodPos: Main_getItemInt('vod_periodPos', 2),
        base_url: 'https://api.twitch.tv/kraken/videos/top?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + '&broadcast_type=' + (this.highlight ? 'highlight' : 'archive') +
                '&sort=views&offset=' + this.offset + '&period=' + this.period[this.periodPos - 1] +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 4;
            Main_AddClass('top_bar_vod', 'icon_center_focus');
            this.SetPeriod();
        },
        label_exit: function() {
            Main_textContent('top_bar_vod', STR_VIDEOS);
            Main_RemoveClass('top_bar_vod', 'icon_center_focus');
        },
        SetPeriod: function() {
            Main_innerHTML('top_bar_vod', STR_VIDEOS +
                Main_UnderCenter((this.highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + Main_Periods[this.periodPos - 1]));

            Main_setItem('vod_periodPos', this.periodPos);
        }
    }, Base_obj);

    Vod = Screens_assign(Vod, Base_Vod_obj);
    Vod.set_ThumbSize();
}

function ScreensObj_InitAGameVod() {
    AGameVod = Screens_assign({
        ids: Screens_ScreenIds('AGameVod'),
        table: 'stream_table_a_game_vod',
        screen: Main_AGameVod,
        highlightSTR: 'AGameVod_highlight',
        highlight: Main_getItemBool('AGameVod_highlight', false),
        periodPos: Main_getItemInt('AGameVod_periodPos', 2),
        base_url: 'https://api.twitch.tv/kraken/videos/top?game=',
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + encodeURIComponent(Main_values.Main_gameSelected) + '&limit=' +
                Main_ItemsLimitMax + '&broadcast_type=' + (this.highlight ? 'highlight' : 'archive') +
                '&sort=views&offset=' + this.offset + '&period=' + this.period[this.periodPos - 1] +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        OldgameSelected: '',
        label_init: function() {
            if (Main_values.Main_OldgameSelected === null) Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;

            if (this.OldgameSelected !== Main_values.Main_gameSelected) this.status = false;
            this.OldgameSelected = Main_values.Main_gameSelected;

            Main_values.Main_CenterLablesVectorPos = 3;
            Main_AddClass('top_bar_game', 'icon_center_focus');
            this.SetPeriod();
        },
        label_exit: function() {
            Main_textContent('top_bar_game', STR_AGAME);
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
        },
        SetPeriod: function() {
            Main_innerHTML('top_bar_game', STR_AGAME +
                Main_UnderCenter((this.highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + Main_Periods[this.periodPos - 1]));

            Main_setItem('AGameVod_periodPos', this.periodPos);
        }
    }, Base_obj);

    AGameVod = Screens_assign(AGameVod, Base_Vod_obj);
    AGameVod.set_ThumbSize();
}

var Base_Live_obj = {
    ThumbSize: 32.65,
    visiblerows: 3,
    ItemsLimit: Main_ItemsLimitVideo,
    ItemsReloadLimit: Main_ItemsReloadLimitVideo,
    ColoumnsCount: Main_ColoumnsCountVideo,
    addFocus: Screens_addFocusVideo,
    img_404: IMG_404_VIDEO,
    empty_str: function() {
        return STR_NO + STR_LIVE_CHANNELS;
    }
};

function ScreensObj_InitLive() {
    Live = Screens_assign({
        ids: Screens_ScreenIds('Live'),
        table: 'stream_table_live',
        screen: Main_Live,
        base_url: 'https://api.twitch.tv/kraken/streams?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + '&offset=' + this.offset +
                (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '');
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 0;
            Main_AddClass('top_bar_live', 'icon_center_focus');
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_live', 'icon_center_focus');
        },
        concatenate: function(responseText) {
            if (this.data) {

                var tempObj = JSON.parse(responseText);

                this.MaxOffset = tempObj._total;
                this.data = this.data.concat(tempObj.streams);

                this.offset = this.data.length;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);

                this.MaxOffset = this.data._total;
                this.data = this.data.streams;

                this.offset = this.data.length;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.loadDataSuccess();
                this.loadingData = false;
            }
        },
        addCell: function(cell) {
            if (!this.idObject[cell.channel._id]) {

                this.itemsCount++;
                this.idObject[cell.channel._id] = 1;

                this.row.appendChild(Screens_createCellLive(
                    this.row_id,
                    this.coloumn_id,
                    [cell.channel.name, cell.channel._id, cell.channel.status], this.ids,
                    [cell.preview.template.replace("{width}x{height}", Main_VideoSize),
                        Main_is_playlist(JSON.stringify(cell.stream_type)) + cell.channel.display_name,
                        cell.channel.status, cell.game,
                        STR_SINCE + Play_streamLiveAt(cell.created_at) + ' ' + STR_FOR + Main_addCommas(cell.viewers) + STR_VIEWER,
                        Main_videoqualitylang(cell.video_height, cell.average_fps, cell.channel.broadcaster_language)
                    ]));

                this.coloumn_id++;
            }
        },
        key_play: function() {
            Main_OpenLiveStream(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
        }
    }, Base_obj);

    Live = Screens_assign(Live, Base_Live_obj);
    Live.set_ThumbSize();
}

function ScreensObj_InitAGame() {
    AGame = Screens_assign({
        ids: Screens_ScreenIds('AGame'),
        table: 'stream_table_a_game',
        screen: Main_aGame,
        base_url: 'https://api.twitch.tv/kraken/streams?game=',
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + encodeURIComponent(Main_values.Main_gameSelected) +
                '&limit=' + Main_ItemsLimitMax + '&offset=' + this.offset +
                (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '');
        },
        label_init: function() {
            if (Main_values.Main_OldgameSelected === null) Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;

            Main_values.Main_CenterLablesVectorPos = 3;
            Main_AddClass('top_bar_game', 'icon_center_focus');
            Main_IconLoad('label_side_panel', 'icon-arrow-circle-left', STR_GOBACK);

            //fix user label
            Main_RemoveClass('top_bar_user', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
            Main_textContent('top_bar_user', STR_USER);

            if (Main_values.Main_OldgameSelected !== Main_values.Main_gameSelected) this.status = false;

            if (Main_values.Search_isSearching) { //Reset label as the app may be restoring from background
                Main_cleanTopLabel();
                Main_innerHTML('top_bar_user', STR_SEARCH + Main_UnderCenter(STR_GAMES + ' ' + "'" + Main_values.Search_data + "'"));
            }

            Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter(STR_LIVE +
                ': ' + Main_values.Main_gameSelected));
        },
        label_exit: function() {
            Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
            Main_IconLoad('label_side_panel', 'icon-ellipsis', STR_SIDE_PANEL);
            Main_innerHTML('top_bar_game', STR_GAMES);
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
        },
        HasSwitches: true,
        SwitchesIcons: ['movie-play', 'movie', 'heart-o'],
        addSwitches: function() {
            this.TopRowCreated = true;
            this.row = document.createElement('div');
            var SwitchesStrings = [STR_SPACE + STR_SPACE + STR_VIDEOS, STR_SPACE + STR_SPACE + STR_CLIPS, STR_SPACE + STR_SPACE + STR_FALLOW];
            var thumbfallow, div, i = 0;

            for (i; i < SwitchesStrings.length; i++) {
                thumbfallow = '<i class="icon-' + this.SwitchesIcons[i] + ' stream_channel_fallow_icon"></i>' + SwitchesStrings[i];
                div = document.createElement('div');
                div.setAttribute('id', this.ids[8] + 'y_' + i);
                div.className = 'stream_cell_period';
                div.innerHTML = '<div id="' + this.ids[0] +
                    'y_' + i + '" class="stream_thumbnail_channel_vod" ><div id="' + this.ids[3] +
                    'y_' + i + '" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
                this.row.appendChild(div);
            }
            document.getElementById(this.table).appendChild(this.row);
        },
        concatenate: function(responseText) {
            if (this.data) {

                var tempObj = JSON.parse(responseText);

                this.MaxOffset = tempObj._total;
                this.data = this.data.concat(tempObj.streams);

                this.offset = this.data.length;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);

                this.MaxOffset = this.data._total;
                this.data = this.data.streams;

                this.offset = this.data.length;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.loadDataSuccess();
                this.loadingData = false;
            }
        },
        addCell: function(cell) {
            if (!this.idObject[cell.channel._id]) {

                this.itemsCount++;
                this.idObject[cell.channel._id] = 1;

                this.row.appendChild(Screens_createCellLive(
                    this.row_id,
                    this.coloumn_id,
                    [cell.channel.name, cell.channel._id, cell.channel.status], this.ids,
                    [cell.preview.template.replace("{width}x{height}", Main_VideoSize),
                        Main_is_playlist(JSON.stringify(cell.stream_type)) + cell.channel.display_name,
                        cell.channel.status, cell.game,
                        STR_SINCE + Play_streamLiveAt(cell.created_at) + ' ' + STR_FOR + Main_addCommas(cell.viewers) + STR_VIEWER,
                        Main_videoqualitylang(cell.video_height, cell.average_fps, cell.channel.broadcaster_language)
                    ]));

                this.coloumn_id++;
            }
        },
        key_play: function() {
            if (this.posY !== -1) {
                Main_OpenLiveStream(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
            } else AGame_headerOptions();
        }
    }, Base_obj);

    AGame = Screens_assign(AGame, Base_Live_obj);
    AGame.set_ThumbSize();
}

function ScreensObj_InitFeatured() {
    Featured = Screens_assign({
        ids: Screens_ScreenIds('Featured'),
        table: 'stream_table_featured',
        screen: Main_Featured,
        base_url: 'https://api.twitch.tv/kraken/streams/featured?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            this.url = this.base_url + '&offset=' + this.offset +
                (AddUser_UserIsSet() && AddUser_UsernameArray[Main_values.Users_Position].access_token ? '&oauth_token=' +
                    AddUser_UsernameArray[Main_values.Users_Position].access_token : '');
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 2;
            Main_AddClass('top_bar_featured', 'icon_center_focus');
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_featured', 'icon_center_focus');
        },
        concatenate: function(responseText) {
            this.data = JSON.parse(responseText);
            this.data = this.data.featured;
            this.dataEnded = true;

            this.loadDataSuccess();
            this.loadingData = false;
        },
        addCell: function(cell) {
            cell = cell.stream;
            if (!this.idObject[cell.channel._id]) {

                this.itemsCount++;
                this.idObject[cell.channel._id] = 1;

                this.row.appendChild(Screens_createCellLive(
                    this.row_id,
                    this.coloumn_id,
                    [cell.channel.name, cell.channel._id, cell.channel.status], this.ids,
                    [cell.preview.template.replace("{width}x{height}", Main_VideoSize),
                        Main_is_playlist(JSON.stringify(cell.stream_type)) + cell.channel.display_name,
                        cell.channel.status, cell.game,
                        STR_SINCE + Play_streamLiveAt(cell.created_at) + ' ' + STR_FOR + Main_addCommas(cell.viewers) + STR_VIEWER,
                        Main_videoqualitylang(cell.video_height, cell.average_fps, cell.channel.broadcaster_language)
                    ]));

                this.coloumn_id++;
            }
        },
        key_play: function() {
            Main_OpenLiveStream(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
        }
    }, Base_obj);

    Featured = Screens_assign(Featured, Base_Live_obj);
    Featured.set_ThumbSize();
}

var Base_Clip_obj = {
    ThumbSize: 32.65,
    ItemsLimit: Main_ItemsLimitVideo,
    TopRowCreated: false,
    ItemsReloadLimit: Main_ItemsReloadLimitVideo,
    ColoumnsCount: Main_ColoumnsCountVideo,
    addFocus: Screens_addFocusVideo,
    cursor: null,
    visiblerows: 3,
    period: ['day', 'week', 'month', 'all'],
    img_404: IMG_404_VIDEO,
    empty_str: function() {
        return STR_NO + STR_CLIPS;
    },
    HasSwitches: true,
    SwitchesIcons: ['history', 'play-1'],
    addSwitches: function() {
        this.TopRowCreated = true;
        this.row = document.createElement('div');
        var SwitchesStrings = [STR_SPACE + STR_SPACE + STR_SWITCH_CLIP, STR_SPACE + STR_SPACE + STR_PLAY_ALL];
        var thumbfallow, div, i = 0;

        for (i; i < SwitchesStrings.length; i++) {
            thumbfallow = '<i class="icon-' + this.SwitchesIcons[i] + ' stream_channel_fallow_icon"></i>' + SwitchesStrings[i];
            div = document.createElement('div');
            div.setAttribute('id', this.ids[8] + 'y_' + i);
            div.className = 'stream_cell_period';
            div.innerHTML = '<div id="' + this.ids[0] +
                'y_' + i + '" class="stream_thumbnail_channel_vod" ><div id="' + this.ids[3] +
                'y_' + i + '" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
            this.row.appendChild(div);
        }
        document.getElementById(this.table).appendChild(this.row);
    },
    key_play: function() {
        if (this.posY === -1) {
            if (!this.loadingData) {
                if (!this.posX) {
                    this.periodPos++;
                    if (this.periodPos > 4) this.periodPos = 1;
                    this.SetPeriod();
                    Screens_StartLoad();
                } else {
                    PlayClip_All = true;
                    Screens_removeFocusFallow();
                    this.posX = 0;
                    this.posY = 0;
                    Main_OpenClip(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
                }
            }
        } else Main_OpenClip(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
    },
    concatenate: function(responseText) {
        if (this.data) {
            var tempObj = JSON.parse(responseText);
            this.cursor = tempObj._cursor;
            if (this.cursor === '') this.dataEnded = true;
            this.data = this.data.concat(tempObj.clips);
            this.loadingData = false;
        } else {
            this.data = JSON.parse(responseText);
            this.cursor = this.data._cursor;
            if (this.cursor === '') this.dataEnded = true;

            this.data = this.data.clips;
            this.loadDataSuccess();
            this.loadingData = false;
        }
    },
    Cells: [],
    addCell: function(cell) {
        if (!this.idObject[cell.tracking_id]) {
            this.itemsCount++;
            this.idObject[cell.tracking_id] = 1;

            this.row.appendChild(Screens_createCellClip(this.row_id,
                this.coloumn_id,
                this.ids,
                cell.thumbnails.medium,
                cell.broadcaster.display_name,
                [STR_CREATED_AT,
                    Main_videoCreatedAt(cell.created_at)
                ],
                [twemoji.parse(cell.title), STR_PLAYING, cell.game],
                Main_addCommas(cell.views),
                '[' + cell.language.toUpperCase() + ']',
                cell.duration,
                cell.slug,
                cell.broadcaster.name,
                cell.broadcaster.logo.replace("150x150", "300x300"),
                cell.broadcaster.id,
                (cell.vod !== null ? cell.vod.id : null),
                (cell.vod !== null ? cell.vod.offset : null)));

            this.coloumn_id++;
        }
    }
};

function ScreensObj_InitClip() {
    Clip = Screens_assign({
        ids: Screens_ScreenIds('Clip'),
        table: 'stream_table_clip',
        screen: Main_Clip,
        periodPos: Main_getItemInt('Clip_periodPos', 2),
        base_url: 'https://api.twitch.tv/kraken/clips/top?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            this.url = this.base_url + '&period=' + this.period[this.periodPos - 1] +
                (this.cursor ? '&cursor=' + this.cursor : '') +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        SetPeriod: function() {
            Main_innerHTML('top_bar_clip', STR_CLIPS + Main_UnderCenter(Main_Periods[this.periodPos - 1]));
            Main_setItem('Clip_periodPos', this.periodPos);
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 5;
            this.SetPeriod();
            Main_AddClass('top_bar_clip', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
        },
        label_exit: function() {
            Main_RestoreTopLabel();
            Main_RemoveClass('top_bar_clip', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
        },
    }, Base_obj);

    Clip = Screens_assign(Clip, Base_Clip_obj);
    Clip.set_ThumbSize();
}

function ScreensObj_InitChannelClip() {
    ChannelClip = Screens_assign({
        ids: Screens_ScreenIds('ChannelClip'),
        table: 'stream_table_channel_clip',
        screen: Main_ChannelClip,
        periodPos: Main_getItemInt('ChannelClip_periodPos', 2),
        base_url: 'https://api.twitch.tv/kraken/clips/top?channel=',
        set_url: function() {
            this.url = this.base_url + encodeURIComponent(Main_values.Main_selectedChannel) +
                '&limit=' + Main_ItemsLimitMax + '&period=' +
                this.period[this.periodPos - 1] + (this.cursor ? '&cursor=' + this.cursor : '');
        },
        SetPeriod: function() {
            Main_innerHTML('top_bar_game', STR_CLIPS + Main_Periods[this.periodPos - 1]);
            Main_setItem('ChannelClip_periodPos', this.periodPos);
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 1;
            if (!Main_values.Search_isSearching && Main_values.Main_selectedChannel_id)
                ChannelContent_RestoreChannelValue();
            if (Main_values.Main_selectedChannel !== this.lastselectedChannel) this.status = false;
            Main_cleanTopLabel();
            this.SetPeriod();
            Main_textContent('top_bar_user', Main_values.Main_selectedChannelDisplayname);
            Main_IconLoad('label_side_panel', 'icon-arrow-circle-left', STR_GOBACK);
            this.lastselectedChannel = Main_values.Main_selectedChannel;
        },
        label_exit: Main_RestoreTopLabel,
    }, Base_obj);

    ChannelClip = Screens_assign(ChannelClip, Base_Clip_obj);
    ChannelClip.set_ThumbSize();
}

function ScreensObj_InitAGameClip() {
    AGameClip = Screens_assign({
        ids: Screens_ScreenIds('AGameClip'),
        table: 'stream_table_a_game_clip',
        screen: Main_AGameClip,
        periodPos: Main_getItemInt('AGameClip_periodPos', 2),
        base_url: 'https://api.twitch.tv/kraken/clips/top?game=',
        set_url: function() {
            this.url = this.base_url + encodeURIComponent(Main_values.Main_gameSelected) + '&limit=' + Main_ItemsLimitMax +
                '&period=' + this.period[this.periodPos - 1] + (this.cursor ? '&cursor=' + this.cursor : '') +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        SetPeriod: function() {
            Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter(STR_CLIPS +
                Main_Periods[this.periodPos - 1] + ': ' + Main_values.Main_gameSelected));
            Main_setItem('AGameClip_periodPos', this.periodPos);
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 3;
            this.SetPeriod();
            Main_AddClass('top_bar_game', 'icon_center_focus');
            Main_IconLoad('label_side_panel', 'icon-arrow-circle-left', STR_GOBACK);
            if (this.gameSelected !== Main_values.Main_gameSelected) this.status = false;
            this.gameSelected = Main_values.Main_gameSelected;
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
            Main_innerHTML('top_bar_game', STR_GAMES);
            Main_IconLoad('label_side_panel', 'icon-ellipsis', STR_SIDE_PANEL);
        },
    }, Base_obj);

    AGameClip = Screens_assign(AGameClip, Base_Clip_obj);
    AGameClip.set_ThumbSize();
}

var Base_Game_obj = {
    ThumbSize: 19.35,
    visiblerows: 3,
    ItemsLimit: Main_ItemsLimitGame,
    ItemsReloadLimit: Main_ItemsReloadLimitGame,
    ColoumnsCount: Main_ColoumnsCountGame,
    addFocus: Screens_addFocusGame,
    img_404: IMG_404_GAME,
    empty_str: function() {
        return STR_NO + STR_LIVE_GAMES;
    },
    concatenate: function(responseText) {
        if (this.data) {
            var tempObj = JSON.parse(responseText);

            this.MaxOffset = tempObj._total;
            this.data = this.data.concat(this.screen === Main_usergames ? tempObj.follows : tempObj.top);

            this.offset = this.data.length;
            if (this.offset > this.MaxOffset) this.dataEnded = true;

            this.loadingData = false;
        } else {

            this.data = JSON.parse(responseText);

            this.MaxOffset = this.data._total;
            this.data = this.screen === Main_usergames ? this.data.follows : this.data.top;

            this.offset = this.data.length;
            if (this.isLive) this.dataEnded = true;
            else if (this.offset > this.MaxOffset) this.dataEnded = true;

            this.loadDataSuccess();
            this.loadingData = false;
        }
    },
    key_play: function() {
        Main_values.Main_gameSelected = document.getElementById(this.ids[5] + this.posY + '_' + this.posX).getAttribute(Main_DataAttribute);
        document.body.removeEventListener("keydown", Screens_handleKeyDown);
        Main_values.Main_BeforeAgame = this.screen;
        Main_values.Main_Go = Main_aGame;
        Main_values.Main_BeforeAgameisSet = true;

        Main_addFocusVideoOffset = 0;
        document.body.removeEventListener("keydown", Screens_handleKeyDown);
        Main_HideElement(this.ids[10]);

        Main_SwitchScreenAction();
        Main_removeFocus(this.posY + '_' + this.posX, this.ids);
    },

    addCell: function(cell) {
        var hasLive = this.isLive || this.screen === Main_games;
        var game = hasLive ? cell.game : cell;
        if (!this.idObject[game._id]) {

            this.itemsCount++;
            this.idObject[game._id] = 1;

            this.row.appendChild(Screens_createCellGame(this.row_id,
                this.coloumn_id,
                this.ids,
                game.box.template.replace("{width}x{height}", Main_GameSize),
                game.name,
                hasLive ? Main_addCommas(cell.channels) + ' ' + STR_CHANNELS + STR_FOR + Main_addCommas(cell.viewers) + STR_VIEWER : ''));

            this.coloumn_id++;
        }
    }
};

function ScreensObj_InitGame() {
    Game = Screens_assign({
        ids: Screens_ScreenIds('Game'),
        table: 'stream_table_games',
        screen: Main_games,
        base_url: 'https://api.twitch.tv/kraken/games/top?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + '&offset=' + this.offset;
        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 3;
            Main_AddClass('top_bar_game', 'icon_center_focus');
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
        },
    }, Base_obj);

    Game = Screens_assign(Game, Base_Game_obj);
    Game.set_ThumbSize();
}

function ScreensObj_InitUserGames() {
    UserGames = Screens_assign({
        ids: Screens_ScreenIds('UserGames'),
        table: 'stream_table_user_games',
        screen: Main_usergames,
        isLive: Main_getItemBool('user_Games_live', true),
        OldUserName: '',
        base_url: 'https://api.twitch.tv/api/users/',
        set_url: function() {
            if (this.offset && (this.offset + Main_ItemsLimitMax) > this.MaxOffset) this.dataEnded = true;
            this.url = this.base_url + encodeURIComponent(AddUser_UsernameArray[Main_values.Users_Position].name) + '/follows/games';

            if (this.isLive) this.url += '/live?limit=750';
            else this.url += '?limit=' + Main_ItemsLimitMax + '&offset=' + this.offset;
        },
        key_refresh: function() {
            this.isLive = !this.isLive;

            Main_innerHTML('top_bar_user', STR_USER + Main_UnderCenter(AddUser_UsernameArray[Main_values.Users_Position].name + ' ' + (this.isLive ? STR_LIVE_GAMES : STR_FALLOW_GAMES)));

            Screens_StartLoad();

            Main_setItem('user_Games_live', this.isLive ? 'true' : 'false');
            if (Users_status) Users_resetGameCell();

        },
        label_init: function() {
            Main_values.Main_CenterLablesVectorPos = 1;
            Main_IconLoad('label_refresh', 'icon-refresh', STR_USER_GAMES_CHANGE + STR_LIVE_GAMES + '/' + STR_FALLOW_GAMES + ":" + STR_GUIDE);
            Main_IconLoad('label_side_panel', 'icon-arrow-circle-left', STR_GOBACK);
            Main_AddClass('top_bar_user', 'icon_center_focus');

            if (this.OldUserName !== AddUser_UsernameArray[Main_values.Users_Position].name) this.status = false;

            this.OldUserName = AddUser_UsernameArray[Main_values.Users_Position].name;

            Main_innerHTML('top_bar_user', STR_USER + Main_UnderCenter(AddUser_UsernameArray[Main_values.Users_Position].name + ' ' + (this.isLive ? STR_LIVE_GAMES : STR_FALLOW_GAMES)));
        },
        label_exit: function() {
            Main_values.Users_Position = 0;
            Main_RemoveClass('top_bar_user', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
            Main_textContent('top_bar_user', STR_USER);
            Main_IconLoad('label_side_panel', 'icon-ellipsis', STR_SIDE_PANEL);
        },
    }, Base_obj);

    UserGames = Screens_assign(UserGames, Base_Game_obj);
    UserGames.set_ThumbSize();
}