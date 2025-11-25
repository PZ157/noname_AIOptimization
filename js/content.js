import { lib, game, ui, get, ai, _status } from './utils.js';

export function content(config, pack) {
	const cssPath = lib.assetURL + 'extension/AI优化/css/AIjinjiang.css';
	lib.init.css(cssPath.slice(0, cssPath.lastIndexOf('/')), cssPath.split('/').pop().slice(0, -4));
}
