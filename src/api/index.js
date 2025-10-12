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



//上传图片
export const uploadFile = (filePath) => {

  const uploadUrl = BASE_URL + '/api/store/upload_post_image'; // 后端图片上传接口
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
            reject(new Error('网络请求失败或服务器无响应:',err));
          }
        });

        //监听上传进度 (可选)
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度:', res.progress);
        });
      });
    }






// ... (此处可以继续添加其他接口，如文件上传、组织管理等)