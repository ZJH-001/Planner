<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">←</text>
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
      <text class="title-text">规划详情</text>
    </view>

    <!-- 规划卡片信息 -->
    <view class="planning-card" v-if="planningData">
      <view 
        class="card-header"
        :style="{ background: `linear-gradient(135deg, ${planningData.bgColor}, ${adjustColor(planningData.bgColor, -20)})` }"
      >
        <text class="card-title">{{ planningData.title }}</text>
        <view class="countdown-display">
          <text 
            v-if="getCountdownDays(planningData.deadline) === '已截止'"
            class="countdown-expired"
          >
            已截止
          </text>
          <template v-else>
            <text class="countdown-number">{{ getCountdownDays(planningData.deadline) }}</text>
            <text class="countdown-unit">天</text>
          </template>
        </view>
        <text class="deadline-text">截止日期：{{ formatDate(planningData.deadline) }}</text>
      </view>

      <!-- 进度条区域 -->
      <view class="progress-section">
        <view class="progress-header">
          <text class="progress-title">任务进度</text>
          <text class="progress-text">{{ completedTasks }}/{{ totalTasks }}</text>
        </view>
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%', background: planningData.bgColor }"
          ></view>
        </view>
        <text class="progress-percentage">{{ Math.round(progressPercentage) }}%</text>
      </view>

      <!-- Todo List 区域 -->
      <view class="todo-section">
        <view class="section-header">
          <text class="section-title">任务清单</text>
          <button class="add-task-btn" @tap="showAddTaskDialog">+ 添加任务</button>
        </view>

        <!-- 任务列表 -->
        <view class="task-list" v-if="tasks.length > 0">
          <view 
            class="task-item" 
            v-for="(task, index) in tasks" 
            :key="task.task_id"
            :class="{ completed: task.completed }"
          >
            <view class="task-checkbox" @tap="toggleTask(index)">
              <text class="checkbox-icon" v-if="task.completed">✓</text>
            </view>
            <text class="task-content" :class="{ 'task-completed': task.completed }">
              {{ task.content }}
            </text>
            <view class="task-actions">
              <text class="delete-btn" @tap="deleteTask(index)">×</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-else>
          <text class="empty-text">暂无任务，点击上方按钮添加任务</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-else>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 添加任务弹窗 -->
    <view class="modal-overlay" v-if="showAddModal" @tap="hideAddTaskDialog">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加新任务</text>
          <text class="modal-close" @tap="hideAddTaskDialog">×</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">任务内容</text>
            <input
              class="input-field"
              v-model="newTaskContent"
              placeholder="请输入任务内容"
              maxlength="50"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn btn-cancel" @tap="hideAddTaskDialog">取消</button>
          <button class="btn btn-confirm" @tap="addTask">确认添加</button>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar active="world"></tab-bar>
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar.vue";
import { getPlanningDetail, getPlanningTasks, createTask, updateTask, deleteTask } from "@/api/index.js";

