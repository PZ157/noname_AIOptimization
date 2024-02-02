game.import('extension', function (lib, game, ui, get, ai, _status) {
	return {
		name: "AI优化",
		editable: false,
		content: function (config, pack) {
			//非常感谢@柚子丶奶茶丶猫以及面具 提供的《云将》相关部分AI优化的修复代码

			/*全局技*/
			lib.skill._aiyh_firstKs = {
				trigger: { global: 'gameStart' },
				silent: true,
				unique: true,
				firstDo: true,
				charlotte: true,
				superCharlotte: true,
				content: function () {
					if (!_status.aiyh_firstDo) {
						_status.aiyh_firstDo = true;
						for (let i in lib.config.extension_AI优化_cf) {//修改技能威胁度
							if (!lib.skill[i]) lib.skill[i] = { ai: { threaten: lib.config.extension_AI优化_cf[i] } };
							else if (!lib.skill[i].ai) lib.skill[i].ai = { threaten: lib.config.extension_AI优化_cf[i] };
							else lib.skill[i].ai.threaten = lib.config.extension_AI优化_cf[i];
						}
						if (lib.config.extension_AI优化_applyCf == 'pj') {//威胁度补充
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
								else if (rarity == 'epic') all = 2;
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
						game.countPlayer2(current=>{
							current.storage.sftj={
								cg1:current.name1,
								cg2:current.name2
							};
						});
						if(lib.config.extension_AI优化_apart) get.sfInit();
					}
					player.addSkill('aiyh_gjcx_qj');
					if (get.mode() == 'identity' && _status.mode != 'zhong' && _status.mode != 'purple') {//身份局ai
						if (game.players.length == 4 && lib.config.extension_AI优化_fixFour) {
							if (player.identity == 'zhu') {
								player.maxHp = player.maxHp + 1;
								player.hp = player.hp + 1;
							} else if (player.identity == 'zhong') game.broadcastAll(function (player, shown) {
								player.identity = 'fan';
								player.showIdentity();
								game.log(player, '是', '#g反贼');
							}, player, player.identityShown);
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
						target: function (card, player, target) {
							if (!lib.config.extension_AI优化_qzCf || get.itemtype(target) != 'player') return;
							let base1 = 1;
							if (typeof lib.config.extension_AI优化_qz[target.name] == 'number') base1 = lib.config.extension_AI优化_qz[target.name];
							if (target.name2 != undefined && typeof lib.config.extension_AI优化_qz[target.name2] == 'number') return base1 + lib.config.extension_AI优化_qz[target.name2];
							return base1;
						}
					}
				}
			};
			lib.skill.aiyh_gjcx_qj = {
				mod: {
					aiOrder: (player, card, num) => {
						if (!player._aiyh_order_temp && num > 0 && get.itemtype(card) === 'card' && get.position(card) !== 'e') {
							if (get.type(card) === 'equip') {
								for (let i of get.subtypes(card)) {
									if (!player.hasEnabledSlot(i)) return num;
								}
								player._aiyh_order_temp = true;
								let sub = get.subtype(card), dis = player.needsToDiscard(), equipValue = get.equipValue(card, player);
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
							if (get.type(card) == 'equip') for (let i of get.subtypes(card)) {
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
							if (get.type(card) === 'equip') for (let i of get.subtypes(card)) {
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
					}
				},
				charlotte: true,
				superCharlotte: true
			};

			/*功能*/
			lib.skill._aiyh_nhFriends = {//AI不砍队友
				silent: true,
				unique: true,
				charlotte: true,
				superCharlotte: true,
				ai: {
					effect: {
						player: function (card, player, target) {
							if (lib.config.extension_AI优化_nhFriends === 'off' || player._nhFriends_temp || get.itemtype(target) !== 'player' || player === game.me) return;
							if (get.tag(card, 'damage') && card.name != 'huogong' && (!lib.config.extension_AI优化_ntAoe || card.name != 'nanman' && card.name != 'wanjian') && get.attitude(player, target) > 0) {
								let num = 0;
								if (lib.config.extension_AI优化_nhFriends == 'ph') num = player.hp;
								else num = parseInt(lib.config.extension_AI优化_nhFriends);
								if (target.hp > num) return;
								player._nhFriends_temp = true;
								let eff = get.effect(target, card, player, player);
								delete player._nhFriends_temp;
								if (eff > 0) return [1, 0, 1, -1 - eff];
							}
						}
					}
				}
			};
			lib.skill._aiyh_meks = {//开局功能
				trigger: {
					global: ['gameStart', 'showCharacterEnd']
				},
				filter: function (event, player) {
					return player == game.me;
				},
				silent: true,
				unique: true,
				priority: 157,
				charlotte: true,
				superCharlotte: true,
				content: function () {
					'step 0'
					event.names = [];
					if (lib.config.extension_AI优化_applyQz) game.countPlayer2(function (current) {
						if (current.name != 'unknown' && !event.names.includes(current.name)) event.names.push(current.name);
						if (current.name2 != undefined && current.name2 != 'unknown' && !event.names.includes(current.name2)) event.names.push(current.name2);
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
					player.chooseControl(list).set('prompt', get.translation(event.name) + '的 权重：<font color=#FFFF00>' + event.qz + '</font>')
					.set('prompt2', '该值将作为内奸AI判断角色实力的首选').set('ai', function () {
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
					player.chooseControl(con).set('prompt', '<font color=#00FFFF>' + get.translation(event.target) + '</font>的【<font color=#FFFF00>' + get.translation(event.skill) + '</font>】：当前为<font color=#00FFFF>' + event.th + '</font>')
					.set('prompt2', str).set('ai', function () {
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
				}
			};
			lib.skill._aiyh_neiKey = {//内奸可亮明身份
				mode: ['identity'],
				enable: 'phaseUse',
				filter: function (event, player) {
					if (player.identity != 'nei' || player.storage.neiKey) return false;
					if (player.identityShown) return lib.config.extension_AI优化_neiKey == 'must';
					return lib.config.extension_AI优化_neiKey != 'off';
				},
				log: false,
				unique: true,
				charlotte: true,
				superCharlotte: true,
				content: function () {
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
						player: function (player) {
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
								if (get.attitude(game.zhu, player) < -1 || (get.attitude(game.zhu, player) < 0 && player.ai.shown >= 0.95)) return 1;
								return -3;
							}
							if (!player.hasSkill('gjcx_neiZhong') && !player.hasSkill('gjcx_neiJiang') && (player.hp <= 2 && game.zhu.hp <= 2 || game.zhu.isHealthy() && lib.config.extension_AI优化_sfjAi)
							|| game.zhu.hp <= 1 && !player.countCards('hs', 'tao') && (player.hasSkill('gjcx_neiZhong') || !lib.config.extension_AI优化_sfjAi)) return 1;
							return -3;
						}
					}
				}
			};
			lib.skill._aiyh_fixQz = {//武将权重
				enable: 'phaseUse',
				filter: function (event, player) {
					return player == game.me && lib.config.extension_AI优化_fixQz;
				},
				filterTarget: function (card, player, target) {
					return target.name != 'unknown' || (target.name2 != undefined && target.name2 != 'unknown');
				},
				prompt: '修改一名角色一张武将牌的权重',
				log: false,
				charlotte: true,
				superCharlotte: true,
				content: function () {
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
						player.chooseControl(names).set('prompt', '请选择要修改权重的武将').set('ai', function () {
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
					player.chooseControl(list).set('prompt', get.translation(event.name) + '的 权重：<font color=#FFFF00>' + event.qz + '</font>').set('prompt2', '武将ID：' + event.name + '<br>该值将作为内奸AI判断角色实力的首选').set('ai', () => '确认修改');
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
						target: 0
					}
				}
			};
			lib.skill._aiyh_fixCf = {//技能威胁度
				enable: 'phaseUse',
				filter: function (event, player) {
					return player == game.me && lib.config.extension_AI优化_fixCf;
				},
				filterTarget: true,
				prompt: '修改一名角色当前拥有的一项技能的威胁度',
				log: false,
				charlotte: true,
				superCharlotte: true,
				content: function () {
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
						trans.push('<font color=#00FF00>' + lib.translate[skills[i]] + '</font> | <font color=#FFFF00>' + skills[i] + '</font>：' + th);
					}
					if (trans.length > 1)
						player.chooseControl().set('choiceList', trans).set('prompt', '请选择要修改威胁度的技能').set('ai', function () {
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
					player.chooseControl(list).set('prompt', get.translation(event.skill) + '（' + get.translation(target) + '）：当前为<font color=#00FFFF>' + event.th + '</font>').set('prompt2', str).set('ai', function () {
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
						target: 0
					}
				}
			};
			lib.skill._aiyh_fake_prohibited = {//伪禁
				trigger: {
					global: 'gameStart',
					player: 'fixCharacterEnd'
				},
				filter: function (event, player) {
					return lib.config.extension_AI优化_Wj && player !== game.me;
				},
				silent: true,
				unique: true,
				priority: Infinity,
				charlotte: true,
				superCharlotte: true,
				content: function () {
					'step 0'
					if (!_status.aiyhlist) {
						let list = [];
						if (_status.connectMode) list = get.charactersOL();
						else for (let i in lib.character) {
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
						else if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(player.name1)
						|| player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name1)
						|| (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(player.name1)
						|| player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name1))) event.num = 0;
						else if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name1)
						|| player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name1))) event.num = 0;
					}
					if (event.num === -1 && player.name2 != undefined) {
						if (lib.config.extension_AI优化_wj.includes(player.name2)) event.num = 1;
						else if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(player.name2)
						|| player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name2)
						|| (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(player.name2)
						|| player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name2))) event.num = 1;
						else if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name2)
						|| player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name2))) event.num = 1;
					}
					if (event.num < 0) event.finish();
					'step 1'
					let list = [],
						hx = 6,
						sd = _status.mode,
						id = player.identity,
						str;
					if (lib.config.extension_AI优化_wjs == 'same') switch (get.mode()) {
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
						if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(_status.aiyhlist[i])
						|| player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(_status.aiyhlist[i])
						|| (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(_status.aiyhlist[i])
						|| player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(_status.aiyhlist[i]))) continue;
						if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(_status.aiyhlist[i])
						|| player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(_status.aiyhlist[i]))) continue;
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
					else player.chooseButton(true, ['请选择一张武将牌替换你的' + str, [list, 'character']]).ai = function (button) {
						return get.rank(button.link);
					};
					'step 2'
					let name = result.links[0], old = player.name1;
					if (!lib.character[name] || !lib.character[name][4] || !lib.character[name][4].includes('hiddenSkill')) player.showCharacter(event.num, false);
					_status.aiyhlist.remove(name);
					lib.game.doubleDraw = function () { };
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
				}
			};
			lib.skill._aiyh_fixWj = {//伪禁列表
				enable: 'phaseUse',
				filter: function (event, player) {
					return player == game.me && lib.config.extension_AI优化_fixWj;
				},
				filterTarget: function (card, player, target) {
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
				content: function () {
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
								ts.push(lib.translate[i + '_character_config']);
							}
						}
						if (!ts.length) event.finish();
						else {
							event.videoId = lib.status.videoId++;
							let func = function (player, list, id) {
								let choiceList = ui.create.dialog('请选择要移动的武将所在的武将包');
								choiceList.videoId = id;
								for (let i = 0; i < list.length; i++) {
									let str = '<div class="popup text" style="width:calc(100% - 10px);display:inline-block">' + list[i] + '</div>';
									let next = choiceList.add(str);
									next.firstChild.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', ui.click.button);
									next.firstChild.link = i;
									for (let j in lib.element.button) {
										next[j] = lib.element.button[j];
									}
									choiceList.buttons.add(next.firstChild);
								}
								return choiceList;
							};
							if (game.me.isOnline2()) game.me.send(func, game.me, ts, event.videoId);
							event.dialog = func(game.me, ts, event.videoId);
							if (_status.auto) event.dialog.style.display = 'none';
							let next = game.me.chooseButton();
							next.set('dialog', event.videoId);
							next.set('forced', true);
							next.set('ai', function (button) {
								return 1;
							});
							next.set('selectButton', [0, ts.length]);
						}
					}
					'step 1'
					if (game.me.isOnline2()) game.me.send('closeDialog', event.videoId);
					event.dialog.close();
					if (result.links && result.links.length) {
						let nums = result.links.sort();
						event.names = [];
						for (let num of nums) {
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
					if (event.jr.length) player.chooseButton(['请选择要加入伪禁列表的武将，直接点“确定”则全部加入', [event.jr, 'character']], [0, Infinity]).ai = function (button) {
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
					if (event.yc.length) player.chooseButton(['请选择要移出伪禁列表的武将，直接点“确定”则全部移出', [event.yc, 'character']], [0, Infinity]).ai = function (button) {
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
						target: 0
					}
				}
			};
			lib.skill._findZhong = {//慧眼识忠
				trigger: {
					global: 'gameStart'
				},
				unique: true,
				silent: true,
				charlotte: true,
				superCharlotte: true,
				mode: ['identity'],
				filter: function (event, player) {
					return player.identity == 'zhu' && _status.mode == 'normal' && lib.config.extension_AI优化_findZhong && game.countPlayer(function (current) {
						return current.identity == 'zhong';
					});
				},
				content: function () {
					var list = [];
					for (var i = 0; i < game.players.length; i++) {
						if (game.players[i].identity == 'zhong') list.push(game.players[i]);
					}
					var target = list.randomGet();
					player.storage.dongcha = target;
					if (!_status.connectMode) {
						if (player == game.me) {
							target.setIdentity('zhong');
							target.node.identity.classList.remove('guessing');
							target.zhongfixed = true;
						}
					} else player.chooseControl('ok').set('dialog', [get.translation(target) + '是忠臣', [[target.name], 'character']]);
				}
			};
			lib.skill._mjAiSkill = {//盲狙AI
				trigger: { player: 'phaseZhunbeiBegin' },
				filter: function (event, player) {
					return lib.config.extension_AI优化_mjAi && player.phaseNumber == 1 && (player == game.zhu || player.identity == 'zhong');
				},
				silent: true,
				unique: true,
				charlotte: true,
				superCharlotte: true,
				mode: ['identity'],
				content: function () {
					player.addTempSkill('aiMangju');
				}
			};
			lib.skill.aiMangju = {//盲狙
				forced: true,
				unique: true,
				popup: false,
				silent: true,
				charlotte: true,
				superCharlotte: true,
				mode: ['identity'],
				ai: {
					effect: {
						player: function (card, player, target, current) {
							let name = get.name(card, player);
							if (get.tag(card, 'damage') && Math.abs(get.attitude(player, target)) < 0.5) {
								if (name === 'juedou') return [0.5, player.countCards('hs', 'sha') - target.countCards('h') / 4];
								if (name == 'huogong') return [0.5, player.countCards('h') / 2 - 1];
								if (name === 'sha' && !game.hasNature(card)) {
									if ((target.hasSkill('tengjia3') || target.hasSkill('rw_tengjia4')) && !(player.getEquip('qinggang') || player.getEquip('zhuque'))) return 'zeroplayertarget';
								}
								if (name == 'sha' && get.color(card) == 'black' && (target.hasSkill('renwang_skill') || target.hasSkill('rw_renwang_skill'))) {
									if (!player.getEquip('qinggang')) return 'zeroplayertarget';
								}
								if (get.attitude(player, target) == 0) return [0.5, 0.5];
							}
							if (name == 'guohe' || name == 'shunshou' || name == 'lebu' || name == 'bingliang' || name == 'caomu' || name == 'zhujinqiyuan' || name == 'caochuanjiejian' || name == 'toulianghuanzhu') {
								if (get.attitude(player, target) == 0) return [0.5, 0.7];
							}
						}
					}
				}
			};
			lib.skill._sftj_operateJl={//胜负记录操作
				enable:'phaseUse',
				filter:function(event,player){
					return player==game.me&&lib.config.extension_AI优化_operateJl;
				},
				filterTarget:function(card,player,target){
					if(target.name.indexOf('unknown')==0&&(target.name2==undefined||target.name2.indexOf('unknown')==0)) return false;
					return true;
				},
				selectTarget:[0,Infinity],
				multitarget:true,
				multiline:true,
				prompt:'若选择角色则对这些角色的武将牌当前游戏模式的胜负记录进行操作，否则从所有武将包选择进行操作',
				log:false,
				charlotte:true,
				superCharlotte:true,
				content:function(){
					'step 0'
					targets.sortBySeat();
					if(targets.length){
						event.names=[];
						for(let i of targets){
							if(i.name.indexOf('unknown')) event.names.push(i.name);
							if(i.name2!=undefined&&i.name2.indexOf('unknown')) event.names.push(i.name2);
						}
						event.goto(4);
					}
					else{
						let ts=[];
						event.sorts=[];
						for(let i in lib.characterPack){
							if(Object.prototype.toString.call(lib.characterPack[i])==='[object Object]'){
								event.sorts.push(lib.characterPack[i]);
								ts.push(lib.translate[i+'_character_config']);
							}
						}
						if(!ts.length) event.finish();
						else{
							event.videoId=lib.status.videoId++;
							let func=function(player,list,id){
								let choiceList=ui.create.dialog('请选择要做记录操作的武将所在的武将包');
								choiceList.videoId=id;
								for(let i=0;i<list.length;i++){
									let str='<div class="popup text" style="width:calc(100% - 10px);display:inline-block">'+list[i]+'</div>';
									let next=choiceList.add(str);
									next.firstChild.addEventListener(lib.config.touchscreen?'touchend':'click',ui.click.button);
									next.firstChild.link=i;
									for(let j in lib.element.button){
										next[j]=lib.element.button[j];
									}
									choiceList.buttons.add(next.firstChild);
								}
								return choiceList;
							};
							if(game.me.isOnline2()) game.me.send(func,game.me,ts,event.videoId);
							event.dialog=func(game.me,ts,event.videoId);
							if(_status.auto) event.dialog.style.display='none';
							let next=game.me.chooseButton();
							next.set('dialog',event.videoId);
							next.set('forced',true);
							next.set('ai',function(button){
								return 1;
							});
							next.set('selectButton',[0,ts.length]);
						}
					}
					'step 1'
					if(game.me.isOnline2()) game.me.send('closeDialog',event.videoId);
					event.dialog.close();
					if(result.links&&result.links.length){
						let nums=result.links.sort();
						event.names=[];
						for(let num of nums){
							for(let i in event.sorts[num]){
								event.names.push(i);
							}
						}
						if(!event.names.length){
							alert('所选武将包不包含武将');
							event.finish();
						}
					}
					else event.finish();
					'step 2'
					player.chooseButton(['请选择要对当前游戏模式胜负记录进行操作的武将',[event.names,'character']],[1,Infinity]).ai=function(button){
						return 0;
					};
					'step 3'
					if(result.bool&&result.links) event.names=result.links;
					else event.finish();
					'step 4'
					player.chooseControl(['修改','删除','取消']).set('prompt','请选择要对所选武将当前游戏模式胜负记录进行的操作').set('ai',function(){
						return '取消';
					});
					'step 5'
					if(result.control=='取消') event.finish();
					else if(result.control=='删除'){
						let mode=get.statusModeInfo(true),cgn=get.sfConfigName(),num=0;
						if(cgn.length>1){
							for(let i of cgn){
								if(confirm('您确定要删除这'+event.names.length+'个武将'+mode+get.identityInfo(i)+'胜负记录吗？')){
									for(let name of event.names){
										if(lib.config[i][name]){
											delete lib.config[i][name];
											num++;
										}
									}
									game.saveConfig(i,lib.config[i]);
								}
							}
							if(num) alert('成功清除'+num+'条胜负记录');
						}
						else if(confirm('您确定要删除这'+event.names.length+'个武将'+lib.translate[get.mode()]+'模式'+mode+'胜负记录吗？')){
							for(let name of event.names){
								if(lib.config[i][name]){
									delete lib.config[cgn[0]][name];
									num++;
								}
							}
							game.saveConfig(cgn[0],{});
							if(num) alert('成功清除'+num+'条胜负记录');
						}
						event.finish();
					}
					else event.cgns=get.sfConfigName();
					'step 6'
					if(event.cgns.length>1){
						let trans=[];
						for(let i=0;i<event.cgns.length;i++){
							trans.push(get.identityInfo(event.cgns[i]));
						}
						trans.push('取消');
						player.chooseControl(trans).set('prompt','请选择要修改的胜负记录类型').set('ai',function(){
							return '取消';
						});
					}
					else if(!event.cgns.length) event.finish();
					else event._result={index:0,control:get.identityInfo(event.cgns[0])};
					'step 7'
					if(result.control=='取消') event.finish();
					else{
						event.cgn=event.cgns[result.index];
						event.num=0;
					}
					'step 8'
					if(!lib.config[event.cgn][event.names[event.num]]) lib.config[event.cgn][event.names[event.num]]={win:0,lose:0};
					event.prese=lib.config[event.cgn][event.names[event.num]].win;
					'step 9'
					let as=['+10'],sm=get.statusModeInfo(true);
					if(event.prese>=10) as.push('-10');
					as.push('+1');
					if(event.prese) as.push('-1');
					as.push('确定修改');
					as.push('不修改');
					player.chooseControl(as).set('prompt','获胜场数：<font color=#00FFFF>'+event.prese+'</font>').set('prompt2','<center>修改<font color=#FFFF00>'+lib.translate[event.names[event.num]]+'</font>'+sm+'<font color=#00FF00>'+get.identityInfo(event.cgn)+'</font>获胜场数记录</center><br><center>原获胜场数：<font color=#FF3300>'+lib.config[event.cgn][event.names[event.num]].win+'</font></center>').set('ai',function(){
						return '不修改';
					});
					'step 10'
					if(result.control=='确定修改'){
						lib.config[event.cgn][event.names[event.num]].win=event.prese;
						game.saveConfig(event.cgn,lib.config[event.cgn]);
					}
					else if(result.control=='不修改'){
						if(lib.config[event.cgn][event.names[event.num]].win+lib.config[event.cgn][event.names[event.num]].lose==0) delete lib.config[event.cgn][event.names[event.num]];
					}
					else{
						if(result.control=='+1') event.prese++;
						else if(result.control=='-1') event.prese--;
						else if(result.control=='+10') event.prese+=10;
						else if(result.control=='-10') event.prese-=10;
						event.goto(9);
					}
					'step 11'
					if(!lib.config[event.cgn][event.names[event.num]]) lib.config[event.cgn][event.names[event.num]]={win:0,lose:0};
					event.prese=lib.config[event.cgn][event.names[event.num]].lose;
					'step 12'
					let bs=['+10'],sd=get.statusModeInfo(true);
					if(event.prese>=10) bs.push('-10');
					bs.push('+1');
					if(event.prese) bs.push('-1');
					bs.push('确定修改');
					bs.push('不修改');
					player.chooseControl(bs).set('prompt','失败场数：<font color=#FF3300>'+event.prese+'</font>').set('prompt2','<center>修改<font color=#FFFF00>'+lib.translate[event.names[event.num]]+'</font>'+sd+'<font color=#00FF00>'+get.identityInfo(event.cgn)+'</font>失败场数记录</center><br><center>原失败场数：<font color=#00FFFF>'+lib.config[event.cgn][event.names[event.num]].lose+'</font></center>').set('ai',function(){
						return '不修改';
					});
					'step 13'
					if(result.control=='确定修改'){
						lib.config[event.cgn][event.names[event.num]].lose=event.prese;
						game.saveConfig(event.cgn,lib.config[event.cgn]);
					}
					else if(result.control=='不修改'){
						if(lib.config[event.cgn][event.names[event.num]].win+lib.config[event.cgn][event.names[event.num]].lose==0) delete lib.config[event.cgn][event.names[event.num]];
					}
					else{
						if(result.control=='+1') event.prese++;
						else if(result.control=='-1') event.prese--;
						else if(result.control=='+10') event.prese+=10;
						else if(result.control=='-10') event.prese-=10;
						event.goto(12);
					}
					'step 14'
					event.num++;
					if(event.num<event.names.length) event.goto(8);
					'step 15'
					event.cgns.remove(event.cgn);
					if(event.cgns.length) event.goto(6);
				},
				ai:{
					result:{
						target:0
					}
				}
			};
			lib.translate._aiyh_neiKey = '<font color=#8DD8FF>亮明身份</font>';
			lib.translate._aiyh_fixQz = '<font color=#FFFF00>修改权重</font>';
			lib.translate._aiyh_fixCf = '<font color=#FF3300>修改威胁度</font>';
			lib.translate._aiyh_fixWj = '<font color=#00FFFF>伪禁</font>';
			lib.translate._sftj_operateJl='<font color=#00FFFF>记录操作</font>';

			/*AI优化*/
			if (lib.config.extension_AI优化_sfjAi) {//身份局AI
				lib.skill.gjcx_zhuAi = {
					trigger: { global: 'zhuUpdate' },
					silent: true,
					forced: true,
					unique: true,
					popup: false,
					charlotte: true,
					superCharlotte: true,
					content: function () {
						let target = game.findPlayer(function (current) {
							return current == game.zhu;
						});
						player.removeSkill('gjcx_zhuAi');
						target.addSkill('gjcx_zhuAi');
					},
					ai: {
						effect: {
							player: function (card, player, target) {
								if (typeof card != 'object' || player._aiyh_zhuAi_temp || player.hasSkill('aiMangju') || get.itemtype(target) != 'player') return;
								player._aiyh_zhuAi_temp = true;
								let att = get.attitude(player, target), name = get.name(card, player);
								delete player._aiyh_zhuAi_temp;
								if (Math.abs(att) < 1 && player.needsToDiscard()) {
									if (get.tag(card, 'damage') && name != 'huogong' && name != 'juedou' && (target.hp > 1 || player.hasSkillTag('jueqing', false, target)) || name == 'lebu' || name == 'bingliang' || name == 'fudichouxin') return [1, 0.8];
								}
							},
							target: function (card, player, target) {
								if (typeof card != 'object' || target._zhuCx_temp || get.itemtype(player) != 'player') return 1;
								target._zhuCx_temp = true;
								let eff = get.effect(target, card, player, target);
								delete target._zhuCx_temp;
								if (!eff) return;
								if (get.tag(card, 'damage')) return [1, -Math.min(3, 0.8 * target.getDamagedHp()) - 0.6];
								if (get.name(card) == 'lebu' || get.name(card) == 'bingliang') return [1, -0.8];
							}
						}
					}
				};
				lib.skill.gjcx_neiAi = {
					init: function (player) {
						game.countPlayer(function (current) {
							current.storage.gjcx_neiAi = current.maxHp;
						});
					},
					trigger: {
						global: ['phaseUseBegin', 'changeHp', 'dieAfter']
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
					filter: function (event, player) {
						return !player.hasSkill('gjcx_neiAi_nojump') && !player.hasSkill('gjcx_neiAi_suspend');
					},
					content: function () {
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
						if (trigger.name == 'die' && !game.hasPlayer(function (current) {
							return current.identity == 'fan';
						})) {
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
						let all = 0, mine = 0;
						for (let i of game.players) {
							let sym, base1 = 1, base2 = 0, temp = 0;
							if (i == player || zs.includes(i)) sym = 1;
							else if (fs.includes(i)) sym = -1;
							else continue;
							if (i.hp > 0) {
								if (typeof lib.config.extension_AI优化_qz[i.name] == 'number') base1 = lib.config.extension_AI优化_qz[i.name];
								else if (lib.config.extension_AI优化_ckQz == 'cf') base1 = get.threaten(i, player);
								else if (lib.config.extension_AI优化_ckQz == 'pj') {
									let rank1 = game.getRarity(i.name);
									if (rank1 == 'rare') base1 = 1.1;
									else if (rank1 == 'epic') base1 = 1.57;
									else if (rank1 == 'legend') base1 = 1.95;
									else if (rank1 == 'junk') base1 = 0.8;
								}
								else if (lib.config.extension_AI优化_ckQz == 'sl') {
									let sfc = get.purifySFConfig(lib.config[get.sfConfigName(i.identity)], lib.config.extension_AI优化_min)[i.name],
										sl = 0.4;
									if (sfc&&typeof sfc.sl==='number') sl = sfc.sl;
									if (sl<0.4) base1 = 0.6+sl;
									else if (sl<0.8) base1 = 2*sl+0.2;
									else base1 = 3*sl-0.6;
								}
								if (i.name2 != undefined) {
									if (typeof lib.config.extension_AI优化_qz[i.name2] == 'number') base2 = lib.config.extension_AI优化_qz[i.name2];
									else if (lib.config.extension_AI优化_ckQz == 'pj') {
										let rank2 = game.getRarity(i.name2);
										base2 = 1;
										if (rank2 == 'rare') base2 = 1.1;
										else if (rank2 == 'epic') base2 = 1.57;
										else if (rank2 == 'legend') base2 = 1.95;
										else if (rank2 == 'junk') base2 = 0.8;
									}
									else if (lib.config.extension_AI优化_ckQz == 'sl') {
										let sfc = get.purifySFConfig(lib.config[get.sfConfigName(i.identity)], lib.config.extension_AI优化_min)[i.name2],
											sl = 0.5;
										if (sfc&&typeof sfc.sl==='number') sl = sfc.sl;
										if (sl<0.4) base1 = 0.6+sl;
										else if (sl<0.8) base1 = 2*sl+0.2;
										else base1 = 3*sl-0.6;
									}
								}
								if (base2) base1 = (base1 + base2) / 2;
								if (i.isTurnedOver()) base1 -= 0.28;
								if (i.storage.gjcx_neiAi && i.storage.gjcx_neiAi != i.maxHp) {
									if (i.maxHp > i.storage.gjcx_neiAi) {
										if (i.hp > i.storage.gjcx_neiAi) temp += ((1 + (i.maxHp - i.storage.gjcx_neiAi) / 10) * base1 * i.hp) / i.maxHp;
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
					subSkill: {
						damage: {
							mode: ['identity'],
							trigger: { player: 'useCard1' },
							filter: function (event, player) {
								return get.tag(event.card, 'damage');
							},
							direct: true,
							unique: true,
							lastDo: true,
							charlotte: true,
							superCharlotte: true,
							content: function () {
								player.addTempSkill('gjcx_neiAi_suspend', { player: 'useCardAfter' });
							}
						},
						expose: {
							mode: ['identity'],
							trigger: { player: 'useCard1' },
							filter: function (event, player) {
								return !player.identityShown && typeof player.ai.shown == 'number' && player.ai.shown;
							},
							silent: true,
							forced: true,
							unique: true,
							popup: false,
							charlotte: true,
							superCharlotte: true,
							content: function () {
								if (player.ai.shown >= 0.95 || get.attitude(game.zhu, player) < 0) player.removeSkill('gjcx_neiAi_expose');
								else if (trigger.card.name == 'tao') {
									for (let i of trigger.targets) {
										if (player == i) continue;
										if (get.attitude(game.zhu, i) > 0) player.ai.shown -= 0.5;
										else if (i.identity == 'fan') player.ai.shown = 0.99;
									}
								} else if (trigger.targets && trigger.targets.length == 1 && player != trigger.targets[0] && !player.hasSkill('gjcx_neiZhong') && !player.hasSkill('gjcx_neiJiang')
								&& get.attitude(game.zhu, trigger.targets[0]) * get.effect(trigger.targets[0], trigger.card, player, game.zhu) < 0) {
									player.removeSkill('gjcx_neiAi_expose');
									player.ai.shown = 0.99;
								} else if (!player.hasSkill('gjcx_neiFan')) player.ai.shown -= 0.03;
							}
						},
						suspend: {
							charlotte: true,
							superCharlotte: true
						},
						nojump: {
							charlotte: true,
							superCharlotte: true
						}
					}
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
							player: function (card, player, target) {
								if (typeof card != 'object' || player._aiyh_neiZhong_temp || get.itemtype(target) != 'player') return 1;
								player._aiyh_neiZhong_temp = true;
								let eff = get.effect(target, card, player, player), name = get.name(card, player);
								delete player._aiyh_neiZhong_temp;
								if (!eff) return;
								if (get.tag(card, 'damage') && name != 'huogong' || name == 'lebu' || name == 'bingliang') {
									if (target.identity == 'zhu') return [1, -3];
									if (target.ai.shown < 0.95 && get.attitude(game.zhu, target) <= 0) {
										if (player.needsToDiscard()) return [1, 0.5];
										return [0, 0];
									}
									if (target.identity != 'fan') return [1, -2];
									return [1, 0.9];
								}
								if (name == 'tao') {
									if (target == player || target == game.zhu || (_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)) return 1;
									if (target.identity != 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 0.8];
									return [1, -2];
								}
							}
						}
					}
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
							player: function (card, player, target) {
								if (typeof card != 'object' || player._aiyh_neiFan_temp || get.itemtype(target) != 'player') return;
								player._aiyh_neiFan_temp = true;
								let eff = get.effect(target, card, player, player), name = get.name(card, player);
								delete player._aiyh_neiFan_temp;
								if (!eff) return;
								if ((get.tag(card, 'damage') && name != 'huogong') || name == 'lebu' || name == 'bingliang') {
									if (target.identity == 'zhu' && (target.hp < 2 || game.hasPlayer(function (current) {
										return current.identity == 'zhong' || current.identity == 'mingzhong';
									}))) return [1, -3];
									if (target.identity == 'fan') return [1, -2];
									if (target.ai.shown < 0.95) {
										if (player.needsToDiscard()) return [1, 0.5];
										return [0, 0];
									}
									return [1, 0.9];
								}
								if (name == 'tao') {
									if (target == player || target == game.zhu || (_status.event.dying && player.countCards('hs', 'tao') + _status.event.dying.hp <= 0)) return;
									if (target.identity == 'fan' && game.zhu.hp > 1 && player.hp > 2) return [1, 1.6];
									return [1, -2];
								}
							}
						}
					}
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
							player: function (card, player, target) {
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
							}
						}
					}
				};
				lib.skill._aiyh_lianhe = {//联合ai
					mode: ['identity'],
					locked: true,
					unique: true,
					forceDie: true,
					charlotte: true,
					superCharlotte: true,
					ai: {
						effect: {
							player: function (card, player, target) {
								if (typeof card != 'object' || get.itemtype(target) != 'player' || target.ai.shown < 0.95 || player == target) return 1;
								if (target.identity == 'nei' && !player.getFriends().length && (player.identity == 'fan' || player == game.zhu) && game.countPlayer(function (current) {
									let num = 1;
									if (typeof lib.config.extension_AI优化_qz[current.name] == 'number') num = lib.config.extension_AI优化_qz[current.name];
									if (current.name2 != undefined && typeof lib.config.extension_AI优化_qz[current.name2] == 'number') num = (num + lib.config.extension_AI优化_qz[current.name2]) / 2;
									if (current.isTurnedOver()) num -= 0.28;
									if (current.storage.gjcx_neiAi && current.storage.gjcx_neiAi != current.maxHp) {
										if (current.maxHp > current.storage.gjcx_neiAi) {
											if (current.hp > current.storage.gjcx_neiAi) num *= ((1 + (current.maxHp - current.storage.gjcx_neiAi) / 10) * current.hp) / current.maxHp;
											else num *= current.hp / current.storage.gjcx_neiAi;
										} else num *= current.hp / Math.min(5, current.storage.gjcx_neiAi);
									} else num *= current.hp / current.maxHp;
									num += current.countCards('hes') * 0.1 - current.countCards('j') * 0.16;
									if (current == player) return -2 * num;
									if (current.identity == 'nei') return -num;
									return num;
								}) > 0) {
									if (get.tag(card, 'damage')) return [1, -2];
									if (get.name(card) == 'tao' && player.hp > 1 && player.countCards('hs', 'tao') + target.hp > 0) return [1, 2];
								}
							}
						}
					}
				};
			}
		},
		precontent: function () {
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
				game.prompt('请输入要'+info+'AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
					if (str) {
						var thisstr = '';
						if (lib.character[str]) {
							thisstr = str;
							var lists = lib.config['extension_AI优化_'+identity] || [];
							if (lists && lists.includes(thisstr)) {
								lists.remove(thisstr);
								temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出'+info+'AI禁选</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>'+info+'AI禁将';
									delete temp.ready;
								}, 1600);
							} else {
								lists.push(thisstr);
								temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入'+info+'AI禁选</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>'+info+'AI禁将';
									delete temp.ready;
								}, 1600);
							}
							game.saveExtensionConfig('AI优化', identity, lists);
						} else {
							temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
							temp.ready = true;
							setTimeout(() => {
								temp.innerHTML = '<li>'+info+'AI禁将';
								delete temp.ready;
							}, 1600);
						}
					}
				});
			};
			game.aiyh_configBanList = (identity, info) => {
				var h = document.body.offsetHeight;
				var w = document.body.offsetWidth;
				var lists = lib.config['extension_AI优化_'+identity] || [];
				//改自手杀ui和群英荟萃
				var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
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
			lib.get.statusModeInfo=function(sf){//获取当前游戏模式名称
				let info=lib.translate[get.mode()];
				if(_status.mode&&(!sf||lib.config.extension_AI优化_apart)){
					let sm;
					switch(get.mode()){
						case 'identity':
							if(_status.mode=='normal') sm='标准';
							else if(_status.mode=='zhong') sm='明忠';
							else if(_status.mode=='purple') sm='3v3v2';
							break;
						case 'guozhan':
							if(_status.mode=='normal') sm='势备';
							else if(_status.mode=='yingbian') sm='应变';
							else if(_status.mode=='old') sm='怀旧';
							else if(_status.mode=='free') sm='自由';
							break;
						case 'versus':
							if(_status.mode=='four') sm='对抗';
							else if(_status.mode=='three') sm='统率';
							else if(_status.mode=='two') sm='欢乐';
							else if(_status.mode=='guandu') sm='官渡';
							else if(_status.mode=='jiange') sm='剑阁';
							else if(_status.mode=='siguo') sm='四国';
							else if(_status.mode=='standard') sm='自由';
							break;
						case 'doudizhu':
							if(_status.mode=='normal') sm='休闲';
							else if(_status.mode=='kaihei') sm='开黑';
							else if(_status.mode=='huanle') sm='欢乐';
							else if(_status.mode=='binglin') sm='兵临';
							else if(_status.mode=='online') sm='智斗';
							break;
						case 'single':
							lib.translate[_status.mode+'2'];
							break;
						case 'chess':
							if(_status.mode=='combat') sm='自由';
							else if(_status.mode=='three') sm='统率';
							else if(_status.mode=='leader') sm='君主';
							break;
					}
					if(sm) info+=' - '+sm;
				}
				return info+'模式';
			};
			lib.get.identityInfo=function(str){
				/*获取字符串中最后一个'_'后面的身份翻译
				参数：待清洗字符串
				*/
				if(typeof str!='string') return '';
				let clean=str.split('_');
				if(get.sfConfigName().length<=1) return '';
				clean=clean[clean.length-1];
				if(clean.indexOf('unknown')==0) return '未知';
				if(isNaN(parseInt(clean[clean.length-1]))) clean+='2';
				let trans=lib.translate[clean];
				if(typeof trans!='string') return '';
				return trans;
			};
			lib.get.sfConfigName=function(identity){
				/*获取当前游戏模式下武将的胜负统计配置名
				参数：身份
				有身份 返回当前游戏模式胜负统计对应身份配置名（字符串）
				无身份 返回所有可能的身份配置名（数组）
				*/
				let mode=get.mode(),cgn='extension_AI优化_'+mode,sm='';
				if(_status.mode&&lib.config.extension_AI优化_apart&&_status.mode!='deck') sm='_'+_status.mode;
				if(typeof identity!='string'){
					if(mode=='identity'){
						if(_status.mode=='purple') return [cgn+sm+'_rZhu',cgn+sm+'_rZhong',cgn+sm+'_rNei',cgn+sm+'_rYe'];
						let configs=[];
						configs.addArray([cgn+sm+'_zhu',cgn+sm+'_zhong',cgn+sm+'_fan',cgn+sm+'_nei']);
						if(_status.mode=='zhong') configs.push(cgn+sm+'_mingzhong');
						return configs;
					}
					if(mode=='doudizhu'||mode=='single') return [cgn+sm+'_zhu',cgn+sm+'_fan'];
					return [cgn+sm];
				}
				if(mode=='identity'&&_status.mode=='purple') return cgn+sm+'_r'+identity.slice(1);
				if(mode=='identity'||mode=='doudizhu'||mode=='single') return cgn+sm+'_'+identity;
				return cgn+sm;
			};
			lib.get.purifySFConfig=function(config,min){//筛选至少min场的胜负记录
				if(Object.prototype.toString.call(config)!=='[object Object]') return {};
				if(typeof min!='number'||isNaN(min)) min=0;
				let result={},judge=false;
				for(let i in config){
					if(!judge){
						if(Object.prototype.toString.call(config[i])!=='[object Object]') return config;
						judge=true;
					}
					if(config[i].win+config[i].lose>=min) result[i]=config[i];
				}
				return result;
			};
			lib.get.sfInit=function(sf,now){//初始化
				let cgn;
				if(typeof sf!='string') cgn=get.sfConfigName();
				else cgn=[sf];
				for(let sf of cgn){
					if(Object.prototype.toString.call(lib.config[sf])!=='[object Object]'){
						let sftj = sf.replace('AI优化','胜负统计');
						if(Object.prototype.toString.call(lib.config[sftj])==='[object Object]'&&Object.entries(lib.config[sftj]).length){
							game.saveConfig(sf,lib.config[sftj]);
							alert('成功导入《胜负统计》中当前模式下'+get.identityInfo(sf)+'的统计数据');
						}
						else lib.config[sf]={};
					}
					for(let i in lib.config[sf]){
						let all=lib.config[sf][i].win+lib.config[sf][i].lose;
						if(all) lib.config[sf][i].sl=lib.config[sf][i].win/all;
						else lib.config[sf][i].sl=0;
						if(!now&&lib.config.extension_AI优化_display!='off'){
							if(lib.characterTitle[i]==undefined) lib.characterTitle[i]='';
							else lib.characterTitle[i]+='<br>';
							lib.characterTitle[i]+=get.identityInfo(sf)+'<br>';
							if(lib.config.extension_AI优化_display!='sf') lib.characterTitle[i]+='总场数：'+all+' 胜率：'+Math.round(10000*lib.config[sf][i].sl)/100+'%<br>';
							if(lib.config.extension_AI优化_display!='sl') lib.characterTitle[i]+=lib.config[sf][i].win+'胜 '+lib.config[sf][i].lose+'负<br>';
						}
					}
					game.saveConfig(sf,lib.config[sf]);
				}
			};
			{//本体版本检测
				let noname = lib.version.split('.').slice(2), min = ['4'], len = Math.min(noname.length, min.length), status = false;
				if (lib.version.slice(0, 5) === '1.10.') for (let i = 0; i < len; i++) {
					if (noname[i] < min[i]) {
						status = '您的无名杀版本太低';
						break;
					}
					if (i===0&&(noname[i]==='4'||noname[i]==='5')) {
						if (localStorage.getItem('aiyh_version_check_alerted')!==lib.version) {
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
					'<center><font color=#00FFFF>更新日期</font>：<font color=#FFFF00>24</font>年<font color=#00FFB0>2</font>月<font color=fire>2</font>日</center>',
					'◆添加胜率统计一系列功能并适配本扩展内奸AI策略',
					'◆删除［显示隐藏武将］、［同名武将筛选］功能',
					'◆移除实用性太低的最大点数记录',
					'◆调整内奸跳身份ai，进一步降低内奸摆烂可能'
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
				if (!lib.aiyh.ai) lib.aiyh.ai = {};
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
							if (rand > 0.81 || get.isLuckyStar(player)) event.result = 3;
							else if (rand > 0.21) event.result = 2;
							else if (rand > 0.1) event.result = 1;
							else event.result = 0;
							'step 1'
							if (event.result == 3) game.log(player, '御风飞行', '#g成功');
							else {
								game.log(player, '御风飞行', '#g失败');
								player.popup('杯具');
							}
							game.log(player, '获得了', '#y' + event.result + '分');
							if (event.result < 3) {
								if (event.result) player.draw(event.result);
								event.finish();
							} else {
								event.score = event.result;
								player.chooseTarget('请选择【御风】的目标', [1, event.result], function (card, player, target) {
									return target != player && !target.hasSkill('yufeng2');
								}).set('ai', function (target) {
									var player = _status.event.player;
									var att = -get.attitude(player, target), attx = att * 2;
									if (att <= 0 || target.hasSkill('xinfu_pdgyingshi')) return 0;
									if (target.hasJudge('lebu')) attx -= att;
									if (target.hasJudge('bingliang')) attx -= att;
									return attx / Math.max(2.25, Math.sqrt(target.countCards('h') + 1));
								});
							}
							'step 2'
							if (result.bool) {
								result.targets.sortBySeat();
								player.line(result.targets, 'green');
								game.log(result.targets, '获得了', '#y“御风”', '效果');
								for (var i of result.targets) i.addSkill('yufeng2');
								if (event.score > result.targets.length) player.draw(event.score - result.targets.length);
							} else player.draw(event.score);
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
								if (rand > 0.72) num = 5;
								else if (rand > 0.36) num = 4;
								else if (rand > 0.21) num = 3;
								else if (rand > 0.12) num = 2;
								else if (rand > 0.06) num = 1;
								else num = 0;
							}
							else {
								if (rand > 0.21) num = 3;
								else if (rand > 0.12) num = 2;
								else if (rand > 0.06) num = 1;
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
				if(!lib.config.extension_AI优化_apart) get.sfInit();
				lib.onover.push(function(result){
					if(!lib.config.extension_AI优化_record) return;
					let curs = game.filterPlayer2(true, null, true),
					wins = [],
					can = true,
					id = [],
					mode = get.mode();
					if (mode == 'identity') {
						if (_status.mode == 'purple') {
							if (result || lib.config.extension_AI优化_sw) id = game.me.identity;
							else if (game.hasPlayer(function (current) {
								if (current.identity.indexOf('Zhu') == 1){
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
						if (game.zhu&&game.zhu.isDead()||game.boss&&game.boss.isDead()) wins = game.filterPlayer2(function (target){
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
						let cgn = get.sfConfigName(i.identity||'unknown'), names=[];
						if(i.storage.sftj&&i.name1!=i.storage.sftj.cg1){
							if(lib.config.extension_AI优化_change=='pre'&&i.storage.sftj.cg1!=undefined) names.push(i.storage.sftj.cg1);
							else if(lib.config.extension_AI优化_change=='nxt'&&i.name1!=undefined) names.push(i.name1);
						}
						else if(i.name1!=undefined) names.push(i.name1);
						if(i.storage.sftj&&i.name2!=i.storage.sftj.cg2){
							if(lib.config.extension_AI优化_change=='pre'&&i.storage.sftj.cg2!=undefined) names.push(i.storage.sftj.cg2);
							else if(lib.config.extension_AI优化_change=='nxt'&&i.name2!=undefined) names.push(i.name2);
						}
						else if(i.name2!=undefined) names.push(i.name2);
						for(let j of names){
							if (lib.config[cgn][j] == undefined) lib.config[cgn][j] = {win: 0, lose: 0};
							if (bool == true) lib.config[cgn][j].win++;
							else lib.config[cgn][j].lose++;
						}
					}
					for(let i of get.sfConfigName()){
						game.saveConfig(i, lib.config[i]);
					}
				});
			});
			if (lib.config.extension_AI优化_wjAi) lib.arenaReady.push(function () {//武将AI
				if (game.aiyh_skillOptEnabled('xinfu_tushe')) lib.skill.xinfu_tushe={
					audio:2,
					mod:{
						aiOrder(player,card,num){
							if(get.tag(card,'multitarget')){
								if(player.countCards('h',{type:'basic'})) return num/10;
								return num*10;
							}
							if(get.type(card)==='basic') return num+6;
						},
						aiValue(player,card,num){
							if(card.name==='zhangba'){
								let fact=(n)=>{
									if(n>1) return n*fact(n-1);
									return 1;
								},basic=0;
								return fact(Math.min(player.countCards('hs',i=>{
									if(get.tag(i,'multitarget')) return 2;
									if(!['shan','tao','jiu'].includes(card.name)) return 1;
									basic++;
								})/(1+basic),player.getCardUsable('sha')));
							}
							if(['shan','tao','jiu'].includes(card.name)){
								if(player.getEquip('zhangba')&&player.countCards('hs')>1) return 0.01;
								return num/2;
							}
							if(get.tag(card,'multitarget')) return num+game.players.length;
						},
						aiUseful(player,card,num){
							if(get.name(card,player)==='shan'){
								if(player.countCards('hs',i=>{
									if(card===i||card.cards&&card.cards.includes(i)) return false;
									return get.name(i,player)==='shan';
								})) return -1;
								return num/Math.pow(Math.max(1,player.hp),2);
							}
						}
					},
					trigger:{
						player:"useCardToPlayered",
					},
					frequent:true,
					filter:function (event,player){
						if(get.type(event.card)=='equip') return false;
						if(event.getParent().triggeredTargets3.length>1) return false;
						return event.targets.length>0&&!player.countCards('h',{type:'basic'});
					},
					content:function (){
						player.draw(trigger.targets.length);
					},
					ai:{
						presha:true,
						pretao:true,
						threaten:1.8,
						effect:{
							player(card,player,target){
								if(typeof card==='object'&&card.name!=='shan'&&get.type(card)!=='equip'&&!player.countCards('h',i=>{
									if(card===i||card.cards&&card.cards.includes(i)) return false;
									return get.type(i)==='basic';
								})){
									let targets=[],evt=_status.event.getParent('useCard');
									targets.addArray(ui.selected.targets);
									if(evt&&evt.card==card) targets.addArray(evt.targets);
									if(targets.length) return [1,targets.length];
									if(get.tag(card,'multitarget')) return [1,game.players.length-1];
								}
							}
						}
					},
				};
				if (game.aiyh_skillOptEnabled('xinfu_limu')) lib.skill.xinfu_limu={
					mod:{
						targetInRange(card,player,target){
							if(player.countCards('j')&&player.inRange(target)) return true;
						},
						cardUsableTarget(card,player,target){
							if(player.countCards('j')&&player.inRange(target)) return true;
						},
						aiOrder(player,card,num){
							if(get.type(card,'delay')&&player.canUse(card,player)&&player.canAddJudge(card)) return 15;
						}
					},
					locked:false,
					audio:2,
					enable:"phaseUse",
					discard:false,
					filter:function (event,player){
						if(player.hasJudge('lebu')) return false;
						return player.countCards('hes',{suit:'diamond'})>0;
					},
					viewAs:{name:'lebu'},
					//prepare:"throw",
					position:"hes",
					filterCard:function(card,player,event){
						return get.suit(card)=='diamond'&&player.canAddJudge({name:'lebu',cards:[card]});
					},
					selectTarget:-1,
					filterTarget:function (card,player,target){
						return player==target;
					},
					check:function(card){
						var player=_status.event.player;
						if(!player.getEquip('zhangba')){
							let damaged=player.maxHp-player.hp-1;
							if(player.countCards('h',function(cardx){
								if(cardx==card) return false;
								if(cardx.name=='tao'){
									if(damaged<1) return true;
									damaged--;
								}
								return ['shan','jiu'].includes(cardx.name);
							})>0) return 0;
						}
						if(card.name=='shan') return 15;
						if(card.name=='tao'||card.name=='jiu') return 10;
						return 9-get.value(card);
					},
					onuse:function (links,player){
						var next=game.createEvent('limu_recover',false,_status.event.getParent());
						next.player=player;
						next.setContent(function(){player.recover()});
					},
					ai:{
						result:{
							target(player,target){
								let res=lib.card.lebu.ai.result.target(player,target);
								if(target.isDamaged()) return res+2*Math.abs(get.recoverEffect(target,player,target));
								return res;
							},
							ignoreStatus:true
						},
						order(item,player){
							if(player.countCards('j')) return 0;
							return 12;
						},
						effect:{
							target(card,player,target){
								if(target.isPhaseUsing()&&typeof card==='object'&&get.type(card,target)==='delay'&&!target.countCards('j')){
									let shas=target.getCards('hs',i=>{
										if(card===i||card.cards&&card.cards.includes(i)) return false;
										return get.name(i,target)==='sha'&&target.getUseValue(i)>0;
									})-target.getCardUsable('sha');
									if(shas>0) return [1,1.5*shas];
								}
							}
						}
					},
				};
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
				//nsp
				if (lib.config.extension_AI优化_dev) {}
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
					if (lib.card.tiesuo&&lib.card.tiesuo.ai&&lib.card.tiesuo.ai.basic) lib.card.tiesuo.ai.basic.order=7.3;
					if (lib.card.sha&&lib.card.sha.ai) lib.card.sha.ai.order=function(item,player){
						if(player.hasSkillTag('presha',true,null,true)) return 10;
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
							draw: 1,
							loseCard: 1,
							discard: 1,
							multitarget: true,
							norepeat: 1
						}
					}
				};
				lib.translate.yiyi_info = '出牌阶段，对至多三名角色使用。目标角色摸两张牌然后弃置两张牌。';
				lib.translate.yiyi_info_versus = '出牌阶段，对所有友方角色使用。目标角色摸两张牌然后弃置两张牌。';
			});
		},
		config: {
			kzjs: {
				name: '<font color=#00FFFF>扩展介绍</font>',
				init: 'jieshao',
				unfrequent: true,
				item: {
					jieshao: '点击查看'
				},
				textMenu: function (node, link) {
					lib.setScroll(node.parentNode);
					node.parentNode.style.transform = 'translateY(-100px)';
					node.parentNode.style.height = '300px';
					node.parentNode.style.width = '300px';
					if(link === 'jieshao') node.innerHTML = `本扩展以『云将』『官将重修』中部分功能为基础，@柚子丶奶茶丶猫以及面具 退圈前已许可修改，现由@翩翩浊世许公子 和 @157 整理，@157负责主要后续维护，与原作者无关
						<br><br><font color=#FF3300>注意！</font>本扩展与其他有AI功能的扩展同时打开可能会导致AI错乱。若下面涉及到的本体武将或卡牌出现bug建议关闭本扩展后测试
						<br><br><br><li><font color=#FFFF00>本体武将优化相关</font>：<br>刘焉〖图射〗〖立牧〗<br>神马超〖狩骊〗〖横骛〗<br>夏侯紫萼〖血偿〗
						<br><br><br><li><font color=#00FFFF>本体卡牌AI相关</font>：<br>●<span style="font-family: xingkai">南蛮入侵</span>
						<br>将身份奖惩写在【南蛮入侵】中对使用者的效益里，一定程度上减少人机杀敌一千自损八百的情况；<br>增加对有「打出杀」标签的角色的判断，具体化残血主公的放大效益，一定程度上鼓励人机开aoe收残血反；
						<br>有无懈的队友一般会在自己也是aoe的目标且没有响应的情况下比较当前响应角色和自己的情况决定要不要不出无懈，已响应或不为目标也会看在队友实力雄厚的情况下可能不出无懈
						<br>●<span style="font-family: xingkai">万箭齐发</span>与<span style="font-family: xingkai">南蛮入侵</span>类似
						<br>●<span style="font-family: xingkai">以逸待劳</span><br>修复文字描述错误，对决模式目标默认选择己方角色
						<br><br><br><li><span style="font-family: xingkai">身份局相关：</span><br>●没有队友、场上有忠臣存活的反贼和内奸，以及没有忠臣、场上有多名反贼存活的主公和内奸彼此会减少伤害牌的使用，并在自己血还够扛的情况下会救濒死的对方；
						<br>●需要弃牌时，主公会盲那些身份尚不明朗的人，前提是对方体力大于1或者自己有绝情标签（一定程度上避免盲忠弃牌后果），如果是忠内混战，主公还会把身份尚不明朗的人都连起来；<br>●稍稍提高对主公用伤害牌或兵乐的影响；
						<br>●内奸将根据玩家设置的武将权重和［第二权重参考］选择的选项作为侧重判断场上角色实力、战损程度、牌持有量、有无翻面决定自己是跳反、跳忠还是酱油（主公比较健康且忠反双方实力差距不大时酱油）；
						<br>●通过内奸的努力，会逐渐减少其身份暴露度，但如果他跳反时救人或直接伤害主忠，将其身份直接暴露，如果救主忠，大幅减少其身份暴露度；
						<br>●内奸跳忠/反时会优先打反/忠，需要弃牌时会盲身份不明朗的角色，并尽量规避对主以及忠/反使用伤害牌，自己和主公比较健康时也会救忠/反；
						<br>●内奸打酱油时，只关心自己和主公，非必要不用牌，需要弃牌时使用伤害牌但也不酒杀，对忠反的生死漠不关心
						<br><br><br><li><span style="font-family: xingkai">其他：</span><br>●人机拥有多张同名牌时鼓励人机使用点数较小的牌，弃牌时鼓励保留点数较大的牌，但由于是微调数值收效甚微；
						<br>●鼓励拥有reverseEquip标签的角色刷装备，大幅降低已被废除的装备栏对应副类别的牌的价值`;
				}
			},
			tip1: {
				name: '<br><hr>可通过<font color=fire>无名杀频道</font>、<font color=#FFFF00>无名杀扩展交流</font>、<font color=#00FFFF>Q群</font>或<font color=#00FFFF>下方链接</font><font color=#00FFB0>获取</font>本扩展最新版本',
				clear: true
			},
			copyQg: {
				name: "<span style='color: #00FFFF; font-family: yuanli'>Q群</span>：<span style='font-family: suits'>715181494</span> (<font color=#FFFF00>点我复制</font>)",
				clear: true,
				onclick: function () {
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = '715181494';
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('群号已复制到剪贴板');
					}
					else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			copyWp: {
				name: '一键复制<font color=#FFFF00>百度网盘</font><font color=#00FFFF>下载链接</font>',
				clear: true,
				onclick: function () {
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = 'https://pan.baidu.com/s/1jSwziUyRhKwKPplzQt_r4w?pwd=aiyh';
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('浏览器访问或打开「百度网盘APP」即可获取本扩展最新版本');
					}
					else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			copyYp: {
				name: '一键复制<font color=#FFFF00>123云盘</font><font color=#00FFFF>下载链接</font>',
				clear: true,
				onclick: function () {
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = 'https://www.123pan.com/s/hjYtVv-FZWyh';
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('提取码：dwOG\n无需登录，浏览器访问即可获取本扩展最新版本');
					}
					else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			copyGit: {
				name: '一键复制<font color=#FFFF00>GitHub</font><font color=#00FFFF>仓库链接</font>',
				clear: true,
				onclick: function () {
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = 'https://github.com/PZ157/noname_AIOptimization';
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('链接已复制到剪贴板，欢迎志同道合之人为无名杀和本扩展提供代码');
					}
					else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			tip2: {
				clear: true,
				name: `<hr><center><font color=#00FFB0>以下大部分选项长按有提示！</center>
					<center>行楷字体选项均<font color=#FF3300>即时生效</font>！</center>
					<br><center>AI相关</center>`,
				nopointer: true
			},
			kpAi: {
				name: '卡牌AI优化',
				intro: '重启生效。仅优化了部分非装备牌AI',
				init: true
			},
			wjAi: {
				name: '武将技能优化',
				intro: '重启生效。具体优化技能见扩展介绍',
				init: true
			},
			sfjAi: {
				name: '身份局AI优化',
				intro: '开启后，重启游戏可载入身份局AI策略。可通过［出牌可修改武将权重］、［武将登场补充权重］和［第二权重参考］为内奸AI判断场上角色实力提供参考',
				init: true
			},
			mjAi: {
				name: '盲狙AI',
				intro: '开启后，AI会以更激进的方式盲狙',
				init: false
			},
			nhFriends: {
				name: '<span style="font-family: xingkai">ai不砍队友</span>',
				intro: '开启后，AI一般情况下将更不乐意对符合条件的队友使用除【火攻】外的伤害牌',
				init: 'off',
				item: {
					off: '关闭',
					1: '<=1血队友',
					2: '<=2血队友',
					3: '<=3血队友',
					4: '<=4血队友',
					hp: '<=其体力值队友',
				}
			},
			ntAoe: {
				name: '<span style="font-family: xingkai">aoe不受上一功能影响</span>',
				intro: '开启后，即使队友残血AI依然会考虑要不要放南蛮万箭',
				init: false
			},
			dev: {
				name: '测试&前瞻AI开关',
				intro: '目前包括以下前瞻AI优化：<br>【杀】<br>【铁索连环】',
				init: true
			},
			bd1: {
				clear: true,
				name: '<center>常用功能</center>',
				nopointer: true
			},
			viewAtt: {
				name: '火眼金睛',
				intro: '可在顶部菜单栏查看态度',
				init: false
			},
			removeMini: {
				name: '去除本体官将小游戏',
				intro: '去除手杀马钧〖巧思〗、手杀孙寒华〖冲虚〗、手杀南华老仙〖御风〗、手杀庞德公〖评才〗、手杀郑玄〖整经〗的小游戏，重启生效。（注意：若有其他拓展修改了小游戏可能会报错，关闭此选项即可）',
				init: false
			},
			exportPz: {
				name: '复制本扩展配置',
				clear: true,
				onclick: function () {
					let txt = '{';
					for (let i in lib.config) {
						if (!i.indexOf('extension_AI优化_')) txt += '\r	b' + i.slice(15) + ' : ' + JSON.stringify(lib.config[i]).replace('\n', '\r') + ',';
						else if (!i.indexOf('aiyh_character_skill_id_')) txt += '\r	s' + i.slice(24) + ' : ' + JSON.stringify(lib.config[i]).replace('\n', '\r') + ',';
					}
					txt += '\r}';
					let textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = txt;
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('AI优化配置已成功复制到剪切板，请您及时粘贴保存');
					}
					else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			loadPz: {
				name: '载入本扩展配置',
				clear: true,
				onclick: function () {
					let container = ui.create.div('.popup-container.editor');
					let editorpage = ui.create.div(container);
					let node = container;
					let str = '//完整粘贴你保存的AI优化配置到等号右端\r_status.aiyh_config = ';
					node.code = str;
					ui.window.classList.add('shortcutpaused');
					ui.window.classList.add('systempaused');
					let saveInput = function () {
						let code, j;
						if (container.editor) code = container.editor.getValue();
						else if (container.textarea) code = container.textarea.value;
						try {
							eval(code);
							if (Object.prototype.toString.call(_status.aiyh_config) !== '[object Object]') throw ('typeError');
						} catch (e) {
							if (e === 'typeError') alert('类型错误');
							else alert('代码语法有错误，请仔细检查（' + e + '）');
							return;
						}
						for (let i in _status.aiyh_config) {
							if (i[0] === 'b') j = 'extension_AI优化_' + i.slice(1);
							else j = 'aiyh_character_skill_id_' + i.slice(1);
							game.saveConfig(j, _status.aiyh_config[i]);
						}
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete();
						container.code = code;
						delete window.saveNonameInput;
						alert('配置已成功载入！即将重启游戏');
						game.reload();
					};
					window.saveNonameInput = saveInput;
					let editor = ui.create.editor(container, saveInput);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					}
					else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					}
					else {
						if (!window.CodeMirror) {
							import('../../game/codemirror.js').then(() => {
								lib.codeMirrorReady(node, editor);
							});
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						}
						else lib.codeMirrorReady(node, editor);
					}
				}
			},
			bd2: {
				clear: true,
				name: '<center>身份局相关功能</center>',
				nopointer: true
			},
			findZhong: {
				name: '慧眼识忠',
				intro: '主公开局知道一名忠臣身份',
				init: false
			},
			neiKey: {
				name: '<span style="font-family: xingkai">内奸可亮明身份</span>',
				intro: '内奸可以于出牌阶段直接亮明身份并加1点体力上限，然后可以选择与主公各回复1点体力，建议与［身份局AI优化］搭配使用，<font color=#FF3300>不然会显得非常无脑</font>',
				init: 'off',
				item: {
					can: '未暴露可亮',
					must: '暴露也可亮',
					off: '关闭'
				}
			},
			fixFour: {
				name: '四人身份局修改',
				intro: '将四人身份局改为1主（加体力上限）1内2反，游戏开始时忠臣改为明反',
				init: false
			},
			bd3: {
				clear: true,
				name: '<center>伪禁相关</center>'
			},
			Wj: {
				name: '<font color=#00FFFF>伪</font>玩家可选ai<font color=#00FFFF>禁</font>选',
				intro: '开启后，游戏开始或隐匿武将展示武将牌时，若场上有ai选择了伪禁列表里包含的ID对应武将，则<font color=#FFFF00>勒令其</font>从未加入游戏且不包含伪禁列表武将的将池里<font color=#FFFF00>再次</font>进行<font color=#FFFF00>选将</font>',
				init: false
			},
			wjs: {
				name: '伪禁候选武将数',
				intro: '〔默认〕即游戏开始时每名角色的候选武将数，若为自由选将等特殊情况则默认为6',
				init: 'same',
				item: {
					same: '默认',
					1: '一',
					2: '二',
					3: '三',
					4: '四',
					5: '五',
					6: '六',
					8: '八',
					10: '十'
				}
			},
			fixWj: {
				name: '<span style="font-family: xingkai">出牌阶段可编辑伪禁</font>',
				intro: '出牌阶段可将场上武将加入/移出伪禁列表，也可以从若干个武将包中选择武将执行此操作',
				init: false
			},
			editWj: {
				name: '编辑伪禁列表',
				clear: true,
				onclick: function () {
					let container = ui.create.div('.popup-container.editor');
					let editorpage = ui.create.div(container);
					let node = container;
					let map = lib.config.extension_AI优化_wj || [];
					let str = 'disabled=[';
					for (let i = 0; i < map.length; i++) {
						str += '\n	"' + map[i] + '",';
					}
					str += '\n];\n//请在[]内进行编辑，或借此复制/粘贴内容以备份/还原配置\n//请务必使用英文标点符号！';
					node.code = str;
					ui.window.classList.add('shortcutpaused');
					ui.window.classList.add('systempaused');
					let saveInput = function () {
						let code;
						if (container.editor) code = container.editor.getValue();
						else if (container.textarea) code = container.textarea.value;
						try {
							var disabled = null;
							eval(code);
							if (!Array.isArray(disabled)) {
								throw '类型不符';
							}
						} catch (e) {
							if (e == '类型不符') alert(e);
							else alert('代码语法有错误，请仔细检查（' + e + '）');
							return;
						}
						game.saveExtensionConfig('AI优化', 'wj', disabled);
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete();
						container.code = code;
						delete window.saveNonameInput;
					};
					window.saveNonameInput = saveInput;
					let editor = ui.create.editor(container, saveInput);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					}
					else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					}
					else {
						if (!window.CodeMirror) {
							import('../../game/codemirror.js').then(() => {
								lib.codeMirrorReady(node, editor);
							});
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						}
						else lib.codeMirrorReady(node, editor);
					}
				}
			},
			copyWj: {
				name: '一键复制伪禁列表',
				clear: true,
				onclick: function () {
					let map = lib.config.extension_AI优化_wj || [];
					let txt = '';
					for (let i = 0; i < map.length; i++) {
						txt += '\r	"' + map[i] + '",';
					}
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = txt;
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('伪禁列表已成功复制到剪切板');
					} else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			clearWj: {
				name: '清空伪禁列表',
				clear: true,
				onclick: function () {
					if (confirm('您确定要清空伪玩家可选ai禁选列表（共' + lib.config.extension_AI优化_wj.length + '个伪禁武将）？')) {
						game.saveExtensionConfig('AI优化', 'wj', []);
						alert('清除成功');
					}
				}
			},
			tip3: {
				name: '以下功能为<font color=#00FFFF>伪禁</font>衍生功能，<font color=#FFFF00>如需使用请开启〔伪玩家可选ai禁选〕</font>',
				clear: true
			},
			banzhu: {
				clear: true,
				name: '<li>主公AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'zhu','主公');
				}
			},
			banzhubiao: {
				name: '<li>主公AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('zhu','主公');
				}
			},
			banzhong: {
				clear: true,
				name: '<li>忠臣AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'zhong','忠臣');
				}
			},
			banzhongbiao: {
				name: '<li>忠臣AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('zhong','忠臣');
				}
			},
			banfan: {
				clear: true,
				name: '<li>反贼AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'fan','反贼');
				}
			},
			banfanbiao: {
				name: '<li>反贼AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('fan','反贼');
				}
			},
			bannei: {
				clear: true,
				name: '<li>内奸AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'nei','内奸');
				}
			},
			banneibiao: {
				name: '<li>内奸AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('nei','内奸');
				}
			},
			bandizhu: {
				clear: true,
				name: '<li>地主AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'dizhu','地主');
				}
			},
			bandizhubiao: {
				name: '<li>地主AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('dizhu','地主');
				}
			},
			bannongmin: {
				clear: true,
				name: '<li>农民AI禁将',
				onclick: function () {
					game.aiyh_configBan(this,'nongmin','农民');
				}
			},
			bannongminbiao: {
				name: '<li>农民AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					game.aiyh_configBanList('nongmin','农民');
				}
			},
			bd4: {
				clear: true,
				name: '<center>胜负统计相关</center>'
			},
			apart: {
				name: '<span style="font-family: xingkai">区分当前游戏模式</font>',
				intro: '开启后，武将胜负统计将<font color=#FF0000>区分开当前游戏模式</font>（即按照菜单->开始->模式->游戏模式分开统计）',
				init: false,
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','apart',item);
					alert('为避免调整此配置后继续使用本扩展功能可能带来的冲突，即将自动重启游戏');
					game.reload();
				}
			},
			display: {
				name: '胜负场数相关显示',
				intro: '调整武将信息上方的胜率、胜负场数相关显示',
				init: 'all',
				item: {
					all: '都显示',
					sf: '显示胜负场数',
					sl: '显示胜率',
					off: '不显示'
				},
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','display',item);
				}
			},
			record: {
				name: '<span style="font-family: xingkai">武将胜负记录</span>',
				intro: '开启后，游戏结束将根据玩家胜负记录玩家所使用的武将胜负',
				init: false,
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','record',item);
				}
			},
			tryAll: {
				name: '<span style="font-family: xingkai">尝试记录全场武将</span>',
				intro: '开启后，游戏结束将记录根据玩家胜负可以推测出来胜负的角色所使用的武将胜负',
				init: false,
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','tryAll',item);
				}
			},
			sw: {
				name: '<span style="font-family: xingkai">其他阵营视为同一阵营</span>',
				intro: '开启后，游戏结束进行记录时其他阵营将视为同一阵营，即玩家方赢、其余方均输，玩家方没赢，其余方均赢',
				init: false,
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','sw',item);
				}
			},
			change: {
				name: '<span style="font-family: xingkai">更换武将角色</font>',
				intro: '如果一个角色在游戏结束时用的武将和游戏开始时不同，可以选择记录游戏开始时的（最初的）或者记录游戏结束时的（最后的）',
				init: 'off',
				item: {
					off: '不记录',
					pre: '记录最初的',
					nxt: '记录最后的'
				},
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','change',item);
				}
			},
			operateJl: {
				name: '<span style="font-family: xingkai">出牌阶段可修改胜负记录</font>',
				intro: '开启后，出牌阶段可以对场上武将或所有武将当前游戏模式的胜负记录进行批量删除或修改操作',
				init: false,
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','operateJl',item);
				}
			},
			slRank: {
				name: '当前模式胜率排行榜',
				clear: true,
				onclick: function () {
					let mode=get.statusModeInfo(true),cgn=get.sfConfigName(),num=0;
					for(let i of cgn){
						get.sfInit(i,true);
						let rankNum = parseInt(lib.config.extension_AI优化_rankNum), sortedKeys = Object.entries(get.purifySFConfig(lib.config[i], lib.config.extension_AI优化_min)).sort(function(a, b){
							let res = Math.round(100000*a[1].sl) - Math.round(100000*b[1].sl);
							if(rankNum>0) res = -res;
							if(res==0) return b[1].win+b[1].lose-a[1].win-a[1].lose;
							return res;
						}).slice(0, Math.abs(rankNum)).map(entry => entry[0]);
						if(!sortedKeys.length) continue;
						let txt=mode+'武将'+get.identityInfo(i)+'胜率排行榜（'+(rankNum>0?'正序':'倒序')+'）';
						for(let j=0;j<sortedKeys.length;j++){
							txt+='\n   第'+(j+1)+'名   '+lib.translate[sortedKeys[j]]+'|'+sortedKeys[j]+'\n                     '+lib.config[i][sortedKeys[j]].win+'胜'+lib.config[i][sortedKeys[j]].lose+'负      胜率：'+Math.round(100000*lib.config[i][sortedKeys[j]].sl)/1000+'%';
						}
						num++;
						alert(txt);
					}
					if(!num) alert('当前模式暂无符合条件的记录');
				}
			},
			rankNum: {
				name: '排行榜展示：',
				intro: '和选项连起来读',
				init: '10',
				item: {
					'10': '前十名',
					'5': '前五名',
					'15': '前十五名',
					'20': '前二十名',
					'50': '前五十名',
					'-10': '最后十名',
					'-5': '最后五名',
					'-15': '最后十五名',
					'-20': '最后二十名',
					'-50': '最后五十名',
				},
				onclick: function (item) {
					game.saveExtensionConfig('AI优化','rankNum',item);
				}
			},
			min: {
				name: '<span style="font-family: xingkai">只筛选总场数不少于（单位：场，回车修改）</font>',
				intro: `在展示当前游戏模式武将胜率排行榜时，只在符合本配置条件的记录中筛选
					<br>此外如果您在［第二权重参考］中选择了〔胜率〕，那么内奸AI参考第二权重时将只采用符合本配置数值的数据`,
				init: '10',
				input: true,
				onblur: function(e){
					let text=e.target,
						num=Number(text.innerText);
					if(isNaN(num)) num=10;
					else if(num<0) num=0;
					else if(!Number.isInteger(num)) num=Math.round(num);
					text.innerText = num;
					game.saveExtensionConfig('AI优化','min',num);
				}
			},
			loadSf:{
				name:"载入当前模式武将胜负记录",
				clear:true,
				onclick:function(){
					let container=ui.create.div('.popup-container.editor');
					let editorpage=ui.create.div(container);
					let node=container;
					let map=get.sfConfigName();
					let str='';
					for(let i of map){
						str+='_status.'+i+' = {\r	//请在此大括号内填写'+get.statusModeInfo(true)+'你想载入的武将'+get.identityInfo(i)+'胜负记录\r};\r';
					}
					str+='//请在{}内进行编辑，务必使用英文标点符号！';
					node.code=str;
					ui.window.classList.add('shortcutpaused');
					ui.window.classList.add('systempaused');
					let saveInput=function(){
						let code;
						if(container.editor) code=container.editor.getValue();
						else if(container.textarea) code=container.textarea.value;
						try{
							eval(code);
							for(let i of map){
								if(_status[i]&&Object.prototype.toString.call(_status[i])!=='[object Object]') throw('typeError');
							}
						}
						catch(e){
							if(e==='typeError') alert('类型错误');
							else alert('代码语法有错误，请仔细检查（'+e+'）');
							return;
						}
						for(let i of map){
							if(_status[i]) for(let name in _status[i]){
								lib.config[i][name] = _status[i][name];
							}
							game.saveConfig(i,lib.config[i]);
						}
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete();
						container.code=code;
						delete window.saveNonameInput;
					};
					window.saveNonameInput=saveInput;
					let editor=ui.create.editor(container,saveInput);
					if(node.aced){
						ui.window.appendChild(node);
						node.editor.setValue(node.code,1);
					}
					else if(lib.device=='ios'){
						ui.window.appendChild(node);
						if(!node.textarea){
							let textarea=document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea=textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value=node.code;
					}
					else{
						if(!window.CodeMirror){
							import('../../game/codemirror.js').then(()=>{
								lib.codeMirrorReady(node,editor);
							});
							lib.init.css(lib.assetURL+'layout/default','codemirror');
						}
						else lib.codeMirrorReady(node, editor);
					}
				}
			},
			copySf: {
				name: '复制当前模式武将胜负记录',
				clear: true,
				onclick: function () {
					let cgn=get.sfConfigName();
					let mode=get.statusModeInfo(true)+'所有武将';
					let copy='', show=true;
					for(let i of cgn){
						show=true;
						if(!confirm(copy+'是否复制'+mode+get.identityInfo(i)+'胜负记录？')){
							copy='';
							continue;
						}
						let map = lib.config[i] || {}, txt = '	//'+mode+get.identityInfo(i)+'胜负记录\r';
						get.sfInit(i,true);
						for (let name in map) {
							txt += '\r	"' + name + '":{\r		win: ' + map[name].win + ',\r		lose: ' + map[name].lose + ',\r	},';
						}
						let textarea = document.createElement('textarea');
						textarea.setAttribute('readonly', 'readonly');
						textarea.value = txt;
						document.body.appendChild(textarea);
						textarea.select();
						if (document.execCommand('copy')) {
							document.execCommand('copy');
							copy = mode+get.identityInfo(i)+'胜负记录已成功复制到剪切板，建议您先粘贴到其他地方再进行后续操作。\n';
						}
						else copy = mode+get.identityInfo(i)+'胜负记录复制失败。\n';
						document.body.removeChild(textarea);
						show=false;
					}
					if(!show){
						if(copy.includes('失败')) alert(copy.split('。')[0]);
						else alert(copy.split('，')[0]);
					}
				}
			},
			deleteSf: {
				name: '删除当前模式武将胜负记录',
				clear: true,
				onclick: function () {
					let mode=get.statusModeInfo(true),cgn=get.sfConfigName();
					if(cgn.length>1){
						let num=0;
						for(let i of cgn){
							if(confirm('您确定要清空'+mode+'所有武将'+get.identityInfo(i)+'胜负记录吗？')){
								num++;
								game.saveConfig(i,{});
							}
						}
						if(num) alert('成功清除'+num+'项');
					}
					else if(confirm('您确定要清空'+lib.translate[get.mode()]+'模式'+mode+'所有武将的胜负记录吗？')){
						game.saveConfig(cgn[0],{});
						alert('清除成功');
					}
				}
			},
			bd5: {
				clear: true,
				name: '<center>杂项</center>',
				nopointer: true
			},
			tip4: {
				name: '<font color=#FF3300>注意！</font>通过以下功能设置的权重将<font color=#FFFF00>优先</font>作为<font color=#00FFFF>内奸AI</font>判断场上角色实力的参考',
				clear: true
			},
			fixQz: {
				name: '<span style="font-family: xingkai">出牌可修改武将权重</span>',
				intro: `出牌阶段可以设置/修改场上武将的权重，以此影响内奸AI策略
					<br><font color=#FF3300>注意！</font>凡涉及影响权重的功能均需开启［身份局AI优化］方才有实际效果！`,
				init: false
			},
			applyQz: {
				name: '武将登场补充权重',
				intro: '游戏开始或隐匿武将展示武将牌时会建议玩家为没有设置权重的武将设置权重',
				init: false
			},
			ckQz: {
				name: '<span style="font-family: xingkai">第二权重参考</span>',
				intro: `开启后，针对没有设置权重的武将，〔评级〕会根据武将评级为这些武将分配正相关的权重[0.8,1.95]，单机时可通过〈千幻聆音〉等扩展修改武将评级以影响对应武将权重；
					〔威胁度〕会将武将威胁度作为其对应的权重；
					〔胜率〕则采用本扩展胜负统计相应功能统计的符合［只筛选总场数不少于X场］配置的胜率数据`,
				init: 'off',
				item: {
					off: '不设置',
					pj: '评级',
					cf: '威胁度',
					sl: '胜率'
				}
			},
			qzCf: {
				name: '<span style="font-family: xingkai">权重参与效益结算</span>',
				intro: '开启后，ai在计算卡牌效益时会将权重（若无则为1）与结果作积返回，以此鼓励ai优先“待遇”权重大的角色',
				init: false
			},
			chooseQz: {
				name: '<font color=#FF3300>武将权重选项加载失败</font>',
				clear: true,
				nopointer: true
			},
			deleteQz: {
				name: '删除此权重',
				clear: true,
				onclick: function () {
					let id = document.getElementById('AI优化_chooseQz');
					let val = id.options[id.selectedIndex].value;
					if (confirm('确定要删除为' + lib.translate[val] + '设置的权重（' + lib.config.extension_AI优化_qz[val] + '）？')) {
						delete lib.config.extension_AI优化_qz[val];
						game.saveExtensionConfig('AI优化', 'qz', lib.config.extension_AI优化_qz);
						alert('删除成功');
					}
				}
			},
			editQz: {
				name: '编辑武将权重',
				clear: true,
				onclick: function () {
					let container = ui.create.div('.popup-container.editor');
					let editorpage = ui.create.div(container);
					let node = container;
					let map = lib.config.extension_AI优化_qz || {};
					let str = 'weight={',
						len = false;
					for (let i in map) {
						len = true;
						str += '\n	"' + i + '": ' + map[i] + ',';
					}
					if (!localStorage.getItem('weight_alerted')) {
						localStorage.setItem('weight_alerted', true);
						str += '\n	"shen_zhugeliang": 1.75,\n	"liangxing": 1.57,';
						len = true;
						alert('检测到您首次使用此功能，系统将自动为您补充两个作者给定的武将权重作为样例参考（点“取消”不会保存此样例）');
					}
					str += '\n};';
					if (len) str += '\n//请按照上面的写法规则进行编辑，或借此复制/粘贴内容以备份/还原配置\n//请务必使用英文标点符号！';
					node.code = str;
					ui.window.classList.add('shortcutpaused');
					ui.window.classList.add('systempaused');
					let saveInput = function () {
						let code;
						if (container.editor) code = container.editor.getValue();
						else if (container.textarea) code = container.textarea.value;
						try {
							var weight = null;
							eval(code);
							if (Object.prototype.toString.call(weight) !== '[object Object]') {
								throw '类型不符';
							}
						} catch (e) {
							if (e == '类型不符') alert(e);
							else alert('代码语法有错误，请仔细检查（' + e + '）');
							return;
						}
						game.saveExtensionConfig('AI优化', 'qz', weight);
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete();
						container.code = code;
						delete window.saveNonameInput;
					};
					window.saveNonameInput = saveInput;
					let editor = ui.create.editor(container, saveInput);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					}
					else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					}
					else {
						if (!window.CodeMirror) {
							import('../../game/codemirror.js').then(() => {
								lib.codeMirrorReady(node, editor);
							});
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						}
						else lib.codeMirrorReady(node, editor);
					}
				}
			},
			copyQz: {
				name: '一键复制武将权重',
				clear: true,
				onclick: function () {
					let map = lib.config.extension_AI优化_qz || {};
					let txt = '';
					for (let i in map) {
						txt += '\r	"' + i + '": ' + map[i] + ',';
					}
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = txt;
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('已成功复制到剪切板');
					} else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			clearQz: {
				name: '清空设置的武将权重',
				clear: true,
				onclick: function () {
					let xs = 0;
					for (let i in lib.config.extension_AI优化_qz) {
						xs++;
					}
					if (confirm('您确定要清空所有通过上述功能设置的武将权重（共' + xs + '项）？')) {
						game.saveExtensionConfig('AI优化', 'qz', {});
						alert('清除成功');
					}
				}
			},
			tip5: {
				name: `<br><font color=#FF3300>注意！</font>通过以下功能修改的技能威胁度会<font color=#00FFFF>覆盖</font>技能原有的威胁度
					<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp由于威胁度一般会与卡牌收益作积，为避免新手胡乱设置可能引起的错乱ai，故部分功能不允许将威胁度设为<font color=#FFFF00>非正数</font>`,
				clear: true
			},
			fixCf: {
				name: '<span style="font-family: xingkai">出牌可修改技能威胁度</span>',
				intro: '出牌阶段可以修改场上武将当前拥有的技能的威胁度，一定程度上为AI提供集火优先级',
				init: false
			},
			applyCf: {
				name: '威胁度补充',
				intro: `〔自动补充〕会在进入游戏时根据武将评级对没有添加威胁度的武将技能增加一定威胁度，单机时可通过〈千幻聆音〉等扩展修改武将评级以影响对应技能威胁度；
					<br>〔手动补充〕会在游戏开始或隐匿武将展示武将牌时建议玩家为没有添加威胁度的技能赋威胁度`,
				init: 'off',
				item: {
					off: '不补充',
					pj: '自动补充',
					sd: '手动补充'
				}
			},
			chooseCf: {
				name: '<font color=#FF3300>技能威胁度选项加载失败</font>',
				clear: true,
				nopointer: true
			},
			deleteCf: {
				name: '删除此修改项',
				clear: true,
				onclick: function () {
					let id = document.getElementById('AI优化_chooseCf');
					let val = id.options[id.selectedIndex].value;
					if (confirm('确定要删除修改的【' + lib.translate[val] + '】威胁度（' + lib.config.extension_AI优化_cf[val] + '）？')) {
						delete lib.config.extension_AI优化_cf[val];
						game.saveExtensionConfig('AI优化', 'cf', lib.config.extension_AI优化_cf);
						alert('删除成功');
					}
				}
			},
			editCf: {
				name: '编辑修改的技能威胁度',
				clear: true,
				onclick: function () {
					let container = ui.create.div('.popup-container.editor');
					let editorpage = ui.create.div(container);
					let node = container;
					let map = lib.config.extension_AI优化_cf || {};
					let str = 'threaten={',
						len = false;
					for (let i in map) {
						len = true;
						str += '\n	"' + i + '": ' + map[i] + ',';
					}
					if (!localStorage.getItem('threaten_alerted')) {
						localStorage.setItem('threaten_alerted', true);
						str += '\n	"gjcxs_zhugeliang3": 1.9,\n	"gjcxs_caojie1": 0.7,';
						len = true;
						alert('检测到您首次使用此功能，系统将自动为您补充两个作者给定的技能威胁度作为样例参考（点“取消”不会保存此样例）');
					}
					str += '\n};';
					if (len) str += '\n//请按照上面的写法规则进行编辑，或借此复制/粘贴内容以备份/还原配置\n//请务必使用英文标点符号！';
					node.code = str;
					ui.window.classList.add('shortcutpaused');
					ui.window.classList.add('systempaused');
					let saveInput = function () {
						let code;
						if (container.editor) code = container.editor.getValue();
						else if (container.textarea) code = container.textarea.value;
						try {
							var threaten = null;
							eval(code);
							if (Object.prototype.toString.call(threaten) !== '[object Object]') {
								throw '类型不符';
							}
						} catch (e) {
							if (e == '类型不符') alert(e);
							else alert('代码语法有错误，请仔细检查（' + e + '）');
							return;
						}
						game.saveExtensionConfig('AI优化', 'cf', threaten);
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete();
						container.code = code;
						delete window.saveNonameInput;
					};
					window.saveNonameInput = saveInput;
					let editor = ui.create.editor(container, saveInput);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					}
					else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					}
					else {
						if (!window.CodeMirror) {
							import('../../game/codemirror.js').then(() => {
								lib.codeMirrorReady(node, editor);
							});
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						}
						else lib.codeMirrorReady(node, editor);
					}
				}
			},
			copyCf: {
				name: '一键复制修改的技能威胁度',
				clear: true,
				onclick: function () {
					let map = lib.config.extension_AI优化_cf || {};
					let txt = '';
					for (let i in map) {
						txt += '\r	"' + i + '": ' + map[i] + ',';
					}
					const textarea = document.createElement('textarea');
					textarea.setAttribute('readonly', 'readonly');
					textarea.value = txt;
					document.body.appendChild(textarea);
					textarea.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						alert('已成功复制到剪切板');
					} else alert('复制失败');
					document.body.removeChild(textarea);
				}
			},
			clearCf: {
				name: '清空修改的技能威胁度',
				clear: true,
				onclick: function () {
					let xs = 0;
					for (let i in lib.config.extension_AI优化_cf) {
						xs++;
					}
					if (confirm('您确定要清空所有通过上述功能修改的技能威胁度（共' + xs + '项）？')) {
						game.saveExtensionConfig('AI优化', 'cf', {});
						alert('清除成功');
					}
				}
			},
			bd6: {
				name: '<hr>',
				clear: true
			},
		},
		help: {},
		package: {
			character: {
				character: {},
				translate: {}
			},
			card: {
				card: {},
				translate: {},
				list: []
			},
			skill: {
				skill: {},
				translate: {}
			},
			intro: `<font color=#00FFFF>更新日期</font>：24年<font color=#00FFB0> 2</font>月<font color=#FFFF00> 2</font>日<font color=fire>17</font>时
				<br><font color=#00FFFF>建立者</font>：
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp柚子丶奶茶丶猫以及面具
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp翩翩浊世许公子
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp157
				<br><font color=#00FFFF>现更者</font>：157
				<br><font color=#00FFB0>当前版本号</font>：<font color=#FFFF00>1.5</font>
				<br><font color=#00FFB0>支持本体最低版本号</font>：<font color=#FFFF00>1.10.6</font>
				<br><font color=#00FFB0>最佳适配本体版本号</font>：<font color=#FFFF00>1.10.7</font>`,
			diskURL: '',
			forumURL: '',
			version: '1.5'
		},
		files: { character: [], card: [], skill: [] }
	}
});