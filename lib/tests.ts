/* 试金石：站内小测试的题库与解读。全部静态，无后端。 */

/* ============ MBTI（三档：速测 16 / 标准 32 / 深测 48） ============ */
/* 题库共 48 题，每维度 12 题；按档位每维度随机抽取，出题时按维度交错排列 */

export interface MbtiOption {
  text: string
  dim: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
}

export interface MbtiQuestion {
  q: string
  a: MbtiOption
  b: MbtiOption
}

export const MBTI_BANK: MbtiQuestion[] = [
  /* —— E / I —— */
  { q: '精力满格的一天结束，你回头看', a: { text: '大部分时间在和人来往', dim: 'E' }, b: { text: '大部分时间是自己的', dim: 'I' } },
  { q: '手机响了，是半熟的人约你出门', a: { text: '大多答应', dim: 'E' }, b: { text: '大多找理由推掉', dim: 'I' } },
  { q: '你更喜欢的学习方式', a: { text: '和人讨论着学', dim: 'E' }, b: { text: '自己啃', dim: 'I' } },
  { q: '小组作业里，你常是', a: { text: '那个串场协调的', dim: 'E' }, b: { text: '那个埋头干的', dim: 'I' } },
  { q: '长途车上你一般', a: { text: '跟邻座聊起来', dim: 'E' }, b: { text: '戴耳机看窗外', dim: 'I' } },
  { q: '心里的主意，你通常', a: { text: '说出来，边说边完善', dim: 'E' }, b: { text: '想清楚了再说', dim: 'I' } },
  { q: '连续社交两小时后，你感觉', a: { text: '还行，甚至更精神', dim: 'E' }, b: { text: '电量见底', dim: 'I' } },
  { q: '遇到有意思的事，你的第一动作', a: { text: '告诉别人', dim: 'E' }, b: { text: '自己先品', dim: 'I' } },
  { q: '你理想的工作状态', a: { text: '团队热热闹闹', dim: 'E' }, b: { text: '独立专注、少打扰', dim: 'I' } },
  { q: '周末两天空了，你会', a: { text: '约人把日程填满', dim: 'E' }, b: { text: '留白比日程舒服', dim: 'I' } },
  { q: '陌生人搭话，你', a: { text: '接得住，聊得起来', dim: 'E' }, b: { text: '礼貌，但想早点结束', dim: 'I' } },
  { q: '你的社交能量更像是', a: { text: '越用越多的可再生能源', dim: 'E' }, b: { text: '用一点少一点的存电', dim: 'I' } },
  { q: '别人记你的方式，更像', a: { text: '总在场的那个人', dim: 'E' }, b: { text: '偶尔出现的惊喜', dim: 'I' } },
  { q: '团建活动的你', a: { text: '组织者本人', dim: 'E' }, b: { text: '参与者里的观察者', dim: 'I' } },
  { q: '电话和文字，你偏好', a: { text: '电话，说不清就打', dim: 'E' }, b: { text: '能打字绝不打电话', dim: 'I' } },
  { q: '你的秘密', a: { text: '藏不住三天', dim: 'E' }, b: { text: '能带很久', dim: 'I' } },
  { q: '排队太无聊，你会', a: { text: '和旁边人搭话', dim: 'E' }, b: { text: '玩手机', dim: 'I' } },
  { q: '你理解的「充电」', a: { text: '出去热闹一场', dim: 'E' }, b: { text: '关机一晚', dim: 'I' } },
  { q: '小组讨论，你的发言', a: { text: '第一个开麦', dim: 'E' }, b: { text: '想好了再举手', dim: 'I' } },
  { q: '朋友婚礼上的你', a: { text: '认识了半个场', dim: 'E' }, b: { text: '只和熟桌聊', dim: 'I' } },
  { q: '你的情绪更常', a: { text: '写脸上', dim: 'E' }, b: { text: '收在心里', dim: 'I' } },
  { q: '合租你更看重室友', a: { text: '爱聊天、有人气', dim: 'E' }, b: { text: '界限感强', dim: 'I' } },
  { q: '网购有疑问，你', a: { text: '直接打电话', dim: 'E' }, b: { text: '打字问', dim: 'I' } },
  { q: '你更擅长', a: { text: '临场发挥', dim: 'E' }, b: { text: '事先准备', dim: 'I' } },
  { q: '聚会照片里的你', a: { text: '总在人群中间', dim: 'E' }, b: { text: '常在边上或镜头后', dim: 'I' } },
  { q: '别人向你倾诉时，你的话', a: { text: '多，带头聊', dim: 'E' }, b: { text: '少，多听', dim: 'I' } },
  { q: '电梯里遇到同事', a: { text: '主动开话题', dim: 'E' }, b: { text: '点头微笑看楼层数', dim: 'I' } },
  { q: '你的灵感更多来自', a: { text: '和人碰撞', dim: 'E' }, b: { text: '独处时冒出来', dim: 'I' } },
  { q: '一场演出结束，你会', a: { text: '和同好讨论到深夜', dim: 'E' }, b: { text: '自己回味', dim: 'I' } },
  { q: '买大件之前，你', a: { text: '拉人参谋', dim: 'E' }, b: { text: '自己研究下单', dim: 'I' } },
  { q: '新环境的第一天', a: { text: '已经认识三个人', dim: 'E' }, b: { text: '记住了环境，没记人', dim: 'I' } },
  { q: '热闹对你来说是', a: { text: '能量', dim: 'E' }, b: { text: '噪音', dim: 'I' } },
  { q: '群消息 99+，你', a: { text: '爬楼看完', dim: 'E' }, b: { text: '不看，@我再说', dim: 'I' } },
  { q: '你的咖啡时间', a: { text: '和朋友坐着喝', dim: 'E' }, b: { text: '带走，自己喝', dim: 'I' } },
  { q: '桌游或剧本杀', a: { text: '你爱组局', dim: 'E' }, b: { text: '被拉去也开心，但不组', dim: 'I' } },
  { q: '采纳意见时，你更信', a: { text: '大家讨论出来的', dim: 'E' }, b: { text: '自己深夜想的', dim: 'I' } },
  { q: '你的休息日社交量', a: { text: '天天有人约', dim: 'E' }, b: { text: '一周一次刚刚好', dim: 'I' } },
  { q: '上台发言', a: { text: '人越多越来劲', dim: 'E' }, b: { text: '想死，但能完成', dim: 'I' } },
  { q: '你的口头禅更像', a: { text: '「跟你说！」', dim: 'E' }, b: { text: '「算了」', dim: 'I' } },
  { q: '表白或道歉这种事，你会', a: { text: '当面说', dim: 'E' }, b: { text: '打字说', dim: 'I' } },
  { q: '旅途中的同伴', a: { text: '一路有话才好', dim: 'E' }, b: { text: '沉默也不尴尬才好', dim: 'I' } },
  { q: '作业或工作，你习惯', a: { text: '找人一起做', dim: 'E' }, b: { text: '自己做完再给人看', dim: 'I' } },
  { q: '成就感需要', a: { text: '有人见证', dim: 'E' }, b: { text: '自己知道就行', dim: 'I' } },
  { q: '你对「孤独」', a: { text: '怕', dim: 'E' }, b: { text: '有时是享受', dim: 'I' } },
  { q: '困难来的时候，你的第一反应', a: { text: '找人', dim: 'E' }, b: { text: '自己扛', dim: 'I' } },
  { q: '聊天聊死了，责任在你吗', a: { text: '不在，我能续上', dim: 'E' }, b: { text: '在，也不介意', dim: 'I' } },
  { q: '你的朋友圈可见范围', a: { text: '全部可见', dim: 'E' }, b: { text: '三天可见', dim: 'I' } },
  { q: '到了陌生城市，你的第一动作', a: { text: '找人聊', dim: 'E' }, b: { text: '自己走', dim: 'I' } },
  { q: '深夜写好的朋友圈', a: { text: '发出去', dim: 'E' }, b: { text: '存草稿', dim: 'I' } },
  { q: '电梯广告 你会看吗', a: { text: '会，什么都看两眼', dim: 'E' }, b: { text: '不会，那是我的放空时间', dim: 'I' } },

  /* —— S / N —— */
  { q: '看到一幅抽象画，你先', a: { text: '想它画的到底是什么', dim: 'S' }, b: { text: '想它让你想到了什么', dim: 'N' } },
  { q: '计划下周的事，你', a: { text: '列具体的清单', dim: 'S' }, b: { text: '先定个大方向', dim: 'N' } },
  { q: '朋友讲他的新点子，你先问', a: { text: '打算怎么落地', dim: 'S' }, b: { text: '然后呢？还有呢？', dim: 'N' } },
  { q: '你写东西更倾向', a: { text: '把事情说清楚', dim: 'S' }, b: { text: '把感觉写出来', dim: 'N' } },
  { q: '记路的方式', a: { text: '记地标和路口', dim: 'S' }, b: { text: '记大概方向和感觉', dim: 'N' } },
  { q: '你觉得更值得花时间', a: { text: '把一件事做精', dim: 'S' }, b: { text: '同时开几件新鲜事', dim: 'N' } },
  { q: '看到一条规则，你先想', a: { text: '它怎么执行', dim: 'S' }, b: { text: '它为什么存在', dim: 'N' } },
  { q: '描述昨晚的梦', a: { text: '按顺序讲清楚', dim: 'S' }, b: { text: '讲印象最深的那团感觉', dim: 'N' } },
  { q: '你更欣赏的人', a: { text: '把平凡事做到极致', dim: 'S' }, b: { text: '总能看到别人看不到的', dim: 'N' } },
  { q: '学一个新工具', a: { text: '先把基础功能摸熟', dim: 'S' }, b: { text: '直接乱点，边玩边懂', dim: 'N' } },
  { q: '日常聊天里你更常接', a: { text: '「对，昨天我也……」的实况', dim: 'S' }, b: { text: '「你有没有想过……」的脑洞', dim: 'N' } },
  { q: '别人形容你，更像', a: { text: '稳', dim: 'S' }, b: { text: '飘', dim: 'N' } },
  { q: '看到一朵形状奇怪的云', a: { text: '像棉花糖', dim: 'S' }, b: { text: '像一场没说出口的告别', dim: 'N' } },
  { q: '你的日记偏', a: { text: '今天发生了什么', dim: 'S' }, b: { text: '今天想到了什么', dim: 'N' } },
  { q: '照着菜谱做饭', a: { text: '克数精确', dim: 'S' }, b: { text: '差不多就行，凭手感', dim: 'N' } },
  { q: '你对「传统」', a: { text: '该守的守', dim: 'S' }, b: { text: '有意思就留，没意思就破', dim: 'N' } },
  { q: '学一门新技能，你先', a: { text: '把基础打牢', dim: 'S' }, b: { text: '先弹会一首再回头补', dim: 'N' } },
  { q: '算账的时候', a: { text: '精确到分', dim: 'S' }, b: { text: '估个大概', dim: 'N' } },
  { q: '你更容易记住一个人的', a: { text: '具体的话', dim: 'S' }, b: { text: '整体的氛围', dim: 'N' } },
  { q: '选电影你看', a: { text: '评分和类型', dim: 'S' }, b: { text: '海报和一句台词', dim: 'N' } },
  { q: '你的白日梦内容', a: { text: '现实的升级版', dim: 'S' }, b: { text: '完全另一个世界', dim: 'N' } },
  { q: '朋友说你讲道理时', a: { text: '例子特别多', dim: 'S' }, b: { text: '联想特别多', dim: 'N' } },
  { q: '你对未来的感觉', a: { text: '一张路线图', dim: 'S' }, b: { text: '一团雾里透着光', dim: 'N' } },
  { q: '收到礼物，你先注意', a: { text: '是什么', dim: 'S' }, b: { text: 'TA为什么选这个', dim: 'N' } },
  { q: '你偏好的规则', a: { text: '清晰明确', dim: 'S' }, b: { text: '有弹性空间', dim: 'N' } },
  { q: '修东西的时候', a: { text: '先找说明书', dim: 'S' }, b: { text: '直接拆开摸索', dim: 'N' } },
  { q: '你的玩笑更偏', a: { text: '现实梗', dim: 'S' }, b: { text: '荒诞梗', dim: 'N' } },
  { q: '你的计划完成度', a: { text: '九成以上', dim: 'S' }, b: { text: '一半，但总有计划外收获', dim: 'N' } },
  { q: '你的口头高频词', a: { text: '「实际上」', dim: 'S' }, b: { text: '「可能」「说不定」', dim: 'N' } },
  { q: '读非虚构的书，你会', a: { text: '划重点记结论', dim: 'S' }, b: { text: '记住击中你的某一句', dim: 'N' } },
  { q: '你的直觉', a: { text: '一般，我靠分析', dim: 'S' }, b: { text: '常常很准', dim: 'N' } },
  { q: '布置房间先想', a: { text: '实用动线', dim: 'S' }, b: { text: '氛围和主题', dim: 'N' } },
  { q: '面对新鲜事物', a: { text: '等它稳定了再上', dim: 'S' }, b: { text: '第一波就试', dim: 'N' } },
  { q: '描述一次旅行', a: { text: '时间线和地点', dim: 'S' }, b: { text: '某个瞬间的感觉', dim: 'N' } },
  { q: '面对一大堆信息，你', a: { text: '分类整理', dim: 'S' }, b: { text: '找那根主线', dim: 'N' } },
  { q: '你更受不了的缺点', a: { text: '粗心', dim: 'S' }, b: { text: '缺乏想象力', dim: 'N' } },
  { q: '你的笔记', a: { text: '工整有条理', dim: 'S' }, b: { text: '乱，但有箭头和圈', dim: 'N' } },
  { q: '别人问「后来呢」，你会', a: { text: '接着讲事实', dim: 'S' }, b: { text: '开始讲可能性', dim: 'N' } },
  { q: '你认路靠', a: { text: '「跟着走就对了」的肌肉记忆', dim: 'S' }, b: { text: '「大概那个方向」的方位感', dim: 'N' } },
  { q: '聊天里你更爱聊', a: { text: '最近发生的事', dim: 'S' }, b: { text: '还没发生的事', dim: 'N' } },
  { q: '你给别人的建议更常是', a: { text: '具体步骤', dim: 'S' }, b: { text: '一个新的视角', dim: 'N' } },
  { q: '你欣赏的方案', a: { text: '踩在实地上的', dim: 'S' }, b: { text: '超前半步的', dim: 'N' } },
  { q: '回忆童年，你先想起', a: { text: '具体的某一天', dim: 'S' }, b: { text: '某种说不清的味道', dim: 'N' } },
  { q: '你的整理癖体现在', a: { text: '物品归位', dim: 'S' }, b: { text: '想法归档', dim: 'N' } },
  { q: '看到数据图表，你', a: { text: '先核对来源和口径', dim: 'S' }, b: { text: '先看趋势讲什么故事', dim: 'N' } },
  { q: '你写作卡壳时', a: { text: '找更多资料', dim: 'S' }, b: { text: '先写下不靠谱的草稿', dim: 'N' } },
  { q: '你对「仪式感」', a: { text: '具体动作才算数', dim: 'S' }, b: { text: '心里有就是有', dim: 'N' } },
  { q: '选礼物你倾向', a: { text: '实用且耐用', dim: 'S' }, b: { text: '特别且有意义', dim: 'N' } },
  { q: '你更愿意被叫', a: { text: '实干家', dim: 'S' }, b: { text: '梦想家', dim: 'N' } },
  { q: '一句话概括你的世界观', a: { text: '世界是具体的', dim: 'S' }, b: { text: '世界是隐喻的', dim: 'N' } },

  /* —— T / F —— */
  { q: '朋友的决定很糟糕，你会', a: { text: '直接说', dim: 'T' }, b: { text: '先肯定，再绕着提', dim: 'F' } },
  { q: '看电影看哭过吗', a: { text: '基本没有', dim: 'T' }, b: { text: '经常', dim: 'F' } },
  { q: '一段关系结束后，你先想', a: { text: '问题出在哪', dim: 'T' }, b: { text: '他现在还好吗', dim: 'F' } },
  { q: '你更受不了的队友', a: { text: '逻辑不通的', dim: 'T' }, b: { text: '情绪失控的', dim: 'F' } },
  { q: '表扬别人时，你更常说', a: { text: '你做得又快又对', dim: 'T' }, b: { text: '你真的不容易', dim: 'F' } },
  { q: '争论赢了，你的感觉', a: { text: '爽，道理就该辩清楚', dim: 'T' }, b: { text: '赢了也有点膈应', dim: 'F' } },
  { q: '帮人做选择，你会给', a: { text: '一份利弊清单', dim: 'T' }, b: { text: '「你心里其实有答案了」', dim: 'F' } },
  { q: '判断一个决定好不好，你先看', a: { text: '结果对不对', dim: 'T' }, b: { text: '动机善不善', dim: 'F' } },
  { q: '对「共情」你的态度', a: { text: '理解，但做不到感同身受', dim: 'T' }, b: { text: '别人难受，我也跟着难受', dim: 'F' } },
  { q: '你说话更追求', a: { text: '准确', dim: 'T' }, b: { text: '让人舒服', dim: 'F' } },
  { q: '搞砸了一件事，你先想', a: { text: '技术上哪里错了', dim: 'T' }, b: { text: '会不会辜负了谁', dim: 'F' } },
  { q: '你的温柔更像是', a: { text: '讲道理式的帮助', dim: 'T' }, b: { text: '无条件的接住', dim: 'F' } },
  { q: '你的道歉方式', a: { text: '说清楚错在哪', dim: 'T' }, b: { text: '先抱一个再说', dim: 'F' } },
  { q: '别人的成果一般但很努力，你的评价', a: { text: '还是差意思', dim: 'T' }, b: { text: '先肯定那份努力', dim: 'F' } },
  { q: '做决定的依据排第一', a: { text: '对错', dim: 'T' }, b: { text: '感受', dim: 'F' } },
  { q: '看到流浪猫', a: { text: '先想谁负责喂养', dim: 'T' }, b: { text: '人已经蹲下了', dim: 'F' } },
  { q: '你的安慰话术', a: { text: '「下次这样做」', dim: 'T' }, b: { text: '「没事，有我」', dim: 'F' } },
  { q: '拒绝别人的时候', a: { text: '直说不行', dim: 'T' }, b: { text: '措辞想到累', dim: 'F' } },
  { q: '更容易说服你的是', a: { text: '数据', dim: 'T' }, b: { text: '故事', dim: 'F' } },
  { q: '玩游戏你更在意', a: { text: '赢', dim: 'T' }, b: { text: '大家都开心', dim: 'F' } },
  { q: '给同学的笔记', a: { text: '精确到页码', dim: 'T' }, b: { text: '夹了很多鼓励注', dim: 'F' } },
  { q: '你认可的批评', a: { text: '对事也对人，都说到', dim: 'T' }, b: { text: '对事不对人是底线', dim: 'F' } },
  { q: '看辩论赛你站', a: { text: '逻辑更强的一方', dim: 'T' }, b: { text: '更动人的那方', dim: 'F' } },
  { q: '你的幽默更偏', a: { text: '讽刺和机智', dim: 'T' }, b: { text: '温和与自嘲', dim: 'F' } },
  { q: '朋友向你炫耀，你', a: { text: '挑毛病逗他', dim: 'T' }, b: { text: '真诚地夸', dim: 'F' } },
  { q: '你对「规矩」', a: { text: '规矩就是规矩', dim: 'T' }, b: { text: '规矩之外还有人情', dim: 'F' } },
  { q: '面试时你更想展现', a: { text: '能力', dim: 'T' }, b: { text: '热情与真诚', dim: 'F' } },
  { q: '记住别人的生日', a: { text: '这对我来说很难', dim: 'T' }, b: { text: '重要的事，我记着', dim: 'F' } },
  { q: '做了对不起人的事，你先', a: { text: '补救', dim: 'T' }, b: { text: '道歉', dim: 'F' } },
  { q: '你相信爱是', a: { text: '互相成就', dim: 'T' }, b: { text: '近乎无条件的', dim: 'F' } },
  { q: '你的头像或签名更可能', a: { text: '一句冷静的话', dim: 'T' }, b: { text: '一句柔软的话', dim: 'F' } },
  { q: '你认输的时刻', a: { text: '对方逻辑赢了你', dim: 'T' }, b: { text: '对方委屈的表情', dim: 'F' } },
  { q: '你的建议更常被说', a: { text: '一针见血', dim: 'T' }, b: { text: '暖', dim: 'F' } },
  { q: '看到感人事迹，你', a: { text: '先想真实性', dim: 'T' }, b: { text: '先哭再说', dim: 'F' } },
  { q: '别人说你「冷血」，你', a: { text: '无所谓，我对事不对人', dim: 'T' }, b: { text: '会介意很久', dim: 'F' } },
  { q: '分享好消息，你先说', a: { text: '事实重点', dim: 'T' }, b: { text: '对方听了会怎样', dim: 'F' } },
  { q: '你的泪点', a: { text: '几乎不存在', dim: 'T' }, b: { text: '遍布全身', dim: 'F' } },
  { q: '「讲原则」和「讲感情」冲突时', a: { text: '原则', dim: 'T' }, b: { text: '感情', dim: 'F' } },
  { q: '你给建议的风格', a: { text: '列表加优先级', dim: 'T' }, b: { text: '倾听加抱抱', dim: 'F' } },
  { q: '对于「多愁善感」', a: { text: '浪费时间', dim: 'T' }, b: { text: '人之常情', dim: 'F' } },
  { q: '别人犯错，你的第一句', a: { text: '「为什么会这样」', dim: 'T' }, b: { text: '「你还好吗」', dim: 'F' } },
  { q: '你的购物决定', a: { text: '参数和性价比', dim: 'T' }, b: { text: '喜欢和眼缘', dim: 'F' } },
  { q: '有人在你面前哭，你', a: { text: '递纸巾并开始分析', dim: 'T' }, b: { text: '陪着，啥也不问', dim: 'F' } },
  { q: '你认为世界运转靠', a: { text: '规则和效率', dim: 'T' }, b: { text: '情感和连接', dim: 'F' } },
  { q: '你的回复消息风格', a: { text: '简短准确', dim: 'T' }, b: { text: '带语气带表情', dim: 'F' } },
  { q: '「对事不对人」你做到', a: { text: '完全没问题', dim: 'T' }, b: { text: '做不到，人就是事', dim: 'F' } },
  { q: '你的告别方式', a: { text: '简洁干脆', dim: 'T' }, b: { text: '依依不舍拉长线', dim: 'F' } },
  { q: '你更难接受的批评角度', a: { text: '「你想得不周全」', dim: 'T' }, b: { text: '「你不在乎别人」', dim: 'F' } },
  { q: '评价一部作品，你先说', a: { text: '完成度和水准', dim: 'T' }, b: { text: '它带给你的触动', dim: 'F' } },
  { q: '你的「讲道理」', a: { text: '是为了解决问题', dim: 'T' }, b: { text: '是为了让TA好受点', dim: 'F' } },

  /* —— J / P —— */
  { q: '出门前的你', a: { text: '提前收拾好了', dim: 'J' }, b: { text: '出发前五分钟在找钥匙', dim: 'P' } },
  { q: '你的假期计划', a: { text: '有日程表', dim: 'J' }, b: { text: '有选项，没顺序', dim: 'P' } },
  { q: '去超市之前', a: { text: '有清单，还带预算', dim: 'J' }, b: { text: '到了再说', dim: 'P' } },
  { q: '日程被打乱（哪怕变得更好），你', a: { text: '不太舒服', dim: 'J' }, b: { text: '无所谓，新安排也行', dim: 'P' } },
  { q: '你的收藏夹或笔记', a: { text: '分类清清楚楚', dim: 'J' }, b: { text: '一团，但都能找到', dim: 'P' } },
  { q: '朋友评价你，更常说', a: { text: '靠谱', dim: 'J' }, b: { text: '随性', dim: 'P' } },
  { q: '任务刚下达，你', a: { text: '拆步骤、排时间', dim: 'J' }, b: { text: '先拖着，状态来了再做', dim: 'P' } },
  { q: '吃饭选择困难时', a: { text: '点常吃的那几家', dim: 'J' }, b: { text: '每次都想换新的', dim: 'P' } },
  { q: '你对「备用方案」', a: { text: '出发前就备好', dim: 'J' }, b: { text: '出了事再说', dim: 'P' } },
  { q: '整理房间这件事', a: { text: '定期整理', dim: 'J' }, b: { text: '攒到受不了再大扫除', dim: 'P' } },
  { q: '你更享受', a: { text: '按计划完成的踏实感', dim: 'J' }, b: { text: '临时起意的惊喜感', dim: 'P' } },
  { q: '桌上有项小任务', a: { text: '现在顺手做掉', dim: 'J' }, b: { text: '明天再说', dim: 'P' } },
  { q: '你的充电线', a: { text: '多备一根，固定位置', dim: 'J' }, b: { text: '哪都有哪都没有', dim: 'P' } },
  { q: '旅行前的攻略', a: { text: '做满一张表', dim: 'J' }, b: { text: '收藏几个视频', dim: 'P' } },
  { q: '你的「稍后处理」', a: { text: '真的会处理', dim: 'J' }, b: { text: '等于「永不」', dim: 'P' } },
  { q: '考试周的复习', a: { text: '有 timetable', dim: 'J' }, b: { text: '前一晚奇迹', dim: 'P' } },
  { q: '你的文件命名', a: { text: '规范带日期', dim: 'J' }, b: { text: '「新建文件夹(2)」', dim: 'P' } },
  { q: '约人出门，你更常', a: { text: '提前几天定', dim: 'J' }, b: { text: '当天问「在吗」', dim: 'P' } },
  { q: '你的闹钟', a: { text: '一个，到点就起', dim: 'J' }, b: { text: '八个，隔五分钟', dim: 'P' } },
  { q: '你的计划完成率', a: { text: '高', dim: 'J' }, b: { text: '看心情', dim: 'P' } },
  { q: '你的网购习惯', a: { text: '购物车放着等大促', dim: 'J' }, b: { text: '想到就买', dim: 'P' } },
  { q: '「最后一刻」对你是', a: { text: '很少用到', dim: 'J' }, b: { text: '常驻嘉宾', dim: 'P' } },
  { q: '朋友迟到二十分钟，你', a: { text: '已把等待排满了事', dim: 'J' }, b: { text: '刚好刷完一条视频', dim: 'P' } },
  { q: '行程有变，你通知人的时间', a: { text: '提前三天', dim: 'J' }, b: { text: '出门前一小时', dim: 'P' } },
  { q: '你做过最计划外的事', a: { text: '很少', dim: 'J' }, b: { text: '数不清', dim: 'P' } },
  { q: '你的日历 App', a: { text: '日程排满颜色分明', dim: 'J' }, b: { text: '空的，或卸载了', dim: 'P' } },
  { q: '半成品的东西', a: { text: '不做完睡不着', dim: 'J' }, b: { text: '摆着，下次一定', dim: 'P' } },
  { q: '你的「整理」频率', a: { text: '每周固定', dim: 'J' }, b: { text: '灵魂波动触发', dim: 'P' } },
  { q: '团队里你负责', a: { text: '排期和进度', dim: 'J' }, b: { text: '救场和惊喜', dim: 'P' } },
  { q: '你的收藏是为了', a: { text: '系统学习', dim: 'J' }, b: { text: '将来某一刻的冲动', dim: 'P' } },
  { q: '决定了的事，你会改吗', a: { text: '基本不改', dim: 'J' }, b: { text: '随时改', dim: 'P' } },
  { q: '你的冰箱', a: { text: '分类分装', dim: 'J' }, b: { text: '饮料占半壁江山', dim: 'P' } },
  { q: '「到时候再说」', a: { text: '你很少说出口', dim: 'J' }, b: { text: '你的口头禅', dim: 'P' } },
  { q: '账单和还款', a: { text: '提前还清', dim: 'J' }, b: { text: '卡最后一天', dim: 'P' } },
  { q: '你的书桌状态反映的是', a: { text: '本周计划', dim: 'J' }, b: { text: '上上周的混乱', dim: 'P' } },
  { q: '突然而有趣的邀约', a: { text: '先看安排再定', dim: 'J' }, b: { text: '马上答应', dim: 'P' } },
  { q: '你的下一个计划', a: { text: '已经在日程表上', dim: 'J' }, b: { text: '还在灵感里', dim: 'P' } },
  { q: '对「惊喜」，你', a: { text: '提前发现了也不说破', dim: 'J' }, b: { text: '最爱这个', dim: 'P' } },
  { q: '打包行李', a: { text: '清单打勾', dim: 'J' }, b: { text: '抓一把再说', dim: 'P' } },
  { q: '你的「稳定」', a: { text: '来自结构', dim: 'J' }, b: { text: '来自灵活', dim: 'P' } },
  { q: '群里的投票', a: { text: '第一时间定死', dim: 'J' }, b: { text: '弃权或摇摆', dim: 'P' } },
  { q: '你对「变化」', a: { text: '可控的变化才叫机会', dim: 'J' }, b: { text: '变化本身就很迷人', dim: 'P' } },
  { q: '你的待办清单', a: { text: '真的存在', dim: 'J' }, b: { text: '存在脑子里的一角', dim: 'P' } },
  { q: '雨天没带伞', a: { text: '怪自己没看预报', dim: 'J' }, b: { text: '淋雨也有淋雨的玩法', dim: 'P' } },
  { q: '你的「准备」', a: { text: '充分到别人以为你保守', dim: 'J' }, b: { text: '完全靠临场', dim: 'P' } },
  { q: '计划里的空白时间', a: { text: '也排好了用途', dim: 'J' }, b: { text: '空白就是用来浪费的', dim: 'P' } },
  { q: '别人眼中的你做事', a: { text: '有板有眼', dim: 'J' }, b: { text: '随缘但神奇地成了', dim: 'P' } },
  { q: '截止日期前一周', a: { text: '已经交了', dim: 'J' }, b: { text: '刚打开文档', dim: 'P' } },
  { q: ' 「随机应变」是你的', a: { text: '被动技能', dim: 'J' }, b: { text: '主修课程', dim: 'P' } },
]

