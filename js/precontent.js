import { lib, game, ui, get, ai, _status } from './utils.js';

export function precontent(config, pack) {
	// 非常感谢@柚子丶奶茶丶猫以及面具 提供的『云将』相关部分AI优化的修复代码
	{
		// 本体版本检测
		let noname = lib.version
				.split('.')
				.slice(2)
				.map((i) => Number(i)),
			min = [17],
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
						<span style="color: #FFFF00">2025</span>年
						<span style="color: #00FFB0">11</span>月
						<span style="color: rgb(255, 146, 68)">30</span>日
					</div>
				`,
				'非常感谢@一寒 贡献的代码，本次更新仅作整理修复',
				'◆修复身份局AI中的大量错误',
				'◆修复AI强化〔置换〕发动概率错误',
				'◆修正AI强化〔泣血〕〔破甲〕描述错误和发动提示',
				'◆调整部分显示内容',
				'※本扩展无限期停更，任何人均可二创修复',
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
			if (lib.config.extension_AI优化_qjAi) {
				player.addSkill('aiyh_gjcx_qj');
			}

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
							<div class="skill" style="color: #00FF00">${info.name}</div><div>${info.threaten} [<span style="color: #FFFF00">${info.skill}</span>]</div>
						`
				);

				const choice = await player
					.chooseControl(skillInfos.map((info) => info.name))
					.set('prompt', '请选择要修改威胁度的技能')
					.set('choiceList', options)
					.set('displayIndex', false)
					.set('ai', () => 0)
					.forResult();

				selectedSkill = skillInfos[choice.index];
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
			ai: {
				effect: {
					player(card, ai, target) {
						if (target !== game.me || !ai.storage.enemyHandData || !lib.config.extension_AI优化_aiFuhui) return;
						const hand = ai.storage.enemyHandData;
						const cardName = get.name(card, ai);
						const playerHandSuits = hand.suits || {};
						const playerHandNums = hand.numbers || {};
						const playerEquips = hand.equips || {};

						// 火攻花色判断
						if (cardName === 'huogong') {
							const aiSuits = new Set(ai.getCards('h').map((c) => get.suit(c)));
							const requiredSuits = Object.keys(playerHandSuits).filter((s) => playerHandSuits[s] > 0);
							const matchedSuits = requiredSuits.filter((s) => aiSuits.has(s));
							if (matchedSuits.length < Math.ceil(requiredSuits.length / 2)) {
								return [1, -3];
							}
						}

						// 拼点策略
						if (ai.hasSkill('compare') && cardName === 'compare') {
							const playerMaxNum = Math.max(...(Object.values(playerHandNums) || [0]));
							const aiMaxNum = Math.max(...ai.getCards('h').map((c) => get.number(c) || 0));
							if (aiMaxNum > playerMaxNum) {
								return [1, 2];
							}
						}

						// 基础牌应对逻辑
						if (cardName === 'sha' && hand.shan > 1) return [1, -2];
						if ((cardName === 'sha' && ai.hasCard('jiu', 'h')) || cardName === 'wanjian') {
							if (hand.shan === 0) return [1, 2];
						}
						if ((cardName === 'nanman' || cardName === 'juedou') && hand.sha === 0) {
							return [1, 2];
						}
						if (['guohe', 'shunshou', 'wanjian', 'nanman'].includes(cardName) && hand.wuxie > 0) {
							return [1, -1];
						}

						// 玩家装备应对逻辑：八卦阵
						if (playerEquips.bagua) {
							if (cardName === 'sha') return [1, -3]; // 降低杀优先级
							if (['shunshou', 'guohe'].includes(cardName)) return [1, 2]; // 提高拆牌优先级
						}

						// 玩家装备应对逻辑：仁王盾
						if (playerEquips.renwang) {
							if (cardName === 'sha' && get.color(card) === 'black') return [1, -3]; // 黑杀优先级降低
							if (cardName === 'sha' && get.color(card) === 'red') return [1, 1.5]; // 红杀优先级提高
							if (['shunshou', 'guohe'].includes(cardName)) return [1, 2]; // 提高拆牌优先级
						}

						// 玩家装备应对逻辑：藤甲
						if (playerEquips.tengjia) {
							if (cardName === 'sha') {
								const nature = get.natureList(card);
								if (nature.includes('fire')) return [1, 2]; // 火杀优先级提高
								else return [1, -2]; // 普通杀优先级降低
							}
							if (['shunshou', 'guohe'].includes(cardName)) return [1, 2]; // 提高拆牌优先级
						}
					},
					discard(card, ai) {
						if (!ai.storage.enemyHandData || !lib.config.extension_AI优化_aiFuhui) return;
						const hand = ai.storage.enemyHandData;
						const cardName = get.name(card, ai);

						// 玩家有酒→AI必留1张闪
						if (hand.jiu > 0 && cardName === 'shan') {
							const shanCount = ai.countCards('h', (c) => get.name(c, ai) === 'shan');
							if (shanCount <= 1) return [1, -10];
						}

						// 玩家有无懈→AI必留1张无懈
						if (hand.wuxie > 0 && cardName === 'wuxie') {
							const wuxieCount = ai.countCards('h', (c) => get.name(c, ai) === 'wuxie');
							if (wuxieCount <= 1) return [1, -10];
						}

						// 玩家有装备→AI保留拆牌
						const playerEquips = hand.equips || {};
						if (Object.keys(playerEquips).length > 0 && ['shunshou', 'guohe'].includes(cardName)) {
							const cardCount = ai.countCards('h', (c) => ['shunshou', 'guohe'].includes(get.name(c, ai)));
							if (cardCount <= 1) return [1, -10];
						}
					},
					equip(card, ai) {
						if (!ai.storage.enemyHandData || !lib.config.extension_AI优化_aiFuhui) return;
						const hand = ai.storage.enemyHandData;
						if (hand.guohe > 0 || hand.shunshou > 0) return [1, -5];
					},
				},
			},
			charlotte: true,
			superCharlotte: true,
		};
		// 防酒杀AI
		lib.skill._aiyh_reserved_shan = {
			silent: true,
			locked: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			ai: {
				effect: {
					player: (card, player, target) => {
						if (typeof card !== 'object' || player.hp <= 1 || get.name(card, player) !== 'shan') return;
						const par = _status.event.getParent(2);
						if (par && par.player.hasCard('jiu', 'h') && player.mayHaveSha(player, 'use')) {
							return 'zeroplayertarget';
						}
					},
				},
			},
		};
	}

	if (lib.config.extension_AI优化_sfjAi) {
		// 身份局AI
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

		lib.skill._aiyh_skillReleaseFilter = {
			mode: ['identity'],
			trigger: { global: 'gameStart' },
			filter(event, player) {
				return !_status.connectMode && get.mode() === 'identity';
			},
			silent: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			async content(event, trigger, player) {
				const ignoreSkills = lib.config.extension_AI优化_aiSkillReleaseOpt || [];
				_status.aiyh_ignoreSkills = ignoreSkills;
				_status.aiyh_ignoreSkillCharMap = {};
				ignoreSkills.forEach((skillId) => {
					_status.aiyh_ignoreSkillCharMap[skillId] = game
						.filterPlayer((p) => p.isIn() && p.getSkills(null, false, false).includes(skillId))
						.map((p) => ({
							charId: p.name || p.name2,
							charName: get.translation(p),
						}));
				});
				if (lib.config.extension_AI优化_devToolMutualFigh) {
					let logText = '〔AI释放优化〕';
					if (ignoreSkills.length === 0) {
						logText += '未配置优化技能';
					} else {
						logText += '已配置优化技能：';
						ignoreSkills.forEach((skillId) => {
							const chars = _status.aiyh_ignoreSkillCharMap[skillId];
							const charInfo = chars.length
								? `（武将ID：${chars.map((c) => c.charId).join('、')}，武将名：${chars
										.map((c) => c.charName)
										.join('、')}）`
								: '（无场上武将拥有该技能）';
							logText += `${skillId}${charInfo}、`;
						});
						logText = logText.slice(0, -1); // 去除tmn
					}
					game.log('系统', `<span style="color:#00FFFF">${logText}</span>`);
				}
			},
		};

		lib.skill._aiyh_cooperateCheck = {
			mode: ['identity'],
			trigger: { player: 'useCardBegin' },
			filter(event, player) {
				return player !== game.me && lib.config.extension_AI优化_sfjAi && !_status.connectMode;
			},
			silent: true,
			unique: true,
			priority: 2000,
			charlotte: true,
			superCharlotte: true,
			async content(event, trigger, ai) {
				const ignoreSkills = _status.aiyh_ignoreSkills || [];
				const aiSkills = ai.getSkills(null, false, false);
				const aiHasIgnoreSkill = aiSkills.some((skill) => ignoreSkills.includes(skill));
				if (aiHasIgnoreSkill) {
					if (lib.config.extension_AI优化_devToolMutualFigh) {
						game.log(
							ai,
							`<span style="color:#FF3300">〔AI配合检测跳过〕当前武将${get.translation(
								ai
							)}拥有配置优化技能，自身跳过配合检测</span>`
						);
					}
					return;
				}

				ai.storage.cooperateTarget = null;
				const cooperateRules = lib.config.extension_AI优化_aiCooperateSkill || [];
				const debugMode = lib.config.extension_AI优化_devToolMutualFigh;
				const aiIdentity = ai.identity;
				const allies = game.filterPlayer(
					(p) =>
						p.isIn() &&
						p !== ai &&
						((aiIdentity === 'zhu' && p.identity === 'zhong') ||
							(aiIdentity === 'zhong' && (p.identity === 'zhu' || p.identity === 'zhong')) ||
							(aiIdentity === 'fan' && p.identity === 'fan') ||
							(aiIdentity === 'nei' && p.identity === 'nei'))
				);

				if (debugMode) {
					const allyNames = allies.map((p) => `${get.translation(p)}${p === game.me ? '(玩家)' : ''}`).join('、');
					game.log(ai, `<span style="color:#00FFFF">〔己方盟友〕共${allies.length}人：${allyNames || '无'}</span>`);
					game.log(ai, `<span style="color:#00FFFF">〔当前配合规则〕${JSON.stringify(cooperateRules)}</span>`);
				}

				if (allies.length === 0) return;

				const isTargetMeetSingleCond = (target, cond) => {
					if (cond === 'none') return true;
					if (['diamond', 'heart', 'spade', 'club'].includes(cond)) {
						return target.countCards('h', (c) => get.suit(c) === cond) > 0;
					}
					if (['bagua', 'qinggang', 'tengjia', 'renwang'].includes(cond)) {
						const equips = target.getEquips();
						return equips.some((equip) => get.name(equip, target) === cond || equip.type === cond);
					}
					return target.countCards('h', (c) => get.name(c, target) === cond) > 0;
				};

				let hasValidCooperate = false;
				for (const rule of cooperateRules) {
					const [skillId, selfCond, targetCondStr] = rule.split('/').map((item) => item.trim());
					if (aiSkills.includes(skillId) && ignoreSkills.includes(skillId)) {
						if (debugMode)
							game.log(
								ai,
								`<span style="color:#FF3300">〔规则跳过〕当前武将拥有配置优化技能${skillId}，跳过该配合规则</span>`
							);
						continue;
					}
					if (!skillId || !selfCond || !targetCondStr) {
						if (debugMode) game.log(ai, `<span style="color:#FF3300">〔规则无效〕格式错误：${rule}</span>`);
						continue;
					}
					const targetConds = targetCondStr.split('*');

					let selfMeet = false;
					if (selfCond === 'none') selfMeet = true;
					else if (['diamond', 'heart', 'spade', 'club'].includes(selfCond)) {
						selfMeet = ai.countCards('h', (c) => get.suit(c) === selfCond) > 0;
					} else {
						selfMeet = ai.countCards('h', (c) => get.name(c, ai) === selfCond) > 0;
					}
					if (!selfMeet) {
						if (debugMode)
							game.log(ai, `<span style="color:#FF3300">〔自身不满足〕技能${skillId}：需${selfCond}，当前无</span>`);
						continue;
					}
					for (const ally of allies) {
						const allSkills = ally.getSkills(null, false, false);
						const hasTargetSkill = allSkills.includes(skillId);
						if (!hasTargetSkill) continue;

						const targetMeet = targetConds.some((cond) => isTargetMeetSingleCond(ally, cond));
						const metConds = targetConds.filter((cond) => isTargetMeetSingleCond(ally, cond));
						const skillName = lib.translate[skillId] || skillId;
						const aiName = get.translation(ai);
						const allyTag = ally === game.me ? '(玩家)' : '';
						const allyName = get.translation(ally) + allyTag;

						if (targetMeet) {
							hasValidCooperate = true;
							ai.storage.cooperateTarget = ally;
							if (debugMode) {
								game.log(
									ai,
									`<span style="color:#00FF00">〔配合成功〕${aiName}→${allyName}（${skillName}）：自身有${selfCond}，目标满足${metConds.join(
										'或'
									)}</span>`
								);
							}
							break;
						} else {
							if (debugMode) {
								game.log(
									ai,
									`<span style="color:#FF3300">〔配合失败〕${aiName}→${allyName}（${skillName}）：目标不满足${targetConds.join(
										'或'
									)}</span>`
								);
							}
						}
					}
					if (hasValidCooperate) break;
				}

				if (!hasValidCooperate && debugMode) {
					game.log(ai, `<span style="color:#FFFF00">〔AI配合检测〕无满足条件的配合目标</span>`);
				}
			},
		};

		lib.skill._aiyh_sfjSmartAi = {
			mode: ['identity'],
			trigger: { player: 'useCardBegin' },
			filter(event, player) {
				return player !== game.me && get.mode() === 'identity' && lib.config.extension_AI优化_sfjAi && !_status.connectMode;
			},
			silent: true,
			unique: true,
			priority: 1900,
			charlotte: true,
			superCharlotte: true,
			async content(event, trigger, ai) {
				const ignoreSkills = _status.aiyh_ignoreSkills || [];
				const aiSkills = ai.getSkills(null, false, false);
				const aiHasIgnoreSkill = aiSkills.some((skill) => ignoreSkills.includes(skill));
				if (aiHasIgnoreSkill) {
					if (lib.config.extension_AI优化_devToolMutualFigh) {
						game.log(
							ai,
							`<span style="color:#FF3300">〔权重判断跳过〕当前武将${get.translation(
								ai
							)}拥有配置优化技能，自身跳过权重目标排序</span>`
						);
					}
					return;
				}

				ai.storage.attackPriority = [];
				const globalZhu = game.filterPlayer((p) => p.identity === 'zhu')[0];
				const globalZhong = game.filterPlayer((p) => p.identity === 'zhong');
				const globalFan = game.filterPlayer((p) => p.identity === 'fan');
				const globalNei = game.filterPlayer((p) => p.identity === 'nei');
				const allies = game.filterPlayer(
					(p) =>
						p.isIn() &&
						p !== ai &&
						((ai.identity === 'zhu' && globalZhong.includes(p)) ||
							(ai.identity === 'zhong' && p === globalZhu) ||
							(ai.identity === 'fan' && globalFan.includes(p)) ||
							(ai.identity === 'nei' && p.identity === 'nei'))
				);

				const alivePlayers = game.filterPlayer((p) => p.isIn());

				alivePlayers.forEach((target) => {
					if (target === ai) return;

					const targetIdentity = target.identity;
					const targetHp = target.hp;
					const targetHandCount = target.countCards('h');
					const targetEquipCount = target.countCards('e');
					let basePriority = 0;
					const isAlly = allies.includes(target);
					const isEnemy =
						((ai.identity === 'zhu' || ai.identity === 'zhong') && globalFan.includes(target)) ||
						(ai.identity === 'fan' && (target === globalZhu || globalZhong.includes(target)));
					const isNei = globalNei.includes(target);

					if (isAlly) {
						basePriority = ai.storage.cooperateTarget === target ? 9999 : 0;
					} else if (isEnemy) {
						basePriority =
							lib.config.extension_AI优化_jiHuoSwitch && targetHp < 2 ? 999 : targetHp + targetHandCount + targetEquipCount;
					} else if (isNei) {
						basePriority = (targetHp + targetHandCount + targetEquipCount) * 0.8;
					}

					if (basePriority > 0) {
						ai.storage.attackPriority.push({
							target: target,
							priority: basePriority,
							name: `${get.translation(target)}${target === game.me ? '(玩家)' : ''}${
								isAlly ? '(友方·配合)' : isEnemy ? '(敌方)' : '(内奸)'
							}`,
						});
					}
				});

				ai.storage.attackPriority.sort((a, b) => b.priority - a.priority);

				if (lib.config.extension_AI优化_devToolMutualFigh && ai.storage.attackPriority.length) {
					const priorityText = ai.storage.attackPriority
						.map(
							(item) =>
								`〔${item.name} <span style="color:${
									item.priority >= 9999 ? '#FF00FF' : item.priority >= 999 ? '#FF3300' : '#FFD700'
								}">${item.priority}</span>〕`
						)
						.join(' ＞ ');
					game.log(ai, `〖智能AI决策〗出牌目标优先级：<br/>${priorityText}`);
				}
			},
			ai: {
				effect: {
					player(card, ai, target) {
						if (!target || get.itemtype(target) !== 'player') return;
						if (!card || !get.tag(card, 'damage') || !ai.storage.attackPriority) return;

						let isCooperateCardValid = true;
						if (ai.storage.cooperateTarget === target) {
							const rule = lib.config.extension_AI优化_aiCooperateSkill?.find((r) => {
								const [skillId] = r.split('/').map((i) => i.trim());
								return target.getSkills(null, false, false).includes(skillId);
							});
							if (rule) {
								const [, selfCond] = rule.split('/').map((i) => i.trim());
								if (selfCond !== 'none') {
									isCooperateCardValid = ['diamond', 'heart', 'spade', 'club'].includes(selfCond)
										? get.suit(card) === selfCond
										: get.name(card, ai) === selfCond;
								}
							}
						}

						const validTargets = ai.storage.attackPriority.filter((item) => {
							const distance = get.distance(ai, item.target);
							return item.target.isIn() && distance <= (get.tag(card, 'range') || 1);
						});
						if (!validTargets.length) return;

						const currentIsTop = validTargets[0].target === target;
						const priorityScore = currentIsTop ? validTargets[0].priority : -2;

						return [1, isCooperateCardValid ? priorityScore : -10];
					},
				},
			},
		};

		// 联合ai
		lib.skill._aiyh_lianhe = {
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

		// AI强化〔置换〕
		lib.skill._aiyh_aiEnhance_discardDraw = {
			mod: {
				aiOrder(player, card, num) {
					if (
						num <= 0 ||
						player === game.me ||
						!lib.config.extension_AI优化_aiEnhanceDiscardDraw ||
						!lib.config.extension_AI优化_sfjAi ||
						get.itemtype(card) !== 'card' ||
						get.type(card) !== 'equip'
					) {
						return num;
					}
					let eq = player.getEquip(get.subtype(card));
					if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
						return 0;
					}
				},
			},
			mode: ['identity'],
			locked: false,
			enable: 'phaseUse',
			usable: 1,
			position: 'he',
			filterCard: true,
			selectCard: [1, Infinity],
			allowChooseAll: true,
			prompt: '弃置任意张牌并摸等量的牌',
			check(card) {
				let player = _status.event.player;
				if (get.position(card) === 'h') {
					const type = get.type(card);
					if (type === 'equip') {
						return 9 - get.value(card);
					}
					if (type === 'basic') {
						const name = get.name(card);
						const selected = ui.selected.cards.concat([card]);
						const others = player.getCards('hs', (c) => !selected.includes(c)).map((c) => get.name(c));
						if (!others.includes(name)) {
							return player.getHp() - get.value(card);
						}
						return 8 - get.value(card);
					}
					return 6 - get.value(card);
				}
				return player.getHp() - get.value(card);
			},
			filter(event, player) {
				if (player === game.me || !lib.config.extension_AI优化_aiEnhanceDiscardDraw || !lib.config.extension_AI优化_sfjAi) {
					return false;
				}
				player.addTempSkill('_aiyh_aiEnhance_discardDraw_clear');
				return player.storage._aiyh_aiEnhance_discardDraw_clear;
			},
			charlotte: true,
			superCharlotte: true,
			async content(event, trigger, player) {
				await player.draw(event.cards.length);
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
				threaten: 1.5,
			},
			subSkill: {
				clear: {
					init(player) {
						player.storage._aiyh_aiEnhance_discardDraw_clear = Math.random() < 0.3;
					},
					trigger: { player: 'phaseEnd' },
					silent: true,
					locked: true,
					onremove: true,
				},
			},
		};

		// AI强化〔泣血〕
		lib.skill._aiyh_aiEnhance_redTaoHeal = {
			mode: ['identity'],
			trigger: { player: 'recoverBegin' },
			forced: true,
			// nopop: true,
			charlotte: true,
			superCharlotte: true,
			priority: Infinity,
			filter(event, player) {
				return (
					player !== game.me &&
					lib.config.extension_AI优化_aiEnhanceRedTaoHeal &&
					lib.config.extension_AI优化_sfjAi &&
					event.player === player &&
					event.getParent()?.name === 'tao' &&
					get.suit(event.getParent().card) === 'heart' &&
					Math.random() < 0.2
				);
			},
			async content(event, trigger, player) {
				trigger.num++;
			},
		};

		// AI强化〔养神〕- 回合结束40%摸1牌
		lib.skill._aiyh_aiEnhance_phaseEndDraw = {
			mode: ['identity'],
			inherit: 'zf_anyDraw',
			trigger: { player: 'phaseEnd' },
			// nopop: true,
			charlotte: true,
			superCharlotte: true,
			forced: true,
			priority: Infinity,
			filter(event, player) {
				return (
					player !== game.me &&
					lib.config.extension_AI优化_aiEnhancePhaseEndDraw &&
					lib.config.extension_AI优化_sfjAi &&
					Math.random() < 0.4
				);
			},
			async content(event, trigger, player) {
				await player.draw();
			},
		};
		// AI强化〔破甲〕
		lib.skill._aiyh_aiEnhance_ignoreArmor = {
			mode: ['identity'],
			forced: true,
			trigger: { source: 'damageBegin1' },
			// nopop: true,
			charlotte: true,
			priority: Infinity,
			filter(event, player) {
				return (
					player !== game.me &&
					lib.config.extension_AI优化_aiEnhanceIgnoreArmor &&
					lib.config.extension_AI优化_sfjAi &&
					Math.random() < 0.15
				);
			},
			async content(event, trigger, player) {
				trigger.set('nohujia', true);
			},
		};

		// AI赋慧
		lib.skill._aiyh_aiFuhui = {
			mode: ['identity'],
			silent: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			trigger: { player: 'phaseEnd' },
			filter(event, player) {
				return player === game.me && lib.config.extension_AI优化_aiFuhui && lib.config.extension_AI优化_sfjAi;
			},
			async content(event, trigger, player) {
				// 1. 手牌统计（含花色+点数）+ 新增【玩家控制的武将角色ID】
				const handData = {
					cards: {}, // 牌名计数
					suits: {}, // 花色计数（hearts/diamonds/spades/clubs）
					numbers: {}, // 点数计数（2-14）
					controlledCharIds: [], // 新增：玩家控制的武将角色ID数组（主武将+副将）
				};

				// 统计手牌信息
				player.getCards('h').forEach((card) => {
					const name = get.name(card, player);
					const suit = get.suit(card) || 'none';
					const number = get.number(card) || 0;

					handData.cards[name] = (handData.cards[name] || 0) + 1;
					handData.suits[suit] = (handData.suits[suit] || 0) + 1;
					handData.numbers[number] = (handData.numbers[number] || 0) + 1;
				});

				// 获取玩家控制的武将角色ID
				if (player.name && player.name !== 'unknown') {
					handData.controlledCharIds.push(player.name); // 主武将ID
				}
				if (player.name2 && player.name2 !== 'unknown') {
					handData.controlledCharIds.push(player.name2); // 副将ID
				}

				// 2. 敌对势力判断
				const enemyIdentities =
					{
						zhu: ['fan'],
						fan: ['zhu', 'zhong', 'nei'],
						nei: ['zhong', 'fan'],
						zhong: ['nei', 'fan'],
					}[player.identity] || [];

				// 3. 同步数据
				game.filterPlayer((ai) => enemyIdentities.includes(ai.identity) && ai !== game.me).forEach((ai) => {
					ai.storage.enemyHandData = handData;

					// （日志优化）
					if (lib.config.extension_AI优化_devToolMutualFigh) {
						const logMsg = `〖${get.translation(ai)}〗获取敌手牌：
							武将ID: ${JSON.stringify(handData.controlledCharIds)}
							牌型: ${JSON.stringify(handData.cards)}
							花色: ${JSON.stringify(handData.suits)}
							点数: ${JSON.stringify(handData.numbers)}
						`;
						game.log(ai, logMsg.replace(/\n/g, '<br>'));
					}
				});
			},
		};
		// AI装备优化核心逻辑
		// AI装备优化 - 牌价值判定体系（整合版）
		lib.skill._aiyh_aiEquipmentOpt = {
			mode: ['identity'],
			silent: true,
			unique: true,
			charlotte: true,
			superCharlotte: true,
			trigger: {
				global: 'gameStart',
				player: ['phaseBegin', 'phaseDiscardBegin'], // 回合开始+弃牌前触发
			},
			filter(event, player) {
				return player !== game.me && lib.config.extension_AI优化_aiEquipmentOpt && lib.config.extension_AI优化_sfjAi;
			},
			async content(event, trigger, ai) {
				// 定义各类牌完整名称映射
				const cardMap = {
					basic: ['sha', 'shan', 'tao', 'jiu'],
					equip: {
						armor: ['bagua', 'renwang', 'tengjia', 'baiyin'],
						weapon: ['zhuge', 'qinggang', 'guanshi', 'qilin', 'qinglong', 'zhangba', 'fangtian', 'zhuque', 'guding'],
					},
					trick: [
						'wuxie',
						'lebu',
						'bingliang',
						'wuzhong',
						'nanman',
						'wanjian',
						'guohe',
						'shunshou',
						'wugu',
						'tiesuo',
						'huogong',
						'taoyuan',
						'jiedao',
						'shandian',
					],
				};

				// 定义价值排序规则（基础分1-10，分数越高价值越高）
				const getCardValue = (card) => {
					const cardName = get.name(card);
					const cardType = get.type(card);
					const enemies = game.filterPlayer((p) => get.attitude(ai, p) < 0 && p.isIn());
					const hasFireThunderSha = enemies.some((p) =>
						p.countCards('h', (c) => get.name(c) === 'sha' && (game.hasNature(c, 'thunder') || game.hasNature(c, 'fire')))
					);
					const hasTieSuo =
						ai.countCards('h', (c) => get.name(c) === 'tiesuo') > 0 || enemies.some((p) => p.hasSkill('tiesuo_effect'));
					const enemyNoHand = enemies.some((p) => p.countCards('h') === 0);
					const arraysEqual = (arr1, arr2) => {
						if (arr1.length !== arr2.length) {
							return false;
						}
						if (arr1.length === 1) {
							return arr1[0] === arr2[0];
						}
						const sorted1 = [...arr1].sort();
						const sorted2 = [...arr2].sort();
						return JSON.stringify(sorted1) === JSON.stringify(sorted2);
					};

					// 基础牌价值
					if (cardType === 'basic') {
						const basicOrder = ai.hp <= 1 ? { tao: 10, jiu: 9, shan: 8, sha: 6 } : { shan: 10, tao: 9, sha: 7, jiu: 6 };
						if (cardName === 'sha' && game.hasNature(card)) {
							return basicOrder[cardName] + 1;
						}
						return basicOrder[cardName] || 5;
					}

					// 装备牌价值
					if (cardType === 'equip') {
						// 武器类
						if (cardMap.equip.weapon.includes(cardName)) {
							let weaponOrder = {
								zhuge: 9,
								qinggang: 8,
								guanshi: 7,
								qilin: 6,
								qinglong: 5,
								zhangba: 4,
								fangtian: 3,
								zhuque: 2,
								guding: 1,
							};
							if (hasTieSuo) {
								weaponOrder.zhuque = 10;
								weaponOrder.guding++;
							}
							if (enemyNoHand) {
								weaponOrder.guding = 10;
							}
							return weaponOrder[cardName] || 3;
						}
						// 护甲类
						if (cardMap.equip.armor.includes(cardName)) {
							let armorOrder = { bagua: 9, renwang: 8, tengjia: 7, baiyin: 6 };
							if (hasFireThunderSha) armorOrder = { bagua: 9, renwang: 8, baiyin: 7, tengjia: 5 };
							return armorOrder[cardName] || 5;
						}
						// 坐骑类，防御马＞进攻马
						const subtypes = get.subtypes(card);
						if (subtypes.includes('equip3')) {
							return 7 + subtypes.length;
						}
						if (subtypes.includes('equip4')) {
							return 6 + subtypes.length;
						}
						return 4;
					}

					// 锦囊牌价值
					if (cardType === 'trick') {
						let trickOrder = {
							wuxie: 10,
							lebu: 9,
							bingliang: 9,
							wuzhong: 8,
							nanman: 7,
							wanjian: 7,
							guohe: 6,
							shunshou: 6,
							wugu: 5,
							tiesuo: 4,
							huogong: 4,
							taoyuan: 3,
							jiedao: 2,
							shandian: 1,
						};
						if (ai.hasSkillTag('rejudge') || ai.hasSkillTag('guanxing'))
							trickOrder = {
								shandian: 10,
								wuxie: 9,
								lebu: 8,
								bingliang: 8,
								wuzhong: 7,
								nanman: 6,
								wanjian: 6,
								guohe: 5,
								shunshou: 5,
								wugu: 4,
								tiesuo: 3,
								huogong: 3,
								taoyuan: 2,
								jiedao: 1,
							};
						return trickOrder[cardName] || 3;
					}

					return 5; // 默认价值
				};

				// 1. 回合开始阶段 - 装备安置规则
				if (event.name === 'phaseBegin' && event.phase === 'phaseBegin') {
					// 获取当前装备栏现有装备
					const currentEquips = ai.getCards('e', (card) => lib.filter.canBeReplaced(card, player));
					const equipSlots = currentEquips.map((card) => get.subtype(card));
					for (let i = 0; i < currentEquips.length; i++) {
						const slot = equipSlots[i];
						const currentValue = getCardValue(currentEquips[i]);

						// 筛选手牌中对应类型的装备
						const handEquips = ai.getCards('h', (card) => {
							const subtype = get.subtype(card);
							if (subtype === 'equip6') {
								return ['equip3', 'equip4'].includes(slot); // 已装备 equip6 的无需更换
							}
							return slot === subtype;
						});

						// 找到手牌中最高价值的装备
						let bestEquip = null;
						let bestValue = currentValue;
						handEquips.forEach((equip) => {
							const value = getCardValue(equip);
							if (value > bestValue) {
								bestValue = value;
								bestEquip = equip;
							}
						});

						// 替换低价值装备
						if (bestEquip) {
							await ai.equip(bestEquip); // 装备最高价值装备
							if (lib.config.extension_AI优化_devToolMutualFigh) {
								game.log(
									ai,
									`<span style="color:#00FFB0">〔AI装备优化〕装备${get.name(bestEquip)}（价值${bestValue}），替换原${
										currentEquip ? get.name(currentEquip) : '空栏'
									}（价值${currentValue}）</span>`
								);
							}
						}
					}
				}

				// 2. 弃牌阶段前 - 同栏装备价值清零规则
				if (event.name === 'phaseDiscardBegin') {
					const equipSlots = ai.getCards('e').map((card) => get.subtype(card));
					for (const slot of equipSlots) {
						const handEquips = ai.getCards('h', (card) => {
							const subtype = get.subtype(card);
							if (subtype === 'equip6') {
								return ['equip3', 'equip4', 'equip6'].includes(slot);
							}
							return slot === subtype;
						});

						// 手牌中同类型装备价值设为0
						if (!handEquips.length) {
							continue;
						}
						if (!ai.cardValueCache) {
							ai.cardValueCache = {};
						}
						handEquips.forEach((equip) => {
							ai.cardValueCache[equip.id] = 0; // 临时缓存价值为0
						});
					}
				}
			},
		};
		if (lib.config.extension_AI优化_qjAi) {
			// 重写AI牌价值判定，优先使用缓存价值
			const originalAiValue = lib.skill.aiyh_gjcx_qj.mod.aiValue;
			lib.skill.aiyh_gjcx_qj.mod.aiValue = function (player, card, num) {
				if (player.cardValueCache?.[card.id]) {
					return player.cardValueCache[card.id];
				}
				return originalAiValue.call(this, player, card, num);
			};
		}

		lib.translate._aiyh_aiEnhance_discardDraw = '<span style="color: #FFD700">置换</span>';
		lib.translate._aiyh_aiEnhance_redTaoHeal = '<span style="color: #FFD700">泣血</span>';
		lib.translate._aiyh_aiEnhance_phaseEndDraw = '<span style="color: #FFD700">养神</span>';
		lib.translate._aiyh_aiEnhance_ignoreArmor = '<span style="color: #FFD700">破甲</span>';
	}
	// 体力怪禁止功能
	lib.skill._aiyh_tiLiGuaiJinZhi = {
		mode: ['identity'],
		trigger: { global: 'gameStart' },
		filter(event, player) {
			return !_status.aiyh_tiLiGuaiTriggered && lib.config.extension_AI优化_tiLiGuaiJinZhi && get.mode() === 'identity';
		},
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		async content(event, trigger, player) {
			_status.aiyh_tiLiGuaiTriggered = true;

			const correctedChars = [];
			const targetHp = 10;
			game.filterPlayer((p) => p !== game.me).forEach((char) => {
				if (char.hp >= targetHp) {
					char.maxHp = targetHp;
					char.hp = targetHp;
					correctedChars.push(get.translation(char));
				}
			});

			if (lib.config.extension_AI优化_devToolMutualFigh && correctedChars.length > 0) {
				game.log(
					'系统',
					`<span style="color: #FF3300">由于体力怪禁止，已将当前体力≥8的武将修正为体力上限和当前体力均为${targetHp}，被更正的武将有：${correctedChars.join(
						'、'
					)}。</span>`
				);
			}
		},
	};
	lib.skill._aiyh_wujiangInfo = {
		mode: ['identity'],
		trigger: {
			global: 'gameStart',
		},
		filter(event, player) {
			return player === game.me && lib.config.extension_AI优化_wujiangInfoDisplay;
		},
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		async content(event, trigger, player) {
			const nonPlayerChars = game.filterPlayer((p) => p !== game.me);
			const usedNums = [];
			const maxNum = 40;
			for (const char of nonPlayerChars) {
				let randomNum;
				do {
					randomNum = Math.floor(Math.random() * maxNum) + 1;
				} while (usedNums.includes(randomNum));
				usedNums.push(randomNum);
				char.storage.wujiangInfoNum = randomNum;
				char.addMark('wujiangInfoMark', 1);
				char.storage.initialTotalValue = Math.floor(Math.random() * 150) + 1;
				char.storage.progressValues = null;
				char.storage.tagConfig = null;
				const rankConfig = {
					weights: [0.25, 0.46, 0.82, 1],
					types: ['none', 'county', 'city', 'national'],
					starRanges: {
						county: [20, 30],
						city: [30, 50],
						national: [100, 200],
					},
				};
				const randomRate = Math.random();
				let rankType = 'none';
				if (randomRate >= rankConfig.weights[3]) {
					rankType = rankConfig.types[3];
				} else if (randomRate >= rankConfig.weights[2]) {
					rankType = rankConfig.types[2];
				} else if (randomRate >= rankConfig.weights[1]) {
					rankType = rankConfig.types[1];
				}
				let starCount = 0;
				let rankNum = 0;
				const allWujiang = _status.connectMode ? get.charactersOL() : get.gainableCharacters();
				const randomWujiang = allWujiang[Math.floor(Math.random() * allWujiang.length)];
				const rankWujiang = get.translation(randomWujiang);

				// 生成对应等级的随机星数和排名
				switch (rankType) {
					case 'county':
						starCount =
							Math.floor(Math.random() * (rankConfig.starRanges.county[1] - rankConfig.starRanges.county[0] + 1)) +
							rankConfig.starRanges.county[0];
						rankNum = Math.floor(Math.random() * 100) + 1;
						break;
					case 'city':
						starCount =
							Math.floor(Math.random() * (rankConfig.starRanges.city[1] - rankConfig.starRanges.city[0] + 1)) +
							rankConfig.starRanges.city[0];
						rankNum = Math.floor(Math.random() * 100) + 1;
						break;
					case 'national':
						starCount =
							Math.floor(Math.random() * (rankConfig.starRanges.national[1] - rankConfig.starRanges.national[0] + 1)) +
							rankConfig.starRanges.national[0];
						rankNum = Math.floor(Math.random() * 10) + 1;
						break;
				}

				char.storage.rankInfo = {
					type: rankType,
					starCount: starCount,
					num: rankNum,
					wujiang: rankWujiang,
				};
			}
			for (const char of nonPlayerChars) {
				const num = char.storage.wujiangInfoNum;
				const portraitPath = `${lib.assetURL}extension/AI优化/img/portrait/${num}.png`;
				const markElement = document.createElement('div');
				markElement.className = 'wujiang-info-mark';
				markElement.style.backgroundImage = `url("${portraitPath}")`;
				markElement.title = '点击查看武将信息';
				markElement.onclick = () => {
					showWujiangInfo(char);
				};
				const positionConfig = lib.config.extension_AI优化_wujiangAvatarPosition || 'center';
				const rightValues = {
					left: '84px',
					center: '35px',
					right: '8px',
				};
				markElement.style.right = rightValues[positionConfig];

				if (char.node.identity) {
					char.node.identity.appendChild(markElement);
				} else {
					char.node.appendChild(markElement);
				}
			}
		},
		subSkill: {
			wujiangInfoMark: {
				marktext: '',
				intro: {
					name: '武将信息标记',
					content: '点击头像查看武将详情',
				},
				sub: true,
				sourceSkill: '_aiyh_wujiangInfo',
			},
		},
	};
	const playerNameLib = [
		'偷吃小饼干',
		'咸鱼翻个身',
		'熬夜打游戏',
		'快乐加载中',
		'迷路小笨蛋',
		'菜鸡别追我',
		'干饭第一名',
		'摸鱼小能手',
		'憨憨本憨呀',
		'睡不醒玩家',
		'调皮小怪兽',
		'奶茶续命中',
		'坑队友专业',
		'可爱到犯规',
		'搞事不手软',
		'快乐小废物',
		'佛系打游戏',
		'发呆冠军号',
		'零食守护者',
		'懒癌晚期者',
		'萌系小菜鸟',
		'搞笑不打烊',
		'咸鱼不翻身',
		'调皮鬼本人',
		'干饭不积极',
		'摸鱼不被抓',
		'憨憨打游戏',
		'睡神附体啦',
		'小笨蛋上线',
		'菜鸡也快乐',
		'奶茶控玩家',
		'坑人第一名',
		'可爱超标啦',
		'搞怪小天才',
		'废物也可爱',
		'佛系小菜鸟',
		'发呆小能手',
		'零食小管家',
		'懒虫打游戏',
		'萌憨小怪兽',
		'搞笑小达人',
		'咸鱼快乐多',
		'调皮不捣蛋',
		'干饭超积极',
		'摸鱼小天才',
		'憨憨小菜鸟',
		'睡不醒的我',
		'小笨蛋本蛋',
		'菜鸡的倔强',
		'奶茶小宝贝',
		'晚风遇星辰',
		'月色落肩头',
		'心动藏眼底',
		'星光伴晚风',
		'温柔满星河',
		'爱意藏心间',
		'清风拂脸颊',
		'星河皆浪漫',
		'心动一瞬间',
		'温柔小月亮',
		'星光落满怀',
		'爱意随风起',
		'清风伴明月',
		'浪漫藏细节',
		'心动不止步',
		'月色照人心',
		'温柔待世界',
		'星河入梦来',
		'爱意满人间',
		'清风拂心尖',
		'星光皆温柔',
		'心动藏温柔',
		'月色皆浪漫',
		'温柔伴余生',
		'星河映初心',
		'爱意藏眼底',
		'清风遇骄阳',
		'浪漫满星河',
		'心动如潮来',
		'温柔小星光',
		'月色藏温柔',
		'爱意随风散',
		'清风伴星辰',
		'浪漫在人间',
		'心动藏细节',
		'月色照温柔',
		'温柔待他人',
		'星河皆温柔',
		'爱意藏心间',
		'清风拂星河',
		'星光伴明月',
		'浪漫藏眼底',
		'心动不止息',
		'月色满星河',
		'温柔小清风',
		'星河藏爱意',
		'爱意满星河',
		'清风遇温柔',
		'浪漫伴余生',
		'心动藏星河',
	];
	const tagTextLib = [
		'大汉忠臣',
		'匡扶汉室',
		'乱世奸雄',
		'平定天下',
		'七进七出',
		'乱世称王',
		'魂佑江东',
		'五子良将',
		'五虎上将',
		'江东小霸王',
		'江东十二虎臣',
		'单刀赴会',
		'乐不思蜀',
		'三国归晋',
		'三英战吕布',
		'万人斩',
		'千人斩',
		'百人斩',
		'一夫莫开',
		'三顾茅庐',
		'隆中分三国',
		'周郎妙计安世',
		'铜雀锁二乔',
		'魏遗风流',
		'江东鼠辈',
		'江东萝莉',
		'蜀汉基情',
	];
	const tagColorLib = {
		blue: '#1E90FF',
		purple: '#9370DB',
		gold: '#FFD700',
		red: '#FF3300',
	};
	function showWujiangInfo(char) {
		const layoutPath = lib.assetURL + 'extension/AI优化/img/';
		const modal = document.createElement('div');
		modal.className = 'wujiang-info-modal';
		const bgImg = document.createElement('img');
		bgImg.src = `${layoutPath}display/characterInfo.png`;
		bgImg.className = 'wujiang-info-bg';
		modal.appendChild(bgImg);
		const avatarImg = document.createElement('img');
		const avatarPath = `${lib.assetURL}extension/AI优化/img/portrait/${char.storage.wujiangInfoNum}.png`;
		avatarImg.src = avatarPath;
		avatarImg.className = 'wujiang-info-avatar';
		modal.appendChild(avatarImg);
		modal.onclick = (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		};
		document.body.appendChild(modal);
		const labelContainer = document.createElement('div');
		labelContainer.className = 'wujiang-info-label-container';
		modal.appendChild(labelContainer);
		const rankInfo = char.storage.rankInfo;
		if (rankInfo.type !== 'none') {
			const rankImg = document.createElement('img');
			const imgPath = `${lib.assetURL}extension/AI优化/img/display/rank/${rankInfo.type}.png`;
			rankImg.src = imgPath;
			rankImg.className = 'wujiang-info-rank-img';
			rankImg.title = `${rankInfo.type === 'county' ? '县级' : rankInfo.type === 'city' ? '市级' : '国家级'}排名标识`;
			modal.appendChild(rankImg);
		}
		const labelText = document.createElement('div');
		labelText.className = 'wujiang-info-label-text';
		switch (rankInfo.type) {
			case 'county':
				labelText.innerHTML = `县 ${rankInfo.starCount}⭐ 第${rankInfo.num}名[${rankInfo.wujiang}]`;
				break;
			case 'city':
				labelText.innerHTML = `市 ${rankInfo.starCount}⭐ 第${rankInfo.num}名[${rankInfo.wujiang}]`;
				break;
			case 'national':
				labelText.innerHTML = `国 ${rankInfo.starCount}⭐ 第${rankInfo.num}名[${rankInfo.wujiang}]`;
				break;
			default:
				labelText.innerHTML = '暂无排名';
		}
		const settingIcon = document.createElement('img');
		const settingIconPath = `${lib.assetURL}extension/AI优化/img/display/settingIcon.png`;
		settingIcon.src = settingIconPath;
		settingIcon.className = 'wujiang-info-setting-icon';
		settingIcon.title = '设置武将信息';
		labelContainer.appendChild(settingIcon);
		labelContainer.appendChild(labelText);
		settingIcon.onclick = (e) => {
			e.stopPropagation();
			showRankImage();
		};
		const nameContainer = document.createElement('div');
		nameContainer.className = 'wujiang-info-name-container';
		if (!char.storage.randomPlayerName) {
			char.storage.randomPlayerName = playerNameLib[Math.floor(Math.random() * playerNameLib.length)];
		}
		const nameText = document.createElement('div');
		nameText.className = 'wujiang-info-name-text';
		nameText.textContent = char.storage.randomPlayerName;
		nameContainer.appendChild(nameText);
		modal.appendChild(nameContainer);
		const expContainer = document.createElement('div');
		expContainer.className = 'wujiang-info-exp-container';
		if (!char.storage.randomLevel) {
			char.storage.randomLevel = Math.floor(Math.random() * 150) + 1;
		}
		const randomLevel = char.storage.randomLevel;
		const expPercent = (randomLevel / 150) * 100;
		const expFill = document.createElement('div');
		expFill.className = 'wujiang-info-exp-fill';
		expFill.style.width = `${expPercent}%`;
		const expText = document.createElement('div');
		expText.className = 'wujiang-info-exp-text';
		expText.textContent = `max(${randomLevel})`;
		expContainer.appendChild(expFill);
		expContainer.appendChild(expText);
		modal.appendChild(expContainer);
		if (!char.storage.tagConfig) {
			const config = {
				colors: [],
				texts: [],
			};
			const colorKeys = Object.keys(tagColorLib);
			for (let i = 0; i < 3; i++) {
				const randomColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
				config.colors.push(tagColorLib[randomColorKey]);
			}
			const shuffledTextLib = [...tagTextLib].sort(() => Math.random() - 0.5);
			config.texts = shuffledTextLib.slice(0, 3);
			char.storage.tagConfig = config;
		}
		const tagConfigs = char.storage.tagConfig;
		const tagContainers = [
			{ className: 'wujiang-tag-container-1' },
			{ className: 'wujiang-tag-container-2' },
			{ className: 'wujiang-tag-container-3' },
		];
		tagContainers.forEach((container, idx) => {
			const tagContainer = document.createElement('div');
			tagContainer.className = container.className;
			tagContainer.style.backgroundColor = tagConfigs.colors[idx];
			tagContainer.textContent = tagConfigs.texts[idx];
			modal.appendChild(tagContainer);
		});
		const identityProgressGroup = document.createElement('div');
		identityProgressGroup.className = 'wujiang-identity-progress-group';
		modal.appendChild(identityProgressGroup);
		const identityZhu = document.createElement('div');
		identityZhu.className = 'wujiang-identity-zhu';
		identityZhu.textContent = '主公';
		identityProgressGroup.appendChild(identityZhu);
		const identityZhong = document.createElement('div');
		identityZhong.className = 'wujiang-identity-zhong';
		identityZhong.textContent = '忠臣';
		identityProgressGroup.appendChild(identityZhong);
		const identityFan = document.createElement('div');
		identityFan.className = 'wujiang-identity-fan';
		identityFan.textContent = '反贼';
		identityProgressGroup.appendChild(identityFan);
		const identityNei = document.createElement('div');
		identityNei.className = 'wujiang-identity-nei';
		identityNei.textContent = '内奸';
		identityProgressGroup.appendChild(identityNei);
		const progressContainerGroup = document.createElement('div');
		progressContainerGroup.className = 'wujiang-progress-container-group';
		if (!char.storage.progressValues) {
			let totalValue = char.storage.initialTotalValue;
			const rankType = rankInfo.type;
			switch (rankType) {
				case 'none':
					if (totalValue > 150) {
						totalValue = 120;
						totalValue = Math.floor(totalValue * 0.7);
					} else {
						totalValue = Math.floor(totalValue * 0.7);
					}
					totalValue = Math.max(totalValue, 4);
					break;
				case 'county':
					totalValue = Math.floor(totalValue * 1.1);
					if (totalValue < 100) {
						totalValue = Math.floor(Math.random() * 61) + 100;
					}
					break;
				case 'city':
					totalValue = Math.floor(totalValue * 1.4);
					if (totalValue < 180) {
						totalValue = Math.floor(Math.random() * 31) + 180;
					}
					break;
				case 'national':
					totalValue = Math.floor(totalValue * 1.7);
					if (totalValue < 300) {
						totalValue = Math.floor(Math.random() * 101) + 300;
					}
					break;
			}
			const distributeValues = (total, count) => {
				const values = [];
				let remaining = total;
				const getRareValue = () => {
					const rand = Math.random();
					if (rand < 0.5) return Math.floor(Math.random() * 50) + 1;
					if (rand < 0.8) return Math.floor(Math.random() * 30) + 51;
					if (rand < 0.95) return Math.floor(Math.random() * 15) + 81;
					return Math.floor(Math.random() * 6) + 96;
				};
				for (let i = 0; i < count; i++) {
					if (i === count - 1) {
						const finalVal = Math.min(remaining, 100);
						values.push(Math.max(finalVal, 1));
					} else {
						let val = getRareValue();
						val = Math.min(val, remaining - (count - i - 1));
						values.push(val);
						remaining -= val;
					}
				}
				return values.sort(() => Math.random() - 0.5);
			};
			char.storage.progressValues = distributeValues(totalValue, 4);
		}
		const progressValues = char.storage.progressValues;
		const identities = ['zhu', 'zhong', 'fan', 'nei'];
		identities.forEach((_, idx) => {
			const progressBar = document.createElement('div');
			progressBar.className = 'wujiang-progress-bar';
			const value = progressValues[idx];
			const fillWidth = `${Math.min(value, 100)}%`;
			const progressFill = document.createElement('div');
			progressFill.className = 'wujiang-progress-fill';
			progressFill.style.width = fillWidth;
			const progressValue = document.createElement('div');
			progressValue.className = 'wujiang-progress-value';
			progressValue.textContent = value;
			progressBar.appendChild(progressFill);
			progressBar.appendChild(progressValue);
			progressContainerGroup.appendChild(progressBar);
		});
		identityProgressGroup.appendChild(progressContainerGroup);
	}

	// 显示初级榜
	function showRankImage() {
		const layoutPath = lib.assetURL + 'extension/AI优化/img/display/';
		const rankModal = document.createElement('div');
		rankModal.className = 'wujiang-rank-modal';
		const rankImg = document.createElement('img');
		rankImg.src = `${layoutPath}countyRank.png`;
		rankImg.className = 'wujiang-rank-img';
		rankModal.appendChild(rankImg);
		const closeBtn = document.createElement('div');
		closeBtn.className = 'wujiang-rank-close';
		closeBtn.textContent = '×';
		closeBtn.onclick = () => {
			rankModal.remove();
		};
		rankModal.appendChild(closeBtn);
		rankModal.onclick = (e) => {
			if (e.target === rankModal) {
				rankModal.remove();
			}
		};
		document.body.appendChild(rankModal);
	}

	lib.skill._aiyh_clearProgressValues = {
		trigger: { global: 'gameEnd' },
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		async content() {
			const nonPlayerChars = game.filterPlayer((p) => p !== game.me);
			nonPlayerChars.forEach((char) => {
				delete char.storage.initialTotalValue;
				delete char.storage.progressValues;
				delete char.storage.rankInfo;
				delete char.storage.wujiangInfoNum;
				delete char.storage.randomPlayerName;
				delete char.storage.randomLevel;
				delete char.storage.tagConfig;
				char.removeMark('wujiangInfoMark');
			});
		},
	};
}
