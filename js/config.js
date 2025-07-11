import { lib, game, ui, get, ai, _status, security } from './utils.js';
export let config = {
	bd1: {
		name: '<hr aria-hidden="true">',
		clear: true,
	},
	introduction: {
		name: '<div style="color: #00FFFF">▶扩展介绍（点击展开）</div>',
		clear: true,
		onclick() {
			/** 摘自《搬运自用》 */
			if (this.config_more === undefined) {
				const xutou = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				const more = ui.create.div(
					'.config_more',
					ui.joint`
						<div style="font-size: 14px; text-align: left">
							<span style="font-family: yuanli">
								本扩展以『云将』『官将重修』中部分功能为基础，
								@柚子丶奶茶丶猫以及面具 退圈前已许可修改，
								现由@翩翩浊世许公子 和 @157 整理，
								暂无后续维护者，后续改动结果与原作者无关
							</span>
							<br /><br /><span style="font-family: shousha">
								<span style="color: #FF3300">注意！</span>
								本扩展与其他有AI功能的扩展同时打开可能会导致AI错乱。
								若出现bug建议关闭本扩展后测试以进一步确定问题所在
							</span>
							<br /><span style="font-family: xingkai">
								${xutou}本扩展主要优化了身份局AI和其他一些AI。
								<br />${xutou}此外，本扩展还添加了查看态度、去除部分小游戏、（伪）玩家可选AI禁选系列功能、
									身份局系列功能、胜负统计、技能嘲讽、武将权重等一系列能在一定程度上增加游戏乐趣的功能；
									同时还支持复制/粘贴一些难以记忆的扩展配置，便于玩家重装游戏时备份相应数据。
								<br />${xutou}此外需要解释的就是权重、嘲讽（技能威胁度）有何作用：
								<br />${xutou}“权重”则是辅助身份局AI优化的，它将帮助内奸AI确定场上形势。
									因为正常情况下人机只能通过人头数粗略判断局势，显然有些超模武将会影响此判定。
									为此给这些武将添加更高的权重帮助内奸AI及时认清局势。
								<br />${xutou}“嘲讽”顾名思义，就是此技能拥有者的嘲讽将额外乘以这个技能的嘲讽值，以此煽动AI集火。
									上面的“权重”也可以附加此效果，选项为［权重参与效益结算］。
							</span>
							<br /><br /><span style="font-family: xingkai">${xutou}具体AI优化内容参见</span>
							<b>菜单→(选项→)其他→帮助→AI优化</b>
						</div>
					`
				);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.config_more = more;
				this.innerHTML = '<div style="color: #00FFFF">▼扩展介绍（点击折叠）</div>';
			} else {
				this.parentNode.removeChild(this.config_more);
				delete this.config_more;
				this.innerHTML = '<div style="color: #00FFFF">▶扩展介绍（点击展开）</div>';
			}
		},
	},
	recommendations: {
		name: '<div style="color: #00FFFF">▶相关推荐（点击展开）</div>',
		clear: true,
		onclick() {
			/** 摘自《搬运自用》 */
			if (this.config_more === undefined) {
				if (typeof game.copyGroup !== 'function') {
					// 创建复制群号的全局函数
					game.copyGroup = (name, number) => {
						game.copy(number, `已成功将${name}群号复制到剪贴板`);
					};
				}
				const groupStyle = 'font-size: 18px; cursor: pointer; text-decoration: underline; color: #1E90FF;';
				let groups = [
					['无名杀资源分享群', '518026909'],
					['无名杀官方联机群', '367932654'],
					['无名杀代码群', '698319604'],
					['无名杀官方群Ⅱ', '885209661'],
					['无名杀官方群Ⅲ', '459406548'],
					['无名杀官方IV群', '833216087'],
					['无名杀官方群V', '784030074'],
					['无名杀官方群VI', '1079533768'],
					['无名杀官方群VII', '707344364'],
					['武将diy第九交流区', '693526248'],
					['无名杀官方群X', '729583887'],
					['无名杀官方群XII', '500004047'],
					['无名杀官方群XIII', '752253383'],
					['无名杀官方群XIV', '157944551'],
					['无名杀官方群XV', '885656146'],
					['无名杀官方群XVI', '699978396'],
					['无名杀官方群XVIII', '514420615'],
					['无名杀官方群XX', '565580233'],
					['无名杀内测资源整合群', '1037970212'],
					['无名杀本体更新内测群', '392157644'],
				];
				let str = '';
				for (const arr of groups) {
					str += `
						<br /><span style="${groupStyle}" onclick="game.copyGroup('${arr[0]}', '${arr[1]}')">${arr[0]}：${arr[1]}</span>
					`;
				}
				const more = ui.create.div(
					'.config_more',
					ui.joint`
						<div style="line-height: 21px; text-align: left">
							<span style="color: #FFFF00; font-size: 14px">
								本体仓库地址：https://github.com/libnoname/noname
							</span>
							<br />无名杀QQ频道：
							<br /><img style="width:256px" src="${lib.assetURL}extension/AI优化/img/promotion/qq.jpg">
							<br /><br />点按即可复制对应群号：${str}
						</div>
					`
				);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.config_more = more;
				this.innerHTML = '<div style="color: #00FFFF">▼相关推荐（点击折叠）</div>';
			} else {
				this.parentNode.removeChild(this.config_more);
				delete this.config_more;
				this.innerHTML = '<div style="color: #00FFFF">▶相关推荐（点击展开）</div>';
			}
		},
	},
	copyGit: {
		name: '一键复制<span style="color: #FFFF00">GitHub</span><span style="color: #00FFFF">仓库链接</span>',
		clear: true,
		onclick() {
			game.copy('https://github.com/PZ157/noname_AIOptimization', '链接已复制到剪贴板，欢迎志同道合之人为无名杀和本扩展提供代码');
		},
	},
	tip1: {
		clear: true,
		name: ui.joint`
			<hr aria-hidden="true"><div style="display: flex; justify-content: center">
				<span style="color: #00FFB0">以下大部分选项长按有提示</span>！
			</div>
			<div style="display: flex; justify-content: center">
				<span style="font-family: xingkai">行楷字体选项</span>均<span style="color: #FFFF00">即时生效</span>！
			</div>
			<br /><div style="display: flex; justify-content: center">AI相关</div>
		`,
		nopointer: true,
	},
	sfjAi: {
		name: '身份局AI优化',
		intro: ui.joint`
			开启后，重启游戏可载入身份局AI策略。可通过［出牌可修改武将权重］、［武将登场补充权重］和［第二权重参考］为内奸AI判断场上角色实力提供参考
		`,
		init: true,
	},
	qjAi: {
		name: '全局AI优化',
		intro: '开启后，将添加防酒杀ai（透视）；人机拥有多张同名牌时鼓励人机使用点数较小的牌，弃牌时鼓励保留点数较大的牌',
		init: false,
	},
	mjAi: {
		name: '盲狙AI',
		intro: '开启后，AI会以更激进的方式盲狙',
		init: false,
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
		},
	},
	ntAoe: {
		name: '<span style="font-family: xingkai">aoe不受上一功能影响</span>',
		intro: '开启后，即使队友残血AI依然会考虑要不要放南蛮万箭',
		init: false,
	},
	bd2: {
		clear: true,
		name: '<div style="display: flex; justify-content: center">常用功能</div>',
		nopointer: true,
	},
	viewAtt: {
		name: '火眼金睛',
		intro: '可在顶部菜单栏查看态度',
		init: false,
	},
	removeMini: {
		name: '去除本体武将小游戏',
		intro: ui.joint`
			去除手杀马钧〖巧思〗、手杀孙寒华〖冲虚〗、手杀南华老仙〖御风〗、手杀庞德公〖评才〗、手杀郑玄〖整经〗、手杀周群〖天算〗、
				OL蒲元〖神工〗、国崎往人〖控物〗的小游戏，重启生效。
				（注意：若有其他拓展修改了对应技能小游戏则可能会报错，关闭此选项即可）
		`,
		init: false,
	},
	rank: {
		name: '修改武将评级显示',
		intro: '开启后，将修改武将栏界面中的武将评级显示内容',
		init: 'off',
		item: {
			wr: '稀有度',
			wd: '大写汉字',
			wx: '小写汉字',
			wp: '九品制',
			tg: '官方评级',
			tz: '字母评级',
			tq: '混合评级',
			off: '关闭',
		},
	},
	exportPz: {
		name: '复制本扩展配置',
		clear: true,
		onclick() {
			let txt = '{';
			for (let i in lib.config) {
				if (!i.indexOf('extension_AI优化_')) {
					txt += '\r	b' + i.slice(15) + ' : ' + JSON.stringify(lib.config[i]).replace('\n', '\r') + ',';
				} else if (!i.indexOf('aiyh_character_skill_id_')) {
					txt += '\r	s' + i.slice(24) + ' : ' + JSON.stringify(lib.config[i]).replace('\n', '\r') + ',';
				}
			}
			txt += '\r}';
			game.copy(txt, '『AI优化』配置已成功复制到剪切板，请您及时粘贴保存');
		},
	},
	loadPz: {
		name: '载入本扩展配置',
		clear: true,
		onclick() {
			let container = ui.create.div('.popup-container.editor');
			let node = container;
			let str = '//完整粘贴你保存的『AI优化』配置到等号右端\n_status.aiyh_config = ';
			node.code = str;
			ui.window.classList.add('shortcutpaused');
			ui.window.classList.add('systempaused');
			let saveInput = function () {
				let code, j;
				if (container.editor) code = container.editor.getValue();
				else if (container.textarea) code = container.textarea.value;
				try {
					eval(code);
					if (Object.prototype.toString.call(_status.aiyh_config) !== '[object Object]') throw 'typeError';
				} catch (e) {
					if (e === 'typeError') alert('类型不为[object Object]');
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
			} else if (lib.device === 'ios') {
				ui.window.appendChild(node);
				if (!node.textarea) {
					let textarea = document.createElement('textarea');
					editor.appendChild(textarea);
					node.textarea = textarea;
					lib.setScroll(textarea);
				}
				node.textarea.value = node.code;
			} else {
				if (!window.CodeMirror) {
					import('../../../game/codemirror.js').then(() => {
						lib.codeMirrorReady(node, editor);
					});
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				} else lib.codeMirrorReady(node, editor);
			}
		},
	},
	bd3: {
		clear: true,
		name: '<div style="display: flex; justify-content: center">身份局相关功能</div>',
		nopointer: true,
	},
	findZhong: {
		name: '慧眼识忠',
		intro: '主公开局知道一名忠臣身份',
		init: false,
	},
	neiKey: {
		name: '<span style="font-family: xingkai">内奸可亮明身份</span>',
		intro: ui.joint`
			内奸可以于出牌阶段直接亮明身份并加1点体力上限，然后可以选择与主公各回复1点体力，建议与［身份局AI优化］搭配使用，
				<span style="color: #FF3300">不然会显得非常无脑</span>
		`,
		init: 'off',
		item: {
			can: '未暴露可亮',
			must: '暴露也可亮',
			off: '关闭',
		},
	},
	bd4: {
		clear: true,
		name: '<div style="display: flex; justify-content: center">内奸权重策略</div>',
	},
	tip2: {
		name: ui.joint`
			<span style="color: #FF3300">注意！</span>
				通过以下功能设置的权重将<span style="color: #FFFF00">优先</span>
				作为<span style="color: #00FFFF">内奸AI</span>判断场上角色实力的参考
		`,
		clear: true,
	},
	fixQz: {
		name: '<span style="font-family: xingkai">出牌可修改武将权重</span>',
		intro: ui.joint`
			出牌阶段可以设置/修改场上武将的权重，以此影响内奸AI策略
			<br /><span style="color: #FF3300">注意！</span>凡涉及影响权重的功能均需开启［身份局AI优化］方才有实际效果！
		`,
		init: false,
	},
	applyQz: {
		name: '武将登场补充权重',
		intro: '游戏开始或隐匿武将展示武将牌时会建议玩家为没有设置权重的武将设置权重',
		init: false,
	},
	pjQz: {
		name: '<span style="font-family: xingkai">参考评级补充权重</span>',
		intro: '开启后，针对没有设置权重的武将，将会根据武将评级为这些武将分配正相关的权重[0.8,1.95]',
		init: false,
	},
	takeQz: {
		name: '胜率代替权重',
		intro: '开启后，内奸AI分析局势时将检查场上武将所选身份/阵营对应胜负统计总场数是否满足上一选项条件，如果满足则用胜率换算值代替原有权重',
		init: false,
		onclick(bool) {
			if (
				!bool ||
				typeof game.purifySFConfig === 'function' ||
				confirm('检测到《胜负统计》未安装/未开启，此功能暂无效果，是否依然开启此功能？')
			) {
				game.saveExtensionConfig('AI优化', 'takeQz', bool);
			}
		},
	},
	min: {
		name: '<span style="font-family: xingkai">只利用总场数不少于</font>',
		intro: '请先开启［胜率代替权重］。内奸AI将优先采用符合本配置数值的数据作为武将权重计算',
		init: '10',
		input: true,
		onblur(e) {
			let text = e.target,
				num = Number(text.innerText);
			if (isNaN(num)) num = 10;
			else if (num < 0) num = 0;
			else if (!Number.isInteger(num)) num = Math.round(num);
			text.innerText = num;
			game.saveExtensionConfig('AI优化', 'min', num);
		},
	},
	qzCf: {
		name: '<span style="font-family: xingkai">权重参与效益结算</span>',
		intro: ui.joint`
			开启后，ai在计算卡牌效益时会将权重（若无则为1）与结果作积返回，以此鼓励ai优先“待遇”权重大的角色。
			会累乘下面的威胁度相关功能赋值，不推荐同时使用
		`,
		init: false,
	},
	editQz: {
		name: '编辑武将权重',
		clear: true,
		onclick() {
			let container = ui.create.div('.popup-container.editor');
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
					var { weight } = security.exec2(code);
					if (Object.prototype.toString.call(weight) !== '[object Object]') {
						throw 'typeError';
					}
				} catch (e) {
					if (e === 'typeError') alert('类型不为[object Object]');
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
			} else if (lib.device === 'ios') {
				ui.window.appendChild(node);
				if (!node.textarea) {
					let textarea = document.createElement('textarea');
					editor.appendChild(textarea);
					node.textarea = textarea;
					lib.setScroll(textarea);
				}
				node.textarea.value = node.code;
			} else {
				if (!window.CodeMirror) {
					import('../../../game/codemirror.js').then(() => {
						lib.codeMirrorReady(node, editor);
					});
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				} else lib.codeMirrorReady(node, editor);
			}
		},
	},
	clearQz: {
		name: '清空设置的武将权重',
		clear: true,
		onclick() {
			let xs = 0;
			for (let i in lib.config.extension_AI优化_qz) {
				xs++;
			}
			if (confirm('您确定要清空所有通过上述功能设置的武将权重（共' + xs + '项）？')) {
				game.saveExtensionConfig('AI优化', 'qz', {});
				alert('清除成功');
			}
		},
	},
	bd5: {
		clear: true,
		name: '<div style="display: flex; justify-content: center">技能威胁度</div>',
		nopointer: true,
	},
	tip3: {
		name: ui.joint`
			<span style="color: #FF3300">注意！</span>
				通过以下功能修改的技能威胁度会<span style="color: #00FFFF">覆盖</span>技能原有的威胁度
			<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;由于威胁度一般会与卡牌收益作积，
				为避免新手胡乱设置可能引起的错乱ai，
				故部分功能不允许将威胁度设为<span style="color: #FFFF00">非正数</span>
		`,
		clear: true,
	},
	fixCf: {
		name: '<span style="font-family: xingkai">出牌可修改技能威胁度</span>',
		intro: '出牌阶段可以修改场上武将当前拥有的技能的威胁度，一定程度上为AI提供集火优先级',
		init: false,
	},
	applyCf: {
		name: '威胁度补充',
		intro: ui.joint`
			〔按评级自动补充〕会在进入游戏时根据武将评级对没有添加威胁度的武将技能增加一定威胁度；
			<br />〔按品质自动补充〕与前者类似，区别在于前者分九档，后者分五档；此外单机时可通过〈千幻聆音〉等扩展修改武将品质；
			<br />〔手动补充〕会在游戏开始或隐匿武将展示武将牌时建议玩家为没有添加威胁度的技能赋威胁度
		`,
		init: 'off',
		item: {
			off: '不补充',
			pj: '按评级自动补充',
			pz: '按品质自动补充',
			sd: '手动补充',
		},
	},
	editCf: {
		name: '编辑修改的技能威胁度',
		clear: true,
		onclick() {
			let container = ui.create.div('.popup-container.editor');
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
					if (e === '类型不符') alert(e);
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
			} else if (lib.device === 'ios') {
				ui.window.appendChild(node);
				if (!node.textarea) {
					let textarea = document.createElement('textarea');
					editor.appendChild(textarea);
					node.textarea = textarea;
					lib.setScroll(textarea);
				}
				node.textarea.value = node.code;
			} else {
				if (!window.CodeMirror) {
					import('../../../game/codemirror.js').then(() => {
						lib.codeMirrorReady(node, editor);
					});
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				} else lib.codeMirrorReady(node, editor);
			}
		},
	},
	clearCf: {
		name: '清空修改的技能威胁度',
		clear: true,
		onclick() {
			let xs = 0;
			for (let i in lib.config.extension_AI优化_cf) {
				xs++;
			}
			if (confirm('您确定要清空所有通过上述功能修改的技能威胁度（共' + xs + '项）？')) {
				game.saveExtensionConfig('AI优化', 'cf', {});
				alert('清除成功');
			}
		},
	},
	bd6: {
		name: '<hr aria-hidden="true">',
		clear: true,
	},
};