export default {
  components: {
    TabBar,
  },
  data() {
    return {
      planningData: null,
      tasks: [],
      showAddModal: false,
      newTaskContent: '',
      planningId: '',
      loading: false,
    };
  },
  computed: {
    totalTasks() {
      return this.tasks.length;
    },
    completedTasks() {
      return this.tasks.filter(task => task.completed).length;
    },
    progressPercentage() {
      if (this.totalTasks === 0) return 0;
      return (this.completedTasks / this.totalTasks) * 100;
    }
  },
  onLoad(options) {
    console.log('planning-detail页面接收到的参数:', options);
    
    // 接收从world页面传递的规划ID
    if (options && options.planningId && options.planningId !== 'undefined') {
      this.planningId = options.planningId;
      console.log('设置planningId:', this.planningId);
      this.loadPlanningDetail();
      this.loadTasks();
    } else {
      console.error('规划ID缺失或无效:', options);
      uni.showToast({
        title: '规划ID缺失或无效',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 加载规划详情
    async loadPlanningDetail() {
      if (!this.planningId || this.planningId === 'undefined') {
        console.error('无效的planningId:', this.planningId);
        uni.showToast({
          title: '规划ID无效',
          icon: 'none'
        });
        return;
      }

      try {
        this.loading = true;
        console.log('正在加载规划详情，ID:', this.planningId);
        const response = await getPlanningDetail(this.planningId);
        console.log('规划详情API响应:', response);
        this.planningData = response;
      } catch (error) {
        console.error('加载规划详情失败:', error);
        uni.showToast({
          title: '加载规划详情失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 加载任务列表
    async loadTasks() {
      if (!this.planningId || this.planningId === 'undefined') {
        console.error('无效的planningId:', this.planningId);
        return;
      }

      try {
        console.log('正在加载任务列表，规划ID:', this.planningId);
        const response = await getPlanningTasks(this.planningId);
        console.log('任务列表API响应:', response);
        this.tasks = response.tasks || [];
      } catch (error) {
        console.error('加载任务列表失败:', error);
        uni.showToast({
          title: '加载任务列表失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      }
    },

    // 返回world界面
    goBack() {
      uni.redirectTo({
        url: '/pages/world'
      });
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

    // 格式化日期
    formatDate(deadline) {
      if (!deadline) return "";
      const date = new Date(deadline);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },





    // 显示添加任务弹窗
    showAddTaskDialog() {
      this.showAddModal = true;
    },

    // 隐藏添加任务弹窗
    hideAddTaskDialog() {
      this.showAddModal = false;
      this.newTaskContent = '';
    },

    // 添加新任务
    async addTask() {
      if (!this.newTaskContent.trim()) {
        uni.showToast({
          title: '请输入任务内容',
          icon: 'none'
        });
        return;
      }

      try {
        console.log('正在创建任务，规划ID:', this.planningId, '内容:', this.newTaskContent.trim());
        const newTask = await createTask(this.planningId, {
          content: this.newTaskContent.trim()
        });
        console.log('任务创建成功:', newTask);
        this.tasks.push(newTask);
        this.hideAddTaskDialog();
        uni.showToast({
          title: '任务添加成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('添加任务失败:', error);
        uni.showToast({
          title: '添加任务失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      }
    },

    // 切换任务完成状态
    async toggleTask(index) {
      try {
        const task = this.tasks[index];
        if (!task || !task.task_id) {
          console.error('任务数据无效:', task);
          uni.showToast({
            title: '任务数据无效',
            icon: 'none'
          });
          return;
        }

        console.log('正在更新任务状态，任务ID:', task.task_id, '新状态:', !task.completed);
        const updatedTask = await updateTask(task.task_id, {
          completed: !task.completed
        });
        console.log('任务状态更新成功:', updatedTask);
        this.tasks[index].completed = updatedTask.completed;
        uni.showToast({
          title: updatedTask.completed ? '任务已完成' : '任务已取消完成',
          icon: 'success'
        });
      } catch (error) {
        console.error('更新任务状态失败:', error);
        uni.showToast({
          title: '更新任务状态失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      }
    },

    // 删除任务
    deleteTask(index) {
      const task = this.tasks[index];
      if (!task || !task.task_id) {
        console.error('任务数据无效:', task);
        uni.showToast({
          title: '任务数据无效',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              console.log('正在删除任务，任务ID:', task.task_id);
              await deleteTask(task.task_id);
              this.tasks.splice(index, 1);
              console.log('任务删除成功');
              uni.showToast({
                title: '任务删除成功',
                icon: 'success'
              });
            } catch (error) {
              console.error('删除任务失败:', error);
              uni.showToast({
                title: '删除任务失败: ' + (error.message || '未知错误'),
                icon: 'none'
              });
            }
          }
        }
      });
    }
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 140rpx;
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
  cursor: pointer;
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
  padding: 0 40rpx 40rpx;
}

.title-text {
  font-size: 48rpx;
  color: white;
  font-weight: 500;
}

/* 规划卡片 */
.planning-card {
  margin: 0 40rpx;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 60rpx 40rpx;
  text-align: center;
  color: white;
  position: relative;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 30rpx;
  display: block;
}

.countdown-display {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 30rpx 0;
}

.countdown-number {
  font-size: 100rpx;
  font-weight: bold;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.countdown-unit {
  font-size: 28rpx;
  font-weight: 500;
  margin-left: 8rpx;
  margin-bottom: 8rpx;
  text-shadow: 1rpx 1rpx 4rpx rgba(0, 0, 0, 0.3);
}

.countdown-expired {
  font-size: 48rpx;
  font-weight: 600;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.deadline-text {
  font-size: 24rpx;
  opacity: 0.9;
}

/* 进度条区域 */
.progress-section {
  padding: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.progress-text {
  font-size: 28rpx;
  color: #666;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* Todo Section */
.todo-section {
  padding: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.add-task-btn {
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.add-task-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 任务列表 */
.task-list {
  margin-top: 20rpx;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease;
}

.task-item.completed .task-checkbox {
  background: #4caf50;
  border-color: #4caf50;
}

.checkbox-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.task-content {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.task-content.task-completed {
  text-decoration: line-through;
  color: #999;
}

.task-actions {
  margin-left: 20rpx;
}

.delete-btn {
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.15);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
}

.delete-btn:active {
  opacity: 0.8;
  transform: scale(0.9);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
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

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: white;
}
</style>