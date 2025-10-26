// src/api/chat.js
import request from '../utils/request';

/**
 * 创建系统提示词，融合用户个人信息和问卷数据
 * @param {object} userData - 用户个人信息和问卷数据
 */
const createSystemPrompt = (userData) => {
  const {
    nickname = '同学',
    grade = '未知',
    major = '未知',
    gender = '未知',
    graduateStudy,
    careerDirection = '未知',
    academicSkills = [],
    hobbies = [],
    careerHelp = '未知',
    collegeGoals = '未知'
  } = userData || {};

  const graduateStudyText = graduateStudy === true ? '是' : graduateStudy === false ? '否' : '未知';
  const skillsText = academicSkills.length > 0 ? academicSkills.join('、') : '未知';
  const hobbiesText = hobbies.length > 0 ? hobbies.join('、') : '未知';

  return `你是未来流生涯规划助手，一个专业的大学生职业生涯规划顾问。请基于以下用户信息提供个性化的生涯规划建议：

用户信息：
- 姓名：${nickname}
- 年级：${grade}
- 专业：${major}
- 性别：${gender}
- 是否考虑研究生：${graduateStudyText}
- 职业发展方向：${careerDirection}
- 学术技能：${skillsText}
- 兴趣爱好：${hobbiesText}
- 职业发展需求：${careerHelp}
- 大学目标：${collegeGoals}

请你：
1. 以温暖、专业的语气与用户交流
2. 根据用户的具体情况提供个性化建议
3. 结合用户的专业、兴趣和目标给出实用的指导
4. 鼓励用户思考和规划自己的未来
5. 提供具体可行的行动建议
6. 回答要有条理，重点突出

请用中文回答，语气要亲切专业。`;
};

/**
 * 解析DeepSeek流式响应数据
 * @param {string} chunk - 接收到的数据块
 * @param {function} onMessage - 消息回调函数
 * @param {function} onComplete - 完成回调函数
 * @param {function} onError - 错误回调函数
 */
const parseStreamChunk = (chunk, onMessage, onComplete, onError) => {
  try {
    // DeepSeek返回的是SSE格式，每行以data:开头
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') continue;
      
      if (trimmedLine === 'data: [DONE]') {
        // 流式响应结束
        onComplete({ status: 'success' });
        return;
      }
      
      if (trimmedLine.startsWith('data: ')) {
        try {
          const jsonStr = trimmedLine.substring(6); // 移除'data: '前缀
          const data = JSON.parse(jsonStr);
          
          // 检查是否有内容
          if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
            const content = data.choices[0].delta.content;
            onMessage(content);
          }
          
          // 检查是否完成
          if (data.choices && data.choices[0] && data.choices[0].finish_reason) {
            onComplete({ status: 'success', finish_reason: data.choices[0].finish_reason });
            return;
          }
          
        } catch (parseError) {
          console.warn('解析JSON失败:', parseError, '原始数据:', trimmedLine);
          // 继续处理其他行，不中断整个流程
        }
      }
    }
  } catch (error) {
    console.error('解析流数据失败:', error);
    onError(error);
  }
};

/**
 * 发送聊天消息到DeepSeek API
 * @param {string} message - 用户消息内容
 * @param {object} userData - 用户个人信息和问卷数据
 * @param {array} history - 聊天历史记录
 * @param {function} onMessage - 实时消息回调
 * @param {function} onComplete - 完成回调
 * @param {function} onError - 错误回调
 */
// export可以让其他文件improt进去
export const sendChatMessage = (message, userData, history = [], onMessage, onComplete, onError) => {
  console.log('发送消息:', message, '历史记录长度:', history.length);
  
  // 构建消息数组
  const messages = [
    {
      role: 'system',
      content: createSystemPrompt(userData)
    },
    ...history,
    {
      role: 'user',
      content: message
    }
  ];

  // 限制历史消息长度，避免token超限
  const maxHistoryLength = 10; // 保留最近10轮对话
  if (messages.length > maxHistoryLength + 2) { // +2 是system message和当前user message
    const systemMessage = messages[0];
    const currentMessage = messages[messages.length - 1];
    const recentHistory = messages.slice(-(maxHistoryLength + 1), -1); // 保留最近的历史消息
    messages.splice(0, messages.length, systemMessage, ...recentHistory, currentMessage);
  }

  // 构建请求数据
  const requestData = {
    model: 'deepseek-chat',
    messages: messages,
    stream: true,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.9
  };

  console.log('请求数据:', requestData);

  // 发起请求
  const requestTask = uni.request({
    url: 'https://api.deepseek.com/v1/chat/completions',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-bd2d9cf501f141748fac944967a3f060'
    },
    data: requestData,
    enableChunked: true,
    success: (res) => {
      console.log('请求成功:', res.statusCode);
      if (res.statusCode !== 200) {
        onError(new Error(`API请求失败，状态码: ${res.statusCode}`));
      }
      // 注意：在流式模式下，success回调可能在所有数据接收完成后才触发
      // 实际的数据处理在onChunkReceived中进行
    },
    fail: (error) => {
      console.error('请求失败:', error);
      onError(new Error(`网络请求失败: ${error.errMsg || JSON.stringify(error)}`));
    }
  });

  // 处理流式数据
  let buffer = ''; // 用于缓存不完整的数据块
  
  requestTask.onChunkReceived((res) => {
    try {
      // 将接收到的数据转换为文本
      const uint8Array = new Uint8Array(res.data);
      let chunk = '';
      
      // 尝试UTF-8解码
      try {
        chunk = new TextDecoder('utf-8').decode(uint8Array);
      } catch (decodeError) {
        // 如果UTF-8解码失败，使用备用方法
        chunk = String.fromCharCode.apply(null, uint8Array);
        try {
          chunk = decodeURIComponent(escape(chunk));
        } catch (e) {
          // 如果仍然失败，直接使用原始字符串
        }
      }
      
      // 将新数据添加到缓冲区
      buffer += chunk;
      
      // 按行分割处理
      const lines = buffer.split('\n');
      
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || '';
      
      // 处理完整的行
      if (lines.length > 0) {
        const completeChunk = lines.join('\n');
        parseStreamChunk(completeChunk, onMessage, onComplete, onError);
      }
      
    } catch (error) {
      console.error('处理数据块失败:', error);
      onError(error);
    }
  });

  // 返回请求任务，允许外部取消
  return requestTask;
};

/**
 * 获取聊天历史记录
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 */
export const getChatHistory = (page = 1, limit = 20) => {
  return request({
    url: '/api/chat/history',
    method: 'GET',
    data: { page, limit }
  });
};

/**
 * 清除聊天历史
 */
export const clearChatHistory = () => {
  return request({
    url: '/api/chat/clear',
    method: 'POST'
  });
};

export default {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
};
