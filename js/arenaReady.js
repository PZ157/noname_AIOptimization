import { lib, game, ui, get, ai, _status } from './utils.js';

export function arenaReady() {
	if (!lib.aiyh) {
		lib.aiyh = {};
	}
	if (!lib.aiyh.qz) {
		lib.aiyh.qz = {};
	}
	if (!lib.aiyh.skillModify) {
		lib.aiyh.skillModify = {};
	}
	if (Object.prototype.toString.call(lib.config.extension_AI优化_qz) !== '[object Object]') {
		game.saveExtensionConfig('AI优化', 'qz', {});
	}
	if (Object.prototype.toString.call(lib.config.extension_AI优化_cf) !== '[object Object]') {
		game.saveExtensionConfig('AI优化', 'cf', {});
	}
	if (lib.config.extension_AI优化_viewAtt) {
		// 火眼金睛
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
							(i === j ? '自己' : get.translation(game.players[j])) +
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
		// 去除小游戏
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
						let card = get.cardPile((x) => {
							if (cards.includes(x)) return false;
							if (typeof filter === 'string' && get.type(x, 'trick') === filter) return true;
							if (typeof filter === 'object' && filter.includes(x.name)) return true;
						});
						if (card) cards.push(card);
						else {
							card = get.cardPile((x) => {
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
						.set('ai', () => {
							if (
								game.hasPlayer((current) => {
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
                若你因此获得了牌，你须选择一项：将等量张牌交给一名其他角色；弃置等量张牌。
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
				const result = await player
					.chooseButton(['请选择要执行的宝物效果', list2], true)
					.set('ai', (button) => {
						const player = _status.event.player;
						if (button.link.name === 'xuanjian_card') {
							if (
								game.hasPlayer((current) => {
									return current.isDamaged() && current.hp < 3 && get.attitude(player, current) > 1;
								})
							)
								return 1 + Math.random();
							return 1;
						} else if (button.link.name === 'wolong_card') {
							if (
								game.hasPlayer((current) => {
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
						let name = lib.inpile
								.filter((i) => {
									return !names.includes(i);
								})
								.randomGet(),
							card = get.cardPile((i) => {
								return i.name === name;
							});
						if (card) {
							cards.push(card);
							names.push(card.name);
						} else if (get.isLuckyStar(player)) {
							card = get.cardPile((i) => {
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
						.set('ai', (target) => {
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
						.set(
							'idx',
							(() => {
								if (player.hp < 2) return 0;
								if (
									game.hasPlayer((cur) => {
										return get.attitude(player, cur) > 0 && cur.countCards('j');
									})
								)
									return 0;
								if (
									game.hasPlayer((cur) => {
										return get.attitude(player, cur) < 0 && cur.countCards('he') < 2;
									})
								)
									return 3;
								if (
									game.hasPlayer((cur) => {
										return get.attitude(player, cur) < 0 && cur.hp < 2;
									})
								)
									return 4;
								return 1;
							})()
						)
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
					next.set('filterButton', (button) => {
						return lib.skill.yukito_kongwu.moves[button.link].filter(_status.event.player);
					});
					next.set('ai', (button) => {
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
								.set('ai', (target) => {
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
								.set('ai', (target) => {
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
							return game.hasPlayer((current) => {
								return current.isDamaged();
							});
						},
						async content(event, trigger, player) {
							const targets = await player
								.chooseTarget(true, '令一名已受伤的角色回复1点体力', (card, player, target) => {
									return target.isDamaged();
								})
								.set('ai', (target) => {
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
							return game.hasPlayer((current) => {
								return current.countDiscardableCards(player, 'hej');
							});
						},
						async content(event, trigger, player) {
							const targets = await player
								.chooseTarget(true, '弃置一名角色区域内的两张牌', (card, player, target) => {
									return target.countDiscardableCards(player, 'hej') > 0;
								})
								.set('ai', (target) => {
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
				) {
					bool = 2;
				}
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
					.set('ai', (button) => {
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
					!game.hasPlayer((current) => {
						return current.canEquip(card, true);
					})
				) {
					return;
				}
				const targets = await player
					.chooseTarget(true, '将' + get.translation(card) + '置于一名角色的装备区内', (card, player, target) => {
						return target.canEquip(_status.event.card, true);
					})
					.set('card', card)
					.set('ai', (target) => {
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
}
