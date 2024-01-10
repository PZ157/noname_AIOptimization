game.import('extension', function (lib, game, ui, get, ai, _status) {
	return {
		name: "AI优化",
		editable: false,
		content: function (config, pack) {
			//非常感谢@柚子丶奶茶丶猫以及面具 提供的《云将》相关部分AI优化的修复代码

			/*bug修复*/
			if (lib.card.huogong) lib.card.huogong.content=function(){
				"step 0"
				if(target.countCards('h')==0){
					event.finish();
					return;
				}
				else if(target.countCards('h')==1) event._result={cards:target.getCards('h')};
				else target.chooseCard(true).ai=function(card){
					if(_status.event.getRand()<0.5) return Math.random();
					return get.value(card);
				};
				"step 1"
				target.showCards(result.cards).setContent(function(){});
				event.dialog=ui.create.dialog(get.translation(target)+'展示的手牌',result.cards);
				event.videoId=lib.status.videoId++;

				game.broadcast('createDialog',event.videoId,get.translation(target)+'展示的手牌',result.cards);
				game.addVideo('cardDialog',null,[get.translation(target)+'展示的手牌',get.cardsInfo(result.cards),event.videoId]);
				event.card2=result.cards[0];
				game.log(target,'展示了',event.card2);
				game.addCardKnower(result.cards,'everyone');
				event._result={};
				player.chooseToDiscard({suit:get.suit(event.card2)},function(card){
					var evt=_status.event.getParent();
					if(get.damageEffect(evt.target,evt.player,evt.player,'fire')>0){
						return 6.2+Math.min(4,evt.player.hp)-get.value(card,evt.player);
					}
					return -1;
				}).set('prompt',false);
				game.delay(2);
				"step 2"
				if(result.bool){
					target.damage('fire');
				}
				else{
					target.addTempSkill('huogong2');
				}
				event.dialog.close();
				game.addVideo('cardDialog',null,event.videoId);
				game.broadcast('closeDialog',event.videoId);
			};
			if (lib.skill.new_liyu) lib.skill.new_liyu.content=function(){
				'step 0'
				player.gainPlayerCard(get.prompt('new_liyu',trigger.player),trigger.player,'hej','visibleMove').set('ai',function(button){
					var player=_status.event.player,target=_status.event.target;
					if(get.attitude(player,target)>0&&get.position(button.link)==='j') return 4+get.value(button.link);
					if(get.type(button.link)==='equip') return _status.event.juedou;
					return 3;
				}).set('logSkill',['new_liyu',trigger.player]).set('juedou',(()=>{
					if(get.attitude(player,trigger.player)>0&&game.hasPlayer(function(current){
						return (player.canUse({name:'juedou'},current)&&current!=trigger.player&&current!=player&&get.effect(current,{name:'juedou'},player,_status.event.player)>2);
					})) return 5;
					if(game.hasPlayer(function(current){
						return (player.canUse({name:'juedou'},current)&&current!=trigger.player&&current!=player&&get.effect(current,{name:'juedou'},player,_status.event.player)<0);
					})) return 1;
					return 4;
				})());
				'step 1'
				if(result.bool){
					if(get.type(result.cards[0])!='equip'){
						trigger.player.draw();
						event.finish();
					}
					else{
						if(!game.hasPlayer(function(current){
							return current!=player&&current!=trigger.player&&player.canUse('juedou',current);
						})){
							event.finish();
							return;
						}
						trigger.player.chooseTarget(true,function(card,player,target){
							var evt=_status.event.getParent();
							return evt.player.canUse({name:'juedou'},target)&&target!=_status.event.player;
						},'请选择一名角色，视为'+get.translation(player)+'对其使用【决斗】').set('ai',function(target){
							var evt=_status.event.getParent();
							return get.effect(target,{name:'juedou'},evt.player,_status.event.player)-2;
						});
					}
				}
				else event.finish();
				'step 2'
				if(result.targets) player.useCard({name:'juedou',isCard:true},result.targets[0],'noai');
			};
			if (lib.skill.dczhizhe&&lib.skill.dczhizhe.subSkill&&lib.skill.dczhizhe.subSkill.effect) lib.skill.dczhizhe.subSkill.effect.mod={
				aiOrder:function(player,card,num){
					if(num>0&&get.itemtype(card)==='card'&&card.hasGaintag('dczhizhe')) return num+0.16;
				},
				aiValue:function(player,card,num){
					if(num>0&&get.itemtype(card)==='card'&&card.hasGaintag('dczhizhe')) return 2*num;
				},
				aiUseful:function(player,card,num){
					if(num>0&&!player._dczhizhe_mod&&get.itemtype(card)==='card'&&card.hasGaintag('dczhizhe')){
						if(player.canIgnoreHandcard(card)) return Infinity;
						player._dczhizhe_mod=true;
						if(player.hp<3&&player.needsToDiscard(0,(i,player)=>{
							return !player.canIgnoreHandcard(i)&&get.useful(i)>6;
						})) return num*1.5;
						return num*10;
					}
				}
			};
			if (lib.skill.channi&&lib.skill.channi.subSkill&&lib.skill.channi.subSkill.backup) lib.skill.channi.subSkill.backup.ai1=(card)=>{
				if(get.name(card)==='sha') return 0;
				return 5.5-get.value(card);
			};
			if (lib.skill.dcenyu) lib.skill.dcenyu.ai={
				effect:{
					target:(card,player,target)=>{
						if(player===target) return;
						if(game.hasPlayer2(current=>{
							return current.hasHistory('useCard',evt=>evt.card.name==card.name&&evt.targets&&evt.targets.includes(target));
						})&&(card.name=='sha'||get.type(card)=='trick')) return 'zeroplayertarget';
					}
				}
			};
			if (lib.skill.olchuming) lib.skill.olchuming.check=(event,player)=>{
				if(event.source===event.player) return false;
				if(!event.card||!event.cards||!event.cards.length) return true;
				let target=event[player===event.source?'player':'source'];
				return target&&target.isIn();
			};
			if (lib.skill.lingce) lib.skill.lingce.filter=function(event,player){
				if(!event.card.isCard||!event.cards||event.cards.length!==1) return false;
				return event.card.name=='qizhengxiangsheng'||get.zhinangs().includes(event.card.name)||player.getStorage('dinghan').includes(event.card.name);
			};
			if (lib.skill.manyi) lib.skill.manyi.ai={
				effect:{
					target:function(card,player,target){
						if(card.name=='nanman') return 'zeroplayertarget';
					},
				},
			};
			if (lib.skill.gzzhengrong) lib.skill.gzzhengrong.check=function(event,player){
				return !event.player.hasSkillTag('filterDamage',null,{
					player:event.source,
					card:event.card,
				})&&get.damageEffect(event.player,event.source,player,_status.event.player)>0;
			};
			if (lib.skill.drlt_duorui) lib.skill.drlt_duorui.filter=function(event,player){
				if(get.attitude(_status.event.player,event.player)>=0) return false;
				if(player.storage.drlt_duorui.length) return false;
				return event.player.isIn()&&_status.currentPhase==player;
			};

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
						_status.aiyh_MAXNUM = 0;
						for (let i of ui.cardPile.childNodes) {
							_status.aiyh_MAXNUM = Math.max(_status.aiyh_MAXNUM, get.number(i));
						}
						if (!_status.aiyh_MAXNUM) _status.aiyh_MAXNUM = 13;
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
							if (lib.config.extension_AI优化_nhFriends != 'off' && !player._nhFriends_temp && get.itemtype(target) == 'player' && player != game.me && get.tag(card, 'damage') && card.name != 'huogong' && (!lib.config.extension_AI优化_ntAoe || card.name != 'nanman' && card.name != 'wanjian') && get.attitude(player, target) > 0) {
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
					player.chooseControl(list).set('prompt', get.translation(event.name) + '的 权重：<font color=#FFFF00>' + event.qz + '</font>').set('prompt2', '该值将作为内奸AI判断角色实力的首选').set('ai', function () {
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
					player.chooseControl(con).set('prompt', '<font color=#00FFFF>' + get.translation(event.target) + '</font>的【<font color=#FFFF00>' + get.translation(event.skill) + '</font>】：当前为<font color=#00FFFF>' + event.th + '</font>').set('prompt2', str).set('ai', function () {
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
			lib.skill._aiyh_filterSameName={//同名武将筛选
				enable:'phaseUse',
				filter:(event,player)=>{
					return player===game.me&&lib.config.extension_AI优化_filterSameName;
				},
				filterTarget:true,
				log:false,
				charlotte:true,
				superCharlotte:true,
				prompt:'在当前模式快速启用或禁用所选武将的同名武将',
				content:()=>{
					'step 0'
					event.num=1;
					event.banname=get.mode()+'_banned';
					event.name=target.name1.split('_');
					'step 1'
					event.name=event.name[event.name.length-1];
					event.enable=[];
					event.disable=[];
					for(let i in lib.character){
						let temp=i.split('_');
						if(temp[temp.length-1]===event.name){
							if(lib.filter.characterDisabled(i)) event.disable.push(i);
							else event.enable.push(i);
						}
					}
					if(event.enable.length) player.chooseButton(['选择要禁用的武将，直接点“确定”则全部禁用',[event.enable,'character']],[0,Infinity]).set('ai',button=>0);
					else event.goto(3);
					'step 2'
					if(result.bool){
						let arr;
						if(result.links&&result.links.length) arr=result.links;
						else arr=event.enable;
						lib.config.extension_AI优化_sameName[get.mode()].addArray(arr);
						lib.config[event.banname].addArray(arr);
					}
					'step 3'
					if(event.disable.length) player.chooseButton(['选择要启用的武将，直接点“确定”则全部启用',[event.disable, 'character']],[0,Infinity]).set('ai',button=>0);
					'step 4'
					if(result.bool){
						let arr;
						if(result.links&&result.links.length) arr=result.links;
						else arr=event.disable;
						lib.config.extension_AI优化_sameName[get.mode()].removeArray(arr);
						lib.config[event.banname].removeArray(arr);
					}
					game.saveExtensionConfig('AI优化','sameName',lib.config.extension_AI优化_sameName);
					game.saveConfig(event.banname,lib.config[event.banname]);
					if(event.num&&target.name2){
						event.num=0;
						event.name=target.name2.split('_');
						event.goto(1);
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
							if (!player.hasSkill('gjcx_neiZhong') && !player.hasSkill('gjcx_neiJiang') && (player.hp <= 2 && game.zhu.hp <= 2 || game.zhu.isHealthy() && lib.config.extension_AI优化_sfjAi) || game.zhu.hp <= 1 && !player.countCards('hs', 'tao') && (player.hasSkill('gjcx_neiZhong') || !lib.config.extension_AI优化_sfjAi)) return 1;
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
						else if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(player.name1) || player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name1) || (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(player.name1) || player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name1))) event.num = 0;
						else if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name1) || player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name1))) event.num = 0;
					}
					if (event.num === -1 && player.name2 != undefined) {
						if (lib.config.extension_AI优化_wj.includes(player.name2)) event.num = 1;
						else if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(player.name2) || player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(player.name2) || (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(player.name2) || player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(player.name2))) event.num = 1;
						else if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(player.name2) || player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(player.name2))) event.num = 1;
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
						if (get.mode() == 'identity' && ((player == game.zhu || player == game.rZhu || player == game.bZhu) && lib.config.extension_AI优化_zhu.includes(_status.aiyhlist[i]) || player.identity == 'nei' && lib.config.extension_AI优化_nei.includes(_status.aiyhlist[i]) || (player == game.zhong || player.identity == 'zhong') && lib.config.extension_AI优化_zhong.includes(_status.aiyhlist[i]) || player.identity == 'fan' && lib.config.extension_AI优化_fan.includes(_status.aiyhlist[i]))) continue;
						if (get.mode() == 'doudizhu' && (player == game.zhu && lib.config.extension_AI优化_dizhu.includes(_status.aiyhlist[i]) || player.identity == 'fan' && lib.config.extension_AI优化_nongmin.includes(_status.aiyhlist[i]))) continue;
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
			lib.translate._aiyh_filterSameName='<font color=#39FF14>同名武将筛选</font>';
			lib.translate._aiyh_neiKey = '<font color=#8DD8FF>亮明身份</font>';
			lib.translate._aiyh_fixQz = '<font color=#FFFF00>修改权重</font>';
			lib.translate._aiyh_fixCf = '<font color=#FF3300>修改威胁度</font>';
			lib.translate._aiyh_fixWj = '<font color=#00FFFF>伪禁</font>';

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
						else if (all > 0) {
							if (all > 0.618 * mine) player.addSkill('gjcx_neiFan');
							else if (zs.length == 1) player.addSkill('gjcx_neiZhong');
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
								} else if (trigger.targets && trigger.targets.length == 1 && player != trigger.targets[0] && !player.hasSkill('gjcx_neiZhong') && !player.hasSkill('gjcx_neiJiang') && get.attitude(game.zhu, trigger.targets[0]) * get.effect(trigger.targets[0], trigger.card, player, game.zhu) < 0) {
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
			{//本体版本检测
				let noname = lib.version.split('.').slice(2), min = ['4'], len = Math.min(noname.length, min.length), status = false;
				if (lib.version.slice(0, 5) === '1.10.') for (let i = 0; i < len; i++) {
					if (noname[i] < min[i]) {
						status = '您的无名杀版本太低';
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
					'<center><font color=#00FFFF>更新日期</font>：<font color=#FFFF00>24</font>年<font color=#00FFB0>1</font>月<font color=fire>10</font>日</center>',
					'◆优化界黄忠、OL界黄忠〖烈弓〗，OL邓芝〖修好〗ai',
					'◆修复TW神关羽〖武魂〗前瞻ai弹窗',
					'◆修复版本号显示错误的问题',
					'◆其他bug修复'
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
				if(Object.prototype.toString.call(lib.config.extension_AI优化_sameName) !== '[object Object]') lib.config.extension_AI优化_sameName={};
				if(!Array.isArray(lib.config.extension_AI优化_sameName[get.mode()])) lib.config.extension_AI优化_sameName[get.mode()]=[];
				lib.config.forbidai.addArray(lib.config.extension_AI优化_sameName[get.mode()]);
				game.saveExtensionConfig('AI优化','sameName',lib.config.extension_AI优化_sameName);
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
				for (i in lib.config.extension_AI优化_qz) {
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
				for (i in lib.config.extension_AI优化_cf) {
					cf += '<option value=' + i + '>' + i + ' | ' + (lib.translate[i] || '无') + '：' + lib.config.extension_AI优化_cf[i] + '</option>';
				}
				lib.extensionMenu.extension_AI优化.chooseCf.name = '<span style="font-family: xinwei">请选择要删除的技能威胁度</span><br><select id="AI优化_chooseCf" size="1" style="width:180px">' + cf + '</select>';
				for (let i in lib.character) {//显示隐藏武将
					if (lib.config.extension_AI优化_seen && lib.character[i] && lib.character[i][4] && lib.character[i][4].includes('unseen')) lib.character[i][4].remove('unseen');
				}
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
			});
			if (lib.config.extension_AI优化_wjAi) lib.arenaReady.push(function () {//武将AI
				if (game.aiyh_skillOptEnabled('xinfu_limu')) lib.skill.xinfu_limu = {
					mod: {
						targetInRange: function (card, player, target) {
							if (player.countCards('j') && player.inRange(target)) {
								return true;
							}
						},
						cardUsableTarget: function (card, player, target) {
							if (player.countCards('j') && player.inRange(target)) return true;
						},
						aiValue: function (player, card, num) {
							if (card.name == 'zhangba') return 30;
							if (player.getEquip('zhangba') && player.countCards('hs') > 1 && ['shan', 'tao', 'jiu'].includes(card.name)) return 0;
							if (card.name == 'shan' || card.name == 'tao' || card.name == 'jiu') return num / 3;
						}
					},
					locked: false,
					audio: 2,
					enable: 'phaseUse',
					discard: false,
					filter: function (event, player) {
						if (player.hasJudge('lebu')) return false;
						return player.countCards('hes', { suit: 'diamond' }) > 0;
					},
					viewAs: {
						name: 'lebu'
					},
					position: 'hes',
					filterCard: function (card, player, event) {
						return get.suit(card) == 'diamond' && player.canAddJudge({ name: 'lebu', cards: [card] });
					},
					selectTarget: -1,
					filterTarget: function (card, player, target) {
						return player == target;
					},
					check: function (card) {
						var player = _status.event.player;
						if (!player.getEquip('zhangba') && player.countCards('hs', 'sha') < 2) {
							if (
								player.countCards('h', function (cardx) {
									return cardx != card && cardx.name == 'shan';
								}) > 0
							)
								return 0;
							var damaged = player.maxHp - player.hp - 1;
							var ts = player.countCards('h', function (cardx) {
								return cardx != card && cardx.name == 'tao';
							});
							if (ts > 0 && ts > damaged) return 0;
						}
						if (card.name == 'shan') return 15;
						if (card.name == 'tao') return 10;
						return 9 - get.value(card);
					},
					onuse: function (links, player) {
						var next = game.createEvent('limu_recover', false, _status.event.getParent());
						next.player = player;
						next.setContent(function () {
							player.recover();
						});
					},
					ai: {
						result: {
							target: 1,
							ignoreStatus: true
						},
						order: function (item, player) {
							if (player.countCards('hs', 'zhangba') || player.countCards('h', function (card) {
								return get.suit(card) == 'diamond' && get.type(card) == 'basic';
							}) == 1 && player.countCards('h', function (card) {
								return get.name(card) != 'sha' && get.type(card) == 'basic';
							}) == 1 && player.countCards('h', { type: 'trick' }) > 0) return get.order({ name: 'sha' }) + 1;
							if (player.getDamagedHp() >= 2) return 5;
							if (game.hasPlayer(function (current) {
								return current != player && player.inRange(current) && get.attitude(player, current) <= 0;
							})) {
								if (player.countCards('hs', 'sha') > 1) return 3;
								if (player.countCards('h', 'sha') > 0 && player.countCards('h', 'tao') == 0 && player.countCards('h', 'shan') == 0 && player.countCards('h', 'jiu') == 0) return 3;
								if (player.countCards('h', function (card) {
									return get.suit(card) == 'diamond' && get.type(card) == 'basic';
								}) == 1 && player.countCards('h', function (card) {
									return get.name(card) != 'sha' && get.type(card) == 'basic';
								}) == 1 && (player.countCards('h', 'taoyuan') > 0 || player.countCards('h', 'wugu') > 0 || player.countCards('h', 'tiesuo') > 0 || player.countCards('h', 'nanman') > 0 || player.countCards('h', 'wanjian') > 0)) return 12;
							}
							if (player.getEquip('zhangba')) return 15;
							return 0;
						},
						effect: {
							player: function (card, player, target) {
								if (card.name == 'zhangba' && player.hasSkill('xinfu_tushe')) {
									return [3.5, 3.5];
								}
								if (player.countCards('h', 'jiu') + player.countCards('h', 'tao') == 1 && player.countCards('h', { type: 'basic' }) == 1 && player.hasSkill('xinfu_tushe')) {
									if (card.name == 'tao') {
										return [2.5, 2.5];
									}
									if (card.name == 'jiu') {
										return [2.5, 2.5];
									}
								}
								if (player.getEquip('zhangba') && player.hasSkill('xinfu_tushe')) {
									if (get.attitude(player, target) <= 0 && card.name == 'sha') {
										return [2.5, 2.5];
									}
									if (card.name == 'jiu') {
										return [2.5, 2.5];
									}
									if (!player.countCards('h', { type: 'basic' })) {
										if (get.type2(card) == 'trick') {
											return [3, 3];
										}
									}
								}
								if (!player.countCards('h', { type: 'basic' }) && player.countCards('j') && player.hasSkill('xinfu_tushe')) {
									if (card.name == 'wugu' || card.name == 'taoyuan' || card.name == 'tiesuo') {
										return [1, 1.5];
									}
								}
							}
						},
						basic: {
							order: 1,
							useful: 1,
							value: 8
						},
						tag: {
							skip: 'phaseUse'
						}
					}
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
				if (lib.skill.qianlong && game.aiyh_skillOptEnabled('qianlong')) lib.skill.qianlong.content = function () {
					'step 0'
					var cards = get.cards(3);
					event.cards = cards;
					game.cardsGotoOrdering(cards);
					//展示牌
					game.log(player, '展示了', event.cards);
					event.videoId = lib.status.videoId++;
					game.broadcastAll(
						function (player, id, cards) {
							if (player == game.me || player.isUnderControl()) return;
							var str = get.translation(player) + '发动了【潜龙】';
							var dialog = ui.create.dialog(str, cards);
							dialog.videoId = id;
						},
						player,
						event.videoId,
						event.cards
					);
					game.addVideo('showCards', player, [get.translation(player) + '发动了【潜龙】', get.cardsInfo(event.cards)]);
					if (player != game.me && !player.isUnderControl() && !player.isOnline()) game.delay(2);
					//选牌
					var next = player.chooseToMove('潜龙：获得至多' + get.cnNumber(Math.min(3, player.getDamagedHp())) + '张牌并将其余牌置于牌堆底');
					next.set('list', [['置于牌堆底', cards], ['自己获得']]);
					next.set('filterMove', function (from, to, moved) {
						if (moved[0].includes(from.link)) {
							if (typeof to == 'number') {
								if (to == 1) {
									if (moved[1].length >= _status.event.player.getDamagedHp()) return false;
								}
								return true;
							}
						}
						return true;
					});
					next.set('processAI', function (list) {
						var cards = list[0][1].slice(0),
							player = _status.event.player;
						cards.sort(function (a, b) {
							return get.value(b, player) - get.value(a, player);
						});
						if (player.hasCard('sha') && player.storage.juetao == false) {
							var gain,
								bottom = [];
							var pai = cards.filter(function (card) {
								return card.name != 'sha';
							});
							if (pai.length <= player.getDamagedHp()) {
								var gain = pai;
							} else {
								pai.sort(function (a, b) {
									return get.value(b, player) - get.value(a, player);
								});
								var gain = pai.splice(0, player.getDamagedHp());
								var bottom = bottom.push(pai);
							}
							return [bottom, gain];
						} else {
							return [cards, cards.splice(0, _status.event.player.getDamagedHp())];
						}
					});
					'step 1'
					game.broadcastAll('closeDialog', event.videoId);
					game.addVideo('cardDialog', null, event.videoId);
					var moved = result.moved;
					if (moved[0].length > 0) {
						for (var i of moved[0]) {
							i.fix();
							ui.cardPile.appendChild(i);
						}
					}
					if (moved[1].length > 0) player.gain(moved[1], 'gain2');
				};
				if (lib.skill.drlt_jieying && game.aiyh_skillOptEnabled('drlt_jieying')) {
					lib.skill.drlt_jieying.ai = {
						effect: {
							player: function (card, player, target) {
								if (get.name(card) == 'lebu' && get.attitude(player, target) < 0) return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7;
							}
						}
					};
					if (lib.skill.drlt_jieying && lib.skill.drlt_jieying.subSkill && lib.skill.drlt_jieying.subSkill['2']) lib.skill.drlt_jieying.subSkill['2'].content = function () {
						'step 0'
						player.chooseTarget(get.prompt('drlt_jieying'), '将“营”交给一名角色；其摸牌阶段多摸一张牌，出牌阶段使用【杀】的次数上限+1且手牌上限+1。该角色回合结束后，其移去“营”标记，然后你获得其所有手牌。', function (card, player, target) {
							return target != player;
						}).ai = function (target) {
							if (get.attitude(player, target) > 0 && target.countCards('h') > 3 && (target.hp > 2 || (target.hp > 1 && target.getEquip(2)))) return 0.8 * target.countCards('h');
							if (get.attitude(player, target) < 1 && target.countCards('h') >= 0 && target.countCards('j', { name: 'lebu' }) > 0) return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7 + 2;
							if (get.attitude(player, target) < 1 && target.countCards('h') > 0) {
								if (target.hasSkillTag('directHit_ai', true, {
									target: player,
									card: new lib.element.VCard({ name: 'sha' })
								}, true)) return 0;
								if (target.getEquip('zhangba') || target.getEquip('guanshi')) return 0;
								if (player.countCards('e', function (card) {
									return get.subtype(card) == 'equip2' && get.name(card) != 'baiyin';
								}) && !target.hasSkillTag('unequip_ai', false, {
									name: card ? card.name : null,
									target: target,
									card: card
								})) return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7;
								if (player.countCards('h', { name: 'shan' }) > 1 && !target.getEquip('qinglong')) return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7;
								if (!target.inRange(player)) return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7;
							}
							return 0;
						};
						'step 1'
						if (result.bool) {
							var target = result.targets[0];
							player.line(target);
							player.logSkill('drlt_jieying', target);
							var mark = player.countMark('drlt_jieying_mark');
							player.removeMark('drlt_jieying_mark', mark);
							target.addMark('drlt_jieying_mark', mark);
						}
					};
				};
				if (lib.skill.twxuechang && lib.skill.twxuechang.ai && game.aiyh_skillOptEnabled('twxuechang')) lib.skill.twxuechang.ai.result = {
					player: function (player, target) {
						var hs = player.getCards('h').sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var a = get.number(hs[0]) - 1;
						if (player.hp > 1) return 2.5 * Math.pow((a / _status.aiyh_MAXNUM), target.countCards('h')) - 2.5;
						return 4.2 * Math.pow(a / _status.aiyh_MAXNUM, target.countCards('h')) - 4.2;
					},
					target: function (player, target) {
						var hs = player.getCards('h').sort(function (a, b) {
							return get.number(b) - get.number(a);
						});
						var a = get.number(hs[0]) - 1;
						if (player.hp > 1) return -2 - 0.7 * Math.pow((a / _status.aiyh_MAXNUM), target.countCards('h'));
						return -1.7 - Math.pow((a / _status.aiyh_MAXNUM), target.countCards('h'));
					}
				};
				//nsp
				if (lib.config.extension_AI优化_dev) {
					if (lib.skill.xinliegong&&game.aiyh_skillOptEnabled('xinliegong')) lib.skill.xinliegong.mod={
						aiOrder:function(player,card,num){
							if(num>0&&(card.name==='sha'||get.tag(card,'draw'))) return num+6;
						},
						targetInRange:function(card,player,target){
							if(card.name=='sha'&&typeof get.number(card)=='number'){
								if(get.distance(player,target)<=get.number(card)) return true;
							}
						}
					};
					if (lib.skill.olxiuhao&&game.aiyh_skillOptEnabled('olxiuhao')) lib.skill.olxiuhao.check=function(event,player){
						_status.olxiuhao_judging=true;
						var bool=false;
						if(get.attitude(player,event.player)>0) bool=true;
						else if(2*get.effect(event.source,{name:'draw'},player,_status.event.player)+event.num*get.damageEffect(player,event.source,_status.event.player,event.nature)>0) bool=true;
						else if(event.source.hasSkillTag('nogain')) bool=true;
						delete _status.olxiuhao_judging;
						return bool;
					};
					if (lib.skill.zhenlie&&game.aiyh_skillOptEnabled('zhenlie', '优化〖贞烈〗ai', 'zhenlie_check')) lib.skill.zhenlie.check=function(event,player){
						if(event.getParent().excluded.includes(player)) return false;
						if(get.attitude(player,event.player)>0||player.hp<2&&!get.tag(event.card,'damage')) return false;
						let evt=event.getParent(),
							directHit=evt.nowuxie&&get.type(event.card,'trick')==='trick'||evt.directHit&&evt.directHit.includes(player)||evt.customArgs&&evt.customArgs.default&&evt.customArgs.default.directHit2;
						if(get.tag(event.card,'respondSha')){
							if(directHit||player.countCards('h',{name:'sha'})===0) return true;
						}
						else if(get.tag(event.card,'respondShan')){
							if(directHit||player.countCards('h',{name:'shan'})===0) return true;
						}
						else if(get.tag(event.card,'damage')){
							if(event.card.name==='huogong') return event.player.countCards('h')>4-player.hp-player.hujia;
							if(event.card.name==='shuiyanqijunx') return player.countCards('e')===0;
							return true;
						}
						else if(player.hp>2){
							if(event.card.name==='shunshou'||(event.card.name==='zhujinqiyuan'&&(event.card.yingbian||get.distance(event.player,player)<0))) return true;
						}
						return false;
					};
					if (lib.skill.renjie2&&game.aiyh_skillOptEnabled('renjie2')) lib.skill.renjie2.mod={
						aiOrder:(player,card,num)=>{
							if(num<=0||typeof card!=='object'||!player.isPhaseUsing()) return 0;
							if(player.awakenedSkills.includes('sbaiyin')){
								if(player.countMark('renjie')<3&&player.getUseValue(card)<Math.min(1.8,0.18*player.hp*player.hp)) return 0;
							}
							else if(player.countMark('renjie')<4&&player.getUseValue(card)<Math.min(4,player.hp*player.hp/4)) return 0;
						}
					};
					if (lib.skill.jsrgfenjian&&game.aiyh_skillOptEnabled('jsrgfenjian')){
						if(lib.skill.jsrgfenjian.chooseButton) lib.skill.jsrgfenjian.chooseButton.check=function(button){
							if(button.link[2]==='tao'){
								let dying=_status.event.getParent(2).dying;
								if(dying) return get.effect(dying,{
									name:'tao',
									isCard:true,
									storage:{jsrgfenjian:true},
								},_status.event.player);
							}
							return _status.event.player.getUseValue({
								name:button.link[2],
								isCard:true,
								storage:{jsrgfenjian:true},
							});
						};
						if(lib.skill.jsrgfenjian.ai) lib.skill.jsrgfenjian.ai.result={
							player:(player)=>{
								if(_status.event.dying) return 2*get.sgnAttitude(player,_status.event.dying);
								return 1;
							}
						};
					}
					if (lib.skill.clanhuanghan&&game.aiyh_skillOptEnabled('clanhuanghan')){
						lib.skill.clanhuanghan.check=(event,player)=>{
							let num=get.cardNameLength(event.card)-player.getDamagedHp();
							if(num>=0) return true;
							if(num<-1) return false;
							if(player.hasSkill('clanbaozu',null,false,false)&&player.awakenedSkills.includes('clanbaozu')&&player.getHistory('useSkill',evt=>{
								return evt.skill=='clanhuanghan';
							}).length) return true;
							return false;
						};
						if(lib.skill.clanhuanghan.ai) lib.skill.clanhuanghan.ai.effect={
							target:(card,player,target)=>{
								if(!get.tag(card,'damage')||player.hasSkillTag('jueqing',false,target)) return;
								let num=get.cardNameLength(card)-target.getDamagedHp();
								if(num>0) return [1,num+0.1];
							}
						};
					}
					if (lib.skill.redanxin&&lib.skill.redanxin.ai&&game.aiyh_skillOptEnabled('redanxin')) lib.skill.redanxin.ai.effect={
						target:(card,player,target)=>{
							if(!get.tag(card,'damage')) return;
							if(target.hp+target.hujia<2||player.hasSkillTag('jueqing',false,target)) return -2;
							if(target.countMark('redanxin')>1) return [1,1];
							return [1,Math.min(2,0.8*target.hp-0.7)];
						}
					};
					if (lib.skill.qinxue&&game.aiyh_skillOptEnabled('qinxue')){
						lib.skill.qinxue.mod = {
							aiOrder:(player,card,num)=>{
								if(num<=0||!player.isPhaseUsing()||get.itemtype(card)!=='card') return num;
								if(player.countCards('h')>=player.hp+2) return 0;
							}
						};
						lib.skill.qinxue.ai = {
							effect:{
								target:(card,player,target)=>{
									if(card.name==='shan'&&target.isHealthy()&&target.hp>1) return 'zeroplayertarget';
								}
							}
						};
					}
					if (lib.skill.tairan2&&game.aiyh_skillOptEnabled('tairan2')) lib.skill.tairan2.mod={
						aiOrder:function(player,card,num){
							if(card.hasGaintag&&card.hasGaintag('tairan')) return num/10;
						},
						aiValue:function(player,card,num){
							if(card.hasGaintag&&card.hasGaintag('tairan')){
								if(card.name!=='wuxie'&&(get.type(card)==='basic'||get.type(card,'trick')==='trick')) return num/64;
								return num/8;
							}
						},
						aiUseful:function(player,card,num){
							return lib.skill.tairan2.mod.aiValue.apply(this,arguments);
						}
					};
					if (lib.skill.dcchangqu&&game.aiyh_skillOptEnabled('dcchangqu')) lib.skill.dcchangqu.content=function(){
						'step 0'
						event.targets=event.getParent()._dcchangqu_targets;
						var current=targets[0];
						current.addMark('dcchangqu_warship');
						current.addMark('dcchangqu_warshipx',1,false);
						event.num=0;
						game.delayx();
						'step 1'
						var target=targets.shift();
						event.target=target;
						var num=Math.max(1,event.num);
						var nextPlayer=targets.find(i=>{
							return i.isIn();
						});
						if(target.hasMark('dcchangqu_warshipx')){
							var prompt2='是否交给'+get.translation(player)+get.cnNumber(num)+'张手牌？'+(nextPlayer?'若如此做，将“战舰”移动给'+get.translation(nextPlayer)+'，':'，')+'否则你下次受到的属性伤害值+'+num;
							target.chooseCard(get.translation(player)+'对你发动了【长驱】',prompt2).set('ai',card=>{
								if(_status.event.att>0) return 12-get.value(card);
								if(_status.event.take) return 0;
								return 8.2-0.8*Math.min(5,_status.event.target.hp+_status.event.target.hujia)-get.value(card);
							}).set('att',get.attitude(target,player)).set('take',function(){
								var base=num;
								var getEffect=function(target,player,num){
									var natures=['fire','thunder','ice'];
									return natures.map(nature=>{
										return get.damageEffect(target,target,player,nature)*Math.sqrt(num)/Math.min(1.5,1+target.countCards('h'));
									}).reduce((sum,eff)=>{
										return sum+eff;
									},0)/natures.length;
								}
								var eff=getEffect(player,player,base);
								return targets.some((current,ind)=>{
									var num=base+ind+1;
									var effx=getEffect(current,player,num);
									return effx<eff;
								});
							}).set('target',target);
						}
						else event.goto(4);
						'step 2'
						if(result.bool){
							var cards=result.cards;
							target.give(cards,player);
							event.num++;
						}
						else{
							target.addSkill('dcchangqu_add');
							target.addMark('dcchangqu_add',Math.max(1,event.num),false);
							target.link(true);
							event.goto(4);
						}
						'step 3'
						var nextPlayer=targets.find(i=>{
							return i.isIn();
						});
						if(nextPlayer){
							target.line(nextPlayer);
							nextPlayer.addMark('dcchangqu_warship',target.countMark('dcchangqu_warship'));
							nextPlayer.addMark('dcchangqu_warshipx',target.countMark('dcchangqu_warshipx'),false);
							event.goto(1);
							game.delayx();
						}
						target.removeMark('dcchangqu_warship',target.countMark('dcchangqu_warship'));
						target.removeMark('dcchangqu_warshipx',target.countMark('dcchangqu_warshipx'),false);
						'step 4'
						var targets=game.players.slice().concat(game.dead);
						targets.forEach(i=>{
							delete i.storage.dcchangqu_warshipx;
						});
					};
					if (lib.skill.jsrgjishan&&game.aiyh_skillOptEnabled('jsrgjishan')) lib.skill.jsrgjishan.check=function(event,player){
						return get.damageEffect(event.player,event.source,_status.event.player,event.nature)*event.num <
						get.effect(player,{name:'losehp'},player,_status.event.player)+get.effect(player,{name:'wuzhong'},player,_status.event.player)/2+get.effect(event.player,{name:'wuzhong'},player,_status.event.player)/2;
					};
					if (lib.skill.shouli&&lib.skill.shouli.subSkill&&lib.skill.shouli.subSkill.thunder&&game.aiyh_skillOptEnabled('shouli','增加〖狩骊〗debuff的ai','shouli_thunder')) lib.skill.shouli.subSkill.thunder.ai={
						effect:{
							target:(card,player,target)=>{
								if(!get.tag(card,'damage')) return;
								if(target.hasSkillTag('nodamage')||target.hasSkillTag('nothunder')) return 'zeroplayertarget';
								if(target.hasSkillTag('filterDamage',null,{
									player:player,
									card:new lib.element.VCard({
										name:card.name,
										nature:'thunder'
									},[card])
								})) return;
								return 2;
							}
						}
					};
					if (lib.skill.hengwu&&lib.skill.hengwu.ai&&game.aiyh_skillOptEnabled('hengwu')) lib.skill.hengwu.ai.effect={
						player:(card,player,target)=>{
							if(typeof card!=='object') return;
							let suit=get.suit(card);
							if(!lib.suit.includes(suit)||player.hasCard(function(i){
								return get.suit(i,player)==suit;
							},'h')) return;
							return [1,0.8*game.countPlayer(current=>{
								return current.countCards('e',card=>{
									return get.suit(card,current)==suit;
								});
							})];
						},
						target:(card,player,target)=>{
							if(card.name==='sha'&&!player.hasSkillTag('directHit_ai',true,{
								target:target,
								card:card
							},true)&&game.hasPlayer(current=>{
								return current.hasCard(cardx=>{
									return get.subtype(cardx)==='equip3';
								},'e');
							})) return [0, -0.5];
						}
					};
					if (lib.skill.psshouli&&lib.skill.psshouli.subSkill&&lib.skill.psshouli.subSkill.thunder&&game.aiyh_skillOptEnabled('psshouli','增加〖狩骊〗debuff的ai','psshouli_thunder')) lib.skill.psshouli.subSkill.thunder.ai={
						effect:{
							target:(card,player,target)=>{
								if(!get.tag(card,'damage')) return;
								if(target.hasSkillTag('nodamage')||target.hasSkillTag('nothunder')) return 'zeroplayertarget';
								if(target.hasSkillTag('filterDamage',null,{
									player:player,
									card:new lib.element.VCard({
										name:card.name,
										nature:'thunder'
									},[card])
								})) return;
								return 2;
							}
						}
					};
					if (lib.skill.pshengwu&&lib.skill.pshengwu.ai&&game.aiyh_skillOptEnabled('pshengwu')) lib.skill.pshengwu.ai.effect={
						player:(card,player,target)=>{
							if(typeof card!=='object') return;
							let suit=get.suit(card);
							if(!lib.suit.includes(suit)||player.hasCard(function(i){
								return get.suit(i,player)==suit;
							},'h')) return;
							return [1,0.8*game.countPlayer(current=>{
								return current.countCards('e',card=>{
									return get.suit(card,current)==suit;
								});
							})];
						},
						target:(card,player,target)=>{
							if(card.name==='sha'&&!player.hasSkillTag('directHit_ai',true,{
								target:target,
								card:card
							},true)&&game.hasPlayer(current=>{
								return current.hasCard(cardx=>{
									return get.subtype(cardx)==='equip3';
								},'e');
							})) return [0, -0.5];
						}
					};
					if (lib.skill.jsrgzhenqiao && game.aiyh_skillOptEnabled('jsrgzhenqiao')) lib.skill.jsrgzhenqiao.mod = {
						attackRange:function(player,num){
							return num+1;
						},
						aiOrder:(player,card,num)=>{
							if(num>0&&get.itemtype(card)==='card'&&get.subtype(card)==='equip1'&&!player.getEquip(1)){
								if(card.name!=='zhuge'||player.getCardUsable('sha')||!player.needsToDiscard()||player.countCards('hs',i=>{
									return get.name(i)==='sha'&&lib.filter.cardEnabled(i,target);
								})<2) return 0;
							}
						},
						aiValue:(player,card,num)=>{
							if(num>0&&get.itemtype(card)==='card'&&card.name!=='zhuge'&&get.subtype(card)==='equip1'&&!player.getEquip(1)) return 0.01*num;
						},
						aiUseful:()=>{
							return lib.skill.jsrgzhenqiao.mod.aiValue.apply(this,arguments);
						}
					};
					if (lib.skill.juetao && game.aiyh_skillOptEnabled('juetao')) lib.skill.juetao.content = function(){
						'step 0'
						player.chooseTarget(get.prompt2('juetao'),lib.filter.notMe).set('ai',function(target){
							let att=-get.attitude(_status.event.player,target);
							if(att<=0) return att;
							if(target.hasSkillTag('nodamage')) return 0.01*att;
							if(target.getEquip('tengjia')||target.getEquip('renwang')) return 0.2*att;
							if(target.getEquip('bugua')) return 0.3*att;
							if(target.getEquip(2)) return att/2;
							return 1.2*att;
						});
						'step 1'
						if(result.bool){
							var target=result.targets[0];
							event.target=target;
							player.logSkill('juetao',target);
							player.awakenSkill('juetao');
						}
						else event.finish();
						'step 2'
						var card=get.bottomCards()[0];
						game.cardsGotoOrdering(card);
						player.showCards(card);
						player.chooseUseTarget(card,true,false,'nodistance').set('filterTarget',function(card,player,target){
							var evt=_status.event;
							if(_status.event.name=='chooseTarget') evt=evt.getParent();
							if(target!=player&&target!=evt.juetao_target) return false;
							return lib.filter.targetEnabledx(card,player,target);
						}).set('juetao_target',target);
						'step 3'
						if(result.bool&&target.isIn()) event.goto(2);
					};
					if (lib.skill.olbihun && game.aiyh_skillOptEnabled('olbihun')) lib.skill.olbihun.ai = {
						threaten:0.8,
						halfneg:true,
						effect:{
							player:function(card,player,target){
								if((!card.isCard||!card.cards)&&get.itemtype(card)!='card') return;
								let cs=0;
								if(target&&player!=target&&player.countCards('h',i=>{
									if(card===i||card.cards&&card.cards.includes(i)){
										cs++;
										return false;
									}
									return true;
								})>player.getHandcardLimit()){
									let targets=[],evt=_status.event.getParent('useCard');
									targets.addArray(ui.selected.targets);
									if(evt&&evt.card==card) targets.addArray(evt.targets);
									if(targets.length){
										if(targets.length>1||!targets.includes(target)) return 'zeroplayertarget';
										return;
									}
									let info=get.info(card);
									if(!info||info.notarget||!info.filterTarget) return;
									let range,select=get.copy(info.selectTarget),filter;
									if(select===undefined) range=[1,1];
									else if(typeof select==='number') range=[select,select];
									else if(get.itemtype(select)==='select') range=select;
									else if(typeof select==='function') range=select(card,player);
									if(info.singleCard) range=[1,1];
									game.checkMod(card,player,range,'selectTarget',player);
									if(range[1]<-1) range=[1, 1];
									else if(range[0]<0){
										if(info.filterTarget===true) filter=game.players.length;
										else filter=game.countPlayer(current=>{
											return info.filterTarget(card,player,current);
										});
										range=[filter,filter];
									}
									if(range&&range[0]>1&&range[1]>1) return 'zeroplayertarget';
									return [0,0,0,1];
								}
							},
						}
					};
					if (lib.skill.dcsantou && game.aiyh_skillOptEnabled('dcsantou')) lib.skill.dcsantou.ai = {
						filterDamage: true,
						skillTagFilter: function (player, tag, arg) {
							if (arg && arg.player && arg.player.hasSkillTag('jueqing', false, player)) return false;
						},
						effect: {
							target: function (card, player, target) {
								if (player.hasSkillTag('jueqing', false, target)) return;
								if (player._dcsantou_temp) return;
								if (get.tag(card, 'damage')) {
									const hp = target.getHp();
									player._dcsantou_temp = true;
									const losehp = get.effect(target, { name: 'losehp' }, target, target) / get.attitude(target, target);
									delete player._dcsantou_temp;
									if (hp >= 3) {
										if (target.hasHistory('useSkill', evt => evt.skill == 'dcsantou' && evt.event.getTrigger().source == player)) return [0, losehp, 0, 0];
										else if (get.attitude(player, target) < 0) {
											let hs = player.getCards('hs', i => {
												return i !== card && (!card.cards || !card.cards.includes(i));
											}), num = player.getCardUsable('sha');
											if (card.name === 'sha') num--;
											hs = hs.filter(i => {
												if (!player.canUse(i, target)) return false;
												if (get.tag(card, 'damage') && get.name(i, player) !== 'sha') return true;
												if (num) {
													num--;
													return true;
												}
												return false;
											}).length;
											if (player.hasSkillTag('damage', null, { target: target })) hs++;
											if (!hs) return 'zeroplayertarget';
											num = 1 - 2 / 3 / hs;
											return [num, 0, num, 0];
										}
									}
									if (hp == 2 && get.tag(card, 'natureDamage') || hp == 1 && typeof card == 'object' && get.color(card) == 'red') return [0, losehp, 0, 0];
									return 'zeroplayertarget';
								}
							}
						}
					};
					if (lib.skill.dcfaqi && game.aiyh_skillOptEnabled('dcfaqi')) lib.skill.dcfaqi.ai = {
						reverseEquip: true
					};
					if (lib.skill.olguangao && game.aiyh_skillOptEnabled('olguangao')) lib.skill.olguangao.content = function () {
						'step 0'
						if (trigger.player == player) {
							player.chooseTarget(get.prompt('olguangao'), '为' + get.translation(trigger.card) + '额外指定一个目标。然后若你手牌数为偶数，你摸一张牌并令此牌对任意目标无效。', (card, player, target) => {
								return !_status.event.sourcex.includes(target) && player.canUse(_status.event.card, target);
							}).set('sourcex', trigger.targets).set('ai', function (target) {
								var player = _status.event.player;
								if (player.countCards('h') % 2 == 0) return true;
								var eff = get.effect(target, _status.event.card, player, player);
								if (player.hasSkill('olxieju') && player.isPhaseUsing() && !player.getStat().skill.olxieju && get.attitude(player, target) > 0 && !game.hasGlobalHistory('useCard', evt => {
									return evt.targets && evt.targets.includes(target);
								})) return 6 + eff;
								return eff;
							}).set('card', trigger.card);
						}
						else {
							trigger.player.chooseBool('是否发动' + get.translation(player) + '的【犷骜】？', '令其成为' + get.translation(trigger.card) + '的额外目标。然后若其手牌数为偶数，其摸一张牌并令此牌对任意目标无效。').set('ai', () => {
								return _status.event.bool;
							}).set('bool', function () {
								var att = get.attitude(trigger.player, player);
								if (player.countCards('h') % 2 == 0) {
									if (att > 0) return true;
									return false;
								}
								if (get.effect(player, trigger.card, trigger.player, trigger.player) > 0) return true;
								return false;
							}());
						}
						'step 1'
						if (result.bool) {
							var target = result.targets && result.targets[0];
							if (!target) {
								target = player;
								trigger.player.logSkill('olguangao', player);
							}
							else {
								player.logSkill('olguangao', target);
							}
							trigger.targets.add(target);
							game.delayex();
						}
						else event.finish();
						'step 2'
						if (player.countCards('h') % 2 == 0) {
							player.draw();
							player.chooseTarget('犷骜：令此杀对其任意个目标无效', [1, Infinity], (card, player, target) => {
								return _status.event.targetsx.includes(target);
							}).set('ai', target => {
								return 1 - get.effect(target, _status.event.getTrigger().card, _status.event.player, _status.event.player);
							}).set('targetsx', trigger.targets);
						}
						else event.finish();
						'step 3'
						if (result.bool) {
							player.line(result.targets);
							trigger.excluded.addArray(result.targets);
						}
					};
					if (lib.skill.jsrgniluan && game.aiyh_skillOptEnabled('jsrgniluan')) lib.skill.jsrgniluan.content = function () {
						'step 0'
						var damaged = game.filterPlayer(current => {
							return current.hasAllHistory('sourceDamage', evt => evt.player == player);
						});
						var undamaged = game.filterPlayer().removeArray(damaged);
						player.chooseCardTarget({
							prompt: get.prompt('jsrgniluan'),
							prompt2: `${undamaged.length ? '选择一张牌弃置并选择一名未对你造成过伤害的角色，你对其造成1点伤害' : ''}${undamaged.length && damaged.length ? '；<br>或' : ''}${damaged.length ? '仅选择一名对你造成过伤害的角色，你令其摸两张牌' : ''}。`,
							damaged: damaged,
							aiTarget: (() => {
								if (!undamaged.some(i => {
									if (get.attitude(player, i) > 0) return true;
									if (i.getHp(true) + i.hujia < 2) return true;
									return false;
								}) && (player.hp > 2 || get.damageEffect(player, player, player) >= 0)) return player;
								var info = game.filterPlayer().map(current => {
									let damage = undamaged.includes(current), card = { name: damage ? 'damage' : 'wuzhong' };
									return [current, get.effect(current, card, player, player) / (damage ? 1.5 : 1)];
								}).sort((a, b) => b[1] - a[1])[0];
								if (info[1] > 0) return info[0];
								return null;
							})(),
							filterCard: lib.filter.cardDiscardable,
							selectCard: function () {
								if (get.event('damaged').length == 0) return 1;
								if (get.event('damaged').length == game.countPlayer()) return 0;
								return [0, 1];
							},
							position: 'he',
							filterTarget: function (card, player, target) {
								var damaged = get.event('damaged');
								return damaged.includes(target) ^ (ui.selected.cards.length > 0);
							},
							selectTarget: 1,
							ai1: function (card) {
								if (get.event('damaged').includes(get.event('aiTarget'))) return 0;
								return 6 - get.value(card);
							},
							ai2: function (target) {
								return target == get.event('aiTarget') ? 10 : 0;
							},
						});
						'step 1'
						if (result.bool) {
							var cards = result.cards, target = result.targets[0];
							player.logSkill('jsrgniluan', target);
							if (cards && cards.length) {
								player.discard(cards);
								game.delayex();
								target.damage();
							}
							else {
								target.draw(2);
							}
						}
					};
					if (lib.skill.xinkuangfu && game.aiyh_skillOptEnabled('xinkuangfu')) lib.skill.xinkuangfu.ai = {
						order:function(){
							return get.order({name:'sha'})+0.3;
						},
						result:{
							target:function(player,target){
								var att=get.attitude(player,target);
								var max=0;
								var min=1;
								target.countCards('e',function(card){
									var val=get.value(card,target);
									if(val>max) max=val;
									if(val<min) min=val;
								});
								if(att>0&&min<=0) return target.hasSkillTag('noe')?3:1;
								if(att<=0&&max>0){
									if(target.hasSkillTag('noe')) return max>6?(-max/3):0;
									return -max;
								}
								if(player===target&&!player.hasSha()){
									let ph=player.countCards('h');
									if(game.hasPlayer(i=>{
										if(!player.canUse('sha',i,true,true)||get.effect(i,{name:'sha'},player,player)<=0) return false;
										return !ph||!i.mayHaveShan(player,'use');
									})) return 1;
								}
								return 0;
							},
						}
					};
					if (lib.skill.dcluochong && game.aiyh_skillOptEnabled('dcluochong')) lib.skill.dcluochong.content=function(){
						'step 0'
						var num=4-player.countMark('dcluochong');
						var dialog=[];
						dialog.push('###'+get.prompt('dcluochong')+'###<div class="text center">弃置任意名角色区域内共计至多'+get.cnNumber(num)+'张牌</div>');
						game.filterPlayer().sortBySeat().forEach(target=>{
							if(target.countDiscardableCards(player,'hej')<=0) return false;
							var name=(target==player?'你':get.translation(target));
							if(target.countCards('h')){
								dialog.add('<div class="text center">'+name+'的手牌区</div>');
								if(player.hasSkillTag('viewHandcard',null,target,true)||player==target) dialog.push(target.getCards('h'));
								else dialog.push([target.getCards('h'),'blank']);
							}
							if(target.countCards('e')) dialog.addArray(['<div class="text center">'+name+'的装备区</div>',target.getCards('e')]);
							if(target.countCards('j')) dialog.addArray(['<div class="text center">'+name+'的判定区</div>',target.getCards('j')]);
						});
						player.chooseButton([1,num]).set('createDialog',dialog).set('filterButton',button=>{
							return lib.filter.canBeDiscarded(button.link,_status.event.player,get.owner(button.link));
						}).set('ai',button=>{
							var player=_status.event.player,
								target=get.owner(button.link),
								num=ui.selected.buttons.filter(i=>get.owner(i.link)==target).length;
							if(num>1&&player.hp+player.hujia>2) return 0;
							if(target==player){
								if(num) return -get.value(button.link,target);
								if(ui.cardPile.childNodes.length>80) return 6-get.value(button.link,player);
								return 0;
							}
							var val=get.buttonValue(button);
							if(num===2) val/=4;
							if(get.attitude(player,target)>0) return -val;
							return val;
							//return -(get.position(card)!='h'?get.value(card,target):(4.5+Math.random()-0.2*(num>2?1:0)))*get.attitude(player,target);
						});
						'step 1'
						if(result.bool){
							var links=result.links;
							var lose_list=[];
							var log=false;
							for(var target of game.players){
								var cards=links.filter(card=>get.owner(card)==target);
								if(cards.length){
									if(cards.length>2){
										player.addMark('dcluochong',1,false);
										log=true;
									}
									lose_list.push([target,cards]);
								}
							}
							player.logSkill('dcluochong',lose_list.map(i=>i[0]));
							if(log) game.log(player,'可弃置牌数','#g-1');
							if(lose_list[0].length==1) lose_list[0][0].discard(lose_list[0][1]);
							else{
								game.loseAsync({
									lose_list:lose_list,
									discarder:player,
								}).setContent('discardMultiple');
							}
						}
					};
					if (lib.skill.twwuhun && game.aiyh_skillOptEnabled('twwuhun')) lib.skill.twwuhun.ai={
						notemp:true,
						maixie_defend:true,
						effect:{
							target:(card,player,target)=>{
								if(!get.tag(card,'damage')||!target.hasFriend()) return;
								let die=[],extra=[null,0],temp;
								game.filterPlayer(i=>{
									if(!i.hasMark('twwuhun')) return false;
									temp=get.attitude(target,i);
									if(temp<0) die.push(i);
									else{
										temp=Math.sqrt(temp)*i.countMark('twwuhun');
										if(!extra[0]||temp<extra[1]) extra=[i,temp];
									}
								});
								if(extra[0]&&!die.length) die.push(extra[0]);
								if(target.hp+target.hujia>1&&(!die.length||get.attitude(player,target)<=0)) die.add(player);
								if(die.length) return [1,0,1,die.reduce((num,i)=>{
									return num-=2*get.sgnAttitude(player,i);
								},0)];
							}
						}
					};
					if (lib.skill.new_wuhun && game.aiyh_skillOptEnabled('new_wuhun')) lib.skill.new_wuhun.ai={
						notemp:true,
						effect:{
							target:(card,player,target)=>{
								if(!get.tag(card,'damage')||!target.hasFriend()) return;
								if(player.hasSkillTag('jueqing',null,target)) return 1.7;
								let die=[null,1],temp;
								game.filterPlayer(i=>{
									temp=i.countMark('new_wuhun');
									if(i===player&&target.hp+target.hujia>1) temp++;
									if(temp>=die[1]){
										if(!die[0]) die=[i,temp];
										else{
											let att=get.attitude(player,i);
											if(att<die[1]) die=[i,temp];
										}
									}
								});
								if(die[0]) return [1,0,1,-6*get.sgnAttitude(player,die[0])/Math.max(1,target.hp)];
							}
						}
					};
					if (lib.skill.duanchang && game.aiyh_skillOptEnabled('duanchang')) lib.skill.duanchang.ai={
						threaten:function(player,target){
							if(target.hp==1) return 0.2;
							return 1.5;
						},
						effect:{
							target:function(card,player,target,current){
								if(!target.hasFriend()) return;
								if(target.hp<=1&&get.tag(card,'damage')){
									if(player.hasSkillTag('jueqing',false,target)) return 3;
									return [1,0,0,-3*get.threaten(player)];
								}
							}
						}
					};
					if (lib.skill.yechou && game.aiyh_skillOptEnabled('yechou')) lib.skill.yechou.content=function(){
						"step 0"
						player.chooseTarget(get.prompt2('yechou'),function(card,player,target){
							return player!=target&&target.getDamagedHp()>1
						}).set('forceDie',true).set('ai',function(target){
							let att=get.attitude(_status.event.player,target);
							if(att>0) return 0;
							att=Math.sqrt(0.01-att);
							return att*(get.distance(_status.currentPhase,target,'absolute')||game.players.length);
						});
						"step 1"
						if(result.bool){
							var target=result.targets[0];
							player.logSkill('yechou',target);
							player.line(target,'green');
							target.addTempSkill('yechou2',{player:'phaseZhunbeiBegin'});
						}
					};
				}
				if (lib.skill.zhenlie) {
					lib.skill.zhenlie_lose = {
						charlotte: true
					};
					if (game.aiyh_skillOptEnabled('zhenlie', '增加〖贞烈〗身份暴露度', 'zhenlie_expose')) lib.skill.zhenlie.content = function () {
						'step 0'
						if (get.attitude(player, trigger.player) < 0 && trigger.player.countDiscardableCards(player, 'he')) player.addTempSkill('zhenlie_lose');
						player.loseHp();
						'step 1'
						trigger.getParent().excluded.add(player);
						'step 2'
						if (trigger.player.countCards('he')) {
							if (get.mode() != 'identity' || player.identity != 'nei') player.addExpose(0.12);
							player.discardPlayerCard(trigger.player, 'he', true);
						}
						player.removeSkill('zhenlie_lose');
					};
					if (game.aiyh_skillOptEnabled('zhenlie', '增加〖贞烈〗濒死ai', 'zhenlie_ai')) lib.skill.zhenlie.ai = {
						effect: {
							target: function (card, player, target) {
								if (target.hp <= 0 && target.hasSkill('zhenlie_lose') && get.tag(card, 'recover')) return [1, 1.2];
							}
						}
					};
				}
				if (lib.skill.feiyang && game.aiyh_skillOptEnabled('feiyang')) lib.skill.feiyang.content = function () {
					'step 0'
					player.chooseToDiscard('h', 2, '是否发动【飞扬】，弃置两张手牌并弃置自己判定区的一张牌？').set('logSkill', 'feiyang').ai = function (card) {
						if (player.countCards('j') <= 1 && (player.hasSkillTag('rejudge') || player.hasSkillTag('nodamage') || player.hasSkillTag('nothunder')) && (player.hasJudge('shandian') || player.hasJudge('fulei'))) return false;
						return 6 - get.value(card);
					};
					'step 1'
					if (result.bool) player.discardPlayerCard(player, 'j', true).ai = function (card) {
						if (player.countCards('h') < 2 && (!player.hasJudge('shandian') || !player.hasJudge('fulei'))) return -ai.get.value(card);
						return ai.get.value(card);
					};
				};
				if (lib.skill.fangquan2 && game.aiyh_skillOptEnabled('fangquan')) lib.skill.fangquan2.content = function () {
					'step 0'
					event.count = player.countMark(event.name);
					player.removeMark(event.name, event.count);
					'step 1'
					event.count--;
					player.chooseToDiscard('是否弃置一张牌并令一名其他角色进行一个额外回合？').set('logSkill', player.name == 're_liushan' ? 'refangquan' : 'fangquan').ai = function (card) {
						return 20 - get.value(card);
					};
					'step 2'
					if (result.bool) {
						player.chooseTarget(true, '请选择进行额外回合的目标角色', lib.filter.notMe).ai = function (target) {
							if (target.hasJudge('lebu')) return -1;
							if (get.attitude(player, target) > 0) {
								if (target.isTurnedOver()) return 0.18;
								return get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1);
							}
							return -1;
						};
					} else event.finish();
					'step 3'
					var target = result.targets[0];
					player.line(target, 'fire');
					target.markSkillCharacter('fangquan', player, '放权', '进行一个额外回合');
					target.insertPhase();
					target.addSkill('fangquan3');
					if (event.count > 0) event.goto(1);
				};
				if (game.aiyh_skillOptEnabled('olfangquan')) {
					if (lib.skill.olfangquan) lib.skill.olfangquan.content = function () {
						'step 0'
						var fang = player.countMark('olfangquan2') == 0 && player.hp >= 2 && player.countCards('h') <= player.hp + 2;
						player.chooseBool(get.prompt2('olfangquan')).set('ai', function () {
							if (!_status.event.fang) return false;
							return game.hasPlayer(function (target) {
								if (target.hasJudge('lebu') || target.classList.contains('turnedover') || target == player) return false;
								if (get.attitude(player, target) > 4) return get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1) > 0;
								return false;
							});
						}).set('fang', fang);
						'step 1'
						if (result.bool) {
							player.logSkill('olfangquan');
							trigger.cancel();
							player.addTempSkill('olfangquan2');
							player.addMark('olfangquan2', 1, false);
						}
					};
					if (lib.skill.olfangquan2) lib.skill.olfangquan2.content = function () {
						'step 0'
						event.count = player.countMark(event.name);
						player.removeMark(event.name, event.count, false);
						'step 1'
						event.count--;
						player.chooseToDiscard('是否弃置一张牌并令一名其他角色进行一个额外回合？').set('logSkill', 'olfangquan').ai = function (card) {
							return 20 - get.value(card);
						};
						'step 2'
						if (result.bool) {
							player.chooseTarget(true, '请选择进行额外回合的目标角色', lib.filter.notMe).ai = function (target) {
								if (target.hasJudge('lebu') || target.classList.contains('turnedover')) return -1;
								if (get.attitude(player, target) > 0) return get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1);
								return -1;
							};
						} else event.finish();
						'step 3'
						var target = result.targets[0];
						player.line(target, 'fire');
						target.markSkillCharacter('olfangquan', player, '放权', '进行一个额外回合');
						target.insertPhase();
						target.addSkill('olfangquan3');
						if (event.count > 0) event.goto(1);
					};
				}
				if (lib.skill.refangquan && game.aiyh_skillOptEnabled('refangquan')) lib.skill.refangquan.content = function () {
					'step 0'
					var fang = player.countMark('fangquan2') == 0 && player.hp >= 2 && player.countCards('h') <= player.hp + 2;
					player.chooseBool(get.prompt2('refangquan')).set('ai', function () {
						if (!_status.event.fang) return false;
						return game.hasPlayer(function (target) {
							if (target.hasJudge('lebu') || target.classList.contains('turnedover') || target == player) return false;
							if (get.attitude(player, target) > 4) return get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1) > 0;
							return false;
						});
					}).set('fang', fang);
					'step 1'
					if (result.bool) {
						player.logSkill('refangquan');
						trigger.cancel();
						player.addTempSkill('fangquan2', 'phaseAfter');
						player.addMark('fangquan2', 1, false);
						player.addTempSkill('refangquan2');
					}
				};
				if (lib.skill.tuntian && game.aiyh_skillOptEnabled('tuntian')) lib.skill.tuntian.ai = {
					effect: {
						target: function (card, player, target, current) {
							if (get.name(card) == 'sha' && target.mayHaveShan(player, 'use')) return [0.6, 0.75];
							if (!target.hasFriend() && !player.hasUnknown()) return;
							if (_status.currentPhase == target) return;
							if (card.name != 'shuiyanqijunx' && get.tag(card, 'loseCard') && target.countCards('he')) {
								if (target.hasSkill('ziliang')) return 0.7;
								return [0.5, Math.max(2, target.countCards('h'))];
							}
							if (target.isUnderControl(true, player)) {
								if ((get.tag(card, 'respondSha') && target.countCards('h', 'sha')) || (get.tag(card, 'respondShan') && target.countCards('h', 'shan'))) {
									if (target.hasSkill('ziliang')) return 0.7;
									return [0.5, 1];
								}
							} else if (get.tag(card, 'respondSha') || get.tag(card, 'respondShan')) {
								if (get.attitude(player, target) > 0 && card.name == 'juedou') return;
								if (get.tag(card, 'damage') && target.hasSkillTag('maixie')) return;
								if (target.countCards('h') == 0) return 2;
								if (target.hasSkill('ziliang')) return 0.7;
								if (get.mode() == 'guozhan') return 0.5;
								return [0.5, Math.max(target.countCards('h') / 4, target.countCards('h', 'sha') + target.countCards('h', 'shan'))];
							}
						}
					},
					threaten: function (player, target) {
						if (target.countCards('h') == 0) return 2;
						return 0.5;
					},
					nodiscard: true,
					nolose: true
				};
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
					if (lib.card.gz_haolingtianxia) lib.card.gz_haolingtianxia.content=function(){
						'step 0'
						event.list=game.filterPlayer(function(current){
							return current!=target;
						}).sortBySeat();
						'step 1'
						if(!target.isIn()){
							event.finish();
							return;
						}
						var current=event.list.shift();
						if(!current||!current.isIn()||current.hasSkill('diaohulishan')){
							if(event.list.length) event.redo();
							else event.finish();
							return;
						}
						event.current=current;
						if(current.identity!='wei'){
							current.chooseToDiscard('he','弃置一张牌，并视为对'+get.translation(target)+'使用一张【杀】，或点击「取消」弃置其一张牌').set('ai',function(card){
								if(!_status.event.goon) return 0;
								return 5-get.value(card);
							}).set('goon',get.effect(target,{name:'guohe'},current)<get.effect(current,{name:'guohe'},current)+get.effect(target,{name:'sha'},current));
						}
						else{
							current.chooseBool('是否视为对'+get.translation(target)+'使用一张【杀】？','若点击「取消」则改为获得其一张牌').set('ai',function(){
								var player=_status.event.player,target=_status.event.getParent().target;
								return get.effect(target,{name:'shunshou'},player)<=get.effect(target,{name:'sha'},player);
							});
						}
						'step 2'
						if(!target.isIn()){
							event.finish();
							return;
						}
						var current=event.current;
						if(result.bool){
							if(current.isIn()&&current.canUse({name:'sha',isCard:true},target,false)) current.useCard({name:'sha',isCard:true},target,false);
						}
						else{
							current[current.identity=='wei'?'gainPlayerCard':'discardPlayerCard'](target,true,'he').set('boolline',true);
						}
						if(event.list.length) event.goto(1);
					};
					if (lib.card.tiesuo&&lib.card.tiesuo.ai&&lib.card.tiesuo.ai.basic) lib.card.tiesuo.ai.basic.order=7.3;
					if (lib.card.jiu) lib.card.jiu.ai = {
						basic: {
							useful: (card, i) => {
								if (_status.event.player.hp > 1) {
									if (i === 0) return 4;
									return 1;
								}
								if (i === 0) return 7.3;
								return 3;
							},
							value: (card, player, i) => {
								if (player.hp > 1) {
									if (i === 0) return 5;
									return 1;
								}
								if (i === 0) return 7.3;
								return 3;
							}
						},
						order: () => {
							if (_status.event.dying) return 9;
							let sha = get.order({ name: 'sha' });
							if (sha > 0) return sha + 0.2;
							return 0;
						},
						result: {
							target: (player, target, card) => {
								if (target && target.isDying()) return 2;
								if (!target || target._jiu_temp || !target.isPhaseUsing()) return 0;
								let usable = target.getCardUsable('sha');
								if (!usable || lib.config.mode === 'stone' && !player.isMin() && player.getActCount() + 1 >= player.actcount || !target.mayHaveSha(player, 'use', card)) return 0;
								let effs = { order: 0 }, temp;
								target.getCards('hs', i => {
									if (get.name(i) !== 'sha' || ui.selected.cards.includes(i)) return false;
									temp = get.order(i, target);
									if (temp < effs.order) return false;
									if (temp > effs.order) effs = { order: temp };
									effs[i.cardid] = {
										card: i,
										target: null,
										eff: 0
									};
								});
								delete effs.order;
								for (let i in effs) {
									if (!lib.filter.filterCard(effs[i].card, target)) continue;
									game.filterPlayer(current => {
										if (get.attitude(target, current) >= 0 || !target.canUse(effs[i].card, current, null, true) || current.hasSkillTag('filterDamage', null, {
											player: target,
											card: effs[i].card,
											jiu: true
										})) return false;
										temp = get.effect(current, effs[i].card, target, player);
										if (temp <= effs[i].eff) return false;
										effs[i].target = current;
										effs[i].eff = temp;
										return false;
									});
									if (!effs[i].target) continue;
									if (target.hasSkillTag('directHit_ai', true, {
										target: effs[i].target,
										card: i
									}, true) || usable === 1 && (target.needsToDiscard() > Math.max(0, 3 - target.hp) || !effs[i].target.mayHaveShan(player, 'use', effs[i].target.getCards(i=>{
										return i.hasGaintag('sha_notshan');
									})))) {
										delete target._jiu_temp;
										return 1;
									}
								}
								delete target._jiu_temp;
								return 0;
							}
						},
						tag: {
							save: 1,
							recover: 0.1,
						}
					};
					if (lib.card.jiedao && lib.card.jiedao.ai) lib.card.jiedao.ai.result = {
						player: (player, target) => {
							if (!target.hasSkillTag('noe') && get.attitude(player, target) > 0) return 0;
							return (player.hasSkillTag('noe') ? 0.32 : 0.15) * target.getEquips(1).reduce((num, i) => {
								return num + get.value(i, player);
							}, 0);
						},
						target: (player, target, card) => {
							let targets = [].concat(ui.selected.targets);
							if (_status.event.preTarget) targets.add(_status.event.preTarget);
							if (targets.length) {
								let preTarget = targets.lastItem, pre = _status.event.getTempCache('jiedao_result', preTarget.playerid);
								if (pre && pre.card === card && pre.target.isIn()) return target === pre.target ? pre.eff : 0;
								return get.effect(target, { name: 'sha' }, preTarget, player) / get.attitude(player, target);
							}
							let arms = (target.hasSkillTag('noe') ? 0.32 : -0.15) * target.getEquips(1).reduce((num, i) => {
								return num + get.value(i, target);
							}, 0);
							if (!target.mayHaveSha(player, 'use')) return arms;
							let sha = game.filterPlayer(get.info({ name: 'jiedao' }).filterAddedTarget), addTar = null;
							sha = sha.reduce((num, current) => {
								let eff = get.effect(current, { name: 'sha' }, target, player);
								if (eff <= num) return num;
								addTar = current;
								return eff;
							}, -100);
							if (!addTar) return arms;
							sha /= get.attitude(player, target);
							_status.event.putTempCache('jiedao_result', target.playerid, {
								card: card,
								target: addTar,
								eff: sha
							});
							return Math.max(arms, sha);
						}
					};
					if (lib.card.sha) {
						lib.card.sha.content = function () {
							"step 0"
							if (typeof event.shanRequired != 'number' || !event.shanRequired || event.shanRequired < 0) event.shanRequired = 1;
							if (typeof event.baseDamage != 'number') event.baseDamage = 1;
							if (typeof event.extraDamage != 'number') event.extraDamage = 0;
							"step 1"
							if (!_status.connectMode && lib.config.skip_shan && !target.hasShan()) event._result = {bool: false};
							else if (event.directHit || event.directHit2) event._result = {
								bool: false,
								direct: true
							};
							else if (event.skipShan) event._result = { bool: true, result: 'shaned' };
							else {
								var next = target.chooseToUse('请使用一张闪响应杀');
								next.set('type', 'respondShan');
								next.set('filterCard', function (card, player) {
									if (get.name(card) != 'shan') return false;
									return lib.filter.cardEnabled(card, player, 'forceEnable');
								});
								if (event.shanRequired > 1) next.set('prompt2', '（共需使用' + event.shanRequired + '张闪）');
								else if (game.hasNature(event.card, 'stab')) next.set('prompt2', '（在此之后仍需弃置一张手牌）');
								next.set('ai1', function (card) {
									if(_status.event.useShan) return get.order(card);
									return 0;
								}).set('shanRequired', event.shanRequired);
								next.set('respondTo', [player, card]);
								next.set('useShan',(()=>{
									if(target.hasSkillTag('noShan',null,event)) return false;
									if(target.hasSkillTag('useShan',null,event)) return true;
									if(event.baseDamage+event.extraDamage<=0 || get.attitude(target,player._trueMe||player)>0) return false;
									if(event.shanRequired>1&&target.mayHaveShan(target,'use',target.getCards(i=>{
										return i.hasGaintag('sha_notshan');
									}),'count')<event.shanRequired-(event.shanIgnored||0)) return false;
									if(event.baseDamage+event.extraDamage>=target.hp+
										((player.hasSkillTag('jueqing',false,target)||target.hasSkill('gangzhi'))?target.hujia:0)) return true;
									if(!game.hasNature(event.card, 'ice')&&get.damageEffect(target,player,target,get.nature(event.card))>=0) return false;
									return true;
								})());
							}
							"step 2"
							if (!result || !result.bool || !result.result || result.result != 'shaned') event.trigger('shaHit');
							else {
								event.shanRequired--;
								if (event.shanRequired > 0) event.goto(1);
								else if (game.hasNature(event.card, 'stab') && target.countCards('h') > 0) {
									event.responded = result;
									event.goto(4);
								}
								else {
									event.trigger('shaMiss');
									event.responded = result;
								}
							}
							"step 3"
							if ((!result || !result.bool || !result.result || result.result != 'shaned') && !event.unhurt) {
								if ((!result || !result.direct)&&target.hasCard(()=>true,'hs')&&get.damageEffect(target,player,target)<0) target.addGaintag(target.getCards('hs'),'sha_notshan');
								target.damage(get.nature(event.card));
								event.result = { bool: true }
								event.trigger('shaDamage');
							}
							else {
								event.result = { bool: false }
								event.trigger('shaUnhirt');
							}
							event.finish();
							"step 4"
							target.chooseToDiscard('刺杀：请弃置一张牌，否则此【杀】依然造成伤害').set('ai', function (card) {
								var target = _status.event.player;
								var evt = _status.event.getParent();
								var bool = true;
								if (get.damageEffect(target, evt.player, target, evt.card.nature) >= 0) bool = false;
								if (bool) return 8 - get.useful(card);
								return 0;
							});
							"step 5"
							if ((!result || !result.bool) && !event.unhurt) {
								target.damage(get.nature(event.card));
								event.result = { bool: true }
								event.trigger('shaDamage');
								event.finish();
							}
							else event.trigger('shaMiss');
							"step 6"
							if ((!result || !result.bool) && !event.unhurt) {
								target.damage(get.nature(event.card));
								event.result = { bool: true }
								event.trigger('shaDamage');
								event.finish();
							}
							else {
								event.result = { bool: false }
								event.trigger('shaUnhirt');
							}
						};
						if(lib.card.sha.ai){
							/*lib.card.sha.ai.order=function(item,player){
								let res=3;
								if(player.hasSkillTag('presha',true,null,true)) res+=7;
								if(typeof item!=='object') return res+0.05;
								let effect=player.getUseValue(item,null,true),
									shas=player.getCardUsable('sha')-1.5,val;
								player.getCards('hs','sha').forEach(i=>{
									if(effect===false||i===item||item.cards&&item.cards.includes(i)) return;
									val=player.getUseValue(i,null,true);
									if(shas*(effect-val)>0) effect=false;
								});
								if(effect===false) return res;
								return res+0.15;
							};*/
							lib.card.sha.ai.order=function(item,player){
								if(player.hasSkillTag('presha',true,null,true)) return 10;
								if(typeof item==='object'&&game.hasNature(item,'linked')){
									if(game.hasPlayer(function(current){
										return current!=player&&current.isLinked()&&player.canUse(item,current,null,true)&&get.effect(current,item,player,player)>0&&lib.card.sha.ai.canLink(player,current,item);
									})&&game.countPlayer(function(current){
										return current.isLinked()&&get.damageEffect(current,player,player,get.nature(item))>0;
									})>1) return 3.1;
									return 3;
								}
								return 3.05;
							};
							lib.card.sha.ai.result={
								target:function(player,target,card,isLink){
									let eff=-1.5,odds=1.35,num=1;
									if(isLink){
										let cache=_status.event.getTempCache('sha_result','eff');
										if(typeof cache!=='object'||cache.card!==get.translation(card)) return eff;
										if(cache.odds<1.35&&cache.bool) return 1.35*cache.eff;
										return cache.odds*cache.eff;
									}
									if(player.hasSkill('jiu')||player.hasSkillTag('damageBonus',true,{
										target:target,
										card:card
									})){
										if(target.hasSkillTag('filterDamage',null,{
											player:player,
											card:card,
											jiu:true,
										})) eff=-0.5;
										else{
											num=2;
											if(get.attitude(player,target)>0) eff=-7;
											else eff=-4;
										}
									}
									if(!player.hasSkillTag('directHit_ai',true,{
										target:target,
										card:card,
									},true)) odds-=0.7*target.mayHaveShan(player,'use',target.getCards(i=>{
										return i.hasGaintag('sha_notshan');
									}),'odds');
									_status.event.putTempCache('sha_result','eff',{
										bool:target.hp>num&&get.attitude(player,target)>0,
										card:get.translation(card),
										eff:eff,
										odds:odds
									});
									return odds*eff;
								},
							};
							lib.translate.sha_notshan='invisible';
						}
					}
					if(lib.card.gz_wenheluanwu) lib.card.gz_wenheluanwu.content=function(){
						'step 0'
						if(!target.countCards('h')||!player.isIn()) event.finish();
						else target.showHandcards();
						'step 1'
						var str=get.translation(target);
						player.chooseControl().set('prompt','文和乱武：请选择一项').set('choiceList',[
							'令'+str+'弃置两张类型不同的手牌',
							'弃置'+str+'的一张手牌',
						]).set('ai',()=>{
							let target=_status.event.getParent().target,hs=target.getCards('h'),type=[],att=get.attitude(_status.event.player,target);
							if(hs.length<2) return att>0?1:0;
							hs.forEach(i=>{
								type.add(get.type2(i,target));
							});
							if(target.identity!=='qun'){
								if(Boolean(att>0)===Boolean(type.length>1)) return 1;
								return 0;
							}
							if(type.length<2||target.hp<3) return att>0?1:0;
							if(hs.length===2) return att>0?0:1;
							return att>0?1:0;
						});
						'step 2'
						if(result.index==0){
							var list=[],hs=target.getCards('h');
							for(var i of hs){
								if(lib.filter.cardDiscardable(i,target,'gz_wenheluanwu')) list.add(get.type2(i,target));
								if(list.length>1) break;
							}
							if(list.length>1) target.chooseToDiscard('h',true,'请弃置两张类型不同的手牌',2,function(card,player){
								if(!ui.selected.cards.length) return true;
								return get.type2(card,target)!=get.type2(ui.selected.cards[0],target);
							}).set('complexCard',true);
							else if(list.length==1) target.chooseToDiscard('h',true);
							else event.finish();
						}
						else{
							player.discardPlayerCard(target,'h',true,'visible');
						}
						'step 3'
						if(target.identity!='qun'||!result.bool||!result.cards||!result.cards.length||target.countCards('h')>0||target.hp<1) event.finish();
						else target.draw(Math.min(5,target.hp));
					};
					lib.skill.g_taipingyaoshu_ai={
						ai:{
							effect:{
								player:function(card,player){
									if(player.hasSkill('wendao')) return;
									if(card.name=='taipingyaoshu'&&game.hasPlayer(function(current){
										return current.hasSkill('wendao')&&get.attitude(player,current)<=0;
									})){
										return [0,0,0,0];
									}
								},
								target:(card,player,target)=>{
									if(target._g_taipingyaoshu_temp) return;
									if(get.subtype(card)==='equip2'&&target.getEquip('taipingyaoshu')&&!target.countEmpty(2)){
										target._g_taipingyaoshu_temp=true;
										let lose=get.effect(target,{name:'losehp'},target,target),
											draw=get.effect(target,{name:'wuzhong'},target,target);
										delete target._g_taipingyaoshu_temp;
										if(lose<0&&target.hp<=1&&!target.hasCard(i=>{
											return get.name(i)==='tao'&&lib.filter.cardEnabled(i,target,'forceEnable');
										})) draw=0;
										return [1,(lose+draw)/get.attitude(target,target)];
									}
								}
							}
						}
					};
					if (lib.card.chuqibuyi && lib.card.chuqibuyi.ai) lib.card.chuqibuyi.ai.result = {
						target:(player,target,card)=>{
							//if(typeof card!=='object') return -2;
							let suit=get.suit(card),
								view=player.hasSkillTag('viewHandcard',null,target,true),
								fz=0,
								fm=0;
							target.getCards('h',i=>{
								if(i.isKnownBy(player)){
									if(suit!==get.suit(i)){
										if(view||get.is.shownCard(i)) return -2;
										fz++;
										fm++;
									}
									else if(!view&&!get.is.shownCard(i)) fm++;
								}
								else{
									fz+=0.75;
									fm++;
								}
							});
							if(!fm) return 0;
							return -2*fz/fm;
						}
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
						<br><br><br><li><font color=#FFFF00>本体武将优化相关</font>：<br>刘焉〖立牧〗<br>邓艾〖屯田〗<br>神马超〖狩骊〗〖横骛〗<br>曹髦〖潜龙〗<br>神甘宁〖劫营〗<br>界王异〖贞烈〗<br>夏侯紫萼〖血偿〗<br>刘禅、界刘禅、手杀刘禅〖放权〗<br><br><br>
						<li><font color=#00FFFF>本体卡牌AI相关</font>：<br>●<span style="font-family: xingkai">南蛮入侵</span><br>将身份奖惩写在【南蛮入侵】中对使用者的效益里，一定程度上减少人机杀敌一千自损八百的情况；<br>增加对有「打出杀」标签的角色的判断，具体化残血主公的放大效益，一定程度上鼓励人机开aoe收残血反；<br>有无懈的队友一般会在自己也是aoe的目标且没有响应的情况下比较当前响应角色和自己的情况决定要不要不出无懈，已响应或不为目标也会看在队友实力雄厚的情况下可能不出无懈<br>●<span style="font-family: xingkai">万箭齐发</span>与<span style="font-family: xingkai">南蛮入侵</span>类似
						<br>●<span style="font-family: xingkai">以逸待劳</span><br>修复文字描述错误，对决模式目标默认选择己方角色<br><br><br><li><span style="font-family: xingkai">身份局相关：</span><br>●没有队友、场上有忠臣存活的反贼和内奸，以及没有忠臣、场上有多名反贼存活的主公和内奸彼此会减少伤害牌的使用，并在自己血还够扛的情况下会救濒死的对方；<br>●需要弃牌时，主公会盲那些身份尚不明朗的人，前提是对方体力大于1或者自己有绝情标签（一定程度上避免盲忠弃牌后果），如果是忠内混战，主公还会把身份尚不明朗的人都连起来；<br>●稍稍提高对主公用伤害牌或兵乐的影响；<br>
						●内奸将根据玩家设置的武将权重和［第二权重参考］选择的选项作为侧重判断场上角色实力、战损程度、牌持有量、有无翻面决定自己是跳反、跳忠还是酱油（主公比较健康且忠反双方实力差距不大时酱油）；<br>●通过内奸的努力，会逐渐减少其身份暴露度，但如果他跳反时救人或直接伤害主忠，将其身份直接暴露，如果救主忠，大幅减少其身份暴露度；<br>●内奸跳忠/反时会优先打反/忠，需要弃牌时会盲身份不明朗的角色，并尽量规避对主以及忠/反使用伤害牌，自己和主公比较健康时也会救忠/反；<br>●内奸打酱油时，只关心自己和主公，非必要不用牌，需要弃牌时使用伤害牌但也不酒杀，对忠反的生死漠不关心
						<br><br><br><li><span style="font-family: xingkai">其他：</span><br>●人机拥有多张同名牌时鼓励人机使用点数较小的牌，弃牌时鼓励保留点数较大的牌，但由于是微调数值收效甚微；<br>●鼓励拥有reverseEquip标签的角色刷装备，大幅降低已被废除的装备栏对应副类别的牌的价值`;
				}
			},
			bd1: {
				name: '<hr>可通过<font color=fire>无名杀频道</font>、<font color=#FFFF00>无名杀扩展交流</font>、<font color=#00FFFF>Q群</font>或<font color=#00FFFF>下方链接</font><font color=#00FFB0>获取</font>本扩展最新版本',
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
					textarea.value = 'https://pan.baidu.com/s/1hsVJjfx-wZi87JlaOpIBIw?pwd=h4go';
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
			bd2: {
				clear: true,
				name: '<hr><center><font color=#00FFB0>以下大部分选项长按有提示！</font></center><br><center>AI相关</center>',
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
				intro: '目前包括以下前瞻AI优化：<br>【杀】<br>【酒】<br>【借刀杀人】<br>【铁索连环】<br>【文和乱武】<br>【号令天下】<br>【太平要术】<br>【出其不意】<br>OL文钦〖犷骜〗<br>哪吒〖三头〗〖法器〗<br>转韩遂〖逆乱〗<br>神关羽、TW神关羽〖武魂〗<br>蔡文姬、界蔡文姬〖断肠〗<br>许贡〖业仇〗<br>曹髦〖决讨〗<br>张华〖弼昏〗<br>新潘凤〖狂斧〗<br>十周年滕芳兰〖落宠〗<br>起刘备〖积善〗〖振鞘〗<br>神马超、S特神马超〖狩骊〗〖横骛〗<br>司马师〖泰然〗<br>王濬〖长驱〗<br>界吕蒙〖勤学〗<br>界郭皇后〖殚心〗<br>族钟毓〖惶汗〗<br>转夏侯荣〖奋剑〗<br>王异、界王异〖贞烈〗<br>界黄忠、OL界黄忠〖烈弓〗<br>OL邓芝〖修好〗',
				init: true
			},
			bd3: {
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
				intro: '去除手杀孙寒华〖冲虚〗、手杀南华老仙〖御风〗、手杀庞德公〖评才〗、手杀郑玄〖整经〗的小游戏，重启生效。（注意：若有其他拓展修改了小游戏可能会报错，关闭此选项即可）',
				init: false
			},
			seen: {
				name: '显示隐藏武将',
				intro: '开启后，会显示本体隐藏武将',
				init: false
			},
			filterSameName:{
				name:"<span style='font-family: xingkai'>同名武将筛选</span>",
				intro:'开启后，玩家可于出牌阶段选择场上的武将，系统会给出所有与其id后缀相同的武将，玩家自行选择在当前模式启用或禁用这些武将',
				init:false
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
					let discardConfig = ui.create.div('.editbutton', '取消', editorpage, function () {
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete(null);
						delete window.saveNonameInput;
					});
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
					let saveConfig = ui.create.div('.editbutton', '保存', editorpage, saveInput);
					let editor = ui.create.div(editorpage);
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
						let aceReady = function () {
							ui.window.appendChild(node);
							let mirror = window.CodeMirror(editor, {
								value: node.code,
								mode: "javascript",
								lineWrapping: !lib.config.touchscreen && lib.config.mousewheel,
								lineNumbers: true,
								indentUnit: 4,
								autoCloseBrackets: true,
								theme: 'mdn-like'
							});
							lib.setScroll(editor.querySelector('.CodeMirror-scroll'));
							node.aced = true;
							node.editor = mirror;
						}
						if (!window.ace) {
							lib.init.js(lib.assetURL + 'game', 'codemirror', aceReady);
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						}
						else aceReady();
					}
				}
			},
			bd4: {
				clear: true,
				name: '<center>身份局相关功能</center>',
				nopointer: true
			},
			findZhong: {
				name: '<span style="font-family: xingkai">慧眼识忠</span>',
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
			bd5: {
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
					//代码取自［编辑统率将池］
					let container = ui.create.div('.popup-container.editor');
					let editorpage = ui.create.div(container);
					let discardConfig = ui.create.div('.editbutton', '取消', editorpage, function () {
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete(null);
						delete window.saveNonameInput;
					});
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
					let saveConfig = ui.create.div('.editbutton', '保存', editorpage, saveInput);
					let editor = ui.create.div(editorpage);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					} else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					} else {
						let aceReady = function () {
							ui.window.appendChild(node);
							let mirror = window.CodeMirror(editor, {
								value: node.code,
								mode: 'javascript',
								lineWrapping: !lib.config.touchscreen && lib.config.mousewheel,
								lineNumbers: true,
								indentUnit: 4,
								autoCloseBrackets: true,
								theme: 'mdn-like'
							});
							lib.setScroll(editor.querySelector('.CodeMirror-scroll'));
							node.aced = true;
							node.editor = mirror;
						};
						if (!window.ace) {
							lib.init.js(lib.assetURL + 'game', 'codemirror', aceReady);
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						} else aceReady();
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
			tip1: {
				name: '以下功能为<font color=#00FFFF>伪禁</font>衍生功能，<font color=#FFFF00>如需使用请开启〔伪玩家可选ai禁选〕</font>',
				clear: true
			},
			banzhu: {
				clear: true,
				name: '<li>主公AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要主公AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_zhu || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出主公AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>主公AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入主公AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>主公AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'zhu', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>主公AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			banzhubiao: {
				name: '<li>主公AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_zhu || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					banzhucharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					banzhucharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', banzhucharacter, function () {
						banzhucharacter.delete();
					});
				}
			},
			banzhong: {
				clear: true,
				name: '<li>忠臣AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要忠臣AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_zhong || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出忠臣AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>忠臣AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入忠臣AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>忠臣AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'zhong', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>忠臣AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			banzhongbiao: {
				name: '<li>忠臣AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_zhong || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					banzhongcharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					banzhongcharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', banzhongcharacter, function () {
						banzhongcharacter.delete();
					});
				}
			},
			banfan: {
				clear: true,
				name: '<li>反贼AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要反贼AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_fan || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出反贼AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>反贼AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入反贼AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>反贼AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'fan', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>反贼AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			banfanbiao: {
				name: '<li>反贼AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_fan || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					banfancharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					banfancharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', banfancharacter, function () {
						banfancharacter.delete();
					});
				}
			},
			bannei: {
				clear: true,
				name: '<li>内奸AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要内奸AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_nei || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出内奸AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>内奸AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入内奸AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>内奸AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'nei', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>内奸AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			banneibiao: {
				name: '<li>内奸AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_nei || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					banneicharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					banneicharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', banneicharacter, function () {
						banneicharacter.delete();
					});
				}
			},
			bandizhu: {
				clear: true,
				name: '<li>地主AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要地主AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_dizhu || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出地主AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>地主AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入地主AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>地主AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'dizhu', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>地主AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			bandizhubiao: {
				name: '<li>地主AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_dizhu || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					bandizhucharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					bandizhucharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', bandizhucharacter, function () {
						bandizhucharacter.delete();
					});
				}
			},
			bannongmin: {
				clear: true,
				name: '<li>农民AI禁将',
				onclick: function () {
					var temp = this;
					game.prompt('请输入要农民AI禁选的武将id<br>（如标曹操为“caocao”，神曹操为“shen_caocao”），再次输入同id即可退出', function (str) {
						if (str) {
							var thisstr = '';
							if (lib.character[str]) {
								thisstr = str;
								var lists = lib.config.extension_AI优化_nongmin || [];
								if (lists && lists.includes(thisstr)) {
									lists.remove(thisstr);
									temp.innerHTML = '<div style="color:rgb(210,210,000);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已移出农民AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>农民AI禁将';
										delete temp.ready;
									}, 1600);
								} else {
									lists.push(thisstr);
									temp.innerHTML = '<div style="color:rgb(255,97,3);font-family:xinwei"><font size="4">' + (lib.translate[thisstr] || '未知') + '已加入农民AI禁选</font></div>';
									temp.ready = true;
									setTimeout(() => {
										temp.innerHTML = '<li>农民AI禁将';
										delete temp.ready;
									}, 1600);
								}
								game.saveExtensionConfig('AI优化', 'nongmin', lists);
							} else {
								temp.innerHTML = '<div style="color:rgb(255,0,0);font-family:xinwei"><font size="4">找不到该武将</font></div>';
								temp.ready = true;
								setTimeout(() => {
									temp.innerHTML = '<li>农民AI禁将';
									delete temp.ready;
								}, 1600);
							}
						}
					});
				}
			},
			bannongminbiao: {
				name: '<li>农民AI禁选表(点击查看)',
				clear: true,
				onclick: function () {
					var h = document.body.offsetHeight;
					var w = document.body.offsetWidth;
					var lists = lib.config.extension_AI优化_nongmin || [];
					//改自手杀ui和群英荟萃
					var SRr = "<html><head><meta charset='utf-8'><style type='text/css'>body {background-image: url('" + lib.assetURL + "extension/AI优化/beijing.png');background-size: 100% 100%;background-position: center;--w: 560px;--h: calc(var(--w) * 610/1058);width: var(--w);height: var(--h);background-repeat: no-repeat;background-attachment: fixed;}h1{text-shadow:1px 1px 1PX #000000,1px -1px 1PX #000000,-1px 1px 1PX #000000,-1px -1px 1PX #000000;font-size:20px}div {width: 160vmin;height: 63vmin;border: 0px solid black;border-radius: 9px;padding: 35px;margin-top: 5.5vmin;margin-bottom: 5.5vmin;margin-left: 10.5vmin;margin-right: 10.5vmin;position: center;}div.ex1 {width: 160vmin;height: 63vmin;overflow: auto;}</style></head><body><div class='ex1'>";
					if (lists && lists.length > 0) {
						for (var i = 0; i < lists.length; i++) {
							SRr += '〖';
							if (lib.translate[lists[i]]) SRr += lib.translate[lists[i]] + '（' + lists[i] + '）〗';
							else SRr += lists[i] + '〗';
						}
						SRr += '</div></body></html>';
					}
					else SRr += "亲～您尚未禁将</div></body></html>";
					bannongmincharacter = ui.create.div('', '<div style="z-index:114514"><iframe width="' + w + 'px" height="' + h + 'px" srcdoc="<!DOCTYPE html>' + SRr + '"></iframe></div>', ui.window);
					bannongmincharacter_close = ui.create.div('', '<div style="height:10px;width:' + w + 'px;text-align:center;z-index:114514"><font size="5em">关闭</font></div>', bannongmincharacter, function () {
						bannongmincharacter.delete();
					});
				}
			},
			bd6: {
				clear: true,
				name: '<center>杂项</center>',
				nopointer: true
			},
			tip2: {
				name: '<font color=#FF3300>注意！</font>通过以下功能设置的权重将<font color=#FFFF00>优先</font>作为<font color=#00FFFF>内奸AI</font>判断场上角色实力的参考',
				clear: true
			},
			fixQz: {
				name: '<span style="font-family: xingkai">出牌可修改武将权重</span>',
				intro: '出牌阶段可以设置/修改场上武将的权重，以此影响内奸AI策略',
				init: false
			},
			applyQz: {
				name: '武将登场补充权重',
				intro: '游戏开始或隐匿武将展示武将牌时会建议玩家为没有设置权重的武将设置权重',
				init: false
			},
			ckQz: {
				name: '<span style="font-family: xingkai">第二权重参考</span>',
				intro: '开启后，针对没有设置权重的武将，〔评级〕会根据武将评级为这些武将分配正相关的权重[0.8,1.95]，单机时可通过〈千幻聆音〉等扩展修改武将评级以影响对应武将权重；［威胁度］会将武将威胁度作为其对应的权重',
				init: 'off',
				item: {
					off: '不设置',
					pj: '评级',
					cf: '威胁度'
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
					let discardConfig = ui.create.div('.editbutton', '取消', editorpage, function () {
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete(null);
						delete window.saveNonameInput;
					});
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
					let saveConfig = ui.create.div('.editbutton', '保存', editorpage, saveInput);
					let editor = ui.create.div(editorpage);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					} else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					} else {
						let aceReady = function () {
							ui.window.appendChild(node);
							let mirror = window.CodeMirror(editor, {
								value: node.code,
								mode: 'javascript',
								lineWrapping: !lib.config.touchscreen && lib.config.mousewheel,
								lineNumbers: true,
								indentUnit: 4,
								autoCloseBrackets: true,
								theme: 'mdn-like'
							});
							lib.setScroll(editor.querySelector('.CodeMirror-scroll'));
							node.aced = true;
							node.editor = mirror;
						};
						if (!window.ace) {
							lib.init.js(lib.assetURL + 'game', 'codemirror', aceReady);
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						} else aceReady();
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
			tip3: {
				name: '<br><font color=#FF3300>注意！</font>通过以下功能修改的技能威胁度会<font color=#00FFFF>覆盖</font>技能原有的威胁度<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp由于威胁度一般会与卡牌收益作积，为避免新手胡乱设置可能引起的错乱ai，故部分功能不允许将威胁度设为<font color=#FFFF00>非正数</font>',
				clear: true
			},
			fixCf: {
				name: '<span style="font-family: xingkai">出牌可修改技能威胁度</span>',
				intro: '出牌阶段可以修改场上武将当前拥有的技能的威胁度，一定程度上为AI提供集火优先级',
				init: false
			},
			applyCf: {
				name: '威胁度补充',
				intro: '〔自动补充〕会在进入游戏时根据武将评级对没有添加威胁度的武将技能增加一定威胁度，单机时可通过〈千幻聆音〉等扩展修改武将评级以影响对应技能威胁度；<br>〔手动补充〕会在游戏开始或隐匿武将展示武将牌时建议玩家为没有添加威胁度的技能赋威胁度',
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
					let discardConfig = ui.create.div('.editbutton', '取消', editorpage, function () {
						ui.window.classList.remove('shortcutpaused');
						ui.window.classList.remove('systempaused');
						container.delete(null);
						delete window.saveNonameInput;
					});
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
					let saveConfig = ui.create.div('.editbutton', '保存', editorpage, saveInput);
					let editor = ui.create.div(editorpage);
					if (node.aced) {
						ui.window.appendChild(node);
						node.editor.setValue(node.code, 1);
					} else if (lib.device == 'ios') {
						ui.window.appendChild(node);
						if (!node.textarea) {
							let textarea = document.createElement('textarea');
							editor.appendChild(textarea);
							node.textarea = textarea;
							lib.setScroll(textarea);
						}
						node.textarea.value = node.code;
					} else {
						let aceReady = function () {
							ui.window.appendChild(node);
							let mirror = window.CodeMirror(editor, {
								value: node.code,
								mode: 'javascript',
								lineWrapping: !lib.config.touchscreen && lib.config.mousewheel,
								lineNumbers: true,
								indentUnit: 4,
								autoCloseBrackets: true,
								theme: 'mdn-like'
							});
							lib.setScroll(editor.querySelector('.CodeMirror-scroll'));
							node.aced = true;
							node.editor = mirror;
						};
						if (!window.ace) {
							lib.init.js(lib.assetURL + 'game', 'codemirror', aceReady);
							lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
						} else aceReady();
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
			bd7: {
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
			intro: `<font color=#00FFFF>建立者</font>：<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp柚子丶奶茶丶猫以及面具<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp翩翩浊世许公子<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp157<br><font color=#00FFFF>现更者</font>：<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp157
				<br><font color=#00FFFF>特别鸣谢</font>：<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp寰宇星城(插件功能)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp༺ཌༀཉི梦ღ沫ღ惜༃ༀ(工具人)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp萌新（转型中）(本体优化)
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp😁呲牙哥！(扩展宣传)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp读书人(扩展宣传)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp幸运女神在微笑(扩展宣传)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspAurora(代码参考)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp蓝色火鸡(代码提供)<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp呓如惑(测试反馈)
				<br><font color=#00FFFF>当前版本号</font>：<font color=#FFFF00>1.3.5.5</font><br><font color=#00FFFF>支持本体最低版本号</font>：<font color=#FFFF00>1.10.4</font><br><font color=#00FFFF>建议本体最低版本号</font>：<font color=#FFFF00>1.10.5</font><br><font color=#00FFFF>更新日期</font>：24年<font color=#00FFB0> 1</font>月<font color=#FFFF00>10</font>日<font color=fire>22</font>时<br>`,
			author: '',
			diskURL: '',
			forumURL: '',
			version: '1.3.5.5'
		},
		files: { character: [], card: [], skill: [] }
	}
});