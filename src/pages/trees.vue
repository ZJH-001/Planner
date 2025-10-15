
<template>
  <view class="container">
    <view class="header">
      <text class="logo-text">树洞</text>
    </view>
    
    <view class="search-bar">
      <view class="search-input-wrapper">
        <image class="search-icon" src="/static/icons/search.png" mode="aspectFit"></image>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword"
          placeholder="搜索话题或内容" 
          confirm-type="search" 
          @confirm="searchPosts"
        />
        
      </view>
    </view>
    
    <scroll-view class="topic-categories" scroll-x="true" show-scrollbar="false">
      <view 
        v-for="topic in categories" 
        :key="topic.value" 
        class="topic-tag"
        :class="{ 'active': currentTopic === topic.value }"
        @tap="selectTopic(topic.value)"
      >
        {{ topic.label }}
      </view>
    </scroll-view>
    
    <scroll-view 
      class="post-list" 
      scroll-y="true" 
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="post-item" v-for="(post, index) in posts" :key="post.id || index" @tap="viewPostDetail(post.id)">
        <view class="post-header">
          <image class="user-avatar" :src="post.userAvatar || '/static/avatars/default.png'" mode="aspectFill"></image>
          <view class="user-details">
            <text class="user-name">{{ post.userName || '匿名用户' }}</text>
            <text class="post-time">{{ formatTime(post.time) }}</text>
          </view>
          <view class="topic-label"># {{ post.topic }}</view>
        </view>
        
        <view class="post-content">
          <text class="post-title">{{ post.title }}</text>
          <text class="post-text">{{ post.content }}</text>
          <view class="post-images" v-if="post.images && post.images.length">
            <image 
              v-for="(img, imgIndex) in post.images" 
              :key="imgIndex"  
              class="post-image"  
              :src="'https://uvpddncsycmr.sealoshzh.site'+img" 
              mode="aspectFill"
              @tap.stop="previewImage(post.images, imgIndex)"
            ></image>
          
          </view>
        </view>
        
        
        <view class="post-footer">
          <view class="action-item">
            <image class="action-icon" src="/static/icons/like.png" mode="aspectFit"></image>
            <text class="action-count">{{ post.likes }}</text>
          </view>
          <view class="action-item">
            <image class="action-icon" src="/static/icons/comment.png" mode="aspectFit"></image>
            <text class="action-count">{{ post.comments }}</text>
          </view>
          <view class="action-item">
            <image class="action-icon" src="/static/icons/collect.png" mode="aspectFit"></image>
            <text class="action-count">{{ post.collects }}</text>
          </view>
        </view>
      </view>
      
      <view class="load-more-tip" v-if="posts.length > 0">
        <text v-if="hasMore">正在加载...</text>
        <text v-else>———— 已经到底了 ————</text>
      </view>
      <view class="empty-tip" v-else-if="!isRefreshing && !isLoading">
        <text>当前分类暂无帖子</text>
      </view>
    </scroll-view>
    
    <view class="publish-btn" @tap="navigateTo('/pages/trees/publish')">
      <text class="plus-icon">+</text>
    </view>
    <tab-bar active="trees"></tab-bar>
  </view>
  
</template>

<script>
// 1. 引入正确的 API 函数名：getTreePosts

import { getTreePosts } from '@/api/index'; 
import TabBar from '@/components/tab-bar.vue'