/* 四档：count = 每个维度抽几题（4×4=16 / 8×4=32 / 12×4=48 / 50×4=200） */
export const MBTI_TIERS = [
  { id: 'quick', label: '速测', count: 4, tag: '16 题 · 约 2 分钟' },
  { id: 'std', label: '标准', count: 8, tag: '32 题 · 约 5 分钟' },
  { id: 'full', label: '深测', count: 12, tag: '48 题 · 约 8 分钟' },
  { id: 'deep', label: '深挖', count: 50, tag: '200 题 · 约 30 分钟' },
] as const

export type MbtiTier = (typeof MBTI_TIERS)[number]['id']

/* 按档位组一套题：每维度随机抽 count 题，再按维度交错排列（相邻题不同维度） */
export function buildMbtiSet(tier: MbtiTier, rand: () => number = Math.random): MbtiQuestion[] {
  const perDim = MBTI_TIERS.find((t) => t.id === tier)!.count
  const byDim: Record<string, MbtiQuestion[]> = { E: [], I: [], S: [], N: [], T: [], F: [], J: [], P: [] }
  const pool: Record<string, MbtiQuestion[]> = { E: [], I: [], S: [], N: [], T: [], F: [], J: [], P: [] }
  for (const q of MBTI_BANK) {
    pool[q.a.dim].push(q)
  }
  for (const dim of Object.keys(pool)) {
    const arr = [...pool[dim]]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    byDim[dim] = arr.slice(0, perDim)
  }
  /* 交错：E I S N T F J P 轮转，每轮各取一题 */
  const order = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']
  const out: MbtiQuestion[] = []
  for (let round = 0; round < perDim; round++) {
    for (const dim of order) {
      const q = byDim[dim][round]
      if (q) out.push(q)
    }
  }
  return out
}

