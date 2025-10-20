<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">大学生生涯测评</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 问卷部分 -->
    <view class="questionnaire-section" v-if="!showResult">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
      </view>
      <text class="progress-text">{{ currentQuestion + 1 }}/{{ questions.length }}</text>

      <view class="question-card">
        <text class="question-title">{{ questions[currentQuestion].title }}</text>
        <text class="question-subtitle" v-if="questions[currentQuestion].subtitle">
          {{ questions[currentQuestion].subtitle }}
        </text>

        <view class="options-container">
          <view 
            class="option-item" 
            v-for="(option, index) in questions[currentQuestion].options" 
            :key="index"
            :class="{ 
              selected: isOptionSelected(index),
              'multi-select': questions[currentQuestion].multiple 
            }"
            @tap="selectOption(index)"
          >
            <view class="option-checkbox" v-if="questions[currentQuestion].multiple">
              <text class="checkbox-icon" v-if="isOptionSelected(index)">✓</text>
            </view>
            <view class="option-radio" v-else>
              <view class="radio-dot" v-if="isOptionSelected(index)"></view>
            </view>
            <text class="option-text">{{ option.text }}</text>
          </view>
        </view>

        <!-- 自定义输入框 -->
        <view class="custom-input" v-if="showCustomInput">
          <input 
            class="custom-text" 
            v-model="customAnswer" 
            placeholder="请输入其他选项..."
            maxlength="50"
          />
        </view>

        <view class="button-container">
          <button 
            class="btn btn-prev" 
            v-if="currentQuestion > 0" 
            @tap="previousQuestion"
          >
            上一题
          </button>
          <button 
            class="btn btn-next" 
            :class="{ disabled: !canProceed }"
            @tap="nextQuestion"
          >
            {{ currentQuestion === questions.length - 1 ? '生成词云' : '下一题' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 结果展示部分 -->
    <view class="result-section" v-if="showResult">
      <view class="result-header">
        <text class="result-title">你的生涯规划词云</text>
        <text class="result-subtitle">基于你的选择生成的个性化词云</text>
      </view>

      <!-- 词云容器 -->
      <view class="wordcloud-container">
        <canvas 
          class="wordcloud-canvas" 
          canvas-id="wordcloud" 
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        ></canvas>
      </view>

      <!-- 关键词统计 -->
      <view class="keywords-stats">
        <text class="stats-title">关键词统计</text>
        <view class="keywords-list">
          <view 
            class="keyword-item" 
            v-for="(keyword, index) in sortedKeywords" 
            :key="index"
          >
            <text class="keyword-text">{{ keyword.text }}</text>
            <text class="keyword-count">{{ keyword.count }}次</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="btn btn-export" @tap="exportWordcloud">导出图片</button>
        <button class="btn btn-reset" @tap="resetAssessment">重新测评</button>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar active="index"></tab-bar>
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar.vue";

export default {
  components: {
    TabBar,
  },
  data() {
    return {
      currentQuestion: 0,
      showResult: false,
      answers: {},
      customAnswer: '',
      canvasWidth: 350,
      canvasHeight: 250,
      questions: [
        {
          title: "1. 你的英语能力提升目标是？",
          subtitle: "（可多选）",
          multiple: true,
          options: [
            { text: "A. 考取英语四级证书", keywords: ["英语四级", "证书", "语言能力"] },
            { text: "B. 考取英语六级证书", keywords: ["英语六级", "证书", "语言能力"] },
            { text: "C. 暂无英语证书考取计划", keywords: ["暂无计划"] },
            { text: "D. 考取雅思/托福等出国语言考试", keywords: ["雅思", "托福", "出国", "语言考试"] },
            { text: "E. 提升商务英语能力", keywords: ["商务英语", "职场技能"] },
            { text: "F. 其他", keywords: ["其他"], hasCustom: true }
          ]
        },
        {
          title: "2. 你是否有考取教师资格证的打算？",
          multiple: false,
          options: [
            { text: "A. 是，计划近期备考", keywords: ["教师资格证", "近期计划", "教育行业"] },
            { text: "B. 是，长期有此规划", keywords: ["教师资格证", "长期规划", "教育行业"] },
            { text: "C. 否，暂无相关计划", keywords: ["暂无计划"] },
            { text: "D. 考虑其他职业资格证书", keywords: ["职业资格证", "其他证书"] }
          ]
        },
        {
          title: "3. 本科毕业后，你优先考虑的发展方向是？",
          subtitle: "（单选）",
          multiple: false,
          options: [
            { text: "A. 直接就业", keywords: ["直接就业", "工作", "职场"] },
            { text: "B. 申请保研", keywords: ["保研", "继续深造", "学术"] },
            { text: "C. 准备考研", keywords: ["考研", "继续深造", "学术"] },
            { text: "D. 报考公务员/事业单位", keywords: ["公务员", "事业单位", "稳定工作"] },
            { text: "E. 出国留学", keywords: ["出国留学", "国际化", "深造"] },
            { text: "F. 自主创业", keywords: ["创业", "自主", "创新"] },
            { text: "G. 暂未确定", keywords: ["未确定", "探索中"] }
          ]
        },
        {
          title: "4. 若计划本科毕业就业，你是否已有初步的职业方向？",
          multiple: false,
          options: [
            { text: "A. 是，明确具体行业/岗位", keywords: ["明确方向", "职业规划", "目标明确"] },
            { text: "B. 是，有大致行业范围", keywords: ["行业方向", "职业规划"] },
            { text: "C. 否，尚未思考", keywords: ["未思考", "迷茫"] },
            { text: "D. 正在通过实习/培训探索", keywords: ["实习", "培训", "探索", "实践"] }
          ]
        },
        {
          title: "5. 若考虑继续深造（保研/考研/留学），你是否确定了目标院校或专业方向？",
          multiple: false,
          options: [
            { text: "A. 是，已确定具体院校及专业", keywords: ["目标明确", "院校确定", "专业确定", "深造"] },
            { text: "B. 是，确定专业方向，未确定院校", keywords: ["专业方向", "深造", "选择中"] },
            { text: "C. 否，仅有意向，未明确方向", keywords: ["有意向", "未明确", "探索中"] },
            { text: "D. 暂不考虑继续深造", keywords: ["不考虑深造"] }
          ]
        },
        {
          title: "6. 你是否有备考公务员/事业单位的明确计划？",
          multiple: false,
          options: [
            { text: "A. 是，计划参加下一次考试", keywords: ["公务员", "事业单位", "备考计划", "稳定工作"] },
            { text: "B. 是，长期备考中", keywords: ["公务员", "事业单位", "长期备考", "稳定工作"] },
            { text: "C. 否，暂无相关计划", keywords: ["暂无计划"] },
            { text: "D. 考虑基层项目（三支一扶、西部计划等）", keywords: ["基层项目", "三支一扶", "西部计划", "社会服务"] }
          ]
        },
        {
          title: "7. 对于出国留学，你目前的规划进度是？",
          multiple: false,
          options: [
            { text: "A. 已确定目标国家/院校，准备申请材料", keywords: ["出国留学", "目标明确", "申请准备", "国际化"] },
            { text: "B. 确定目标国家，未确定院校", keywords: ["出国留学", "目标国家", "选择中", "国际化"] },
            { text: "C. 仅有意向，未开始准备", keywords: ["留学意向", "未开始准备"] },
            { text: "D. 不考虑出国留学", keywords: ["不考虑留学"] }
          ]
        },
        {
          title: "8. 你是否有创业的打算？",
          multiple: false,
          options: [
            { text: "A. 是，已有具体项目和计划", keywords: ["创业", "具体项目", "创业计划", "创新"] },
            { text: "B. 是，正在构思和调研", keywords: ["创业", "构思中", "市场调研", "创新"] },
            { text: "C. 否，暂无相关计划", keywords: ["暂无计划"] },
            { text: "D. 可能考虑，但需积累更多经验", keywords: ["创业考虑", "经验积累", "未来可能"] }
          ]
        },
        {
          title: "9. 你是否计划考取与专业相关的职业资格证书？",
          subtitle: "（可多选）",
          multiple: true,
          options: [
            { text: "A. 会计类（CPA、ACCA等）", keywords: ["会计证书", "CPA", "ACCA", "财务"] },
            { text: "B. 金融类（CFA、FRM等）", keywords: ["金融证书", "CFA", "FRM", "金融"] },
            { text: "C. 计算机类（软考、PMP等）", keywords: ["计算机证书", "软考", "PMP", "技术"] },
            { text: "D. 法律类（法律职业资格证）", keywords: ["法律证书", "法律职业", "司法"] },
            { text: "E. 其他", keywords: ["其他证书"], hasCustom: true },
            { text: "F. 暂无考证计划", keywords: ["暂无计划"] }
          ]
        },
        {
          title: "10. 你对未来1-2年的生涯规划清晰程度如何？",
          multiple: false,
          options: [
            { text: "A. 非常清晰，已有详细计划", keywords: ["规划清晰", "详细计划", "目标明确"] },
            { text: "B. 比较清晰，有大致方向", keywords: ["规划清晰", "大致方向"] },
            { text: "C. 一般，还在探索中", keywords: ["探索中", "一般清晰"] },
            { text: "D. 不清晰，希望得到指导", keywords: ["不清晰", "需要指导", "迷茫"] }
          ]
        }
      ]
    };
  },
  computed: {
    progressPercentage() {
      return ((this.currentQuestion + 1) / this.questions.length) * 100;
    },
    canProceed() {
      const question = this.questions[this.currentQuestion];
      const answers = this.answers[this.currentQuestion] || [];
      
      if (question.multiple) {
        return answers.length > 0;
      } else {
        return answers.length === 1;
      }
    },
    showCustomInput() {
      const question = this.questions[this.currentQuestion];
      const answers = this.answers[this.currentQuestion] || [];
      
      return answers.some(answerIndex => {
        const option = question.options[answerIndex];
        return option && option.hasCustom;
      });
    },
    sortedKeywords() {
      const keywordCount = {};
      
      // 统计关键词频率
      Object.values(this.answers).forEach(questionAnswers => {
        questionAnswers.forEach(answerIndex => {
          const question = this.questions[Object.keys(this.answers).find(q => 
            this.answers[q] === questionAnswers
          )];
          if (question && question.options[answerIndex]) {
            const keywords = question.options[answerIndex].keywords || [];
            keywords.forEach(keyword => {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
            });
          }
        });
      });

      // 转换为数组并排序
      return Object.entries(keywordCount)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count);
    }
  },
  onReady() {
    // 获取系统信息，调整canvas尺寸
    uni.getSystemInfo({
      success: (res) => {
        this.canvasWidth = Math.min(res.windowWidth - 80, 400);
        this.canvasHeight = Math.min(this.canvasWidth * 0.7, 300);
      }
    });
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    isOptionSelected(index) {
      const answers = this.answers[this.currentQuestion] || [];
      return answers.includes(index);
    },
    
    selectOption(index) {
      const question = this.questions[this.currentQuestion];
      let answers = this.answers[this.currentQuestion] || [];
      
      if (question.multiple) {
        // 多选题
        const selectedIndex = answers.indexOf(index);
        if (selectedIndex > -1) {
          answers.splice(selectedIndex, 1);
        } else {
          answers.push(index);
        }
      } else {
        // 单选题
        answers = [index];
      }
      
      this.$set(this.answers, this.currentQuestion, answers);
      
      // 清空自定义输入
      if (!this.showCustomInput) {
        this.customAnswer = '';
      }
    },
    
    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
        this.customAnswer = '';
      }
    },
    
    nextQuestion() {
      if (!this.canProceed) return;
      
      // 保存自定义答案
      if (this.customAnswer.trim()) {
        // 这里可以处理自定义答案，添加到关键词中
        console.log('自定义答案:', this.customAnswer);
      }
      
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++;
        this.customAnswer = '';
      } else {
        // 完成问卷，生成词云
        this.generateWordcloud();
      }
    },
    
    generateWordcloud() {
      this.showResult = true;
      
      this.$nextTick(() => {
        this.drawWordcloud();
      });
    },
    
    drawWordcloud() {
      const ctx = uni.createCanvasContext('wordcloud', this);
      const keywords = this.sortedKeywords;
      
      if (keywords.length === 0) {
        ctx.setFillStyle('#999');
        ctx.setFontSize(16);
        ctx.fillText('暂无数据', this.canvasWidth / 2 - 30, this.canvasHeight / 2);
        ctx.draw();
        return;
      }
      
      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // 设置背景
      ctx.setFillStyle('#f8f9fa');
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // 定义颜色数组
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      
      // 计算字体大小
      const maxCount = Math.max(...keywords.map(k => k.count));
      const minSize = 12;
      const maxSize = 36;
      
      // 绘制词云
      keywords.forEach((keyword, index) => {
        const fontSize = minSize + (keyword.count / maxCount) * (maxSize - minSize);
        const color = colors[index % colors.length];
        
        ctx.setFillStyle(color);
        ctx.setFontSize(fontSize);
        ctx.setTextAlign('center');
        
        // 简单的布局算法
        const cols = 3;
        const rows = Math.ceil(keywords.length / cols);
        const cellWidth = this.canvasWidth / cols;
        const cellHeight = this.canvasHeight / rows;
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2 + fontSize / 3;
        
        ctx.fillText(keyword.text, x, y);
      });
      
      ctx.draw();
    },
    
    exportWordcloud() {
      uni.canvasToTempFilePath({
        canvasId: 'wordcloud',
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: '词云图片已保存到相册',
                icon: 'success'
              });
            },
            fail: () => {
              uni.showToast({
                title: '保存失败，请检查权限',
                icon: 'none'
              });
            }
          });
        },
        fail: () => {
          uni.showToast({
            title: '导出失败',
            icon: 'none'
          });
        }
      }, this);
    },
    
    resetAssessment() {
      uni.showModal({
        title: '确认重置',
        content: '确定要重新开始测评吗？当前结果将被清空。',
        success: (res) => {
          if (res.confirm) {
            this.currentQuestion = 0;
            this.showResult = false;
            this.answers = {};
            this.customAnswer = '';
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 140rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
}

.header-left {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 60rpx;
  color: white;
  font-weight: 300;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-title {
  font-size: 36rpx;
  color: white;
  font-weight: 600;
}

.header-right {
  width: 80rpx;
}

/* 问卷部分 */
.questionnaire-section {
  padding: 0 40rpx;
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  color: white;
  font-size: 24rpx;
  text-align: center;
  display: block;
  margin-bottom: 40rpx;
}

.question-card {
  background: white;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.question-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  display: block;
  margin-bottom: 20rpx;
}

.question-subtitle {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.options-container {
  margin-bottom: 40rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.option-item.selected {
  border-color: #4ECDC4;
  background: #f0fffe;
}

.option-item:active {
  transform: scale(0.98);
}

.option-checkbox, .option-radio {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease;
}

.option-radio {
  border-radius: 50%;
}

.option-item.selected .option-checkbox,
.option-item.selected .option-radio {
  border-color: #4ECDC4;
  background: #4ECDC4;
}

.checkbox-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background: white;
  border-radius: 50%;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.custom-input {
  margin-bottom: 40rpx;
}

.custom-text {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.custom-text:focus {
  border-color: #4ECDC4;
}

.button-container {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.btn-prev {
  background: #f5f5f5;
  color: #666;
}

.btn-next {
  background: #4ECDC4;
  color: white;
}

.btn-next.disabled {
  background: #ccc;
  color: #999;
}

.btn:active:not(.disabled) {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 结果展示部分 */
.result-section {
  padding: 0 40rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.result-title {
  font-size: 36rpx;
  color: white;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}

.result-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.wordcloud-container {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.wordcloud-canvas {
  border-radius: 12rpx;
}

.keywords-stats {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.stats-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.keyword-item {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
}

.keyword-text {
  font-size: 24rpx;
  color: #333;
  margin-right: 12rpx;
}

.keyword-count {
  font-size: 20rpx;
  color: #666;
  background: #e9ecef;
  border-radius: 10rpx;
  padding: 4rpx 8rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.btn-export {
  background: #28a745;
  color: white;
}

.btn-reset {
  background: #dc3545;
  color: white;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .question-card {
    padding: 40rpx 30rpx;
  }
  
  .option-text {
    font-size: 26rpx;
  }
  
  .question-title {
    font-size: 30rpx;
  }
}
</style>