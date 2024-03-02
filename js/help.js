import { lib, game, ui, get, ai, _status } from './noname.js'

export let help = {
	'AI优化': `<center><font color=#FFFF00>本体武将优化相关</font></center>
	<br>神马超〖狩骊〗〖横骛〗<br>夏侯紫萼〖血偿〗<br>TW张昭〖纯刚〗
	<br><br>
	<br><center><font color=#00FFFF>本体卡牌AI相关</font></center>
	<br><span style='font-family: xingkai'>南蛮入侵</span>
	<br><span style='font-family: shousha'>●将身份奖惩写在【南蛮入侵】中对使用者的效益里，一定程度上减少人机杀敌一千自损八百的情况；
	<br>●增加对有「打出杀」标签的角色的判断，具体化残血主公的放大效益，一定程度上鼓励人机开aoe收残血反；
	<br>●有无懈的队友一般会在自己也是aoe的目标且没有响应的情况下比较当前响应角色和自己的情况决定要不要不出无懈，已响应或不为目标也会看在队友实力雄厚的情况下可能不出无懈</span>
	<br><br><span style='font-family: xingkai'>万箭齐发</span>与<span style='font-family: xingkai'>南蛮入侵</span>类似
	<br><br><span style='font-family: xingkai'>以逸待劳</span>
	<br><span style='font-family: shousha'>●修复文字描述错误，对决模式目标默认选择己方角色</span>
	<br><br>
	<br><center><font color=#00FFB0>身份局相关</font></center>
	<br><span style='font-family: shousha'>●没有队友、场上有忠臣存活的反贼和内奸，以及没有忠臣、场上有多名反贼存活的主公和内奸彼此会减少伤害牌的使用，并在自己血还够扛的情况下会救濒死的对方；
	<br>●需要弃牌时，主公会盲那些身份尚不明朗的人，前提是对方体力大于1或者自己有绝情标签（一定程度上避免盲忠弃牌后果），如果是忠内混战，主公还会把身份尚不明朗的人都连起来；
	<br>●稍稍提高对主公用伤害牌或兵乐的影响；
	<br>●内奸将根据玩家设置的武将权重和［胜率代替权重］［第二权重参考］等功能选择的选项作为侧重判断场上角色实力、战损程度、牌持有量、有无翻面决定自己是跳反、跳忠还是酱油（主公比较健康且忠反双方实力差距不大时酱油）；
	<br>●通过内奸的努力，会逐渐减少其身份暴露度，但如果他跳反时救人或直接伤害主忠，将其身份直接暴露，如果救主忠，大幅减少其身份暴露度；
	<br>●内奸跳忠/反时会优先打反/忠，需要弃牌时会盲身份不明朗的角色，并尽量规避对主以及忠/反使用伤害牌，自己和主公比较健康时也会救忠/反；
	<br>●内奸打酱油时，只关心自己和主公，非必要不用牌，需要弃牌时使用伤害牌但也不酒杀，对忠反的生死漠不关心</span>
	<br><br>
	<br><center><font color=fire>其他</font></center>
	<br><span style='font-family: shousha'>●人机拥有多张同名牌时鼓励人机使用点数较小的牌，弃牌时鼓励保留点数较大的牌，但由于是微调数值收效甚微；
	<br>●鼓励拥有reverseEquip标签的角色刷装备，大幅降低已被废除的装备栏对应副类别的牌的价值</span>` +
	'<br><hr><br>关注微信公众号“无名杀扩展交流”，获取更多扩展最新动态：<br><img style=width:240px src=' +
	lib.assetURL + 'extension/AI优化/img/promotion/wx.jpg><br><br>无名杀QQ频道：<br><img style=width:240px src=' +
	lib.assetURL + 'extension/AI优化/img/promotion/qq.jpg><br><br>DoDo无名杀超级群：<br><img style=width:240px src=' +
	lib.assetURL + 'extension/AI优化/img/promotion/dodo.jpg><br><br>无名杀小白鼠群：<br><img style=width:240px src=' +
	lib.assetURL + 'extension/AI优化/img/promotion/ceshi.jpg><br><br>AI优化百度网盘二维码：<br><img style=width:240px src=' +
	lib.assetURL + 'extension/AI优化/img/promotion/aiyh.png>'
}