export interface MbtiMeta {
  code: string
  name: string
  fire: string
  tags: string[]
  text: string
  ember: string
}

/* 十六型分析：火系意象 + 特质标签 + 分析段 + 一句烬语 */
export const MBTI_TYPES: Record<string, MbtiMeta> = {
  INTJ: {
    code: 'INTJ',
    name: '炉心',
    fire: '炉火',
    tags: ['长线思考', '自成体系', '少说多做'],
    text: '火压在最里面，烧得最久。你的计划往往比别人的行动还长——别人看见你安静，看不见你脑子里那座已经搭好的塔。你不缺想法，缺的是把想法讲给别人听的耐心；而一旦有人真听懂了，会发现你的每一步都早就想好了。',
    ember: '慢一点没关系，炉子从不怕冷。',
  },
  INTP: {
    code: 'INTP',
    name: '星火',
    fire: '星火',
    tags: ['好奇过载', '逻辑洁癖', '开局狂魔'],
    text: '想法一串一串地冒，熄了一颗还有一颗。你的世界里「为什么」比「怎么办」重要，所以常常懂了一百件事，做完了一件。这不是散，是燃料太多而炉膛只有一个——挑一颗烧到头，比你再点十颗都有用。',
    ember: '别急着全点着，先挑一颗烧到头。',
  },
  ENTJ: {
    code: 'ENTJ',
    name: '燎原',
    fire: '篝火',
    tags: ['天生的指挥', '目标即燃料', '直言不讳'],
    text: '火借风势，天生要烧成一片。别人看到乱局想的是麻烦，你想到的是「正好需要个人来理」——而那个人通常是你。你的直言偶尔烫人，但跟着你走的人心里都清楚：你是真的会把事情办成。',
    ember: '带人走路的时候，留一点暖给掉队的人。',
  },
  ENTP: {
    code: 'ENTP',
    name: '爆竹',
    fire: '星火',
    tags: ['点子永动机', '反骨', '临场怪物'],
    text: '一颗接一颗地炸，谁都拦不住。规则在你眼里是默认设置，不是法律；辩论是你的呼吸方式。你的坑只有一个：起头太容易，收尾太无聊——学会给每个开局配一个结局，你就是全场最亮。',
    ember: '起头靠天赋，收尾靠决定。',
  },
  INFJ: {
    code: 'INFJ',
    name: '灯芯',
    fire: '烛火',
    tags: ['读人如读书', '理想主义', '安静的主见'],
    text: '安静地亮着，照的却是别人的路。你总能在人开口之前感觉到TA今天不对——这种能力是天赋也是负担，因为你接住了太多别人的情绪，自己那部分反而排到最后。你需要的不是变开朗，是一个能放心暗下来的角落。',
    ember: '别忘了，灯芯自己也会怕黑。',
  },
  INFP: {
    code: 'INFP',
    name: '烛泪',
    fire: '烛火',
    tags: ['内心宇宙', '价值至上', '柔软且执拗'],
    text: '最软的火，最重的情。你的心里有一整套关于世界应该怎样的图纸，所以现实常常让你失望——但正是这套图纸，让你写出的字、做出的选择，带着别人没有的温度。敏感是燃料，不是病。',
    ember: '写下来，它就成了光。',
  },
  ENFJ: {
    code: 'ENFJ',
    name: '篝火',
    fire: '篝火',
    tags: ['人群磁石', '共情发动机', '过度负责'],
    text: '天生把人聚过来取暖。你能记住每个人的小细节，也习惯把每个人的情绪背在自己身上——聚在火边的人觉得暖，只有你知道柴是自己一根一根添的。学会说「今天我也累了」，是你的必修课。',
    ember: '屋里越热闹，越要给自己烤烤手。',
  },
  ENFP: {
    code: 'ENFP',
    name: '焰火',
    fire: '星火',
    tags: ['热情永动机', '意义搜寻者', '讨厌被框住'],
    text: '你在哪，哪就有颜色。你对世界的好奇是真的，对人的善意也是真的——唯一的问题是想做的事太多，而一天只有二十四小时。落地不丢人：焰火也有落点，那是下一发的起点。',
    ember: '落地不是熄灭，是装填。',
  },
  ISTJ: {
    code: 'ISTJ',
    name: '炭盆',
    fire: '炉火',
    tags: ['说到做到', '细节的忠诚', '沉默的可靠'],
    text: '不声不响，一整夜都温着。你不喜欢许大愿，但答应的事从来不落空——这种品质在故事里不讨喜，在生活里是稀罕物。世界喧闹的时候，总得有人守着火不让它灭。',
    ember: '稳定听起来平淡，其实是很多人求不来的超能力。',
  },
  ISFJ: {
    code: 'ISFJ',
    name: '暖炉',
    fire: '炉火',
    tags: ['照顾者', '记忆超群', '不懂拒绝'],
    text: '把暖全给了屋里的人。你记得谁不吃香菜、谁上次难过、谁随口提过想要什么——被你照顾是一种幸福，而你自己冷的时候常常不说。这一条是替你写的：说一声，有人愿意添柴。',
    ember: '轮到你冷的时候，说一声。',
  },
  ESTJ: {
    code: 'ESTJ',
    name: '灶火',
    fire: '炉火',
    tags: ['执行力', '秩序感', '责任野兽'],
    text: '一家人的饭都从这里熟。你把「应该做的事」一件件做完，不诉苦也不邀功——靠谱两个字好听，但它是日复一日烧出来的。偶尔允许自己不承担，天塌不下来。',
    ember: '偶尔不扛，天塌不下来。',
  },
  ESFJ: {
    code: 'ESFJ',
    name: '灯串',
    fire: '烛火',
    tags: ['氛围守护者', '热心肠', '怕被边缘'],
    text: '把每个角落都点亮一点。你在的关系网是别人眼里「怎么什么人都认识」的奇迹，因为你在真心维护每一条线。你怕冷场、怕被落下——但你值得的，比你给出去的少多了。',
    ember: '你也值得有一盏专门为你亮的灯。',
  },
  ISTP: {
    code: 'ISTP',
    name: '火折子',
    fire: '星火',
    tags: ['手比嘴快', '冷静到冷', '危机克星'],
    text: '平时收着，一抖就着。你话少不是没想法，是觉得「做出来比说出来快」。场面越乱你越冷静，这在关键时刻救过人——虽然没人记得是你救的。你也不在意，但这一条记录一下。',
    ember: '手上的功夫，也是一种表达。',
  },
  ISFP: {
    code: 'ISFP',
    name: '剪影',
    fire: '烛火',
    tags: ['审美动物', '活在当下', '不动声色的固执'],
    text: '不太说话。但你看墙上——烛光把你的作品投得满墙都是。你对「美」有一种近乎固执的坚持，别人以为你随和，其实底线一旦碰到，你比谁都硬。用作品说话，是你的母语。',
    ember: '用作品说话，是你的母语。',
  },
  ESTP: {
    code: 'ESTP',
    name: '打火机',
    fire: '篝火',
    tags: ['行动派', '临场之王', '怕无聊'],
    text: '咔哒一声就来劲。想十次不如试一次是你的信条，而且你的直觉在行动里确实准得吓人。唯一要防的是无聊——无聊会让你把好好的火点成火灾。找个值得烧的目标，你的能量是别人的好几倍。',
    ember: '找个值得烧的目标。',
  },
  ESFP: {
    code: 'ESFP',
    name: '焰火大会',
    fire: '星火',
    tags: ['全场焦点', '真诚到透明', '及时行乐'],
    text: '你在哪，哪就是高潮。你的快乐是真的，对朋友的大方也是真的——散场后的累也是真的，只是你不说。不用一直当气氛担当，真正的朋友不介意看你安安静静的一面。',
    ember: '真正的朋友，不介意你安安静静。',
  },
}

