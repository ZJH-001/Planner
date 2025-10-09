<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">发布树洞</text>
      <view class="header-right" @tap="publishPost">
        <text class="publish-text">发布</text>
      </view>
    </view>
    
    <!-- 内容编辑区 -->
    <view class="edit-container">
      <!-- 标题输入 -->
      <view class="input-group">
        <input 
          class="title-input" 
          v-model="postData.title" 
          placeholder="请输入标题（选填）" 
          maxlength="50"
        />
        <text class="char-count">{{postData.title.length}}/50</text>
      </view>
      
      <!-- 内容输入 -->
      <view class="input-group content-group">
        <textarea 
          class="content-input" 
          v-model="postData.content" 
          placeholder="分享你的想法..." 
          maxlength="2000"
          auto-height
        />
        <text class="char-count">{{postData.content.length}}/2000</text>
      </view>
      
      <!-- 图片上传区 -->
      <view class="image-upload-area">
        <view 
          class="image-item" 
          v-for="(image, index) in postData.images" 
          :key="index"
        >
          <image 
            class="uploaded-image" 
            :src="image" 
            mode="aspectFill"
            @tap="previewImage(index)"
          ></image>
          <view class="delete-icon" @tap.stop="deleteImage(index)">×</view>
        </view>
        
        <!-- 添加图片按钮 -->
        <view 
          class="add-image-btn" 
          @tap="chooseImage" 
          v-if="postData.images.length < 9"
        >
          <text class="add-icon">+</text>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>
    
    <!-- 话题选择区 -->
    <view class="topic-selector">
      <view class="topic-header">
        <text class="topic-title">选择话题</text>
        <text class="topic-tip">选择合适的话题让更多人看到</text>
      </view>
      
      <scroll-view class="topic-list" scroll-x="true" show-scrollbar="false">
        <view 
          class="topic-tag" 
          :class="{ active: postData.topic === topic }" 
          v-for="(topic, index) in topics" 
          :key="index"
          @tap="selectTopic(topic)"
        >
          {{topic}}
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      postData: {
        title: '',
        content: '',
        images: [],
        topic: '学习'
      },
      topics: ['学习', '情感', '生活', '职业', '吐槽', '求助', '分享']
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    publishPost() {
      // 验证内容不能为空
      if (!this.postData.content.trim()) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 显示发布中的加载提示
      uni.showLoading({
        title: '发布中...'
      });
      
      // 模拟发布请求
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        });
        
        // 发布成功后返回树洞主页
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/trees'
          });
        }, 1500);
      }, 2000);
    },
    chooseImage() {
      // 选择图片
      uni.chooseImage({
        count: 9 - this.postData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 将选择的图片添加到图片数组
          this.postData.images = [...this.postData.images, ...res.tempFilePaths];
        }
      });
    },
    deleteImage(index) {
      // 删除指定索引的图片
      this.postData.images.splice(index, 1);
    },
    previewImage(index) {
      // 预览图片
      uni.previewImage({
        urls: this.postData.images,
        current: this.postData.images[index]
      });
    },
    selectTopic(topic) {
      // 选择话题
      this.postData.topic = topic;
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f4f1;
}

/* 顶部标题栏 */
.header {
  padding: 40rpx 30rpx 20rpx;
  background-color: #5d4037;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-right {
  padding: 10rpx 20rpx;
  background-color: #8d6e63;
  border-radius: 30rpx;
}

.publish-text {
  font-size: 28rpx;
  color: #ffffff;
}

/* 内容编辑区 */
.edit-container {
  padding: 30rpx;
  flex: 1;
}

.input-group {
  position: relative;
  margin-bottom: 30rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  color: #3e2723;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.content-group {
  margin-bottom: 20rpx;
}

.content-input {
  width: 100%;
  min-height: 300rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #5d4037;
  line-height: 1.5;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.char-count {
  position: absolute;
  bottom: 10rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #a1887f;
}

/* 图片上传区 */
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30rpx;
}

.image-item {
  width: 200rpx;
  height: 200rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  border-radius: 10rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.delete-icon {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.add-image-btn {
  width: 200rpx;
  height: 200rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.add-icon {
  font-size: 60rpx;
  color: #8d6e63;
  margin-bottom: 10rpx;
  line-height: 1;
}

.add-text {
  font-size: 24rpx;
  color: #8d6e63;
}

/* 话题选择区 */
.topic-selector {
  padding: 20rpx 30rpx 40rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #efebe9;
}

.topic-header {
  margin-bottom: 20rpx;
}

.topic-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #3e2723;
  margin-bottom: 10rpx;
  display: block;
}

.topic-tip {
  font-size: 24rpx;
  color: #a1887f;
}

.topic-list {
  display: flex;
  white-space: nowrap;
}

.topic-tag {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
  color: #5d4037;
  background-color: #efebe9;
  border-radius: 30rpx;
}

.topic-tag.active {
  background-color: #8d6e63;
  color: #ffffff;
}

/* 点击效果 */
.header-left:active,
.header-right:active,
.add-image-btn:active,
.delete-icon:active,
.topic-tag:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>