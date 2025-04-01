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
							'为适配最新版本，［载入本扩展配置］［编辑伪禁列表］［编辑武将权重］［编辑修改的技能威胁度］等功能于当前版本无法使用，请及时更新无名杀至1.10.6及以上或使用《AI优化》1.3.5.5版本'
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
				<center><font color=#00FFFF>更新日期</font>：
				<font color=#FFFF00>25</font>年<font color=#00FFB0>4</font>月<font color=fire>1</font>日</center>
			`,
				'◆移除胜负统计相关功能，但仍支持使用胜负统计记录作为内奸权重策略参考',
				'◆移除过时的云盘、网盘、公众号推荐',
				'◆修复［胜率代替权重］在内奸AI策略中不生效的问题',
				'◆格式化部分代码',
				'◆其他琐碎调整',
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
				if (lib.config.extension_AI优化_applyCf == 'pj') {
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
								else if (typeof info.ai.threaten == 'undefined') {
									if (info.ai.maixie_defend) lib.skill[skills[j]].ai.threaten = 0.8 * th;
									else lib.skill[skills[j]].ai.threaten = th;
								}
							}
						}
					}
				} else if (lib.config.extension_AI优化_applyCf == 'pz') {
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
						if (rarity == 'rare') all = 1.2;
						else if (rarity == 'epic') all = 1.8;
						else if (rarity == 'legend') all = 2.4;
						else if (rarity == 'junk') all = 0.8;
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
								else if (typeof info.ai.threaten == 'undefined') {
									if (info.ai.maixie_defend) lib.skill[skills[j]].ai.threaten = 0.8 * th;
									else lib.skill[skills[j]].ai.threaten = th;
								}
							}
						}
					}
				}
			}
			player.addSkill('aiyh_gjcx_qj');
			if (get.mode() == 'identity' && _status.mode != 'zhong' && _status.mode != 'purple') {
				//身份局ai
				if (game.players.length == 4 && lib.config.extension_AI优化_fixFour) {
					if (player.identity == 'zhu') {
						player.maxHp = player.maxHp + 1;
						player.hp = player.hp + 1;
					} else if (player.identity == 'zhong')
						game.broadcastAll(
							function (player, shown) {
								player.identity = 'fan';
								player.showIdentity();
								game.log(player, '是', '#g反贼');
							},
							player,
							player.identityShown
						);
					player.update();
				}
				if (player.identity == 'nei' && lib.config.extension_AI优化_sfjAi) {
					player.addSkill('gjcx_neiAi');
					player.addSkill('gjcx_neiAi_expose');
					player.addSkill('gjcx_neiAi_damage');
				}
				if (player === game.zhu && lib.config.extension_AI优化_sfjAi == 'gjcx') player.addSkill('gjcx_zhuAi');
			}
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (!lib.config.extension_AI优化_qzCf || get.itemtype(target) != 'player') return;
					let base1 = 1;
					if (typeof lib.aiyh.qz[target.name] === 'number') base1 = lib.aiyh.qz[target.name];
					else if (typeof lib.config.extension_AI优化_qz[target.name] == 'number')
						base1 = lib.config.extension_AI优化_qz[target.name];
					if (target.name2 === undefined) return base1;
					if (typeof lib.aiyh.qz[target.name2] === 'number') return base1 + lib.aiyh.qz[target.name2];
					if (typeof lib.config.extension_AI优化_qz[target.name2] == 'number')
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
						card.name != 'huogong' &&
						(!lib.config.extension_AI优化_ntAoe || (card.name != 'nanman' && card.name != 'wanjian')) &&
						get.attitude(player, target) > 0
					) {
						let num = 0;
						if (lib.config.extension_AI优化_nhFriends == 'ph') num = player.hp;
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
			return player == game.me;
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
					if (current.name != 'unknown' && !event.names.includes(current.name)) event.names.push(current.name);
					if (current.name2 != undefined && current.name2 != 'unknown' && !event.names.includes(current.name2))
						event.names.push(current.name2);
				});
			if (!event.names.length) event.goto(4);
			'step 1'
			event.name = event.names.splice(0, 1)[0];
			if (lib.config.extension_AI优化_qz[event.name] == undefined) event.qz = 1;
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
				.set('prompt', get.translation(event.name) + '的 权重：<font color=#FFFF00>' + event.qz + '</font>')
				.set('prompt2', '该值将作为内奸AI判断角色实力的首选')
				.set('ai', function () {
					return '暂不设置';
				});
			'step 3'
			if (result.control == '设置') {
				lib.config.extension_AI优化_qz[event.name] = event.qz;
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
				if (event.names.length) event.goto(1);
			} else if (result.control == '暂不设置') {
				delete lib.config.extension_AI优化_qz[event.name];
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
				if (event.names.length) event.goto(1);
			} else {
				if (result.control == '+1') event.qz++;
				else if (result.control == '+0.1') event.qz += 0.1;
				else if (result.control == '+0.01') event.qz += 0.01;
				else if (result.control == '-0.01') event.qz -= 0.01;
				else if (result.control == '-0.1') event.qz -= 0.1;
				else if (result.control == '-1') event.qz--;
				event.goto(2);
			}
			'step 4'
			if (lib.config.extension_AI优化_applyCf == 'sd') event.targets = game.filterPlayer2();
			else event.finish();
			'step 5'
			event.target = event.targets.splice(0, 1)[0];
			event.skills = event.target.getSkills(null, false, false).filter(function (i) {
				if (!lib.translate[i]) return false;
				let info = lib.skill[i];
				return !info || !info.ai || info.ai.threaten == 'undefined';
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
			if (event.target.tempSkills[event.skill]) str = '&nbsp&nbsp&nbsp<font color=#FF3300>这是一项临时技能</font>';
			if (lib.translate[event.skill + '_info']) str += '<br>' + lib.translate[event.skill + '_info'];
			else str += '<br>暂无技能描述';
			if (event.th > 1) con.push('-1');
			if (event.th > 0.1) con.push('-0.1');
			if (event.th > 0.01) con.push('-0.01');
			con.push('暂不处理');
			con.push('确认修改');
			player
				.chooseControl(con)
				.set(
					'prompt',
					'<font color=#00FFFF>' +
						get.translation(event.target) +
						'</font>的【<font color=#FFFF00>' +
						get.translation(event.skill) +
						'</font>】：当前为<font color=#00FFFF>' +
						event.th +
						'</font>'
				)
				.set('prompt2', str)
				.set('ai', function () {
					return '确认修改';
				});
			'step 8'
			if (result.control == '确认修改') {
				let s = lib.skill[event.skill];
				if (!s) s = { ai: { threaten: event.th } };
				else if (!s.ai) s.ai = { threaten: event.th };
				else s.ai.threaten = event.th;
				lib.config.extension_AI优化_cf[event.skill] = event.th;
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
				event.goto(6);
			} else if (result.control == '暂不处理') {
				delete lib.config.extension_AI优化_cf[event.skill];
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
				event.goto(6);
			} else {
				if (result.control == '+1') event.th++;
				else if (result.control == '+0.1') event.th += 0.1;
				else if (result.control == '+0.01') event.th += 0.01;
				else if (result.control == '-1') event.th--;
				else if (result.control == '-0.1') event.th -= 0.1;
				else if (result.control == '-0.01') event.th -= 0.01;
				event.goto(7);
			}
		},
	};
	lib.skill._aiyh_neiKey = {
		//内奸可亮明身份
		mode: ['identity'],
		enable: 'phaseUse',
		filter(event, player) {
			if (player.identity != 'nei' || player.storage.neiKey) return false;
			if (player.identityShown) return lib.config.extension_AI优化_neiKey == 'must';
			return lib.config.extension_AI优化_neiKey != 'off';
		},
		log: false,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			player.storage.neiKey = true;
			game.log(player, '亮明了身份');
			game.broadcastAll(function (player) {
				player.showIdentity();
			}, player);
			game.log(player, '的身份为', '#b内奸');
			player.gainMaxHp();
			player.removeSkill('gjcx_neiAi_expose');
			player.chooseBool('是否令你和' + get.translation(game.zhu) + '各回复1点体力？').ai = function () {
				return (
					game.zhu.isHealthy() ||
					!game.hasPlayer(function (current) {
						return current.identity == 'zhong' || current.identity == 'mingzhong';
					}) ||
					player.hp <= 2 ||
					game.zhu.hp <= 1
				);
			};
			'step 1'
			if (result.bool) {
				player.recover();
				game.zhu.recover();
			}
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					if (
						!game.hasPlayer(function (current) {
							return current.identity == 'zhong' || current.identity == 'mingzhong';
						}) ||
						(player.hp <= 1 && !player.countCards('hs', 'tao') && !player.countCards('hs', 'jiu'))
					)
						return 1;
					if (
						!game.hasPlayer(function (current) {
							return current.identity == 'fan';
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
			return player == game.me && lib.config.extension_AI优化_fixQz;
		},
		filterTarget(card, player, target) {
			return target.name != 'unknown' || (target.name2 != undefined && target.name2 != 'unknown');
		},
		prompt: '修改一名角色一张武将牌的权重',
		log: false,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			let trans = [];
			event.names = [];
			if (target.name != 'unknown') {
				trans.push(get.translation(target.name));
				event.names.push(target.name);
			}
			if (target.name2 != undefined && target.name2 != 'unknown') {
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
			if (lib.config.extension_AI优化_qz[event.name] == undefined) lib.config.extension_AI优化_qz[event.name] = 1;
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
				.set('prompt', get.translation(event.name) + '的 权重：<font color=#FFFF00>' + event.qz + '</font>')
				.set('prompt2', '武将ID：' + event.name + '<br>该值将作为内奸AI判断角色实力的首选')
				.set('ai', () => '确认修改');
			'step 3'
			if (result.control == '确认修改') {
				lib.config.extension_AI优化_qz[event.name] = event.qz;
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
			} else if (result.control == '删除此记录') {
				delete lib.config.extension_AI优化_qz[event.name];
				game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
			} else {
				if (result.control == '+1') event.qz++;
				else if (result.control == '+0.1') event.qz += 0.1;
				else if (result.control == '+0.01') event.qz += 0.01;
				else if (result.control == '-0.01') event.qz -= 0.01;
				else if (result.control == '-0.1') event.qz -= 0.1;
				else if (result.control == '-1') event.qz--;
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
			return player == game.me && lib.config.extension_AI优化_fixCf;
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
				else if (typeof info.ai.threaten == 'undefined') info.ai.threaten = 1;
				else if (typeof info.ai.threaten == 'number') th = info.ai.threaten;
				else th = '一个函数（不建议修改）';
				if (typeof th == 'number') event.ths.push(th);
				else event.ths.push(1);
				trans.push(
					'<font color=#00FF00>' + lib.translate[skills[i]] + '</font> | <font color=#FFFF00>' + skills[i] + '</font>：' + th
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
			if (event.target.tempSkills[event.skill]) str = '<font color=#FF3300>这是一项临时技能</font><br>';
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
						'）：当前为<font color=#00FFFF>' +
						event.th +
						'</font>'
				)
				.set('prompt2', str)
				.set('ai', function () {
					return '确认修改';
				});
			'step 3'
			if (result.control == '确认修改') {
				let s = lib.skill[event.skill];
				if (!s) s = { ai: { threaten: event.th } };
				else if (!s.ai) s.ai = { threaten: event.th };
				else s.ai.threaten = event.th;
				lib.config.extension_AI优化_cf[event.skill] = event.th;
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
			} else if (result.control == '删除此记录') {
				delete lib.config.extension_AI优化_cf[event.skill];
				game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
			} else {
				if (result.control == '+1') event.th++;
				else if (result.control == '+0.1') event.th += 0.1;
				else if (result.control == '+0.01') event.th += 0.01;
				else if (result.control == '-1') event.th--;
				else if (result.control == '-0.1') event.th -= 0.1;
				else if (result.control == '-0.01') event.th -= 0.01;
				event.goto(2);
			}
		},
		ai: {
			result: {
				target: 0,
			},
		},
	};
	lib.skill._aiyh_fake_prohibited = {
		//伪禁
		trigger: {
			global: 'gameStart',
			player: 'fixCharacterEnd',
		},
		filter(event, player) {
			return lib.config.extension_AI优化_Wj && player !== game.me;
		},
		silent: true,
		unique: true,
		priority: Infinity,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			if (!_status.aiyhlist) {
				let list = [];
				if (_status.connectMode) list = get.charactersOL();
				else
					for (let i in lib.character) {
						if (lib.filter.characterDisabled2(i) || lib.filter.characterDisabled(i)) continue;
						list.push(i);
					}
				game.countPlayer2(function (current) {
					list.remove(current.name);
					list.remove(current.name1);
					list.remove(current.name2);
				});
				_status.aiyhlist = list.removeArray(lib.config.extension_AI优化_wj);
			}
			if (typeof _status.doubleDraw !== 'function') _status.doubleDraw = lib.game.doubleDraw;
			event.num = -1;
			if (player.name1 != undefined) {
				if (lib.config.extension_AI优化_wj.includes(player.name1)) event.num = 0;
				else if (
					get.mode() == 'identity' &&
					(((player == game.zhu || player == game.rZhu || player == game.bZhu) &&
						lib.config.extension_AI优化_zhu.includes(player.name1)) ||
						(player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name1)) ||
						((player == game.zhong || player.identity == 'zhong') &&
							lib.config.extension_AI优化_zhong.includes(player.name1)) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name1)))
				)
					event.num = 0;
				else if (
					get.mode() == 'doudizhu' &&
					((player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name1)) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name1)))
				)
					event.num = 0;
			}
			if (event.num === -1 && player.name2 != undefined) {
				if (lib.config.extension_AI优化_wj.includes(player.name2)) event.num = 1;
				else if (
					get.mode() == 'identity' &&
					(((player == game.zhu || player == game.rZhu || player == game.bZhu) &&
						lib.config.extension_AI优化_zhu.includes(player.name2)) ||
						(player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name2)) ||
						((player == game.zhong || player.identity == 'zhong') &&
							lib.config.extension_AI优化_zhong.includes(player.name2)) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name2)))
				)
					event.num = 1;
				else if (
					get.mode() == 'doudizhu' &&
					((player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name2)) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name2)))
				)
					event.num = 1;
			}
			if (event.num < 0) event.finish();
			'step 1'
			let list = [],
				hx = 6,
				sd = _status.mode,
				id = player.identity,
				str;
			if (lib.config.extension_AI优化_wjs == 'same')
				switch (get.mode()) {
					case 'identity':
						if (sd == 'zhong') {
							if (id == 'fan' || id == 'zhong') hx = 6;
							else hx = 8;
						} else if (sd == 'purple') {
							if (id.indexOf('Zhu') == 1) hx = 4;
							else hx = 5;
						} else hx = get.config('choice_' + id);
						break;
					case 'versus':
						if (sd == 'two') hx = 7;
						else if (sd == 'guandu') hx = 4;
						else hx = 8;
						break;
					case 'doudizhu':
						if (sd == 'normal') hx = get.config('choice_' + id);
						else if (id == 'zhu') {
							if (sd == 'kaihei') hx = 5;
							else if (sd == 'huanle' || sd == 'binglin') hx = 7;
							else hx = 4;
						} else {
							if (sd == 'kaihei') hx = 3;
							else hx = 4;
						}
						break;
					default:
						if (typeof get.config('choice_' + id) == 'number') hx = get.config('choice_' + id);
				}
			else hx = parseInt(lib.config.extension_AI优化_wjs);
			_status.aiyhlist.randomSort();
			for (let i = 0; i < _status.aiyhlist.length; i++) {
				if (lib.config.extension_AI优化_wj.includes(_status.aiyhlist[i])) continue;
				if (
					get.mode() == 'identity' &&
					(((player == game.zhu || player == game.rZhu || player == game.bZhu) &&
						lib.config.extension_AI优化_zhu.includes(_status.aiyhlist[i])) ||
						(player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(_status.aiyhlist[i])) ||
						((player == game.zhong || player.identity == 'zhong') &&
							lib.config.extension_AI优化_zhong.includes(_status.aiyhlist[i])) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(_status.aiyhlist[i])))
				)
					continue;
				if (
					get.mode() == 'doudizhu' &&
					((player == game.zhu && lib.config.extension_AI优化_dizhu.includes(_status.aiyhlist[i])) ||
						(player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(_status.aiyhlist[i])))
				)
					continue;
				list.push(_status.aiyhlist[i]);
				if (list.length >= hx) break;
			}
			if (!list.length) {
				alert('没有可供候选的武将！');
				event.finish();
				return;
			}
			if (player.name2 == undefined) str = '武将';
			else if (event.num) str = '副将';
			else str = '主将';
			if (list.length == 1) event._result = { links: list };
			else
				player.chooseButton(true, ['请选择一张武将牌替换你的' + str, [list, 'character']]).ai = function (button) {
					return get.rank(button.link);
				};
			'step 2'
			let name = result.links[0],
				old = player.name1;
			if (!lib.character[name] || !lib.character[name][4] || !lib.character[name][4].includes('hiddenSkill'))
				player.showCharacter(event.num, false);
			_status.aiyhlist.remove(name);
			lib.game.doubleDraw = function () {};
			if (event.num) {
				old = player.name2;
				_status.aiyhlist.push(player.name2);
				player.hp += get.infoHp(lib.character[name][2]) - get.infoHp(lib.character[player.name2][2]);
				player.reinit(player.name2, name, true);
			} else {
				_status.aiyhlist.push(player.name1);
				player.hp += get.infoHp(lib.character[name][2]) - get.infoHp(lib.character[player.name1][2]);
				player.reinit(player.name1, name, true);
				player.changeGroup(lib.character[name][1], false);
			}
			lib.game.doubleDraw = _status.doubleDraw;
			'step 3'
			player.update();
			event.trigger('fixCharacterEnd');
		},
	};
	lib.skill._aiyh_fixWj = {
		//伪禁列表
		enable: 'phaseUse',
		filter(event, player) {
			return player == game.me && lib.config.extension_AI优化_fixWj;
		},
		filterTarget(card, player, target) {
			if (target.name.indexOf('unknown') == 0 && (target.name2 == undefined || target.name2.indexOf('unknown') == 0)) return false;
			return true;
		},
		selectTarget: [0, Infinity],
		multitarget: true,
		multiline: true,
		prompt: '若选择角色则对这些角色的武将牌进行加入/移出伪禁列表操作，否则从所有武将包选择进行操作',
		log: false,
		charlotte: true,
		superCharlotte: true,
		content() {
			'step 0'
			targets.sortBySeat();
			if (targets.length) {
				event.names = [];
				for (let i of targets) {
					if (i.name.indexOf('unknown')) event.names.push(i.name);
					if (i.name2 != undefined && i.name2.indexOf('unknown')) event.names.push(i.name2);
				}
				event.goto(2);
			} else {
				let ts = [];
				event.sorts = [];
				for (let i in lib.characterPack) {
					if (Object.prototype.toString.call(lib.characterPack[i]) === '[object Object]') {
						event.sorts.push(lib.characterPack[i]);
						ts.push([ts.length, lib.translate[i + '_character_config']]);
					}
				}
				if (ts.length)
					player
						.chooseButton(['请选择要移动的武将所在的武将包', [ts, 'textbutton']], true, [1, ts.length])
						.set('dialog', event.videoId)
						.set('ai', (button) => 0);
				else event.finish();
			}
			'step 1'
			if (result.links && result.links.length) {
				event.names = [];
				for (let num of result.links) {
					for (let i in event.sorts[num]) {
						event.names.push(i);
					}
				}
				if (!event.names.length) {
					alert('所选武将包不包含武将');
					event.finish();
				}
			} else event.finish();
			'step 2'
			event.jr = [];
			event.yc = [];
			for (let i of event.names) {
				if (lib.config.extension_AI优化_wj.includes(i)) event.yc.push(i);
				else event.jr.push(i);
			}
			if (event.jr.length)
				player.chooseButton(['请选择要加入伪禁列表的武将，直接点“确定”则全部加入', [event.jr, 'character']], [0, Infinity]).ai =
					function (button) {
						return 0;
					};
			else event.goto(4);
			'step 3'
			if (result.bool) {
				if (result.links && result.links.length) lib.config.extension_AI优化_wj.addArray(result.links);
				else lib.config.extension_AI优化_wj.addArray(event.jr);
				game.saveExtensionConfig('AI优化', 'wj', lib.config.extension_AI优化_wj);
			}
			'step 4'
			if (event.yc.length)
				player.chooseButton(['请选择要移出伪禁列表的武将，直接点“确定”则全部移出', [event.yc, 'character']], [0, Infinity]).ai =
					function (button) {
						return 0;
					};
			else event.finish();
			'step 5'
			if (result.bool) {
				if (result.links && result.links.length) lib.config.extension_AI优化_wj.removeArray(result.links);
				else lib.config.extension_AI优化_wj.removeArray(event.yc);
				game.saveExtensionConfig('AI优化', 'wj', lib.config.extension_AI优化_wj);
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
				player.identity == 'zhu' &&
				_status.mode == 'normal' &&
				lib.config.extension_AI优化_findZhong &&
				game.countPlayer(function (current) {
					return current.identity == 'zhong';
				})
			);
		},
		content() {
			let list = [];
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].identity == 'zhong') list.push(game.players[i]);
			}
			let target = list.randomGet();
			player.storage.dongcha = target;
			if (!_status.connectMode) {
				if (player == game.me) {
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
			return lib.config.extension_AI优化_mjAi && player.phaseNumber == 1 && (player == game.zhu || player.identity == 'zhong');
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
						if (name == 'huogong') return [1, player.countCards('h') / 200];
						if (name === 'sha' && !game.hasNature(card)) {
							if (
								(target.hasSkill('tengjia3') || target.hasSkill('rw_tengjia4')) &&
								!(player.getEquip('qinggang') || player.getEquip('zhuque'))
							)
								return 'zeroplayertarget';
						}
						if (
							name == 'sha' &&
							get.color(card) == 'black' &&
							(target.hasSkill('renwang_skill') || target.hasSkill('rw_renwang_skill'))
						) {
							if (!player.getEquip('qinggang')) return 'zeroplayertarget';
						}
						if (get.attitude(player, target) == 0) return [1, 0.005];
					}
					if (
						name == 'guohe' ||
						name == 'shunshou' ||
						name == 'lebu' ||
						name == 'bingliang' ||
						name == 'caomu' ||
						name == 'zhujinqiyuan' ||
						name == 'caochuanjiejian' ||
						name == 'toulianghuanzhu'
					) {
						if (get.attitude(player, target) == 0) return [1, 0.01];
					}
				},
			},
		},
	};
	lib.translate._aiyh_neiKey = '<font color=#8DD8FF>亮明身份</font>';
	lib.translate._aiyh_fixQz = '<font color=#FFFF00>修改权重</font>';
	lib.translate._aiyh_fixCf = '<font color=#FF3300>修改威胁度</font>';
	lib.translate._aiyh_fixWj = '<font color=#00FFFF>伪禁</font>';

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
						if (get.type(card) == 'equip')
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
					return current == game.zhu;
				});
				player.removeSkill('gjcx_zhuAi');
				target.addSkill('gjcx_zhuAi');
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (
							typeof card != 'object' ||
							player._aiyh_zhuAi_temp ||
							player.hasSkill('aiMangju') ||
							get.itemtype(target) != 'player'
						)
							return;
						player._aiyh_zhuAi_temp = true;
						let att = get.attitude(player, target),
							name = get.name(card, player);
						delete player._aiyh_zhuAi_temp;
						if (Math.abs(att) < 1 && player.needsToDiscard()) {
							if (
								(get.tag(card, 'damage') &&
									name != 'huogong' &&
									name != 'juedou' &&
									(target.hp > 1 || player.hasSkillTag('jueqing', false, target))) ||
								name == 'lebu' ||
								name == 'bingliang' ||
								name == 'fudichouxin'
							)
								return [1, 0.8];
						}
					},
					target(card, player, target) {
						if (typeof card != 'object' || target._zhuCx_temp || get.itemtype(player) != 'player') return 1;
						target._zhuCx_temp = true;
						let eff = get.effect(target, card, player, target);
						delete target._zhuCx_temp;
						if (!eff) return;
						if (get.tag(card, 'damage')) return [1, -Math.min(3, 0.8 * target.getDamagedHp()) - 0.6];
						if (get.name(card) == 'lebu' || get.name(card) == 'bingliang') return [1, -0.8];
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
			content() {
				'step 0'
				player.removeSkill('gjcx_neiJiang');
				player.removeSkill('gjcx_neiZhong');
				player.removeSkill('gjcx_neiFan');
				'step 1'
				if (player.identity != 'nei' || game.players.length <= 2) {
					player.removeSkill('gjcx_neiAi');
					player.removeSkill('gjcx_neiAi_damage');
					player.removeSkill('gjcx_neiAi_expose');
					event.finish();
				}
				if (
					trigger.name == 'die' &&
					!game.hasPlayer(function (current) {
						return current.identity == 'fan';
					})
				) {
					player.removeSkill('gjcx_neiAi_damage');
					player.addSkill('gjcx_neiAi_nojump');
					event.finish();
				}
				'step 2'
				let zs = game.filterPlayer(function (current) {
					return current.identity == 'zhu' || current.identity == 'zhong' || current.identity == 'mingzhong';
				});
				let fs = game.filterPlayer(function (current) {
					return current.identity == 'fan';
				});
				let all = 0,
					mine = 0;
				for (let i of game.players) {
					let sym,
						base1 = 1,
						base2 = 0,
						temp = 0;
					if (i == player || zs.includes(i)) sym = 1;
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
						else if (lib.config.extension_AI优化_ckQz === 'cf') base1 = get.threaten(i, player);
						else if (lib.config.extension_AI优化_ckQz === 'pj') {
							let rank = lib.rank;
							if (rank.bp.includes(i.name)) base1 = 1.4;
							else if (rank.am.includes(i.name)) base1 = 1.8;
							else if (rank.b.includes(i.name)) base1 = 1.2;
							else if (rank.a.includes(i.name)) base1 = 2.4;
							else if (rank.ap.includes(i.name)) base1 = 2.7;
							else if (rank.c.includes(i.name)) base1 = 0.8;
							else if (rank.s.includes(i.name)) base1 = 3.2;
							else if (rank.d.includes(i.name)) base1 = 0.6;
						} else if (lib.config.extension_AI优化_ckQz === 'pz') {
							let rank1 = game.getRarity(i.name);
							if (rank1 == 'rare') base1 = 1.1;
							else if (rank1 == 'epic') base1 = 1.57;
							else if (rank1 == 'legend') base1 = 1.95;
							else if (rank1 == 'junk') base1 = 0.8;
						}
						lib.aiyh.qz[i.name] = base1;
						if (i.name2 != undefined) {
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
							} else if (typeof lib.config.extension_AI优化_qz[i.name2] == 'number')
								base2 = lib.config.extension_AI优化_qz[i.name2];
							else if (lib.config.extension_AI优化_ckQz === 'pj') {
								let rank = lib.rank;
								if (rank.bp.includes(i.name2)) base2 = 1.4;
								else if (rank.am.includes(i.name2)) base2 = 1.8;
								else if (rank.b.includes(i.name2)) base2 = 1.2;
								else if (rank.a.includes(i.name2)) base2 = 2.4;
								else if (rank.ap.includes(i.name2)) base2 = 2.7;
								else if (rank.c.includes(i.name2)) base2 = 0.8;
								else if (rank.s.includes(i.name2)) base2 = 3.2;
								else if (rank.d.includes(i.name2)) base2 = 0.6;
							} else if (lib.config.extension_AI优化_ckQz === 'pz') {
								let rank2 = game.getRarity(i.name2);
								base2 = 1;
								if (rank2 == 'rare') base2 = 1.1;
								else if (rank2 == 'epic') base2 = 1.57;
								else if (rank2 == 'legend') base2 = 1.95;
								else if (rank2 == 'junk') base2 = 0.8;
							}
							lib.aiyh.qz[i.name2] = base2;
						}
						if (base2) base1 = (base1 + base2) / 2;
						if (i.isTurnedOver()) base1 -= 0.28;
						if (i.storage.gjcx_neiAi && i.storage.gjcx_neiAi != i.maxHp) {
							if (i.maxHp > i.storage.gjcx_neiAi) {
								if (i.hp > i.storage.gjcx_neiAi)
									temp += ((1 + (i.maxHp - i.storage.gjcx_neiAi) / 10) * base1 * i.hp) / i.maxHp;
								else temp += (base1 * i.hp) / i.storage.gjcx_neiAi;
							} else temp += (base1 * i.hp) / Math.min(5, i.storage.gjcx_neiAi);
						} else temp += (base1 * i.hp) / i.maxHp;
					}
					temp += (i.countCards('hes') - i.countCards('j') * 1.6) / 10;
					if (player == i) mine = temp * Math.sqrt(base1);
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
						return !player.identityShown && typeof player.ai.shown == 'number' && player.ai.shown;
					},
					silent: true,
					forced: true,
					unique: true,
					popup: false,
					charlotte: true,
					superCharlotte: true,
					content() {
						if (player.ai.shown >= 0.95 || get.attitude(game.zhu, player) < 0) player.removeSkill('gjcx_neiAi_expose');
						else if (trigger.card.name == 'tao') {
							for (let i of trigger.targets) {
								if (player == i) continue;
								if (get.attitude(game.zhu, i) > 0) player.ai.shown -= 0.5;
								else if (i.identity == 'fan') player.ai.shown = 0.99;
							}
						} else if (
							trigger.targets &&
							trigger.targets.length == 1 &&
							player != trigger.targets[0] &&
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
						if (typeof card != 'object' || player._aiyh_neiZhong_temp || get.itemtype(target) != 'player') return 1;
						player._aiyh_neiZhong_temp = true;
						let eff = get.effect(target, card, player, player),
							name = get.name(card, player);
						delete player._aiyh_neiZhong_temp;
						if (!eff) return;
						if ((get.tag(card, 'damage') && name != 'huogong') || name == 'lebu' || name == 'bingliang') {
							if (target.identity == 'zhu') return [1, -3];
							if (target.ai.shown < 0.95 && get.attitude(game.zhu, target) <= 0) {
								if (player.needsToDiscard()) return [1, 0.5];
								return [0, 0];
							}
							if (target.identity != 'fan') return [1, -2];
							return [1, 0.9];
						}
						if (name == 'tao') {
							if (
								target == player ||
								target == game.zhu ||
								(_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)
							)
								return 1;
							if (target.identity != 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 0.8];
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
						if (typeof card != 'object' || player._aiyh_neiFan_temp || get.itemtype(target) != 'player') return;
						player._aiyh_neiFan_temp = true;
						let eff = get.effect(target, card, player, player),
							name = get.name(card, player);
						delete player._aiyh_neiFan_temp;
						if (!eff) return;
						if ((get.tag(card, 'damage') && name != 'huogong') || name == 'lebu' || name == 'bingliang') {
							if (
								target.identity == 'zhu' &&
								(target.hp < 2 ||
									game.hasPlayer(function (current) {
										return current.identity == 'zhong' || current.identity == 'mingzhong';
									}))
							)
								return [1, -3];
							if (target.identity == 'fan') return [1, -2];
							if (target.ai.shown < 0.95) {
								if (player.needsToDiscard()) return [1, 0.5];
								return [0, 0];
							}
							return [1, 0.9];
						}
						if (name == 'tao') {
							if (
								target == player ||
								target == game.zhu ||
								(_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)
							)
								return;
							if (target.identity == 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 1.6];
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
						if (typeof card != 'object' || get.itemtype(target) != 'player') return;
						let name = get.name(card);
						if ((get.tag(card, 'damage') && name != 'huogong') || name == 'lebu' || name == 'bingliang') {
							if (target.identity == 'zhu') return [1, -3];
							if (!player.needsToDiscard()) return [0, 0];
							return [1, -0.5];
						}
						if (name == 'tao') {
							if (target == player && game.zhu.hp > 2) return [1, 0.9];
							if (target == player || target == game.zhu) return;
							return [1, -2];
						}
						if (name == 'jiu' && player.hp > 0) return [0, 0];
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
						if (typeof card != 'object' || get.itemtype(target) != 'player' || target.ai.shown < 0.95 || player == target)
							return 1;
						if (
							target.identity == 'nei' &&
							!player.getFriends().length &&
							(player.identity == 'fan' || player == game.zhu) &&
							game.countPlayer(function (current) {
								let num = 1;
								if (typeof lib.aiyh.qz[current.name] === 'number') num = lib.aiyh.qz[current.name];
								else if (typeof lib.config.extension_AI优化_qz[current.name] == 'number')
									num = lib.config.extension_AI优化_qz[current.name];
								if (current.name2 !== undefined) {
									if (typeof lib.aiyh.qz[current.name2] === 'number') num = (num + lib.aiyh.qz[current.name2]) / 2;
									else if (typeof lib.config.extension_AI优化_qz[current.name2] == 'number')
										num = (num + lib.config.extension_AI优化_qz[current.name2]) / 2;
								}
								if (current.isTurnedOver()) num -= 0.28;
								if (current.storage.gjcx_neiAi && current.storage.gjcx_neiAi != current.maxHp) {
									if (current.maxHp > current.storage.gjcx_neiAi) {
										if (current.hp > current.storage.gjcx_neiAi)
											num *= ((1 + (current.maxHp - current.storage.gjcx_neiAi) / 10) * current.hp) / current.maxHp;
										else num *= current.hp / current.storage.gjcx_neiAi;
									} else num *= current.hp / Math.min(5, current.storage.gjcx_neiAi);
								} else num *= current.hp / current.maxHp;
								num += current.countCards('hes') * 0.1 - current.countCards('j') * 0.16;
								if (current == player) return -2 * num;
								if (current.identity == 'nei') return -num;
								return num;
							}) > 0
						) {
							if (get.tag(card, 'damage')) return [1, -2];
							if (get.name(card) == 'tao' && player.hp > 1 && player.countCards('hs', 'tao') + target.hp > 0) return [1, 2];
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
		//选项显示摘自@Aurora『战斗记录』
		lib.extensionMenu.extension_AI优化.chooseQz.name =
			'请选择要删除的武将权重<br><select id="AI优化_chooseQz" size="1" style="width:180px">' + qz + '</select>';
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
			cf +=
				'<option value=' +
				i +
				'>' +
				i +
				' | ' +
				(lib.translate[i] || '无') +
				'：' +
				lib.config.extension_AI优化_cf[i] +
				'</option>';
		}
		lib.extensionMenu.extension_AI优化.chooseCf.name =
			'<span style="font-family: xinwei">请选择要删除的技能威胁度</span><br><select id="AI优化_chooseCf" size="1" style="width:180px">' +
			cf +
			'</select>';
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
						player
							.chooseControl(list)
							.set(
								'prompt',
								'冲虚：修改技能' +
									(event.score == 5 ? '并摸一张牌' : '') +
									'；或摸' +
									Math.floor(event.score / 2) +
									'张牌'
							);
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
							if (
								game.hasPlayer(function (current) {
									return current.isDamaged() && current.hp < 3 && get.attitude(player, current) > 1;
								})
							)
								return 1 + Math.random();
							return 1;
						} else if (button.link.name == 'wolong_card') {
							if (
								game.hasPlayer(function (current) {
									return get.damageEffect(current, player, player, 'fire') > 0;
								})
							)
								return 1.2 + Math.random();
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
							player: player,
						});
					} else {
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
					} else if (rand > 0.36) event.num = 2;
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
					game.log(player, '御风飞行', event.result ? '#g成功' : '#g失败');
					player.popup(get.cnNumber(event.num) + '分');
					game.log(player, '获得了', '#y' + event.num + '分');
					if (event.result)
						player
							.chooseTarget('请选择【御风】的目标', [1, event.num], (card, player, target) => {
								return target != player && !target.hasSkill('yufeng2');
							})
							.set('ai', (target) => {
								let player = _status.event.player,
									att = -get.attitude(player, target),
									attx = att * 2;
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
					} else player.draw(event.num);
				};
				delete lib.skill.yufeng.usable;
				lib.skill.yufeng.ai = {
					order() {
						if (game.hasPlayer((current) => get.attitude(_status.event.player, current) === 0)) return 2;
						return 10;
					},
					result: { player: 1 },
				};
			}
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
					} else {
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
			}
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
					player
						.chooseButton(['巧思：请选择你想获得的牌（至多五张）', vcards], true, [1, 5])
						.set('filterButton', (button) => {
							let sj = 0,
								st = 0,
								jn = 0,
								zb = 0,
								name;
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
						})
						.set('ai', (button) => {
							if (button.link[2] === 'trick') return 5.37;
							if (button.link[2] === 'equip') return 3.4;
							//let val=0,num=0;for(let i of ui.cardPile.childNodes){if(get.type(i,'trick')===button.link[2]){val+=get.value(i,_status.event.player);num++;}}return val/num;
							return get.value(button, _status.event.player);
						});
					'step 1'
					if (result.bool) {
						let cards = [],
							rand = Math.random(),
							num;
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
							player
								.chooseControl()
								.set('choiceList', [
									'将' + get.cnNumber(event.num) + '张牌交给一名其他角色',
									'弃置' + get.cnNumber(event.num) + '张牌',
								])
								.set('ai', function () {
									if (
										game.hasPlayer(function (current) {
											return current != player && get.attitude(player, current) > 1;
										})
									)
										return 0;
									return 1;
								});
						} else {
							if (num) player.chat('无牌可得吗？');
							else player.popup('杯具');
							event.finish();
						}
					} else event.finish();
					'step 2'
					if (result.index == 0)
						player.chooseCardTarget({
							position: 'he',
							filterCard: true,
							selectCard: event.num,
							filterTarget(card, player, target) {
								return player != target;
							},
							ai1(card) {
								return -get.value(card, player);
							},
							ai2(target) {
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
	});
}
