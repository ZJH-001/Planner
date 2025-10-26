<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">霍兰德职业兴趣测评</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-container">
      <view class="progress-bar">
        <view
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
      <text class="progress-text"
        >{{ showResult ? totalQuestions : currentQuestion + 1 }}/{{ totalQuestions }}</text
      >
    </view>

    <!-- 题目内容 -->
    <view class="question-container" v-if="!showResult">
      <view class="question-number">
        <text>第 {{ currentQuestion + 1 }} 题</text>
      </view>

      <view class="question-content">
        <text class="question-text">{{
          questions[currentQuestion].question
        }}</text>
      </view>

      <view class="options-container">
        <view
          class="option-item"
          v-for="(option, index) in questions[currentQuestion].options"
          :key="index"
          :class="{ selected: selectedAnswer === index }"
          @tap="selectOption(index)"
        >
          <view class="option-label"
            >{{ String.fromCharCode(65 + index) }}.</view
          >
          <text class="option-text">{{ option.text }}</text>
        </view>
      </view>
    </view>

    <!-- 结果页面 -->
    <view class="result-container" v-if="showResult">
      <view class="result-header">
        <text class="result-title">测评结果</text>
      </view>

      <view class="result-code">
        <text class="code-text">您的霍兰德代码：{{ resultCode }}</text>
      </view>

      <view class="result-details">
        <view
          class="dimension-item"
          v-for="(score, type) in scores"
          :key="type"
        >
          <text class="dimension-name">{{ getDimensionName(type) }}</text>
          <view class="score-bar">
            <view
              class="score-fill"
              :style="{ width: (score / 10) * 100 + '%' }"
            ></view>
          </view>
          <text class="score-text">{{ score }}/10</text>
        </view>
      </view>

      <view class="result-suggestion">
        <text class="suggestion-title">职业建议</text>
        <text class="suggestion-text">{{ careerSuggestion }}</text>
      </view>


    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons" v-if="!showResult">
      <button
        class="nav-btn prev-btn"
        :disabled="currentQuestion === 0"
        @tap="previousQuestion"
      >
        上一题
      </button>

      <button
        class="nav-btn next-btn"
        v-if="currentQuestion < totalQuestions - 1"
        :disabled="selectedAnswer === null"
        @tap="nextQuestion"
      >
        下一题
      </button>

      <button
        class="nav-btn submit-btn"
        v-if="currentQuestion === totalQuestions - 1"
        :disabled="selectedAnswer === null || isSubmitting"
        @tap="submitTest"
      >
        {{ isSubmitting ? '提交中...' : '提交' }}
      </button>
    </view>

    <!-- 结果页面底部按钮 -->
    <view class="bottom-buttons" v-if="showResult">
      <button class="nav-btn restart-btn" @tap="restartTest">重新测试</button>
      <button class="nav-btn history-btn" @tap="showHistoryModal">历史记录</button>
      <button class="nav-btn home-btn" @tap="goHome">返回首页</button>
    </view>
  </view>
</template>

<script>
import { 
  getHollandStatus, 
  submitHollandTest, 
  getHollandResult, 
  getHollandHistory 
} from '../api/index.js';