/* ============ 你是哪种火（原创五题，四选一） ============ */

export type FireKind = 'hearth' | 'candle' | 'bonfire' | 'spark'

export interface FireQuestion {
  q: string
  options: Array<{ text: string; kind: FireKind }>
}

export const FIRE_QUESTIONS: FireQuestion[] = [
  {
    q: '一个安静的晚上，你会',
    options: [
      { text: '煮一壶东西，慢慢等', kind: 'hearth' },
      { text: '写点没人看的字', kind: 'candle' },
      { text: '拉人聊个痛快', kind: 'bonfire' },
      { text: '躺到屋顶上看天', kind: 'spark' },
    ],
  },
  {
    q: '你的桌子',
    options: [
      { text: '东西各就各位', kind: 'hearth' },
      { text: '一盏灯，一叠纸', kind: 'candle' },
      { text: '零食饮料，大家的', kind: 'bonfire' },
      { text: '看着乱，但样样有灵', kind: 'spark' },
    ],
  },
  {
    q: '遇到难过的事',
    options: [
      { text: '先把自己安顿好', kind: 'hearth' },
      { text: '把它写下来', kind: 'candle' },
      { text: '找个人说说', kind: 'bonfire' },
      { text: '去很远的地方走一走', kind: 'spark' },
    ],
  },
  {
    q: '你希望被记住的方式',
    options: [
      { text: '一家人的灶，天天都热', kind: 'hearth' },
      { text: '一个人的光，照进心里', kind: 'candle' },
      { text: '一群人的暖，散了还想', kind: 'bonfire' },
      { text: '很远，但很久', kind: 'spark' },
    ],
  },
  {
    q: '冬天来了，你选',
    options: [
      { text: '屋里有火，哪也不去', kind: 'hearth' },
      { text: '窗边读一晚书', kind: 'candle' },
      { text: '组个局，进山里烧一堆大的', kind: 'bonfire' },
      { text: '看雪落，看到天亮', kind: 'spark' },
    ],
  },
]

