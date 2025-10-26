<template>
  <view class="achievement-container">
    <!-- 顶部个人概览区 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">我的成果</text>
      
    </view>


    <view class="header-section">
      <view class="user-profile">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || '/static/cat.png'" 
          mode="aspectFill"
        ></image>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || '加载中...' }}</text>
          <text class="user-desc">{{ userInfo.organization || '展示你的精彩成果' }}</text>
        </view>
      </view>
      
      <!-- 成就统计 -->
      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalAchievements || 0 }}</text>
          <text class="stat-label">总成就</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalAwards || 0 }}</text>
          <text class="stat-label">获奖次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ stats.totalCertificates || 0 }}</text>
          <text class="stat-label">证书数量</text>
        </view>
      </view>
      
      <!-- 个人标签云 -->
      <view class="tags-section" v-if="personalTags.length > 0">
        <view class="section-title">个人标签</view>
        <view class="tags-container">
          <text 
            v-for="(tag, index) in personalTags" 
            :key="index" 
            class="tag-item"
            :class="'tag-' + (index % 4)"
          >
            {{ tag }}
          </text>
        </view>
      </view>
    </view>

    <!-- 分类筛选器 -->
    <view class="filter-section">
      <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="filter-item"
          :class="{ 'active': currentCategory === category.key }"
          @tap="switchCategory(category.key)"
        >
          <image class="filter-icon" :src="category.icon" mode="aspectFit"></image>
          <text class="filter-text">{{ category.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 成果展示区域 -->
    <view class="achievements-section">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="filteredAchievements.length === 0" class="empty-container">
        <image class="empty-icon" src="/static/icons/empty-achievement.png" mode="aspectFit"></image>
        <text class="empty-text">还没有{{ getCurrentCategoryName() }}记录</text>
        <view class="empty-btn" @tap="showAddForm">
          <text class="empty-btn-text">添加第一个成果</text>
        </view>
      </view>
      
      <!-- 成果列表 -->
      <view v-else class="achievements-list">
        <view 
          v-for="(achievement, index) in filteredAchievements" 
          :key="achievement.id"
          class="achievement-card"
          @tap="viewAchievement(achievement)"
        >
          <!-- 重要程度指示器 -->
          <view class="importance-indicator" :class="'level-' + achievement.importance"></view>
          
          <!-- 成果图片 -->
          <view class="achievement-image" v-if="achievement.images && achievement.images.length > 0">
            <image 
              :src=" 'https://uvpddncsycmr.sealoshzh.site'+achievement.images[0]" 
              mode="aspectFill"
              class="card-image"
              :lazy-load="true"
            ></image>
          </view>
          
          <!-- 成果信息 -->
          <view class="achievement-content">
            <view class="achievement-header">
              <text class="achievement-title">{{ achievement.title }}</text>
              <view class="achievement-actions">
                <view class="action-btn" @tap.stop="editAchievement(achievement)">
                  <image src="/static/icons/edit.png" class="action-icon" mode="aspectFit"></image>
                </view>
                <view class="action-btn" @tap.stop="deleteAchievement(achievement)">
                  <image src="/static/icons/delete.png" class="action-icon" mode="aspectFit"></image>
                </view>
              </view>
            </view>
            
            <text class="achievement-org" v-if="achievement.organization">{{ achievement.organization }}</text>
            <text class="achievement-desc">{{ achievement.description }}</text>
            <text class="achievement-date">{{ formatDate(achievement.achievedDate) }}</text>
            
            <!-- 标签 -->
            <view class="achievement-tags" v-if="achievement.tags && achievement.tags.length > 0">
              <text 
                v-for="(tag, tagIndex) in achievement.tags.slice(0, 3)" 
                :key="tagIndex"
                class="achievement-tag"
              >
                {{ tag }}
              </text>
              <text v-if="achievement.tags.length > 3" class="achievement-tag more">+{{ achievement.tags.length - 3 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab-container">
      <view class="fab-button" @tap="showAddForm">
        <text class="fab-icon">+</text>
      </view>
    </view>

    <!-- 添加/编辑成果弹窗 -->
    <view v-if="showForm" class="form-overlay" @tap="hideForm">
      <view class="form-container" @tap.stop="handleFormClick">
        <view class="form-header">
          <text class="form-title">{{ isEditing ? '编辑成果' : '添加成果' }}</text>
          <view class="form-close" @tap="hideForm">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <scroll-view class="form-content" scroll-y="true">
          <!-- 成果分类 -->
          <view class="form-group">
            <text class="form-label">成果分类</text>
            <picker 
              :value="categoryIndex" 
              :range="categoryOptions" 
              range-key="name"
              @change="onCategoryChange"
            >
              <view class="picker-input">
                <text class="picker-text">{{ formData.category ? getCategoryName(formData.category) : '请选择分类' }}</text>
                <text class="picker-arrow">></text>
              </view>
            </picker>
          </view>
          
          <!-- 成果标题 -->
          <view class="form-group">
            <text class="form-label">成果标题</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.title" 
              placeholder="请输入你的成果名称..."
              maxlength="50"
              auto-height
            ></textarea>
          </view>
          
          <!-- 颁发机构 -->
          <view class="form-group">
            <text class="form-label">颁发机构</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.organization" 
              placeholder="请输入颁发机构..."
              maxlength="50"
              auto-height
            ></textarea>
          </view>
          
          <!-- 获得时间 -->
          <view class="form-group">
            <text class="form-label">获得时间</text>
            <picker 
              mode="date" 
              :value="formData.achievedDate" 
              @change="onDateChange"
            >
              <view class="picker-input">
                <text class="picker-text">{{ formData.achievedDate || '请选择时间' }}</text>
                <text class="picker-arrow">></text>
              </view>
            </picker>
          </view>
          
          <!-- 重要程度 -->
          <view class="form-group">
            <text class="form-label">重要程度</text>
            <view class="importance-selector">
              <view 
                v-for="level in 5" 
                :key="level"
                class="importance-star"
                :class="{ 'active': formData.importance >= level }"
                @tap="setImportance(level)"
              >
                ★
              </view>
            </view>
          </view>
          
          <!-- 成果描述 -->
          <view class="form-group">
            <text class="form-label">成果描述</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="请描述你的成果详情..."
              maxlength="200"
              auto-height
            ></textarea>
          </view>
          
          <!-- 图片上传 -->
          <view class="form-group">
            <text class="form-label">相关图片</text>
            <view class="image-upload-container">
              <view 
                v-for="(image, index) in formData.images" 
                
                :key="index"
                class="uploaded-image"
              >
                <image :src=" 'https://uvpddncsycmr.sealoshzh.site'+image" mode="aspectFill" class="preview-image"></image>
                <view class="remove-image" @tap="removeImage(index)">×</view>
              </view>
              <view class="upload-btn" @tap="chooseImage" v-if="formData.images.length < 3">
                <text class="upload-text">+</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- 表单按钮 -->
        <view class="form-actions">
          <view class="form-btn cancel" @tap="hideForm">取消</view>
          <view class="form-btn submit" @tap="submitForm">{{ isEditing ? '保存' : '添加' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getUserInfo, 
  getAchievements, 
  addAchievement, 
  updateAchievement, 
  deleteAchievement, 
  getAchievementStats,
  uploadAchievementImage 
} from '@/api/index';

export default {
  data() {
    return {
      // 用户信息
      userInfo: {},
      
      // 统计数据
      stats: {
        totalAchievements: 0,
        totalAwards: 0,
        totalCertificates: 0
      },
      
      // 个人标签
      personalTags: [],
      
      // 分类数据
      categories: [
        { key: '', name: '全部', icon: '/static/icons/all.png' },
        { key: 'academic', name: '学术成就', icon: '/static/icons/academic.png' },
        { key: 'certificate', name: '技能证书', icon: '/static/icons/certificate.png' },
        { key: 'award', name: '获奖荣誉', icon: '/static/icons/award.png' },
        { key: 'experience', name: '实践经历', icon: '/static/icons/experience.png' },
        { key: 'work', name: '作品demo', icon: '/static/icons/work.png' }
      ],
      
      // 当前分类
      currentCategory: '',
      
      // 成果数据
      achievements: [],
      loading: false,
      
      // 表单相关
      showForm: false,
      isEditing: false,
      editingId: null,
      formData: {
        title: '',
        category: '',
        description: '',
        achievedDate: '',
        organization: '',
        importance: 3,
        images: [],
        tags: []
      },
      categoryIndex: 0
    }
  },
  
  //过滤成就列表 
  computed: {
    filteredAchievements() {
      if (!this.currentCategory) {
        return this.achievements;
      }
      return this.achievements.filter(item => item.category === this.currentCategory);
    },
    
    categoryOptions() {
      return this.categories.filter(cat => cat.key !== '');
    }
  },
  
  onLoad() {
    this.loadUserInfo();
    this.loadAchievements();
    this.loadStats();
  },
  
  methods: {
    goBack(){
      uni.navigateBack();
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        const userInfo = await getUserInfo();
        this.userInfo = userInfo;
        
        // 提取个人标签
        this.extractPersonalTags(userInfo);
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },
    
    // 提取个人标签
    extractPersonalTags(userInfo) {
      const tags = [];
      if (userInfo.major) tags.push(userInfo.major);
      if (userInfo.grade) tags.push(userInfo.grade);
      if (userInfo.organization) tags.push(userInfo.organization);
      this.personalTags = tags;
    },
    
    // 加载成果数据
    async loadAchievements() {
      this.loading = true;
      try {
        const achievements = await getAchievements(this.currentCategory);
        this.achievements = achievements || [];
      } catch (error) {
        console.error('加载成果失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载统计数据
    async loadStats() {
      try {
        const stats = await getAchievementStats();
        this.stats = stats || this.stats;
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    },
    
    // 切换分类
    switchCategory(category) {
      this.currentCategory = category;
      this.loadAchievements();
    },
    
    // 获取当前分类名称
    getCurrentCategoryName() {
      const category = this.categories.find(cat => cat.key === this.currentCategory);
      return category ? category.name : '成果';
    },
    
    // 获取分类名称
    getCategoryName(key) {
      const category = this.categories.find(cat => cat.key === key);
      return category ? category.name : '';
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    },
    
    // 显示添加表单
    showAddForm() {
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
      this.showForm = true;
    },
    
    // 编辑成果
    editAchievement(achievement) {
      this.isEditing = true;
      this.editingId = achievement.id;
      this.formData = {
        title: achievement.title,
        category: achievement.category,
        description: achievement.description,
        achievedDate: achievement.achievedDate,
        organization: achievement.organization,
        importance: achievement.importance,
        images: [...(achievement.images || [])],
        tags: [...(achievement.tags || [])]
      };
      
      // 设置分类索引
      this.categoryIndex = this.categoryOptions.findIndex(cat => cat.key === achievement.category);
      if (this.categoryIndex === -1) this.categoryIndex = 0;
      
      this.showForm = true;
    },
    
    // 删除成果
    deleteAchievement(achievement) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${achievement.title}"吗？`,
        confirmColor: '#FF5252',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteAchievement(achievement.id);
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.loadAchievements();
              this.loadStats();
            } catch (error) {
              console.error('删除失败:', error);
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 查看成果详情
    viewAchievement(achievement) {
      // 这里可以跳转到详情页或显示详情弹窗
      console.log('查看成果详情:', achievement);
    },
    
    // 隐藏表单
    hideForm() {
      this.showForm = false;
      this.resetForm();
    },
    
    // 处理表单容器点击
    handleFormClick() {
      // 阻止事件冒泡，但不做其他处理
    },
    
    // 重置表单
    resetForm() {
      this.formData = {
        title: '',
        category: '',
        description: '',
        achievedDate: '',
        organization: '',
        importance: 3,
        images: [],
        tags: []
      };
      this.categoryIndex = 0;
    },
    
    // 分类选择
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.formData.category = this.categoryOptions[this.categoryIndex].key;
    },
    
    // 日期选择
    onDateChange(e) {
      this.formData.achievedDate = e.detail.value;
    },
    
    // 设置重要程度
    setImportance(level) {
      this.formData.importance = level;
    },
    
    
    // 选择图片
    chooseImage() {
      const maxCount = 3 - this.formData.images.length;
      if (maxCount <= 0) {
        uni.showToast({
          title: '最多只能上传3张图片',
          icon: 'none'
        });
        return;
      }

      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          // 显示上传进度提示
          uni.showLoading({
            title: '上传图片中...',
            mask: true
          });

          try {
            // 并发上传所有选择的图片
            const uploadPromises = res.tempFilePaths.map(filePath => 
              uploadAchievementImage(filePath)
            );
            
            const uploadResults = await Promise.all(uploadPromises);
            
            // 将上传成功的URL添加到表单数据中
            this.formData.images = this.formData.images.concat(uploadResults);
            
            uni.hideLoading();
            uni.showToast({
              title: `成功上传${uploadResults.length}张图片`,
              icon: 'success',
              duration: 1500
            });
            
            console.log('上传结果：', uploadResults);
            console.log('当前图片列表：', this.formData.images);
            
          } catch (error) {
            uni.hideLoading();
            console.error('图片上传失败:', error);
            uni.showToast({
              title: error.message || '图片上传失败，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 移除图片
    removeImage(index) {
      this.formData.images.splice(index, 1);
    },
    
    // 提交表单
    async submitForm() {
      // 表单验证
      if (!this.formData.title.trim()) {
        uni.showToast({
          title: '请输入成果标题',
          icon: 'none'
        });
        return;
      }
      
      if (!this.formData.category) {
        uni.showToast({
          title: '请选择成果分类',
          icon: 'none'
        });
        return;
      }
      
      try {
        if (this.isEditing) {
          await updateAchievement(this.editingId, this.formData);
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          await addAchievement(this.formData);
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }
        
        this.hideForm();
        this.loadAchievements();
        this.loadStats();
      } catch (error) {
        console.error('提交失败:', error);
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
.achievement-container {
  min-height: 100vh;
  z-index: 1;
  background: linear-gradient(135deg, #97a8f4 0%, #87e3f8 100%);
  padding-bottom: 120rpx;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(to right, #050ce7, #04f9e5);
  color: white;
  position: relative;
  z-index: 10;
}
/* 顶部个人概览区 */
.header-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  margin: 20rpx;
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}
.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: bold;
}
.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.user-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 成就统计 */
.stats-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

/* 个人标签云 */
.tags-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag-item {
  background: linear-gradient(45deg, #ff9a9e, #fecfef);
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 25rpx;
  font-size: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(255, 154, 158, 0.3);
}

.tag-item.tag-1 {
  background: linear-gradient(45deg, #a8edea, #fed6e3);
}

.tag-item.tag-2 {
  background: linear-gradient(45deg, #ffecd2, #fcb69f);
}

.tag-item.tag-3 {
  background: linear-gradient(45deg, #d299c2, #fef9d7);
}

/* 分类筛选器 */
.filter-section {
  margin: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-item {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 25rpx;
  padding: 20rpx 30rpx;
  margin-right: 20rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.filter-item.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.filter-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
  margin: 0 auto 10rpx;
}

.filter-text {
  font-size: 24rpx;
  color: white;
  display: block;
}

.filter-item.active .filter-text {
  color: #333;
}

/* 成果展示区域 */
.achievements-section {
  margin: 20rpx;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top: 4rpx solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 28rpx;
}

/* 空状态 */
.empty-container {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 30rpx;
  opacity: 0.6;
}

.empty-text {
  color: white;
  font-size: 28rpx;
  margin-bottom: 40rpx;
  display: block;
}

.empty-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  padding: 20rpx 40rpx;
  display: inline-block;
}

.empty-btn-text {
  color: white;
  font-size: 28rpx;
}

/* 成果列表 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 25rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.achievement-card:active {
  transform: scale(0.98);
}

/* 重要程度指示器 */
.importance-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 8rpx;
  height: 100%;
  z-index: 2;
}

.importance-indicator.level-1 {
  background: #e0e0e0;
}

.importance-indicator.level-2 {
  background: #ffeb3b;
}

.importance-indicator.level-3 {
  background: #ff9800;
}

.importance-indicator.level-4 {
  background: #f44336;
}

.importance-indicator.level-5 {
  background: #9c27b0;
}

/* 成果图片 */
.achievement-image {
  height: 200rpx;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
}

/* 成果内容 */
.achievement-content {
  padding: 30rpx;
  padding-left: 40rpx;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.achievement-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.achievement-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 30rpx;
  height: 30rpx;
}

.achievement-org {
  font-size: 26rpx;
  color: #667eea;
  margin-bottom: 10rpx;
  display: block;
}

.achievement-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15rpx;
  display: block;
}

.achievement-date {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

/* 成果标签 */
.achievement-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.achievement-tag {
  background: #f5f5f5;
  color: #666;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.achievement-tag.more {
  background: #667eea;
  color: white;
}

/* 浮动添加按钮 */
.fab-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  z-index: 100;
}

.fab-button {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.fab-button:active {
  transform: scale(0.9);
}

.fab-icon {
  color: white;
  font-size: 60rpx;
  font-weight: 300;
}

/* 表单弹窗 */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.form-container {
  background: white;
  border-radius: 30rpx;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1000;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  border-bottom: 1px solid #f0f0f0;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.form-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
}

.form-content {
  flex: 1;
  padding: 0 40rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 60vh;
}

.form-group {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.form-input, .form-textarea {
  width: 100%;
  background: #f8f9fa;
  border: 2rpx solid transparent;
  border-radius: 15rpx;
  padding: 25rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  pointer-events: auto;
  touch-action: auto;
}

.form-input:focus, .form-textarea:focus {
  border-color: #667eea;
  background: white;
}

.form-textarea {
  min-height: 120rpx;
  resize: none;
}

.picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 重要程度选择器 */
.importance-selector {
  display: flex;
  gap: 10rpx;
}

.importance-star {
  font-size: 40rpx;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.importance-star.active {
  color: #ffd700;
}

/* 标签预览 */
.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 15rpx;
}

.tag-preview {
  background: #667eea;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

/* 图片上传 */
.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.uploaded-image {
  position: relative;
  width: 150rpx;
  height: 150rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 15rpx;
}

.remove-image {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff5252;
  color: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.upload-btn {
  width: 150rpx;
  height: 150rpx;
  background: #f8f9fa;
  border: 2rpx dashed #ddd;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 60rpx;
  color: #999;
}

/* 表单按钮 */
.form-actions {
  display: flex;
  gap: 20rpx;
  padding: 40rpx;
  border-top: 1px solid #f0f0f0;
}

.form-btn {
  flex: 1;
  text-align: center;
  padding: 25rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
}

.form-btn.cancel {
  background: #f8f9fa;
  color: #666;
}

.form-btn.submit {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

/* Picker 组件优化 */
picker {
  position: relative;
  z-index: 1001;
}

/* Input 组件优化 */
input {
  position: relative;
  z-index: auto !important;
}

.form-input {
  display: block;
  appearance: none;
  -webkit-appearance: none;
}
</style>