export default {
   components: {
    TabBar
  },
  data() {
    return {
      // 话题分类列表
      categories: [
        { label: '全部', value: '' }, // value: '' 表示不筛选
        { label: '热门', value: '热门' },
        { label: '学习', value: '学习' },
        { label: '情感', value: '情感' },
        { label: '生活', value: '生活' },
        { label: '职业', value: '职业' },
        { label: '吐槽', value: '吐槽' },
      ],
      currentTopic: '', 
      searchKeyword: '', 
      posts: [],
      // 分页和加载状态
      query: {
        page: 1,
        size: 10, // 2. 将 pageSize 修改为 size，匹配后端接口参数
        topic: '' 
      },
      hasMore: true,
      isRefreshing: false, 
      isLoading: false,    
    }
  },
  onLoad() {
    this.getTreePosts(true); // 3. 修改函数调用名
  },
  
  methods: {
    selectTopic(topicValue) {
      if (this.currentTopic === topicValue) return; 
      
      this.currentTopic = topicValue;
      this.query.topic = topicValue;
      this.query.page = 1;
      this.posts = []; 
      this.getTreePosts(true); // 3. 修改函数调用名
    },
    
    searchPosts() {
      // 可以在这里实现搜索逻辑，将关键词添加到 query 中并重新加载
      // this.query.keyword = this.searchKeyword;
      // this.query.page = 1;
      // this.posts = [];
      // this.getTreePosts(true);
      uni.showToast({ title: '搜索功能暂未实现', icon: 'none' });
    },

    // 2. 获取帖子列表的核心方法 (函数名已修改为 getTreePosts)
    async getTreePosts(isNewLoad = false) {
      if (this.isLoading && !isNewLoad) return;
      if (!this.hasMore && !isNewLoad) return;

      this.isLoading = true;
      if (isNewLoad) this.isRefreshing = true;

      try {
        const params = {
          page: this.query.page,
          size: this.query.size, // 4. 使用 size 参数
          topic: this.query.topic,
          // keyword: this.query.keyword, 
        };
        
        // 调用 /api/trees/posts 接口，使用 getTreePosts 函数
        const resData = await getTreePosts(params); 
        
        // 假设后端返回的数据结构是 { posts: [...], total: N }
        const newPosts = resData.posts || [];
        
        if (isNewLoad) {
          this.posts = newPosts;
        } else {
          this.posts = this.posts.concat(newPosts);
        }
        
        // 检查是否还有更多数据
        this.hasMore = newPosts.length === this.query.size; // 5. 使用 size 参数进行判断

      } catch (error) {
        uni.showToast({ title: '帖子加载失败', icon: 'none' });
        console.error('获取帖子列表错误:', error);
      } finally {
        this.isLoading = false;
        this.isRefreshing = false;
      }
    },
    
    // 3. 下拉刷新事件
    onRefresh() {
      if (this.isLoading) return;
      this.query.page = 1;
      this.hasMore = true;
      this.getTreePosts(true); // 3. 修改函数调用名
    },
    
    // 4. 上拉加载更多事件
    onLoadMore() {
      if (!this.hasMore || this.isLoading) return;
      this.query.page += 1;
      this.getTreePosts(false); // 3. 修改函数调用名
    },

    // 格式化时间 (简化示例)
    formatTime(time) {
      if (!time) return '未知时间';
      // 实际应使用更复杂的逻辑处理时间戳或日期字符串
      return time.substring(5, 16); 
    },
    
    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({ url });
    },
    
    // 帖子详情
    viewPostDetail(id) {
      if (id) {
        this.navigateTo(`/pages/trees/post-detail?id=${id}`);
      } else {
         uni.showToast({ title: '帖子ID缺失', icon: 'none' });
      }
    },
    
    // 图片预览
    previewImage(images, currentIndex) {
            console.log('图片预览images:',images);
      console.log('图片预览url:','https://uvpddncsycmr.sealoshzh.site'+images);
      uni.previewImage({
        urls: ['https://uvpddncsycmr.sealoshzh.site'+images],
        current: images[currentIndex]
      });
    }
  }
}
</script>

<style>
/* 样式部分保持不变 */
/* ... (请将原有的 <style> 样式代码保留在此处) ... */

/* 全局样式 */
.container {
  min-height: 100vh;
  background-color: #fcfcfc;
  padding-bottom: 150rpx; /* 为 TabBar 和发布按钮留出空间 */
}

/* 顶部标题栏 */
.header {
  padding: 30rpx;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #eee;
}

.logo-text {
  font-size: 38rpx;
  font-weight: bold;
  color: #3e2723;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 15rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #3e2723;
}

/* 话题分类 */
.topic-categories {
  white-space: nowrap;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
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

/* 激活状态 */
.topic-tag.active {
  background-color: #a1887f; /* 主题色 */
  color: #fff;
  font-weight: bold;
}

/* 内容列表 */
.post-list {
  height: calc(100vh - 280rpx); /* 减去顶部 header/search/topics 的高度 */
  padding: 0 30rpx;
}

.post-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
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

.user-details {
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

.topic-label {
  font-size: 26rpx;
  color: #8d6e63;
  background-color: #f5e4e0;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
  font-weight: bold;
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
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3; /* 最多显示3行 */
  -webkit-box-orient: vertical;
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
  background-color: #eee;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10rpx;
  border-top: 1rpx dashed #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.action-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.action-count {
  font-size: 26rpx;
  color: #795548;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  right: 50rpx;
  bottom: 150rpx; /* 预留底部 tabbar 空间 */
  width: 100rpx;
  height: 100rpx;
  background-color: #a1887f; /* 主题色 */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 12rpx rgba(161, 136, 127, 0.6);
  z-index: 10;
}

.plus-icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
}

.load-more-tip, .empty-tip {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}
</style>