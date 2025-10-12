<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <text class="title">修改密码</text>
        <text class="subtitle">请设置您的新密码以保护账户安全</text>
      </view>
      
      <view class="form">
        <view class="input-group">
          <text class="icon">🔑</text>
          <input class="input" type="password" v-model="oldPassword" placeholder="请输入旧密码" />
        </view>
        
        <view class="input-group">
          <text class="icon">🔒</text>
          <input class="input" type="password" v-model="newPassword" placeholder="请输入新密码（至少6位）" />
        </view>
        
        <view class="input-group">
          <text class="icon">🔐</text>
          <input class="input" type="password" v-model="confirmPassword" placeholder="请再次确认新密码" />
        </view>
        
        <button 
          class="submit-btn" 
          @tap="submitChangePassword"
          :disabled="isLoading"
        >
          {{ isLoading ? '提交中...' : '确 认 修 改' }}
        </button>
      </view>
      
      <view class="back-link" @tap="uni.navigateBack()">
        <text>返回上一页</text>
      </view>
      
    </view>
  </view>
</template>

<script>
import { changePassword } from '@/api/index'; 

export default {
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      isLoading: false
    }
  },
  methods: {
    showToast(message, icon = 'none') {
      uni.showToast({
        title: message,
        icon: icon
      });
    },

    // 提交修改密码请求
    async submitChangePassword() {
      // 1. 前端校验
      if (this.isLoading) return;
      
      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        this.showToast('请完整填写所有密码项');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showToast('两次输入的新密码不一致');
        return;
      }
      if (this.newPassword.length < 6) {
        this.showToast('新密码长度必须至少为6位');
        return;
      }
      
      this.isLoading = true;
      uni.showLoading({ title: '提交中' });

      try {
        const data = {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword,
        };
        
        // 2. 调用修改密码 API
        await changePassword(data); 

        uni.hideLoading();
        this.showToast('密码修改成功，请重新登录！', 'success');

        // 3. 修改成功后，清除 Token 并跳转到登录页
        uni.removeStorageSync('token');
        setTimeout(() => {
          uni.reLaunch({ // 使用 reLaunch 确保登录页成为新的根页面
            url: '/pages/login' 
          });
        }, 1500);
        
      } catch (error) {
        uni.hideLoading();
        // 假设 request.js 会抛出包含后端错误信息的对象
        console.error('修改密码请求错误:', error);
        this.showToast(error.message || '密码修改失败'); 
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #b3e5fc 100%);
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px 25px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
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
  margin-bottom: 20px;
}

.icon {
  margin-right: 12px;
  font-size: 20px;
  color: #4A90E2;
}

.input {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.submit-btn {
  height: 48px;
  line-height: 48px;
  background: linear-gradient(to right, #4A90E2, #5DADE2);
  color: white;
  border-radius: 24px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.4);
  margin-top: 15px;
}

.submit-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.back-link {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #4A90E2;
  cursor: pointer;
}
</style>