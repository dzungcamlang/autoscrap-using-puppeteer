'use strict';
var tools = require('./common.js');
const SITE = 'amazon';
const LOGIN_PAGE = 'https://www.amazon.fr/ap/signin?clientContext=258-4561653-2126922&openid.return_to=https%3A%2F%2Fmusic.amazon.fr%2Fhome%3Freferer%3Dhttps%253A%252F%252Fmusic.amazon.fr%252Fhome%26ref_%3Ddm_wcp_unrec_ctxt_sign_in&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amzn_webamp_fr&openid.mode=checkid_setup&marketPlaceId=A13V1IB3VIYZZH&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&pageId=amzn_cpweb&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.pape.max_auth_age=0&siteState=clientContext%3D262-9219716-3246527%2CsourceUrl%3Dhttps%253A%252F%252Fmusic.amazon.fr%252Fhome%253Freferer%253Dhttps%25253A%25252F%25252Fmusic.amazon.fr%25252Fhome%2526ref_%253Ddm_wcp_unrec_ctxt_sign_in%2Csignature%3Dnull';
const PLAYLIST='https://music.amazon.fr/my/songs';
const LOGGED_IN_CHECK = 'a#account-settings-link';
const INPUT_USERNAME = 'input#ap_email';
const INPUT_PASSWORD = 'input#ap_password';
const LOGIN_BUTTON = '#signInSubmit';
const PLAY_BUTTON = '.button.playerIcon.playButton.playerIconPlay.transportButton';
const SKIP_BUTTON = '.button.nextButton.icon-fastForward.transportButton';
const PAUSE_BUTTON = '.button.playerIcon.playButton.playerIconPause.transportButton';
const RANDOM_BUTTON = '.shuffleButton.playerIconShuffle.transportButton.transportButton';
const RANDOM_BUTTON_ACTIVATED = '.shuffleButton.playerIconShuffle.transportButton.on.transportButton';
const LOOP_BUTTON = '.repeatButton.playerIconRepeat.transportButton.transportButton';
const LOOP_BUTTON_ACTIVATED = '.repeatButton.playerIconRepeat.transportButton.on.transportButton';
//
//
const page = tools.getMusicPage(SITE, LOGIN_PAGE, INPUT_USERNAME, INPUT_PASSWORD, LOGIN_BUTTON, LOGGED_IN_CHECK, PLAYLIST, PLAY_BUTTON, SKIP_BUTTON, PAUSE_BUTTON, RANDOM_BUTTON, RANDOM_BUTTON_ACTIVATED, LOOP_BUTTON, LOOP_BUTTON_ACTIVATED);
