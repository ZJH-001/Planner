<template>
  <view class="post-detail-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">帖子详情</text>
      <view class="header-right"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 帖子详情 -->
    <scroll-view v-else-if="postDetail" class="detail-content" scroll-y="true">
      <!-- 作者信息 -->
      <view class="author-section">
        <image 
          class="author-avatar" 
          :src="postDetail.userAvatar || '/static/cat.png'" 
          mode="aspectFill"
        ></image>
        <view class="author-info">
          <text class="author-name">{{ postDetail.userName || '匿名用户' }}</text>
          <text class="post-time">{{ formatTime(postDetail.time) }}</text>
        </view>
        <view class="topic-badge"># {{ postDetail.topic }}</view>
      </view>

      <!-- 帖子标题 -->
      <view class="post-title-section" v-if="postDetail.title">
        <text>标题：</text>
        <text class="post-title">{{ postDetail.title }}</text>
      </view>

      <!-- 帖子内容 -->
      <view class="post-content-section">
        <text>正文：</text>
        <text class="post-content">{{ postDetail.content }}</text>
      </view>

      <!-- 帖子图片 -->
      <view class="post-images-section" v-if="postDetail.images && postDetail.images.length > 0">
        <view 
          class="image-grid"
          :class="'grid-count-' + Math.min(postDetail.images.length, 3)"
        >
          <image
            v-for="(img, index) in postDetail.images"
            :key="index"
            class="post-image"
            :src="'https://uvpddncsycmr.sealoshzh.site' + img"
            mode="widthFix"
            @tap="previewImage(index)"
          ></image>
        </view>
      </view>

      <!-- 互动统计 -->
      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-number">{{ postDetail.likes || 0 }}</text>
          <text class="stat-label">点赞</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ postDetail.disLikes || 0 }}</text>
          <text class="stat-label">踩</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ postDetail.views || 0 }}</text>
          <text class="stat-label">浏览</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部互动栏 -->
    <view class="action-bar">
      <!-- 评论输入框 -->
      <view class="comment-input-wrapper" @tap="focusCommentInput">
       <text>给出你的评价吧~</text>
      </view>

      <!-- 互动按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="toggleLike">
          <image 
            class="action-icon" 
            :src="postDetail.isLiked ? '/static/icons/liked.png' : '/static/icons/like.png'" 
            mode="aspectFit"
          ></image>
          <text class="action-text" :class="{ 'active': postDetail.isLiked }">
            {{ postDetail.likes || 0 }}
          </text>
        </view>

        <view class="action-btn" @tap="toggleDislike">
            <image 
            class="action-icon" 
            :src="postDetail.isDisliked ? '/static/icons/disliked.png' : '/static/icons/dislike.png'" 
            mode="aspectFit"
          ></image>
          <text class="action-text" :class="{ 'active': postDetail.isDisliked }">{{ postDetail.disLikes || 0 }}</text>
        </view>

        <view class="action-btn">
          <image 
            class="action-icon" 
            :src="'/static/icons/view.png'" 
            mode="aspectFit"
          ></image>
          <text class="action-text">
            {{ postDetail.views || 0 }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getPostDetail, 
  likePost, 
  disLikePost, 
} from '@/api/index';

