<template>
  <view class="container">
    <!-- 顶部用户信息区 -->
    <view class="header">
      <view class="user-info">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || '/static/cat.png'" 
          mode="aspectFill"
        ></image>
        <view class="user-details">
        <text class="user-name">{{ userInfo.nickname || '加载中...' }}</text>
        <text class="user-desc">{{ userInfo.organization || '暂无描述信息' }}</text>
        <text class="user-desc">{{userInfo.description || '暂无描述信息' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能区域 -->
    <view class="section-title-bar">
      <text class="section-title">我的</text>
    </view>
    
    <!-- 功能图标区 -->
    <view class="feature-grid">
      <view class="feature-item" @tap="navigateTo('/pages/profile/look_at_me')">
        <view class="feature-icon-wrapper org-life">
          <image class="feature-icon" src="/static/icons/growth.png" mode="aspectFit"></image>
        </view>
        <text class="feature-text">看看我自己</text>
      </view>
      <view class="feature-item" @tap="navigateTo('/pages/organization/resources')">
        <view class="feature-icon-wrapper org-resources">
          <image class="feature-icon" src="/static/icons/resources.png" mode="aspectFit"></image>
        </view>
        <text class="feature-text">团课资源</text>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="navigateTo('/pages/profile/edit_information')">
        <image class="menu-icon" src="/static/icons/my-org.png" mode="aspectFit"></image>
        <text class="menu-text">账号信息</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @tap="navigateTo('/pages/profile/personal_info')">
        <image class="menu-icon" src="/static/icons/scan.png" mode="aspectFit"></image>
        <text class="menu-text">个人情况</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @tap="navigateTo('/pages/profile/change_password')">
        <image class="menu-icon" src="/static/icons/password.png" mode="aspectFit"></image>
        <text class="menu-text">修改密码</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @tap="navigateTo('/pages/settings/default-org')">
        <image class="menu-icon" src="/static/icons/default-org.png" mode="aspectFit"></image>
        <text class="menu-text">个人成果管理</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @tap="navigateTo('/pages/settings/security')">
        <image class="menu-icon" src="/static/icons/security.png" mode="aspectFit"></image>
        <text class="menu-text">安全中心</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-button" @tap="logout">
      <text>退出登录</text>
    </view>
    
    <!-- 使用TabBar组件 -->
    <tab-bar active="profile"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar.vue'
import  {getUserInfo}  from '../api/index';

export default {
  components: {
    TabBar
  },
  data() {
    return {
      // 2. 初始化用户信息数据结构
      userInfo: {
        userId: '',
        username: '加载中...',
        nickname: 'anonymous',
        avatar: '/static/avatars/default.png', // 默认头像
        description: '', // 用户描述
        organization: '' // 所属组织
      }
    }
    
  },

  onShow() {
    this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
       try {
        const UserData = {
          username: this.username,
        };
        
        // 调用封装的 API 函数 /api/getUserInfo
        const resData = await getUserInfo(UserData);
        this.userInfo = {
          userId: resData.userId,
          username: resData.username,
          avatar: resData.avatar,
          description: resData.description,
          organization: resData.organization,
          nickname: resData.nickname
        };
      } catch (error) {
        console.error('获取当前用户信息失败：', error);
      }
    },
    navigateTo(url) {
      // 页面跳转
      uni.navigateTo({
        url: url
      });
    },

    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login'
              });
            }, 1500);
          }
        }
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
  padding-bottom: 120rpx;
}

/* 顶部用户信息区 */
.header {
  padding: 40rpx 30rpx;
  background: linear-gradient(to right, #e0f7fa, #b3e5fc);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.user-details {
  margin-left: 30rpx;
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 功能区标题 */
.section-title-bar {
  padding: 30rpx;
  background-color: #fff;
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 20rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 32rpx;
  background-color: #4CAF50;
  border-radius: 4rpx;
}

/* 功能图标区 */
.feature-grid {
  display: flex;
  background-color: #fff;
  padding: 20rpx 30rpx 40rpx;
}

.feature-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
}

.org-life {
  background-color: #ffecb3;
}

.org-resources {
  background-color: #bbdefb;
}

.feature-icon {
  width: 60rpx;
  height: 60rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #333;
}

/* 功能列表 */
.menu-list {
  margin-top: 20rpx;
  background-color: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #999;
}

/* 退出登录按钮 */
.logout-button {
  margin: 40rpx 20rpx;
  background-color: #fff;
  height: 90rpx;
  border-radius: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30rpx;
  color: #ff5252;
}



/* 点击效果 */
.feature-item:active, .menu-item:active, .logout-button:active, .tab-item:active {
  opacity: 0.7;
  transform: scale(0.98);
}
</style>