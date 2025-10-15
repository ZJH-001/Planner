<template>
  <view class="chat-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">未来流助手</text>
      <view class="header-right">
        <text class="clear-history" @tap="showClearHistoryConfirm">清空</text>
      </view>
    </view>
    
    <!-- 聊天消息区域 -->
    <scroll-view 
      class="message-area" 
      scroll-y="true" 
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltoupper="loadMoreMessages"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      ref="messageScroll"
    >
      <!-- 下拉加载更多提示 -->
      <view v-if="hasMoreMessages" class="load-more-tip">下拉加载更多消息</view>
      
      <!-- 消息列表 -->
      <view class="message-list">
        <!-- 欢迎消息 -->
        <view v-if="messages.length === 0" class="welcome-message">
          <view class="bot-message">
            <view class="message-avatar">
              <image src="/static/icons/bot-avatar.png" mode="aspectFill"></image>
            </view>
            <view class="message-content bot">
              <text>你好！我是未来流生涯规划助手。根据你填写的问卷信息，我可以为你提供个性化的生涯规划建议。请告诉我你想了解什么？</text>
            </view>
          </view>
          
          <!-- 快捷提问按钮 -->
          <view class="quick-questions">
            <view class="quick-question-title">你可以尝试这些问题：</view>
            <view 
              v-for="(question, index) in quickQuestions" 
              :key="index" 
              class="quick-question-btn"
              @tap="sendQuickQuestion(question)"
            >
              {{ question }}
            </view>
          </view>
        </view>
        
        <!-- 消息气泡 -->
        <block v-for="(msg, index) in messages" :key="index">
          <!-- 用户消息 -->
          <view v-if="msg.type === 'user'" class="user-message">
            <view class="message-content user">
              <text>{{ msg.content }}</text>
            </view>
            <view class="message-avatar">
              <image :src="userAvatar || '/static/cat.png'" mode="aspectFill"></image>
            </view>
          </view>
          
          <!-- 机器人消息 -->
          <view v-else class="bot-message">
            <view class="message-avatar">
              <image src="/static/Weilailiu_logo.png" mode="aspectFill"></image>
            </view>
            <view class="message-content bot">
              <text>{{ msg.content }}</text>
            </view>
          </view>
          
          <!-- 消息时间戳 -->
          <view v-if="shouldShowTimestamp(index)" class="message-timestamp">
            {{ formatTimestamp(msg.timestamp) }}
          </view>
        </block>
        
        <!-- 正在输入提示 -->
        <view v-if="isTyping" class="bot-message">
          <view class="message-avatar">
            <image src="/static/icons/bot-avatar.png" mode="aspectFill"></image>
          </view>
          <view class="message-content bot typing">
            <view class="typing-indicator">
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位，确保最新消息可以滚动到顶部 -->
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 输入区域 -->
    <view class="input-area">
      <textarea 
        class="message-input" 
        v-model="inputMessage" 
        placeholder="输入你的问题..." 
        :disabled="isTyping"
        auto-height
        :maxlength="-1"
        @confirm="sendMessage"
        :adjust-position="true"
        :cursor-spacing="20"
        :show-confirm-bar="false"
        @input="adjustTextareaHeight"
        ref="messageInput"
      ></textarea>
      <view 
        class="send-btn" 
        :class="{ 'active': inputMessage.trim().length > 0 }"
        @tap="sendMessage"
      >
        <text class="send-icon">↑</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, getQuestionnaireData } from '@/api/index';
import { sendChatMessage } from '@/api/chat';

