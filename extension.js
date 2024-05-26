//game.import(name:"AI优化"
import { lib, game, ui, get, ai, _status } from '../../noname.js'
import { config } from './js/config.js'
import { precontent } from './js/precontent.js'
import { help } from './js/help.js'

const extensionInfo = await lib.init.promises.json(`${lib.assetURL}extension/AI优化/info.json`);
let extensionPackage = {
	name: "AI优化",
	content: function(){},
	precontent: precontent,
	config: config,
	help: help,
	package: {},
	files: {}
};

Object.keys(extensionInfo).filter(key => key != 'name').forEach(key => {
	extensionPackage.package[key] = extensionInfo[key]
});

export let type = 'extension';
export default extensionPackage;