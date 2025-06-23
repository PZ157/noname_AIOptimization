import { lib, game, ui, get, ai, _status } from '../../../noname.js';
import security from '../../../noname/util/security.js';

/**
 * 获取专项优化技能配置
 * @param { string } skill 对应技能
 * @param { string } info 提示内容
 * @param { string } id 配置ID
 */
game.aiyh_skillOptEnabled = (skill, info, id) => {
	if (!id || typeof id !== 'string') id = skill;
	if (lib.config['aiyh_character_skill_id_' + id] === undefined) {
		lib.config['aiyh_character_skill_id_' + id] = true;
	}
	if (typeof info !== 'string') info = '优化〖' + (lib.translate[skill] || skill) + '〗ai';
	if (!lib.aiyh.skillModify[skill]) lib.aiyh.skillModify[skill] = [];
	lib.aiyh.skillModify[skill].push({
		skill: skill,
		info: info,
		id: id,
	});
	return lib.config['aiyh_character_skill_id_' + id];
};

/**
 * 复制文本内容到剪贴板
 * @param { string } text - 要复制的文本
 * @param { string | false } [success] - 成功提示语
 * @param { string | false } [fail] - 失败提示语
 * @returns { boolean }
 */
game.copy = (text, success = '已成功复制到剪贴板', fail = '复制失败') => {
	if (typeof text !== 'string') return;
	let copied = false;
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	textarea.style.width = '1px';
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	try {
		copied = document.execCommand('copy');
		if (copied) {
			success && alert(success);
		} else {
			fail && alert(fail);
		}
	} catch (e) {
		console.error('execCommand失败:', e);
		fail && alert(fail);
	}
	document.body.removeChild(textarea);
	return copied;
};

/**
 * 伪连接字符串，去掉换行和两端空串
 * @param { TemplateStringsArray } strings 模板字符串
 * @param { ...any } values 插值
 * @returns { string }
 */
ui.joint = function (strings, ...values) {
	let str = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
	let lines = str.split('\n').map((line) => line.trimStart());
	return lines.join('').trim();
};

export { lib, game, ui, get, ai, _status, security };
