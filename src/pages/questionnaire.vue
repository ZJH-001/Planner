<template>
  <view class="questionnaire-container">
    <!-- 顶部进度指示器 -->
    <view class="progress-bar">
      <view 
        v-for="(step, index) in totalSteps" 
        :key="index"
        class="step-indicator"
        :class="{ 'active': currentStep >= index + 1, 'completed': currentStep > index + 1 }"
      >
        <text class="step-number">{{ index + 1 }}</text>
        <text class="step-label">{{ getStepLabel(index + 1) }}</text>
      </view>
      <view class="progress-line">
        <view class="progress-fill" :style="{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }"></view>
      </view>
    </view>

    <!-- 欢迎页 -->
    <view v-if="currentStep === 0" class="welcome-section">
      <image class="welcome-image" src="/static/icons/questionnaire.png" mode="aspectFit"></image>
      <text class="welcome-title">欢迎来到未来流生涯规划平台</text>
      <text class="welcome-subtitle">让我们通过几个简单的问题了解你，为你提供更好的生涯规划服务</text>
      <button class="primary-btn" @tap="nextStep">开始问卷</button>
      <text class="skip-text" @tap="skipQuestionnaire">稍后再说 ></text>
    </view>

    <!-- 第一部分：基本信息 -->
    <view v-if="currentStep === 1" class="question-section">
      <view class="section-title">
        <text class="title">基本信息</text>
        <text class="subtitle">请告诉我们关于你的一些基本情况</text>
      </view>

      <view class="form-group">
        <text class="label">你目前的年级是？</text>
        <view class="options-grid">
          <view 
            v-for="(grade, index) in gradeOptions" 
            :key="index"
            class="option-item"
            :class="{ 'selected': formData.grade === grade }"
            @tap="formData.grade = grade"
          >
            {{ grade }}
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">你的专业类别是？</text>
        <picker 
          mode="selector" 
          :range="majorOptions" 
          @change="(e) => formData.major = majorOptions[e.detail.value]"
          class="picker"
        >
          <view class="picker-value">{{ formData.major || '请选择专业类别' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">你的性别是？</text>
        <view class="options-row">
          <view 
            class="option-item"
            :class="{ 'selected': formData.gender === '男' }"
            @tap="formData.gender = '男'"
          >
            男
          </view>
          <view 
            class="option-item"
            :class="{ 'selected': formData.gender === '女' }"
            @tap="formData.gender = '女'"
          >
            女
          </view>
        </view>
      </view>

      <view class="buttons">
        <button class="secondary-btn" @tap="prevStep">上一步</button>
        <button class="primary-btn" @tap="nextStep" :disabled="!isStep1Valid">下一步</button>
      </view>
    </view>

    <!-- 第二部分：学业规划 -->
    <view v-if="currentStep === 2" class="question-section">
      <view class="section-title">
        <text class="title">学业规划</text>
        <text class="subtitle">了解你的学习目标和规划</text>
      </view>

      <view class="form-group">
        <text class="label">你有考研的打算吗？</text>
        <view class="options-row">
          <view 
            class="option-item"
            :class="{ 'selected': formData.graduateStudy === true }"
            @tap="formData.graduateStudy = true"
          >
            是
          </view>
          <view 
            class="option-item"
            :class="{ 'selected': formData.graduateStudy === false }"
            @tap="formData.graduateStudy = false"
          >
            否
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">你期望的就业方向是？</text>
        <picker 
          mode="selector" 
          :range="careerOptions" 
          @change="(e) => formData.careerDirection = careerOptions[e.detail.value]"
          class="picker"
        >
          <view class="picker-value">{{ formData.careerDirection || '请选择就业方向' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">你最想提升的学术能力是？（可多选）</text>
        <checkbox-group @change="handleAcademicSkillsChange">
          <!-- 按index排序，checkbox的值为skill中的内容，checked控制选中状态​​ -->
          <label v-for="(skill, index) in academicSkillsOptions" :key="index" class="checkbox-item">
            <checkbox :value="skill" :checked="formData.academicSkills.includes(skill)" />
            <text>{{ skill }}</text>
          </label>
        </checkbox-group>
      </view>

      <view class="buttons">
        <button class="secondary-btn" @tap="prevStep">上一步</button>
        <button class="primary-btn" @tap="nextStep" :disabled="!isStep2Valid">下一步</button>
      </view>
    </view>

    <!-- 第三部分：个人发展 -->
    <view v-if="currentStep === 3" class="question-section">
      <view class="section-title">
        <text class="title">个人发展</text>
        <text class="subtitle">了解你的兴趣爱好和职业规划</text>
      </view>

      <view class="form-group">
        <text class="label">你的兴趣爱好有哪些？（可多选）</text>
        <checkbox-group @change="handleHobbiesChange">
          <label v-for="(hobby, index) in hobbyOptions" :key="index" class="checkbox-item">
            <checkbox :value="hobby" :checked="formData.hobbies.includes(hobby)" />
            <text>{{ hobby }}</text>
          </label>
        </checkbox-group>
      </view>

      <view class="form-group">
        <text class="label">你最希望获得哪方面的生涯规划帮助？</text>
        <textarea 
          class="textarea" 
          placeholder="请简要描述你的需求..." 
          v-model="formData.careerHelp"
          maxlength="200"
        ></textarea>
        <text class="char-count">{{ formData.careerHelp.length }}/200</text>
      </view>

      <view class="form-group">
        <text class="label">你期望在大学期间达成的目标是？</text>
        <textarea 
          class="textarea" 
          placeholder="请描述你的目标..." 
          v-model="formData.collegeGoals"
          maxlength="200"
        ></textarea>
        <text class="char-count">{{ formData.collegeGoals.length }}/200</text>
      </view>

      <view class="buttons">
        <button class="secondary-btn" @tap="prevStep">上一步</button>
        <button class="primary-btn" @tap="submitQuestionnaire" :loading="isSubmitting">提交</button>
      </view>
    </view>

    <!-- 提交成功页面 -->
    <view v-if="currentStep === 4" class="success-section">
      <image class="success-image" src="/static/icons/success.png" mode="aspectFit"></image>
      <text class="success-title">提交成功！</text>
      <text class="success-subtitle">感谢你的参与，我们将根据你的情况为你提供个性化的生涯规划服务</text>
      <button class="primary-btn" @tap="goToHomePage">进入首页</button>
    </view>
  </view>
</template>

<script>
import { submitQuestionnaire } from '@/api/index';

export default {
  data() {
    return {
      currentStep: 0, // 0: 欢迎页, 1-3: 问卷步骤, 4: 成功页
      totalSteps: 4, // 总步骤数（不包括欢迎页和成功页）
      isSubmitting: false,
      
      // 表单数据
      formData: {
        // 基本信息
        grade: '',
        major: '',
        gender: '',
        
        // 学业规划
        graduateStudy: null,
        careerDirection: '',
        academicSkills: [],
        
        // 个人发展
        hobbies: [],
        careerHelp: '',
        collegeGoals: ''
      },
      
      // 选项数据
      gradeOptions: ['大一', '大二', '大三', '大四', '研究生', '其他'],
      majorOptions: ['理学', '工学', '文学', '法学', '经济学', '管理学', '医学', '艺术学', '教育学', '历史学', '哲学', '农学', '军事学'],
      careerOptions: ['互联网/IT', '金融', '教育', '医疗', '公务员', '制造业', '服务业', '创业', '考研/留学', '其他'],
      academicSkillsOptions: ['专业知识', '科研能力', '外语能力', '编程技能', '演讲表达', '论文写作', '实验操作', '团队协作'],
      hobbyOptions: ['阅读', '运动', '音乐', '艺术', '旅行', '摄影', '编程', '游戏', '社交', '志愿服务']
    }
  },
  
  computed: {
    isStep1Valid() {
      return this.formData.grade && this.formData.major && this.formData.gender;
    },
    
    isStep2Valid() {
      return this.formData.graduateStudy !== null && 
             this.formData.careerDirection && 
             this.formData.academicSkills.length > 0;
    }
  },
  
  methods: {
    getStepLabel(step) {
      const labels = ['基本信息', '学业规划', '个人发展'];
      return labels[step - 1] || '';
    },
    
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },
    
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    
    skipQuestionnaire() {
      // 记录用户已跳过问卷
      uni.setStorageSync('questionnaireSkipped', true);
      
      // 跳转到首页
      uni.switchTab({
        url: '/pages/index'
      });
    },
    
    handleAcademicSkillsChange(e) {
      this.formData.academicSkills = e.detail.value;
    },
    
    handleHobbiesChange(e) {
      this.formData.hobbies = e.detail.value;
    },
    
    async submitQuestionnaire() {
      if (this.isSubmitting) return;
      
      this.isSubmitting = true;
      // uni.setStorageSync('questionnaireCompleted', true);
      // this.currentStep = 4;
      try {
        // 调用API提交问卷数据
        await submitQuestionnaire(this.formData);
        
        // 记录用户已完成问卷
        uni.setStorageSync('questionnaireCompleted', true);
        
        // 显示成功页面
        this.currentStep = 4;
      } catch (error) {
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
        console.error('问卷提交失败:', error);
      } finally {
        this.isSubmitting = false;
      }
    },
    
    goToHomePage() {
      uni.switchTab({
        url: '/pages/index'
      });
    }
  }
}
</script>

<style>
.questionnaire-container {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
}

/* 进度条样式 */
.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  position: relative;
  padding-top: 40rpx;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60rpx;
  z-index: 2;
}

.step-number {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.step-label {
  font-size: 22rpx;
  color: #999;
}

.step-indicator.active .step-number {
  background-color: #4CAF50;
}

.step-indicator.active .step-label {
  color: #4CAF50;
}

.step-indicator.completed .step-number {
  background-color: #4CAF50;
}

.progress-line {
  position: absolute;
  top: 60rpx;
  left: 30rpx;
  right: 30rpx;
  height: 4rpx;
  background-color: #e0e0e0;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s;
}

/* 欢迎页样式 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  animation: fadeIn 0.5s;
}

.welcome-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 40rpx;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

.welcome-subtitle {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 60rpx;
  line-height: 1.5;
}

.skip-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 40rpx;
}

/* 问题部分样式 */
.question-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s;
}

.section-title {
  margin-bottom: 40rpx;
}

.section-title .title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.section-title .subtitle {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.form-group {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
}

.options-row {
  display: flex;
}

.option-item {
  padding: 16rpx 30rpx;
  border: 1px solid #e0e0e0;
  border-radius: 30rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.option-item.selected {
  background-color: #e8f5e9;
  border-color: #4CAF50;
  color: #4CAF50;
}

.picker {
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
}

.picker-value {
  font-size: 28rpx;
  color: #333;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 26rpx;
}

.textarea {
  width: 100%;
  height: 160rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
}

/* 按钮样式 */
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.primary-btn {
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  color: white;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.3);
}

.secondary-btn {
  background-color: #f5f5f5;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
}

/* 成功页样式 */
.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  animation: fadeIn 0.5s;
}

.success-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 20rpx;
}

.success-subtitle {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 60rpx;
  line-height: 1.5;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