export const FIRE_RESULTS: Record<FireKind, { name: string; en: string; text: string }> = {
  hearth: { name: '炉火', en: 'HEARTH', text: '稳定、可靠，把日子过成恒温。别人回头找方向的时候，找到的是你。' },
  candle: { name: '烛火', en: 'CANDLE', text: '安静、深，照亮一小块地方就够。你写下的字，常常比你本人先被看见。' },
  bonfire: { name: '篝火', en: 'BONFIRE', text: '热闹、坦荡，天生的局中心。你的暖是分给大家的——记得留一手给自己。' },
  spark: { name: '星火', en: 'SPARK', text: '跳脱、好奇，永远差一步安顿下来。世界因为你的乱窜，才有意思。' },
}

/* 从数组里随机抽 n 个（不重复）——打字机也在用 */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  while (pool.length && out.length < n) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  }
  return out
}

/* ============ 五行问（原创十题，五选一） ============ */

export type WuxingKind = 'metal' | 'wood' | 'water' | 'fire' | 'earth'

export interface WuxingQuestion {
  q: string
  options: Array<{ text: string; kind: WuxingKind }>
}

export const WUXING_QUESTIONS: WuxingQuestion[] = [
  {
    q: '做决定时，你最倚重',
    options: [
      { text: '是非对错', kind: 'metal' },
      { text: '成长的空间', kind: 'wood' },
      { text: '信息和直觉', kind: 'water' },
      { text: '热情与意义', kind: 'fire' },
      { text: '安稳与积累', kind: 'earth' },
    ],
  },
  {
    q: '你的处事风格',
    options: [
      { text: '直接了当，该断就断', kind: 'metal' },
      { text: '灵活变通，随形而长', kind: 'wood' },
      { text: '绕着走，也总能到', kind: 'water' },
      { text: '先冲再说', kind: 'fire' },
      { text: '稳字当头', kind: 'earth' },
    ],
  },
  {
    q: '朋友眼中的你',
    options: [
      { text: '讲原则', kind: 'metal' },
      { text: '有生命力', kind: 'wood' },
      { text: '聪明通透', kind: 'water' },
      { text: '自带温度', kind: 'fire' },
      { text: '踏实可靠', kind: 'earth' },
    ],
  },
  {
    q: '压力之下，你先',
    options: [
      { text: '划清边界', kind: 'metal' },
      { text: '找新的出路', kind: 'wood' },
      { text: '静下来等时机', kind: 'water' },
      { text: '把情绪烧掉', kind: 'fire' },
      { text: '扛住不动', kind: 'earth' },
    ],
  },
  {
    q: '你最看重的品质',
    options: [
      { text: '义——恩怨分明', kind: 'metal' },
      { text: '仁——生生不息', kind: 'wood' },
      { text: '智——通透清明', kind: 'water' },
      { text: '礼——光明磊落', kind: 'fire' },
      { text: '信——厚德载物', kind: 'earth' },
    ],
  },
  {
    q: '你的房间更像',
    options: [
      { text: '利落简练', kind: 'metal' },
      { text: '有植物，有生气', kind: 'wood' },
      { text: '有流动感：窗、灯、音乐', kind: 'water' },
      { text: '热闹明亮', kind: 'fire' },
      { text: '厚实安稳', kind: 'earth' },
    ],
  },
  {
    q: '面对改变，你是',
    options: [
      { text: '该断就断的人', kind: 'metal' },
      { text: '随形而变的藤', kind: 'wood' },
      { text: '顺势而为的水', kind: 'water' },
      { text: '点火的那个人', kind: 'fire' },
      { text: '全场锚点', kind: 'earth' },
    ],
  },
  {
    q: '你表达在乎的方式',
    options: [
      { text: '直言提醒', kind: 'metal' },
      { text: '陪TA成长', kind: 'wood' },
      { text: '默默留意', kind: 'water' },
      { text: '热络直接', kind: 'fire' },
      { text: '实际帮助', kind: 'earth' },
    ],
  },
  {
    q: '深夜的你更接近',
    options: [
      { text: '复盘白天的一切', kind: 'metal' },
      { text: '想要一个新的开始', kind: 'wood' },
      { text: '思绪在流动', kind: 'water' },
      { text: '有点意难平', kind: 'fire' },
      { text: '什么都不想，安稳欲睡', kind: 'earth' },
    ],
  },
  {
    q: '一句你最认的话',
    options: [
      { text: '「恩怨分明」', kind: 'metal' },
      { text: '「野火烧不尽」', kind: 'wood' },
      { text: '「上善若水」', kind: 'water' },
      { text: '「星星之火，可以燎原」', kind: 'fire' },
      { text: '「厚德载物」', kind: 'earth' },
    ],
  },
]

