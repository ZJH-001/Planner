// src/api/index.js
import request from '../utils/request';
const BASE_URL = 'https://uvpddncsycmr.sealoshzh.site';
// ===================================
// 1. 用户认证接口 (Auth)
// ===================================

/**
 * 1. 用户登录
 * @param {string} username - 用户名/手机号
 * @param {string} password - 密码
 * @param {boolean} rememberMe - 记住我
 */
export const login = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data: data,
  });
};

/**
 * 2. 用户注册
 * @param {string} username - 用户名
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 */
export const register = (data) => {
  return request({
    url: '/api/auth/register',
    method: 'POST',
    data: data,
  });
};

/**
 * 3. 退出登录
 */
export const logout = () => {
  return request({
    url: '/api/auth/logout',
    method: 'POST',
  });
};

/**
 * 4. 忘记密码 (重置密码)
 * @param {string} phone - 手机号
 * @param {string} verificationCode - 验证码
 * @param {string} newPassword - 新密码
 */
export const forgetPassword = (data) => {
  return request({
    url: '/api/auth/forget-password',
    method: 'POST',
    data: data,
  });
};


// ===================================
// 2. 用户信息接口 (User)
// ===================================

/**
 * 5. 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/api/user/info',
    method: 'GET',
  });
};

/**
 * 6. 更新用户信息
 * @param {object} data - 包含 username, avatar, description
 */
export const updateUserInfo = (data) => {
  return request({
    url: '/api/user/update',
    method: 'PUT',
    data: data,
  });
};

/**
 * 7. 修改密码
 * @param {object} data - 包含 oldPassword, newPassword, confirmPassword
 */
export const changePassword = (data) => {
  return request({
    url: '/api/user/change-password',
    method: 'PUT',
    data: data,
  });
};


// ===================================
// 3. 树洞功能接口 (Tree Posts)
// ===================================

/**
 * 8. 获取所有树洞信息 (列表，支持分页和筛选)
 * @param {object} params - 包含 page, size, topic, keyword
 */
export const getTreePosts = (params) => {
  return request({
    url: '/api/trees/posts',
    method: 'GET',
    data: params, // GET请求参数放在 data 字段，request会转为 query
  });
};

/**
 * 9/10. 获取帖子详情
 * @param {string} id - 帖子ID
 */
export const getPostDetail = (id) => {
  return request({
    url: `/api/trees/posts/${id}`,
    method: 'GET',
  });
};

/**
 * 11. 发布帖子
 * @param {object} data - 包含 title, content, images, topic
 */
export const publishPost = (data) => {
  // 注意：如果 data 中包含图片路径，且这些路径是 uni.uploadFile 返回的 URL，
  // 则可以直接发送给后端。如果需要先上传图片，请使用 uni.uploadFile
  return request({
    url: '/api/trees/posts',
    method: 'POST',
    data: data,
  });
};

/**
 * 12. 点赞/取消点赞帖子
 * @param {string} postId - 帖子ID
 */
export const likePost = (data) => {
  return request({
    url: `/api/trees/posts/like`,
    method: 'POST',
    data: { postId: data }
  });
};

/**
 * 13. 收藏/取消踩帖子
 * @param {string} postId - 帖子ID
 */
export const disLikePost = (data) => {
  return request({
    url: `/api/trees/posts/dislike`,
    method: 'POST',
    data: { postId: data }
  });
};





