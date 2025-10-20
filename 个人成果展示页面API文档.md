# 个人成果展示页面（look_at_me.vue）接口文档

## 📋 文档说明

本文档描述了 `src/pages/profile/look_at_me.vue` 页面所使用的所有后端接口。该页面用于展示和管理用户的个人成果，包括学术成就、技能证书、获奖荣誉、实践经历和作品展示等。

---

## 🔗 基础信息

- **基础 URL**: `https://uvpddncsycmr.sealoshzh.site`
- **认证方式**: Token 认证（通过请求头携带）
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 📡 接口列表

### 1. 获取用户信息

获取当前登录用户的基本信息，用于页面顶部展示用户头像、昵称等。

#### 接口详情

- **接口路径**: `/api/user/info`
- **请求方法**: `GET`
- **认证要求**: 需要登录

#### 请求参数

无

#### 请求示例

```javascript
getUserInfo()
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 123,
    "username": "张三",
    "nickname": "小明同学",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "organization": "某某大学",
    "major": "计算机科学与技术",
    "grade": "大三",
    "description": "热爱编程的学生"
  }
}
```

**失败响应**:
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

#### 数据模型

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户ID |
| username | string | 是 | 用户名 |
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| phone | string | 是 | 手机号 |
| email | string | 否 | 邮箱 |
| organization | string | 否 | 所属组织/学校 |
| major | string | 否 | 专业 |
| grade | string | 否 | 年级 |
| description | string | 否 | 个人简介 |

---

### 2. 获取成果列表

获取用户的所有成果记录，支持按分类筛选。

#### 接口详情

- **接口路径**: `/api/achievements/get_achievement`
- **请求方法**: `GET`
- **认证要求**: 需要登录

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category | string | 否 | 成果分类：'academic'(学术成就), 'certificate'(技能证书), 'award'(获奖荣誉), 'experience'(实践经历), 'work'(作品展示)。不传则返回全部 |

#### 请求示例

```javascript
// 获取全部成果
getAchievements()

// 获取指定分类的成果
getAchievements('academic')
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "title": "国家奖学金",
      "category": "award",
      "description": "因学业成绩优异获得国家奖学金",
      "achievedDate": "2024-10-15",
      "organization": "教育部",
      "importance": 5,
      "images": [
        "/uploads/achievement_1.jpg",
        "/uploads/achievement_2.jpg"
      ],
      "tags": ["奖学金", "荣誉", "国家级"],
      "createdAt": "2024-10-16T08:00:00.000Z",
      "updatedAt": "2024-10-16T08:00:00.000Z"
    },
    {
      "id": 2,
      "title": "计算机二级证书",
      "category": "certificate",
      "description": "通过全国计算机等级考试二级",
      "achievedDate": "2024-06-20",
      "organization": "教育部考试中心",
      "importance": 3,
      "images": ["/uploads/cert_1.jpg"],
      "tags": ["证书", "计算机"],
      "createdAt": "2024-06-25T08:00:00.000Z",
      "updatedAt": "2024-06-25T08:00:00.000Z"
    }
  ]
}
```

**失败响应**:
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

#### 数据模型

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 成果ID |
| title | string | 是 | 成果标题 |
| category | string | 是 | 成果分类 |
| description | string | 否 | 成果描述 |
| achievedDate | string | 否 | 获得日期 (YYYY-MM-DD) |
| organization | string | 否 | 颁发机构 |
| importance | number | 否 | 重要程度 (1-5) |
| images | array | 否 | 图片URL数组 |
| tags | array | 否 | 标签数组 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |

---

### 3. 添加成果记录

添加一条新的成果记录。

#### 接口详情

- **接口路径**: `/api/achievements/add_achievement`
- **请求方法**: `POST`
- **认证要求**: 需要登录
- **Content-Type**: `application/json`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 成果标题，最大长度50 |
| category | string | 是 | 成果分类：'academic', 'certificate', 'award', 'experience', 'work' |
| description | string | 否 | 成果描述，最大长度200 |
| achievedDate | string | 否 | 获得日期 (YYYY-MM-DD) |
| organization | string | 否 | 颁发机构，最大长度50 |
| importance | number | 否 | 重要程度 (1-5)，默认3 |
| images | array | 否 | 图片URL数组，最多3张 |
| tags | array | 否 | 标签数组 |