export const WUXING_RESULTS: Record<
  WuxingKind,
  { name: string; gan: string; tags: string[]; text: string; ember: string }
> = {
  metal: {
    name: '金',
    gan: '主义',
    tags: ['义', '决断', '锋利', '秩序'],
    text: '五行之中，金主「义」。你的底色是恩怨分明——该给的从不吝啬，该断的从不拖泥。金是刀，也是钟：能伤人，也能鸣响。你的锋利常被误解成冷，但真正认识你的人知道，那是你在替所有人守住底线。金怕火炼，可不经炼的金，也只是块矿。',
    ember: '锋利是你的语言，不是你的心。',
  },
  wood: {
    name: '木',
    gan: '主仁',
    tags: ['仁', '生长', '柔韧', '向上'],
    text: '五行之中，木主「仁」。你的底色是生长——压不垮，烧不尽，砍一刀来年照样抽芽。木是林，不是一棵树：你需要同伴，也滋养同伴。你的柔不是软，是懂得借风势、绕石头，最后长得比谁都高。',
    ember: '野火烧不尽，说的就是你。',
  },
  water: {
    name: '水',
    gan: '主智',
    tags: ['智', '流动', '通透', '以柔克刚'],
    text: '五行之中，水主「智」。你的底色是通透——遇方则方，遇圆则圆，但流走的方向从来是自己定的。水不争先，可江海终归是百川的答案。别人以为你好说话，其实你只是不屑于争：真正的深水，面上不动。',
    ember: '上善若水，水善利万物而不争。',
  },
  fire: {
    name: '火',
    gan: '主礼',
    tags: ['礼', '热忱', '光明', '感染力'],
    text: '五行之中，火主「礼」。你的底色是光明磊落——爱憎写在脸上，热忱藏都藏不住。火是五行里唯一会发光的：你走到哪，哪就有温度和方向。火也是最讲分寸的，愿你永远烧在照亮人的位置上。',
    ember: '星星之火，可以燎原。',
  },
  earth: {
    name: '土',
    gan: '主信',
    tags: ['信', '厚重', '包容', '承载'],
    text: '五行之中，土主「信」。你的底色是厚德载物——金木水火都要靠土来立足。你不争不抢，但所有人慌了都会先看你一眼，因为你是那个「稳」字本身。土的包容不是没有脾气，是脾气都化成了养分。',
    ember: '厚德载物，说的就是你。',
  },
}

/* ============ 日柱（公历生日 → 日干支，真算法） ============ */
/* 锚点：2000-01-07 为甲子日（多源万年历交叉验证）。
   只算日柱——年柱月柱涉及节气边界，不在本页范围内。 */

const GAN = '甲乙丙丁戊己庚辛壬癸'
const ZHI = '子丑寅卯辰巳午未申酉戌亥'

export function dayPillar(iso: string): { gan: string; zhi: string; seq: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (y < 1901 || y > 2099 || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  const days = Math.floor(Date.UTC(y, mo - 1, d) / 86400000) - Math.floor(Date.UTC(2000, 0, 7) / 86400000)
  const seq = ((days % 60) + 60) % 60
  return { gan: GAN[seq % 10], zhi: ZHI[seq % 12], seq }
}

/* 十天干日主解读（阴阳属性 + 五行性格 + 站点声口） */
export interface GanMeta {
  gan: string
  wuxing: string
  yinYang: string
  image: string
  tags: string[]
  text: string
  ember: string
}

export const GAN_META: Record<string, GanMeta> = {
  甲: {
    gan: '甲',
    wuxing: '木',
    yinYang: '阳木',
    image: '参天大树',
    tags: ['正直', '担当', '不肯弯'],
    text: '甲木是森林里最高的那棵树——正直、向上、天生要负责。你的骨头是直的，宁可折也不肯绕；这也意味着你比谁都需要扎根够深。甲木的仁不是软弱，是大树底下好乘凉的那种担当。',
    ember: '宁折不弯的前提，是根够深。',
  },
  乙: {
    gan: '乙',
    wuxing: '木',
    yinYang: '阴木',
    image: '藤蔓花草',
    tags: ['柔韧', '适应', '借势'],
    text: '乙木是藤，是草，是墙缝里也能开花的生命力。你没有甲木的硬，但有更高级的本事：借势生长。风往哪吹你就往哪长，看着随和，其实每一步都是你自己选的。乙木的仁，是润物无声的那种。',
    ember: '柔不是输，是另一套长高的办法。',
  },
  丙: {
    gan: '丙',
    wuxing: '火',
    yinYang: '阳火',
    image: '太阳',
    tags: ['坦荡', '热烈', '照亮众人'],
    text: '丙火是太阳——不挑人地亮着，走到哪都是能量源。你的热情是全天候的，藏都藏不住；偶尔会烧过头，但没有人真的讨厌晴天。丙火要修炼的只有一件事：学会日落的时辰。',
    ember: '你不必一直发光，太阳也有夜班。',
  },
  丁: {
    gan: '丁',
    wuxing: '火',
    yinYang: '阴火',
    image: '灯烛',
    tags: ['细腻', '温暖', '照亮小处'],
    text: '丁火是灯，是烛，是深夜书桌上的那一小圈光。你不像丙火那样普照，但你照的地方刚刚好——正好是别人最需要被照见的角落。丁火的礼，是把温度给到具体的人。',
    ember: '小光不小，它照见的是细节。',
  },
  戊: {
    gan: '戊',
    wuxing: '土',
    yinYang: '阳土',
    image: '城墙山岳',
    tags: ['厚重', '可信', '慢热'],
    text: '戊土是城墙，是山岳——厚、稳、慢热。你的信任来得慢，但一旦给了就是地基级的。别人眼里你有点闷，其实你只是把话都攒成了承担。戊土的信，是盖章的那种。',
    ember: '山不动，不是懒，是稳。',
  },
  己: {
    gan: '己',
    wuxing: '土',
    yinYang: '阴土',
    image: '田园',
    tags: ['包容', '滋养', '能容人'],
    text: '己土是田，是院子，是能种出东西来的那一层土。你的包容不是没脾气，是懂得万物都值得一块落脚的地。己土的信长在细处：你记得每个人的口味、忌讳和上次说过的话。',
    ember: '你养人，也养时间。',
  },
  庚: {
    gan: '庚',
    wuxing: '金',
    yinYang: '阳金',
    image: '刀剑矿石',
    tags: ['刚毅', '果决', '讲义气'],
    text: '庚金是矿石里的刀胚——刚毅、果决、认义气。你说一是一，帮朋友从不看回报表；你的锋利偶尔割到自己，但这是你自己选的性格，你自己认。庚金要炼，炼过之后才叫剑。',
    ember: '你的锋利，从来不是冲着朋友去的。',
  },
  辛: {
    gan: '辛',
    wuxing: '金',
    yinYang: '阴金',
    image: '珠玉首饰',
    tags: ['精致', '讲究', '外柔内刚'],
    text: '辛金是珠玉——精致、讲究、看着软，内里比谁都硬。你对质感有天生的执念：能将就的事很多，不能将就的那几件，谁劝都没用。辛金的义，是藏在细节里的分寸。',
    ember: '外柔内刚，是玉的品格。',
  },
  壬: {
    gan: '壬',
    wuxing: '水',
    yinYang: '阳水',
    image: '江河大海',
    tags: ['奔放', '智慧', '适应力'],
    text: '壬水是江河，是大海——奔放、聪明、永远知道往哪流。你的适应力是刻在流淌里的：给一条缝就能走通，给一片海就能成势。壬水的智，是大开大合的智。',
    ember: '你不需要方向，你就是方向。',
  },
  癸: {
    gan: '癸',
    wuxing: '水',
    yinYang: '阴水',
    image: '雨露泉水',
    tags: ['细腻', '聪慧', '润物无声'],
    text: '癸水是雨，是露，是石缝里的泉——细腻、聪慧、润物无声。你的存在感不强，但万物都欠你的滋养。癸水的智是静水深流的智：别人以为你安静，其实你在想的事最深。',
    ember: '润物无声，也是一种声势。',
  },
}

/* ============ 时柱（五鼠遁：日干 + 时支 → 时干支） ============ */

export const BRANCH_HOURS = [
  { zhi: '子', label: '子时 23:00-00:59', h: 0 },
  { zhi: '丑', label: '丑时 01:00-02:59', h: 1 },
  { zhi: '寅', label: '寅时 03:00-04:59', h: 3 },
  { zhi: '卯', label: '卯时 05:00-06:59', h: 5 },
  { zhi: '辰', label: '辰时 07:00-08:59', h: 7 },
  { zhi: '巳', label: '巳时 09:00-10:59', h: 9 },
  { zhi: '午', label: '午时 11:00-12:59', h: 11 },
  { zhi: '未', label: '未时 13:00-14:59', h: 13 },
  { zhi: '申', label: '申时 15:00-16:59', h: 15 },
  { zhi: '酉', label: '酉时 17:00-18:59', h: 17 },
  { zhi: '戌', label: '戌时 19:00-20:59', h: 19 },
  { zhi: '亥', label: '亥时 21:00-22:59', h: 21 },
]

/* 五鼠遁：甲己日起甲子时，乙庚日丙子，丙辛日戊子，丁壬日庚子，戊癸日壬子。
   时干序 = (日干序 % 5) × 2 + 时支序（mod 10）。 */
export function hourPillar(dayGan: string, hour: number): { gan: string; zhi: string } | null {
  const dayGanIdx = GAN.indexOf(dayGan)
  if (dayGanIdx < 0) return null
  const zhiIdx = Math.floor((((hour + 1) % 24) / 2) % 12)
  const ganIdx = ((dayGanIdx % 5) * 2 + zhiIdx) % 10
  return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx] }
}