//上传图片
export const uploadFile = (filePath) => {

  const uploadUrl = BASE_URL + '/api/upload/upload_post_image'; // 后端图片上传接口
  console.log('后端接受路径：', uploadUrl);
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file', // 必须与后端接收文件的字段名一致 (request.files['file'])
      header: {
        //'Authorization': 'Bearer ' + uni.getStorageSync('token')
      },
      formData: {
      },
      success: (uploadRes) => {
        // uni.uploadFile 的 res.data 是字符串，需要 JSON.parse
        const resData = JSON.parse(uploadRes.data);

        if (uploadRes.statusCode === 200 && resData.code === 200) {
          // 图片上传成功
          resolve(resData.data.url);
        } else {
          // 图片上传失败
          reject(new Error(resData.message || `图片上传失败: ${uploadRes.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败或服务器无响应:', err));
      }
    });

    //监听上传进度 (可选)
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度:', res.progress);
    });
  });
}




// ===================================
// 4. 用户问卷接口 (Questionnaire)
// ===================================

/**
 * 提交用户问卷数据
 * @param {object} data - 问卷数据，包含用户基本信息、学业规划和个人发展信息
 */
export const submitQuestionnaire = (data) => {
  return request({
    url: '/api/user/questionnaire',
    method: 'POST',
    data: data,
  });
};

/**
 * 获取用户问卷数据
 * 如果用户之前填写过问卷，可以获取之前的数据
 */
export const getQuestionnaireData = () => {
  return request({
    url: '/api/user/questionnaire',
    method: 'GET',
  });
};

// ===================================
// 5. 个人成果管理接口 (Achievement)
// ===================================

/**
 * 获取个人成果列表
 * @param {string} category - 成果分类 (可选): 'academic', 'certificate', 'award', 'experience', 'work'
 */
export const getAchievements = (category = '') => {
  return request({
    url: '/api/achievements/get_achievement',
    method: 'GET',
    data: category ? { category } : {}
  });
};

/**
 * 添加新成果记录
 * @param {object} data - 成果数据
 * @param {string} data.title - 成果标题
 * @param {string} data.category - 成果分类
 * @param {string} data.description - 成果描述
 * @param {string} data.achievedDate - 获得时间
 * @param {string} data.organization - 颁发机构
 * @param {number} data.importance - 重要程度 (1-5)
 * @param {array} data.images - 相关图片数组
 * @param {array} data.tags - 标签数组
 */
export const addAchievement = (data) => {
  return request({
    url: '/api/achievements/add_achievement',
    method: 'POST',
    data: data
  });
};

/**
 * 更新成果信息
 * @param {number} id - 成果ID
 * @param {object} data - 更新的成果数据
 */
export const updateAchievement = (id, data) => {
  return request({
    url: `/api/achievements/update_achievement/${id}`,
    method: 'PUT',
    data: data
  });
};

/**
 * 删除成果记录
 * @param {number} id - 成果ID
 */
export const deleteAchievement = (id) => {
  return request({
    url: `/api/achievements/delete_achievement/${id}`,
    method: 'DELETE'
  });
};

/**
 * 获取成果统计信息
 */
export const getAchievementStats = () => {
  return request({
    url: '/api/achievements/get_achievement_stats',
    method: 'GET'
  });
};

/**
 * 上传成果相关图片
 * @param {string} filePath - 图片本地路径
 */
export const uploadAchievementImage = (filePath) => {
  const uploadUrl = BASE_URL + '/api/upload/upload_achievement_image'; // 后端成果图片上传接口
  console.log('成果图片上传路径：', uploadUrl);

  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file', // 必须与后端接收文件的字段名一致
      header: {
        // 'Authorization': 'Bearer ' + uni.getStorageSync('token')
      },
      formData: {},
      success: (uploadRes) => {
        // uni.uploadFile 的 res.data 是字符串，需要 JSON.parse
        const resData = JSON.parse(uploadRes.data);

        if (uploadRes.statusCode === 200 && resData.code === 200) {
          // 图片上传成功，返回图片URL
          resolve(resData.data.url);
        } else {
          // 图片上传失败
          reject(new Error(resData.message || `图片上传失败: ${uploadRes.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败或服务器无响应: ' + err));
      }
    });

    // 监听上传进度 (可选)
    uploadTask.onProgressUpdate((res) => {
      console.log('成果图片上传进度:', res.progress);
    });
  });
};

// ===================================
// 规划管理接口 (Planning Management)
// ===================================

/**
 * 1. 获取规划列表
 */
export const getPlannings = () => {
  return request({
    url: '/api/plannings',
    method: 'GET',
  });
};

/**
 * 2. 创建规划
 * @param {Object} data - 规划数据
 * @param {string} data.title - 规划名称（最大10字符）
 * @param {string} data.bgColor - 背景颜色（十六进制格式）
 * @param {string} data.deadline - 截止日期（YYYY-MM-DD格式）
 */
