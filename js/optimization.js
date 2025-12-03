import { lib, game, ui, get, _status } from './utils.js';

/**
 * @AI出牌逻辑优化初始化函数
 */
export function initAICardOpt() {
	lib.skill._aiyh_cardAiOpt = {
		mode: ['identity'],
		silent: true,
		unique: true,
		charlotte: true,
		superCharlotte: true,
		trigger: { global: 'gameStart' },
		filter(event, player) {
			return player === game.me && lib.config.extension_AI优化_cardAiOpt;
		},
		async content(event, trigger, player) {
			const optimizeCards = {
				// 顺手牵羊
				shunshou: {
					wuxie(target, card, player, viewer) {
						if (!target.countCards('hej') || get.attitude(viewer, player._trueMe || player) > 0) {
							return 0;
						}
					},
					basic: {
						order: 7.5,
						useful(card, i) {
							return 8 / (3 + i);
						},
						value(card, player) {
							let max = 0;
							game.countPlayer((cur) => {
								max = Math.max(max, lib.card.shunshou.ai.result.target(player, cur) * get.attitude(player, cur));
							});
							if (max <= 0) return 2;
							return 0.53 * max;
						},
					},
					button(button) {
						let player = _status.event.player,
							target = _status.event.target;
						if (!lib.filter.canBeGained(button.link, player, target)) return 0;
						let att = get.attitude(player, target),
							val = get.value(button.link, player) / 60,
							btv = get.buttonValue(button),
							pos = get.position(button.link),
							name = get.name(button.link);
						if (pos === 'j') {
							let viewAs = button.link.viewAs;
							if (viewAs === 'lebu') {
								let needs = target.needsToDiscard(2);
								btv *= 20 + 0.2 * needs;
							} else if (viewAs === 'shandian' || viewAs === 'fulei') {
								btv /= 2;
							}
						}
						if (att > 0) btv = -btv;
						if (pos !== 'e') {
							return pos === 'h' && !player.hasSkillTag('viewHandcard', null, target, true) ? btv + 0.1 : btv + val;
						}
						let sub = get.subtype(button.link);
						if (sub === 'equip1') return (btv * Math.min(3.6, target.hp)) / 3;
						if (sub === 'equip2') {
							if (name === 'baiyin' && pos === 'e' && target.isDamaged()) {
								let by = 1 - 0.2 * Math.min(5, target.hp);
								return get.sgn(get.recoverEffect(target, player, player)) * by;
							}
							return 1.57 * btv + val;
						}
						if (
							att <= 0 &&
							(sub === 'equip3' || sub === 'equip4') &&
							(player.hasSkill('shouli') || player.hasSkill('psshouli'))
						) {
							return 0;
						}
						if (sub === 'equip3' && !game.hasPlayer((cur) => !cur.inRange(target) && get.attitude(cur, target) < 0)) {
							return 0.4 * btv + val;
						}
						if (sub === 'equip4') return btv / 2 + val;
						return btv + val;
					},
					result: {
						player(player, target) {
							const hs = target.getGainableCards(player, 'h');
							const es = target.getGainableCards(player, 'e');
							const js = target.getGainableCards(player, 'j');
							const att = get.attitude(player, target);
							if (att < 0) {
								if (
									!hs.length &&
									!es.some((card) => get.value(card, target) > 0 && card !== target.getEquip('jinhe')) &&
									!js.some((card) => {
										var cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg' || get.effect(target, cardj, target, player) < 0;
									})
								) {
									return 0;
								}
							} else if (att > 1) {
								return es.some((card) => get.value(card, target) <= 0) ||
									js.some((card) => {
										var cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg' ? false : get.effect(target, cardj, target, player) < 0;
									})
									? 1.5
									: 0;
							}
							return 1;
						},
						target(player, target) {
							const hs = target.getGainableCards(player, 'h');
							const es = target.getGainableCards(player, 'e');
							const js = target.getGainableCards(player, 'j');
							if (get.attitude(player, target) <= 0) {
								if (hs.length > 0) return -1.5;
								return es.some((card) => get.value(card, target) > 0 && card !== target.getEquip('jinhe')) ||
									js.some((card) => {
										var cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg' || get.effect(target, cardj, target, player) < 0;
									})
									? -1.5
									: 1.5;
							}
							if (
								es.some((card) => {
									const cardj = card.viewAs ? { name: card.viewAs } : card;
									return cardj.name === 'baiyin';
								})
							) {
								if (target.maxHp > target.hp && target.hp === 1) return 2;
							}
							if (
								es.some((card) => {
									const cardj = card.viewAs ? { name: card.viewAs } : card;
									return get.value(cardj, target) <= 0 && cardj.name !== 'baiyin';
								})
							)
								return 2;
							if (
								js.some((card) => {
									var cardj = card.viewAs ? { name: card.viewAs } : card;
									return cardj.name === 'xumou_jsrg'
										? true
										: cardj.name === 'lebu' && get.effect(target, cardj, target, player) < 0;
								})
							)
								return 10;
							return es.some((card) => get.value(card, target) <= 0) ||
								js.some((card) => {
									var cardj = card.viewAs ? { name: card.viewAs } : card;
									return cardj.name === 'xumou_jsrg' ? false : get.effect(target, cardj, target, player) < 0;
								})
								? 1.5
								: -1.5;
						},
					},
					tag: { loseCard: 1, gain: 1 },
				},
				// 过河拆桥
				guohe: {
					wuxie(target, card, player, viewer, status) {
						if (
							!target.countCards('hej') ||
							status * get.attitude(viewer, player._trueMe || player) > 0 ||
							(target.hp > 2 &&
								!target.hasCard((i) => {
									let val = get.value(i, target),
										subtypes = get.subtypes(i);
									return (
										val > 3 + Math.min(5, target.hp) &&
										!(val < 8 && target.hp < 2 && !subtypes.includes('equip2') && !subtypes.includes('equip5'))
									);
								}, 'e') &&
								target.countCards('h') * _status.event.getRand('guohe_wuxie') > 1.57)
						) {
							return 0;
						}
					},
					basic: {
						order: 9,
						useful(card, i) {
							return 10 / (3 + i);
						},
						value(card, player) {
							let max = 0;
							game.countPlayer((cur) => {
								max = Math.max(max, lib.card.guohe.ai.result.target(player, cur) * get.attitude(player, cur));
							});
							if (max <= 0) return 5;
							return 0.42 * max;
						},
					},
					yingbian(card, player, targets, viewer) {
						if (get.attitude(viewer, player) <= 0) return 0;
						if (
							game.hasPlayer(
								(current) =>
									!targets.includes(current) &&
									lib.filter.targetEnabled2(card, player, current) &&
									get.effect(current, card, player, player) > 0
							)
						) {
							return 6;
						}
						return 0;
					},
					button(button) {
						const player = _status.event.player,
							target = _status.event.target;
						if (!lib.filter.canBeDiscarded(button.link, player, target)) return 0;
						let att = get.attitude(player, target),
							val = get.buttonValue(button),
							pos = get.position(button.link),
							name = get.name(button.link);
						if (pos === 'j') {
							let viewAs = button.link.viewAs;
							if (viewAs === 'lebu') {
								let needs = target.needsToDiscard(2);
								val *= 20 + 0.2 * needs;
							} else if (viewAs === 'shandian' || viewAs === 'fulei') {
								val /= 2;
							}
						}
						if (att > 0) val = -val;
						if (pos !== 'e') return val;
						let sub = get.subtypes(button.link);
						if (sub.includes('equip1')) return (val * Math.min(3.6, target.hp)) / 3;
						if (sub.includes('equip2')) {
							if (name === 'baiyin' && pos === 'e' && target.isDamaged()) {
								let by = 1 - 0.2 * Math.min(5, target.hp);
								return get.sgn(get.recoverEffect(target, player, player)) * by;
							}
							return 1.57 * val;
						}
						if (
							att <= 0 &&
							(sub.includes('equip3') || sub.includes('equip4')) &&
							(player.hasSkill('shouli') || player.hasSkill('psshouli'))
						) {
							return 0;
						}
						if (sub.includes('equip6')) return val;
						if (sub.includes('equip4')) return val / 2;
						if (sub.includes('equip3') && !game.hasPlayer((cur) => !cur.inRange(target) && get.attitude(cur, target) < 0)) {
							return 0.4 * val;
						}
						return val;
					},
					result: {
						target(player, target) {
							const att = get.attitude(player, target);
							const hs = target.getDiscardableCards(player, 'h');
							let es = target.getDiscardableCards(player, 'e');
							const js = target.getDiscardableCards(player, 'j');
							if (target.hp === 1 && hs.length === 0) {
								es = es.filter((card) => !get.subtypes(card).includes('equip4'));
							}
							if (!hs.length && !es.length && !js.length) return 0;
							if (att > 0) {
								if (
									es.some((card) => {
										const cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'baiyin';
									})
								) {
									if (target.maxHp > target.hp && target.hp === 1) return 3;
								}
								if (
									es.some((card) => {
										const cardj = card.viewAs ? { name: card.viewAs } : card;
										return get.value(cardj, target) <= 0 && cardj.name !== 'baiyin';
									})
								)
									return 3;
								if (
									js.some((card) => {
										var cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg'
											? true
											: cardj.name === 'lebu' && get.effect(target, cardj, target, player) < 0;
									})
								)
									return 10;
								if (
									js.some((card) => {
										const cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg' ? false : get.effect(target, cardj, target, player) < 0;
									})
								)
									return 3;
								if (
									target.isDamaged() &&
									es.some((card) => card.name === 'baiyin') &&
									get.recoverEffect(target, player, player) > 0
								) {
									if (target.hp === 1 && !target.hujia) return 1.6;
								}
								if (es.some((card) => get.value(card, target) < 0)) return 1;
								return -1.5;
							} else {
								const noh = hs.length === 0 || target.hasSkillTag('noh');
								const noe = es.length === 0 || target.hasSkillTag('noe');
								const noe2 = noe || !es.some((card) => get.value(card, target) > 0);
								const noj =
									js.length === 0 ||
									!js.some((card) => {
										const cardj = card.viewAs ? { name: card.viewAs } : card;
										return cardj.name === 'xumou_jsrg' || get.effect(target, cardj, target, player) < 0;
									});
								if (noh && noe2 && noj) return 1.5;
								return -1.5;
							}
						},
					},
					tag: { loseCard: 1, discard: 1 },
				},
				// 诸葛连弩
				zhuge: {
					order: function () {
						return get.order({ name: 'sha' }) - 0.1;
					},
					equipValue: function (card, player) {
						if (player._zhuge_temp) return 1;
						player._zhuge_temp = true;
						var result = (function () {
							if (
								!game.hasPlayer(
									(current) =>
										get.distance(player, current) <= 1 &&
										player.canUse('sha', current) &&
										get.effect(current, { name: 'sha' }, player, player) > 0
								)
							) {
								return 1;
							}
							if (player.hasSha() && _status.currentPhase === player) {
								if ((player.getEquip('zhuge') && player.countUsed('sha')) || player.getCardUsable('sha') === 0) {
									return 10;
								}
							}
							var num = player.countCards('hs', 'sha');
							return num > 1 ? 6 + num : 3 + num;
						})();
						delete player._zhuge_temp;
						return result;
					},
					basic: {
						equipValue: 5,
						order(card, player) {
							if (player.countUsed('sha') <= 10 && player.getCardUsable('sha') <= 10) {
								if (
									player.countCards('hs', 'sha') > 0 &&
									player.countUsed('sha') <= player.getCardUsable('sha') &&
									game.hasPlayer(
										(current) =>
											get.distance(player, current) <= 1 &&
											player.canUse('sha', current) &&
											get.effect(current, { name: 'sha' }, player, player) > 0
									)
								) {
									return 1;
								}
							}
							const equipValue = get.equipValue(card, player) / 20;
							return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
						},
						useful: 2,
						value(card, player, index, method) {
							if (!player.isPhaseUsing()) {
								if (player.getCardUsable('sha') <= 10) {
									if (
										game.hasPlayer(
											(current) =>
												get.distance(player, current) <= 1 &&
												player.canUse('sha', current) &&
												get.effect(current, { name: 'sha' }, player, player) > 0
										)
									) {
										var num = player.countCards('hs', 'sha');
										if (num > player.getCardUsable('sha')) return 5 * num - 5 * player.getCardUsable('sha');
									}
								}
							} else {
								if (player.getCardUsable('sha') <= 10) {
									if (
										game.hasPlayer(
											(current) =>
												get.distance(player, current) <= 1 &&
												player.canUse('sha', current) &&
												get.effect(current, { name: 'sha' }, player, player) > 0
										)
									) {
										var num = player.countCards('hs', 'sha');
										if (num > player.getCardUsable('sha')) return 30;
									}
								}
							}
							if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
							const info = get.info(card),
								current = player.getEquip(info.subtype),
								value = current && card != current && get.value(current, player);
							let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
							if (typeof equipValue === 'function') {
								if (method === 'raw') return equipValue(card, player);
								if (method === 'raw2') return equipValue(card, player) - value;
								return Math.max(0.1, equipValue(card, player) - value);
							}
							if (typeof equipValue !== 'number') equipValue = 0;
							if (method === 'raw') return equipValue;
							if (method === 'raw2') return equipValue - value;
							return Math.max(0.1, equipValue - value);
						},
					},
					tag: { valueswap: 1 },
					result: {
						target(player, target, card) {
							return get.equipResult(player, target, card);
						},
					},
				},
				// 火攻
				huogong: {
					wuxie(target, card, player, viewer, status) {
						if (get.attitude(viewer, player._trueMe || player) > 0) return 0;
						if (status * get.attitude(viewer, target) * get.effect(target, card, player, target) >= 0) return 0;
						if (_status.event.getRand('huogong_wuxie') * 4 > player.countCards('h')) return 0;
					},
					basic: { order: 9.2, value: [3, 1], useful: 0.6 },
					async content(event, trigger, player) {
						const huogongCard = event.card;
						const target = event.target;
						const targetSuit = get.suit(huogongCard);
						if (target.countCards('h') === 0) {
							return;
						}
						let cards;
						if (target.countCards('h') === 1) {
							cards = target.getCards('h');
						} else {
							cards = await target
								.chooseCard(true)
								.set('ai', (card) => {
									return get.suit(card) === targetSuit
										? 3 + (get.value(card) || 1)
										: _status.event.getRand() < 0.5
										? Math.random() + 1
										: get.value(card) || 1;
								})
								.forResultCards();
						}
						await target.showCards(cards).setContent(function () {});
						event.dialog = ui.create.dialog(get.translation(target) + '展示的手牌', cards);
						event.videoId = lib.status.videoId++;
						game.broadcast('createDialog', event.videoId, get.translation(target) + '展示的手牌', cards);
						game.addVideo('cardDialog', null, [get.translation(target) + '展示的手牌', get.cardsInfo(cards), event.videoId]);
						event.card2 = cards[0];
						game.log(target, '展示了', event.card2);
						game.addCardKnower(cards, 'everyone');
						let result = {};
						result = await player
							.chooseToDiscard({ suit: get.suit(event.card2) }, function (card) {
								var evt = _status.event.getParent();
								return get.damageEffect(evt.target, evt.player, evt.player, 'fire') > 0
									? 6.2 + Math.min(4, evt.player.hp) - get.value(card, evt.player)
									: -1;
							})
							.set('prompt', false)
							.forResult();
						await game.delay(2);
						if (result.bool) {
							await target.damage('fire');
						} else {
							target.addTempSkill('huogong2');
						}
						event.dialog.close();
						game.addVideo('cardDialog', null, event.videoId);
						game.broadcast('closeDialog', event.videoId);
					},
					result: {
						player(player) {
							var nh = player.countCards('h');
							if (nh <= player.hp && nh <= 4 && _status.event.name === 'chooseToUse') {
								if (
									typeof _status.event.filterCard === 'function' &&
									_status.event.filterCard(new lib.element.VCard({ name: 'huogong' }), player, _status.event)
								) {
									return -10;
								}
								if (_status.event.skill) {
									var viewAs = get.info(_status.event.skill).viewAs;
									if (viewAs === 'huogong' || (viewAs && viewAs.name === 'huogong')) {
										return -10;
									}
								}
							}
							return 0;
						},
						target(player, target) {
							if (target.hasSkill('huogong2') || target.countCards('h') === 0) return 0;
							if (player.countCards('h') <= 1) return 0;
							if (
								_status.event.player === player &&
								target.isAllCardsKnown(player) &&
								!target.countCards('h', (card) => player.countCards('h', (card2) => get.suit(card2) === get.suit(card)))
							) {
								return 0;
							}
							if (target === player) {
								if (
									typeof _status.event.filterCard === 'function' &&
									_status.event.filterCard(new lib.element.VCard({ name: 'huogong' }), player, _status.event)
								) {
									return -1.15;
								}
								if (_status.event.skill) {
									var viewAs = get.info(_status.event.skill).viewAs;
									if (viewAs === 'huogong' || (viewAs && viewAs.name === 'huogong')) {
										return -1.15;
									}
								}
								return 0;
							}
							return -1.15;
						},
					},
					tag: { damage: 1, fireDamage: 1, natureDamage: 1, norepeat: 1 },
				},
				// 铁锁链环
				tiesuo: {
					wuxie(target, card, player, viewer, status) {
						if (
							status * get.attitude(viewer, player._trueMe || player) > 0 ||
							target.hasSkillTag('noLink') ||
							target.hasSkillTag('nodamage') ||
							target.hasSkillTag('nofire') ||
							target.hasSkillTag('nothunder')
						) {
							return 0;
						}
						if (
							get.damageEffect(target, player, viewer, 'thunder') >= 0 ||
							get.damageEffect(target, player, viewer, 'fire') >= 0
						) {
							return 0;
						}
						if (target.hp + target.hujia > 2 && target.mayHaveShan(viewer, 'use')) {
							return 0;
						}
					},
					basic: { order: 7.3, useful: 1.2, value: 4 },
					result: {
						target(player, target) {
							if (target.hasSkillTag('link') || target.hasSkillTag('noLink')) return 0;
							let curs = game.filterPlayer(
								(current) =>
									!(current.hasSkillTag('noLink') || current.hasSkillTag('nodamage')) &&
									(current.hasSkillTag('nofire') || current.hasSkillTag('nothunder'))
							);
							if (curs.length < 2) return 0;
							let f = target.hasSkillTag('nofire'),
								t = target.hasSkillTag('nothunder'),
								res = 0.9;
							if ((f && t) || target.hasSkillTag('nodamage')) return 0;
							if (f || t) res = 0.45;
							if (!f && target.getEquip('tengjia')) res *= 2;
							if (!target.isLinked()) res = -res;
							const aiIdentity = player.identity;
							const targetIdentity = target.identity;
							if (aiIdentity === 'fan') {
								if (['zhong', 'nei'].includes(targetIdentity)) res *= 1.8;
								else if (targetIdentity === 'zhu') {
									const hasZhongNei = curs.some(
										(c) => ['zhong', 'nei'].includes(c.identity) && get.attitude(player, c) < 0
									);
									if (hasZhongNei) res *= 0.4;
								}
							}
							if (aiIdentity === 'nei') {
								if (targetIdentity === 'fan') res *= 1.8;
								else {
									const hasFan = curs.some((c) => c.identity === 'fan' && get.attitude(player, c) < 0);
									if (hasFan) res *= 0.5;
								}
							}
							const enemies = curs.filter((c) => get.attitude(player, c) < 0);
							const allEnemiesHealthy = enemies.every((c) => c.hp >= 3);
							if (allEnemiesHealthy && enemies.includes(target)) {
								res *= (4 - target.hp) * 0.5 + 1;
							}
							if (ui.selected.targets.length) return res;
							let fs = 0,
								es = 0,
								att = get.attitude(player, target),
								linkf = false,
								alink = true;
							curs.forEach((i) => {
								let atti = get.attitude(player, i);
								if (atti > 0) {
									fs++;
									if (i.isLinked()) linkf = true;
								} else if (atti < 0) {
									es++;
									if (!i.isLinked()) alink = false;
								}
							});
							if (es < 2 && !alink && (att <= 0 || (att > 0 && linkf && fs < 2))) {
								return 0;
							}
							return res;
						},
					},
					tag: { multitarget: 1, multineg: 1, norepeat: 1 },
				},
				// 桃
				tao: {
					viewHandcard: true,
					skillTagFilter(player, tag, arg) {
						if (arg && get.attitude(player, arg) <= 0) return false;
						return true;
					},
					tao: {
						order(card, player) {
							return player.hasSkillTag('pretao') ? 9 : 2;
						},
						useful(card, i) {
							const player = _status.event.player;
							const target = _status.event.target || _status.event.dying;
							let isEnough = true;
							if (target) {
								const dyingRole = _status.event.dying;
								let needPeach =
									dyingRole && target === dyingRole ? Math.abs(target.hp) + 1 : target.hp < target.maxHp ? 1 : 0;
								if (needPeach > 0) {
									let totalPeach = 0;
									const currentCard = _status.event.card;
									const playerPeaches = player.getCards(
										'hs',
										(c) =>
											get.name(c) === 'tao' &&
											lib.filter.cardEnabled(c, player, 'forceEnable') &&
											lib.filter.cardSavable(c, player, target) &&
											c !== currentCard,
										true
									).length;
									totalPeach += playerPeaches;
									if (dyingRole && get.attitude(player, dyingRole) > 0) {
										const dyingPeaches = dyingRole.getCards(
											'h',
											(c) =>
												get.name(c) === 'tao' &&
												lib.filter.cardSavable(c, dyingRole, dyingRole) &&
												c !== currentCard,
											true
										).length;
										totalPeach += dyingPeaches;
									}
									game.filterPlayer((f) => get.attitude(player, f) > 0 && f !== player && f !== dyingRole).forEach(
										(f) => {
											totalPeach += f.getCards(
												'hs',
												(c) => get.name(c) === 'tao' && lib.filter.cardEnabled(c, f, 'forceEnable'),
												true
											).length;
										}
									);
									isEnough = totalPeach >= needPeach;
								}
							}
							if (get.name(card) !== 'tao' || !lib.filter.cardEnabled(card, player, 'forceEnable') || !isEnough) return 0;
							if (!game.checkMod(card, player, 'unchanged', 'cardEnabled2', player)) return 2 / (1 + i);
							const dyingRole = _status.event.dying;
							let ownIdentity = player.identity;
							let needPeach = dyingRole ? Math.abs(dyingRole.hp) + 1 : 1;
							if (dyingRole) {
								const isAlly =
									(ownIdentity === 'zhong' && dyingRole.identity === 'zhu') ||
									(ownIdentity === 'fan' && dyingRole.identity === 'fan') ||
									(ownIdentity === 'nei' && dyingRole === player);
								if (isAlly) return 10 + needPeach;
							}
							let fs = game.filterPlayer((current) => get.attitude(player, current) > 0 && current.hp <= 2),
								damaged = 0,
								needs = 0;
							fs.forEach((f) => {
								if (f.hp > 3 || !lib.filter.cardSavable(card, player, f)) return;
								f.hp > 1 ? damaged++ : needs++;
							});
							if (needs && damaged) return 5 * needs + 3 * damaged;
							if (needs + damaged > 1 || player.hasSkillTag('maixie')) return 8;
							if (player.hp / player.maxHp < 0.7) return 7 + Math.abs(player.hp / player.maxHp - 0.5);
							if (needs) return 7;
							if (damaged) return Math.max(3, 7.8 - i);
							return Math.max(1, 7.2 - i);
						},
						value(card, player) {
							const target = _status.event.target || _status.event.dying;
							let isEnough = true;
							if (target) {
								const dyingRole = _status.event.dying;
								let needPeach =
									dyingRole && target === dyingRole ? Math.abs(target.hp) + 1 : target.hp < target.maxHp ? 1 : 0;
								if (needPeach > 0) {
									let totalPeach = 0;
									const currentCard = _status.event.card;
									const playerPeaches = player.getCards(
										'hs',
										(c) =>
											get.name(c) === 'tao' &&
											lib.filter.cardEnabled(c, player, 'forceEnable') &&
											lib.filter.cardSavable(c, player, target) &&
											c !== currentCard,
										true
									).length;
									totalPeach += playerPeaches;
									if (dyingRole && get.attitude(player, dyingRole) > 0) {
										const dyingPeaches = dyingRole.getCards(
											'h',
											(c) =>
												get.name(c) === 'tao' &&
												lib.filter.cardSavable(c, dyingRole, dyingRole) &&
												c !== currentCard,
											true
										).length;
										totalPeach += dyingPeaches;
									}
									game.filterPlayer((f) => get.attitude(player, f) > 0 && f !== player && f !== dyingRole).forEach(
										(f) => {
											totalPeach += f.getCards(
												'hs',
												(c) => get.name(c) === 'tao' && lib.filter.cardEnabled(c, f, 'forceEnable'),
												true
											).length;
										}
									);
									isEnough = totalPeach >= needPeach;
								}
							}
							if (!isEnough) return 0;
							let fs = game.filterPlayer((current) => get.attitude(_status.event.player, current) > 0),
								damaged = 0,
								needs = 0;
							fs.forEach((f) => {
								if (!player.canUse('tao', f)) return;
								f.hp <= 1 ? needs++ : f.hp === 2 && damaged++;
							});
							if ((needs && damaged) || player.hasSkillTag('maixie')) return Math.max(9, 5 * needs + 3 * damaged);
							if (needs || damaged > 1) return 8;
							if (damaged) return 7.5;
							return Math.max(5, 9.2 - player.hp);
						},
					},
					result: {
						target(player, target) {
							let isEnough = true;
							const dyingRole = _status.event.dying;
							if (target) {
								let needPeach =
									dyingRole && target === dyingRole ? Math.abs(target.hp) + 1 : target.hp < target.maxHp ? 1 : 0;
								if (needPeach > 0) {
									let totalPeach = 0;
									const currentCard = _status.event.card;
									const playerPeaches = player.getCards(
										'hs',
										(c) =>
											get.name(c) === 'tao' &&
											lib.filter.cardEnabled(c, player, 'forceEnable') &&
											lib.filter.cardSavable(c, player, target) &&
											c !== currentCard,
										true
									).length;
									totalPeach += playerPeaches;
									if (dyingRole && get.attitude(player, dyingRole) > 0) {
										const dyingPeaches = dyingRole.getCards(
											'h',
											(c) =>
												get.name(c) === 'tao' &&
												lib.filter.cardSavable(c, dyingRole, dyingRole) &&
												c !== currentCard,
											true
										).length;
										totalPeach += dyingPeaches;
									}
									game.filterPlayer((f) => get.attitude(player, f) > 0 && f !== player && f !== dyingRole).forEach(
										(f) => {
											totalPeach += f.getCards(
												'hs',
												(c) => get.name(c) === 'tao' && lib.filter.cardEnabled(c, f, 'forceEnable'),
												true
											).length;
										}
									);
									isEnough = totalPeach >= needPeach;
								}
							}
							if (!isEnough) return 0;
							return target.hasSkillTag('maixie') ? 3 : 2;
						},
						target_use(player, target, card) {
							let isEnough = true;
							const dyingRole = _status.event.dying;
							if (target) {
								let needPeach =
									dyingRole && target === dyingRole ? Math.abs(target.hp) + 1 : target.hp < target.maxHp ? 1 : 0;
								if (needPeach > 0) {
									let totalPeach = 0;
									const playerPeaches = player.getCards(
										'hs',
										(c) =>
											get.name(c) === 'tao' &&
											lib.filter.cardEnabled(c, player, 'forceEnable') &&
											lib.filter.cardSavable(c, player, target) &&
											c !== card,
										true
									).length;
									totalPeach += playerPeaches;
									if (dyingRole && get.attitude(player, dyingRole) > 0) {
										const dyingPeaches = dyingRole.getCards(
											'h',
											(c) => get.name(c) === 'tao' && lib.filter.cardSavable(c, dyingRole, dyingRole) && c !== card,
											true
										).length;
										totalPeach += dyingPeaches;
									}
									game.filterPlayer((f) => get.attitude(player, f) > 0 && f !== player && f !== dyingRole).forEach(
										(f) => {
											totalPeach += f.getCards(
												'hs',
												(c) => get.name(c) === 'tao' && lib.filter.cardEnabled(c, f, 'forceEnable'),
												true
											).length;
										}
									);
									isEnough = totalPeach >= needPeach;
								}
							}
							if (!isEnough) return 0;
							let ownIdentity = player.identity;
							let mode = get.mode();
							if (dyingRole && target === dyingRole) {
								const isAlly =
									(ownIdentity === 'zhong' && target.identity === 'zhu') ||
									(ownIdentity === 'fan' && target.identity === 'fan') ||
									(ownIdentity === 'nei' && target === player);
								if (isAlly) return 10;
							}
							const taos = player.getCards(
								'hs',
								(i) => get.name(i) === 'tao' && lib.filter.cardEnabled(i, target, 'forceEnable'),
								true
							);
							if (target !== _status.event.dying) {
								if (
									!player.isPhaseUsing() ||
									player.needsToDiscard(0, (i) => !player.canIgnoreHandcard(i) && taos.includes(i)) ||
									player.hasSkillTag('nokeep', true, { card, target }, true)
								) {
									return 2;
								}
								let min = 8.1 - (4.5 * player.hp) / player.maxHp,
									nd = player.needsToDiscard(
										0,
										(i) => !player.canIgnoreHandcard(i) && (taos.includes(i) || get.value(i) >= min)
									),
									keep = nd ? 0 : 2;
								if (
									nd > 2 ||
									(taos.length > 1 && (nd > 1 || (nd && player.hp < 1 + taos.length))) ||
									(target.identity === 'zhu' &&
										(nd || target.hp < 3) &&
										(mode === 'identity' || mode === 'versus' || mode === 'chess')) ||
									!player.hasFriend()
								) {
									return 2;
								}
								if (
									game.hasPlayer(
										(current) =>
											player !== current &&
											current.identity === 'zhu' &&
											current.hp < 3 &&
											(mode === 'identity' || mode === 'versus' || mode === 'chess') &&
											get.attitude(player, current) > 0
									)
								) {
									keep = 3;
								} else if (nd === 2 || player.hp < 2) return 2;
								if (nd === 2 && player.hp <= 1) return 2;
								if (keep === 3) return 0;
								if (taos.length <= player.hp / 2) keep = 1;
								if (
									keep &&
									game.countPlayer((current) => {
										if (
											player !== current &&
											current.hp < 3 &&
											player.hp > current.hp &&
											get.attitude(player, current) > 2
										) {
											keep += player.hp - current.hp;
											return true;
										}
										return false;
									}) &&
									keep > 2
								)
									return 0;
								return 2;
							}
							if (target.isZhu2() || target === game.boss) return 2;
							if (player !== target) {
								if (target.hp < 0 && taos.length + target.hp <= 0) return 0;
								if (Math.abs(get.attitude(player, target)) < 1) return 0;
							}
							if (!player.getFriends().length) return 2;
							let tri = _status.event.getTrigger(),
								num = game.countPlayer(
									(current) =>
										get.attitude(current, target) > 0 &&
										current.getCards(
											'hs',
											(i) => get.name(i) === 'tao' && lib.filter.cardEnabled(i, target, 'forceEnable'),
											true
										).length
								),
								dis = 1,
								t = _status.currentPhase || game.me;
							while (t !== target) {
								const att = get.attitude(player, t);
								att < -2 ? dis++ : att < 1 && (dis += 0.45);
								t = t.next;
							}
							if (mode === 'identity') {
								if (tri && tri.name === 'dying') {
									if (target.identity === 'fan') {
										if (
											(!tri.source && player !== target) ||
											(tri.source && tri.source !== target && player.getFriends().includes(tri.source.identity))
										) {
											return num > dis ||
												(player === target && player.getCards('hs', { type: 'basic' }, true).length > 1.6 * dis)
												? 2
												: 0;
										}
									} else if (
										tri.source &&
										tri.source.isZhu &&
										(target.identity === 'zhong' || target.identity === 'mingzhong') &&
										(tri.source.getCards('he', true).length > 2 ||
											(player === tri.source && player.hasCard((i) => i.name !== 'tao', 'he')))
									) {
										return 2;
									}
								}
								if (
									player.identity === 'zhu' &&
									player.hp <= 1 &&
									player !== target &&
									taos.length + player.getCards('hs', 'jiu', true).length <=
										Math.min(
											dis,
											game.countPlayer((current) => current.identity === 'fan')
										)
								) {
									return 0;
								}
							} else if (
								mode === 'stone' &&
								target.isMin() &&
								player !== target &&
								tri &&
								tri.name === 'dying' &&
								player.side === target.side &&
								tri.source !== target.getEnemy()
							) {
								return 0;
							}
							return 2;
						},
					},
					tag: { recover: 1, save: 1 },
				},
				// 桃园结义
				taoyuan: {
					basic: {
						order(item, player) {
							let allyLoseHp = 0,
								enemyLoseHp = 0;
							game.countPlayer((current) => {
								if (!current.isIn()) return;
								const att = get.attitude(player, current);
								const loseHp = current.maxHp - current.hp;
								att > 0 ? (allyLoseHp += loseHp) : att < 0 && (enemyLoseHp += loseHp);
							});
							return game.hasPlayer((current) => get.attitude(player, current) > 0 && current.hp <= 1) ||
								allyLoseHp > enemyLoseHp
								? 1
								: 10;
						},
						useful: [3, 1],
						value: 0,
					},
					result: {
						player(player) {
							let allyLoseHp = 0,
								enemyLoseHp = 0;
							game.countPlayer((current) => {
								if (!current.isIn()) return;
								const att = get.attitude(player, current);
								const loseHp = current.maxHp - current.hp;
								att > 0 ? (allyLoseHp += loseHp) : att < 0 && (enemyLoseHp += loseHp);
							});
							const hasAllyLowHp = game.hasPlayer((current) => get.attitude(player, current) > 0 && current.hp <= 1);
							return hasAllyLowHp || allyLoseHp > enemyLoseHp ? 1 : -1;
						},
						target(player, target) {
							return target.hp < target.maxHp ? 2 : 0;
						},
					},
					tag: { recover: 0.5, multitarget: 1 },
				},
			};

			// 挂载卡牌优化逻辑到lib.card
			Object.keys(optimizeCards).forEach((cardName) => {
				if (lib.card[cardName]) {
					lib.card[cardName].ai = { ...lib.card[cardName].ai, ...optimizeCards[cardName] };
				}
			});

			// 打印加载日志
			const loadedCards = Object.keys(optimizeCards).map((cardId) => ({
				cardId: cardId,
				cardName: get.translation(cardId) || cardId,
			}));
			console.log('[AI出牌逻辑] 卡牌优化加载完成：', loadedCards);
		},
	};
}