#### 请求示例

```javascript
addAchievement({
  title: "ACM程序设计竞赛省级二等奖",
  category: "award",
  description: "参加省级ACM程序设计竞赛，团队协作获得二等奖",
  achievedDate: "2024-05-15",
  organization: "中国计算机学会",
  importance: 4,
  images: [
    "/uploads/achievement_123.jpg",
    "/uploads/achievement_124.jpg"
  ],
  tags: ["竞赛", "编程", "团队合作"]
})
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 5,
    "title": "ACM程序设计竞赛省级二等奖",
    "category": "award",
    "description": "参加省级ACM程序设计竞赛，团队协作获得二等奖",
    "achievedDate": "2024-05-15",
    "organization": "中国计算机学会",
    "importance": 4,
    "images": [
      "/uploads/achievement_123.jpg",
      "/uploads/achievement_124.jpg"
    ],
    "tags": ["竞赛", "编程", "团队合作"],
    "createdAt": "2024-10-18T10:30:00.000Z",
    "updatedAt": "2024-10-18T10:30:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "参数错误：成果标题不能为空"
}
```

---

### 4. 更新成果记录

更新指定成果记录的信息。

#### 接口详情

- **接口路径**: `/api/achievements/update_achievement/{id}`
- **请求方法**: `PUT`
- **认证要求**: 需要登录
- **Content-Type**: `application/json`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 成果ID |

#### 请求参数

与添加成果接口相同，所有字段均为可选（至少提供一个要更新的字段）。

#### 请求示例

```javascript
updateAchievement(5, {
  title: "ACM程序设计竞赛省级一等奖",
  importance: 5,
  description: "参加省级ACM程序设计竞赛，团队协作获得一等奖（修正）"
})
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 5,
    "title": "ACM程序设计竞赛省级一等奖",
    "category": "award",
    "description": "参加省级ACM程序设计竞赛，团队协作获得一等奖（修正）",
    "achievedDate": "2024-05-15",
    "organization": "中国计算机学会",
    "importance": 5,
    "images": [
      "/uploads/achievement_123.jpg",
      "/uploads/achievement_124.jpg"
    ],
    "tags": ["竞赛", "编程", "团队合作"],
    "createdAt": "2024-10-18T10:30:00.000Z",
    "updatedAt": "2024-10-18T11:00:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "成果记录不存在"
}
```

---

### 5. 删除成果记录

删除指定的成果记录。

#### 接口详情

- **接口路径**: `/api/achievements/delete_achievement/{id}`
- **请求方法**: `DELETE`
- **认证要求**: 需要登录

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 成果ID |

#### 请求示例

```javascript
deleteAchievement(5)
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "成果记录不存在"
}
```

```json
{
  "code": 403,
  "message": "无权限删除该成果记录"
}
```

---

### 6. 获取成果统计信息

获取用户成果的统计数据，用于页面顶部展示。

#### 接口详情

- **接口路径**: `/api/achievements/get_achievement_stats`
- **请求方法**: `GET`
- **认证要求**: 需要登录

#### 请求参数

无

#### 请求示例

```javascript
getAchievementStats()
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalAchievements": 15,
    "totalAwards": 8,
    "totalCertificates": 5,
    "categoryStats": {
      "academic": 3,
      "certificate": 5,
      "award": 8,
      "experience": 4,
      "work": 2
    },
    "recentAchievements": [
      {
        "id": 15,
        "title": "优秀学生干部",
        "achievedDate": "2024-10-10"
      },
      {
        "id": 14,
        "title": "英语六级证书",
        "achievedDate": "2024-09-20"
      }
    ]
  }
}
```

**失败响应**:
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

#### 数据模型

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| totalAchievements | number | 是 | 成果总数 |
| totalAwards | number | 是 | 获奖总数 |
| totalCertificates | number | 是 | 证书总数 |
| categoryStats | object | 否 | 各分类统计 |
| recentAchievements | array | 否 | 最近的成果（前5条） |

---

### 7. 上传成果图片

上传成果相关的图片文件。

#### 接口详情