export const createPlanning = (data) => {
  return request({
    url: '/api/plannings',
    method: 'POST',
    data: data,
  });
};

/**
 * 3. 获取规划详情
 * @param {string} planningId - 规划ID
 */
export const getPlanningDetail = (planningId) => {
  return request({
    url: `/api/plannings/${planningId}`,
    method: 'GET',
  });
};

/**
 * 4. 更新规划
 * @param {string} planningId - 规划ID
 * @param {Object} data - 更新数据
 */
export const updatePlanning = (planningId, data) => {
  return request({
    url: `/api/plannings/${planningId}`,
    method: 'PUT',
    data: data,
  });
};

/**
 * 5. 删除规划
 * @param {string} planningId - 规划ID
 */
export const deletePlanning = (planningId) => {
  return request({
    url: `/api/plannings/${planningId}`,
    method: 'DELETE',
  });
};

// ===================================
// 任务管理接口 (Task Management)
// ===================================

/**
 * 1. 获取规划任务列表
 * @param {string} planningId - 规划ID
 */
export const getPlanningTasks = (planningId) => {
  return request({
    url: `/api/plannings/${planningId}/tasks`,
    method: 'GET',
  });
};

/**
 * 2. 创建任务
 * @param {string} planningId - 规划ID
 * @param {Object} data - 任务数据
 * @param {string} data.content - 任务内容（最大50字符）
 */
export const createTask = (planningId, data) => {
  return request({
    url: `/api/plannings/${planningId}/tasks`,
    method: 'POST',
    data: data,
  });
};

/**
 * 3. 更新任务
 * @param {string} taskId - 任务ID
 * @param {Object} data - 更新数据
 * @param {string} [data.content] - 任务内容
 * @param {boolean} [data.completed] - 完成状态
 */
export const updateTask = (taskId, data) => {
  return request({
    url: `/api/tasks/${taskId}`,
    method: 'PUT',
    data: data,
  });
};

/**
 * 4. 删除任务
 * @param {string} taskId - 任务ID
 */
export const deleteTask = (taskId) => {
  return request({
    url: `/api/tasks/${taskId}`,
    method: 'DELETE',
  });
};

/**
 * 5. 批量更新任务状态
 * @param {Array} taskUpdates - 任务更新数组
 * @param {string} taskUpdates[].task_id - 任务ID
 * @param {boolean} taskUpdates[].completed - 完成状态
 */
export const batchUpdateTasks = (taskUpdates) => {
  return request({
    url: '/api/tasks/batch-update',
    method: 'PUT',
    data: { task_updates: taskUpdates },
  });
};

// ===================================
// 8. 霍兰德职业兴趣测评接口 (Holland)
// ===================================

/**
 * 1. 检查用户测评状态
 * @returns {Promise} 返回用户测评状态信息
 */
export const getHollandStatus = () => {
  return request({
    url: '/api/holland/status',
    method: 'GET'
  });
};

/**
 * 2. 提交完整测评
 * @param {Object} answers - 答案对象，键为题目ID（字符串），值为选项（A/B/C/D）
 * @returns {Promise} 返回测评结果
 */
export const submitHollandTest = (answers) => {
  return request({
    url: '/api/holland/submit',
    method: 'POST',
    data: { answers }
  });
};

/**
 * 3. 获取测评结果
 * @param {string} testSessionId - 测评会话ID
 * @returns {Promise} 返回详细的测评结果
 */
export const getHollandResult = (testSessionId) => {
  return request({
    url: `/api/holland/result/${testSessionId}`,
    method: 'GET'
  });
};

/**
 * 4. 获取历史测评记录
 * @param {number} page - 页码，默认为1
 * @param {number} limit - 每页数量，默认为10，最大100
 * @returns {Promise} 返回历史测评记录
 */
export const getHollandHistory = (page = 1, limit = 10) => {
  return request({
    url: '/api/holland/history',
    method: 'GET',
    data: { page, limit }
  });
};