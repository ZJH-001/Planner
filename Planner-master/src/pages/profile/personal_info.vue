<template>
  <view class="personal-info-container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">修改个人情况</text>
      <text class="subtitle">更新您的个人档案和联系方式</text>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 无数据提示 -->
    <view class="empty-data" v-else-if="!hasData && !isLoading">
      <image class="empty-image" src="/static/icons/questionnaire.png" mode="aspectFit"></image>
      <text class="empty-title">您还未填写问卷</text>
      <text class="empty-subtitle">填写问卷可以帮助我们为您提供更好的生涯规划服务</text>
      <button class="primary-btn" @tap="goToQuestionnaire">去填写问卷</button>
    </view>

    <!-- 表单内容 -->
    <view v-else class="form-container">
      <!-- 基本信息部分 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
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
      </view>

      <!-- 学业规划部分 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">学业规划</text>
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
            <label v-for="(skill, index) in academicSkillsOptions" :key="index" class="checkbox-item">
              <checkbox :value="skill" :checked="formData.academicSkills.includes(skill)" />
              <text>{{ skill }}</text>
            </label>
          </checkbox-group>
        </view>
      </view>

      <!-- 个人发展部分 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">个人发展</text>
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
      </view>

      <!-- 底部按钮 -->
      <view class="action-buttons">
        <button class="secondary-btn" @tap="goBack">返回</button>
        <button class="primary-btn" @tap="saveChanges" :loading="isSaving">保存修改</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getQuestionnaireData, submitQuestionnaire } from '@/api/index';

export default {
  data() {
    return {
      isLoading: true,
      isSaving: false,
      hasData: false,
      
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
    isFormValid() {
      return this.formData.grade && 
             this.formData.major && 
             this.formData.gender &&
             this.formData.graduateStudy !== null && 
             this.formData.careerDirection && 
             this.formData.academicSkills.length > 0;
    }
  },
  
  onLoad() {
    this.fetchQuestionnaireData();
  },
  
  methods: {
    // 获取问卷数据
    async fetchQuestionnaireData() {
      this.isLoading = true;
      
      try {
        const data = await getQuestionnaireData();
        
        // 检查是否有数据返回
        if (data && Object.keys(data).length > 0) {
          this.formData = {
            ...this.formData,
            ...data
          };
          this.hasData = true;
        } else {
          this.hasData = false;
        }
      } catch (error) {
        console.error('获取问卷数据失败:', error);
        this.hasData = false;
        uni.showToast({
          title: '获取数据失败，请稍后再试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 处理学术能力多选
    handleAcademicSkillsChange(e) {
      this.formData.academicSkills = e.detail.value;
    },
    
    // 处理兴趣爱好多选
    handleHobbiesChange(e) {
      this.formData.hobbies = e.detail.value;
    },
    
    // 保存修改
    async saveChanges() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请完善必填信息',
          icon: 'none'
        });
        return;
      }
      
      this.isSaving = true;
      
      try {
        await submitQuestionnaire(this.formData);
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          this.goBack();
        }, 1500);
      } catch (error) {
        console.error('保存问卷数据失败:', error);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      } finally {
        this.isSaving = false;
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 跳转到问卷页面
    goToQuestionnaire() {
      uni.navigateTo({
        url: '/pages/questionnaire'
      });
    }
  }
}
</script>

<style>
.personal-info-container {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
}

/* 页面标题样式 */
.header {
  margin-bottom: 40rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
  display: block;
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* 无数据提示样式 */
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.empty-subtitle {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

/* 表单容器样式 */
.form-container {
  padding-bottom: 50rpx;
}

/* 信息卡片样式 */
.info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 30rpx;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #4CAF50;
}

/* 表单组样式 */
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
  box-sizing: border-box;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
}

/* 底部按钮样式 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.primary-btn {
  flex: 1;
  margin-left: 20rpx;
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  color: white;
  border-radius: 40rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.3);
}

.secondary-btn {
  flex: 1;
  margin-right: 20rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}
</style>
