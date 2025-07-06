import { lib, game, ui, get, ai, _status } from './utils.js';

export function precontent(config, pack) {
	// 非常感谢@柚子丶奶茶丶猫以及面具 提供的『云将』相关部分AI优化的修复代码
	{
		// 本体版本检测
		let noname = lib.version
				.split('.')
				.slice(2)
				.map((i) => Number(i)),
			min = [7],
			status = false;
		while (noname.length < min.length) {
			noname.push(0);
		}
		if (lib.version.slice(0, 5) === '1.10.') {
			for (let i = 0; i < min.length; i++) {
				if (noname[i] < min[i]) {
					status = '您的无名杀版本太低';
					break;
				}
				if (noname[i] > min[i]) {
					break;
				}
			}
		} else status = '检测到游戏大版本号与本扩展支持版本号不同';
		if (typeof status === 'string') {
			alert(status + '，为避免版本不兼容产生不必要的问题，已为您关闭《AI优化》，稍后重启游戏');
			game.saveExtensionConfig('AI优化', 'enable', false);
			game.reload();
		}
	}
	if (lib.config.extension_AI优化_changelog !== lib.extensionPack.AI优化.version) {
		lib.game.showChangeLog = function () {
			// 更新内容
			let str = [
				ui.joint`
					<div style="display: flex; justify-content: center">
						<span style="color: #00FFFF">更新日期</span>：
						<span style="color: #FFFF00">25</span>年
						<span style="color: #00FFB0">7</span>月
						<span style="color: rgb(255, 146, 68)">6</span>日
					</div>
				`,
				'◆［慧眼识忠］［内奸可亮明身份］［盲狙AI］等功能适配联机',
				'◆移除无效的［测试&前瞻AI开关］功能',
				'◆修复版本检测逻辑',
				'◆模块拆分',
				'◆更正部分描述',
				'◆本扩展无限期停更，任何人均可二创修复',
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
				if (hidden) {
					ui.auto.show();
				}
				game.resume();
			});
			lib.init.onfree();
		};
	}
	if (lib.config.extension_AI优化_rank !== 'off') {
		// 细化评级显示
		ui.create.rarity = (button) => {
			let config = lib.config.extension_AI优化_rank;
			if (typeof config !== 'string' || config === 'off') {
				return;
			}

			// 提取频繁使用的字段
			const configType = config[1];
			const intro = button.node.intro;
			const commonIntroStyle = {
				fontSize: '16px',
				bottom: '6px',
				left: '6px',
			};

			intro.classList.add('showintro');
			let rarity, five;

			if (lib.rank.bp.includes(button.link)) {
				rarity = 5;
			} else if (lib.rank.am.includes(button.link)) {
				rarity = 6;
			} else if (lib.rank.b.includes(button.link)) {
				rarity = 4;
			} else if (lib.rank.a.includes(button.link)) {
				rarity = 7;
			} else if (lib.rank.bm.includes(button.link)) {
				rarity = 3;
			} else if (lib.rank.ap.includes(button.link)) {
				rarity = 8;
			} else if (lib.rank.c.includes(button.link)) {
				rarity = 2;
			} else if (lib.rank.s.includes(button.link)) {
				rarity = 9;
			} else if (lib.rank.d.includes(button.link)) {
				rarity = 1;
			} else if (configType === 'r' || configType === 'g' || configType === 'z') {
				if (lib.rank.rarity.rare.includes(button.link)) {
					five = 3;
				} else if (lib.rank.rarity.epic.includes(button.link)) {
					five = 4;
				} else if (lib.rank.rarity.legend.includes(button.link)) {
					five = 5;
				} else if (lib.rank.rarity.junk.includes(button.link)) {
					five = 1;
				} else {
					five = 2;
				}
			} else if (lib.rank.rarity.legend.includes(button.link)) {
				rarity = 9;
			} else {
				// 使用提取的通用样式
				Object.assign(intro.style, commonIntroStyle);
				intro.style.fontFamily = 'shousha';
				intro.dataset.nature = 'graym';
				intro.innerHTML = '未知';
				return;
			}

			if (!five) {
				five = Math.ceil(rarity / 2);
			}

			if (config[0] === 't') {
				intro.classList.add('rarity');
				if (intro.innerText) {
					intro.innerText = '';
				}
				intro.style.left = '20px';
				intro.style.bottom = '6px';
				intro.style.width = '45px';
				intro.style.height = '45px';
				intro.style.backgroundSize = '100% 100%';
				intro.style.backgroundImage = `url("${lib.assetURL}extension/AI优化/img/rarity/${configType}/${
					configType === 'q' ? rarity : five
				}.png")`;
				return;
			}

			// 使用提取的通用样式
			Object.assign(intro.style, commonIntroStyle);

			// 设置字体颜色
			if (five === 3) {
				intro.dataset.nature = 'thunderm';
			} else if (five === 2) {
				intro.dataset.nature = 'waterm';
			} else if (five === 4) {
				intro.dataset.nature = 'metalm';
			} else if (five === 1) {
				intro.dataset.nature = 'woodm';
			} else {
				intro.dataset.nature = 'orangem';
			}

			// 根据配置类型设置文本
			if (configType === 'r') {
				intro.style.fontFamily = 'yuanli';
				if (five === 3) {
					intro.innerHTML = '稀有';
				} else if (five === 2) {
					intro.innerHTML = '普通';
				} else if (five === 4) {
					intro.innerHTML = '史诗';
				} else if (five === 1) {
					intro.innerHTML = '平凡';
				} else {
					intro.innerHTML = '传说';
				}
			} else if (configType === 'x') {
				intro.style.fontFamily = 'xingkai';
				intro.innerHTML = get.cnNumber(rarity, true);
			} else if (configType === 'd') {
				intro.style.fontFamily = 'xingkai';
				const rarityTextMap = {
					5: '伍',
					4: '肆',
					6: '陆',
					7: '柒',
					8: '捌',
					3: '叁',
					2: '贰',
					9: '玖',
					1: '壹',
				};
				intro.innerHTML = rarityTextMap[rarity] || '壹';
			} else if (configType === 'p') {
				const pin = ['下', '中', '上'];
				intro.style.fontFamily = 'xingkai';
				rarity--; // 先减1再计算
				intro.innerHTML = pin[Math.floor(rarity / 3)] + pin[rarity % 3];
			}
		};
	}

	lib.skill._aiyh_firstKs = {
		available(mode) {
			if (_status.connectMode && !game.me) {
				return;
			}
			const configs = ['neiKey', 'findZhong', 'mjAi'];
			let obj = {};
			for (let name of configs) {
				obj[name] = lib.config[`extension_AI优化_${name}`];
			}
			game.broadcastAll((obj) => {
				lib.skill._aiyh_firstKs.toLoad(obj);
			}, obj);
		},
		toLoad(configs) {
			if (!_status.postReconnect.aiyh_configs) {
				_status.postReconnect.aiyh_configs = [lib.skill._aiyh_firstKs.toLoad, { ...configs }];
			}
			if (!_status.aiyh_configs) {
				_status.aiyh_configs = {};
			}
			for (let name in configs) {
				_status.postReconnect.aiyh_configs[1][name] = configs[name];
				_status.aiyh_configs[name] = configs[name];
			}
		},
		trigger: { global: 'gameStart' },
		silent: true,
		unique: true,
		firstDo: true,
		charlotte: true,
		superCharlotte: true,
		async content(event, trigger, player) {
			if (!_status.aiyh_firstDo) {
				_status.aiyh_firstDo = true;
				const updateSkillThreaten = (skillId, value) => {
					if (!value) {
						return;
					}
					// 更新技能威胁度
					if (!lib.skill[skillId]) {
						lib.skill[skillId] = { ai: { threaten: value } };
					} else if (!lib.skill[skillId].ai) {
						lib.skill[skillId].ai = { threaten: value };
					} else {
						lib.skill[skillId].ai.threaten = value;
					}
				};
				// 配置技能威胁度
				for (const skillId in lib.config.extension_AI优化_cf) {
					updateSkillThreaten(skillId, lib.config.extension_AI优化_cf[skillId]);
				}
				// 自动补充技能威胁度
				const processMode = lib.config.extension_AI优化_applyCf;
				if (processMode === 'pj' || processMode === 'pz') {
					const list = _status.connectMode ? get.charactersOL() : get.gainableCharacters();
					for (const charId of list) {
						const charInfo = lib.character[charId];
						if (!charInfo || charInfo.length < 4) {
							continue;
						}

						// 设置稀有度权重
						let allValue;
						if (processMode === 'pj') {
							// 根据评级补充
							const { rank } = lib;
							if (rank.bp.includes(charId)) {
								allValue = 1.4;
							} else if (rank.am.includes(charId)) {
								allValue = 1.8;
							} else if (rank.b.includes(charId)) {
								allValue = 1.2;
							} else if (rank.a.includes(charId)) {
								allValue = 2.4;
							} else if (rank.bm.includes(charId)) {
								// 跳过该角色
								continue;
							} else if (rank.ap.includes(charId)) {
								allValue = 2.7;
							} else if (rank.c.includes(charId)) {
								allValue = 0.8;
							} else if (rank.s.includes(charId)) {
								allValue = 3.2;
							} else if (rank.d.includes(charId)) {
								allValue = 0.6;
							} else {
								continue;
							}
						} else {
							// 根据品质补充
							const rarity = game.getRarity(charId);
							if (rarity === 'rare') {
								allValue = 1.2;
							} else if (rarity === 'epic') {
								allValue = 1.8;
							} else if (rarity === 'legend') {
								allValue = 2.4;
							} else if (rarity === 'junk') {
								allValue = 0.8;
							} else {
								continue;
							}
						}

						// 处理角色技能
						const skills = charInfo[3].filter((skillId) => !lib.skill[skillId]?.juexingji);

						if (skills.length > 0) {
							const baseThreat = Math.pow(allValue, 1 / skills.length);
							for (const skillId of skills) {
								const skill = lib.skill[skillId];
								// 仅在威胁度未定义时设置
								if (!skill?.ai?.threaten) {
									const finalThreat = skill?.ai?.maixie_defend ? 0.8 * baseThreat : baseThreat;
									updateSkillThreaten(skillId, finalThreat);
								}
							}
						}
					}
				}
			}

			player.addSkill('aiyh_gjcx_qj');

			// 身份局专属AI
			if (get.mode() === 'identity' && lib.config.extension_AI优化_sfjAi && !['zhong', 'purple'].includes(_status.mode)) {
				if (player.identity === 'nei') {
					player.addSkill(['gjcx_neiAi', 'gjcx_neiAi_expose', 'gjcx_neiAi_damage']);
				}
				if (player === game.zhu) {
					player.addSkill('gjcx_zhuAi');
				}
			}
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (!lib.config.extension_AI优化_qzCf || get.itemtype(target) !== 'player') {
						return;
					}
					let base1 = 1;
					if (typeof lib.aiyh.qz[target.name] === 'number') {
						base1 = lib.aiyh.qz[target.name];
					} else if (typeof lib.config.extension_AI优化_qz[target.name] === 'number') {
						base1 = lib.config.extension_AI优化_qz[target.name];
					}
					if (target.name2 === undefined) {
						return base1;
					}
					if (typeof lib.aiyh.qz[target.name2] === 'number') {
						return base1 + lib.aiyh.qz[target.name2];
					}
					if (typeof lib.config.extension_AI优化_qz[target.name2] === 'number') {
						return base1 + lib.config.extension_AI优化_qz[target.name2];
					}
					return base1;
				},
			},
		},
	};

	/*功能*/
	// AI不砍队友
	lib.skill._aiyh_nhFriends = {
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
					) {
						return;
					}
					if (
						get.tag(card, 'damage') &&
						card.name !== 'huogong' &&
						(!lib.config.extension_AI优化_ntAoe || get.info(card)?.selectTarget !== -1) &&
						get.attitude(player, target) > 0
					) {
						let num = 0;
						if (lib.config.extension_AI优化_nhFriends === 'ph') num = player.hp;
						else num = parseInt(lib.config.extension_AI优化_nhFriends);
						if (target.hp > num) {
							return;
						}
						player._nhFriends_temp = true;
						let eff = get.effect(target, card, player, player);
						delete player._nhFriends_temp;
						if (eff > 0) {
							return [1, 0, 1, -1 - eff];
						}
					}
				},
			},
		},
	};
	// 开局功能
	lib.skill._aiyh_meks = {
		trigger: {
			global: ['gameStart', 'showCharacterEnd'],
		},
		filter(event, player) {
			return !_status.connectMode && player === game.me;
		},
		silent: true,
		unique: true,
		priority: 157,
		charlotte: true,
		superCharlotte: true,
		async adjustValue(params) {
			// 通用数值调整方法
			const { config, configKey, target, defaultValue, prompt, hint, actionLabels = [] } = params;

			const steps = {
				'+1': 1,
				'+0.1': 0.1,
				'+0.01': 0.01,
				'-1': -1,
				'-0.1': -0.1,
				'-0.01': -0.01,
			};

			let value = config[target] || defaultValue;

			while (true) {
				const roundedValue = Math.round(value * 100) / 100;
				const options = ['+1', '+0.1', '+0.01'];

				if (roundedValue > 1) {
					options.push('-1');
				}
				if (roundedValue > 0.1) {
					options.push('-0.1');
				}
				if (roundedValue > 0.01) {
					options.push('-0.01');
				}

				options.push(...actionLabels);

				const action = await game.me
					.chooseControl(options)
					.set('prompt', prompt.replace('{value}', roundedValue))
					.set('prompt2', hint)
					.set('ai', () => actionLabels[0])
					.forResultControl();

				switch (action) {
					case actionLabels[1]: // 确认操作
						config[target] = value;
						game.saveExtensionConfig('AI优化', configKey, config);
						return;
					case actionLabels[0]: // 暂不操作
						delete config[target];
						game.saveExtensionConfig('AI优化', configKey, config);
						return;
					default:
						value += steps[action];
				}
			}
		},
		async content() {
			const qzConfig = lib.config.extension_AI优化_qz;
			const cfConfig = lib.config.extension_AI优化_cf;

			if (lib.config.extension_AI优化_applyQz) {
				// 开局补充武将权重
				const namesSet = new Set();
				game.countPlayer2((current) => {
					if (current.name !== 'unknown') namesSet.add(current.name);
					if (current.name2 && current.name2 !== 'unknown') namesSet.add(current.name2);
				});

				for (const name of namesSet) {
					await lib.skill._aiyh_meks.adjustValue({
						config: qzConfig,
						configKey: 'qz',
						target: name,
						defaultValue: 1,
						prompt: `${get.translation(name)}的权重：<span style="color: #FFFF00">{value}</span>`,
						hint: '该值将作为内奸AI判断角色实力的首选',
						actionLabels: ['暂不设置', '设置'],
					});
				}
			}

			if (lib.config.extension_AI优化_applyCf === 'sd') {
				// 开局补充技能嘲讽
				const targets = game.filterPlayer2();
				for (const target of targets) {
					const skills = target
						.getSkills(null, false, false)
						.filter((skill) => lib.translate[skill] && !lib.skill[skill]?.ai?.threaten);
					for (const skill of skills) {
						await lib.skill._aiyh_meks.adjustValue({
							config: cfConfig,
							configKey: 'cf',
							target: skill,
							character: target,
							defaultValue: 1,
							prompt: `<span style="color: #00FFFF">${get.translation(
								target
							)}</span>的【<span style="color: #FFFF00">${get.translation(
								skill
							)}</span>】：当前为<span style="color: #00FFFF">{value}</span>`,
							hint: `技能ID：${skill}${
								target.tempSkills[skill] ? '&nbsp;&nbsp;&nbsp;<span style="color: #FF3300">这是一项临时技能</span>' : ''
							}<br />${lib.translate[skill + '_info'] || '暂无技能描述'}`,
							actionLabels: ['暂不处理', '确认修改'],
						});
					}
				}
			}
		},
	};
	// 内奸可亮明身份
	lib.skill._aiyh_neiKey = {
		mode: ['identity'],
		enable: 'phaseUse',
		filter(event, player) {
			if (player.identity !== 'nei' || player.storage.neiKey) return false;
			if (player.identityShown) return _status.aiyh_configs.neiKey === 'must';
			return _status.aiyh_configs.neiKey !== 'off';
		},
		log: false,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		ruleSkill: true,
		async content(event, trigger, player) {
			player.storage.neiKey = true;
			game.log(player, '亮明了身份');
			game.broadcastAll((player) => {
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
						!game.hasPlayer((current) => {
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
						!game.hasPlayer((current) => {
							return current.identity === 'zhong' || current.identity === 'mingzhong';
						}) ||
						(player.hp <= 1 && !player.countCards('hs', 'tao') && !player.countCards('hs', 'jiu'))
					) {
						return 1;
					}
					if (
						!game.hasPlayer((current) => {
							return current.identity === 'fan';
						})
					) {
						if (get.attitude(game.zhu, player) < -1 || (get.attitude(game.zhu, player) < 0 && player.ai.shown >= 0.95)) {
							return 1;
						}
						return -3;
					}
					if (
						(!player.hasSkill('gjcx_neiZhong') &&
							!player.hasSkill('gjcx_neiJiang') &&
							((player.hp <= 2 && game.zhu.hp <= 2) || (game.zhu.isHealthy() && lib.config.extension_AI优化_sfjAi))) ||
						(game.zhu.hp <= 1 &&
							!player.countCards('hs', 'tao') &&
							(player.hasSkill('gjcx_neiZhong') || !lib.config.extension_AI优化_sfjAi))
					) {
						return 1;
					}
					return -3;
				},
			},
		},
	};
	lib.skill._aiyh_fixQz = {
		// 修改武将权重
		enable: 'phaseUse',
		filter(event, player) {
			return !_status.connectMode && player === game.me && lib.config.extension_AI优化_fixQz;
		},
		filterTarget(card, player, target) {
			return target.name !== 'unknown' || (target.name2 !== undefined && target.name2 !== 'unknown');
		},
		prompt: '修改一名角色一张武将牌的权重',
		log: false,
		charlotte: true,
		superCharlotte: true,
		async content(event, trigger, player) {
			const qzConfig = lib.config.extension_AI优化_qz;

			// 获取可选武将名称
			const names = [];
			if (event.target.name !== 'unknown') names.push(event.target.name);
			if (event.target.name2 && event.target.name2 !== 'unknown') names.push(event.target.name2);

			// 选择要修改的武将
			let selectedName;
			if (names.length > 1) {
				const options = names.map((name) => get.translation(name));
				const result = await player
					.chooseControl(options)
					.set('prompt', '请选择要修改权重的武将')
					.set('ai', () => 0)
					.forResult();
				selectedName = names[result.index];
			} else {
				selectedName = names[0];
			}

			// 初始化权值
			let qz = qzConfig[selectedName] ?? 1;
			// 权值调整步进值
			const steps = { '+1': 1, '+0.1': 0.1, '+0.01': 0.01, '-1': -1, '-0.1': -0.1, '-0.01': -0.01 };

			while (true) {
				// 生成操作选项
				qz = Math.round(qz * 100) / 100;
				const options = ['+1', '+0.1', '+0.01'];
				if (qz > 1) options.push('-1');
				if (qz > 0.1) options.push('-0.1');
				if (qz > 0.01) options.push('-0.01');
				options.push('删除此记录', '确认修改');

				// 获取用户操作
				const action = await player
					.chooseControl(options)
					.set('prompt', `${get.translation(selectedName)}的权重：<span style="color: #FFFF00">${qz}</span>`)
					.set('prompt2', `武将ID：${selectedName}<br />该值将作为内奸AI判断角色实力的首选`)
					.set('ai', () => '确认修改')
					.forResultControl();

				switch (action) {
					case '确认修改':
						qzConfig[selectedName] = qz;
						game.saveExtensionConfig('AI优化', 'qz', qzConfig);
						return;
					case '删除此记录':
						delete qzConfig[selectedName];
						game.saveExtensionConfig('AI优化', 'qz', qzConfig);
						return;
					default:
						qz += steps[action];
				}
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
			return !_status.connectMode && player === game.me && lib.config.extension_AI优化_fixCf;
		},
		filterTarget: true,
		prompt: '修改一名角色当前拥有的一项技能的威胁度',
		log: false,
		charlotte: true,
		superCharlotte: true,
		async content(event, trigger, player) {
			const target = event.target;
			const cfConfig = lib.config.extension_AI优化_cf;

			// 获取有翻译的技能列表
			const skills = target.getSkills(null, false, false);

			if (skills.length === 0) return;

			// 创建技能信息对象数组
			const skillInfos = skills.map((skill) => {
				const info = lib.skill[skill] || { ai: { threaten: 1 } };
				const threaten = typeof info.ai?.threaten === 'number' ? info.ai.threaten : 1;

				return {
					skill,
					threaten,
					name: lib.translate[skill],
					description: lib.translate[skill + '_info'] || '暂无技能描述',
				};
			});

			// 选择要修改的技能
			let selectedSkill;
			if (skillInfos.length > 1) {
				const options = skillInfos.map(
					(info) =>
						ui.joint`
							<span style="color: #00FF00">${info.name}</span> | <span style="color: #FFFF00">${info.skill}</span>
								：${info.threaten}
						`
				);

				const choice = await player
					.chooseControl(options)
					.set('prompt', '请选择要修改威胁度的技能')
					.set('ai', () => 0)
					.forResult();

				selectedSkill = skillInfos[choice];
			} else {
				selectedSkill = skillInfos[0];
			}

			// 设置默认值
			let th = selectedSkill.threaten;
			const steps = {
				'+1': 1,
				'+0.1': 0.1,
				'+0.01': 0.01,
				'-1': -1,
				'-0.1': -0.1,
				'-0.01': -0.01,
			};

			// 构建技能信息字符串
			const tempSkillWarning = target.tempSkills[selectedSkill.skill]
				? '<span style="color: #FF3300">这是一项临时技能</span><br />'
				: '';

			const skillDesc = `${tempSkillWarning}${selectedSkill.description}`;

			while (true) {
				const roundedTh = Math.round(th * 100) / 100;

				const options = ['+1', '+0.1', '+0.01'];
				if (roundedTh > 1) options.push('-1');
				if (roundedTh > 0.1) options.push('-0.1');
				if (roundedTh > 0.01) options.push('-0.01');
				options.push('删除此记录', '确认修改');

				const action = await player
					.chooseControl(options)
					.set(
						'prompt',
						`${selectedSkill.name}（${get.translation(target)}）：当前为<span style="color: #00FFFF">${roundedTh}</span>`
					)
					.set('prompt2', `技能ID：${selectedSkill.skill}<br />${skillDesc}`)
					.set('ai', () => '确认修改')
					.forResultControl();

				switch (action) {
					case '确认修改':
						cfConfig[selectedSkill.skill] = th;
						game.saveExtensionConfig('AI优化', 'cf', cfConfig);
						return;
					case '删除此记录':
						delete cfConfig[selectedSkill.skill];
						game.saveExtensionConfig('AI优化', 'cf', cfConfig);
						return;
					default:
						th += steps[action];
				}
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
				_status.aiyh_configs.findZhong &&
				game.countPlayer((current) => {
					return current.identity === 'zhong';
				})
			);
		},
		async content(event, trigger, player) {
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
			} else {
				await player.chooseControl('ok').set('dialog', [get.translation(target) + '是忠臣', [[target.name], 'character']]);
			}
		},
	};
	lib.skill._mjAiSkill = {
		//盲狙AI
		trigger: { player: 'phaseZhunbeiBegin' },
		filter(event, player) {
			return _status.aiyh_configs.mjAi && player.phaseNumber === 1 && (player === game.zhu || player.identity === 'zhong');
		},
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		mode: ['identity'],
		async content(event, trigger, player) {
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
						// const known = par.player.getKnownCards(player);
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
			async content(event, trigger, player) {
				const target = game.findPlayer((current) => {
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
							) {
								return [1, 0.8];
							}
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
			init() {
				game.countPlayer((current) => {
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
					!game.hasPlayer((current) => {
						return current.identity === 'fan';
					})
				) {
					player.removeSkill('gjcx_neiAi_damage');
					player.addSkill('gjcx_neiAi_nojump');
					end = true;
				}
				if (end) return;
				let zs = game.filterPlayer((current) => {
					return current.identity === 'zhu' || current.identity === 'zhong' || current.identity === 'mingzhong';
				});
				let fs = game.filterPlayer((current) => {
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
					async content() {
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
					async content(event, trigger, player) {
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
					async content(event, trigger, player) {
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
									game.hasPlayer((current) => {
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
			// 联合ai
			mode: ['identity'],
			locked: true,
			unique: true,
			forceDie: true,
			charlotte: true,
			superCharlotte: true,
			ai: {
				effect: {
					player(card, player, target) {
						if (
							typeof card !== 'object' ||
							get.itemtype(target) !== 'player' ||
							target.ai.shown < 0.95 ||
							player === target
						) {
							return 1;
						}
						if (
							target.identity === 'nei' &&
							!player.getFriends().length &&
							(player.identity === 'fan' || player === game.zhu) &&
							game.countPlayer((current) => {
								let num = 1;
								if (typeof lib.aiyh.qz[current.name] === 'number') {
									num = lib.aiyh.qz[current.name];
								} else if (typeof lib.config.extension_AI优化_qz[current.name] === 'number') {
									num = lib.config.extension_AI优化_qz[current.name];
								}
								if (current.name2 !== undefined) {
									if (typeof lib.aiyh.qz[current.name2] === 'number') {
										num = (num + lib.aiyh.qz[current.name2]) / 2;
									} else if (typeof lib.config.extension_AI优化_qz[current.name2] === 'number') {
										num = (num + lib.config.extension_AI优化_qz[current.name2]) / 2;
									}
								}
								if (current.isTurnedOver()) num -= 0.28;
								if (current.storage.gjcx_neiAi && current.storage.gjcx_neiAi !== current.maxHp) {
									if (current.maxHp > current.storage.gjcx_neiAi) {
										if (current.hp > current.storage.gjcx_neiAi) {
											num *= ((1 + (current.maxHp - current.storage.gjcx_neiAi) / 10) * current.hp) / current.maxHp;
										} else {
											num *= current.hp / current.storage.gjcx_neiAi;
										}
									} else {
										num *= current.hp / Math.min(5, current.storage.gjcx_neiAi);
									}
								} else {
									num *= current.hp / current.maxHp;
								}
								num += current.countCards('hes') * 0.1 - current.countCards('j') * 0.16;
								if (current === player) {
									return -2 * num;
								}
								if (current.identity === 'nei') {
									return -num;
								}
								return num;
							}) > 0
						) {
							if (get.tag(card, 'damage')) {
								return [1, -2];
							}
							if (get.name(card) === 'tao' && player.hp > 1 && player.countCards('hs', 'tao') + target.hp > 0) {
								return [1, 2];
							}
						}
					},
				},
			},
		};
	}
}
