<template>
  <view class="container">
    <!-- 登录部分 -->
    <view class="login-section">
      <view class="login-card">
        <view class="header">
          <image class="logo" src="/static/Weilailiu_logo.png"></image>
          <text class="title">欢迎登录</text>
          <text class="subtitle">请输入您的账号和密码</text>
        </view>
        
        <view class="form">
          <view class="input-group">
            <text class="icon">👤</text>
            <input class="input" type="text" v-model="username" placeholder="请输入用户名" />
          </view>
          
          <view class="input-group">
            <text class="icon">🔒</text>
            <input class="input" type="password" v-model="password" placeholder="请输入密码" />
          </view>
          
          <view class="options">
            <label class="remember">
              <checkbox :checked="rememberMe" @tap="rememberMe = !rememberMe" />
              <text>记住密码</text>
            </label>
            <text class="forget" @tap="forgetPassword">忘记密码?</text>
          </view>
          
          <button class="login-btn" @tap="login">登 录</button>
          
          <!-- 添加注册跳转 -->
          <view class="register-link">
            <text class="register-text">还没有账号？</text>
            <text class="register-btn" @tap="goToRegister">立即注册</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false
    }
  },
  methods: {
    login() {
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
      // 实际项目中这里会有登录逻辑
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/index'
        });
      }, 1500);
    },
    forgetPassword() {
      uni.showToast({
        title: '忘记密码功能',
        icon: 'none'
      });
    },
    // 添加跳转到注册页面的方法
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register'
      });
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #b3e5fc 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.container::before {
  content: "";
  position: absolute;
  top: -10%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  opacity: 0.6;
}

.container::after {
  content: "";
  position: absolute;
  bottom: -5%;
  left: -5%;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(178,235,242,0.8) 0%, rgba(178,235,242,0) 70%);
  z-index: 0;
  opacity: 0.6;
}

/* 登录部分样式 */
.login-section {
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  width: 120px;
  height: 80px;
  margin-bottom: 15px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #999;
}

.form {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  margin-bottom: 15px;
}

.icon {
  margin-right: 10px;
  font-size: 20px;
  color: #999;
}

.input {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.forget {
  font-size: 14px;
  color: #4A90E2;
}

.login-btn {
  height: 45px;
  line-height: 45px;
  background: linear-gradient(to right, #4A90E2, #5DADE2);
  color: white;
  border-radius: 22.5px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
}

.login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 添加注册链接样式 */
.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.register-text {
  font-size: 14px;
  color: #666;
}

.register-btn {
  font-size: 14px;
  color: #4A90E2;
  font-weight: bold;
  margin-left: 5px;
}

.register-btn:active {
  opacity: 0.8;
}

</style>