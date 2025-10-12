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
      <view class="nav-item" @tap="navigateTo('/pages/task/task')">
        <image class="nav-icon" src="/static/icons/task.png" mode="aspectFit"></image>
        <text class="nav-text">任务</text>
        <view class="badge">NEW</view>
      </view>
      <view class="nav-item" @tap="navigateTo('/pages/explore/explore')">
        <image class="nav-icon" src="/static/icons/explore.png" mode="aspectFit"></image>
        <text class="nav-text">探索</text>
      </view>
      <view class="nav-item" @tap="navigateTo('/pages/search/search')">
        <image class="nav-icon" src="/static/icons/search.png" mode="aspectFit"></image>
        <text class="nav-text">搜索</text>
      </view>
    </view>
    
    <!-- 轮播广告区 -->
    <view class="banner-section">
      <swiper class="banner-swiper" circular autoplay interval="3000" indicator-dots indicator-active-color="#ffffff">
        <swiper-item>
          <view class="banner-item">
            <image class="banner-image" src="/static/banner/banner1.jpg" mode="aspectFill"></image>
            <view class="banner-content">
              <text class="banner-title">邀请好友玩森林派对</text>
              <text class="banner-subtitle">免费获永久限定装扮</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="swiper-dots">
        <view class="dot active"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>
    
    <!-- 在线好友区 -->
    <view class="friends-section">
      <view class="section-header">
        <text class="section-title">在线好友</text>
        <text class="section-more" @tap="navigateTo('/pages/friends/friends')">更多 ></text>
      </view>
      <scroll-view class="friends-scroll" scroll-x="true" show-scrollbar="false">
        <view class="friend-item" v-for="(friend, index) in friends" :key="index" @tap="chatWithFriend(friend)">
          <image class="friend-avatar" :src="friend.avatar" mode="aspectFill"></image>
          <text class="friend-name">{{friend.name}}</text>
          <text class="friend-status">{{friend.status}}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 游戏区域 -->
    <view class="games-section">
      <view class="game-card large" @tap="startGame('神族之战')">
        <view class="game-info">
          <text class="game-title">神族之战</text>
          <text class="game-mode">单兵制</text>
          <text class="game-players">6,10,11人</text>
        </view>
        <image class="game-icon" src="/static/games/game1.png" mode="aspectFit"></image>
      </view>
      
      <view class="games-row">
        <view class="game-card small" @tap="startGame('元素之战')">
          <view class="game-info">
            <text class="game-title">元素之战</text>
            <text class="game-mode">双兵制</text>
            <text class="game-players">10人</text>
          </view>
          <image class="game-icon small" src="/static/games/game2.png" mode="aspectFit"></image>
        </view>
        
        <view class="game-card small yellow" @tap="navigateTo('/pages/friends/party')">
          <view class="game-info">
            <text class="game-title">森友会</text>
            <text class="game-desc">比赛、民乐</text>
          </view>
          <image class="game-icon small" src="/static/games/party.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>
    
    <!-- 其他玩法区域 -->
    <view class="other-section">
      <view class="section-header">
        <text class="section-title">找他玩</text>
      </view>
      <view class="forest-voice" @tap="navigateTo('/pages/voice/voice')">
        <image class="voice-icon" src="/static/icons/voice.png" mode="aspectFit"></image>
        <text class="voice-title">森林之声</text>
        <text class="voice-arrow">></text>
      </view>
      <view class="voice-messages">
        <view class="voice-message" v-for="(msg, index) in voiceMessages" :key="index">
          <image class="message-avatar" :src="msg.avatar" mode="aspectFill"></image>
          <text class="message-content">{{msg.content}}</text>
        </view>
      </view>
    </view>
    

    <!-- 使用TabBar组件 -->
    <tab-bar active="home"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar.vue'

export default {
  components: {
    TabBar
  },
  data() {
    return {
      friends: [
        { name: '这很烟评', avatar: '/static/avatars/avatar1.png', status: '在线' },
        { name: '大型机!', avatar: '/static/avatars/avatar2.png', status: '在线' },
        { name: '猫羊羊不群', avatar: '/static/avatars/avatar3.png', status: '在线' },
        { name: '露露', avatar: '/static/avatars/avatar4.png', status: '在线' },
        { name: '刘浩', avatar: '/static/avatars/avatar5.png', status: '在线' }
      ],
      voiceMessages: [
        { avatar: '/static/avatars/avatar6.png', content: 'Y.007: Y.007邀请你一起森林派对' },
        { avatar: '/static/avatars/avatar6.png', content: 'Y.007: Y.007邀请你一起森林派对' }
      ]
    }
  },
  methods: {
    navigateTo(url) {
      // 页面跳转
      uni.navigateTo({
        url: url
      });
    },
    chatWithFriend(friend) {
      // 与好友聊天
      uni.navigateTo({
        url: `/pages/chat/chat?name=${friend.name}`
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
}

.banner-swiper {
  height: 300rpx;
}

.banner-item {
  position: relative;
  height: 100%;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-content {
  position: absolute;
  left: 40rpx;
  bottom: 40rpx;
  color: white;
}

.banner-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.banner-subtitle {
  font-size: 24rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.swiper-dots {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 8rpx;
}

.dot.active {
  background-color: #ffffff;
}

/* 在线好友区 */
.friends-section {
  margin: 0 20rpx 20rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 24rpx;
  color: #999;
}

.friends-scroll {
  white-space: nowrap;
}

.friend-item {
  display: inline-block;
  margin-right: 30rpx;
  text-align: center;
}

.friend-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-bottom: 10rpx;
}

.friend-name {
  font-size: 24rpx;
  color: #333;
  display: block;
}

.friend-status {
  font-size: 20rpx;
  color: #999;
  display: block;
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
  right: 20rpx;
  bottom: 20rpx;
}

.game-icon.small {
  width: 100rpx;
  height: 100rpx;
}

/* 其他玩法区域 */
.other-section {
  margin: 0 20rpx 120rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.forest-voice {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.voice-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  background-color: #e0f7fa;
  border-radius: 50%;
  padding: 10rpx;
}

.voice-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.voice-arrow {
  font-size: 28rpx;
  color: #999;
}

.voice-messages {
  padding: 20rpx 0;
}

.voice-message {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.message-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.message-content {
  font-size: 24rpx;
  color: #666;
}



/* 点击效果 */
.nav-item:active, .game-card:active, .friend-item:active, .forest-voice:active, .tab-item:active {
  opacity: 0.7;
  transform: scale(0.98);
}
</style>
