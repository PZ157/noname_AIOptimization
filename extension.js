import { lib, game, ui, get, ai, _status } from './js/utils.js';
import { arenaReady } from './js/arenaReady.js';
import { config } from './js/config.js';
import { content } from './js/content.js';
import { precontent } from './js/precontent.js';
import { help } from './js/help.js';
const extensionInfo = await lib.init.promises.json(`${lib.assetURL}extension/AI优化/info.json`);
let extensionPackage = {
	name: 'AI优化',
	arenaReady,
	content,
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
