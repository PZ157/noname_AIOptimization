import { lib, game, ui, get, ai, _status } from './utils.js';

export function precontent(config, pack) {
	//非常感谢@柚子丶奶茶丶猫以及面具 提供的『云将』相关部分AI优化的修复代码
	{
		//本体版本检测
		let noname = lib.version.split('.').slice(2),
			min = [4],
			len = Math.min(noname.length, min.length),
			status = false;
		if (lib.version.slice(0, 5) === '1.10.')
			for (let i = 0; i < len; i++) {
				if (Number(noname[i]) < min[i]) {
					status = '您的无名杀版本太低';
					break;
				}
				if (i === 0 && (noname[i] === '4' || noname[i] === '5')) {
					if (localStorage.getItem('aiyh_version_check_alerted') !== lib.version) {
						localStorage.setItem('aiyh_version_check_alerted', lib.version);
						alert(
							'为适配最新版本，［载入本扩展配置］［编辑武将权重］［编辑修改的技能威胁度］等功能于当前版本无法使用，请及时更新无名杀至1.10.6及以上或使用《AI优化》1.3.5.5版本'
						);
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
	if (lib.config.extension_AI优化_changelog !== lib.extensionPack.AI优化.version)
		lib.game.showChangeLog = function () {
			//更新内容
			let str = [
				ui.joint`
					<div style="display: flex; justify-content: center">
						<span style="color: #00FFFF">更新日期</span>：
						<span style="color: #FFFF00">25</span>年
						<span style="color: #00FFB0">6</span>月
						<span style="color: rgb(255, 146, 68)">24</span>日
					</div>
				`,
				'◆移除伪禁功能，规范HTML标签',
				'◆移除DoDo频道推荐，增加其他推荐渠道',
				'◆修复［去除本体武将小游戏］功能中的庞德公〖评才〗',
				'◆更正部分描述',
			];
			let ul = document.createElement('ul');
			ul.style.textAlign = 'left';
			for (let i = 0; i < str.length; i++) {
				let li = document.createElement('test');
				li.innerHTML = str[i] + '<br />';
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
	if (lib.config.extension_AI优化_rank !== 'off')
		ui.create.rarity = function (button) {
			let config = lib.config.extension_AI优化_rank;
			if (typeof config !== 'string' || config === 'off') return;
			let rarity,
				five,
				intro = button.node.intro;
			intro.classList.add('showintro');
			if (lib.rank.bp.includes(button.link)) rarity = 5;
			else if (lib.rank.am.includes(button.link)) rarity = 6;
			else if (lib.rank.b.includes(button.link)) rarity = 4;
			else if (lib.rank.a.includes(button.link)) rarity = 7;
			else if (lib.rank.bm.includes(button.link)) rarity = 3;
			else if (lib.rank.ap.includes(button.link)) rarity = 8;
			else if (lib.rank.c.includes(button.link)) rarity = 2;
			else if (lib.rank.s.includes(button.link)) rarity = 9;
			else if (lib.rank.d.includes(button.link)) rarity = 1;
			else if (config[1] === 'r' || config[1] === 'g' || config[1] === 'z') {
				if (lib.rank.rarity.rare.includes(button.link)) five = 3;
				else if (lib.rank.rarity.epic.includes(button.link)) five = 4;
				else if (lib.rank.rarity.legend.includes(button.link)) five = 5;
				else if (lib.rank.rarity.junk.includes(button.link)) five = 1;
				else five = 2;
			} else if (lib.rank.rarity.legend.includes(button.link)) rarity = 9;
			else {
				intro.style.fontSize = '16px';
				intro.style.bottom = '6px';
				intro.style.left = '6px';
				intro.style.fontFamily = 'shousha';
				intro.dataset.nature = 'graym';
				intro.innerHTML = '未知';
				return;
			}
			if (!five) five = Math.ceil(rarity / 2);
			if (config[0] === 't') {
				intro.classList.add('rarity');
				if (intro.innerText) intro.innerText = '';
				intro.style.left = '20px';
				intro.style.bottom = '6px';
				intro.style.width = '45px';
				intro.style.height = '45px';
				intro.style['background-size'] = '100% 100%';
				intro.style.backgroundImage =
					'url("' +
					lib.assetURL +
					'extension/AI优化/img/rarity/' +
					config[1] +
					'/' +
					(config[1] === 'q' ? rarity : five) +
					'.png")';
				return;
			}
			intro.style.fontSize = '16px';
			intro.style.bottom = '6px';
			intro.style.left = '6px';
			if (five === 3) intro.dataset.nature = 'thunderm';
			else if (five === 2) intro.dataset.nature = 'waterm';
			else if (five === 4) intro.dataset.nature = 'metalm';
			else if (five === 1) intro.dataset.nature = 'woodm';
			else intro.dataset.nature = 'orangem';
			if (config[1] === 'r') {
				intro.style.fontFamily = 'yuanli';
				if (five === 3) intro.innerHTML = '稀有';
				else if (five === 2) intro.innerHTML = '普通';
				else if (five === 4) intro.innerHTML = '史诗';
				else if (five === 1) intro.innerHTML = '免费';
				else intro.innerHTML = '传说';
			} else if (config[1] === 'x') {
				intro.style.fontFamily = 'xingkai';
				intro.innerHTML = get.cnNumber(rarity, true);
			} else if (config[1] === 'd') {
				intro.style.fontFamily = 'xingkai';
				if (rarity === 5) intro.innerHTML = '伍';
				else if (rarity === 4) intro.innerHTML = '肆';
				else if (rarity === 6) intro.innerHTML = '陆';
				else if (rarity === 7) intro.innerHTML = '柒';
				else if (rarity === 8) intro.innerHTML = '捌';
				else if (rarity === 3) intro.innerHTML = '叁';
				else if (rarity === 2) intro.innerHTML = '贰';
				else if (rarity === 9) intro.innerHTML = '玖';
				else intro.innerHTML = '壹';
			} else if (config[1] === 'p') {
				let pin = ['下', '中', '上'];
				intro.style.fontFamily = 'xingkai';
				intro.innerHTML = pin[Math.floor(--rarity / 3)] + pin[rarity % 3];
			}
		};

	lib.skill._aiyh_firstKs = {
		//游戏开始处理
		trigger: { global: 'gameStart' },
		silent: true,
		unique: true,
		firstDo: true,
		charlotte: true,
		superCharlotte: true,
		content() {
			if (!_status.aiyh_firstDo) {
				_status.aiyh_firstDo = true;
				for (let i in lib.config.extension_AI优化_cf) {
					//修改技能威胁度
					if (!lib.skill[i]) lib.skill[i] = { ai: { threaten: lib.config.extension_AI优化_cf[i] } };
					else if (!lib.skill[i].ai) lib.skill[i].ai = { threaten: lib.config.extension_AI优化_cf[i] };
					else lib.skill[i].ai.threaten = lib.config.extension_AI优化_cf[i];
				}
				if (lib.config.extension_AI优化_applyCf === 'pj') {
					//威胁度补充
					let list,
						rank = lib.rank;
					if (_status.connectMode) list = get.charactersOL();
					else list = get.gainableCharacters();
					for (let i = 0; i < list.length; i++) {
						let info = lib.character[list[i]];
						if (!info || info.length < 4) continue;
						let all,
							skills = [],
							th;
						if (rank.bp.includes(list[i])) all = 1.4;
						else if (rank.am.includes(list[i])) all = 1.8;
						else if (rank.b.includes(list[i])) all = 1.2;
						else if (rank.a.includes(list[i])) all = 2.4;
						else if (rank.bm.includes(list[i])) continue;
						else if (rank.ap.includes(list[i])) all = 2.7;
						else if (rank.c.includes(list[i])) all = 0.8;
						else if (rank.s.includes(list[i])) all = 3.2;
						else if (rank.d.includes(list[i])) all = 0.6;
						else continue;
						for (let j of info[3]) {
							if (lib.skill[j] && lib.skill[j].juexingji) continue;
							skills.push(j);
						}
						if (skills.length) {
							th = Math.pow(all, 1 / skills.length);
							for (let j = 0; j < skills.length; j++) {
								let info = lib.skill[skills[j]];
								if (!info) lib.skill[skills[j]] = { ai: { threaten: th } };
								else if (!info.ai) lib.skill[skills[j]].ai = { threaten: th };
								else if (typeof info.ai.threaten === 'undefined') {
									if (info.ai.maixie_defend) lib.skill[skills[j]].ai.threaten = 0.8 * th;
									else lib.skill[skills[j]].ai.threaten = th;
								}
							}
						}
					}
				} else if (lib.config.extension_AI优化_applyCf === 'pz') {
					let list;
					if (_status.connectMode) list = get.charactersOL();
					else list = get.gainableCharacters();
					for (let i = 0; i < list.length; i++) {
						let info = lib.character[list[i]];
						if (!info || info.length < 4) continue;
						let rarity = game.getRarity(list[i]),
							all,
							skills = [],
							th;
						if (rarity === 'rare') all = 1.2;
						else if (rarity === 'epic') all = 1.8;
						else if (rarity === 'legend') all = 2.4;
						else if (rarity === 'junk') all = 0.8;
						else continue;
						for (let j of info[3]) {
							if (lib.skill[j] && lib.skill[j].juexingji) continue;
							skills.push(j);
						}
						if (skills.length) {
							th = Math.pow(all, 1 / skills.length);
							for (let j = 0; j < skills.length; j++) {
								let info = lib.skill[skills[j]];
								if (!info) lib.skill[skills[j]] = { ai: { threaten: th } };
								else if (!info.ai) lib.skill[skills[j]].ai = { threaten: th };
								else if (typeof info.ai.threaten === 'undefined') {
									if (info.ai.maixie_defend) lib.skill[skills[j]].ai.threaten = 0.8 * th;
									else lib.skill[skills[j]].ai.threaten = th;
								}
							}
						}
					}
				}
			}
			player.addSkill('aiyh_gjcx_qj');
			if (get.mode() === 'identity' && _status.mode !== 'zhong' && _status.mode !== 'purple') {
				//身份局ai
				if (player.identity === 'nei' && lib.config.extension_AI优化_sfjAi) {
					player.addSkill('gjcx_neiAi');
					player.addSkill('gjcx_neiAi_expose');
					player.addSkill('gjcx_neiAi_damage');
				}
				if (player === game.zhu && lib.config.extension_AI优化_sfjAi === 'gjcx') player.addSkill('gjcx_zhuAi');
			}
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (!lib.config.extension_AI优化_qzCf || get.itemtype(target) !== 'player') return;
					let base1 = 1;
					if (typeof lib.aiyh.qz[target.name] === 'number') base1 = lib.aiyh.qz[target.name];
					else if (typeof lib.config.extension_AI优化_qz[target.name] === 'number')
						base1 = lib.config.extension_AI优化_qz[target.name];
					if (target.name2 === undefined) return base1;
					if (typeof lib.aiyh.qz[target.name2] === 'number') return base1 + lib.aiyh.qz[target.name2];
					if (typeof lib.config.extension_AI优化_qz[target.name2] === 'number')
						return base1 + lib.config.extension_AI优化_qz[target.name2];
					return base1;
				},
			},
		},
	};

	/*功能*/
	lib.skill._aiyh_nhFriends = {
		//AI不砍队友
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		ai: {
			effect: {
				player(card, player, target) {
					if (
						lib.config.extension_AI优化_nhFriends === 'off' ||
						player._nhFriends_temp ||
						get.itemtype(target) !== 'player' ||
						player === game.me
					)
						return;
					if (
						get.tag(card, 'damage') &&
						card.name !== 'huogong' &&
						(!lib.config.extension_AI优化_ntAoe || (card.name !== 'nanman' && card.name !== 'wanjian')) &&
						get.attitude(player, target) > 0
					) {
						let num = 0;
						if (lib.config.extension_AI优化_nhFriends === 'ph') num = player.hp;
						else num = parseInt(lib.config.extension_AI优化_nhFriends);
						if (target.hp > num) return;
						player._nhFriends_temp = true;
						let eff = get.effect(target, card, player, player);
						delete player._nhFriends_temp;
						if (eff > 0) return [1, 0, 1, -1 - eff];
					}
				},
			},
		},
	};
	lib.skill._aiyh_meks = {
		//开局功能
		trigger: {
			global: ['gameStart', 'showCharacterEnd'],
		},
		filter(event, player) {
			return player === game.me;
		},
		silent: true,
		unique: true,
		priority: 157,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			event.names = [];
			if (lib.config.extension_AI优化_applyQz)
				game.countPlayer2(function (current) {
					if (current.name !== 'unknown' && !event.names.includes(current.name)) event.names.push(current.name);
					if (current.name2 !== undefined && current.name2 !== 'unknown' && !event.names.includes(current.name2))
						event.names.push(current.name2);
				});
			if (!event.names.length) event.goto(4);
			'step 1'
			event.name = event.names.splice(0, 1)[0];
			if (lib.config.extension_AI优化_qz[event.name] === undefined) event.qz = 1;
			else if (event.names.length) event.redo();
			else event.goto(4);
			'step 2'
			let list = ['+1', '+0.1', '+0.01'];
			event.qz = Math.round(event.qz * 100) / 100;
			if (event.qz > 1) list.push('-1');
			if (event.qz > 0.1) list.push('-0.1');
			if (event.qz > 0.01) list.push('-0.01');
			list.push('暂不设置');
			list.push('设置');
			player
				.chooseControl(list)
				.set('prompt', get.translation(event.name) + '的 权重：<span style="color: #FFFF00">' + event.qz + '</span>')
				.set('prompt2', '该值将作为内奸AI判断角色实力的首选')
				.set('ai', function () {
					return '暂不设置';
				});
			'step 3'
			if (result.control === '设置') {
				lib.config.extension_AI优化_qz[event.name] = event.qz;
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
				if (event.names.length) event.goto(1);
			} else if (result.control === '暂不设置') {
				delete lib.config.extension_AI优化_qz[event.name];
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
				if (event.names.length) event.goto(1);
			} else {
				if (result.control === '+1') event.qz++;
				else if (result.control === '+0.1') event.qz += 0.1;
				else if (result.control === '+0.01') event.qz += 0.01;
				else if (result.control === '-0.01') event.qz -= 0.01;
				else if (result.control === '-0.1') event.qz -= 0.1;
				else if (result.control === '-1') event.qz--;
				event.goto(2);
			}
			'step 4'
			if (lib.config.extension_AI优化_applyCf === 'sd') event.targets = game.filterPlayer2();
			else event.finish();
			'step 5'
			event.target = event.targets.splice(0, 1)[0];
			event.skills = event.target.getSkills(null, false, false).filter(function (i) {
				if (!lib.translate[i]) return false;
				let info = lib.skill[i];
				return !info || !info.ai || info.ai.threaten === 'undefined';
			});
			'step 6'
			if (event.skills.length) {
				event.skill = event.skills.splice(0, 1)[0];
				event.th = 1;
			} else if (event.targets.length) event.goto(5);
			else event.finish();
			'step 7'
			let con = ['+1', '+0.1', '+0.01'],
				str = '技能ID：' + event.skill;
			event.th = Math.round(event.th * 100) / 100;
			if (event.target.tempSkills[event.skill]) str = '&nbsp;&nbsp;&nbsp;<span style="color: #FF3300">这是一项临时技能</span>';
			if (lib.translate[event.skill + '_info']) str += '<br />' + lib.translate[event.skill + '_info'];
			else str += '<br />暂无技能描述';
			if (event.th > 1) con.push('-1');
			if (event.th > 0.1) con.push('-0.1');
			if (event.th > 0.01) con.push('-0.01');
			con.push('暂不处理');
			con.push('确认修改');
			player
				.chooseControl(con)
				.set(
					'prompt',
					'<span style="color: #00FFFF">' +
						get.translation(event.target) +
						'</span>的【<span style="color: #FFFF00">' +
						get.translation(event.skill) +
						'</span>】：当前为<span style="color: #00FFFF">' +
						event.th +
						'</span>'
				)
				.set('prompt2', str)
				.set('ai', function () {
					return '确认修改';
				});
			'step 8'
			if (result.control === '确认修改') {
				let s = lib.skill[event.skill];
				if (!s) s = { ai: { threaten: event.th } };
				else if (!s.ai) s.ai = { threaten: event.th };
				else s.ai.threaten = event.th;
				lib.config.extension_AI优化_cf[event.skill] = event.th;
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
				event.goto(6);
			} else if (result.control === '暂不处理') {
				delete lib.config.extension_AI优化_cf[event.skill];
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
				event.goto(6);
			} else {
				if (result.control === '+1') event.th++;
				else if (result.control === '+0.1') event.th += 0.1;
				else if (result.control === '+0.01') event.th += 0.01;
				else if (result.control === '-1') event.th--;
				else if (result.control === '-0.1') event.th -= 0.1;
				else if (result.control === '-0.01') event.th -= 0.01;
				event.goto(7);
			}
		},
	};
	lib.skill._aiyh_neiKey = {
		//内奸可亮明身份
		mode: ['identity'],
		enable: 'phaseUse',
		filter(event, player) {
			if (player.identity !== 'nei' || player.storage.neiKey) return false;
			if (player.identityShown) return lib.config.extension_AI优化_neiKey === 'must';
			return lib.config.extension_AI优化_neiKey !== 'off';
		},
		log: false,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		ruleSkill: true,
		async content(event, trigger, player) {
			player.storage.neiKey = true;
			game.log(player, '亮明了身份');
			game.broadcastAll(function (player) {
				player.showIdentity();
			}, player);
			game.log(player, '的身份为', '#b内奸');
			await player.gainMaxHp();
			player.removeSkill('gjcx_neiAi_expose');
			const bool = await player
				.chooseBool('是否令你和' + get.translation(game.zhu) + '各回复1点体力？')
				.set('ai', () => get.event('bool'))
				.set(
					'bool',
					game.zhu.isHealthy() ||
						!game.hasPlayer(function (current) {
							return current.identity === 'zhong' || current.identity === 'mingzhong';
						}) ||
						(player.isDamaged() && player.hp <= 2) ||
						(game.zhu.isDamaged() && game.zhu.hp <= 1)
				);
			if (bool) {
				await player.recover();
				await game.zhu.recover();
			}
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					if (
						!game.hasPlayer(function (current) {
							return current.identity === 'zhong' || current.identity === 'mingzhong';
						}) ||
						(player.hp <= 1 && !player.countCards('hs', 'tao') && !player.countCards('hs', 'jiu'))
					)
						return 1;
					if (
						!game.hasPlayer(function (current) {
							return current.identity === 'fan';
						})
					) {
						if (get.attitude(game.zhu, player) < -1 || (get.attitude(game.zhu, player) < 0 && player.ai.shown >= 0.95))
							return 1;
						return -3;
					}
					if (
						(!player.hasSkill('gjcx_neiZhong') &&
							!player.hasSkill('gjcx_neiJiang') &&
							((player.hp <= 2 && game.zhu.hp <= 2) || (game.zhu.isHealthy() && lib.config.extension_AI优化_sfjAi))) ||
						(game.zhu.hp <= 1 &&
							!player.countCards('hs', 'tao') &&
							(player.hasSkill('gjcx_neiZhong') || !lib.config.extension_AI优化_sfjAi))
					)
						return 1;
					return -3;
				},
			},
		},
	};
	lib.skill._aiyh_fixQz = {
		//武将权重
		enable: 'phaseUse',
		filter(event, player) {
			return player === game.me && lib.config.extension_AI优化_fixQz;
		},
		filterTarget(card, player, target) {
			return target.name !== 'unknown' || (target.name2 !== undefined && target.name2 !== 'unknown');
		},
		prompt: '修改一名角色一张武将牌的权重',
		log: false,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			let trans = [];
			event.names = [];
			if (target.name !== 'unknown') {
				trans.push(get.translation(target.name));
				event.names.push(target.name);
			}
			if (target.name2 !== undefined && target.name2 !== 'unknown') {
				trans.push(get.translation(target.name2));
				event.names.push(target.name2);
			}
			if (trans.length > 1)
				player
					.chooseControl(names)
					.set('prompt', '请选择要修改权重的武将')
					.set('ai', function () {
						return 0;
					});
			else event._result = { index: 0 };
			'step 1'
			event.name = event.names[result.index];
			if (lib.config.extension_AI优化_qz[event.name] === undefined) lib.config.extension_AI优化_qz[event.name] = 1;
			event.qz = lib.config.extension_AI优化_qz[event.name];
			'step 2'
			let list = ['+1', '+0.1', '+0.01'];
			event.qz = Math.round(event.qz * 100) / 100;
			if (event.qz > 1) list.push('-1');
			if (event.qz > 0.1) list.push('-0.1');
			if (event.qz > 0.01) list.push('-0.01');
			list.push('删除此记录');
			list.push('确认修改');
			player
				.chooseControl(list)
				.set('prompt', get.translation(event.name) + '的 权重：<span style="color: #FFFF00">' + event.qz + '</span>')
				.set('prompt2', '武将ID：' + event.name + '<br />该值将作为内奸AI判断角色实力的首选')
				.set('ai', () => '确认修改');
			'step 3'
			if (result.control === '确认修改') {
				lib.config.extension_AI优化_qz[event.name] = event.qz;
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
			} else if (result.control === '删除此记录') {
				delete lib.config.extension_AI优化_qz[event.name];
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
			} else {
				if (result.control === '+1') event.qz++;
				else if (result.control === '+0.1') event.qz += 0.1;
				else if (result.control === '+0.01') event.qz += 0.01;
				else if (result.control === '-0.01') event.qz -= 0.01;
				else if (result.control === '-0.1') event.qz -= 0.1;
				else if (result.control === '-1') event.qz--;
				event.goto(2);
			}
		},
		ai: {
			result: {
				target: 0,
			},
		},
	};
	lib.skill._aiyh_fixCf = {
		//技能威胁度
		enable: 'phaseUse',
		filter(event, player) {
			return player === game.me && lib.config.extension_AI优化_fixCf;
		},
		filterTarget: true,
		prompt: '修改一名角色当前拥有的一项技能的威胁度',
		log: false,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			let trans = [],
				skills = target.getSkills(null, false, false).filter(function (i) {
					return lib.translate[i];
				});
			event.skills = skills;
			event.ths = [];
			for (let i = 0; i < skills.length; i++) {
				let info = lib.skill[skills[i]],
					th = 1;
				if (!info) info = { ai: { threaten: 1 } };
				else if (!info.ai) info.ai = { threaten: 1 };
				else if (typeof info.ai.threaten === 'undefined') info.ai.threaten = 1;
				else if (typeof info.ai.threaten === 'number') th = info.ai.threaten;
				else th = '一个函数（不建议修改）';
				if (typeof th === 'number') event.ths.push(th);
				else event.ths.push(1);
				trans.push(
					'<span style="color: #00FF00">' + lib.translate[skills[i]] + '</span> | <span style="color: #FFFF00">' + skills[i] + '</span>：' + th
				);
			}
			if (trans.length > 1)
				player
					.chooseControl()
					.set('choiceList', trans)
					.set('prompt', '请选择要修改威胁度的技能')
					.set('ai', function () {
						return 0;
					});
			else event._result = { index: 0 };
			'step 1'
			event.skill = event.skills[result.index];
			event.th = event.ths[result.index];
			'step 2'
			let list = ['+1', '+0.1', '+0.01'],
				str = '技能ID：' + event.skill;
			event.th = Math.round(event.th * 100) / 100;
			if (event.target.tempSkills[event.skill]) str = '<span style="color: #FF3300">这是一项临时技能</span><br />';
			if (lib.translate[event.skill + '_info']) str += lib.translate[event.skill + '_info'];
			else str += '暂无技能描述';
			if (event.th > 1) list.push('-1');
			if (event.th > 0.1) list.push('-0.1');
			if (event.th > 0.01) list.push('-0.01');
			list.push('删除此记录');
			list.push('确认修改');
			player
				.chooseControl(list)
				.set(
					'prompt',
					get.translation(event.skill) +
						'（' +
						get.translation(target) +
						'）：当前为<span style="color: #00FFFF">' +
						event.th +
						'</span>'
				)
				.set('prompt2', str)
				.set('ai', function () {
					return '确认修改';
				});
			'step 3'
			if (result.control === '确认修改') {
				let s = lib.skill[event.skill];
				if (!s) s = { ai: { threaten: event.th } };
				else if (!s.ai) s.ai = { threaten: event.th };
				else s.ai.threaten = event.th;
				lib.config.extension_AI优化_cf[event.skill] = event.th;
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
			} else if (result.control === '删除此记录') {
				delete lib.config.extension_AI优化_cf[event.skill];
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
			} else {
				if (result.control === '+1') event.th++;
				else if (result.control === '+0.1') event.th += 0.1;
				else if (result.control === '+0.01') event.th += 0.01;
				else if (result.control === '-1') event.th--;
				else if (result.control === '-0.1') event.th -= 0.1;
				else if (result.control === '-0.01') event.th -= 0.01;
				event.goto(2);
			}
		},
		ai: {
			result: {
				target: 0,
			},
		},
	};
	lib.skill._findZhong = {
		//慧眼识忠
		trigger: {
			global: 'gameStart',
		},
		unique: true,
		silent: true,
		charlotte: true,
		superCharlotte: true,
		mode: ['identity'],
		filter(event, player) {
			return (
				player.identity === 'zhu' &&
				_status.mode === 'normal' &&
				lib.config.extension_AI优化_findZhong &&
				game.countPlayer(function (current) {
					return current.identity === 'zhong';
				})
			);
		},
		content() {
			let list = [];
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].identity === 'zhong') list.push(game.players[i]);
			}
			let target = list.randomGet();
			player.storage.dongcha = target;
			if (!_status.connectMode) {
				if (player === game.me) {
					target.setIdentity('zhong');
					target.node.identity.classList.remove('guessing');
					target.zhongfixed = true;
				}
			} else player.chooseControl('ok').set('dialog', [get.translation(target) + '是忠臣', [[target.name], 'character']]);
		},
	};
	lib.skill._mjAiSkill = {
		//盲狙AI
		trigger: { player: 'phaseZhunbeiBegin' },
		filter(event, player) {
			return lib.config.extension_AI优化_mjAi && player.phaseNumber === 1 && (player === game.zhu || player.identity === 'zhong');
		},
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		mode: ['identity'],
		content() {
			player.addTempSkill('aiMangju');
		},
	};
	lib.skill.aiMangju = {
		//盲狙
		forced: true,
		unique: true,
		popup: false,
		silent: true,
		charlotte: true,
		superCharlotte: true,
		mode: ['identity'],
		ai: {
			effect: {
				player(card, player, target, current) {
					let name = get.name(card, player);
					if (get.tag(card, 'damage') && Math.abs(get.attitude(player, target)) < 0.5) {
						if (name === 'juedou') return [1, player.countCards('hs') / 400];
						if (name === 'huogong') return [1, player.countCards('h') / 200];
						if (name === 'sha' && !game.hasNature(card)) {
							if (
								(target.hasSkill('tengjia3') || target.hasSkill('rw_tengjia4')) &&
								!(player.getEquip('qinggang') || player.getEquip('zhuque'))
							)
								return 'zeroplayertarget';
						}
						if (
							name === 'sha' &&
							get.color(card) === 'black' &&
							(target.hasSkill('renwang_skill') || target.hasSkill('rw_renwang_skill'))
						) {
							if (!player.getEquip('qinggang')) return 'zeroplayertarget';
						}
						if (get.attitude(player, target) === 0) return [1, 0.005];
					}
					if (
						name === 'guohe' ||
						name === 'shunshou' ||
						name === 'lebu' ||
						name === 'bingliang' ||
						name === 'caomu' ||
						name === 'zhujinqiyuan' ||
						name === 'caochuanjiejian' ||
						name === 'toulianghuanzhu'
					) {
						if (get.attitude(player, target) === 0) return [1, 0.01];
					}
				},
			},
		},
	};
	lib.translate._aiyh_neiKey = '<span style="color: #8DD8FF">亮明身份</span>';
	lib.translate._aiyh_fixQz = '<span style="color: #FFFF00">修改权重</span>';
	lib.translate._aiyh_fixCf = '<span style="color: #FF3300">修改威胁度</span>';

	/*AI优化*/
	if (lib.config.extension_AI优化_qjAi) {
		lib.skill.aiyh_gjcx_qj = {
			mod: {
				aiOrder: (player, card, num) => {
					if (!player._aiyh_order_temp && num > 0 && get.itemtype(card) === 'card' && get.position(card) !== 'e') {
						if (get.type(card) === 'equip') {
							for (let i of get.subtypes(card)) {
								if (!player.hasEnabledSlot(i)) return num;
							}
							player._aiyh_order_temp = true;
							let sub = get.subtype(card),
								dis = player.needsToDiscard(),
								equipValue = get.equipValue(card, player);
							if (!player.isEmpty(sub) && !player.hasSkillTag('noe')) {
								let ec = player.getEquips(sub).reduce((val, carde) => {
									if (lib.filter.canBeReplaced(carde, player)) return Math.min(val, get.equipValue(carde, player));
								}, 20);
								if (equipValue - ec <= 1.2 * Math.max(0, 2 - dis)) {
									delete player._aiyh_order_temp;
									return 0;
								}
								if (card.name !== 'zhuge') num /= 5;
							}
						}
						delete player._aiyh_order_temp;
						if (get.name(card, player) !== 'sha') return Math.max(0.01, num - ((get.number(card) || 0) - 6) / 200);
					}
				},
				aiUseful: (player, card, num) => {
					if (num > 0 && get.itemtype(card) === 'card') {
						if (get.type(card) === 'equip')
							for (let i of get.subtypes(card)) {
								if (!player.hasEnabledSlot(i)) return 0;
							}
						num += ((get.number(card) || 0) - 6) / 100;
						if (get.name(card, player) === 'sha') {
							let nature = get.natureList(card);
							if (nature.includes('fire')) num += 0.08;
							if (nature.includes('thunder')) num += 0.05;
							if (nature.includes('ice')) num += 0.18;
							if (nature.includes('stab')) num += 0.25;
						}
						return Math.max(0.01, num);
					}
				},
				aiValue: (player, card, num) => {
					if (!player._aiyh_value_temp && num > 0 && get.itemtype(card) === 'card') {
						if (get.type(card) === 'equip')
							for (let i of get.subtypes(card)) {
								if (!player.hasEnabledSlot(i)) return 0.01 * num;
							}
						num += ((get.number(card) || 0) - 6) / 50;
						if (get.name(card, player) === 'sha') {
							let nature = get.natureList(card);
							if (nature.includes('fire')) num += 0.18;
							if (nature.includes('thunder')) num += 0.1;
							if (nature.includes('ice')) num += 0.36;
							if (nature.includes('stab')) num += 0.5;
						}
						return Math.max(0.01, num);
					}
				},
			},
			charlotte: true,
			superCharlotte: true,
		};
		lib.skill._aiyh_reserved_shan = {
			//防酒杀ai，透视酒
			silent: true,
			locked: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			ai: {
				effect: {
					player: (card, player, target) => {
						if (
							typeof card !== 'object' ||
							player.hp <= 1 ||
							get.name(card, player) !== 'shan' ||
							player.countCards('hs', (card) => {
								let name = get.name(card, player);
								return (name === 'shan' || name === 'hufu') && lib.filter.cardEnabled(card, player, 'forceEnable');
							}) !== 1 ||
							((player.hp > 2 || (!player.isZhu && player.hp > 1)) && player.hasSkillTag('respondShan', true, 'use', true))
						)
							return;
						let par = _status.event.getParent();
						if (!par || get.itemtype(par.player) !== 'player') par = _status.event.getParent(2);
						if (!par || get.itemtype(par.player) !== 'player') return;
						if (typeof par.baseDamage === 'number') {
							let num = par.baseDamage;
							if (typeof par.extraDamage === 'number') num += par.extraDamage;
							if (player.hp <= num) return;
						}
						if (
							par.card &&
							game.hasNature(par.card, 'fire') &&
							player.hasSkill('tengjia2') &&
							!player.hasSkillTag('unequip2') &&
							(!par.player ||
								!par.player.hasSkillTag('unequip', false, {
									name: par.name || null,
									target: player,
									card: par.card,
									cards: par.cards,
								}))
						)
							return;
						if (
							!par.player.isPhaseUsing() ||
							par.player.hasSkill('hanbing_skill') ||
							!par.player.getCardUsable('sha') ||
							!par.player.getCardUsable('jiu')
						)
							return;
						if (
							par.card &&
							player.isLinked() &&
							game.hasNature(par.card) &&
							game.hasPlayer((current) => {
								return (
									player !== current &&
									current.isLinked() &&
									get.damageEffect(current, par.player, player, get.natureList(par.card)) < 0
								);
							})
						)
							return;
						let known = par.player.getKnownCards(player);
						if (
							par.player.hasCard((i) => {
								return get.name(i) === 'jiu' && par.player.canUse(i, par.player, null, true);
							}, 'hs') > _status.event.getRand('aiyh_reserved_shan') &&
							par.player.mayHaveSha(player, 'use')
						)
							return 'zeroplayertarget';
					},
				},
			},
		};
	}
	if (lib.config.extension_AI优化_sfjAi) {
		//身份局AI
		lib.skill.gjcx_zhuAi = {
			trigger: { global: 'zhuUpdate' },
			silent: true,
			forced: true,
			unique: true,
			popup: false,
			charlotte: true,
			superCharlotte: true,
			content() {
				let target = game.findPlayer(function (current) {
					return current === game.zhu;
				});
				player.removeSkill('gjcx_zhuAi');
				target.addSkill('gjcx_zhuAi');
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (
							typeof card !== 'object' ||
							player._aiyh_zhuAi_temp ||
							player.hasSkill('aiMangju') ||
							get.itemtype(target) !== 'player'
						)
							return;
						player._aiyh_zhuAi_temp = true;
						let att = get.attitude(player, target),
							name = get.name(card, player);
						delete player._aiyh_zhuAi_temp;
						if (Math.abs(att) < 1 && player.needsToDiscard()) {
							if (
								(get.tag(card, 'damage') &&
									name !== 'huogong' &&
									name !== 'juedou' &&
									(target.hp > 1 || player.hasSkillTag('jueqing', false, target))) ||
								name === 'lebu' ||
								name === 'bingliang' ||
								name === 'fudichouxin'
							)
								return [1, 0.8];
						}
					},
					target(card, player, target) {
						if (typeof card !== 'object' || target._zhuCx_temp || get.itemtype(player) !== 'player') return 1;
						target._zhuCx_temp = true;
						let eff = get.effect(target, card, player, target);
						delete target._zhuCx_temp;
						if (!eff) return;
						if (get.tag(card, 'damage')) return [1, -Math.min(3, 0.8 * target.getDamagedHp()) - 0.6];
						if (get.name(card) === 'lebu' || get.name(card) === 'bingliang') return [1, -0.8];
					},
				},
			},
		};
		lib.skill.gjcx_neiAi = {
			init(player) {
				game.countPlayer(function (current) {
					current.storage.gjcx_neiAi = current.maxHp;
				});
			},
			trigger: {
				global: ['phaseUseBegin', 'changeHp', 'dieAfter', 'zhuUpdate', 'changeIdentity'],
			},
			silent: true,
			forced: true,
			forceDie: true,
			unique: true,
			popup: false,
			priority: -1,
			charlotte: true,
			superCharlotte: true,
			mode: ['identity'],
			filter(event, player) {
				return !player.hasSkill('gjcx_neiAi_nojump') && !player.hasSkill('gjcx_neiAi_suspend');
			},
			async content(event, trigger, player) {
				player.removeSkill('gjcx_neiJiang');
				player.removeSkill('gjcx_neiZhong');
				player.removeSkill('gjcx_neiFan');
				let end = false;
				if (player.identity !== 'nei' || game.players.length <= 2) {
					player.removeSkill('gjcx_neiAi');
					player.removeSkill('gjcx_neiAi_damage');
					player.removeSkill('gjcx_neiAi_expose');
					end = true;
				}
				if (
					trigger.name === 'die' &&
					!game.hasPlayer(function (current) {
						return current.identity === 'fan';
					})
				) {
					player.removeSkill('gjcx_neiAi_damage');
					player.addSkill('gjcx_neiAi_nojump');
					end = true;
				}
				if (end) return;
				let zs = game.filterPlayer(function (current) {
					return current.identity === 'zhu' || current.identity === 'zhong' || current.identity === 'mingzhong';
				});
				let fs = game.filterPlayer(function (current) {
					return current.identity === 'fan';
				});
				let all = 0,
					mine = 0;
				for (let i of game.players) {
					let sym,
						base1 = 1,
						base2 = 0,
						temp = 0;
					if (i === player || zs.includes(i)) sym = 1;
					else if (fs.includes(i)) sym = -1;
					else continue;
					if (i.hp > 0) {
						if (typeof lib.aiyh.qz[i.name] === 'number') base1 = lib.aiyh.qz[i.name];
						if (lib.config.extension_AI优化_takeQz && game.purifySFConfig) {
							let sfc = get.purifySFConfig(lib.config[get.sfConfigName(i.identity)], lib.config.extension_AI优化_min)[
									i.name
								],
								sl = 0.5;
							if (sfc && typeof sfc.sl === 'number') sl = sfc.sl;
							if (sl < 0.4) base1 = 0.6 + sl;
							else if (sl < 0.8) base1 = 2 * sl + 0.2;
							else base1 = 3 * sl - 0.6;
						} else if (typeof lib.config.extension_AI优化_qz[i.name] === 'number')
							base1 = lib.config.extension_AI优化_qz[i.name];
						else if (lib.config.extension_AI优化_pjQz) {
							let rank = lib.rank;
							if (rank.bp.includes(i.name)) base1 = 1.4;
							else if (rank.am.includes(i.name)) base1 = 1.8;
							else if (rank.b.includes(i.name)) base1 = 1.2;
							else if (rank.a.includes(i.name)) base1 = 2.4;
							else if (rank.ap.includes(i.name)) base1 = 2.7;
							else if (rank.c.includes(i.name)) base1 = 0.8;
							else if (rank.s.includes(i.name)) base1 = 3.2;
							else if (rank.d.includes(i.name)) base1 = 0.6;
						}
						lib.aiyh.qz[i.name] = base1;
						if (i.name2 !== undefined) {
							if (typeof lib.aiyh.qz[i.name2] === 'number') base2 = lib.aiyh.qz[i.name2];
							if (lib.config.extension_AI优化_takeQz && game.purifySFConfig) {
								let sfc = get.purifySFConfig(lib.config[get.sfConfigName(i.identity)], lib.config.extension_AI优化_min)[
										i.name2
									],
									sl = 0.5;
								if (sfc && typeof sfc.sl === 'number') sl = sfc.sl;
								if (sl < 0.4) base2 = 0.6 + sl;
								else if (sl < 0.8) base2 = 2 * sl + 0.2;
								else base2 = 3 * sl - 0.6;
							} else if (typeof lib.config.extension_AI优化_qz[i.name2] === 'number')
								base2 = lib.config.extension_AI优化_qz[i.name2];
							else if (lib.config.extension_AI优化_pjQz) {
								let rank = lib.rank;
								if (rank.bp.includes(i.name2)) base2 = 1.4;
								else if (rank.am.includes(i.name2)) base2 = 1.8;
								else if (rank.b.includes(i.name2)) base2 = 1.2;
								else if (rank.a.includes(i.name2)) base2 = 2.4;
								else if (rank.ap.includes(i.name2)) base2 = 2.7;
								else if (rank.c.includes(i.name2)) base2 = 0.8;
								else if (rank.s.includes(i.name2)) base2 = 3.2;
								else if (rank.d.includes(i.name2)) base2 = 0.6;
							}
							lib.aiyh.qz[i.name2] = base2;
						}
						if (base2) base1 = (base1 + base2) / 2;
						if (i.isTurnedOver()) base1 -= 0.28;
						if (i.storage.gjcx_neiAi && i.storage.gjcx_neiAi !== i.maxHp) {
							if (i.maxHp > i.storage.gjcx_neiAi) {
								if (i.hp > i.storage.gjcx_neiAi)
									temp += ((1 + (i.maxHp - i.storage.gjcx_neiAi) / 10) * base1 * i.hp) / i.maxHp;
								else temp += (base1 * i.hp) / i.storage.gjcx_neiAi;
							} else temp += (base1 * i.hp) / Math.min(5, i.storage.gjcx_neiAi);
						} else temp += (base1 * i.hp) / i.maxHp;
					}
					temp += (i.countCards('hes') - i.countCards('j') * 1.6) / 10;
					if (player === i) mine = temp * Math.sqrt(base1);
					else all += sym * temp;
				}
				if (Math.abs(all) < mine && game.zhu.hp > 2 && zs.length > 1) player.addSkill('gjcx_neiJiang');
				else if (all > -0.06) {
					if (all > 0.36 * mine) player.addSkill('gjcx_neiFan');
					else if (fs.length - zs.length > 1) player.addSkill('gjcx_neiZhong');
					else player.addSkill('gjcx_neiJiang');
				} else player.addSkill('gjcx_neiZhong');
			},
			group: 'gjcx_neiAi_clear',
			subSkill: {
				clear: {
					trigger: {
						global: ['zhuUpdate', 'changeIdentity'],
					},
					silent: true,
					firstDo: true,
					charlotte: true,
					superCharlotte: true,
					content() {
						lib.aiyh.qz = {};
					},
					sub: true,
				},
				damage: {
					mode: ['identity'],
					trigger: { player: 'useCard1' },
					filter(event, player) {
						return get.tag(event.card, 'damage');
					},
					direct: true,
					unique: true,
					lastDo: true,
					charlotte: true,
					superCharlotte: true,
					content() {
						player.addTempSkill('gjcx_neiAi_suspend', { player: 'useCardAfter' });
					},
				},
				expose: {
					mode: ['identity'],
					trigger: { player: 'useCard1' },
					filter(event, player) {
						return !player.identityShown && typeof player.ai.shown === 'number' && player.ai.shown;
					},
					silent: true,
					forced: true,
					unique: true,
					popup: false,
					charlotte: true,
					superCharlotte: true,
					content() {
						if (player.ai.shown >= 0.95 || get.attitude(game.zhu, player) < 0) player.removeSkill('gjcx_neiAi_expose');
						else if (trigger.card.name === 'tao') {
							for (let i of trigger.targets) {
								if (player === i) continue;
								if (get.attitude(game.zhu, i) > 0) player.ai.shown -= 0.5;
								else if (i.identity === 'fan') player.ai.shown = 0.99;
							}
						} else if (
							trigger.targets &&
							trigger.targets.length === 1 &&
							player !== trigger.targets[0] &&
							!player.hasSkill('gjcx_neiZhong') &&
							!player.hasSkill('gjcx_neiJiang') &&
							get.attitude(game.zhu, trigger.targets[0]) * get.effect(trigger.targets[0], trigger.card, player, game.zhu) <
								0
						) {
							player.removeSkill('gjcx_neiAi_expose');
							player.ai.shown = 0.99;
						} else if (!player.hasSkill('gjcx_neiFan')) player.ai.shown -= 0.03;
					},
				},
				suspend: {
					charlotte: true,
					superCharlotte: true,
				},
				nojump: {
					charlotte: true,
					superCharlotte: true,
				},
			},
		};
		lib.skill.gjcx_neiZhong = {
			silent: true,
			forced: true,
			unique: true,
			popup: false,
			charlotte: true,
			superCharlotte: true,
			mode: ['identity'],
			ai: {
				effect: {
					player(card, player, target) {
						if (typeof card !== 'object' || player._aiyh_neiZhong_temp || get.itemtype(target) !== 'player') return 1;
						player._aiyh_neiZhong_temp = true;
						let eff = get.effect(target, card, player, player),
							name = get.name(card, player);
						delete player._aiyh_neiZhong_temp;
						if (!eff) return;
						if ((get.tag(card, 'damage') && name !== 'huogong') || name === 'lebu' || name === 'bingliang') {
							if (target.identity === 'zhu') return [1, -3];
							if (target.ai.shown < 0.95 && get.attitude(game.zhu, target) <= 0) {
								if (player.needsToDiscard()) return [1, 0.5];
								return [0, 0];
							}
							if (target.identity !== 'fan') return [1, -2];
							return [1, 0.9];
						}
						if (name === 'tao') {
							if (
								target === player ||
								target === game.zhu ||
								(_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)
							)
								return 1;
							if (target.identity !== 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 0.8];
							return [1, -2];
						}
					},
				},
			},
		};
		lib.skill.gjcx_neiFan = {
			silent: true,
			forced: true,
			unique: true,
			popup: false,
			charlotte: true,
			superCharlotte: true,
			mode: ['identity'],
			ai: {
				effect: {
					player(card, player, target) {
						if (typeof card !== 'object' || player._aiyh_neiFan_temp || get.itemtype(target) !== 'player') return;
						player._aiyh_neiFan_temp = true;
						let eff = get.effect(target, card, player, player),
							name = get.name(card, player);
						delete player._aiyh_neiFan_temp;
						if (!eff) return;
						if ((get.tag(card, 'damage') && name !== 'huogong') || name === 'lebu' || name === 'bingliang') {
							if (
								target.identity === 'zhu' &&
								(target.hp < 2 ||
									game.hasPlayer(function (current) {
										return current.identity === 'zhong' || current.identity === 'mingzhong';
									}))
							)
								return [1, -3];
							if (target.identity === 'fan') return [1, -2];
							if (target.ai.shown < 0.95) {
								if (player.needsToDiscard()) return [1, 0.5];
								return [0, 0];
							}
							return [1, 0.9];
						}
						if (name === 'tao') {
							if (
								target === player ||
								target === game.zhu ||
								(_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)
							)
								return;
							if (target.identity === 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 1.6];
							return [1, -2];
						}
					},
				},
			},
		};
		lib.skill.gjcx_neiJiang = {
			silent: true,
			forced: true,
			unique: true,
			popup: false,
			charlotte: true,
			superCharlotte: true,
			mode: ['identity'],
			ai: {
				effect: {
					player(card, player, target) {
						if (typeof card !== 'object' || get.itemtype(target) !== 'player') return;
						let name = get.name(card);
						if ((get.tag(card, 'damage') && name !== 'huogong') || name === 'lebu' || name === 'bingliang') {
							if (target.identity === 'zhu') return [1, -3];
							if (!player.needsToDiscard()) return [0, 0];
							return [1, -0.5];
						}
						if (name === 'tao') {
							if (target === player && game.zhu.hp > 2) return [1, 0.9];
							if (target === player || target === game.zhu) return;
							return [1, -2];
						}
						if (name === 'jiu' && player.hp > 0) return [0, 0];
					},
				},
			},
		};
		lib.skill._aiyh_lianhe = {
			//联合ai
			mode: ['identity'],
			locked: true,
			unique: true,
			forceDie: true,
			charlotte: true,
			superCharlotte: true,
			ai: {
				effect: {
					player(card, player, target) {
						if (typeof card !== 'object' || get.itemtype(target) !== 'player' || target.ai.shown < 0.95 || player === target)
							return 1;
						if (
							target.identity === 'nei' &&
							!player.getFriends().length &&
							(player.identity === 'fan' || player === game.zhu) &&
							game.countPlayer(function (current) {
								let num = 1;
								if (typeof lib.aiyh.qz[current.name] === 'number') num = lib.aiyh.qz[current.name];
								else if (typeof lib.config.extension_AI优化_qz[current.name] === 'number')
									num = lib.config.extension_AI优化_qz[current.name];
								if (current.name2 !== undefined) {
									if (typeof lib.aiyh.qz[current.name2] === 'number') num = (num + lib.aiyh.qz[current.name2]) / 2;
									else if (typeof lib.config.extension_AI优化_qz[current.name2] === 'number')
										num = (num + lib.config.extension_AI优化_qz[current.name2]) / 2;
								}
								if (current.isTurnedOver()) num -= 0.28;
								if (current.storage.gjcx_neiAi && current.storage.gjcx_neiAi !== current.maxHp) {
									if (current.maxHp > current.storage.gjcx_neiAi) {
										if (current.hp > current.storage.gjcx_neiAi)
											num *= ((1 + (current.maxHp - current.storage.gjcx_neiAi) / 10) * current.hp) / current.maxHp;
										else num *= current.hp / current.storage.gjcx_neiAi;
									} else num *= current.hp / Math.min(5, current.storage.gjcx_neiAi);
								} else num *= current.hp / current.maxHp;
								num += current.countCards('hes') * 0.1 - current.countCards('j') * 0.16;
								if (current === player) return -2 * num;
								if (current.identity === 'nei') return -num;
								return num;
							}) > 0
						) {
							if (get.tag(card, 'damage')) return [1, -2];
							if (get.name(card) === 'tao' && player.hp > 1 && player.countCards('hs', 'tao') + target.hp > 0)
								return [1, 2];
						}
					},
				},
			},
		};
	}
	lib.arenaReady.push(function () {
		//杂项
		if (!lib.aiyh) lib.aiyh = {};
		if (!lib.aiyh.qz) lib.aiyh.qz = {};
		if (!lib.aiyh.skillModify) lib.aiyh.skillModify = {};
		if (Object.prototype.toString.call(lib.config.extension_AI优化_qz) !== '[object Object]')
			game.saveExtensionConfig('AI优化', 'qz', {});
		if (Object.prototype.toString.call(lib.config.extension_AI优化_cf) !== '[object Object]')
			game.saveExtensionConfig('AI优化', 'cf', {});
		if (lib.config.extension_AI优化_viewAtt) {
			//火眼金睛
			ui.create.system(
				'查看态度',
				function () {
					var STR = '';
					for (var i = 0; i < game.players.length; i++) {
						var str = '';
						for (var j = 0; j < game.players.length; j++) {
							str +=
								get.translation(game.players[i]) +
								'对' +
								get.translation(game.players[j]) +
								'的态度为' +
								get.attitude(game.players[i], game.players[j]) +
								'\n';
						}
						STR += str + '\n';
					}
					alert(STR);
				},
				true
			);
		}
		if (lib.config.extension_AI优化_removeMini) {
			/*小游戏*/
			if (lib.skill.qiaosi && game.aiyh_skillOptEnabled('qiaosi', '跳过〖巧思〗小游戏')) {
				lib.skill.qiaosi = {
					audio: 'xinfu_qiaosi',
					enable: 'phaseUse',
					usable: 1,
					async content(event, trigger, player) {
						const result = await player
							.chooseButton([
								'巧思：请选择以下至多三个效果',
								[
									[
										[1, '王：获得两张锦囊牌'],
										[2, '商：从两张装备牌、一张【杀】或【酒】中获得一张。选中“将”则改为【杀】或【酒】'],
										[3, '工：从两张【杀】和一张【酒】中获得一张'],
										[4, '农：从两张【闪】和一张【桃】中获得一张'],
										[5, '士：从两张锦囊牌、一张【闪】或【桃】中获得一张。选中“王”则改为【闪】或【桃】'],
										[6, '将：获得两张装备牌'],
									],
									'textbutton',
								],
							])
							.set('forced', true)
							.set('ai', (button) => {
								switch (button.link) {
									case 1:
									case 6:
										return 1;
									default:
										return Math.random();
								}
							})
							.set('selectButton', [1, 3])
							.forResult();
						const list = result.links;
						if (!Array.isArray(list)) return;
						let list2 = [];
						if (list.includes(1)) {
							list2.push('trick');
							list2.push('trick');
						}
						if (list.includes(2)) {
							if (list.includes(6)) list2.push(['sha', 'jiu']);
							else list2.push(Math.random() < 0.66 ? 'equip' : ['sha', 'jiu']);
						}
						if (list.includes(3)) {
							list2.push([Math.random() < 0.66 ? 'sha' : 'jiu']);
						}
						if (list.includes(4)) {
							list2.push([Math.random() < 0.66 ? 'shan' : 'tao']);
						}
						if (list.includes(5)) {
							if (list.includes(1)) list2.push(['shan', 'tao']);
							else list2.push(Math.random() < 0.66 ? 'trick' : ['shan', 'tao']);
						}
						if (list.includes(6)) {
							list2.push('equip');
							list2.push('equip');
						}
						let cards = [];
						while (list2.length) {
							const filter = list2.shift();
							let card = get.cardPile(function (x) {
								if (cards.includes(x)) return false;
								if (typeof filter === 'string' && get.type(x, 'trick') === filter) return true;
								if (typeof filter === 'object' && filter.includes(x.name)) return true;
							});
							if (card) cards.push(card);
							else {
								card = get.cardPile(function (x) {
									return !cards.includes(x);
								});
								if (card) cards.push(card);
							}
						}
						const num = cards.length;
						if (!num) return;
						await player.showCards(cards);
						await player.gain(cards, 'gain2');
						if (!player.countCards('he')) return;
						const next = await player
							.chooseControl()
							.set('choiceList', ['将' + get.cnNumber(num) + '张牌交给一名其他角色', '弃置' + get.cnNumber(num) + '张牌'])
							.set('ai', function () {
								if (
									game.hasPlayer(function (current) {
										return current !== player && get.attitude(player, current) > 2;
									})
								)
									return 0;
								return 1;
							})
							.forResult();
						if (next.index) {
							await player.chooseToDiscard(num, true, 'he');
							return;
						}
						const next2 = await player
							.chooseCardTarget({
								position: 'he',
								filterCard: true,
								selectCard: Math.min(num, player.countCards('he')),
								filterTarget(card, player, target) {
									return player !== target;
								},
								ai1(card) {
									return 1;
								},
								ai2(target) {
									var att = get.attitude(_status.event.player, target);
									if (target.hasSkillTag('nogain')) att /= 10;
									if (target.hasJudge('lebu')) att /= 5;
									return att;
								},
								prompt: '选择' + get.cnNumber(num) + '张牌，交给一名其他角色。',
								forced: true,
							})
							.forResult();
						if (next2.bool) await player.give(next2.cards, next2.targets[0]);
					},
					ai: {
						order: 10,
						result: { player: 1 },
						threaten: 3.2,
					},
				};
				lib.translate.qiaosi_info = ui.joint`
					出牌阶段限一次，你可以选择以下至多三个效果：
						王：获得两张锦囊牌；
						商：从两张装备牌、一张【杀】或【酒】中获得一张。选中“将”则改为【杀】或【酒】；
						工：从两张【杀】和一张【酒】中获得一张；
						农：从两张【闪】和一张【桃】中获得一张；
						士：从两张锦囊牌、一张【闪】或【桃】中获得一张。选中“王”则改为【闪】或【桃】；
						将：获得两张装备牌。
					若你获得了牌，你须选择一项：将等量张牌交给一名其他角色；弃置等量张牌。
				`;
			}
			if (lib.skill.chongxu && game.aiyh_skillOptEnabled('chongxu', '跳过〖冲虚〗小游戏')) {
				lib.skill.chongxu = {
					audio: 2,
					enable: 'phaseUse',
					usable: 1,
					async content(event, trigger, player) {
						let list = [];
						if (player.countMark('miaojian') < 2 && player.hasSkill('miaojian')) list.push('修改【妙剑】');
						if (player.countMark('shhlianhua') < 2 && player.hasSkill('shhlianhua')) list.push('修改【莲华】');
						let result = { control: '摸两张牌' };
						if (list.length) {
							list.push('摸两张牌');
							result = await player.chooseControl(list).set('prompt', '冲虚：修改技能并摸一张牌；或摸两张牌').forResult();
						}
						if (result.control !== '摸两张牌') {
							var skill = result.control === '修改【妙剑】' ? 'miaojian' : 'shhlianhua';
							player.addMark(skill, 1, false);
							game.log(player, '修改了技能', '#g【' + get.translation(skill) + '】');
							await player.draw();
						} else await player.draw(2);
					},
					ai: {
						order: 10,
						result: {
							player: 1,
						},
					},
				};
				lib.dynamicTranslate.chongxu = (player) => {
					let list = [];
					if (player.countMark('miaojian') < 2 && player.hasSkill('miaojian')) list.push('〖妙剑〗');
					if (player.countMark('shhlianhua') < 2 && player.hasSkill('shhlianhua')) list.push('〖莲华〗');
					if (list.length) return '出牌阶段限一次，你可以修改' + list.join('或') + '并摸一张牌；或摸两张牌。';
					return '出牌阶段限一次，你可以摸两张牌。';
				};
				lib.translate.chongxu_info = '出牌阶段限一次，你可以修改〖妙剑〗或〖莲华〗并摸一张牌；或摸两张牌。';
			}
			if (lib.skill.yufeng && game.aiyh_skillOptEnabled('yufeng', '跳过〖御风〗小游戏')) {
				lib.skill.yufeng = {
					init(player) {
						player.storage.yufeng = [2, 2, 3];
					},
					audio: 2,
					enable: 'phaseUse',
					usable: 1,
					async content(event, trigger, player) {
						let num = player.storage.yufeng.shift();
						if (!player.storage.yufeng.length) lib.skill.yufeng.init(player);
						const result = await player
							.chooseTarget([1, num], (card, player, target) => {
								return !target.hasSkill('yufeng2');
							})
							.set('prompt', '请选择【御风】的目标')
							.set('prompt2', '选择自己则不摸牌')
							.set('ai', (target) => {
								let player = _status.event.player,
									att = -get.attitude(player, target),
									attx = att * 2;
								if (att <= 0 || target.hasSkill('xinfu_pdgyingshi')) return 0;
								if (target.hasJudge('lebu')) attx -= att;
								if (target.hasJudge('bingliang')) attx -= att;
								return attx / Math.max(2.25, Math.sqrt(target.countCards('h') + 1));
							})
							.forResult();
						if (result.bool && result.targets?.includes(player)) {
							result.targets.remove(player);
							num = result.targets.length;
							if (!num) result.bool = false;
						}
						game.log(player, '御风飞行', result.bool ? '#g成功' : '#y失败');
						player.popup(get.cnNumber(num) + '分', num ? 'wood' : 'fire');
						game.log(player, '获得了', '#y' + num + '分');
						if (!num) return;
						if (result.bool) {
							const targets = result.targets.sortBySeat();
							player.line(targets, 'green');
							game.log(targets, '获得了', '#y“御风”', '效果');
							for (let i of targets) i.addSkill('yufeng2');
							if (num > targets.length) await player.draw(num - targets.length);
						} else await player.draw(num);
					},
					ai: {
						order() {
							if (game.hasPlayer((current) => get.attitude(_status.event.player, current) === 0)) return 2;
							return 10;
						},
						result: { player: 1 },
						threaten(player, target) {
							return (
								1 +
								Math.min(
									game.countPlayer((cur) => {
										return get.attitude(target, cur) < 0;
									}),
									3
								)
							);
						},
					},
				};
			}
			if (lib.skill.xinfu_pingcai && game.aiyh_skillOptEnabled('xinfu_pingcai', '跳过〖评才〗小游戏')) {
				lib.skill.xinfu_pingcai.content = async function (event, trigger, player) {
					const list = ['wolong', 'fengchu', 'xuanjian', 'shuijing'];
					let list2 = [];
					for (let i = 0; i < list.length; i++) {
						list2.push(game.createCard(list[i] + '_card', '', ''));
					}
					const result = await player.chooseButton(['请选择要执行的宝物效果', list2], true)
						.set('ai', function (button) {
							const player = _status.event.player;
							if (button.link.name === 'xuanjian_card') {
								if (
									game.hasPlayer(function (current) {
										return current.isDamaged() && current.hp < 3 && get.attitude(player, current) > 1;
									})
								)
									return 1 + Math.random();
								return 1;
							} else if (button.link.name === 'wolong_card') {
								if (
									game.hasPlayer(function (current) {
										return get.damageEffect(current, player, player, 'fire') > 0;
									})
								)
									return 1.2 + Math.random();
								return 0.5;
							} else return 0.6;
						})
						.forResult();
					if (!result || !result.links || !result.links.length) return;
					const card = result.links[0];
					player.logSkill('pcaudio_' + card.name);
					player.$throw(card);
					event.insert(lib.skill.xinfu_pingcai[card.name], {
						player: player,
					});
				};
				delete lib.skill.xinfu_pingcai.contentx;
				delete lib.skill.xinfu_pingcai.chooseButton;
				lib.translate.xinfu_pingcai_info = '出牌阶段限一次，你可以挑选一个宝物执行对应的效果。';
			}
			if (lib.skill.zhengjing && game.aiyh_skillOptEnabled('zhengjing', '跳过〖整经〗小游戏')) {
				lib.skill.zhengjing = {
					audio: 2,
					enable: 'phaseUse',
					usable: 1,
					filter(event, player) {
						return !player.hasSkill('zhengjing3');
					},
					async content(event, trigger, player) {
						let cards = [],
							names = [],
							num;
						if (get.mode() === 'doudizhu') num = 3;
						else num = 5;
						while (num--) {
							let name = lib.inpile.filter(i => {
									return !names.includes(i);
								}).randomGet(),
								card = get.cardPile(function (i) {
									return i.name === name;
								});
							if (card) {
								cards.push(card);
								names.push(card.name);
							} else if (get.isLuckyStar(player)) {
								card = get.cardPile(function (i) {
									return !names.includes(i.name);
								});
								if (card) {
									cards.push(card);
									names.push(card.name);
								} else break;
							}
						}
						if (!cards.length) return;
						await player.showCards(cards, get.translation(player) + '整理出了以下经典');
						await game.cardsGotoOrdering(cards);
						game.updateRoundNumber();
						const targets = await player
							.chooseTarget(true, '将整理出的经典置于一名角色的武将牌上')
							.set('ai', function (target) {
								if (target.hasSkill('xinfu_pdgyingshi')) return 0;
								let player = _status.event.player,
									js = target.getCards('j', (i) => {
										let name = i.viewAs || i.name,
											info = lib.card[name];
										if (!info || !info.judge) return false;
										return true;
									}),
									eff = -1.5 * get.effect(target, { name: 'draw' }, player, player);
								if (js.length)
									eff += js.reduce((acc, i) => {
										let name = i.viewAs || i.name;
										return acc - 0.7 * get.effect(target, get.autoViewAs({ name }, [i]), target, player);
									}, 0);
								return eff;
							})
							.forResultTargets();
						if (!targets) return;
						const target = targets[0];
						player.line(target, 'thunder');
						let result;
						if (cards.length === 1) result = { bool: true, links: cards };
						else {
							result = await player
								.chooseCardButton('整经：选择要置于' + get.translation(target) + '武将牌上的经典', true, cards, [
									1,
									cards.length,
								])
								.set('ai', (button) => {
									return -get.value(button.link);
								})
								.forResult();
						}
						if (result.bool) {
							let adds = result.links,
								gains = cards.removeArray(result.links);
							target.addSkill('zhengjing2');
							if (player !== target && adds.length < 2 && (get.mode() !== 'identity' || player.identity !== 'nei'))
								player.addExpose(0.2);
							const ex = target.addToExpansion(adds, 'gain2');
							ex.gaintag.add('zhengjing2');
							await ex;
							if (gains.length) await player.gain(gains, 'gain2');
						}
					},
					ai: {
						order: 10,
						result: { player: 1 },
						threaten: 3.2,
					},
				};
				lib.translate.zhengjing_info = ui.joint`
					出牌阶段，你可以整理经书。
					你将其中至少一张作为“经”置于一名角色的武将牌上，然后获得其余的牌。
					该角色的准备阶段获得这些牌，且跳过此回合的判定和摸牌阶段。
				`;
			}
			if (lib.skill.tiansuan && game.aiyh_skillOptEnabled('tiansuan', '跳过〖天算〗小游戏')) {
				lib.skill.tiansuan = {
					audio: 2,
					enable: 'phaseUse',
					filter(event, player) {
						return !player.storage.tiansuan2;
					},
					async content(event, trigger, player) {
						const result = await player
							.chooseControl('上上签', '上签', '中签', '下签', '下下签', 'cancel2')
							.set('prompt', '天算：是否许愿你想要的命运签？')
							.set('ai', () => get.event('idx'))
							.set('idx', (() => {
								if (player.hp < 2) return 0;
								if (game.hasPlayer(cur => {
									return get.attitude(player, cur) > 0 && cur.countCards('j');
								})) return 0;
								if (game.hasPlayer(cur => {
									return get.attitude(player, cur) < 0 && cur.countCards('he') < 2;
								})) return 3;
								if (game.hasPlayer(cur => {
									return get.attitude(player, cur) < 0 && cur.hp < 2;
								})) return 4;
								return 1;
							})())
							.forResult();
						const list = [
							[0.47, 0.65, 0.69, 0.88, 1],
							[0.04, 0.9, 0.94, 0.99, 1],
							[0, 0, 1, 1, 1],
							[0.02, 0.12, 0.14, 0.99, 1],
							[0.06, 0.26, 0.36, 0.55, 1],
							[0.1, 0.45, 0.56, 0.81, 1],
						];
						let num = 4;
						if (result.control !== 'cancel2' && get.isLuckyStar(player)) num = result.index;
						else {
							const odds = list[result.index];
							const rand = Math.random();
							for (let i = 0; i < odds.length; i++) {
								if (rand < odds[i]) {
									num = i;
									break;
								}
							}
						}
						const name = lib.skill['tiansuan2_' + num].name;
						player.popup(name);
						game.log(player, '抽取出了', '#g' + name);
						const targets = await player
							.chooseTarget(true, '令一名角色获得“' + name + '”')
							.set('ai', lib.skill['tiansuan2_' + num].aiCheck)
							.forResultTargets();
						if (!targets || !targets.length) return;
						const target = targets[0];
						player.line(target, 'green');
						game.log(player, '令', target, '获得了命运签');
						player.storage.tiansuan2 = target;
						player.storage.tiansuan3 = 'tiansuan2_' + num;
						player.addTempSkill('tiansuan2', { player: 'phaseBegin' });
						target.addSkill('tiansuan2_' + num);
						let pos = 'e';
						if (target !== player) pos += 'h';
						if (num === 0) pos += 'j';
						if (num < 2 && target.countGainableCards(player, pos) > 0) {
							let next = player.gainPlayerCard(target, pos, true);
							if (num === 0) next.visible = true;
							await next;
						} else await game.delayx();
					},
					derivation: 'tiansuan_faq',
					ai: {
						order: 7,
						result: {
							player: 1,
						},
					},
				};
			}
			if (lib.skill.yukito_kongwu && game.aiyh_skillOptEnabled('yukito_kongwu', '跳过〖控物〗小游戏')) {
				lib.skill.yukito_kongwu = {
					enable: 'phaseUse',
					usable: 1,
					async content(event, trigger, player) {
						var next = player.chooseButton([
							'控物：请选择一项',
							[
								lib.skill.yukito_kongwu.moves.map((t, idx) => {
									return [idx, t.prompt];
								}),
								'textbutton',
							],
						]);
						next.set('forced', true);
						next.set('filterButton', function (button) {
							return lib.skill.yukito_kongwu.moves[button.link].filter(_status.event.player);
						});
						next.set('ai', function (button) {
							const player = _status.event.player;
							const func = lib.skill.yukito_kongwu.moves[button.link].effect;
							const curs = game.filterPlayer();
							let eff = -Infinity;
							for (const cur of curs) {
								let num = func(player, cur);
								if (typeof num === 'number') eff = Math.max(num, eff);
							}
							return eff;
						});
						const result = await next.forResult();
						const num = result.links[0];
						if (typeof num === 'number') await lib.skill.yukito_kongwu.moves[num].content(event, trigger, player);
					},
					moves: [
						{
							prompt: '令一名角色摸两张牌',
							filter: () => true,
							async content(event, trigger, player) {
								const targets = await player
									.chooseTarget(true, '令一名角色摸两张牌')
									.set('ai', function (target) {
										const player = _status.event.player;
										let att = get.attitude(player, target) / Math.sqrt(1 + target.countCards('h'));
										if (target.hasSkillTag('nogain')) att /= 10;
										return att;
									})
									.forResultTargets();
								if (targets) {
									player.line(targets, 'green');
									await targets[0].draw(2);
								}
							},
							effect(player, target) {
								return get.effect(target, { name: 'draw' }, player, player);
							},
						},
						{
							prompt: '对一名角色造成1点伤害',
							filter: () => true,
							async content(event, trigger, player) {
								const targets = await player
									.chooseTarget(true, '对一名角色造成1点伤害')
									.set('ai', function (target) {
										const player = _status.event.player;
										return get.damageEffect(target, player, player);
									})
									.forResultTargets();
								if (targets) {
									player.line(targets, 'green');
									await targets[0].damage('nocard');
								}
							},
							effect(player, target) {
								return get.damageEffect(target, player, player);
							},
						},
						{
							prompt: '令一名已受伤的角色回复1点体力',
							filter(player) {
								return game.hasPlayer(function (current) {
									return current.isDamaged();
								});
							},
							async content(event, trigger, player) {
								const targets = await player
									.chooseTarget(true, '令一名已受伤的角色回复1点体力', function (card, player, target) {
										return target.isDamaged();
									})
									.set('ai', function (target) {
										const player = _status.event.player;
										return get.recoverEffect(target, player, player);
									})
									.forResultTargets();
								if (targets) {
									player.line(targets, 'green');
									await targets[0].recover();
								}
							},
							effect(player, target) {
								if (target.isHealthy()) return false;
								return get.recoverEffect(target, player, player);
							},
						},
						{
							prompt: '弃置一名角色区域内的两张牌',
							filter(player) {
								return game.hasPlayer(function (current) {
									return current.countDiscardableCards(player, 'hej');
								});
							},
							async content(event, trigger, player) {
								const targets = await player
									.chooseTarget(true, '弃置一名角色区域内的两张牌', function (card, player, target) {
										return target.countDiscardableCards(player, 'hej') > 0;
									})
									.set('ai', function (target) {
										return -get.attitude(_status.event.player, target);
									})
									.forResultTargets();
								if (targets) {
									player.line(targets, 'green');
									await player.discardPlayerCard(targets[0], 'hej', true, 2);
								}
							},
							effect(player, target) {
								if (!target.countDiscardableCards(player, 'hej')) return false;
								return 2 * get.effect(target, { name: 'guohe' }, player, player);
							},
						},
						{
							prompt: '移动场上的一张牌',
							filter(player) {
								return player.canMoveCard();
							},
							async content(event, trigger, player) {
								await player.moveCard(true);
							},
							effect(player, target) {
								if (!target.countCards('ej')) return false;
								return player.canMoveCard(true) ? 20 * Math.random() : 0;
							},
						},
					],
					ai: {
						order: 10,
						result: { player: 1 },
						threaten: 3.2,
					},
				};
				lib.translate.yukito_kongwu_info = ui.joint`
					出牌阶段限一次，你可以执行其中一项：
						①令一名角色摸两张牌。
						②对一名角色造成1点伤害。
						③令一名已受伤的角色回复1点体力。
						④弃置一名角色区域内的两张牌。
						⑤移动场上的一张牌。
				`;
			}
			if (lib.skill.olshengong && game.aiyh_skillOptEnabled('olshengong', '跳过〖神工〗小游戏')) {
				lib.skill.olshengong.content = async function (event, trigger, player) {
					let subtype = get.subtype(event.cards[0]);
					if (subtype !== 'equip1' && subtype !== 'equip2') subtype = 'others';
					player.addTempSkill('olshengong_used', 'phaseUseAfter');
					player.markAuto('olshengong_used', subtype);
					let bool = get.isLuckyStar(player) || Math.random() < 0.64 ? 1 : 0;
					if (
						!game.hasPlayer((cur) => {
							return get.attitude(cur, player) < 0;
						})
					)
						bool = 2;
					player.popup(bool ? (bool > 1 ? '完美锻造' : '锻造成功') : '锻造失败', bool ? 'wood' : 'fire');
					const card_map = {
						equip1: [
							['diamond', 13, 'bintieshuangji'],
							['diamond', 1, 'wuxinghelingshan'],
							['spade', 13, 'wutiesuolian'],
							['diamond', 12, 'wushuangfangtianji'],
							['spade', 6, 'chixueqingfeng'],
							['spade', 5, 'guilongzhanyuedao'],
						],
						equip2: [
							['club', 1, 'huxinjing'],
							['club', 2, 'heiguangkai'],
							['spade', 2, 'linglongshimandai'],
							['club', 1, 'hongmianbaihuapao'],
							['spade', 2, 'qimenbagua'],
							['spade', 9, 'guofengyupao'],
						],
						others: [
							['diamond', 1, 'zhaogujing'],
							['spade', 5, 'sanlve'],
							['club', 12, 'tianjitu'],
							['spade', 2, 'taigongyinfu'],
							['diamond', 1, 'shufazijinguan'],
							['club', 4, 'xuwangzhimian'],
						],
					};
					if (!_status.olshengong_map) _status.olshengong_map = {};
					if (!_status.olshengong_maken) _status.olshengong_maken = {};
					let list = card_map[subtype];
					for (let i = 0; i < list.length; i++) {
						let name = list[i][2];
						if (!lib.card[name] || _status.olshengong_map[name]) {
							list.splice(i--, 1);
						}
					}
					if (!list.length) return;
					const result = await player
						.chooseButton(['请选择一种装备牌', [list.randomGets(bool + 1), 'vcard']], true)
						.set('ai', function (button) {
							return get.value({ name: button.link[2] }, player, 'raw');
						})
						.forResult();
					if (!result.bool) return;
					const name = result.links[0][2];
					let card;
					if (_status.olshengong_maken[name]) card = _status.olshengong_maken[name];
					else {
						card = game.createCard2(name, result.links[0][0], result.links[0][1]);
						_status.olshengong_maken[name] = card;
					}
					player.addSkill('olshengong_destroy');
					player.markAuto('olshengong_destroy', [card]);
					if (
						!game.hasPlayer(function (current) {
							return current.canEquip(card, true);
						})
					)
						return;
					const targets = await player
						.chooseTarget(true, '将' + get.translation(card) + '置于一名角色的装备区内', function (card, player, target) {
							return target.canEquip(_status.event.card, true);
						})
						.set('card', card)
						.set('ai', function (target) {
							var card = get.event().card,
								player = _status.event.player;
							return get.effect(target, card, player, player);
						})
						.forResultTargets();
					if (targets) {
						_status.olshengong_map[card.name] = true;
						const target = targets[0];
						player.line(target, 'green');
						target.$gain2(card);
						await game.delayx();
						await target.equip(card);
					}
				};
			}
		}
	});
}
