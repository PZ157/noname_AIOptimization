import { lib, game, ui, get, ai, _status } from './noname.js'

export function precontent(config, pack) {
	game.aiyh_skillOptEnabled = function (skill, info, id) {
		if (!id || typeof id !== 'string') id = skill;
		if (lib.config['aiyh_character_skill_id_' + id] === undefined) {
			lib.config['aiyh_character_skill_id_' + id] = true;
		}
		if (typeof info !== 'string') info = '优化〖' + (lib.translate[skill] || skill) + '〗ai';
		if (!lib.aiyh.skillModify[skill]) lib.aiyh.skillModify[skill] = [];
		lib.aiyh.skillModify[skill].push({
			skill: skill,
			info: info,
			id: id
		});
		return lib.config['aiyh_character_skill_id_' + id];
	};
	game.aiyh_configBan = (temp, identity, info) => {
		game.prompt('请输入要' + info + 'AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
			if (str) {
				var thisstr = '';
				if (lib.character[str]) {
					thisstr = str;
					var lists = lib.config['extension_AI优化_' + identity] || [];
					if (lists && lists.includes(thisstr)) {
						lists.remove(thisstr);
						temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出' + info + 'AI禁选</font></div>';
						temp.ready = true;
						setTimeout(() => {
							temp.innerHTML = '<li>' + info + 'AI禁将';
							delete temp.ready;
						}, 1600);
					} else {
						lists.push(thisstr);
						temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入' + info + 'AI禁选</font></div>';
						temp.ready = true;
						setTimeout(() => {
							temp.innerHTML = '<li>' + info + 'AI禁将';
							delete temp.ready;
						}, 1600);
					}
					game.saveExtensionConfig('AI优化', identity, lists);
				} else {
					temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
					temp.ready = true;
					setTimeout(() => {
						temp.innerHTML = '<li>' + info + 'AI禁将';
						delete temp.ready;
					}, 1600);
				}
			}
		});
	};
	game.aiyh_configBanList = (identity, info) => {
		var h = document.body.offsetHeight;
		var w = document.body.offsetWidth;
		var lists = lib.config['extension_AI优化_' + identity] || [];
		//改自手杀ui和群英荟萃
		var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/img/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
		if (lists && lists.length > 0) {
			for (let i = 0; i < lists.length; i++) {
				SRr += '〖';
				if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
				else SRr += lists[i] + '〗';
			}
			SRr += '</div></body></html>';
		}
		else SRr += "亲～您尚未禁将</div></body></html>";
		var banList = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
		var banList_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', banList, function () {
			banList.delete();
		});
	};
	lib.get.statusModeInfo = function (sf) {//获取当前游戏模式名称
		let info = lib.translate[get.mode()];
		if (_status.mode && (!sf || lib.config.extension_AI优化_apart)) {
			let sm;
			switch (get.mode()) {
				case 'identity':
					if (_status.mode == 'normal') sm = '标准';
					else if (_status.mode == 'zhong') sm = '明忠';
					else if (_status.mode == 'purple') sm = '3v3v2';
					break;
				case 'guozhan':
					if (_status.mode == 'normal') sm = '势备';
					else if (_status.mode == 'yingbian') sm = '应变';
					else if (_status.mode == 'old') sm = '怀旧';
					else if (_status.mode == 'free') sm = '自由';
					break;
				case 'versus':
					if (_status.mode == 'four') sm = '对抗';
					else if (_status.mode == 'three') sm = '统率';
					else if (_status.mode == 'two') sm = '欢乐';
					else if (_status.mode == 'guandu') sm = '官渡';
					else if (_status.mode == 'jiange') sm = '剑阁';
					else if (_status.mode == 'siguo') sm = '四国';
					else if (_status.mode == 'standard') sm = '自由';
					break;
				case 'doudizhu':
					if (_status.mode == 'normal') sm = '休闲';
					else if (_status.mode == 'kaihei') sm = '开黑';
					else if (_status.mode == 'huanle') sm = '欢乐';
					else if (_status.mode == 'binglin') sm = '兵临';
					else if (_status.mode == 'online') sm = '智斗';
					break;
				case 'single':
					lib.translate[_status.mode + '2'];
					break;
				case 'chess':
					if (_status.mode == 'combat') sm = '自由';
					else if (_status.mode == 'three') sm = '统率';
					else if (_status.mode == 'leader') sm = '君主';
					break;
			}
			if (sm) info += ' - ' + sm;
		}
		return info + '模式';
	};
	lib.get.identityInfo = function (str) {
		/*获取字符串中最后一个'_'后面的身份翻译
		参数：待清洗字符串
		*/
		if (typeof str != 'string') return '';
		let clean = str.split('_');
		if (get.sfConfigName().length <= 1) return '';
		clean = clean[clean.length - 1];
		if (clean.indexOf('unknown') == 0) return '未知';
		if (isNaN(parseInt(clean[clean.length - 1]))) clean += '2';
		let trans = lib.translate[clean];
		if (typeof trans != 'string') return '';
		return trans;
	};
	lib.get.sfConfigName = function (identity) {
		/*获取当前游戏模式下武将的胜负统计配置名
		参数：身份
		有身份 返回当前游戏模式胜负统计对应身份配置名（字符串）
		无身份 返回所有可能的身份配置名（数组）
		*/
		let mode = get.mode(), cgn = 'extension_AI优化_' + mode, sm = '';
		if (_status.mode && lib.config.extension_AI优化_apart && _status.mode != 'deck') sm = '_' + _status.mode;
		if (typeof identity != 'string') {
			if (mode == 'identity') {
				if (_status.mode == 'purple') return [cgn + sm + '_rZhu', cgn + sm + '_rZhong', cgn + sm + '_rNei', cgn + sm + '_rYe'];
				let configs = [];
				configs.addArray([cgn + sm + '_zhu', cgn + sm + '_zhong', cgn + sm + '_fan', cgn + sm + '_nei']);
				if (_status.mode == 'zhong') configs.push(cgn + sm + '_mingzhong');
				return configs;
			}
			if (mode == 'doudizhu' || mode == 'single') return [cgn + sm + '_zhu', cgn + sm + '_fan'];
			return [cgn + sm];
		}
		if (mode == 'identity' && _status.mode == 'purple') return cgn + sm + '_r' + identity.slice(1);
		if (mode == 'identity' || mode == 'doudizhu' || mode == 'single') return cgn + sm + '_' + identity;
		return cgn + sm;
	};
	lib.get.purifySFConfig = function (config, min) {//筛选至少min场的胜负记录
		if (Object.prototype.toString.call(config) !== '[object Object]') return {};
		if (typeof min != 'number' || isNaN(min)) min = 0;
		let result = {}, judge = false;
		for (let i in config) {
			if (!judge) {
				if (Object.prototype.toString.call(config[i]) !== '[object Object]') return config;
				judge = true;
			}
			if (config[i].win + config[i].lose >= min) result[i] = config[i];
		}
		return result;
	};
	lib.get.sfInit = function (sf, now) {//初始化
		let cgn;
		if (typeof sf != 'string') cgn = get.sfConfigName();
		else cgn = [sf];
		for (let sf of cgn) {
			if (Object.prototype.toString.call(lib.config[sf]) !== '[object Object]') {
				let sftj = sf.replace('AI优化', '胜负统计');
				if (Object.prototype.toString.call(lib.config[sftj]) === '[object Object]' && Object.entries(lib.config[sftj]).length) {
					game.saveConfig(sf, lib.config[sftj]);
					alert('成功导入《胜负统计》中当前模式下' + get.identityInfo(sf) + '的统计数据');
				}
				else lib.config[sf] = {};
			}
			for (let i in lib.config[sf]) {
				let all = lib.config[sf][i].win + lib.config[sf][i].lose;
				if (all) lib.config[sf][i].sl = lib.config[sf][i].win / all;
				else lib.config[sf][i].sl = 0;
				if (!now && lib.config.extension_AI优化_display != 'off') {
					if (lib.characterTitle[i] == undefined) lib.characterTitle[i] = '';
					else lib.characterTitle[i] += '<br>';
					lib.characterTitle[i] += get.identityInfo(sf) + '<br>';
					if (lib.config.extension_AI优化_display != 'sf') lib.characterTitle[i] += '总场数：' + all + ' 胜率：' + Math.round(10000 * lib.config[sf][i].sl) / 100 + '%<br>';
					if (lib.config.extension_AI优化_display != 'sl') lib.characterTitle[i] += lib.config[sf][i].win + '胜 ' + lib.config[sf][i].lose + '负<br>';
				}
			}
			game.saveConfig(sf, lib.config[sf]);
		}
	};
	{//本体版本检测
		let noname = lib.version.split('.').slice(2), min = ['4'], len = Math.min(noname.length, min.length), status = false;
		if (lib.version.slice(0, 5) === '1.10.') for (let i = 0; i < len; i++) {
			if (noname[i] < min[i]) {
				status = '您的无名杀版本太低';
				break;
			}
			if (i === 0 && (noname[i] === '4' || noname[i] === '5')) {
				if (localStorage.getItem('aiyh_version_check_alerted') !== lib.version) {
					localStorage.setItem('aiyh_version_check_alerted', lib.version);
					alert('为适配最新版本，［载入本扩展配置］［编辑伪禁列表］［编辑武将权重］［编辑修改的技能威胁度］等功能于当前版本无法使用，请及时更新无名杀至1.10.6及以上或使用《AI优化》1.3.5.5版本');
				}
				break;
			}
		}
		else status = '检测到游戏大版本号与本扩展支持版本号不同';
		if (typeof status === 'string') {
			alert(status + '，为避免版本不兼容产生不必要的问题，已为您关闭《AI优化》，稍后重启游戏');
			game.saveExtensionConfig('AI优化', 'enable', false);
			game.reload();
		}
	}
	if (lib.config.extension_AI优化_changelog !== lib.extensionPack.AI优化.version) lib.game.showChangeLog = function () {//更新内容
		let str = [
			'<center><font color=#00FFFF>更新日期</font>：<font color=#FFFF00>24</font>年<font color=#00FFB0>3</font>月<font color=fire>8</font>日</center>',
			'◆［修改武将评级显示］增加临时选项〔混合评级〕',
			'◆部分素材更换为更清晰的版本'
		];
		let ul = document.createElement('ul');
		ul.style.textAlign = 'left';
		for (let i = 0; i < str.length; i++) {
			let li = document.createElement('test');
			li.innerHTML = str[i] + '<br>';
			ul.appendChild(li);
		}
		game.saveExtensionConfig('AI优化', 'changelog', lib.extensionPack.AI优化.version);
		let dialog = ui.create.dialog('AI优化 ' + lib.extensionPack.AI优化.version + ' 更新内容：', 'hidden');
		let lic = ui.create.div(dialog.content);
		lic.style.display = 'block';
		ul.style.display = 'inline-block';
		ul.style.marginLeft = '-40px';
		lic.appendChild(ul);
		dialog.open();
		let hidden = false;
		if (!ui.auto.classList.contains('hidden')) {
			ui.auto.hide();
			hidden = true;
		}
		game.pause();
		let control = ui.create.control('确定', function () {
			dialog.close();
			control.close();
			if (hidden) ui.auto.show();
			game.resume();
		});
		lib.init.onfree();
	};
	lib.arenaReady.push(function () {//杂项
		if (!lib.aiyh) lib.aiyh = {};
		if (!lib.aiyh.qz) lib.aiyh.qz = {};
		if (!lib.aiyh.skillModify) lib.aiyh.skillModify = {};
		if (!Array.isArray(lib.config.extension_AI优化_wj)) game.saveExtensionConfig('AI优化', 'wj', []);
		if (!Array.isArray(lib.config.extension_AI优化_zhu)) game.saveExtensionConfig('AI优化', 'zhu', []);
		if (!Array.isArray(lib.config.extension_AI优化_zhong)) game.saveExtensionConfig('AI优化', 'zhong', []);
		if (!Array.isArray(lib.config.extension_AI优化_fan)) game.saveExtensionConfig('AI优化', 'fan', []);
		if (!Array.isArray(lib.config.extension_AI优化_nei)) game.saveExtensionConfig('AI优化', 'nei', []);
		if (!Array.isArray(lib.config.extension_AI优化_dizhu)) game.saveExtensionConfig('AI优化', 'dizhu', []);
		if (!Array.isArray(lib.config.extension_AI优化_nongmin)) game.saveExtensionConfig('AI优化', 'nongmin', []);
		let sortedKeys, sortedObj;
		/*权重初始化*/
		if (Object.prototype.toString.call(lib.config.extension_AI优化_qz) !== '[object Object]') lib.config.extension_AI优化_qz = {};
		let qz = '';
		sortedKeys = Object.keys(lib.config.extension_AI优化_qz).sort();
		sortedObj = {};
		sortedKeys.forEach((key) => {
			sortedObj[key] = lib.config.extension_AI优化_qz[key];
		});
		game.saveExtensionConfig('AI优化', 'qz', sortedObj);
		for (let i in lib.config.extension_AI优化_qz) {
			qz += '<option value=' + i + '>' + lib.translate[i] + '(' + i + ')：' + lib.config.extension_AI优化_qz[i] + '</option>';
		}
		//选项显示摘自@Aurora《战斗记录》
		lib.extensionMenu.extension_AI优化.chooseQz.name = '请选择要删除的武将权重<br><select id="AI优化_chooseQz" size="1" style="width:180px">' + qz + '</select>';
		/*威胁度初始化*/
		if (Object.prototype.toString.call(lib.config.extension_AI优化_cf) !== '[object Object]') lib.config.extension_AI优化_cf = {};
		let cf = '';
		sortedKeys = Object.keys(lib.config.extension_AI优化_cf).sort();
		sortedObj = {};
		sortedKeys.forEach((key) => {
			sortedObj[key] = lib.config.extension_AI优化_cf[key];
		});
		game.saveExtensionConfig('AI优化', 'cf', sortedObj);
		for (let i in lib.config.extension_AI优化_cf) {
			cf += '<option value=' + i + '>' + i + ' | ' + (lib.translate[i] || '无') + '：' + lib.config.extension_AI优化_cf[i] + '</option>';
		}
		lib.extensionMenu.extension_AI优化.chooseCf.name = '<span style="font-family: xinwei">请选择要删除的技能威胁度</span><br><select id="AI优化_chooseCf" size="1" style="width:180px">' + cf + '</select>';
		if (lib.config.extension_AI优化_viewAtt) {//火眼金睛
			ui.create.system('查看态度', function () {
				var STR = '';
				for (var i = 0; i < game.players.length; i++) {
					var str = '';
					for (var j = 0; j < game.players.length; j++) {
						str += get.translation(game.players[i]) + '对' + get.translation(game.players[j]) + '的态度为' + get.attitude(game.players[i], game.players[j]) + '\n';
					}
					STR += str + '\n';
				}
				alert(STR);
			}, true);
		}
		if (lib.config.extension_AI优化_removeMini) {/*小游戏*/
			if (lib.skill.chongxu && game.aiyh_skillOptEnabled('chongxu', '跳过〖冲虚〗小游戏')) {
				lib.skill.chongxu.filter = function (event, player) {
					return !player.getStat('skill').chongxu;
				};
				lib.skill.chongxu.content = function () {
					'step 0'
					let rand = Math.random();
					if (rand > 0.36 || get.isLuckyStar(player)) event.score = 5;
					else if (rand > 0.18) event.score = 4;
					else if (rand > 0.09) event.score = 3;
					else if (rand > 0.04) event.score = 2;
					else event.score = 1;
					game.log(player, '获得了', '#y' + event.score + '分');
					if (event.score < 3) {
						if (event.score >= 2) player.draw();
						event.finish();
						return;
					}
					var list = [];
					if (player.countMark('miaojian') < 2 && player.hasSkill('miaojian')) list.push('修改【妙剑】');
					if (player.countMark('shhlianhua') < 2 && player.hasSkill('shhlianhua')) list.push('修改【莲华】');
					if (list.length) {
						list.push('全部摸牌');
						player.chooseControl(list).set('prompt', '冲虚：修改技能' + (event.score == 5 ? '并摸一张牌' : '') + '；或摸' + Math.floor(event.score / 2) + '张牌');
					} else event._result = { control: '全部摸牌' };
					'step 1'
					var score = event.score;
					if (result.control != '全部摸牌') {
						score -= 3;
						var skill = result.control == '修改【妙剑】' ? 'miaojian' : 'shhlianhua';
						player.addMark(skill, 1, false);
						game.log(player, '修改了技能', '#g【' + get.translation(skill) + '】');
					}
					if (score > 1) player.draw(Math.floor(score / 2));
				};
				delete lib.skill.chongxu.usable;
			}
			if (lib.skill.xinfu_pingcai && game.aiyh_skillOptEnabled('xinfu_pingcai', '跳过〖评才〗小游戏')) {
				lib.skill.xinfu_pingcai.filter = function (event, player) {
					return !player.getStat('skill').xinfu_pingcai;
				};
				lib.skill.xinfu_pingcai.content = function () {
					'step 0'
					var list = ['wolong', 'fengchu', 'xuanjian', 'shuijing'];
					var list2 = [];
					for (var i = 0; i < list.length; i++) {
						list2.push(game.createCard(list[i] + '_card', '', ''));
					}
					event.time = get.utc();
					player.chooseButton(['请选择要擦拭的宝物', list2], true).set('ai', function (button) {
						var player = _status.event.player;
						if (button.link.name == 'xuanjian_card') {
							if (game.hasPlayer(function (current) {
								return current.isDamaged() && current.hp < 3 && get.attitude(player, current) > 1;
							})) return 1 + Math.random();
							return 1;
						} else if (button.link.name == 'wolong_card') {
							if (game.hasPlayer(function (current) {
								return get.damageEffect(current, player, player, 'fire') > 0;
							})) return 1.2 + Math.random();
							return 0.5;
						} else return 0.6;
					});
					'step 1'
					if (get.isLuckyStar(player) || Math.random() > 0.02) {
						event.card = result.links[0];
						game.log(player, '#g擦拭成功');
						player.logSkill('pcaudio_' + event.card.name);
						player.$throw(event.card);
						event.insert(lib.skill.xinfu_pingcai[event.card.name], {
							player: player
						});
					}
					else {
						game.log(player, '#g擦拭失败');
						player.popup('杯具');
					}
				};
				delete lib.skill.xinfu_pingcai.usable;
				delete lib.skill.xinfu_pingcai.chooseButton;
				if (!lib.skill.xinfu_pingcai.ai) lib.skill.xinfu_pingcai.ai = {};
				lib.skill.xinfu_pingcai.ai.luckyStar = true;
			}
			if (lib.skill.yufeng && game.aiyh_skillOptEnabled('yufeng', '跳过〖御风〗小游戏')) {
				lib.skill.yufeng.filter = function (event, player) {
					return !player.getStat('skill').yufeng;
				};
				lib.skill.yufeng.content = function () {
					'step 0'
					let rand = Math.random();
					if (rand > 0.81 || get.isLuckyStar(player)) {
						event.num = 3;
						event.result = true;
					}
					else if (rand > 0.36) event.num = 2;
					else if (rand > 0.15) event.num = 1;
					else {
						event.num = 0;
						event.result = false;
					}
					if (typeof event.result !== 'boolean') {
						if (Math.random() > 0.42) event.result = true;
						else event.result = false;
					}
					'step 1'
					game.log(player, '御风飞行', (event.result ? '#g成功' : '#g失败'));
					player.popup(get.cnNumber(event.num) + '分');
					game.log(player, '获得了', '#y' + event.num + '分');
					if (event.result) player.chooseTarget('请选择【御风】的目标', [1, event.num], (card, player, target) => {
						return target != player && !target.hasSkill('yufeng2');
					}).set('ai', target => {
						let player = _status.event.player, att = -get.attitude(player, target), attx = att * 2;
						if (att <= 0 || target.hasSkill('xinfu_pdgyingshi')) return 0;
						if (target.hasJudge('lebu')) attx -= att;
						if (target.hasJudge('bingliang')) attx -= att;
						return attx / Math.max(2.25, Math.sqrt(target.countCards('h') + 1));
					});
					else {
						if (event.num) player.draw(event.num);
						event.finish();
					}
					'step 2'
					if (result.bool) {
						result.targets.sortBySeat();
						player.line(result.targets, 'green');
						game.log(result.targets, '获得了', '#y“御风”', '效果');
						for (let i of result.targets) i.addSkill('yufeng2');
						if (event.num > result.targets.length) player.draw(event.num - result.targets.length);
					}
					else player.draw(event.num);
				};
				delete lib.skill.yufeng.usable;
				lib.skill.yufeng.ai = {
					order: function () {
						if (game.hasPlayer(current => get.attitude(_status.event.player, current) === 0)) return 2;
						return 10;
					},
					result: { player: 1 }
				};
			};
			if (lib.skill.zhengjing && game.aiyh_skillOptEnabled('zhengjing', '跳过〖整经〗小游戏')) {
				lib.skill.zhengjing.filter = function (event, player) {
					return !player.hasSkill('zhengjing3') && !player.getStat('skill').zhengjing;
				};
				lib.skill.zhengjing.content = function () {
					'step 0'
					var rand = Math.random();
					var num;
					var cards = [];
					var names = [];
					if (get.isLuckyStar(player)) num = 5;
					else if (game.players.length + game.dead.length > 3) {
						if (rand > 0.45) num = 5;
						else if (rand > 0.3) num = 4;
						else if (rand > 0.21) num = 3;
						else if (rand > 0.12) num = 2;
						else if (rand > 0.09) num = 1;
						else num = 0;
					}
					else {
						if (rand > 0.21) num = 3;
						else if (rand > 0.12) num = 2;
						else if (rand > 0.09) num = 1;
						else num = 0;
					}
					while (cards.length < num) {
						var card = get.cardPile2(function (card) {
							for (let i of cards) {
								if (card.name == i.name) return false;
							}
							return true;
						});
						if (card) {
							cards.push(card);
							names.push(card.name);
						} else break;
					}
					event.cards = cards;
					'step 1'
					if (cards.length) {
						player.showCards(cards, get.translation(player) + '整理出了以下经典');
						game.cardsGotoOrdering(cards);
					} else {
						game.log(player, '并没有整理出经典');
						player.popup('杯具');
						event.finish();
					}
					'step 2'
					game.updateRoundNumber();
					player.chooseTarget(true, '将整理出的经典置于一名角色的武将牌上').set('ai', function (target) {
						if (target.hasSkill('xinfu_pdgyingshi')) return 0;
						var player = _status.event.player;
						var cards = _status.event.getParent().cards;
						var att = get.attitude(player, target);
						if (att <= 0) return -5 * att;
						if (player == target) att /= 2;
						if (target.hasSkill('pingkou')) att *= 1.4;
						att *= 1 + target.countCards('j');
						return att;
					});
					'step 3'
					if (result.bool) {
						var target = result.targets[0];
						event.target = target;
						player.line(target, 'thunder');
					}
					'step 4'
					if (cards.length == 1) {
						event._result = { bool: true, moved: [cards, []] };
						return;
					}
					var next = player.chooseToMove('整经：请分配整理出的经典', true);
					next.set('list', [['置于' + get.translation(target) + '的武将牌上', cards], ['自己获得']]);
					next.set('filterMove', function (from, to, moved) {
						if (moved[0].length == 1 && to == 1 && from.link == moved[0][0]) return false;
						return true;
					});
					next.set('filterOk', function (moved) {
						return moved[0].length > 0;
					});
					next.set('processAI', function (list) {
						var cards = list[0][1].slice(0).sort(function (a, b) {
							return get.value(a) - get.value(b);
						});
						return [cards.splice(0, 1), cards];
					});
					'step 5'
					if (result.bool) {
						var cards = result.moved[0],
							gains = result.moved[1];
						target.addSkill('zhengjing2');
						target.addToExpansion(cards, 'gain2').gaintag.add('zhengjing2');
						if (gains.length) player.gain(gains, 'gain2');
					}
				};
				delete lib.skill.zhengjing.usable;
			};
			if (lib.skill.qiaosi && game.aiyh_skillOptEnabled('qiaosi', '跳过〖巧思〗小游戏')) {
				lib.skill.qiaosi.filter = function (event, player) {
					return !player.getStat('skill').qiaosi;
				};
				lib.skill.qiaosi.content = function () {
					'step 0'
					let vcards = [[], 'vcard'];
					if ([0, 1, 2].randomGet()) vcards[0].push([undefined, '', 'sha']);
					else vcards[0].push([undefined, '', 'jiu']);
					if ([0, 1, 2].randomGet()) vcards[0].push([undefined, '', 'jiu']);
					else vcards[0].push([undefined, '', 'sha']);
					if ([0, 1, 2].randomGet()) vcards[0].push([undefined, '', 'shan']);
					else vcards[0].push([undefined, '', 'tao']);
					if ([0, 1, 2].randomGet()) vcards[0].push([undefined, '', 'tao']);
					else vcards[0].push([undefined, '', 'shan']);
					vcards[0].push([undefined, '', 'trick']);
					vcards[0].push([undefined, '', 'trick']);
					vcards[0].push([undefined, '', 'equip']);
					vcards[0].push([undefined, '', 'equip']);
					player.chooseButton(['巧思：请选择你想获得的牌（至多五张）', vcards], true, [1, 5]).set('filterButton', button => {
						let sj = 0, st = 0, jn = 0, zb = 0, name;
						for (var i = 0; i < ui.selected.buttons.length; i++) {
							name = ui.selected.buttons[i].link[2];
							if (name === 'sha' || name === 'jiu') sj++;
							else if (name === 'shan' || name === 'tao') st++;
							else if (name === 'trick') jn++;
							else zb++;
						}
						name = button.link[2];
						if (jn === 1) return name === 'trick';
						if (zb === 1) return name === 'equip';
						if (name === 'sha' || name === 'jiu') return st === 0;
						if (name === 'shan' || name === 'tao') return sj === 0;
						return ui.selected.buttons.length < 4;
					}).set('ai', button => {
						if (button.link[2] === 'trick') return 5.37;
						if (button.link[2] === 'equip') return 3.4;
						//let val=0,num=0;for(let i of ui.cardPile.childNodes){if(get.type(i,'trick')===button.link[2]){val+=get.value(i,_status.event.player);num++;}}return val/num;
						return get.value(button, _status.event.player);
					});
					'step 1'
					if (result.bool) {
						let cards = [], rand = Math.random(), num;
						if (rand > 0.15 || get.isLuckyStar(player)) num = 5;
						else if (rand > 0.07) num = 4;
						else if (rand > 0.04) num = 3;
						else if (rand > 0.02) num = 2;
						else if (rand > 0.01) num = 1;
						else num = 0;
						result.links.randomSort();
						while (result.links.length && cards.length < num) {
							var filter = result.links.shift();
							var card = get.cardPile(function (x) {
								if (cards.includes(x)) return false;
								return x.name === filter[2] || get.type(x, 'trick') === filter[2];
							});
							if (card) cards.push(card);
						}
						event.num = cards.length;
						if (event.num) {
							player.showCards(cards);
							player.gain(cards, 'gain2');
							player.chooseControl().set('choiceList', [
								'将' + get.cnNumber(event.num) + '张牌交给一名其他角色',
								'弃置' + get.cnNumber(event.num) + '张牌',
							]).set('ai', function () {
								if (game.hasPlayer(function (current) {
									return current != player && get.attitude(player, current) > 1;
								})) return 0;
								return 1;
							});
						}
						else {
							if (num) player.chat('无牌可得吗？');
							else player.popup('杯具');
							event.finish();
						}
					}
					else event.finish();
					'step 2'
					if (result.index == 0) player.chooseCardTarget({
						position: 'he',
						filterCard: true,
						selectCard: event.num,
						filterTarget: function (card, player, target) {
							return player != target;
						},
						ai1: function (card) {
							return -get.value(card, player);
						},
						ai2: function (target) {
							var att = get.attitude(_status.event.player, target);
							if (target.hasSkillTag('nogain')) att /= 10;
							if (target.hasJudge('lebu')) att /= 5;
							return att;
						},
						prompt: '选择' + get.cnNumber(event.num) + '张牌，交给一名其他角色',
						forced: true,
					});
					else {
						player.chooseToDiscard(event.num, true, 'he');
						event.finish();
					}
					'step 3'
					if (result.bool) {
						var target = result.targets[0];
						player.give(result.cards, target);
					}
				};
				delete lib.skill.qiaosi.usable;
			}
		}
		if (!lib.config.extension_AI优化_apart) get.sfInit();
		lib.onover.push(function (result) {
			if (!lib.config.extension_AI优化_record) return;
			let curs = game.filterPlayer2(true, null, true),
				wins = [],
				can = true,
				id = [],
				mode = get.mode();
			if (mode == 'identity') {
				if (_status.mode == 'purple') {
					if (result || lib.config.extension_AI优化_sw) id = game.me.identity;
					else if (game.hasPlayer(function (current) {
						if (current.identity.indexOf('Zhu') == 1) {
							id = current.identity;
							return true;
						}
						return false;
					}));
					else if (!game.hasPlayer(function (current) {
						return current.identity.indexOf('Ye') != 1;
					})) id = 'rYe';
					else id = 'none';
					switch (id) {
						case 'rZhu':
						case 'rZhong':
						case 'bNei':
							wins = game.filterPlayer2(function (target) {
								return ['rZhu', 'rZhong', 'bNei'].contains(target.identity);
							}, null, true);
							break;
						case 'bZhu':
						case 'bZhong':
						case 'rNei':
							wins = game.filterPlayer2(function (target) {
								return ['bZhu', 'bZhong', 'rNei'].contains(target.identity);
							}, null, true);
							break;
						case 'rYe':
						case 'bYe':
							wins = game.filterPlayer2(function (target) {
								return ['rYe', 'bYe'].contains(target.identity);
							}, null, true);
							break;
					}
				}
				else {
					if (result || lib.config.extension_AI优化_sw) id = game.me.identity;
					else if (game.players.length == 1) id = game.players[0].identity;
					else if (game.zhu.isDead()) id = 'fan';
					else id = 'zhu';
					switch (id) {
						case 'fan':
							wins = game.filterPlayer2(function (target) {
								return target.identity == 'fan';
							}, null, true);
							break;
						case 'nei':
							wins = game.players;
							break;
						default:
							wins = game.filterPlayer2(function (target) {
								return ['zhu', 'zhong', 'mingzhong'].contains(target.identity);
							}, null, true);
					}
				}
			}
			else if (mode == 'guozhan') {
				if (result || lib.config.extension_AI优化_sw) {
					if (game.me.identity == 'ye') wins = [game.me];
					else {
						id = lib.character[game.me.name1][1];
						wins = game.filterPlayer2(function (target) {
							return target.identity != 'ye' && lib.character[target.name1][1] == id;
						}, null, true);
					}
				}
				else if (game.countPlayer(function (current) {
					if (current.identity == 'ye') return true;
					let g = lib.character[current.name1][1];
					if (!id.contains(g)) {
						id.add(g);
						return true;
					}
					return false;
				}) > 1) can = false;
				else if (game.players[0].identity == 'ye') wins = game.players;
				else {
					id = lib.character[game.players[0].name1][1];
					wins = game.filterPlayer2(function (target) {
						return target.identity != 'ye' && lib.character[target.name1][1] == id;
					}, null, true);
				}
			}
			else if (mode == 'doudizhu' || mode == 'single' || mode == 'boss') {
				if (game.zhu && game.zhu.isDead() || game.boss && game.boss.isDead()) wins = game.filterPlayer2(function (target) {
					return target.identity != 'zhu' && target.identity != 'zhong';
				}, null, true);
				else wins = game.filterPlayer2(function (target) {
					return target.identity == 'zhu' || target.identity == 'zhong';
				}, null, true);
			}
			else {
				if (result || lib.config.extension_AI优化_sw) wins = game.filterPlayer2(function (target) {
					return target.side == game.me.side;
				}, null, true);
				else if (game.countPlayer(function (current) {
					for (let s of id) {
						if (s.side == current.side) return false;
					}
					id.add(current);
					return true;
				}) > 1) can = false;
				else wins = game.filterPlayer2(function (target) {
					return target.side == game.players[0].side;
				}, null, true);
			}
			for (let i of curs) {
				if ((!can || !lib.config.extension_AI优化_tryAll) && game.me != i || mode == 'boss' && i.identity == 'zhong') continue;
				let bool;
				if (lib.config.extension_AI优化_sw) {
					if (wins.contains(i)) bool = result;
					else bool = !result;
				}
				else if (wins.contains(i)) bool = true;
				else bool = false;
				let cgn = get.sfConfigName(i.identity || 'unknown'), names = [];
				if (i.storage.sftj && i.name1 != i.storage.sftj.cg1) {
					if (lib.config.extension_AI优化_change == 'pre' && i.storage.sftj.cg1 != undefined) names.push(i.storage.sftj.cg1);
					else if (lib.config.extension_AI优化_change == 'nxt' && i.name1 != undefined) names.push(i.name1);
				}
				else if (i.name1 != undefined) names.push(i.name1);
				if (i.storage.sftj && i.name2 != i.storage.sftj.cg2) {
					if (lib.config.extension_AI优化_change == 'pre' && i.storage.sftj.cg2 != undefined) names.push(i.storage.sftj.cg2);
					else if (lib.config.extension_AI优化_change == 'nxt' && i.name2 != undefined) names.push(i.name2);
				}
				else if (i.name2 != undefined) names.push(i.name2);
				for (let j of names) {
					if (lib.config[cgn][j] == undefined) lib.config[cgn][j] = { win: 0, lose: 0 };
					if (bool == true) lib.config[cgn][j].win++;
					else lib.config[cgn][j].lose++;
				}
			}
			for (let i of get.sfConfigName()) {
				game.saveConfig(i, lib.config[i]);
			}
		});
	});
	if (lib.config.extension_AI优化_wjAi) lib.arenaReady.push(function () {//武将AI
		if (lib.skill.shouli && game.aiyh_skillOptEnabled('shouli')) lib.skill.shouli.ai = {
			respondSha: true,
			respondShan: true,
			skillTagFilter: function (player, tag) {
				var subtype = tag == 'respondSha' ? 'equip4' : 'equip3';
				return game.hasPlayer(function (current) {
					return current.getEquip(subtype);
				});
			},
			order: function (item, player) {
				for (var i = 0; i < game.players.length; i++) {
					var current = game.players[i], trans = get.translation(_status.event);
					if (_status.currentPhase != player && get.attitude(player, _status.currentPhase) < 0) {
						if (trans === '杀') {
							if (_status.currentPhase.getEquip('guanshi') && _status.currentPhase.countCards('hes') > 4 ||
								_status.currentPhase.getEquip('qinglong') && _status.currentPhase.countCards('h', { name: 'sha' }) >
								player.countCards('h', { name: 'shan' }) + current.countCards('e', function (card) {
									return get.subtype(card) == 'equip3';
								}) || _status.currentPhase.getEquip('zhuge') && _status.currentPhase.countCards('h', { name: 'sha' }) >
								player.countCards('h', { name: 'shan' }) + current.countCards('e', function (card) {
									return get.subtype(card) == 'equip3';
								})) return 0;
						}
						else if (trans === '决斗') {
							if (_status.currentPhase.countCards('h', { name: 'sha' }) > player.countCards('h', { name: 'sha' }) + current.countCards('e', function (card) {
								return get.subtype(card) == 'equip4';
							})) return 0;
							return 1;
						}
					}
					if (trans !== '决斗' && _status.currentPhase == player && !player.hasCard('wuzhong') && !player.hasCard(function (card) {
						return get.type(card) == 'trick' && player.hasUseTarget(card) && !get.tag(card, 'damage') && get.name(card) != 'wugu' && get.name(card) != 'wuxie';
					})) return 45;
					return 1;
				}
			},
			result: {
				player: function (player, target) {
					var att = get.attitude(player, target);
					var eff = Math.max(0, get.effect(target, get.autoViewAs({ name: 'sha' }, get.subtypes('equip4')), player, player));
					if (_status.event.type != 'phase') return 11 - att;
					if (!player.hasValueTarget(new lib.element.VCard({ name: 'sha' }))) return 0;
					if (_status.event.type == 'phase') {
						if (player.hasValueTarget(new lib.element.VCard({ name: 'sha' })) && game.hasPlayer(function (current) {
							return get.attitude(player, current) < 0 && current.hp <= 2 && current.hasSkill('shouli_thunder') && !player.hasCard(function (card) {
								return get.tag(card, 'damage') && player.hasUseTarget(card);
							});
						})) return 15 - att + 3 * eff;
						return 9 - att + 3 * eff;
					}
				}
			}
		};
		if (lib.skill.hengwu && game.aiyh_skillOptEnabled('hengwu')) lib.skill.hengwu.mod = {
			aiUseful: function (player, card, num) {
				var suit = get.suit(card);
				var es = game.countPlayer(function (current) {
					return current.countCards('e', function (cardx) {
						return cardx != card && get.suit(cardx, current) == suit;
					});
				});
				var hs = player.getCards('h');
				if (player.hp > 2) {
					//杀
					for (var i = 0; i < hs.length; i++) {
						if (!game.hasPlayer(function (current) {
							return current.hasCard(function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							}, 'e');
						})) continue;
						if (get.name(hs[i]) !== 'sha') continue;
						var shu = game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						});
						var max = 0;
						var list = [];
						for (var j = 1; j < shu.length; j++) {
							if (shu[j] > max) max = shu[j];
						}
						if (game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						}) == max) list.add(i);
						var list = list.sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var ka = list[0];
						if (card == ka) return num + 5 * es;
						if (player.hasCard(ka) && card.name == 'sha' && get.suit(ka) == suit && card != ka) return num - 20;
					}
					//闪
					for (var i = 0; i < hs.length; i++) {
						if (!game.hasPlayer(function (current) {
							return current.hasCard(function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							}, 'e');
						})) continue;
						if (get.name(hs[i]) != 'shan') continue;
						var shu = game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						});
						var max = 0;
						var list = [];
						for (var j = 1; j < shu.length; j++) {
							if (shu[j] > max) max = shu[j];
						}
						if (game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						}) == max) list.add(i);
						var list = list.sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var ka = list[0];
						if (card == ka) return num + 3 * es;
						if (player.hasCard(ka) && card.name == 'shan' && get.suit(ka) == suit && card != ka) return num - 20;
					}
					//桃
					for (var i = 0; i < hs.length; i++) {
						if (!game.hasPlayer(function (current) {
							return current.hasCard(function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							}, 'e');
						})) continue;
						if (get.name(hs[i]) != 'tao') continue;
						var shu = game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						});
						var max = 0;
						var list = [];
						for (var j = 1; j < shu.length; j++) {
							if (shu[j] > max) max = shu[j];
						}
						if (game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						}) == max) list.add(i);
						var list = list.sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var ka = list[0];
						if (card == ka) return num + 4 * es;
						if (player.hasCard(ka) && card.name == 'tao' && get.suit(ka) == suit && card != ka && !game.hasPlayer(function (current) {
							return current != player && get.attitude(player, current) > 0 && current.hp < 3;
						})) return num - 20;
						if (player.hasCard(ka) && card.name == 'tao' && get.suit(ka) == suit && card != ka && game.hasPlayer(function (current) {
							return current != player && get.attitude(player, current) > 0 && current.hp < 3;
						})) return num + 10;
					}
					//酒
					for (var i = 0; i < hs.length; i++) {
						if (!game.hasPlayer(function (current) {
							return current.hasCard(function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							}, 'e');
						})) continue;
						if (get.name(hs[i]) != 'jiu') continue;
						var shu = game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						});
						var max = 0;
						var list = [];
						for (var j = 1; j < shu.length; j++) {
							if (shu[j] > max) max = shu[j];
						}
						if (game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						}) == max) list.add(i);
						var list = list.sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var ka = list[0];
						if (card == ka) return num + 4 * es;
						if (player.hasCard(ka) && card.name == 'jiu' && get.suit(ka) == suit && card != ka) return num - 20;
					}
					//无懈
					for (var i = 0; i < hs.length; i++) {
						if (!game.hasPlayer(function (current) {
							return current.hasCard(function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							}, 'e');
						})) continue;
						if (get.name(hs[i]) != 'wuxie') continue;
						var shu = game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						});
						var max = 0;
						var list = [];
						for (var j = 1; j < shu.length; j++) {
							if (shu[j] > max) max = shu[j];
						}
						if (game.countPlayer(function (current) {
							return current.countCards('e', function (cardx) {
								return cardx != card && get.suit(cardx, current) == get.suit(hs[i]);
							});
						}) == max) list.add(i);
						var list = list.sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var ka = list[0];
						if (card == ka) return num + 4 * es;
						if (player.hasCard(ka) && card.name == 'wuxie' && get.suit(ka) == suit && card != ka) return num - 20;
					}
				}
			},
			aiOrder: function (player, card, num) {
				var suit = get.suit(card);
				var hs = player.countCards('h', function (cardx) {
					return get.suit(cardx) == suit;
				});
				var es = game.countPlayer(function (current) {
					return current.countCards('e', function (cardx) {
						return cardx != card && get.suit(cardx, current) == suit;
					});
				});
				var canusek = player.getCards('h', function (cardx) {
					return get.type(cardx) == 'trick' || get.type(cardx) == 'delay';
				});
				if (get.type(card) == 'equip') {
					var stp = get.subtype(card);
					if (!player.getEquip(stp)) return num + 50;
				}
				if (game.hasPlayer(function (current) {
					return current.hasCard(function (cardx) {
						return cardx != card && get.suit(cardx, current) == suit;
					}, 'e');
				})) {
					if (hs == 1) {
						if (get.name(card) == 'sha') {
							if (player.getEquip('zhuge') || player.getEquip('qinglong')) return num + 2 * es;
							return num + 0.1;
						}
						if (get.name(card) != 'sha' || get.name(card) != 'jiu') return num + 7 * es;
					}
					if (get.name(card) == 'jiu') {
						if (hs == 1) return num + 3 * es;
						if (player.hasCard('sha')) return get.order({ name: 'sha' }) + 0.4;
					}
					if (!['tao', 'shan', 'wuxie', 'jiu', 'sha'].includes(card.name)) {
						if (
							player.hasCard(function (cardx) {
								return;
								cardx != card && get.suit(cardx) == suit && get.name(cardx) != 'tao' && get.name(cardx) != 'shan' && get.name(cardx) != 'wuxie';
							}, 'h')
						) {
							if (
								player.countCards('h', function (cardx) {
									return cardx != card && get.suit(cardx) == suit && get.name(cardx) == 'jiu';
								}) == 0 ||
								(player.countCards('h', function (cardx) {
									return cardx != card && get.suit(cardx) == suit && get.name(cardx) == 'jiu';
								}) == 1 &&
									player.countUsed('jiu', true) == 0) ||
								player.countCards('h', function (cardx) {
									return cardx != card && get.suit(cardx) == suit && get.name(cardx) == 'sha';
								}) == 0 ||
								(player.countCards('h', function (cardx) {
									return cardx != card && get.suit(cardx) == suit && get.name(cardx) == 'sha';
								}) == 1 &&
									player.countUsed('sha', true) == 0)
							) {
								if (
									get.effect(target, card, player, player) >= 0 &&
									!player.hasCard(function (cardx) {
										return cardx != card && get.suit(cardx) == suit && get.effect(target, cardx, player, player) < 0;
									}, 'h')
								) {
									if (get.type(card) == 'equip') return num + (15 * es) / hs;
									return num + (7 * es) / hs;
								}
							}
						}
					}
				}
			}
		};
		if (lib.skill.twxuechang && lib.skill.twxuechang.ai && game.aiyh_skillOptEnabled('twxuechang')) lib.skill.twxuechang.ai.result = {
			player: function (player, target) {
				var hs = player.getCards('h').sort(function (a, b) {
					return get.number(b) - get.number(a);
				});
				var a = get.number(hs[0]) - 1;
				if (player.hp > 1) return 2.5 * Math.pow((a / 13), target.countCards('h')) - 2.5;
				return 4.2 * Math.pow(a / 13, target.countCards('h')) - 4.2;
			},
			target: function (player, target) {
				var hs = player.getCards('h').sort(function (a, b) {
					return get.number(b) - get.number(a);
				});
				var a = get.number(hs[0]) - 1;
				if (player.hp > 1) return -2 - 0.7 * Math.pow((a / 13), target.countCards('h'));
				return -1.7 - Math.pow((a / 13), target.countCards('h'));
			}
		};
		if (lib.skill.twchungang && game.aiyh_skillOptEnabled('twchungang', '增加〖纯刚〗全局ai', 'twchungang_global')) {
			lib.skill.twchungang.init = player => {
				game.addGlobalSkill('twchungang_global');
			};
			lib.skill.twchungang.onremove = player => {
				if (!game.hasPlayer(i => {
					return player !== i && i.hasSkill('twchungang');
				}, true)) game.removeGlobalSkill('twchungang_global');
			};
			lib.skill.twchungang_global = {
				trigger: {
					player: 'dieAfter'
				},
				filter (event, player) {
					return !game.hasPlayer(i => i.hasSkill('twchungang'), true)
				},
				silent: true,
				forceDie: true,
				charlotte: true,
				content () {
					game.removeGlobalSkill('twchungang_global');
				},
				ai: {
					effect: {
						target (card, player, target) {
							if ((get.tag(card, 'gain') || 0) < 2 && (get.tag(card, 'draw') || 0) < 2) return;
							let evt = _status.event.getParent('phaseDraw'), dis = game.countPlayer(i => {
								return target !== i && i.hasSkill('twchungang');
							});
							if (!dis || evt && evt.player === target) return;
							return [1, -dis];
						}
					}
				}
			};
		}
		//nsp
		if (lib.config.extension_AI优化_dev) { }
		//over
	});
	if (lib.config.extension_AI优化_kpAi) lib.arenaReady.push(function () {//本体AI优化
		//卡牌AI
		lib.skill._aiyh_reserved_shan = {//防酒杀ai，盲猜酒约等于没有
			silent: true,
			locked: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			ai: {
				effect: {
					player: (card, player, target) => {
						if (typeof card !== 'object' || player.hp <= 1 || get.name(card, player) !== 'shan' || player.countCards('hs', card => {
							let name = get.name(card, player);
							return (name === 'shan' || name === 'hufu') && lib.filter.cardEnabled(card, player, 'forceEnable');
						}) !== 1 || (player.hp > 2 || !player.isZhu && player.hp > 1) && player.hasSkillTag('respondShan', true, 'use', true)) return;
						let par = _status.event.getParent();
						if (!par || get.itemtype(par.player) !== 'player') par = _status.event.getParent(2);
						if (!par || get.itemtype(par.player) !== 'player') return;
						if (typeof par.baseDamage === 'number') {
							let num = par.baseDamage;
							if (typeof par.extraDamage === 'number') num += par.extraDamage;
							if (player.hp <= num) return;
						}
						if (par.card && game.hasNature(par.card, 'fire') && player.hasSkill('tengjia2') && !player.hasSkillTag('unequip2') && (!par.player || !par.player.hasSkillTag('unequip', false, {
							name: par.name || null,
							target: player,
							card: par.card,
							cards: par.cards
						}))) return;
						if (!par.player.isPhaseUsing() || par.player.hasSkill('hanbing_skill') || !par.player.getCardUsable('sha') || !par.player.getCardUsable('jiu')) return;
						if (par.card && player.isLinked() && game.hasNature(par.card) && game.hasPlayer(current => {
							return player !== current && current.isLinked() && get.damageEffect(current, par.player, player, get.natureList(par.card)) < 0;
						})) return;
						let known = par.player.getKnownCards(player);
						if ((known.some(i => {
							return get.name(i) === 'jiu' && par.player.canUse(i, par.player, null, true);
						}) || 1 - Math.pow(0.96875, par.player.countCards('hs') - known.length) > _status.event.getRand('aiyh_reserved_shan')) && par.player.mayHaveSha(player, 'use')) return 'zeroplayertarget';
					}
				}
			}
		};
		if (lib.config.extension_AI优化_dev) {
			if (lib.card.sha && lib.card.sha.ai) lib.card.sha.ai.order = function (item, player) {
				if (player.hasSkillTag('presha', true, null, true)) return 10;
				return 3.05;
			};
		}
		if (lib.card.nanman) lib.card.nanman.ai = {
			wuxie: function (target, card, player, viewer, status) {
				let att = get.attitude(viewer, target), eff = get.effect(target, card, player, target);
				if (Math.abs(att) < 1 || status * eff * att >= 0) return 0;
				let evt = _status.event.getParent('useCard'), pri = 1, bonus = player.hasSkillTag('damageBonus', true, {
					target: target,
					card: card
				}), damage = 1, canSha = function (tar, blur) {
					if (tar == viewer || viewer.hasSkillTag('viewHandcard', null, tar, true)) {
						if (tar.hasCard(function (card) {
							let name = get.name(card, tar);
							return (name == 'sha' || name == 'hufu' || name == 'yuchanqian') && lib.filter.cardRespondable(card, tar);
						}, 'hs')) return true;
					}
					else if (blur && tar.countCards('hs') > 2.67 + 2 * Math.random()) return true;
					if (!blur) return false;
					if (!tar.hasSkillTag('respondSha', true, 'respond', true)) return false;
					if (tar.hp <= damage) return false;
					if (tar.hp <= damage + 1) return !tar.isZhu && tar != game.boss && tar != game.trueZhu && tar != game.falseZhu;
					return true;
				}, self = false;
				if (canSha(target)) return 0;
				if (bonus && !viewer.hasSkillTag('filterDamage', null, {
					player: player,
					card: card
				})) damage = 2;
				if ((viewer.hp <= damage || viewer.hp <= damage + 1 && (viewer.isZhu || viewer == game.boss || viewer == game.trueZhu || viewer == game.falseZhu)) && !canSha(viewer)) {
					if (viewer == target) return status;
					let fv = true;
					if (evt && evt.targets) for (let i of evt.targets) {
						if (fv) {
							if (target == i) fv = false;
							continue;
						}
						if (viewer == i) {
							if (viewer.isZhu || viewer == game.boss || viewer == game.trueZhu || viewer == game.falseZhu) return 0;
							self = true;
							break;
						}
					}
				}
				let maySha = canSha(target, true);
				if (bonus && !target.hasSkillTag('filterDamage', null, {
					player: player,
					card: card
				})) damage = 2;
				else damage = 1;
				if (target.isZhu || target == game.boss || target == game.trueZhu || target == game.falseZhu) {
					if (eff < 0) {
						if (target.hp <= damage + 1 || !maySha && target.hp <= damage + 2) return 1;
						if (maySha && target.hp > damage + 2) return 0;
						else if (maySha || target.hp > damage + 2) pri = 3;
						else pri = 4;
					}
					else if (target.hp > damage + 1) pri = 2;
					else return 0;
				}
				else if (self) return 0;
				else if (eff < 0) {
					if (!maySha && target.hp <= damage) pri = 5;
					else if (maySha) return 0;
					else if (target.hp > damage + 1) pri = 2;
					else if (target.hp === damage + 1) pri = 3;
					else pri = 4;
				}
				else if (target.hp <= damage) return 0;
				let find = false;
				if (evt && evt.targets) for (let i = 0; i < evt.targets.length; i++) {
					if (!find) {
						if (evt.targets[i] == target) find = true;
						continue;
					}
					let att1 = get.attitude(viewer, evt.targets[i]), eff1 = get.effect(evt.targets[i], card, player, evt.targets[i]), temp = 1;
					if (Math.abs(att1) < 1 || att1 * eff1 >= 0 || canSha(evt.targets[i])) continue;
					maySha = canSha(evt.targets[i], true);
					if (bonus && !evt.targets[i].hasSkillTag('filterDamage', null, {
						player: player,
						card: card
					})) damage = 2;
					else damage = 1;
					if (evt.targets[i].isZhu || evt.targets[i] == game.boss || evt.targets[i] == game.trueZhu || evt.targets[i] == game.falseZhu) {
						if (eff < 0) {
							if (evt.targets[i].hp <= damage + 1 || !maySha && evt.targets[i].hp <= damage + 2) return 0;
							if (maySha && evt.targets[i].hp > damage + 2) continue;
							if (maySha || evt.targets[i].hp > damage + 2) temp = 3;
							else temp = 4;
						}
						else if (evt.targets[i].hp > damage + 1) temp = 2;
						else continue;
					}
					else if (eff < 0) {
						if (!maySha && evt.targets[i].hp <= damage) temp = 5;
						else if (maySha) continue;
						else if (evt.targets[i].hp > damage + 1) temp = 2;
						else if (evt.targets[i].hp === damage + 1) temp = 3;
						else temp = 4;
					}
					else if (evt.targets[i].hp > damage + 1) temp = 2;
					if (temp > pri) return 0;
				}
				return 1;
			},
			basic: {
				order: 8.8,
				useful: [5, 1],
				value: 5.7
			},
			result: {
				player: function (player, target) {
					if (player._nanman_temp || player.hasSkillTag('jueqing', false, target)) return 0;
					player._nanman_temp = true;
					let eff = get.effect(target, new lib.element.VCard({ name: 'nanman' }), player, target);
					delete player._nanman_temp;
					if (eff >= 0) return 0;
					if (target.hp > 2 || target.hp > 1 && !target.isZhu && target != game.boss && target != game.trueZhu && target != game.falseZhu) return 0;
					if (target.hp > 1 && target.hasSkillTag('respondSha', true, 'respond', true)) return 0;
					if (player.hasSkillTag('viewHandcard', null, target, true) && (target.hasCard(function (card) {
						let name = get.name(card, target);
						return (name == 'sha' || name == 'hufu' || name == 'yuchanqian') && lib.filter.cardRespondable(card, target);
					}, 'h') || target.hasCard(function (card) {
						return get.name(card) == 'wuxie' && lib.filter.cardEnabled(card, target, 'forceEnable');
					}, 'h'))) return 0;
					if (target.hp > 1 && target.countCards('hs') > 2.67 + 2 * Math.random()) return 0;
					let res = 0, att = get.sgn(get.attitude(player, target));
					res -= att * (0.8 * target.countCards('hs') + 0.6 * target.countCards('e') + 3.6);
					if (get.mode() == 'identity' && target.identity == 'fan') res += 2.4;
					if (get.mode() == 'guozhan' && player.identity != 'ye' && player.identity == target.identity || get.mode() == 'identity' && player.identity == 'zhu' && (target.identity == 'zhong' || target.identity == 'mingzhong')) res -= 0.8 * player.countCards('he');
					return res;
				},
				target: function (player, target) {
					let nh = target.countCards('hs'),
						zhu = (get.mode() == 'identity' && target.isZhu) || target.identity == 'zhu';
					if (!lib.filter.cardRespondable({ name: 'sha' }, target)) {
						if (zhu) {
							if (target.hp < 2) return -99;
							if (target.hp == 2) return -3.6;
						}
						return -2;
					}
					if (player.hasSkillTag('viewHandcard', null, target, true)) {
						if (target.hasCard(function (card) {
							return get.name(card, target) == 'sha' && lib.filter.cardRespondable(card, target);
						}, 'h') || target.hasCard(function (card) {
							return get.name(card) == 'wuxie' && lib.filter.cardEnabled(card, target, 'forceEnable');
						}, 'h')) return -1.2;
						if (zhu && target.hp <= 1) return -99;
					}
					if (zhu && target.hp <= 1) {
						if (nh == 0) return -99;
						if (nh == 1) return -60;
						if (nh == 2) return -36;
						if (nh == 3) return -12;
						if (nh == 4) return -8;
						return -5;
					}
					if (target.hasSkillTag('respondSha', true, 'respond', true)) return -1.35;
					if (!nh) return -2;
					if (nh == 1) return -1.8;
					return -1.5;
				}
			},
			tag: {
				respond: 1,
				respondSha: 1,
				damage: 1,
				multitarget: 1,
				multineg: 1
			}
		};
		if (lib.card.wanjian) lib.card.wanjian.ai = {
			wuxie: function (target, card, player, viewer, status) {
				let att = get.attitude(viewer, target), eff = get.effect(target, card, player, target);
				if (Math.abs(att) < 1 || status * eff * att >= 0) return 0;
				let evt = _status.event.getParent('useCard'), pri = 1, bonus = player.hasSkillTag('damageBonus', true, {
					target: target,
					card: card
				}), damage = 1, canShan = function (tar, blur) {
					if (tar == viewer || viewer.hasSkillTag('viewHandcard', null, tar, true)) {
						if (tar.hasCard(function (card) {
							let name = get.name(card, tar);
							return (name == 'shan' || name == 'hufu') && lib.filter.cardRespondable(card, tar);
						}, 'hs')) return true;
					}
					else if (blur && tar.countCards('hs') > 1.67 + 2 * Math.random()) return true;
					if (!blur) return false;
					if (!tar.hasSkillTag('respondShan', true, 'respond', true)) return false;
					if (tar.hp <= damage) return false;
					if (tar.hp <= damage + 1) return !tar.isZhu && tar != game.boss && tar != game.trueZhu && tar != game.falseZhu;
					return true;
				}, self = false;
				if (canShan(target)) return 0;
				if (bonus && !viewer.hasSkillTag('filterDamage', null, {
					player: player,
					card: card
				})) damage = 2;
				if ((viewer.hp <= damage || viewer.hp <= damage + 1 && (viewer.isZhu || viewer == game.boss || viewer == game.trueZhu || viewer == game.falseZhu)) && !canShan(viewer)) {
					if (viewer == target) return status;
					let fv = true;
					if (evt && evt.targets) for (let i of evt.targets) {
						if (fv) {
							if (target == i) fv = false;
							continue;
						}
						if (viewer == i) {
							if (viewer.isZhu || viewer == game.boss || viewer == game.trueZhu || viewer == game.falseZhu) return 0;
							self = true;
							break;
						}
					}
				}
				let mayShan = canShan(target, true);
				if (bonus && !target.hasSkillTag('filterDamage', null, {
					player: player,
					card: card
				})) damage = 2;
				else damage = 1;
				if (target.isZhu || target == game.boss || target == game.trueZhu || target == game.falseZhu) {
					if (eff < 0) {
						if (target.hp <= damage + 1 || !mayShan && target.hp <= damage + 2) return 1;
						if (mayShan && target.hp > damage + 2) return 0;
						else if (mayShan || target.hp > damage + 2) pri = 3;
						else pri = 4;
					}
					else if (target.hp > damage + 1) pri = 2;
					else return 0;
				}
				else if (self) return 0;
				else if (eff < 0) {
					if (!mayShan && target.hp <= damage) pri = 5;
					else if (mayShan) return 0;
					else if (target.hp > damage + 1) pri = 2;
					else if (target.hp === damage + 1) pri = 3;
					else pri = 4;
				}
				else if (target.hp > damage) return 0;
				let find = false;
				if (evt && evt.targets) for (let i = 0; i < evt.targets.length; i++) {
					if (!find) {
						if (evt.targets[i] == target) find = true;
						continue;
					}
					let att1 = get.attitude(viewer, evt.targets[i]), eff1 = get.effect(evt.targets[i], card, player, evt.targets[i]), temp = 1;
					if (Math.abs(att1) < 1 || att1 * eff1 >= 0 || canShan(evt.targets[i])) continue;
					mayShan = canShan(evt.targets[i], true);
					if (bonus && !evt.targets[i].hasSkillTag('filterDamage', null, {
						player: player,
						card: card
					})) damage = 2;
					else damage = 1;
					if (evt.targets[i].isZhu || evt.targets[i] == game.boss || evt.targets[i] == game.trueZhu || evt.targets[i] == game.falseZhu) {
						if (eff < 0) {
							if (evt.targets[i].hp <= damage + 1 || !mayShan && evt.targets[i].hp <= damage + 2) return 0;
							if (mayShan && evt.targets[i].hp > damage + 2) continue;
							if (mayShan || evt.targets[i].hp > damage + 2) temp = 3;
							else temp = 4;
						}
						else if (evt.targets[i].hp > damage + 1) temp = 2;
						else continue;
					}
					else if (eff < 0) {
						if (!mayShan && evt.targets[i].hp <= damage) temp = 5;
						else if (mayShan) continue;
						else if (evt.targets[i].hp > damage + 1) temp = 2;
						else if (evt.targets[i].hp === damage + 1) temp = 3;
						else temp = 4;
					}
					else if (evt.targets[i].hp > damage + 1) temp = 2;
					if (temp > pri) return 0;
				}
				return 1;
			},
			basic: {
				order: 8.8,
				useful: 1,
				value: 5.4
			},
			result: {
				player: function (player, target) {
					if (player._wanjian_temp || player.hasSkillTag('jueqing', false, target)) return 0;
					player._wanjian_temp = true;
					let eff = get.effect(target, new lib.element.VCard({ name: 'wanjian' }), player, target);
					delete player._wanjian_temp;
					if (eff >= 0) return 0;
					if (target.hp > 2 || target.hp > 1 && !target.isZhu && target != game.boss && target != game.trueZhu && target != game.falseZhu) return 0;
					if (target.hp > 1 && target.hasSkillTag('respondShan', true, 'respond', true)) return 0;
					if (player.hasSkillTag('viewHandcard', null, target, true) && (target.hasCard(function (card) {
						let name = get.name(card, target);
						return (name == 'shan' || name == 'hufu') && lib.filter.cardRespondable(card, target);
					}, 'h') || target.hasCard(function (card) {
						return get.name(card) == 'wuxie' && lib.filter.cardEnabled(card, target, 'forceEnable');
					}, 'h'))) return 0;
					if (target.hp > 1 && target.countCards('hs') > 1.67 + 2 * Math.random()) return 0;
					let res = 0, att = get.sgn(get.attitude(player, target));
					res -= att * (0.8 * target.countCards('hs') + 0.6 * target.countCards('e') + 3.6);
					if (get.mode() == 'identity' && target.identity == 'fan') res += 2.4;
					if (get.mode() == 'guozhan' && player.identity != 'ye' && player.identity == target.identity || get.mode() == 'identity' && player.identity == 'zhu' && (target.identity == 'zhong' || target.identity == 'mingzhong')) res -= 0.8 * player.countCards('he');
					return res;
				},
				target: function (player, target) {
					let nh = target.countCards('hs'),
						zhu = (get.mode() == 'identity' && target.isZhu) || target.identity == 'zhu';
					if (!lib.filter.cardRespondable({ name: 'shan' }, target)) {
						if (zhu) {
							if (target.hp < 2) return -99;
							if (target.hp == 2) return -3.6;
						}
						return -2;
					}
					if (player.hasSkillTag('viewHandcard', null, target, true)) {
						if (target.hasCard(function (card) {
							return get.name(card, target) == 'shan' && lib.filter.cardRespondable(card, target);
						}, 'h') || target.hasCard(function (card) {
							return get.name(card) == 'wuxie' && lib.filter.cardEnabled(card, target, 'forceEnable');
						}, 'h')) return -1.2;
						if (zhu && target.hp <= 1) return -99;
					}
					if (zhu && target.hp <= 1) {
						if (nh == 0) return -99;
						if (nh == 1) return -60;
						if (nh == 2) return -36;
						if (nh == 3) return -8;
						return -5;
					}
					if (target.mayHaveShan(player, 'respond')) return -1.35;
					if (!nh) return -2;
					if (nh == 1) return -1.65;
					return -1.5;
				}
			},
			tag: {
				respond: 1,
				respondShan: 1,
				damage: 1,
				multitarget: 1,
				multineg: 1
			}
		};
		//修改以逸待劳效果
		lib.card.yiyi = {
			audio: true,
			fullskin: true,
			type: 'trick',
			cardcolor: 'red',
			enable: true,
			filterTarget: function (card, player, target) {
				if (get.mode() == 'guozhan') return target.isFriendOf(player);
				if (get.mode() == 'versus' || get.is.versus()) return player.side == target.side;
				return true;
			},
			selectTarget: function () {
				if (get.mode() == 'guozhan' || get.mode() == 'versus') return -1;
				return [1, 3];
			},
			content: function () {
				target.draw(2);
				target.chooseToDiscard(2, 'he', true).ai = get.disvalue;
			},
			ai: {
				wuxie: function () {
					return 0;
				},
				basic: {
					order: 9,
					useful: 1.5,
					value: 3
				},
				result: {
					target: function (player, target) {
						let i,
							add = 0,
							y = 1,
							tars = 0;
						if (!ui.selected.cards) y = 0;
						if (ui.selected.targets) tars = 0.01 * ui.selected.targets.length;
						else tars = 0;
						if (target == player) i = player.countCards('h', function (card) {
							if (y > 0 && ui.selected.cards.includes(card)) return false;
							if (!y && get.name(card) == 'yiyi') {
								y = -1;
								return false;
							}
							return true;
						});
						else i = target.countCards('he');
						if (target.hasSkillTag('noh')) add++;
						return add + Math.sqrt(i / 3.6 + tars) / 2;
					}
				},
				tag: {
					draw: 2,
					loseCard: 2,
					discard: 2,
					multitarget: true,
					norepeat: 1
				}
			}
		};
		lib.translate.yiyi_info = '出牌阶段，对至多三名角色使用。目标角色摸两张牌然后弃置两张牌。';
		lib.translate.yiyi_info_versus = '出牌阶段，对所有友方角色使用。目标角色摸两张牌然后弃置两张牌。';
	});
}