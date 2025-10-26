<template>
  <!-- 底部导航栏 -->
  <view class="tab-bar">
    <view class="tab-item" :class="{ active: active === 'home' }" @tap="switchTab('home')">
      <image class="tab-icon" src="/static/icons/home.png" mode="aspectFit"></image>
      <text class="tab-text">首页</text>
    </view>
    <view class="tab-item" :class="{ active: active === 'world' }" @tap="switchTab('world')">
      <image class="tab-icon" src="/static/icons/plan.png" mode="aspectFit"></image>
      <text class="tab-text">规划</text>
    </view>
    
    <view class="tab-item" :class="{ active: active === 'message' }" @tap="switchTab('message')">
      <image class="tab-icon" src="/static/icons/tree.png" mode="aspectFit"></image>
      <text class="tab-text">树洞</text>
    </view>
    <view class="tab-item" :class="{ active: active === 'profile' }" @tap="switchTab('profile')">
      <image class="tab-icon" src="/static/icons/user.png" mode="aspectFit"></image>
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  methods: {
    switchTab(tabName) {
      // 如果点击当前已激活的标签页，不做任何操作
      if (tabName === this.active) return;
      
      // 根据点击的标签页进行跳转
      switch(tabName) {
        case 'home':
          // uni.redirectTo({
          uni.switchTab({
            url: '/pages/index'
          });
          break;
        case 'profile':
          // uni.redirectTo({
          uni.switchTab({
            url: '/pages/profile'
          });
          break;
        case 'message':
          // uni.redirectTo({
          uni.switchTab({
            url: '/pages/trees'
          });
          break;
        case 'world':
          uni.navigateTo({
            url: '/pages/world'
          });
          break;
        default:
          uni.showToast({
            title: `切换到${tabName}标签页`,
            icon: 'none'
          });
          break;
      }
    }
  }
}
</script>

<style>
/* 底部导航栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 6rpx;
}

.tab-text {
  font-size: 20rpx;
  color: #999;
}

.tab-item.active .tab-text {
  color: #4CAF50;
}

/* 点击效果 */
.tab-item:active {
  opacity: 0.7;
  transform: scale(0.98);
}
</style>