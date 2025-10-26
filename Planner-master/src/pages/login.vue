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
            <text class="forget" @tap="goToForgetPassword">忘记密码?</text>
          </view>
          
          <button class="login-btn" @tap="login">
             {{ isLoading ? '登录中...' : '登 录' }}
            </button>
          
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
// 1. 引入登录 API 函数
import { login } from '@/api/index'; 

export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      isLoading: false // 添加加载状态，防止重复点击
    }
  },
  methods: {
    // 2. 登录方法（已根据后端 API 逻辑重写）
    async login() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请填写账号和密码',
          icon: 'none'
        });
        return;
      }
      
      this.isLoading = true;
      uni.showLoading({ title: '登录中' });

      try {
        const loginData = {
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe 
        };
        
        // 调用封装的 API 函数 /api/auth/login
        const resData = await login(loginData);

        // 后端响应数据结构示例: { token: "...", userId: "...", ... }
        
        // 3. 存储认证令牌 (Token) - 用于后续请求
        uni.setStorageSync('token', resData.token);
        
        // 4. 存储用户信息 (或根据需要存储关键信息)
        uni.setStorageSync('if_finish_questionnaire', resData.if_finish_questionnaire);
        uni.setStorageSync('userId', resData.userId);
        uni.setStorageSync('username', resData.username);
        
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 5. 跳转到主页 (使用 switchTab 或 redirectTo)
        // 假设主页是 TabBar 页面
        if (resData.if_finish_questionnaire) {
        uni.switchTab({
          url: '/pages/index'
        });
      } else {
        uni.navigateTo({
          url: '/pages/questionnaire'
        })
      }
      } catch (error) {
        // request.js 中通常已处理错误提示，这里确保关闭 loading
        uni.hideLoading();
        this.isLoading = false;
        
        // 如果 request.js 没有处理，则在这里处理
        // uni.showToast({ title: error.message || '登录失败', icon: 'error' });
        console.error('登录请求错误:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 6. 忘记密码跳转
    goToForgetPassword() {
      // 假设你的忘记密码页面路径为 /pages/auth/forget-password
      uni.navigateTo({
        url: '/pages/forget_password'
      });
    },
    
    // 7. 注册跳转
    goToRegister() {
      // 假设你的注册页面路径为 /pages/auth/register
      uni.navigateTo({
        url: '/pages/register'
      });
    }
  }
  // 样式（<style>）部分保持不变
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