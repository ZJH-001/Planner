<template>
  <view class="container">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">发布树洞</text>
      <view class="header-right" @tap="publishPost">
        <text 
          class="publish-text"
          :class="{ 'disabled': isLoading }"
        >
          {{ isLoading ? '发布中...' : '发布' }}
        </text>
      </view>
    </view>
    
    <view class="edit-container">
      <view class="input-group title-group">
        <input 
          class="title-input" 
          v-model="postData.title" 
          placeholder="请输入标题（选填）" 
          maxlength="50"
        />
        <text class="char-count">{{postData.title.length}}/50</text>
      </view>
      
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
      
      <view class="image-upload-area">
        <view class="image-list">
          <view class="image-item" v-for="(image, index) in postData.images" :key="index">
            <image class="uploaded-image" :src="image" mode="aspectFill" @tap="previewImage(index)"></image>
            <view class="delete-btn" @tap.stop="deleteImage(index)">×</view>
          </view>
          
          <view class="add-image-btn" @tap="chooseImage" v-if="postData.images.length < 9">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
      
    </view>
    
    <view class="topic-selector">
      <text class="selector-title">选择话题</text>
      <scroll-view class="topic-categories" scroll-x="true" show-scrollbar="false">
        <view 
          v-for="topic in categories" 
          :key="topic.value" 
          class="topic-tag"
          :class="{ 'active': postData.topic === topic.value }"
          @tap="selectTopic(topic.value)"
        >
          {{ topic.label }}
        </view>
      </scroll-view>
    </view>
    
    <view class="options-area">
      <label class="option-item">
        <text class="option-text">匿名发布</text>
        <switch :checked="postData.isAnonymous" color="#a1887f" @change="postData.isAnonymous = $event.detail.value" />
      </label>
    </view>
  </view>
</template>

<script>
// 假设你在 @/api/index.js 中封装了以下接口
// publishTreePost: POST /api/trees/posts
// uploadFile: 文件上传接口，返回图片URL
import { publishPost, uploadFile} from '@/api/index'; 

export default {
  data() {
    return {
      postData: {
        title: '',
        content: '',
        images: [], // 存储本地临时路径或已上传的URL
        topic: '生活', // 默认选中 '生活'
        isAnonymous: false,
      },
      categories: [
        { label: '热门', value: '热门' },
        { label: '学习', value: '学习' },
        { label: '情感', value: '情感' },
        { label: '生活', value: '生活' },
        { label: '职业', value: '职业' },
        { label: '吐槽', value: '吐槽' },
      ],
      isLoading: false, // 发布按钮加载状态
    }
  },
  methods: {
    showToast(message, icon = 'none') {
      uni.showToast({ title: message, icon: icon });
    },
    
    goBack() {
      uni.switchTab({
        url: '/pages/trees'
      });
    },

    selectTopic(topicValue) {
      this.postData.topic = topicValue;
    },

    chooseImage() {
      const maxCount = 9 - this.postData.images.length;
      if (maxCount <= 0) return;

      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.postData.images = this.postData.images.concat(res.tempFilePaths);
        }
      });
    },

    deleteImage(index) {
      this.postData.images.splice(index, 1);
    },
    
    previewImage(index) {
        uni.previewImage({
            urls: this.postData.images,
            current: this.postData.images[index]
        });
    },

    // 核心逻辑：图片上传+文字上传
    async publishPost() {
      if (this.isLoading) return;

      // 1. 前端验证
      if (!this.postData.content.trim()) {
        this.showToast('帖子内容不能为空');
        return;
      }
      if (!this.postData.topic) {
        this.showToast('请选择一个话题');
        return;
      }

      this.isLoading = true;
      uni.showLoading({ title: '准备发布...', mask: true });
      
      let serverImageUrls = [];
      
      try {
        // 2. 先上传图片
        if (this.postData.images.length > 0) {
          uni.showLoading({ title: '上传图片...', mask: true });
          
          // 并发上传所有图片，将本地路径转换为服务器URL
          const uploadPromises = this.postData.images.map(localPath => 
            uploadFile(localPath)
          );
          
          
          const uploadResults = await Promise.all(uploadPromises);
         
            serverImageUrls=uploadResults;
          
         

          console.log('上传结果：', uploadResults);
          console.log('服务器返回的上传图片url', serverImageUrls);
          console.log('前端获取的图片数量', this.postData.images.length);
          if (uploadResults.length !== this.postData.images.length) {
              throw new Error('部分图片上传失败');
          }
        }
        
        // 3. 构建发布数据
        uni.showLoading({ title: '提交帖子...', mask: true });
        const postPayload = {
          title: this.postData.title.trim(),
          content: this.postData.content.trim(),
          topic: this.postData.topic,
          images: serverImageUrls, // 提交服务器返回的图片 URL 数组
          isAnonymous: this.postData.isAnonymous,
        };
        console.log('发布数据：', postPayload);
        // 4. 再调用发布接口
        await publishPost(postPayload);

        uni.hideLoading();
        this.showToast('发布成功！', 'success');
        
        // 5. 发布成功后返回树洞列表页
        setTimeout(() => {
          uni.navigateTo({
        url: '/pages/trees'
      });
        }, 1000);

      } catch (error) {
        uni.hideLoading();
        console.error('发布失败:', error);
        this.showToast(error.message || '发布失败，请重试');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 样式基础：沿用树洞风格 */
.container {
  min-height: 100vh;
  background-color: #f7f7f7;
}

/* 顶部标题栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-left, .header-right {
  width: 100rpx;
  text-align: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.header-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #3e2723;
}

.publish-text {
  font-size: 30rpx;
  color: #a1887f; /* 主题色 */
  font-weight: bold;
}

.publish-text.disabled {
  color: #ccc;
}

/* 编辑区 */
.edit-container {
  background-color: #fff;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
}

.input-group {
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.title-input {
  font-size: 34rpx;
  font-weight: bold;
  padding: 10rpx 0;
}

.content-group {
  border-bottom: none;
}

.content-input {
  width: 100%;
  min-height: 200rpx; /* 确保初始高度 */
  font-size: 30rpx;
  padding: 20rpx 0;
  line-height: 1.6;
}

.char-count {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 24rpx;
  color: #999;
}

/* 图片上传区 */
.image-upload-area {
  padding: 20rpx 0;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
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
  z-index: 5;
}

.add-image-btn {
  width: 200rpx;
  height: 200rpx;
  background-color: #f0f0f0;
  border: 2rpx dashed #ccc;
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
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 20rpx;
}

.selector-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #3e2723;
  margin-bottom: 15rpx;
  display: block;
}

.topic-categories {
  white-space: nowrap;
}

.topic-tag {
  display: inline-block;
  padding: 10rpx 25rpx;
  margin-right: 20rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #795548;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-tag.active {
  background-color: #a1887f; /* 主题色 */
  color: #fff;
  font-weight: bold;
}

/* 附加选项区 */
.options-area {
  background-color: #ffffff;
  padding: 0 30rpx;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-text {
  font-size: 30rpx;
  color: #333;
}
</style>