import { lib, game, ui, get, ai, _status } from './noname.js'
export let config = {
	bd1: {
		name: '<br><hr>',
		clear: true
	},
	kzjs: {
		name: '<font color=#00FFFF>扩展简介</font>',
		init: 'jieshao',
		unfrequent: true,
		item: {
			jieshao: '点击查看',
		},
		textMenu: function (node, link) {
			lib.setScroll(node.parentNode);
			node.parentNode.style.transform = 'translateY(-100px)';
			node.parentNode.style.height = '300px';
			node.parentNode.style.width = '300px';
			if (link === 'jieshao') node.innerHTML = `<br><span style='font-family: xinwei'><center><font color=#00FFFF>扩展简介</font></center></span>
				<br><span style='font-family: yuanli'>本扩展以『云将』『官将重修』中部分功能为基础，@柚子丶奶茶丶猫以及面具 退圈前已许可修改，现由@翩翩浊世许公子 和 @157 整理，暂无后续维护者，与原作者无关</span>
				<br><br><span style='font-family: shousha'><font color=#FF3300>注意！</font>本扩展与其他有AI功能的扩展同时打开可能会导致AI错乱。若本扩展涉及到的武将或卡牌出现bug建议关闭本扩展后测试以进一步确定问题所在</span>
				<br><span style='font-family: xingkai'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp本扩展主要优化了部分武将技能AI、卡牌AI、身份局AI和其他一些AI。
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp此外，本扩展还添加了查看态度、去除部分小游戏、（伪）玩家可选AI禁选系列功能、身份局系列功能、胜负统计、技能嘲讽、武将权重等一系列能在一定程度上增加游戏乐趣的功能；
				同时还支持复制/粘贴一些难以记忆的扩展配置，便于玩家重装游戏时备份相应数据。
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp此外需要解释的就是伪禁、权重、嘲讽（技能威胁度）三者各有何用：
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp“伪禁”就是在游戏开始时检查人机是否使用你添加到伪禁列表的武将，它们将被系统要求更换武将，以此可以避免人机使用你不希望其使用的武将，与本体的禁将功能的区别就是这些武将仍然会等概率地出现在你的武将候选框内。
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp“权重”则是辅助身份局AI优化的，它将帮助内奸AI确定场上形势，因为正常情况下人机只能通过人头数粗略判断局势，显然有些超模武将会严重影响此判定。为此给这些武将添加更高的权重帮助内奸AI及时认清局势。
				<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp“嘲讽”顾名思义，就是此技能拥有者的嘲讽将额外乘以这个技能的嘲讽值，以此煽动AI集火。上面的“权重”也可以附加此效果，选项为［权重参与效益结算］。
				<br><br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp顺带一提，身份局和斗地主的“伪禁”可以按身份区分禁将，你可以以此阻止特定身份的人机傻傻地选择不适合该身份的武将。</span>
				<br><br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style='font-family: xingkai'>具体AI优化内容参见</span><b>菜单→(选项→)其他→帮助→AI优化</b>`;
		}
	},
	yqlj: {
		name: '<font color=#00FFFF>友情链接</font>',
		init: 'share',
		unfrequent: true,
		item: {
			share: '点击查看',
		},
		textMenu: function (node, link) {
			lib.setScroll(node.parentNode);
			node.parentNode.style.transform = 'translateY(-100px)';
			node.parentNode.style.height = '300px';
			node.parentNode.style.width = '300px';
			if (link === 'share') node.innerHTML = "<hr>关注微信公众号“无名杀扩展交流”，获取更多扩展最新动态：<br><img style=width:280px src=" +
				lib.assetURL + "extension/AI优化/img/wx.jpg><br><br>无名杀QQ频道：<br><img style=width:280px src=" +
				lib.assetURL + "extension/AI优化/img/qq.jpg><br><br>DoDo无名杀超级群：<br><img style=width:280px src=" +
				lib.assetURL + "extension/AI优化/img/dodo.jpg><br><br>AI优化百度网盘二维码：<br><img style=width:280px src=" +
				lib.assetURL + "extension/AI优化/img/aiyh.png>";
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
	tip1: {
		clear: true,
		name: `<hr><center><font color=#00FFB0>以下大部分选项长按有提示</font>！</center>
			<center><span style='font-family: xingkai'>行楷字体选项</span>均<font color=#FFFF00>即时生效</font>！</center>
			<br><center>AI相关</center>`,
		nopointer: true
	},
	kpAi: {
		name: '卡牌AI优化',
		intro: '重启生效。仅优化了【南蛮入侵】【万箭齐发】【以逸待劳】AI',
		init: true
	},
	wjAi: {
		name: '武将技能优化',
		intro: `重启生效。具体优化技能：
			<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp神马超〖狩骊〗〖横骛〗
			<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp夏侯紫萼〖血偿〗`,
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
		intro: '目前包括以下前瞻AI优化：<br>【杀】',
		init: true
	},
	bd2: {
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
					import('../../../game/codemirror.js').then(() => {
						lib.codeMirrorReady(node, editor);
					});
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				}
				else lib.codeMirrorReady(node, editor);
			}
		}
	},
	bd3: {
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
	bd4: {
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
					import('../../../game/codemirror.js').then(() => {
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
	tip2: {
		name: '以下功能为<font color=#00FFFF>伪禁</font>衍生功能，<font color=#FFFF00>如需使用请开启〔伪玩家可选ai禁选〕</font>',
		clear: true
	},
	banzhu: {
		clear: true,
		name: '<li>主公AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'zhu', '主公');
		}
	},
	banzhubiao: {
		name: '<li>主公AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('zhu', '主公');
		}
	},
	banzhong: {
		clear: true,
		name: '<li>忠臣AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'zhong', '忠臣');
		}
	},
	banzhongbiao: {
		name: '<li>忠臣AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('zhong', '忠臣');
		}
	},
	banfan: {
		clear: true,
		name: '<li>反贼AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'fan', '反贼');
		}
	},
	banfanbiao: {
		name: '<li>反贼AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('fan', '反贼');
		}
	},
	bannei: {
		clear: true,
		name: '<li>内奸AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'nei', '内奸');
		}
	},
	banneibiao: {
		name: '<li>内奸AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('nei', '内奸');
		}
	},
	bandizhu: {
		clear: true,
		name: '<li>地主AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'dizhu', '地主');
		}
	},
	bandizhubiao: {
		name: '<li>地主AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('dizhu', '地主');
		}
	},
	bannongmin: {
		clear: true,
		name: '<li>农民AI禁将',
		onclick: function () {
			game.aiyh_configBan(this, 'nongmin', '农民');
		}
	},
	bannongminbiao: {
		name: '<li>农民AI禁选表(点击查看)',
		clear: true,
		onclick: function () {
			game.aiyh_configBanList('nongmin', '农民');
		}
	},
	bd5: {
		clear: true,
		name: '<center>胜负统计相关</center>'
	},
	apart: {
		name: '<span style="font-family: xingkai">区分当前游戏模式</font>',
		intro: '开启后，武将胜负统计将<font color=#FF0000>区分开当前游戏模式</font>（即按照菜单->开始->模式->游戏模式分开统计）',
		init: false,
		onclick: function (item) {
			game.saveExtensionConfig('AI优化', 'apart', item);
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
			game.saveExtensionConfig('AI优化', 'display', item);
		}
	},
	record: {
		name: '<span style="font-family: xingkai">武将胜负记录</span>',
		intro: '开启后，游戏结束将根据玩家胜负记录玩家所使用的武将胜负',
		init: false,
		onclick: function (item) {
			game.saveExtensionConfig('AI优化', 'record', item);
		}
	},
	tryAll: {
		name: '<span style="font-family: xingkai">尝试记录全场武将</span>',
		intro: '开启后，游戏结束将记录根据玩家胜负可以推测出来胜负的角色所使用的武将胜负',
		init: false,
		onclick: function (item) {
			game.saveExtensionConfig('AI优化', 'tryAll', item);
		}
	},
	sw: {
		name: '<span style="font-family: xingkai">其他阵营视为同一阵营</span>',
		intro: '开启后，游戏结束进行记录时其他阵营将视为同一阵营，即玩家方赢、其余方均输，玩家方没赢，其余方均赢',
		init: false,
		onclick: function (item) {
			game.saveExtensionConfig('AI优化', 'sw', item);
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
			game.saveExtensionConfig('AI优化', 'change', item);
		}
	},
	operateJl: {
		name: '<span style="font-family: xingkai">出牌阶段可修改胜负记录</font>',
		intro: '开启后，出牌阶段可以对场上武将或所有武将当前游戏模式的胜负记录进行批量删除或修改操作',
		init: false,
		onclick: function (item) {
			game.saveExtensionConfig('AI优化', 'operateJl', item);
		}
	},
	slRank: {
		name: '当前模式胜率排行榜',
		clear: true,
		onclick: function () {
			let mode = get.statusModeInfo(true), cgn = get.sfConfigName(), num = 0;
			for (let i of cgn) {
				get.sfInit(i, true);
				let rankNum = parseInt(lib.config.extension_AI优化_rankNum), sortedKeys = Object.entries(get.purifySFConfig(lib.config[i], lib.config.extension_AI优化_min)).sort(function (a, b) {
					let res = Math.round(100000 * a[1].sl) - Math.round(100000 * b[1].sl);
					if (rankNum > 0) res = -res;
					if (res == 0) return b[1].win + b[1].lose - a[1].win - a[1].lose;
					return res;
				}).slice(0, Math.abs(rankNum)).map(entry => entry[0]);
				if (!sortedKeys.length) continue;
				let txt = mode + '武将' + get.identityInfo(i) + '胜率排行榜（' + (rankNum > 0 ? '正序' : '倒序') + '）';
				for (let j = 0; j < sortedKeys.length; j++) {
					txt += '\n   第' + (j + 1) + '名   ' + lib.translate[sortedKeys[j]] + '|' + sortedKeys[j] + '\n                     ' + lib.config[i][sortedKeys[j]].win + '胜' + lib.config[i][sortedKeys[j]].lose + '负      胜率：' + Math.round(100000 * lib.config[i][sortedKeys[j]].sl) / 1000 + '%';
				}
				num++;
				alert(txt);
			}
			if (!num) alert('当前模式暂无符合条件的记录');
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
			game.saveExtensionConfig('AI优化', 'rankNum', item);
		}
	},
	min: {
		name: '<span style="font-family: xingkai">只筛选总场数不少于（单位：场，回车修改）</font>',
		intro: `在展示当前游戏模式武将胜率排行榜时，只在符合本配置条件的记录中筛选
			<br>此外如果您在［第二权重参考］中选择了〔胜率〕，那么内奸AI参考第二权重时将只采用符合本配置数值的数据`,
		init: '10',
		input: true,
		onblur: function (e) {
			let text = e.target,
				num = Number(text.innerText);
			if (isNaN(num)) num = 10;
			else if (num < 0) num = 0;
			else if (!Number.isInteger(num)) num = Math.round(num);
			text.innerText = num;
			game.saveExtensionConfig('AI优化', 'min', num);
		}
	},
	loadSf: {
		name: "载入当前模式武将胜负记录",
		clear: true,
		onclick: function () {
			let container = ui.create.div('.popup-container.editor');
			let editorpage = ui.create.div(container);
			let node = container;
			let map = get.sfConfigName();
			let str = '';
			for (let i of map) {
				str += '_status.' + i + ' = {\r	//请在此大括号内填写' + get.statusModeInfo(true) + '你想载入的武将' + get.identityInfo(i) + '胜负记录\r};\r';
			}
			str += '//请在{}内进行编辑，务必使用英文标点符号！';
			node.code = str;
			ui.window.classList.add('shortcutpaused');
			ui.window.classList.add('systempaused');
			let saveInput = function () {
				let code;
				if (container.editor) code = container.editor.getValue();
				else if (container.textarea) code = container.textarea.value;
				try {
					eval(code);
					for (let i of map) {
						if (_status[i] && Object.prototype.toString.call(_status[i]) !== '[object Object]') throw ('typeError');
					}
				}
				catch (e) {
					if (e === 'typeError') alert('类型错误');
					else alert('代码语法有错误，请仔细检查（' + e + '）');
					return;
				}
				for (let i of map) {
					if (_status[i]) for (let name in _status[i]) {
						lib.config[i][name] = _status[i][name];
					}
					game.saveConfig(i, lib.config[i]);
				}
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
					import('../../../game/codemirror.js').then(() => {
						lib.codeMirrorReady(node, editor);
					});
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				}
				else lib.codeMirrorReady(node, editor);
			}
		}
	},
	copySf: {
		name: '复制当前模式武将胜负记录',
		clear: true,
		onclick: function () {
			let cgn = get.sfConfigName();
			let mode = get.statusModeInfo(true) + '所有武将';
			let copy = '', show = true;
			for (let i of cgn) {
				show = true;
				if (!confirm(copy + '是否复制' + mode + get.identityInfo(i) + '胜负记录？')) {
					copy = '';
					continue;
				}
				let map = lib.config[i] || {}, txt = '	//' + mode + get.identityInfo(i) + '胜负记录\r';
				get.sfInit(i, true);
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
					copy = mode + get.identityInfo(i) + '胜负记录已成功复制到剪切板，建议您先粘贴到其他地方再进行后续操作。\n';
				}
				else copy = mode + get.identityInfo(i) + '胜负记录复制失败。\n';
				document.body.removeChild(textarea);
				show = false;
			}
			if (!show) {
				if (copy.includes('失败')) alert(copy.split('。')[0]);
				else alert(copy.split('，')[0]);
			}
		}
	},
	deleteSf: {
		name: '删除当前模式武将胜负记录',
		clear: true,
		onclick: function () {
			let mode = get.statusModeInfo(true), cgn = get.sfConfigName();
			if (cgn.length > 1) {
				let num = 0;
				for (let i of cgn) {
					if (confirm('您确定要清空' + mode + '所有武将' + get.identityInfo(i) + '胜负记录吗？')) {
						num++;
						game.saveConfig(i, {});
					}
				}
				if (num) alert('成功清除' + num + '项');
			}
			else if (confirm('您确定要清空' + lib.translate[get.mode()] + '模式' + mode + '所有武将的胜负记录吗？')) {
				game.saveConfig(cgn[0], {});
				alert('清除成功');
			}
		}
	},
	bd6: {
		clear: true,
		name: '<center>杂项</center>',
		nopointer: true
	},
	tip3: {
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
					import('../../../game/codemirror.js').then(() => {
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
	tip4: {
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
					import('../../../game/codemirror.js').then(() => {
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
	bd7: {
		name: '<hr>',
		clear: true
	},
}