- **接口路径**: `/api/upload/upload_achievement_image`
- **请求方法**: `POST`
- **认证要求**: 需要登录
- **Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 图片文件，支持 jpg, jpeg, png, gif 格式，大小不超过 5MB |

#### 请求示例

```javascript
// 前端使用 uni.uploadFile
uploadAchievementImage(tempFilePath)
```

**实际调用示例**:
```javascript
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success: async (res) => {
    const filePath = res.tempFilePaths[0];
    try {
      const imageUrl = await uploadAchievementImage(filePath);
      console.log('上传成功，图片URL:', imageUrl);
    } catch (error) {
      console.error('上传失败:', error);
    }
  }
});
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/achievements/20241018_123456_abc.jpg",
    "filename": "20241018_123456_abc.jpg",
    "size": 245678,
    "mimeType": "image/jpeg"
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "文件格式不支持"
}
```

```json
{
  "code": 400,
  "message": "文件大小超过限制（最大5MB）"
}
```

#### 数据模型

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| url | string | 是 | 图片URL（相对路径或完整URL） |
| filename | string | 否 | 文件名 |
| size | number | 否 | 文件大小（字节） |
| mimeType | string | 否 | 文件MIME类型 |

---

## 🔐 认证说明

所有接口都需要在请求头中携带认证令牌：

```javascript
// request.js 中自动添加
headers: {
  'Authorization': 'Bearer ' + uni.getStorageSync('token')
}
```

如果 Token 无效或过期，接口会返回 401 状态码，前端应跳转到登录页面。

---

## 📊 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {} // 或 []
}
```

### 错误响应

```json
{
  "code": 400/401/403/404/500,
  "message": "错误信息描述",
  "data": null
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或登录已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 🎯 使用示例

### 完整的成果管理流程

```javascript
// 1. 页面加载时获取数据
async onLoad() {
  // 获取用户信息
  const userInfo = await getUserInfo();
  this.userInfo = userInfo;
  
  // 获取成果列表
  const achievements = await getAchievements();
  this.achievements = achievements;
  
  // 获取统计信息
  const stats = await getAchievementStats();
  this.stats = stats;
}

// 2. 添加新成果
async addNewAchievement() {
  // 先上传图片
  const imageUrls = [];
  for (const localPath of this.selectedImages) {
    const url = await uploadAchievementImage(localPath);
    imageUrls.push(url);
  }
  
  // 提交成果数据
  await addAchievement({
    title: this.formData.title,
    category: this.formData.category,
    description: this.formData.description,
    achievedDate: this.formData.achievedDate,
    organization: this.formData.organization,
    importance: this.formData.importance,
    images: imageUrls,
    tags: this.formData.tags
  });
  
  // 刷新列表
  this.loadAchievements();
}

// 3. 编辑成果
async updateExistingAchievement(id) {
  await updateAchievement(id, {
    title: this.formData.title,
    importance: this.formData.importance
  });
  
  // 刷新列表
  this.loadAchievements();
}

// 4. 删除成果
async removeAchievement(id) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条成果记录吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteAchievement(id);
        this.loadAchievements();
      }
    }
  });
}
```

---

## ⚠️ 注意事项

1. **图片上传**
   - 图片需要先通过 `uploadAchievementImage` 上传，获取 URL 后再提交成果数据
   - 单次最多上传3张图片
   - 建议压缩图片后再上传，提升上传速度

2. **数据验证**
   - 成果标题为必填项，不能为空
   - 成果分类必须是预定义的5种之一
   - 重要程度范围为 1-5

3. **权限控制**
   - 用户只能查看、编辑、删除自己的成果记录
   - 未登录用户无法访问任何接口

4. **性能优化**
   - 成果列表支持按分类筛选，减少数据传输量
   - 图片使用懒加载，优化页面加载速度

5. **错误处理**
   - 所有接口调用都应使用 try-catch 捕获错误
   - 网络错误时应提示用户重试

---

## 📝 更新日志

### v1.0.0 (2024-10-18)
- 初始版本
- 实现成果的增删改查功能
- 支持图片上传
- 提供统计信息接口

---

## 📧 联系方式

如有接口问题或建议，请联系后端开发团队。

