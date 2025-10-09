<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="logo-text">树洞</text>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <image class="search-icon" src="/static/icons/search.png" mode="aspectFit"></image>
        <input class="search-input" type="text" placeholder="搜索话题或内容" confirm-type="search" />
      </view>
    </view>
    
    <!-- 话题分类 -->
    <scroll-view class="topic-categories" scroll-x="true" show-scrollbar="false">
      <view class="topic-tag active">全部</view>
      <view class="topic-tag">热门</view>
      <view class="topic-tag">学习</view>
      <view class="topic-tag">情感</view>
      <view class="topic-tag">生活</view>
      <view class="topic-tag">职业</view>
      <view class="topic-tag">吐槽</view>
    </scroll-view>
    
    <!-- 内容列表 -->
    <scroll-view class="post-list" scroll-y="true">
      <!-- 帖子项 -->
      <view class="post-item" v-for="(post, index) in posts" :key="index" @tap="viewPostDetail(post.id)">
        <view class="post-header">
          <image class="user-avatar" :src="post.userAvatar" mode="aspectFill"></image>
          <view class="post-user-info">
            <text class="user-name">{{post.userName}}</text>
            <text class="post-time">{{post.time}}</text>
          </view>
        </view>
        
        <view class="post-content">
          <text class="post-title">{{post.title}}</text>
          <text class="post-text">{{post.content}}</text>
          <view class="post-images" v-if="post.images && post.images.length > 0">
            <image 
              v-for="(img, imgIndex) in post.images" 
              :key="imgIndex" 
              :src="img" 
              mode="aspectFill" 
              class="post-image"
              @tap.stop="previewImage(post.images, imgIndex)"
            ></image>
          </view>
        </view>
        
        <view class="post-footer">
          <view class="action-item">
            <image class="action-icon" src="/static/icons/like.png" mode="aspectFit"></image>
            <text class="action-count">{{post.likes}}</text>
          </view>
          <view class="action-item">
            <image class="action-icon" src="/static/icons/comment.png" mode="aspectFit"></image>
            <text class="action-count">{{post.comments}}</text>
          </view>
          <view class="action-item">
            <image class="action-icon" src="/static/icons/collect.png" mode="aspectFit"></image>
            <text class="action-count">{{post.collects}}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 发布按钮 发布界面-->
    <view class="publish-button" @tap="navigateTo('/pages/trees/publish')">
      <image class="publish-icon" src="/static/icons/add.png" mode="aspectFit"></image>
    </view>
    
    <!-- 使用TabBar组件 -->
    <tab-bar active="message"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar.vue'

export default {
  components: {
    TabBar
  },
  data() {
    return {
      posts: [
        {
          id: 1,
          userName: 'CodeCrafter',
          userAvatar: '/static/avatars/avatar1.png',
          time: '10分钟前',
          title: 'C9计算机专硕，本科C9计科，两年后选算法岗还是后端开发岗位？',
          content: '谢谢。 C9本硕，计算机科班，这背景放我刚毕业那会儿，眼睛都不眨一下直接让你ALL IN算法。那时候...',
          likes: 1253,
          comments: 2810,
          collects: 0,
          images: []
        },
        {
          id: 2,
          userName: '风暴中的闲鱼',
          userAvatar: '/static/avatars/avatar2.png',
          time: '2小时前',
          title: '研究生有自己的作业帮，半年发了四篇SCI',
          content: '是谁一年内发了三篇sci呀! 原来是我! 先说明，sci论文难度在那，我能在一年内发sci运气成分很大。当...',
          likes: 740,
          comments: 2792,
          collects: 50,
          images: []
        },
        {
          id: 3,
          userName: '暴起的鸡血战士',
          userAvatar: '/static/avatars/avatar3.png',
          time: '昨天',
          title: '如何评价北航 90 后副教授兼科技治理中心副主任何静？',
          content: '顶级985高校副教授/美女/科研实力并存，还能每天梳理自己的秀发，关键还能给自己纹个小纹身，我的妈...',
          likes: 325,
          comments: 1024,
          collects: 89,
          images: ['/static/posts/post1.jpg']
        }
      ]
    }
  },
  methods: {
    navigateTo(url) {
      // 页面跳转
      uni.navigateTo({
        url: url
      });
    },
    viewPostDetail(id) {
      // 查看帖子详情
      this.navigateTo(`/pages/trees/detail?id=${id}`);
    },
    previewImage(images, current) {
      // 预览图片
      uni.previewImage({
        urls: images,
        current: images[current]
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
  background-color: #f8f4f1;
  padding-bottom: 100rpx;
}

/* 顶部标题栏 */
.header {
  padding: 40rpx 30rpx 20rpx;
  background-color: #5d4037;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background-color: #5d4037;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #ffffff;
}

/* 话题分类 */
.topic-categories {
  display: flex;
  white-space: nowrap;
  padding: 20rpx 0;
  background-color: #8d6e63;
}

.topic-tag {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
}

.topic-tag.active {
  background-color: #3e2723;
  color: #ffffff;
  font-weight: bold;
}

/* 内容列表 */
.post-list {
  flex: 1;
  padding: 20rpx;
}

.post-item {
  background-color: #ffffff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.post-user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #5d4037;
  margin-bottom: 5rpx;
}

.post-time {
  font-size: 24rpx;
  color: #a1887f;
}

.post-content {
  margin-bottom: 20rpx;
}

.post-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #3e2723;
  margin-bottom: 10rpx;
  display: block;
}

.post-text {
  font-size: 28rpx;
  color: #5d4037;
  line-height: 1.5;
  margin-bottom: 15rpx;
  display: block;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
}

.post-image {
  width: 210rpx;
  height: 210rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  border-radius: 8rpx;
}

.post-footer {
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid #efebe9;
  padding-top: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
}

.action-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.action-count {
  font-size: 24rpx;
  color: #8d6e63;
}

/* 发布按钮 */
.publish-button {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #5d4037;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(93, 64, 55, 0.4);
  z-index: 99;
}

.publish-icon {
  width: 50rpx;
  height: 50rpx;
}

/* 点击效果 */
.post-item:active,
.topic-tag:active,
.publish-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>