<template>
  <view class="container">
    <view class="login-section">
      <view class="login-card">
        <view class="header">
          <image class="logo" src="/static/Weilailiu_logo.png"></image>
          <text class="title">重置密码</text>
          <text class="subtitle">通过手机验证重设您的密码</text>
        </view>
        
        <view class="form">
          
          <view class="input-group">
            <text class="icon">📱</text>
            <input class="input" type="number" v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
          </view>
          
          <view class="input-group verification-group">
            <text class="icon">✉️</text>
            <input class="input" type="text" v-model="form.verificationCode" placeholder="请输入验证码" maxlength="6" />
            <button 
              class="code-btn" 
              :disabled="isSendingCode || !isPhoneValid" 
              @tap="getVerificationCode"
            >
              {{ codeButtonText }}
            </button>
          </view>
          
          <view class="input-group">
            <text class="icon">🔒</text>
            <input class="input" type="password" v-model="form.newPassword" placeholder="请输入新密码" />
          </view>

          <view class="input-group">
            <text class="icon">🔒</text>
            <input class="input" type="password" v-model="form.confirmPassword" placeholder="请再次输入新密码" />
          </view>
          
          <button class="login-btn" :disabled="isSubmitting" @tap="resetPassword">
            {{ isSubmitting ? '重置中...' : '确 认 重 置' }}
          </button>
          
          <view class="register-link">
            <text class="register-text">想起密码了？</text>
            <text class="register-btn" @tap="goToLogin">返回登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 引入 API 接口（假设已在 @/api/index.js 中定义）
import { forgetPassword } from '@/api/index'; 

export default {
  data() {
    return {
      form: {
        phone: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '' // 用于前端校验
      },
      isSubmitting: false, // 提交状态
      isSendingCode: false, // 验证码发送中状态
      countdown: 60, // 倒计时秒数
      codeButtonText: '获取验证码',
      timer: null
    };
  },
  
  computed: {
    // 简单校验手机号格式
    isPhoneValid() {
      // 匹配中国大陆手机号
      return /^1[3-9]\d{9}$/.test(this.form.phone);
    }
  },

  methods: {
    // ------------------------------------
    // 1. 获取验证码逻辑 (模拟，你需要对接真实的发送验证码接口)
    // ------------------------------------
    getVerificationCode() {
      if (!this.isPhoneValid) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
      
      // 假设有一个发送验证码的接口 /api/auth/send-sms
      // await request({ url: '/api/auth/send-sms', method: 'POST', data: { phone: this.form.phone } });
      uni.showToast({ title: '验证码发送成功', icon: 'success' });
      
      this.isSendingCode = true;
      this.countdown = 60;
      this.codeButtonText = `重新发送(${this.countdown}s)`;

      this.timer = setInterval(() => {
        this.countdown--;
        this.codeButtonText = `重新发送(${this.countdown}s)`;
        
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.isSendingCode = false;
          this.codeButtonText = '重新获取';
        }
      }, 1000);
    },
    
    // ------------------------------------
    // 2. 重置密码逻辑 (对接 /api/auth/forget-password)
    // ------------------------------------
    async resetPassword() {
      const { phone, verificationCode, newPassword, confirmPassword } = this.form;
      
      // 前端基本校验
      if (!this.isPhoneValid) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
      }
      if (!verificationCode || verificationCode.length !== 6) {
        uni.showToast({ title: '请输入6位验证码', icon: 'none' });
        return;
      }
      if (newPassword.length < 6) {
        uni.showToast({ title: '密码长度至少6位', icon: 'none' });
        return;
      }
      if (newPassword !== confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' });
        return;
      }

      this.isSubmitting = true;
      uni.showLoading({ title: '重置中' });
      
      try {
        const resetData = { phone, verificationCode, newPassword };
        
        // 调用后端接口 /api/auth/forget-password
        await forgetPassword(resetData);
        
        uni.hideLoading();
        uni.showToast({ title: '密码重置成功，请重新登录', icon: 'success' });
        
        // 成功后跳转回登录页面
        setTimeout(() => {
          this.goToLogin(); 
        }, 1500);
        
      } catch (error) {
        // 错误处理在 request.js 中已统一封装
        uni.hideLoading();
        console.error('重置密码失败:', error);
      } finally {
        this.isSubmitting = false;
      }
    },

    // ------------------------------------
    // 3. 导航逻辑
    // ------------------------------------
    goToLogin() {
      // 返回上一页或直接跳转到登录页
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.redirectTo({ url: '/pages/auth/login' });
        }
      });
    }
  },
  
  // 销毁组件时清除计时器
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style scoped>
/* 继承自登录页的样式，确保风格统一 */
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #b3e5fc 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}
/* 渐变背景气泡效果 */
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

/* 验证码组特定样式 */
.verification-group {
  justify-content: space-between;
}

.code-btn {
  /* 按钮基础样式，保持与登录按钮的圆角一致，但颜色区分 */
  height: 35px;
  line-height: 35px;
  width: 100px; /* 固定宽度 */
  background-color: #5DADE2;
  color: white;
  border-radius: 17.5px;
  font-size: 13px;
  margin-left: 10px;
  padding: 0 5px;
}

.code-btn[disabled] {
  background-color: #cccccc;
  color: #999999;
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
  margin-top: 10px; /* 稍微增加间距 */
}

.login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 返回登录链接样式 */
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