export default {
  data() {
    return {
      currentQuestion: 0,
      totalQuestions: 30,
      selectedAnswer: null,
      answers: [],
      showResult: false,
      scores: {
        R: 0, // 实做型
        I: 0, // 研究型
        A: 0, // 艺术型
        S: 0, // 社会型
        E: 0, // 企业型
        C: 0, // 事务型
      },
      maxScores: {
        R: 0,
        I: 0,
        A: 0,
        S: 0,
        E: 0,
        C: 0,
      },
      resultCode: "",
      careerSuggestion: "",
      // API相关状态
      userStatus: {
        has_completed: false,
        last_test_time: null,
        total_tests: 0
      },
      testSessionId: null,
      isSubmitting: false,
      apiResult: null, // 存储从API返回的完整结果
      questions: [
        // 实做型 (R) - 5题
        {
          question: "你更喜欢哪种工作环境？",
          options: [
            { text: "户外或工厂车间", type: "R" },
            { text: "安静的办公室", type: "C" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "用手工具制作东西", type: "R" },
            { text: "分析数据和信息", type: "I" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "修理机械设备", type: "R" },
            { text: "组织活动和会议", type: "E" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "操作机器设备", type: "R" },
            { text: "帮助他人解决问题", type: "S" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "从事体力劳动", type: "R" },
            { text: "进行艺术创作", type: "A" },
          ],
        },

        // 研究型 (I) - 5题
        {
          question: "你更喜欢？",
          options: [
            { text: "进行科学实验", type: "I" },
            { text: "与人交流沟通", type: "S" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "解决复杂的理论问题", type: "I" },
            { text: "管理团队项目", type: "E" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "阅读科学文献", type: "I" },
            { text: "整理文件资料", type: "C" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "独立研究工作", type: "I" },
            { text: "动手制作物品", type: "R" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "探索未知领域", type: "I" },
            { text: "表达创意想法", type: "A" },
          ],
        },

        // 艺术型 (A) - 5题
        {
          question: "你更喜欢？",
          options: [
            { text: "创作艺术作品", type: "A" },
            { text: "处理数据统计", type: "C" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "自由表达想法", type: "A" },
            { text: "遵循既定规则", type: "C" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "设计和装饰", type: "A" },
            { text: "教导他人", type: "S" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "写作或绘画", type: "A" },
            { text: "销售产品", type: "E" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "参与文艺演出", type: "A" },
            { text: "进行科学研究", type: "I" },
          ],
        },

        // 社会型 (S) - 5题
        {
          question: "你更喜欢？",
          options: [
            { text: "帮助他人成长", type: "S" },
            { text: "操作技术设备", type: "R" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "与人合作完成任务", type: "S" },
            { text: "独立完成工作", type: "I" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "教育和培训工作", type: "S" },
            { text: "艺术创作工作", type: "A" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "心理咨询工作", type: "S" },
            { text: "商业谈判工作", type: "E" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "关心他人福利", type: "S" },
            { text: "整理档案资料", type: "C" },
          ],
        },

        // 企业型 (E) - 5题
        {
          question: "你更喜欢？",
          options: [
            { text: "领导团队工作", type: "E" },
            { text: "按部就班工作", type: "C" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "说服他人接受观点", type: "E" },
            { text: "帮助他人解决困难", type: "S" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "制定商业计划", type: "E" },
            { text: "进行学术研究", type: "I" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "销售和营销工作", type: "E" },
            { text: "手工制作工作", type: "R" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "承担风险追求成功", type: "E" },
            { text: "从事艺术创作", type: "A" },
          ],
        },

        // 事务型 (C) - 5题
        {
          question: "你更喜欢？",
          options: [
            { text: "整理和分类信息", type: "C" },
            { text: "与人交流互动", type: "S" },
          ],
        },
        {
          question: "你更倾向于？",
          options: [
            { text: "遵循详细的工作流程", type: "C" },
            { text: "自由发挥创意", type: "A" },
          ],
        },
        {
          question: "你更喜欢？",
          options: [
            { text: "处理财务数据", type: "C" },
            { text: "领导项目团队", type: "E" },
          ],
        },
        {
          question: "你认为自己更适合？",
          options: [
            { text: "文书和档案工作", type: "C" },
            { text: "实验和研究工作", type: "I" },
          ],
        },
        {
          question: "你更愿意？",
          options: [
            { text: "在有序的环境中工作", type: "C" },
            { text: "在户外环境中工作", type: "R" },
          ],
        },
      ],
    };
  },
  computed: {
    progressPercent() {
      if (this.showResult) {
        return 100;
      }
      return ((this.currentQuestion + 1) / this.totalQuestions) * 100;
    },
  },
  async mounted() {
    this.calculateMaxScores();
    await this.checkUserStatus();
  },
  methods: {
    // 检查网络状态
    checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve(res.networkType !== 'none');
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    },

    // 通用错误处理方法
    handleApiError(error, defaultMessage = '操作失败') {
      console.error('API错误:', error);
      
      let errorMessage = defaultMessage;
      
      if (error && error.message) {
        errorMessage = error.message;
      } else if (error && error.code) {
        switch (error.code) {
          case 401:
            errorMessage = '登录已过期，请重新登录';
            break;
          case 400:
            errorMessage = '请求参数错误';
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 409:
            errorMessage = '操作冲突，请稍后重试';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          default:
            errorMessage = error.message || defaultMessage;
        }
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 3000
      });
      
      return errorMessage;
    },

    // API相关方法
    async checkUserStatus() {
      try {
        uni.showLoading({
          title: '检查状态中...'
        });
        
        const status = await getHollandStatus();
        this.userStatus = status;
        
        // 如果用户已完成测评，直接显示最新的历史结果
        if (status.has_completed) {
          this.showHistoryResults();
        }
      } catch (error) {
        this.handleApiError(error, '获取用户状态失败');
        // 如果获取状态失败，继续正常流程
      } finally {
        uni.hideLoading();
      }
    },

    async showHistoryResults() {
      try {
        uni.showLoading({
          title: '加载历史记录...'
        });
        
        const history = await getHollandHistory(1, 1);
        if (history.records && history.records.length > 0) {
          const latestResult = history.records[0];
          this.displayApiResult(latestResult);
        }
      } catch (error) {
        this.handleApiError(error, '获取历史记录失败');
      } finally {
        uni.hideLoading();
      }
    },

    displayApiResult(result) {
      // 使用API返回的结果数据
      this.apiResult = result;
      this.scores = result.scores;
      this.resultCode = result.holland_code;
      if (result.career_suggestion) {
        this.careerSuggestion = result.career_suggestion;
      } else {
        this.generateCareerSuggestion();
      }
      this.showResult = true;
    },

    calculateMaxScores() {
      // 计算每个维度的最大可能分数
      this.maxScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      this.questions.forEach((question) => {
        question.options.forEach((option) => {
          this.maxScores[option.type]++;
        });
      });
    },
    goBack() {
      // 如果正在答题且有答案，需要确认退出
      if (!this.showResult && this.answers.length > 0) {
        uni.showModal({
          title: '确认退出',
          content: '退出后将无法保存当前答题进度，确定要退出吗？',
          confirmText: '确定退出',
          cancelText: '继续答题',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({
                url: "/pages/index",
              });
            }
          }
        });
      } else {
        // 如果没有开始答题或已完成，直接退出
        uni.reLaunch({
          url: "/pages/index",
        });
      }
    },

    goHome() {
      uni.reLaunch({
        url: "/pages/index",
      });
    },

    selectOption(index) {
      this.selectedAnswer = index;
    },

    nextQuestion() {
      if (this.selectedAnswer !== null) {
        this.answers[this.currentQuestion] = this.selectedAnswer;
        this.currentQuestion++;
        this.selectedAnswer = this.answers[this.currentQuestion] || null;
      }
    },

    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.answers[this.currentQuestion] = this.selectedAnswer;
        this.currentQuestion--;
        this.selectedAnswer = this.answers[this.currentQuestion] || null;
      }
    },

    async submitTest() {
      if (this.selectedAnswer !== null) {
        this.answers[this.currentQuestion] = this.selectedAnswer;
        
        // 检查是否所有题目都已回答
        if (this.answers.length < this.questions.length) {
          uni.showToast({
            title: '请完成所有题目',
            icon: 'none',
            duration: 2000
          });
          return;
        }



        // 检查网络状态
        const hasNetwork = await this.checkNetworkStatus();
        if (!hasNetwork) {
          uni.showModal({
            title: '网络异常',
            content: '当前无网络连接，是否使用本地计算结果？',
            confirmText: '使用本地结果',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.calculateResult();
                this.currentPage = 'result';
              }
            }
          });
          return;
        }
        
        // 准备提交到API的答案格式
        const apiAnswers = this.prepareApiAnswers();
        
        try {
          this.isSubmitting = true;
          
          uni.showLoading({
            title: '提交中...',
            mask: true
          });
          
          // 提交到后端API
          const result = await submitHollandTest(apiAnswers);
          
          // 使用API返回的结果
          this.testSessionId = result.test_session_id;
          this.displayApiResult(result);
          
          uni.showToast({
            title: '测评提交成功',
            icon: 'success',
            duration: 2000
          });
          
        } catch (error) {
          this.handleApiError(error, '提交测评失败，请稍后重试');
          
          // 如果API提交失败，使用本地计算结果作为备选
          uni.showModal({
            title: '提交失败',
            content: '网络异常，是否使用本地计算结果？',
            confirmText: '使用本地结果',
            cancelText: '重试',
            success: (res) => {
              if (res.confirm) {
                this.calculateResult();
                this.showResult = true;
              }
            }
          });
        } finally {
          this.isSubmitting = false;
          uni.hideLoading();
        }
      }
    },

    prepareApiAnswers() {
      // 将答案转换为API要求的格式
      const apiAnswers = {};
      this.answers.forEach((answerIndex, questionIndex) => {
        // 题目ID从1开始，选项转换为A/B/C/D
        const questionId = (questionIndex + 1).toString();
        const optionLetter = String.fromCharCode(65 + answerIndex); // 0->A, 1->B, etc.
        apiAnswers[questionId] = optionLetter;
      });
      return apiAnswers;
    },

    calculateResult() {
      // 重置分数
      this.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

      // 计算各维度得分
      this.answers.forEach((answerIndex, questionIndex) => {
        const question = this.questions[questionIndex];
        const selectedOption = question.options[answerIndex];
        this.scores[selectedOption.type]++;
      });

      // 生成霍兰德代码（按得分排序取前三位）
      const sortedTypes = Object.keys(this.scores).sort(
        (a, b) => this.scores[b] - this.scores[a]
      );
      this.resultCode = sortedTypes.slice(0, 3).join("");

      // 生成职业建议
      this.generateCareerSuggestion();
    },

    generateCareerSuggestion() {
      const primaryType = this.resultCode[0];
      const suggestions = {
        R: "您适合从事实际操作性工作，如工程师、技术员、机械师、建筑工人等。您喜欢使用工具和机械，善于解决实际问题。",
        I: "您适合从事研究分析性工作，如科学家、研究员、医生、工程师等。您喜欢思考和分析，善于解决复杂问题。",
        A: "您适合从事创造性工作，如艺术家、设计师、作家、音乐家等。您富有想象力和创造力，喜欢自由表达。",
        S: "您适合从事服务他人的工作，如教师、心理咨询师、社会工作者、护士等。您关心他人，善于沟通和帮助。",
        E: "您适合从事领导管理性工作，如企业家、销售经理、项目经理等。您有领导才能，善于说服和影响他人。",
        C: "您适合从事事务性工作，如会计师、秘书、行政助理、数据分析师等。您注重细节，喜欢有序的工作环境。",
      };

      this.careerSuggestion =
        suggestions[primaryType] ||
        "建议您进一步探索自己的兴趣和能力，寻找最适合的职业方向。";
    },

    getDimensionName(type) {
      const names = {
        R: "实做型",
        I: "研究型",
        A: "艺术型",
        S: "社会型",
        E: "企业型",
        C: "事务型",
      };
      return names[type];
    },



    async showHistoryModal() {
      try {
        uni.showLoading({
          title: '加载历史记录...'
        });
        
        const history = await getHollandHistory(1, 5); // 获取最近5次记录
        
        if (history.records && history.records.length > 0) {
          const historyText = history.records.map((record, index) => {
            const date = new Date(record.test_completed_at).toLocaleDateString();
            return `${index + 1}. ${date} - ${record.holland_code}`;
          }).join('\n');
          
          uni.showModal({
            title: `历史记录 (共${history.total}次)`,
            content: historyText,
            showCancel: false,
            confirmText: '确定'
          });
        } else {
          uni.showToast({
            title: '暂无历史记录',
            icon: 'none'
          });
        }
      } catch (error) {
        this.handleApiError(error, '获取历史记录失败');
      } finally {
        uni.hideLoading();
      }
    },

    restartTest() {
      this.currentQuestion = 0;
      this.selectedAnswer = null;
      this.answers = [];
      this.showResult = false;
      this.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      this.resultCode = "";
      this.careerSuggestion = "";
      this.testSessionId = null;
      this.apiResult = null;
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
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
  font-weight: 500;
}

