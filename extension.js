import { lib, game, ui, get, ai, _status } from '../../noname.js'
import extensionInfo from './info.json' assert {type: 'json'}
import { content } from './js/content.js'
import { precontent } from './js/precontent.js'
import config from './js/config.js'
import help from './js/help.js'

export let type = 'extension';

let extensionPackage = {
	name: "AI优化",
	content: content,
	precontent: precontent,
	config: config,
	help: help,
	package: {},
	files: { "character": [], "card": [], "skill": [], "audio": [] }
};

Object.keys(extensionInfo).filter(key => key != 'name').forEach(key => {
	extensionPackage.package[key] = extensionInfo[key]
});

export default extensionPackage;