/* ============ 完整四柱排盘（近似节气版）+ 流年 + 梅花时间起卦 ============ */
/* 说明：日柱、时柱是精确的；年柱月柱的节气分界用平均日期（±1 天误差），
   对绝大多数生日够用。趣味排盘，不做吉凶断命。 */

export const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}
export const ZHI_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
}
const ZHI_ORDER = '子丑寅卯辰巳午未申酉戌亥'

/* 月柱节气分界（平均日期）：[月, 日, 月支序（寅=2）] */
const JIEQI_SPLIT: Array<[number, number, number]> = [
  [1, 6, 1],   /* 小寒 → 丑 */
  [2, 4, 2],   /* 立春 → 寅 */
  [3, 6, 3],   /* 惊蛰 → 卯 */
  [4, 5, 4],   /* 清明 → 辰 */
  [5, 6, 5],   /* 立夏 → 巳 */
  [6, 6, 6],   /* 芒种 → 午 */
  [7, 7, 7],   /* 小暑 → 未 */
  [8, 8, 8],   /* 立秋 → 申 */
  [9, 8, 9],   /* 白露 → 酉 */
  [10, 8, 10], /* 寒露 → 戌 */
  [11, 7, 11], /* 立冬 → 亥 */
  [12, 7, 0],  /* 大雪 → 子 */
]

function yearGanZhi(year: number): { gan: string; zhi: string } {
  return { gan: GAN[(((year - 4) % 10) + 10) % 10], zhi: ZHI[(((year - 4) % 12) + 12) % 12] }
}

/* 年柱：立春（约 2/4）前算前一年 */
function yearPillar(y: number, m: number, d: number): { gan: string; zhi: string; solarYear: number } {
  const beforeLichun = m < 2 || (m === 2 && d < 4)
  const sy = beforeLichun ? y - 1 : y
  return { ...yearGanZhi(sy), solarYear: sy }
}

/* 月柱：节气近似分界 + 五虎遁（月干序 = 年干序×2 + 月支序，mod 10） */
function monthPillar(yearGanIdx: number, zhiIdx: number): { gan: string; zhi: string } {
  const ganIdx = (((yearGanIdx * 2 + zhiIdx) % 10) + 10) % 10
  return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx] }
}

function monthZhiIdx(m: number, d: number): number {
  for (const [mm, dd, z] of JIEQI_SPLIT) {
    if (m === mm && d >= dd) return z
  }
  /* 在本月节气日之前 → 上一个节气月 */
  const prev = JIEQI_SPLIT.find(([mm]) => mm === m)
  if (prev && d < prev[1]) {
    return (prev[2] + 11) % 12
  }
  /* 跨年：1 月 6 日前是子月（0） */
  return m === 1 ? 0 : (m - 2) % 12
}

/* 流年关系：日主五行 vs 流年干五行 */
function relation(dayWX: string, yearWX: string): { label: string; tone: 'good' | 'mid' | 'watch' } {
  const ORDER = ['木', '火', '土', '金', '水'] /* 相生顺序 */
  const i = ORDER.indexOf(dayWX)
  const j = ORDER.indexOf(yearWX)
  const diff = (j - i + 5) % 5
  if (diff === 0) return { label: '比肩——同气相扶', tone: 'mid' }
  if (diff === 1) return { label: '我生——泄秀付出', tone: 'watch' }
  if (diff === 2) return { label: '我克——财星可得', tone: 'good' }
  if (diff === 3) return { label: '克我——官杀压身', tone: 'watch' }
  return { label: '生我——印星护体', tone: 'good' }
}

/* 八卦：先天数 1-8；五行；意象 */
const TRIGRAMS = [
  { name: '乾', wx: '金', img: '天 · 刚健', read: '纯阳之卦，主刚健主动——局面硬碰硬，宜取势不宜取巧。' },
  { name: '兑', wx: '金', img: '泽 · 喜悦', read: '主悦与口舌——话是有用的，但别把话说满。' },
  { name: '离', wx: '火', img: '火 · 光明', read: '主明与依附——看得清是好事，别被光亮晃了眼。' },
  { name: '震', wx: '木', img: '雷 · 震动', read: '主动与惊——消息来得突然，先站稳再说。' },
  { name: '巽', wx: '木', img: '风 · 顺入', read: '主顺与渗透——硬来不如顺着缝隙进。' },
  { name: '坎', wx: '水', img: '水 · 险陷', read: '主险与智——有坑，但水总能流出去，别慌。' },
  { name: '艮', wx: '土', img: '山 · 止守', read: '主止与界限——停下来不是坏事，该守的守住。' },
  { name: '坤', wx: '土', img: '地 · 厚载', read: '主顺与承载——急不来，慢慢积。' },
]

export interface FullBazi {
  pillars: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  wuxingCount: Record<string, number>
  wuxingTop: string
  liunian: Array<{ year: number; ganZhi: string; label: string; tone: 'good' | 'mid' | 'watch' }>
  meihua: { upper: string; lower: string; moving: number; verdict: string; tone: 'good' | 'mid' | 'watch' } | null
}