.header-right {
  width: 80rpx;
  height: 80rpx;
}

/* 进度条 */
.progress-container {
  padding: 0 40rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.progress-text {
  color: #6c757d;
  font-size: 24rpx;
  min-width: 80rpx;
}

/* 题目容器 */
.question-container {
  flex: 1;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
}

.question-number {
  margin-bottom: 40rpx;
}

.question-number text {
  color: #6c757d;
  font-size: 28rpx;
}

.question-content {
  margin-bottom: 60rpx;
}

.question-text {
  color: #2c3e50;
  font-size: 36rpx;
  font-weight: 500;
  line-height: 1.5;
}

/* 选项容器 */
.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.option-item {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  transition: all 0.3s ease;
  border: 4rpx solid #e9ecef;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.option-item.selected {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
  box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.2);
}

.option-label {
  width: 60rpx;
  height: 60rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

.option-item.selected .option-label {
  background: #4caf50;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
  line-height: 1.4;
}

/* 结果页面 */
.result-container {
  flex: 1;
  padding: 0 40rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.result-title {
  color: #2c3e50;
  font-size: 48rpx;
  font-weight: 600;
}

.result-code {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}

.code-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.result-details {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.dimension-item:last-child {
  margin-bottom: 0;
}

.dimension-name {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
}

.score-bar {
  flex: 1;
  height: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.5s ease;
}

.score-text {
  width: 80rpx;
  text-align: right;
  font-size: 24rpx;
  color: #666;
}

.result-suggestion {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
}

.suggestion-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.suggestion-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}



/* 底部按钮 */
.bottom-buttons {
  padding: 40rpx;
  display: flex;
  gap: 20rpx;
}

.nav-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.prev-btn {
  background: #6c757d;
  color: white;
}

.prev-btn:disabled {
  background: #e9ecef;
  color: #adb5bd;
}

.next-btn,
.submit-btn {
  background: #4caf50;
  color: white;
}

.next-btn:disabled,
.submit-btn:disabled {
  background: rgba(76, 175, 80, 0.5);
}

.restart-btn {
  background: #6c757d;
  color: white;
}

.history-btn {
  background: #17a2b8;
  color: white;
}

.home-btn {
  background: #4caf50;
  color: white;
}

.nav-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>