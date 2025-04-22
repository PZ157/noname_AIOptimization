import { lib, game, ui, get, ai, _status } from './utils.js';

export let help = {
	AI优化: ui.joint`
		<center><font color=#00FFB0>身份局相关</font></center>
		<br><span style="font-family: shousha">
			●没有队友、场上有忠臣存活的反贼和内奸，以及没有忠臣、场上有多名反贼存活的主公和内奸彼此会减少伤害牌的使用，
				并在自己血还够扛的情况下会救濒死的对方；
			<br>●需要弃牌时，主公会盲那些身份尚不明朗的人，前提是对方体力大于1或者自己有绝情标签（一定程度上避免盲忠弃牌后果）；
				如果是忠内混战，主公还会把身份尚不明朗的人都连起来；
			<br>●稍稍提高对主公用伤害牌或兵乐的影响；
			<br>●内奸将根据玩家设置的武将权重和［胜率代替权重］［第二权重参考］等功能选择的选项
				作为侧重判断场上角色实力、战损程度、牌持有量、有无翻面决定自己是跳反、跳忠还是酱油（主公比较健康且忠反双方实力差距不大时酱油）；
			<br>●通过内奸的努力，会逐渐减少其身份暴露度，但如果他跳反时救人或直接伤害主忠，将其身份直接暴露，如果救主忠，大幅减少其身份暴露度；
			<br>●内奸跳忠/反时会优先打反/忠，需要弃牌时会盲身份不明朗的角色，并尽量规避对主以及忠/反使用伤害牌，自己和主公比较健康时也会救忠/反；
			<br>●内奸打酱油时，只关心自己和主公，非必要不用牌，需要弃牌时使用伤害牌但也不酒杀，对忠反的生死漠不关心
		</span>
		<br><br><br>
		<center><font color=fire>其他</font></center>
		<br><span style="font-family: shousha">
			●人机拥有多张同名牌时鼓励人机使用点数较小的牌，弃牌时鼓励保留点数较大的牌，但由于是微调数值收效甚微；
			<br>●防酒杀ai，人机将透视对面手里有没有【酒】，不喜欢请关闭［全局AI优化］；
			<br>●鼓励拥有reverseEquip标签的角色刷装备，大幅降低已被废除的装备栏对应副类别的牌的价值
		</span>
		<br><hr><br>无名杀QQ频道：<br><img style=width:240px src=${lib.assetURL}extension/AI优化/img/promotion/qq.jpg>
		<br><br>DoDo无名杀超级群：<br><img style=width:240px src=${lib.assetURL}extension/AI优化/img/promotion/dodo.jpg>
		<br><br>无名杀本体更新内测群：392157644
		<br><br>扩展功能调整意见征集：<br><img style=width:240px src=${lib.assetURL}extension/AI优化/img/promotion/word.png>
	`,
};