export default {
  data() {
    return {
      postId: '',
      postDetail: null,
      loading: true,
    }
  },
//options就是trees调用的url中的?id=${id}中的id
  onLoad(options) {
    if (options.id) {
      this.postId = options.id;
      this.loadPostDetail();
    } else {
      uni.showToast({
        title: '帖子ID缺失',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },

  methods: {
    // 加载帖子详情
    async loadPostDetail() {
      this.loading = true;
      try {
        const detail = await getPostDetail(this.postId);
        this.postDetail = detail;
      } catch (error) {
        console.error('加载帖子详情失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    
    // 点赞/取消点赞
    async toggleLike() {
      if (!this.postDetail) return;

      const originalLiked = this.postDetail.isLiked;
      const originalDisliked = this.postDetail.isDisliked;
      const originalLikeCount = this.postDetail.likes || 0;
      const originalDislikeCount = this.postDetail.disLikes || 0;

      try {
        // 情况1: 之前点了踩，现在要点赞 (需要先取消踩，再点赞)
        if (originalDisliked) {
          console.log('操作：取消踩 -> 点赞');
          // 先调用后端取消踩
          await disLikePost(this.postId);
          // 再调用后端点赞
          await likePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isDisliked = false;
          this.postDetail.disLikes = originalDislikeCount > 0 ? originalDislikeCount - 1 : 0;
          this.postDetail.isLiked = true;
          this.postDetail.likes = originalLikeCount + 1;
          
          uni.showToast({
            title: '已点赞',
            icon: 'success',
            duration: 1000
          });
        }
        // 情况2: 之前点了赞，现在要取消赞
        else if (originalLiked) {
          console.log('操作：取消点赞');
          // 调用后端取消点赞
          await likePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isLiked = false;
          this.postDetail.likes = originalLikeCount > 0 ? originalLikeCount - 1 : 0;
          
          uni.showToast({
            title: '已取消点赞',
            icon: 'success',
            duration: 1000
          });
        }
        // 情况3: 之前没有任何操作，现在要点赞
        else {
          console.log('操作：点赞');
          // 调用后端点赞
          await likePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isLiked = true;
          this.postDetail.likes = originalLikeCount + 1;
          
          uni.showToast({
            title: '已点赞',
            icon: 'success',
            duration: 1000
          });
        }
        
      } catch (error) {
        // 失败时回滚所有状态
        this.postDetail.isLiked = originalLiked;
        this.postDetail.likes = originalLikeCount;
        this.postDetail.isDisliked = originalDisliked;
        this.postDetail.disLikes = originalDislikeCount;
        
        console.error('点赞操作失败:', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },

    // 踩/取消踩
    async toggleDislike() {
      if (!this.postDetail) return;

      const originalLiked = this.postDetail.isLiked;
      const originalDisliked = this.postDetail.isDisliked;
      const originalLikeCount = this.postDetail.likes || 0;
      const originalDislikeCount = this.postDetail.disLikes || 0;

      try {
        // 情况1: 之前点了赞，现在要点踩 (需要先取消赞，再点踩)
        if (originalLiked) {
          console.log('操作：取消赞 -> 点踩');
          // 先调用后端取消点赞
          await likePost(this.postId);
          // 再调用后端点踩
          await disLikePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isLiked = false;
          this.postDetail.likes = originalLikeCount > 0 ? originalLikeCount - 1 : 0;
          this.postDetail.isDisliked = true;
          this.postDetail.disLikes = originalDislikeCount + 1;
          
          uni.showToast({
            title: '已踩',
            icon: 'success',
            duration: 1000
          });
        }
        // 情况2: 之前点了踩，现在要取消踩
        else if (originalDisliked) {
          console.log('操作：取消踩');
          // 调用后端取消点踩
          await disLikePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isDisliked = false;
          this.postDetail.disLikes = originalDislikeCount > 0 ? originalDislikeCount - 1 : 0;
          
          uni.showToast({
            title: '已取消踩',
            icon: 'success',
            duration: 1000
          });
        }
        // 情况3: 之前没有任何操作，现在要点踩
        else {
          console.log('操作：点踩');
          // 调用后端点踩
          await disLikePost(this.postId);
          
          // 更新前端状态
          this.postDetail.isDisliked = true;
          this.postDetail.disLikes = originalDislikeCount + 1;
          
          uni.showToast({
            title: '已踩',
            icon: 'success',
            duration: 1000
          });
        }
        
      } catch (error) {
        // 失败时回滚所有状态
        this.postDetail.isLiked = originalLiked;
        this.postDetail.likes = originalLikeCount;
        this.postDetail.isDisliked = originalDisliked;
        this.postDetail.disLikes = originalDislikeCount;
        
        console.error('点踩操作失败:', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },


    // 预览图片
    previewImage(index) {
      if (!this.postDetail || !this.postDetail.images) return;
      
      const images = this.postDetail.images.map(img => 
        'https://uvpddncsycmr.sealoshzh.site' + img
      );
      
      uni.previewImage({
        current: index,
        urls: images
      });
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const time = new Date(timeStr);
      const now = new Date();
      const diff = now - time;

      // 1分钟内
      if (diff < 60000) {
        return '刚刚';
      }
      
      // 1小时内
      if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      }
      
      // 24小时内
      if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      }
      
      // 7天内
      if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`;
      }
      
      // 超过7天，显示日期
      const year = time.getFullYear();
      const month = (time.getMonth() + 1).toString().padStart(2, '0');
      const day = time.getDate().toString().padStart(2, '0');
      
      if (year === now.getFullYear()) {
        return `${month}-${day}`;
      }
      
      return `${year}-${month}-${day}`;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style>
.post-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  font-weight: bold;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
}

.header-right {
  width: 60rpx;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 200rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(76, 175, 80, 0.3);
  border-top: 4rpx solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

/* 详情内容 */
.detail-content {
  height: calc(100vh - 160rpx);
}

/* 作者信息 */
.author-section {
  background: white;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.topic-badge {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

/* 帖子标题 */
.post-title-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.post-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}

/* 帖子内容 */
.post-content-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.post-content {
  font-size: 30rpx;
  color: #666;
  line-height: 1.8;
  word-break: break-all;
}

/* 帖子图片 */
.post-images-section {
  background: white;
  height:100%;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.image-grid {
  display: grid;
  gap: 10rpx;
}

.image-grid.grid-count-1 {
  grid-template-columns: 1fr;
}

.image-grid.grid-count-2 {
  grid-template-columns: repeat(2, 1fr);
}

.image-grid.grid-count-3 {
  grid-template-columns: repeat(3, 1fr);
}

.post-image {
  width: 100%;
  height: 200rpx;
  border-radius: 10rpx;
}

/* 互动统计 */
.stats-section {
  background: white;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #4CAF50;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

/* 评论区域 */
.comments-section {
  background: white;
  padding: 30rpx;
}

.comments-header {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.comments-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.comment-item {
  display: flex;
  align-items: flex-start;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.comment-content-wrapper {
  flex: 1;
}

.comment-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.comment-user-name {
  font-size: 26rpx;
  color: #666;
  margin-right: 20rpx;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 15rpx;
}

/* 回复列表 */
.reply-list {
  background: #f8f9fa;
  padding: 15rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

.reply-item {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10rpx;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user, .reply-target {
  color: #4CAF50;
}

.reply-separator {
  margin: 0 8rpx;
}

/* 空评论状态 */
.empty-comments {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 30rpx;
  opacity: 0.4;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部占位 */
.bottom-space {
  height: 40rpx;
}

/* 底部互动栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.comment-input-wrapper {
  flex: 1;
  margin-right: 20rpx;
}

.comment-input {
  background: #f5f7fa;
  border-radius: 30rpx;
  padding: 15rpx 25rpx;
  font-size: 28rpx;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.action-icon {
  width: 44rpx;
  height: 44rpx;
}

.action-text {
  font-size: 22rpx;
  color: #999;
}

.action-text.active {
  color: #4CAF50;
}
</style>

