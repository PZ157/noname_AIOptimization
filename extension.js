import { lib, game, ui, get, ai, _status } from './js/utils.js';
import { arenaReady } from './js/arenaReady.js';
import { config } from './js/config.js';
import { precontent } from './js/precontent.js';
import { help } from './js/help.js';
const extensionInfo = await lib.init.promises.json(`${lib.assetURL}extension/AI优化/info.json`);
let extensionPackage = {
	name: 'AI优化',
	arenaReady,
	content: function () {
		const cssPath = lib.assetURL + 'extension/AI优化/css/AIjinjiang.css';
		lib.init.css(cssPath.slice(0, cssPath.lastIndexOf('/')), cssPath.split('/').pop().slice(0, -4));
		console.log('AI优化CSS加载路径：', cssPath);
	},
	precontent,
	config,
	help,
	package: {},
	files: {},
	css: [],
};
Object.keys(extensionInfo)
	.filter((key) => key !== 'name')
	.forEach((key) => {
		extensionPackage.package[key] = extensionInfo[key];
	});
export let type = 'extension';
export default extensionPackage;