export default {
  data() {
    return {
      // 用户信息
      userInfo: null,
      userAvatar: '',
      questionnaireData: null,
      
      // 消息相关
      messages: [],
      inputMessage: '',
      isTyping: false,
      scrollTop: 0,
      isRefreshing: false,
      hasMoreMessages: false,
      currentStreamingMessageIndex: -1, // 当前流式输出消息的索引
      
      // 快捷问题
      quickQuestions: [
        '我适合什么专业方向？',
        '如何规划我的大学四年？',
        '我该如何提升自己的学术能力？',
        '我的职业发展方向建议是什么？'
      ],
      
      // 时间戳显示控制
      lastTimestampIndex: -1,
      timestampInterval: 10 * 60 * 1000, // 10分钟显示一次时间戳
      
      // 输入框高度控制
      minInputHeight: 40,
      maxInputHeight: 120,
      
      // 请求控制
      currentRequestTask: null
    }
  },
  
  onLoad() {
    this.fetchUserData();
    this.loadChatHistory();
  },
  
  onShow() {
    // 滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
  
  onUnload() {
    // 页面卸载时取消正在进行的请求
    this.cancelCurrentRequest();
  },
  
  onHide() {
    // 页面隐藏时取消正在进行的请求
    this.cancelCurrentRequest();
  },
  
  methods: {
    // 获取用户数据
    async fetchUserData() {
      try {
        // 获取用户基本信息
        const userInfo = await getUserInfo();
        this.userInfo = userInfo;
        this.userAvatar = userInfo.avatar;
        
        // 获取问卷数据
        const questionnaireData = await getQuestionnaireData();
        this.questionnaireData = questionnaireData;
        
        // 如果没有欢迎消息，添加一个
        if (this.messages.length === 0) {
          // 欢迎消息会在模板中直接显示，不需要添加到消息数组
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
        uni.showToast({
          title: '获取用户数据失败',
          icon: 'none'
        });
      }
    },
    
    // 加载聊天历史
    loadChatHistory() {
      try {
        // 获取用户ID，用于区分不同用户的聊天历史
        const userId = uni.getStorageSync('userId') || 'anonymous';
        const storageKey = `career_chat_history_${userId}`;
        
        const chatHistory = uni.getStorageSync(storageKey);
        if (chatHistory) {
          const parsedHistory = JSON.parse(chatHistory);
          
          // 如果历史消息超过20条，显示"加载更多"提示
          this.hasMoreMessages = parsedHistory.length > 20;
          
          // 只显示最近20条消息
          if (this.hasMoreMessages) {
            this.messages = parsedHistory.slice(-20);
          } else {
            this.messages = parsedHistory;
          }
          
          // 如果有消息，滚动到底部
          if (this.messages.length > 0) {
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
        // 显示错误提示
        uni.showToast({
          title: '加载聊天记录失败',
          icon: 'none'
        });
      }
    },
    
    // 保存聊天历史
    saveChatHistory() {
      try {
        // 获取用户ID，用于区分不同用户的聊天历史
        const userId = uni.getStorageSync('userId') || 'anonymous';
        const storageKey = `career_chat_history_${userId}`;
        
        // 最多保存100条消息
        const historyToSave = this.messages.slice(-100);
        uni.setStorageSync(storageKey, JSON.stringify(historyToSave));
      } catch (error) {
        console.error('保存聊天历史失败:', error);
        // 显示错误提示
        uni.showToast({
          title: '保存聊天记录失败',
          icon: 'none'
        });
      }
    },
    
    // 清除聊天历史
    clearChatHistory() {
      try {
        // 获取用户ID
        const userId = uni.getStorageSync('userId') || 'anonymous';
        const storageKey = `career_chat_history_${userId}`;
        
        // 清除聊天历史
        uni.removeStorageSync(storageKey);
        
        // 清空消息数组
        this.messages = [];
        
        // 显示成功提示
        uni.showToast({
          title: '聊天记录已清除',
          icon: 'success'
        });
      } catch (error) {
        console.error('清除聊天历史失败:', error);
        // 显示错误提示
        uni.showToast({
          title: '清除聊天记录失败',
          icon: 'none'
        });
      }
    },
    
    // 发送消息
    async sendMessage() {
      
      const message = this.inputMessage.trim();//用户输入问题
      if (!message || this.isTyping) return;
      
      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: Date.now()
      };
      
      this.messages.push(userMessage);
      this.inputMessage = '';
      
      // 调整输入框高度
      this.adjustTextareaHeight();
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 保存聊天历史
      this.saveChatHistory();
      
      // 显示机器人正在输入
      this.isTyping = true;
      
      
      this.getChatResponse(message);
      
      },
    
    
    // 发送快捷问题
    sendQuickQuestion(question) {
      this.inputMessage = question;
      this.sendMessage();
    },
    
    // 获取聊天回复（调用DeepSeek API）
    getChatResponse(message) {
      try {
        // 准备用户数据
        const userData = {
          ...this.userInfo,
          ...this.questionnaireData
        };
        
        // 准备历史消息（排除当前用户消息，因为API会自动处理）
        const historyMessages = this.messages.slice(0, -1).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        // 创建一个空的机器人消息用于流式输出
        const botMessage = {
          type: 'bot',
          content: '',
          timestamp: Date.now()
        };
        
        this.messages.push(botMessage);
        this.currentStreamingMessageIndex = this.messages.length - 1;
        
        // 滚动到底部显示新消息
        this.$nextTick(() => {
          this.scrollToBottom();
        });
   
        // *** 定义流式回调函数 ***
      
        // 实时接收数据块
        const onMessage = (chunk) => {
          if (chunk && this.currentStreamingMessageIndex !== -1) {
            // 在当前流式消息的 content 后追加数据块
            const currentMessage = this.messages[this.currentStreamingMessageIndex];
            if (currentMessage) {
              this.$set(this.messages, this.currentStreamingMessageIndex, {
                ...currentMessage,
                content: currentMessage.content + chunk
              });
              // 每次收到新内容都滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            }
          }
        };
        
        // 流程完成
        const onComplete = (response) => {
          console.log('流式输出完成:', response);
          this.isTyping = false;
          this.currentRequestTask = null;
          
          // 标记消息为完成，并更新最终时间戳
          if (this.currentStreamingMessageIndex !== -1) {
            const currentMessage = this.messages[this.currentStreamingMessageIndex];
            if (currentMessage) {
              this.$set(this.messages, this.currentStreamingMessageIndex, {
                ...currentMessage,
                timestamp: Date.now()
              });
            }
          }

          this.currentStreamingMessageIndex = -1; // 重置索引
          this.saveChatHistory(); // 完成后保存历史
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        };
        
        // 流程出错
        const onError = (error) => {
          console.error('流式API请求失败:', error);
          this.isTyping = false;
          this.currentRequestTask = null;
          
          // 显示用户友好的错误提示
          uni.showToast({
            title: '网络连接异常，请稍后重试',
            icon: 'none',
            duration: 3000
          });
          
          // 如果出错，用一条错误消息替换正在流式输出的消息
          if (this.currentStreamingMessageIndex !== -1) {
            this.$set(this.messages, this.currentStreamingMessageIndex, {
              type: 'bot',
              content: '抱歉，网络连接出现问题，请稍后再试。如果问题持续存在，请检查网络连接或联系技术支持。',
              timestamp: Date.now()
            });
          }

          this.currentStreamingMessageIndex = -1; // 重置索引
          this.saveChatHistory(); // 保存错误消息
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        };

        // 调用流式API
        this.currentRequestTask = sendChatMessage(message, userData, historyMessages, onMessage, onComplete, onError);
        
      } catch (error) {
        console.error('发送消息失败:', error);
        this.isTyping = false;
        uni.showToast({
          title: '发送消息失败',
          icon: 'none'
        });
      }
    },
    
    // 这里移除了模拟数据相关的函数
    // 滚动到底部
    scrollToBottom() {
      // 使用nextTick确保DOM已更新
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.message-list').boundingClientRect(data => {
          if (data) {
            this.scrollTop = data.height * 2; // 乘以2确保滚动到底部
          }
        }).exec();
      });
    },
    
    // 加载更多消息
    loadMoreMessages() {
      // 模拟加载更多历史消息
      this.isRefreshing = true;
      
      setTimeout(() => {
        try {
          // 获取用户ID，用于区分不同用户的聊天历史
          const userId = uni.getStorageSync('userId') || 'anonymous';
          const storageKey = `career_chat_history_${userId}`;
          const chatHistory = uni.getStorageSync(storageKey);
          if (chatHistory) {
            const allMessages = JSON.parse(chatHistory);
            const currentCount = this.messages.length;
            
            // 如果还有更多消息可以加载
            if (allMessages.length > currentCount) {
              // 加载前20条
              const moreMessages = allMessages.slice(
                Math.max(0, allMessages.length - currentCount - 20),
                allMessages.length - currentCount
              );
              
              // 将新消息添加到前面
              this.messages = [...moreMessages, ...this.messages];
              
              // 更新是否还有更多消息
              this.hasMoreMessages = allMessages.length > this.messages.length;
            } else {
              this.hasMoreMessages = false;
            }
          }
        } catch (error) {
          console.error('加载更多消息失败:', error);
        } finally {
          this.isRefreshing = false;
        }
      }, 1000);
    },
    
    // 下拉刷新
    onRefresh() {
      this.loadMoreMessages();
    },
    
    // 调整输入框高度
    adjustTextareaHeight() {
      // 这里可以实现自动调整输入框高度的逻辑
      // 在uniapp中，textarea的auto-height属性已经可以自动调整高度
    },
    
    // 是否显示时间戳
    shouldShowTimestamp(index) {
      if (index === 0) return true;
      
      const currentMsg = this.messages[index];
      const prevMsg = this.messages[index - 1];
      
      // 如果时间间隔超过设定值，显示时间戳
      return currentMsg.timestamp - prevMsg.timestamp > this.timestampInterval;
    },
    
    // 格式化时间戳
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      
      // 如果是今天的消息，只显示时间
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
      
      // 如果是昨天的消息
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // 其他情况显示完整日期和时间
      return date.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      });
    },
    
    // 显示清除历史确认对话框
    showClearHistoryConfirm() {
      uni.showModal({
        title: '清除聊天记录',
        content: '确定要清除所有聊天记录吗？',
        confirmText: '清除',
        confirmColor: '#FF5252',
        success: (res) => {
          if (res.confirm) {
            this.clearChatHistory();
          }
        }
      });
    },
    
    // 取消当前请求
    cancelCurrentRequest() {
      if (this.currentRequestTask) {
        try {
          this.currentRequestTask.abort();
          console.log('已取消当前请求');
        } catch (error) {
          console.warn('取消请求失败:', error);
        } finally {
          this.currentRequestTask = null;
          this.isTyping = false;
          this.currentStreamingMessageIndex = -1;
        }
      }
    },
    
    // 返回上一页
    goBack() {
      // 如果有正在进行的请求，先取消
      this.cancelCurrentRequest();
      uni.navigateBack();
    }
  }
}
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  color: white;
  position: relative;
  z-index: 10;
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
  width: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clear-history {
  font-size: 24rpx;
  color: white;
  padding: 6rpx 12rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

/* 聊天消息区域 */
.message-area {
  flex: 1;
  padding: 20rpx;
  position: relative;
}

.load-more-tip {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 20rpx 0;
}

.message-list {
  padding-bottom: 20rpx;
}

/* 欢迎消息 */
.welcome-message {
  margin-bottom: 30rpx;
}

/* 快捷提问 */
.quick-questions {
  padding: 20rpx 0;
  margin-left: 80rpx;
}

.quick-question-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.quick-question-btn {
  display: inline-block;
  background-color: #f0f0f0;
  color: #333;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  margin: 10rpx 10rpx 10rpx 0;
  font-size: 26rpx;
  transition: all 0.3s;
}

.quick-question-btn:active {
  background-color: #e0e0e0;
  transform: scale(0.98);
}

/* 用户消息 */
.user-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
}

.message-avatar image {
  width: 100%;
  height: 100%;
}

.message-content {
  max-width: 70%;
  padding: 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.message-content.user {
  background-color: #4CAF50;
  color: white;
  margin-right: 16rpx;
  border-top-right-radius: 4rpx;
}

/* 机器人消息 */
.bot-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.message-content.bot {
  background-color: white;
  color: #333;
  margin-left: 16rpx;
  border-top-left-radius: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 时间戳 */
.message-timestamp {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin: 20rpx 0;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #999;
  margin: 0 4rpx;
  animation: typing 1.5s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.3s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-10rpx);
    opacity: 1;
  }
}

/* 底部占位 */
.bottom-space {
  height: 20rpx;
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  position: relative;
  z-index: 10;
}

.message-input {
  flex: 1;
  min-height: 80rpx;
  max-height: 240rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-btn.active {
  background-color: #4CAF50;
}

.send-icon {
  color: white;
  font-size: 36rpx;
}
</style>
