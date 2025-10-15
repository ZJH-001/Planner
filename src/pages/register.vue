<template>
  <view class="container">
    <view class="register-section">
      <view class="register-card">
        <view class="header">
          <image class="logo" src="/static/Weilailiu_logo.png"></image>
          <text class="title">账号注册</text>
          <text class="subtitle">创建您的新账号</text>
        </view>
        
        <view class="form">
          <view class="input-group">
            <text class="icon">👤</text>
            <input class="input" type="text" v-model="username" placeholder="请输入用户名" />
          </view>
          
          <view class="input-group">
            <text class="icon">📱</text>
            <input class="input" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
          </view>
          
          <view class="input-group">
            <text class="icon">🔒</text>
            <input class="input" type="password" v-model="password" placeholder="请输入密码" />
          </view>
          
          <view class="input-group">
            <text class="icon">🔐</text>
            <input class="input" type="password" v-model="confirmPassword" placeholder="请确认密码" />
          </view>
          
          <view class="agreement">
            <checkbox :checked="agreeTerms" @tap="agreeTerms = !agreeTerms" />
            <text class="agreement-text">我已阅读并同意<text class="link" @tap="showTerms">《用户协议》</text>和<text class="link" @tap="showPrivacy">《隐私政策》</text></text>
          </view>
          
          <button 
            class="register-btn" 
            @tap="register" 
            :disabled="!agreeTerms || isLoading"
          >
            {{ isLoading ? '注册中...' : '注 册' }}
          </button>
          
          <view class="login-link">
            <text class="login-text">已有账号？</text>
            <text class="login-btn" @tap="goToLogin">立即登录</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
// 1. 引入注册 API 函数（确保它在你的 @/api/index.js 中已定义）
import { register } from '@/api/index'; 

export default {
  data() {
    return {
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      isLoading: false // 添加加载状态
    }
  },
  methods: {
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      });
    },
    
    // 2. 实现注册方法，包含 API 交互
    async register() {
      // **前端校验**
      if (this.isLoading) return;

      if (!this.username) {
        this.showToast('请输入用户名');
        return;
      }
      if (!this.phone || !/^1[3-9]\d{9}$/.test(this.phone)) {
        this.showToast('请输入正确的手机号');
        return;
      }
      if (this.password.length < 6) {
        this.showToast('密码长度至少为6位');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.showToast('两次输入的密码不一致');
        return;
      }
      if (!this.agreeTerms) {
        this.showToast('请阅读并同意用户协议和隐私政策');
        return;
      }
      
      this.isLoading = true;
      uni.showLoading({ title: '注册中' });

      try {
        const registerData = {
          username: this.username,
          phone: this.phone,
          password: this.password,
        };
        
        // 3. 调用后端注册接口 /api/auth/register
        await register(registerData); 

        uni.hideLoading();
        uni.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        });

        // 4. 注册成功后跳转回登录页面
        setTimeout(() => {
          this.goToLogin();
        }, 1500);
        
      } catch (error) {
        // API 错误处理（通常在 request.js 中统一处理了）
        uni.hideLoading();
        console.error('注册请求错误:', error);
        // 如果后端返回了具体的错误信息，可以显示：
        // this.showToast(error.message || '注册失败'); 
      } finally {
        this.isLoading = false;
      }
    },
    
    showTerms() {
      this.showToast('查看用户协议');
    },
    showPrivacy() {
      this.showToast('查看隐私政策');
    },
    goToLogin() {
      // 假设登录页面路径为 /pages/auth/login
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.redirectTo({ url: '/pages/auth/login' });
        }
      });
    }
  }
}
</script>

<style>
/* 样式部分保持不变，确保风格统一 */
/* ... (原 register.vue 中的 <style> 内容) ... */

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

/* 注册部分样式 */
.register-section {
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.register-card {
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

.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.agreement-text {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.link {
  color: #4A90E2;
}

.register-btn {
  height: 45px;
  line-height: 45px;
  background: linear-gradient(to right, #4A90E2, #5DADE2);
  color: white;
  border-radius: 22.5px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
}

.register-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.register-btn[disabled] {
  background: linear-gradient(to right, #a0c4e4, #b0d2e8);
  opacity: 0.7;
}

/* 添加登录链接样式 */
.login-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.login-text {
  font-size: 14px;
  color: #666;
}

.login-btn {
  font-size: 14px;
  color: #4A90E2;
  font-weight: bold;
  margin-left: 5px;
}

.login-btn:active {
  opacity: 0.8;
}
</style>