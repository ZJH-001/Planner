<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="logo-text">未来流</text>
      <text class="logo-text">个性化生涯规划平台</text>
    </view>
    
    <!-- 功能导航区 -->
    <view class="nav-section">
      <view class="nav-item" @tap="navigateTo('/pages/activity/activity')">
        <image class="nav-icon" src="/static/logo.png" mode="aspectFit"></image>
        <text class="nav-text">活动</text>
      </view>
      <view class="nav-item" @tap="navigateTo('/pages/world')">
        <image class="nav-icon" src="/static/task.png" mode="aspectFit"></image>
        <text class="nav-text">任务</text>
        <view class="badge">NEW</view>
      </view>
      <view class="nav-item" @tap="navigateTo('/pages/explore/explore')">
        <image class="nav-icon" src="/static/explore.png" mode="aspectFit"></image>
        <text class="nav-text">探索</text>
      </view>
      <view class="nav-item" @tap="navigateTo('/pages/search/search')">
        <image class="nav-icon" src="/static/icons/search.png" mode="aspectFit"></image>
        <text class="nav-text">搜索</text>
      </view>
    </view>
    
    <!-- 轮播广告区 -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper" 
        circular 
        autoplay 
        interval="4000" 
        indicator-dots 
        indicator-active-color="#ffffff"
        indicator-color="rgba(255, 255, 255, 0.5)"
        @change="onBannerChange"
      >
        <swiper-item 
          v-for="(banner, index) in bannerList" 
          :key="banner.id"
          @tap="onBannerClick(banner)"
        >
          <view class="banner-item" :style="{ backgroundColor: banner.backgroundColor }">
            <image 
              class="banner-image" 
              :src="banner.image" 
              mode="aspectFill"
              :lazy-load="true"
              @error="onImageError"
            ></image>
            <view class="banner-content">
              <text class="banner-title">{{ banner.title }}</text>
              <text class="banner-subtitle">{{ banner.subtitle }}</text>
            </view>
            <!-- 渐变遮罩 -->
            <view class="banner-overlay"></view>
          </view>
        </swiper-item>
      </swiper>
    </view>
     <!-- 我的规划区域 -->
     <view class="other-section">
      <view class="section-header">
        <text class="section-title">我的规划</text>
        <text class="section-more" @tap="navigateTo('/pages/world')">更多 ></text>
      </view>
      <view class="planning-list">
        <view class="planning-item" v-for="(planning, index) in recentPlannings" :key="planning.planning_id" @tap="navigateTo('/pages/world')">
          <view class="planning-countdown">
            <text class="countdown-number">{{ getCountdownDays(planning.deadline) }}</text>
            <text class="countdown-unit">天</text>
          </view>
          <view class="planning-info">
            <text class="planning-title">距离{{ planning.title }}还剩</text>
            <text class="planning-date">{{ formatDate(planning.deadline) }}</text>
          </view>
          <text class="planning-arrow">></text>
        </view>
        <view v-if="recentPlannings.length === 0" class="no-planning">
          <text class="no-planning-text">暂无规划，点击添加</text>
          <text class="planning-arrow" @tap="navigateTo('/pages/world')">></text>
        </view>
      </view>
    </view>
    <!-- 霍兰德职业兴趣测评区 -->
    <view class="games-section">
      <view class="games-row">
        <view class="game-card small" @tap="navigateTo('/pages/holland')">
          <view class="game-info">
            <text class="game-title">霍兰德职业兴趣测评</text>
            <text class="game-mode">专业测评 发现潜能</text>
            <text class="game-players">点击开始-></text>
          </view>
          <image class="game-icon small" src="/static/icons/test.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>
    
    <!-- 游戏区域 -->
    <view class="games-section">     
      <view class="games-row">
        <view class="game-card small" @tap="navigateTo('/pages/ai_chat')">
          <view class="game-info">
            <text class="game-title">AI规划建议</text>
            <text class="game-mode">一对一 私人定制</text>
            <text class="game-players">点击开始-></text>
          </view>
          <image class="game-icon small" src="/static/icons/ai.png" mode="aspectFit"></image>
        </view>
        
        <view class="game-card small " @tap="navigateTo('/pages/profile/look_at_me')">
          <view class="game-info">
            <text class="game-title">我的成果</text>
            <text class="game-desc">比赛 荣誉 称号...</text>
            <text class="game-players">记录点滴成长-></text>
          </view>
          <image class="game-icon small" src="/static/icons/growth.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>
    

    <!-- 使用TabBar组件 -->
    <tab-bar active="home"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar.vue'
import { getPlannings } from '@/api/index.js'

