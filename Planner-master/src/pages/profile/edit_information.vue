<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <text class="title">修改个人信息</text>
        <text class="subtitle">更新您的个人档案和联系方式</text>
      </view>
      
      <view class="form">
        <view class="avatar-group">
          <text class="label">头像</text>
          <view class="avatar-wrapper" @tap="chooseAvatar">
            <image 
              class="user-avatar" 
              :src="formData.avatar || '/static/cat.png'" 
              mode="aspectFill"
            ></image>
            <view class="avatar-hint">{{ isUploading ? '上传中...' : '点击修改' }}</view>
          </view>
        </view>
        
        <view class="input-group">
          <text class="icon">👤</text>
          <input class="input" type="text" v-model="formData.username" placeholder="请输入用户名" disabled/>
        </view>
        <view class="input-group">
          <text class="icon"></text>
          <input class="input" type="text" v-model="formData.nickname" placeholder="请输入昵称" />
        </view>
        <view class="input-group">
          <text class="icon">📱</text>
          <input class="input" type="number" v-model="formData.phone" placeholder="请输入手机号" maxlength="11" disabled/>
        </view>

        <view class="input-group">
          <text class="icon">🏢</text>
          <input class="input" type="text" v-model="formData.organization" placeholder="请输入所属组织" />
        </view>
        
        <view class="textarea-group">
          <text class="label">个人描述</text>
          <textarea 
            class="textarea" 
            v-model="formData.description" 
            placeholder="填写您的个人简介或座右铭" 
            maxlength="200"
          ></textarea>
        </view>

        
        <button 
          class="submit-btn" 
          @tap="submitForm"
          :disabled="isLoading || isUploading"
        >
          {{ isLoading ? '保存中...' : '保 存 修 改' }}
        </button>
        
        <view class="back-link" @tap="uni.navigateBack()">
          <text>返回</text>
        </view>
        
      </view>
    </view>
  </view>
</template>

<script>
// 假设你在 @/api/index.js 中封装了以下接口
import { getUserInfo, updateUserInfo, uploadFile } from '@/api/index'; 

export default {
  data() {
    return {
      formData: {
        username: '',
        phone: '',
        description: '',
        organization: '',
        avatar: '', // 存储头像URL
      },
      isLoading: false,    // 表单提交状态
      isUploading: false,  // 头像上传状态
    }
  },
  onShow() {
    this.fetchUserInfo();
  },
  methods: {
    showToast(message, icon = 'none') {
      uni.showToast({ title: message, icon: icon });
    },

    // 1. 获取当前用户信息，填充表单
    async fetchUserInfo() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        uni.showLoading({ title: '加载中' });
        const resData = await getUserInfo(); 
        
        // 填充表单数据，确保字段一致性
        this.formData = {
          username: resData.username || '',
          phone: resData.phone || '',
          description: resData.description || '',
          organization: resData.organization || '',
          avatar: resData.avatar || '',
          nickname: resData.nickname || '',
        };
        
      } catch (error) {
        console.error('获取信息失败:', error);
        this.showToast('获取信息失败');
      } finally {
        uni.hideLoading();
        this.isLoading = false;
      }
    },

    // 2. 选择头像并上传
    chooseAvatar() {
      if (this.isUploading) return;
      
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.isUploading = true;
          uni.showLoading({ title: '上传头像' });
          
          try {
            // 假设 uploadFile 接口接收文件路径并返回新的图片 URL
            const uploadRes = await uploadFile(tempFilePath); 
            
            // 假设后端返回的是 { data: { url: '新的头像URL' } }
            this.formData.avatar = uploadRes.url; 
            this.showToast('头像上传成功', 'success');
            
          } catch (error) {
            console.error('头像上传失败:', error);
            this.showToast('头像上传失败');
          } finally {
            uni.hideLoading();
            this.isUploading = false;
          }
        }
      });
    },

    // 3. 提交表单
    async submitForm() {
      if (this.isLoading || this.isUploading) return;
      
      // 简单前端验证
      if (!this.formData.username) {
        this.showToast('用户名不能为空');
        return;
      }
      if (this.formData.phone && !/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        this.showToast('请输入正确的手机号');
        return;
      }
      
      this.isLoading = true;
      uni.showLoading({ title: '保存中' });

      try {
        // 假设 PUT /api/user/info 接口用于更新用户信息
        await updateUserInfo(this.formData); 

        uni.hideLoading();
        this.showToast('个人信息更新成功', 'success');

        // 成功后返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        
      } catch (error) {
        uni.hideLoading();
        console.error('信息更新失败:', error);
        this.showToast(error.message || '信息更新失败'); 
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 使用与 login/register/profile 相似的卡片和渐变背景样式 */
.container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 顶部对齐 */
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #b3e5fc 100%);
  padding: 30rpx 20rpx;
}

.card {
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30rpx 25rpx;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 5rpx;
}

.form {
  display: flex;
  flex-direction: column;
}

/* 通用输入框样式 */
.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 24rpx 0;
  margin-bottom: 15rpx;
}

.icon {
  margin-right: 20rpx;
  font-size: 32rpx;
  color: #4A90E2;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

/* 头像组样式 */
.avatar-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.label {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid #4A90E2;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
}

.avatar-hint {
  font-size: 24rpx;
  color: #4A90E2;
  margin-top: 10rpx;
}

/* 描述文本框样式 */
.textarea-group {
  margin-bottom: 30rpx;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
}

.textarea {
  width: 100%;
  height: 150rpx;
  margin-top: 15rpx;
  padding: 15rpx;
  box-sizing: border-box;
  background-color: #f7f7f7;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

/* 提交按钮样式 */
.submit-btn {
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(to right, #4A90E2, #5DADE2);
  color: white;
  border-radius: 45rpx;
  font-size: 34rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 15rpx rgba(74, 144, 226, 0.4);
  margin-top: 20rpx;
}

.submit-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.submit-btn[disabled] {
  background: linear-gradient(to right, #a0c4e4, #b0d2e8);
  opacity: 0.7;
}

.back-link {
  text-align: center;
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>