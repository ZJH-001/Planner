# 未来流生涯规划平台 - 后端接口需求文档

## 目录
1. [用户认证接口](#用户认证接口)
2. [用户信息接口](#用户信息接口)
3. [树洞功能接口](#树洞功能接口)
4. [组织管理接口](#组织管理接口)
5. [文件上传接口](#文件上传接口)
6. [系统设置接口](#系统设置接口)

## 用户认证接口

### 1. 用户登录
- **接口路径**: `/api/auth/login`
- **请求方式**: POST
- **请求参数**:
  ```json
  {
    "username": "用户名/手机号",
    "password": "密码",
    "rememberMe": true/false
  }
  ```响应数据：
  {
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "认证令牌",
    "userId": "用户ID",
    "username": "用户名",
    "avatar": "头像URL",
    "role": "用户角色"
  }
}

### 2. 用户注册
- **接口路径**: `/api/auth/register`
- **请求方式**: POST
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "phone": "手机号",
    "password": "密码"
  }
  ```响应数据：
  {
  "code": 200,
  "message": "注册成功",
  "data": null
}

### 3. 退出登录
- **接口路径**: `/api/auth/logout`
- **请求方式**: POST
- **请求参数**: 无
- **响应数据**:
  ```json
  {
    "code": 200,
    "message": "退出成功"
  }
### 4. 忘记密码
- **接口路径**: `/api/auth/forget-password`
- **请求方式**: POST
- **请求参数**:
  ```json
  {
    "phone": "手机号",
    "verificationCode": "验证码",
    "newPassword": "新密码"
  }
  ```响应数据：
  ```json
  {
    "code": 200,
    "message": "密码重置成功"
  }

### 5. 获取用户信息
- **接口路径**: `/api/user/info`
- **请求方式**: GET
- **请求参数**: 无
- **响应数据**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "userId": "用户ID",
      "username": "用户名",
      "avatar": "头像URL",
      "description": "用户描述",
      "phone": "手机号",
      "organization": "所属组织",
      "role": "用户角色"
    }
  
### 6. 更新用户信息
- **接口路径**: `/api/user/update`
- **请求方式**: PUT
- **请求参数**:
  ```json
  {
    "username": "用户名",
    "avatar": "头像URL",
    "description": "用户描述"
  }
  ```响应数据：
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "userId": "用户ID",
      "username": "用户名",
      "avatar": "头像URL",
      "description": "用户描述"
    }
  }
  ```
- ### 7.修改密码
- **接口路径**: `/api/user/change-password`
- **请求方式**: PUT
- **请求参数**:
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码",
    "confirmPassword": "确认密码"
  }
  ```响应数据：
  ```json
  {
    "code": 200,
    "message": "密码修改成功"
  }





### 8.获取所有树洞信息
- 接口路径 : /api/trees/posts
- 请求方式 : GET
- 请求参数 :
```
?page=1&size=10&topic=全部&
keyword=搜索关键词
```
- 响应数据 :
```
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "pages": 10,
    "currentPage": 1,
    "posts": [
      {
        "id": "帖子ID",
        "title": "帖子标题",
        "content": "帖子内容",
        "images": ["图片URL1", "
        图片URL2"],
        "topic": "话题",
        "userId": "用户ID",
        "userName": "用户名",
        "userAvatar": "用户头像",
        "time": "发布时间",
        "likes": 123,
        "comments": 456,
        "collects": 78
      }
    ]
  }

```
- ### 9.获取帖子详情
- **接口路径**: `/api/trees/posts/{id}`
- **请求方式**: GET
- **请求参数**: 无
- **响应数据**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "帖子ID",
      "title": "帖子标题",
      "content": "帖子内容",
      "images": ["图片URL1", "图片URL2"],
      "topic": "话题",
      "userId": "用户ID",
      "userName": "用户名",
      "userAvatar": "用户头像",
      "time": "发布时间",
      "likes": 123,
      "comments": 456,
      "collects": 78,
      "isLiked": true/false,
      "isCollected": true/false
    }
  }
### 10.获取帖子详情
接口路径: /api/trees/posts/{id}
请求方式: GET
请求参数: 无
响应数据:
 json: 
    {
    "code": 200,
    "message": "获取成功",
    "data": {
        "id": "帖子ID",
        "title": "帖子标题",
        "content": "帖子内容",
        "images": ["图片URL1", "图片URL2"],
        "topic": "话题",
        "userId": "用户ID",
        "userName": "用户名",
        "userAvatar": "用户头像",
        "time": "发布时间",
        "likes": 123,
        "comments": 456,
        "collects": 78,
        "isLiked": true/false,
        "isCollected": true/false
    }
}


###  发布帖子
- 接口路径 : /api/trees/posts
- 请求方式 : POST
- 请求参数 :
  ```
  {
    "title": "帖子标题",
    "content": "帖子内容",
    "images": ["图片URL1", "图片
    URL2"],
    "topic": "话题"
  }
  ```
- 响应数据 :
  ```
  {
    "code": 200,
    "message": "发布成功",
    "data": {
      "postId": "帖子ID"
    
  ```
