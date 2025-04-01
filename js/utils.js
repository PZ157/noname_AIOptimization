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
 * 伪禁ban武将
 * @param { HTMLElement } temp 临时显示元素
 * @param { string } identity 身份
 * @param { string } info 身份提示
 */
game.aiyh_configBan = (temp, identity, info) => {
	game.prompt(
		ui.joint`
            请输入要${info}AI禁选的武将id
            （如标曹操为“caocao”，神曹操为“shen_caocao”），
            再次输入同id即可退出
        `,
		(str) => {
			if (!str) return;

			const char = lib.character[str];
			let lists = lib.config[`extension_AI优化_${identity}`] || [];
			const isAdded = lists.includes(str);

			if (char) {
				if (isAdded) {
					lists.remove(str);
					temp.innerHTML = ui.joint`
                        <div style="color:rgb(210,210,000); font-family:xinwei">
                            <font size="4">${lib.translate[str] || '未知'}已移出${info}AI禁选</font>
                        </div>
                    `;
				} else {
					lists.push(str);
					temp.innerHTML = ui.joint`
                        <div style="color:rgb(255,97,3); font-family:xinwei">
                            <font size="4">${lib.translate[str] || '未知'}已加入${info}AI禁选</font>
                        </div>
                    `;
				}

				game.saveExtensionConfig('AI优化', identity, lists);
			} else {
				temp.innerHTML = ui.joint`
                    <div style="color:rgb(255,0,0); font-family:xinwei">
                        <font size="4">找不到该武将</font>
                    </div>
                `;
			}

			temp.ready = true;

			setTimeout(() => {
				temp.innerHTML = ui.joint`<li>${info}AI禁将`;
				delete temp.ready;
			}, 1600);
		}
	);
};

/**
 * 伪禁identity身份禁将表
 * @param { string } identity 身份
 * @param { string } info 身份提示
 */
game.aiyh_configBanList = (identity, info) => {
	var h = document.body.offsetHeight;
	var w = document.body.offsetWidth;
	var lists = lib.config['extension_AI优化_' + identity] || [];
	//改自『手杀UI』和『群英荟萃』
	var SRr = ui.joint`
		<html><head>
			<meta charset='utf-8'>
			<style type='text/css'>
				body {
					background-image: url('${lib.assetURL}extension/AI优化/img/beijing.png');
					background-size: 100% 100%;
					background-position: center;
					--w: 560px;
					--h: calc(var(--w) * 610/1058);
					width: var(--w);
					height: var(--h);
					background-repeat: no-repeat;
					background-attachment: fixed;
				}
				h1 {
					text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;
					font-size:20px
				}
				div {
					width: 160vmin;
					height: 63vmin;
					border: 0px solid black;
					border-radius: 9px;
					padding: 35px;
					margin-top: 5.5vmin;
					margin-bottom: 5.5vmin;
					margin-left: 10.5vmin;
					margin-right: 10.5vmin;
					position: center;
				}
				div.ex1 {
					width: 160vmin;
					height: 63vmin;
					overflow: auto;
				}
			</style>
		</head>
		<body><div class='ex1'>
	`;
	if (lists && lists.length > 0) {
		for (let i = 0; i < lists.length; i++) {
			SRr += '〖';
			if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
			else SRr += lists[i] + '〗';
		}
		SRr += '</div></body></html>';
	} else SRr += '亲～您尚未禁将</div></body></html>';
	var banList = ui.create.div(
		'',
		ui.joint`
			<div style="z-index:114514">
				<iframe width="${w}px" height="${h}px" srcdoc="<!DOCTYPE html>${SRr}"></iframe>
			</div>
		`,
		ui.window
	);
	ui.create.div(
		'',
		ui.joint`
			<div style="height:10px; width:${w}px; text-align:center; z-index:114514">
				<font size="5em">关闭</font>
			</div>
		`,
		banList,
		() => {
			banList.delete();
		}
	);
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
