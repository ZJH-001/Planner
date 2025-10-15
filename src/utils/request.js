// src/utils/request.js
// 在该文件中，统一处理 Token 鉴权，可以在后端删去@jwt_required()来忽略token授权验证（401）
// ** 1. 定义后端基础地址 **
// 建议在统一的配置文件中管理，这里直接使用你提供的地址
const BASE_URL = 'https://uvpddncsycmr.sealoshzh.site'; 

/**
 * UniApp 统一网络请求封装函数
 * @param {Object} options - 请求配置对象
 * @param {string} options.url - 接口路径 (例如: '/api/auth/login')
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data={}] - 请求体数据或查询参数
 * @param {Object} [options.header={}] - 请求头
 * @param {boolean} [options.showLoading=true] - 是否显示加载提示
 */
const request = (options) => {
  const { 
    url, 
    method, 
    data = {}, 
    header = {}, 
    showLoading = true 
  } = options;
  // console.log('请求参数：', options);

  // ** 2. 统一处理 Token 鉴权 **
  const token = uni.getStorageSync('token');
  if (token) {
    // 假设后端使用 Bearer 方案，根据你后端的实际要求进行设置
    header['Authorization'] = `Bearer ${token}`; 
  }
  
  // ** 3. 显示 Loading 提示 **
  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: header,
      
      success: (res) => {
        const responseData = res.data;

        // ** 4. 统一隐藏 Loading **
        uni.hideLoading();

        // ** 5. 核心业务状态码处理 **
        if (responseData && responseData.code === 200) {
          // 200 成功，解析并返回 data 字段
          resolve(responseData.data);
          
        } else if (responseData && responseData.code === 401) {
          // 401: 权限问题（Token 失效或未登录）
          uni.showToast({ title: responseData.message || '请重新登录', icon: 'none' });
          // 清除旧 Token，跳转到登录页
          uni.removeStorageSync('token');
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/auth/login' }); // 使用 reLaunch 彻底关闭所有页面
          }, 1000);
          reject(responseData);
          
        } else {
          // 其他业务错误（如参数校验失败等）
          uni.showToast({ title: responseData.message || '请求失败', icon: 'error' });
          reject(responseData);
        }
      },
      
      fail: (err) => {
        // ** 6. 网络连接失败处理 **
        uni.hideLoading();
        uni.showToast({ title: '网络连接异常，请重试', icon: 'error' });
        reject(err);
      },
      
      complete: () => {
        // 请求完成，无论成功失败
        // 如果在 success 或 fail 中已经处理了 uni.hideLoading()，这里可以省略
      }
    });
  });
};

// ** 7. 确保默认导出 **
export default request;