export default {
  components: {
    TabBar
  },
  data() {
    return {
      // 轮播图数据
      bannerList: [
        {
          id: 1,
          image: '/static/cd/todo.png',
          title: 'TODO计划表',
          subtitle: '你的未来，由你掌控',
          link: '/pages/world',
          backgroundColor: '#4CAF50'
        },
        {
          id: 2,
          image: '/static/cd/ai.png',
          title: 'AI生涯规划助手',
          subtitle: '个性化定制你的未来',
          link: '/pages/ai_chat',
          backgroundColor: '#2196F3'
        },
        {
          id: 3,
          image: '/static/cd/planner.png',
          title: '探索职业发展路径',
          subtitle: '发现更多可能性',
          link: '/pages/holland',
          backgroundColor: '#FF9800'
        }
      ],
      currentBannerIndex: 0, // 当前轮播索引
      

      voiceMessages: [
        { avatar: '/static/avatars/avatar6.png', content: 'Y.007: Y.007邀请你一起森林派对' },
        { avatar: '/static/avatars/avatar6.png', content: 'Y.007: Y.007邀请你一起森林派对' }
      ],
      recentPlannings: [] // 最近的规划数据
    }
  },
  onLoad() {
    this.loadPlannings();
  },
  onShow() {
    // 每次显示页面时重新加载数据，确保数据同步
    this.loadPlannings();
  },
  methods: {
    // 轮播图变化事件
    onBannerChange(e) {
      this.currentBannerIndex = e.detail.current;
      console.log('轮播图切换到:', this.currentBannerIndex);
    },
    
    // 轮播图点击事件
    onBannerClick(banner) {
      console.log('点击轮播图:', banner);
      
      if (banner.link) {
        // 检查是否为外部链接
        if (banner.link.startsWith('http')) {
          // 外部链接，复制到剪贴板或在浏览器中打开
          uni.setClipboardData({
            data: banner.link,
            success: () => {
              uni.showToast({
                title: '链接已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        } else {
          // 内部页面跳转
          this.navigateTo(banner.link);
        }
      } else {
        // 没有链接时显示提示
        uni.showToast({
          title: banner.title,
          icon: 'none'
        });
      }
    },
    
    // 图片加载失败处理
    onImageError(e) {
      console.error('轮播图片加载失败:', e);
      // 可以设置默认图片或显示错误提示
    },
    
    navigateTo(url) {
      // 页面跳转
      uni.navigateTo({
        url: url,
        fail: (err) => {
          console.error('页面跳转失败:', err);
          uni.showToast({
            title: '页面暂未开放',
            icon: 'none'
          });
        }
      });
    },
    

    
    startGame(gameName) {
      // 开始游戏
      uni.showToast({
        title: `正在进入${gameName}`,
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/game/game?name=${gameName}`
        });
      }, 1000);
    },

    // 加载规划数据
    async loadPlannings() {
      try {
        const response = await getPlannings();
        if (response && response.plannings) {
          // 按截止时间排序，获取最近的3个规划
          const sortedPlannings = response.plannings
            .filter(planning => planning.deadline) // 过滤掉没有截止时间的规划
            .sort((a, b) => {
              const now = new Date().getTime();
              const deadlineA = new Date(a.deadline).getTime();
              const deadlineB = new Date(b.deadline).getTime();
              const diffA = Math.abs(deadlineA - now);
              const diffB = Math.abs(deadlineB - now);
              return diffA - diffB;
            })
            .slice(0, 3); // 取前3个
          
          this.recentPlannings = sortedPlannings;
        }
      } catch (error) {
        console.error('加载规划数据失败:', error);
      }
    },

    // 获取倒计时天数
    getCountdownDays(deadline) {
      if (!deadline) return "0";
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - now;
      
      if (diffTime <= 0) {
        return "已截止";
      }
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    },

    // 格式化日期
    formatDate(deadline) {
      if (!deadline) return "";
      const date = new Date(deadline);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 跳转到规划页面
    goToWorld() {
      uni.navigateTo({
        url: '/pages/world'
      });
    }
  }
}
</script>

<style>
/* 全局样式 */
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 顶部标题栏 */
.header {
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(to right, #e0f7fa, #b3e5fc);
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

/* 功能导航区 */
.nav-section {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.nav-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.nav-text {
  font-size: 24rpx;
  color: #333;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #ff5252;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
}

/* 轮播广告区 */
.banner-section {
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.banner-swiper {
  height: 320rpx;
}

.banner-item {
  position: relative;
  height: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.banner-item:active {
  transform: scale(0.98);
}

.banner-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}

.banner-content {
  position: absolute;
  left: 40rpx;
  bottom: 40rpx;
  right: 40rpx;
  color: white;
  z-index: 2;
}

.banner-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  line-height: 1.3;
}

.banner-subtitle {
  font-size: 26rpx;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.3);
}



/* 游戏区域 */
.games-section {
  margin: 0 20rpx 20rpx;
}

.game-card {
  background-color: #8c9eff;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  position: relative;
  overflow: hidden;
}

.game-card.large {
  height: 180rpx;
}

.game-card.small {
  height: 150rpx;
  flex: 1;
}

.game-card.yellow {
  background-color: #ffeb3b;
}

.games-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.game-info {
  z-index: 1;
}

.game-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 10rpx;
}

.game-mode, .game-players, .game-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.game-icon {
  width: 120rpx;
  height: 120rpx;
  position: absolute;
  right: 15rpx;
  bottom: 40rpx;
}

.game-icon.small {
  width: 100rpx;
  height: 100rpx;
}

/* 其他玩法区域 */
.other-section {
  margin: 0 20rpx 20rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.planning-list {
  padding: 20rpx 0;
}

.planning-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.planning-item:last-child {
  border-bottom: none;
}

.planning-item:active {
  background-color: #f5f5f5;
}

.planning-countdown {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-right: 30rpx;
  min-width: 120rpx;
  text-align: right;
}

.countdown-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.countdown-unit {
  font-size: 24rpx;
  color: #667eea;
  margin-left: 4rpx;
  margin-bottom: 4rpx;
}

.planning-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.planning-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.planning-date {
  font-size: 24rpx;
  color: #999;
}

.planning-arrow {
  font-size: 28rpx;
  color: #999;
  margin-left: 20rpx;
}

.no-planning {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 20rpx;
  text-align: center;
}

.no-planning-text {
  font-size: 28rpx;
  color: #999;
  flex: 1;
}



/* 点击效果 */
.nav-item:active, .game-card:active, .planning-item:active, .tab-item:active {
  opacity: 0.7;
  transform: scale(0.98);
}
</style>
