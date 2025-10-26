<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left">
        <!-- 移除返回按钮 -->
      </view>
      <view class="header-center">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      </view>
      <view class="header-right">
        <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 页面标题 -->
    <view class="page-title">
      <text class="title-text">规划</text>
      <view class="sort-button" @tap="toggleSort">
        <text class="sort-icon">{{ sortType === 'time' ? '🕒' : '⏰' }}</text>
        <text class="sort-text">{{ sortType === 'time' ? '创建时间' : '截止时间' }}</text>
      </view>
    </view>

    <!-- 卡片网格 -->
    <view class="tools-grid">
      <view
        class="tool-card countdown-card"
        v-for="(tool, index) in tools"
        :key="tool.planning_id"
        :style="{ background: `linear-gradient(135deg, ${tool.bgColor}, ${adjustColor(tool.bgColor, -20)})` }"
        @tap="handleToolTap(tool)"
      >
        <!-- 删除按钮 -->
        <view 
          class="delete-btn" 
          @tap.stop="showDeleteConfirm(index)"
        >
          <text class="delete-text">×</text>
        </view>
        
        <!-- 规划标题 -->
        <text class="card-title-white">距离{{ tool.title }}还剩</text>
        
        <!-- 大数字倒计时 -->
        <view class="countdown-number">
          <text 
            v-if="getCountdownDays(tool.deadline) === '已截止'"
            class="countdown-expired-text"
          >
            已截止
          </text>
          <template v-else>
            <text class="countdown-big-text">{{ getCountdownDays(tool.deadline) }}</text>
            <text class="countdown-unit">天</text>
          </template>
        </view>
        
        <!-- 日期显示 -->
        <text class="deadline-date">{{ formatDate(tool.deadline) }}</text>
      </view>

      <!-- 添加新规划卡片 -->
      <view class="tool-card add-card" @tap="showAddDialog">
        <view class="card-icon">
          <text class="icon-text">+</text>
        </view>
        <text class="card-title">添加规划</text>
      </view>
    </view>

    <!-- 添加规划弹窗 -->
    <view class="modal-overlay" v-if="showModal" @tap="hideAddDialog">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加新规划</text>
          <text class="modal-close" @tap="hideAddDialog">×</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">规划名称</text>
            <input
              class="input-field"
              v-model="newTool.title"
              placeholder="请输入规划名称，如：六级、教资"
              maxlength="10"
            />
          </view>
          <view class="input-group">
            <text class="input-label">截止日期</text>
            <picker 
              mode="date" 
              :value="newTool.deadline" 
              @change="onDeadlineChange"
              class="date-picker"
            >
              <view class="picker-display">
                <text class="picker-text">{{ newTool.deadline || '请选择截止日期' }}</text>
                <text class="picker-arrow">></text>
              </view>
            </picker>
          </view>
          <view class="input-group">
            <text class="input-label">选择背景颜色</text>
            <view class="color-selector">
              <view
                class="color-option"
                v-for="(color, index) in colorOptions"
                :key="index"
                :class="{ active: newTool.bgColor === color }"
                :style="{ backgroundColor: color }"
                @tap="selectColor(color)"
              >
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn btn-cancel" @tap="hideAddDialog">取消</button>
          <button class="btn btn-confirm" @tap="addNewTool">确认添加</button>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal-overlay" v-if="showDeleteModal" @tap="hideDeleteConfirm">
      <view class="modal-content delete-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">删除确认</text>
        </view>
        <view class="modal-body">
          <text class="delete-message">是否删除规划？</text>
        </view>
        <view class="modal-footer">
          <button class="btn btn-cancel" @tap="hideDeleteConfirm">取消</button>
          <button class="btn btn-delete" @tap="confirmDelete">删除</button>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar active="world"></tab-bar>
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar.vue";
import { getPlannings, createPlanning, deletePlanning } from "@/api/index.js";