export function fullBazi(iso: string, hourIdx: number): FullBazi | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (y < 1901 || y > 2099) return null

  const yr = yearPillar(y, mo, d)
  const yearGanIdx = GAN.indexOf(yr.gan)
  const mZhi = monthZhiIdx(mo, d)
  const month = monthPillar(yearGanIdx, mZhi)

  const day = dayPillar(iso)
  if (!day) return null

  const hour = hourIdx >= 0 ? hourPillar(day.gan, BRANCH_HOURS[hourIdx].h) : null

  /* 五行分布：八字（有 时柱 算十字中的八字——四柱天干地支共 8 字，无时柱 6 字） */
  const chars = [
    yr.gan, yr.zhi, month.gan, month.zhi, day.gan, day.zhi,
    ...(hour ? [hour.gan, hour.zhi] : []),
  ]
  const wuxingCount: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  for (const c of chars) {
    const wx = GAN_WUXING[c] ?? ZHI_WUXING[c]
    if (wx) wuxingCount[wx]++
  }
  const wuxingTop = (Object.keys(wuxingCount) as string[]).reduce((a, b) => (wuxingCount[b] > wuxingCount[a] ? b : a))

  /* 流年：今年起 8 年 */
  const nowYear = new Date().getFullYear()
  const dayWX = GAN_WUXING[day.gan]
  const liunian: FullBazi['liunian'] = []
  for (let i = 0; i < 8; i++) {
    const yy = nowYear + i
    const gz = yearGanZhi(yy)
    const rel = relation(dayWX, GAN_WUXING[gz.gan])
    liunian.push({ year: yy, ganZhi: `${gz.gan}${gz.zhi}`, label: rel.label, tone: rel.tone })
  }

  /* 梅花易数 · 时间起卦：年支数(1-12) + 月 + 日 → 上卦；加时支数 → 下卦；总和 mod 6 → 动爻 */
  let meihua: FullBazi['meihua'] = null
  if (hourIdx >= 0) {
    const yearZhiNum = (ZHI_ORDER.indexOf(yr.zhi) + 1 + 12) % 12 || 12
    const hourZhiNum = hourIdx + 1
    const upperIdx = ((yearZhiNum + mo + d) % 8 + 8) % 8
    const lowerIdx = ((yearZhiNum + mo + d + hourZhiNum) % 8 + 8) % 8
    const moving = (((yearZhiNum + mo + d + hourZhiNum) % 6) + 6) % 6 || 6
    const upper = TRIGRAMS[upperIdx]
    const lower = TRIGRAMS[lowerIdx]
    /* 体用：动爻在下卦 → 下卦为用、上卦为体；反之亦然 */
    const body = moving <= 3 ? upper : lower
    const use = moving <= 3 ? lower : upper
    const i2 = ['木', '火', '土', '金', '水'].indexOf(body.wx)
    const j2 = ['木', '火', '土', '金', '水'].indexOf(use.wx)
    const diff = (j2 - i2 + 5) % 5
    let verdict = ''
    let tone: 'good' | 'mid' | 'watch' = 'mid'
    if (diff === 4) { verdict = '用生体——大吉，外力来助'; tone = 'good' }
    else if (diff === 0) { verdict = '体用比和——诸事顺遂'; tone = 'good' }
    else if (diff === 2) { verdict = '体克用——可为，小费力'; tone = 'good' }
    else if (diff === 1) { verdict = '体生用——有耗泄，量力而行'; tone = 'watch' }
    else { verdict = '用克体——有阻滞，宜守不宜进'; tone = 'watch' }
    meihua = { upper: upper.name, lower: lower.name, moving, verdict, tone }
  }

  return {
    pillars: { year: { gan: yr.gan, zhi: yr.zhi }, month, day: { gan: day.gan, zhi: day.zhi }, hour },
    wuxingCount,
    wuxingTop,
    liunian,
    meihua,
  }
}

/* 五行汉字 → kind（日柱报告的五行底色段用） */
export const WUXING_CN_TO_KEY: Record<string, WuxingKind> = {
  金: 'metal',
  木: 'wood',
  水: 'water',
  火: 'fire',
  土: 'earth',
}

/* ============ 梅花易数 · 数字起卦（独立功能） ============ */
/* 传统方法：上卦 = 第一数 ÷ 8 取余（余 0 为坤），下卦 = 第二数 ÷ 8 取余，
   动爻 = 第三数 ÷ 6 取余（余 0 为第六爻）。卦爻自下而上。 */

/* 八卦六爻（下→上，1 阳 0 阴），索引对应先天数 1-8 */
const TRIGRAM_LINES: number[][] = [
  [1, 1, 1], /* 乾 */
  [1, 1, 0], /* 兑 */
  [1, 0, 1], /* 离 */
  [1, 0, 0], /* 震 */
  [0, 1, 1], /* 巽 */
  [0, 1, 0], /* 坎 */
  [0, 0, 1], /* 艮 */
  [0, 0, 0], /* 坤 */
]

export interface MeihuaResult {
  upper: string
  lower: string
  upperImg: string
  lowerImg: string
  moving: number
  /* 本卦六爻（下→上，1 阳 0 阴） */
  lines: number[]
  /* 变卦上下卦名 */
  bianUpper: string
  bianLower: string
  /* 变卦六爻 */
  bianLines: number[]
  verdict: string
  tone: 'good' | 'mid' | 'watch'
  nums: [number, number, number]
  /* 解析：组合意象 / 体用说明 / 变卦去向 */
  composition: string
  bodyUse: string
  bianText: string
}

export function meihuaNumbers(a: number, b: number, c: number): MeihuaResult | null {
  if (![a, b, c].every((n) => Number.isFinite(n) && n > 0)) return null
  const upIdx = Math.floor(a) % 8
  const loIdx = Math.floor(b) % 8
  const mv = Math.floor(c) % 6 || 6
  const upper = TRIGRAMS[upIdx]
  const lower = TRIGRAMS[loIdx]

  const lines = [...TRIGRAM_LINES[loIdx], ...TRIGRAM_LINES[upIdx]]
  /* 动爻：第 mv 爻（1-6，自下而上）翻转 */
  const bianLines = [...lines]
  bianLines[mv - 1] = bianLines[mv - 1] === 1 ? 0 : 1
  const bianLoIdx = TRIGRAM_LINES.findIndex((l) => l.every((v, i) => v === bianLines[i]))
  const bianUpIdx = TRIGRAM_LINES.findIndex((l) => l.every((v, i) => v === bianLines[i + 3]))

  /* 体用：动爻在下卦（1-3 爻）→ 下卦为用、上卦为体 */
  const body = mv <= 3 ? upper : lower
  const use = mv <= 3 ? lower : upper
  const ORDER = ['木', '火', '土', '金', '水']
  const i = ORDER.indexOf(body.wx)
  const j = ORDER.indexOf(use.wx)
  const diff = (j - i + 5) % 5
  let verdict = ''
  let tone: 'good' | 'mid' | 'watch' = 'mid'
  if (diff === 4) { verdict = '用生体——大吉，外力来助'; tone = 'good' }
  else if (diff === 0) { verdict = '体用比和——诸事顺遂'; tone = 'good' }
  else if (diff === 2) { verdict = '体克用——可为，小费力'; tone = 'good' }
  else if (diff === 1) { verdict = '体生用——有耗泄，量力而行'; tone = 'watch' }
  else { verdict = '用克体——有阻滞，宜守不宜进'; tone = 'watch' }

  const bianUp = bianUpIdx >= 0 ? TRIGRAMS[bianUpIdx] : upper
  const bianLo = bianLoIdx >= 0 ? TRIGRAMS[bianLoIdx] : lower

  return {
    upper: upper.name,
    lower: lower.name,
    upperImg: upper.img,
    lowerImg: lower.img,
    moving: mv,
    lines,
    bianUpper: bianUp.name,
    bianLower: bianLo.name,
    bianLines,
    verdict,
    tone,
    nums: [Math.floor(a), Math.floor(b), Math.floor(c)],
    composition: `上${upper.name}下${lower.name}：外面是${upper.img.split(' · ')[0]}，里面是${lower.img.split(' · ')[0]}。${upper.read}`,
    bodyUse: `体为${body.name}（${body.wx}），用为${use.name}（${use.wx}）——动爻在${mv <= 3 ? '下' : '上'}卦，${mv <= 3 ? '下' : '上'}卦为用，变化之力从这里来。`,
    bianText: `事情的走向，落在${bianUp.name}与${bianLo.name}之间——${bianLo.read}`,
  }
}

/* 三数输入的智能解析：支持「3 5 7」「3,5,7」「3、5、7」「357」（三位连写） */
export function parseMeihuaInput(raw: string): [number, number, number] | null {
  const s = raw.trim()
  if (!s) return null
  /* 带分隔符：按空格/逗号/顿号/斜杠拆 */
  const parts = s.split(/[\s,，、/]+/).filter(Boolean)
  let nums: number[] = []
  if (parts.length === 3) {
    nums = parts.map((p) => parseInt(p, 10))
  } else if (parts.length === 1 && /^\d{3}$/.test(parts[0])) {
    /* 三位连写：逐位拆 */
    nums = parts[0].split('').map((ch) => parseInt(ch, 10))
  } else {
    return null
  }
  if (nums.length !== 3 || nums.some((n) => !Number.isFinite(n) || n <= 0)) return null
  return [nums[0], nums[1], nums[2]]
}