export default {
  components: {
    TabBar,
  },
  data() {
    return {
      showModal: false,
      showDeleteModal: false,
      deleteIndex: -1,
      newTool: {
        title: "",
        bgColor: "#667eea",
        deadline: "",
      },
      colorOptions: [
        "#667eea", "#764ba2", "#f093fb", "#f5576c", 
        "#4facfe", "#00f2fe", "#43e97b", "#38f9d7",
        "#ffecd2", "#fcb69f", "#a8edea", "#fed6e3"
      ],
      tools: [],
      loading: false,
      sortType: 'time', // 'time' 表示按创建时间排序，'deadline' 表示按截止时间排序
    };
  },
  onLoad() {
    this.loadPlannings();
  },
  onShow() {
    // 每次显示页面时重新加载数据，确保数据同步
    this.loadPlannings();
  },
  methods: {
    // 加载规划列表
    async loadPlannings() {
      try {
        this.loading = true;
        const response = await getPlannings();
        console.log('API响应数据:', response);
        
        if (response && response.plannings) {
          this.tools = response.plannings;
          // 验证每个规划项是否有planning_id字段
          this.tools.forEach((tool, index) => {
            if (!tool.planning_id) {
              console.warn(`规划项 ${index} 缺少planning_id字段:`, tool);
            }
          });
          // 加载完成后进行默认排序
          this.sortPlannings();
        } else {
          this.tools = [];
          console.warn('API响应中没有plannings字段或为空');
        }
      } catch (error) {
        console.error('加载规划列表失败:', error);
        uni.showToast({
          title: '加载规划列表失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    handleToolTap(tool) {
      // 验证规划ID是否存在
      if (!tool || !tool.planning_id) {
        console.error('规划数据无效:', tool);
        uni.showToast({
          title: '规划数据无效',
          icon: 'none'
        });
        return;
      }
      
      console.log('跳转到规划详情，ID:', tool.planning_id, '标题:', tool.title);
      // 跳转到规划详情页面，传递规划ID
      uni.navigateTo({
        url: `/pages/planning-detail?planningId=${tool.planning_id}&title=${encodeURIComponent(tool.title || '')}`
      });
    },

    showAddDialog() {
      this.showModal = true;
    },

    hideAddDialog() {
      this.showModal = false;
      this.newTool = {
        title: "",
        bgColor: "#667eea",
        deadline: "",
      };
    },

    onDeadlineChange(e) {
      this.newTool.deadline = e.detail.value;
    },

    selectColor(color) {
      this.newTool.bgColor = color;
    },

    // 调整颜色亮度
    adjustColor(color, amount) {
      const usePound = color[0] === "#";
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + amount;
      let g = (num >> 8 & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    },

    // 获取倒计时天数
    getCountdownDays(deadline) {
      if (!deadline) return "0";
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - now;
      
      if (diffTime <= 0) {
        return "已截止";
      }
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    },

    // 格式化日期（只显示日期，不显示星期几）
    formatDate(deadline) {
      if (!deadline) return "";
      const date = new Date(deadline);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 判断是否已过期
    isExpired(deadline) {
      if (!deadline) return false;
      const now = new Date();
      const target = new Date(deadline);
      return target.getTime() - now.getTime() <= 0;
    },

    // 计算倒计时
    getCountdown(deadline) {
      if (!deadline) return "";
      
      const now = new Date();
      const target = new Date(deadline);
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        return "已截止";
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days}天`;
      } else if (hours > 0) {
        return `${hours}小时`;
      } else {
        return "不足1小时";
      }
    },

    async addNewTool() {
      if (!this.newTool.title.trim()) {
        uni.showToast({
          title: "请输入规划名称",
          icon: "none",
        });
        return;
      }

      if (!this.newTool.deadline) {
        uni.showToast({
          title: "请选择截止日期",
          icon: "none",
        });
        return;
      }

      // 验证截止日期不能早于当前日期
      const today = new Date();
      const selectedDate = new Date(this.newTool.deadline);
      if (selectedDate < today) {
        uni.showToast({
          title: "截止日期不能早于当前日期",
          icon: "none",
        });
        return;
      }

      try {
        const planningData = {
          title: this.newTool.title.trim(),
          bgColor: this.newTool.bgColor,
          deadline: this.newTool.deadline,
        };

        await createPlanning(planningData);
        
        uni.showToast({
          title: "添加成功",
          icon: "success",
        });

        this.hideAddDialog();
        // 重新加载规划列表
        this.loadPlannings();
      } catch (error) {
        console.error('创建规划失败:', error);
        uni.showToast({
          title: error.message || "创建规划失败",
          icon: "none",
        });
      }
    },

    // 显示删除确认弹窗
    showDeleteConfirm(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },

    // 隐藏删除确认弹窗
    hideDeleteConfirm() {
      this.showDeleteModal = false;
      this.deleteIndex = -1;
    },

    // 确认删除
    async confirmDelete() {
      try {
        const tool = this.tools[this.deleteIndex];
        console.log('删除规划，planning_id:', tool.planning_id);
        
        if (!tool.planning_id) {
          throw new Error('规划ID无效');
        }
        
        await deletePlanning(tool.planning_id);
        this.tools.splice(this.deleteIndex, 1);
        this.showDeleteModal = false;
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('删除规划失败:', error);
        uni.showToast({
          title: `删除失败: ${error.message || error}`,
          icon: 'none'
        });
      }
    },

    // 切换排序方式
    toggleSort() {
      this.sortType = this.sortType === 'time' ? 'deadline' : 'time';
      this.sortPlannings();
    },

    // 排序规划列表
    sortPlannings() {
      if (this.sortType === 'time') {
        // 按创建时间排序（最新的在前）
        this.tools.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });
      } else {
        // 按距离现在的时间排序（最近截止的在前）
        this.tools.sort((a, b) => {
          const now = new Date().getTime();
          const deadlineA = new Date(a.deadline || '9999-12-31').getTime();
          const deadlineB = new Date(b.deadline || '9999-12-31').getTime();
          const diffA = Math.abs(deadlineA - now);
          const diffB = Math.abs(deadlineB - now);
          return diffA - diffB;
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 140rpx; /* 为底部导航栏留出空间 */
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
}

.header-left {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 60rpx;
  color: white;
  font-weight: 300;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.logo {
  width: 60rpx;
  height: 60rpx;
}

.header-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

/* 页面标题 */
.page-title {
  padding: 0 40rpx 60rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-text {
  font-size: 48rpx;
  color: white;
  font-weight: 500;
}

.sort-button {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.sort-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.sort-text {
  font-size: 24rpx;
  color: white;
  font-weight: 400;
}

/*规划卡片网格 */
.tools-grid {
  padding: 0 40rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30rpx;
}

.tool-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.countdown-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 280rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  color: white;
}

.card-title-white {
  font-size: 28rpx;
  color: white;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20rpx;
}

.countdown-number {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 20rpx 0;
  position: relative;
}

.countdown-big-text {
  font-size: 120rpx;
  font-weight: bold;
  color: white;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.countdown-unit {
  font-size: 32rpx;
  color: white;
  font-weight: 500;
  margin-left: 8rpx;
  margin-bottom: 8rpx;
  text-shadow: 1rpx 1rpx 4rpx rgba(0, 0, 0, 0.3);
}

.countdown-expired-text {
  font-size: 48rpx;
  color: white;
  font-weight: 600;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.deadline-date {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 10rpx;
}

.tool-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
}

.tool-card:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.add-card {
  border: 4rpx dashed rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.3);
}

.add-card::before {
  display: none;
}

.card-icon {
  margin-bottom: 20rpx;
}

/* 删除按钮样式 */
.delete-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.delete-text {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
  line-height: 1;
}

.icon-text {
  font-size: 48rpx;
}

.add-card .icon-text {
  font-size: 60rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

.card-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
}

.add-card .card-title {
  color: rgba(255, 255, 255, 0.8);
}

/* 倒计时样式 */
.countdown {
  margin-top: 10rpx;
  padding: 8rpx 16rpx;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12rpx;
  border: 1rpx solid rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.countdown.expired {
  background: rgba(244, 67, 54, 0.1);
  border: 1rpx solid rgba(244, 67, 54, 0.3);
  animation: pulse 2s infinite;
}

.countdown-text {
  font-size: 20rpx;
  color: #4caf50;
  font-weight: 600;
  transition: color 0.3s ease;
}

.countdown-text.expired-text {
  color: #f44336;
  font-weight: 700;
}

/* 过期状态的脉动动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10rpx rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 40rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #4caf50;
}

/* 日期选择器样式 */
.date-picker {
  width: 100%;
  position: relative;
  z-index: 1001;
}

.picker-display {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  background: white;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e0e0e0;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

.color-option.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 28rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0,0,0,0.5);
}

.modal-footer {
  display: flex;
  padding: 40rpx;
  gap: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: #4caf50;
  color: white;
}

.btn:active {
  opacity: 0.8;
}

/* 删除弹窗样式 */
.delete-modal {
  max-width: 500rpx;
}

.delete-message {
  font-size: 32rpx;
  color: #333;
  text-align: center;
  line-height: 1.5;
}

.btn-delete {
  background: #f44336;
  color: white;
}

/* 全局样式确保picker组件有足够高的z-index */
:deep(.uni-picker-container) {
  z-index: 10000 !important;
}

:deep(.uni-picker) {
  z-index: 10000 !important;
}
</style>