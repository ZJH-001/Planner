# 个人成果管理接口文档 (Achievement API)

## 基础信息

**Base URL**: `https://uvpddncsycmr.sealoshzh.site`

**模块说明**: 个人成果管理模块，用于管理用户的学术成就、技能证书、获奖荣誉、实践经历和作品展示等成果信息。

---

## 接口列表

### 1. 获取个人成果列表

**接口地址**: `/api/achievements/get_achievement`

**请求方法**: `GET`

**接口说明**: 获取当前用户的成果列表，支持按分类筛选。

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category | string | 否 | 成果分类，可选值：<br>- `academic`: 学术成就<br>- `certificate`: 技能证书<br>- `award`: 获奖荣誉<br>- `experience`: 实践经历<br>- `work`: 作品展示<br>不传或传空字符串表示获取全部 |

**请求示例**:

```javascript
// 获取所有成果
const achievements = await getAchievements();

// 获取指定分类的成果
const awards = await getAchievements('award');
```

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "title": "全国大学生数学建模竞赛一等奖",
      "category": "award",
      "description": "参加2024年全国大学生数学建模竞赛，获得国家级一等奖",
      "achievedDate": "2024-09-15",
      "organization": "中国工业与应用数学学会",
      "importance": 5,
      "images": ["/uploads/achievement/image1.jpg"],
      "tags": ["数学建模", "竞赛", "国家级"],
      "createdAt": "2024-10-01T12:00:00Z",
      "updatedAt": "2024-10-01T12:00:00Z"
    }
  ]
}
```

---

### 2. 添加新成果记录

**接口地址**: `/api/achievements/add_achievement`

**请求方法**: `POST`

**接口说明**: 添加一条新的个人成果记录。

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 成果标题，最大长度50字符 |
| category | string | 是 | 成果分类，可选值：`academic`、`certificate`、`award`、`experience`、`work` |
| description | string | 是 | 成果描述，最大长度200字符 |
| achievedDate | string | 是 | 获得时间，格式：YYYY-MM-DD |
| organization | string | 否 | 颁发机构/组织名称 |
| importance | number | 是 | 重要程度，1-5的整数，5表示最重要 |
| images | array | 否 | 相关图片URL数组，最多3张 |
| tags | array | 否 | 标签数组，用于分类和检索 |

**请求示例**:

```javascript
const newAchievement = {
  title: "CET-6英语六级证书",
  category: "certificate",
  description: "大学英语六级考试成绩550分，获得证书",
  achievedDate: "2024-06-15",
  organization: "全国大学英语四、六级考试委员会",
  importance: 4,
  images: ["/uploads/cet6.jpg"],
  tags: ["英语", "证书", "六级"]
};

const result = await addAchievement(newAchievement);
```

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 2,
    "title": "CET-6英语六级证书",
    "category": "certificate",
    "description": "大学英语六级考试成绩550分，获得证书",
    "achievedDate": "2024-06-15",
    "organization": "全国大学英语四、六级考试委员会",
    "importance": 4,
    "images": ["/uploads/cet6.jpg"],
    "tags": ["英语", "证书", "六级"],
    "createdAt": "2024-10-18T10:30:00Z",
    "updatedAt": "2024-10-18T10:30:00Z"
  }
}
```

---

### 3. 更新成果信息

**接口地址**: `/api/achievements/update_achievement/{id}`

**请求方法**: `PUT`

**接口说明**: 更新指定ID的成果记录信息。

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 成果记录的ID |

**请求参数**:

与"添加新成果记录"相同，但所有字段都是可选的，只更新传入的字段。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 成果标题 |
| category | string | 否 | 成果分类 |
| description | string | 否 | 成果描述 |
| achievedDate | string | 否 | 获得时间 |
| organization | string | 否 | 颁发机构 |
| importance | number | 否 | 重要程度 |
| images | array | 否 | 相关图片数组 |
| tags | array | 否 | 标签数组 |

**请求示例**:

```javascript
const updateData = {
  title: "CET-6英语六级证书（优秀）",
  importance: 5,
  tags: ["英语", "证书", "六级", "优秀"]
};

const result = await updateAchievement(2, updateData);
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "title": "CET-6英语六级证书（优秀）",
    "category": "certificate",
    "description": "大学英语六级考试成绩550分，获得证书",
    "achievedDate": "2024-06-15",
    "organization": "全国大学英语四、六级考试委员会",
    "importance": 5,
    "images": ["/uploads/cet6.jpg"],
    "tags": ["英语", "证书", "六级", "优秀"],
    "createdAt": "2024-10-18T10:30:00Z",
    "updatedAt": "2024-10-18T11:00:00Z"
  }
}
```

---

### 4. 删除成果记录

**接口地址**: `/api/achievements/delete_achievement/{id}`

**请求方法**: `DELETE`

**接口说明**: 删除指定ID的成果记录。

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 要删除的成果记录ID |

**请求示例**:

```javascript
const result = await deleteAchievement(2);
```

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5. 获取成果统计信息

**接口地址**: `/api/achievements/get_achievement_stats`

**请求方法**: `GET`

**接口说明**: 获取当前用户的成果统计数据，包括总成就数、获奖次数、证书数量等。

**请求参数**: 无

**请求示例**:

```javascript
const stats = await getAchievementStats();
```

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalAchievements": 15,
    "totalAwards": 5,
    "totalCertificates": 8,
    "categoryStats": {
      "academic": 3,
      "certificate": 8,
      "award": 5,
      "experience": 2,
      "work": 1
    },
    "recentAchievements": [
      {
        "id": 1,
        "title": "全国大学生数学建模竞赛一等奖",
        "category": "award",
        "achievedDate": "2024-09-15"
      }
    ]
  }
}
```

---

### 6. 上传成果相关图片

**接口地址**: `/api/upload/achievement-image`

**请求方法**: `POST`

**接口说明**: 上传成果相关的图片文件。

**请求类型**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 图片文件，支持 jpg、png、gif 格式，最大 5MB |

**请求示例**:

```javascript
// 使用 uni.chooseImage 选择图片
uni.chooseImage({
  count: 1,
  success: async (res) => {
    const filePath = res.tempFilePaths[0];
    const imageUrl = await uploadAchievementImage(filePath);
    console.log('上传成功:', imageUrl);
  }
});
```

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/achievement/20241018_abc123.jpg",
    "filename": "20241018_abc123.jpg",
    "size": 245678
  }
}
```

---

## 数据模型

### Achievement (成果对象)

```typescript
interface Achievement {
  id: number;                    // 成果ID
  title: string;                 // 成果标题
  category: string;              // 成果分类
  description: string;           // 成果描述
  achievedDate: string;          // 获得时间 (YYYY-MM-DD)
  organization?: string;         // 颁发机构（可选）
  importance: number;            // 重要程度 (1-5)
  images?: string[];             // 图片URL数组（可选）
  tags?: string[];               // 标签数组（可选）
  createdAt: string;             // 创建时间 (ISO 8601)
  updatedAt: string;             // 更新时间 (ISO 8601)
}
```

### 成果分类 (Category)

| 值 | 说明 | 示例 |
|----|------|------|
| academic | 学术成就 | 论文发表、学术竞赛、研究项目 |
| certificate | 技能证书 | CET-4/6、计算机等级、专业资格证 |
| award | 获奖荣誉 | 奖学金、竞赛奖项、荣誉称号 |
| experience | 实践经历 | 实习经历、项目经验、志愿服务 |
| work | 作品展示 | 设计作品、编程项目、创作成果 |

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权 | 用户未登录，需要先登录 |
| 403 | 禁止访问 | 无权限操作该资源 |
| 404 | 资源不存在 | 检查成果ID是否正确 |
| 500 | 服务器内部错误 | 稍后重试或联系技术支持 |

---

## 使用示例

### 完整流程示例

```javascript
import { 
  getAchievements, 
  addAchievement, 
  updateAchievement, 
  deleteAchievement,
  getAchievementStats,
  uploadAchievementImage 
} from '@/api/index';

// 1. 获取所有成果
async function loadAllAchievements() {
  try {
    const achievements = await getAchievements();
    console.log('所有成果:', achievements);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

// 2. 获取特定分类的成果
async function loadAwardAchievements() {
  try {
    const awards = await getAchievements('award');
    console.log('获奖荣誉:', awards);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

// 3. 添加新成果（带图片上传）
async function addNewAchievement() {
  try {
    // 先上传图片
    uni.chooseImage({
      count: 1,
      success: async (res) => {
        const imageUrl = await uploadAchievementImage(res.tempFilePaths[0]);
        
        // 然后添加成果
        const newAchievement = {
          title: "全国大学生创新创业大赛金奖",
          category: "award",
          description: "团队项目获得省级金奖",
          achievedDate: "2024-10-15",
          organization: "教育部",
          importance: 5,
          images: [imageUrl],
          tags: ["创新创业", "竞赛", "金奖"]
        };
        
        const result = await addAchievement(newAchievement);
        console.log('添加成功:', result);
      }
    });
  } catch (error) {
    console.error('添加失败:', error);
  }
}

// 4. 更新成果
async function updateExistingAchievement(id) {
  try {
    const updateData = {
      importance: 5,
      tags: ["创新创业", "竞赛", "金奖", "国家级"]
    };
    
    const result = await updateAchievement(id, updateData);
    console.log('更新成功:', result);
  } catch (error) {
    console.error('更新失败:', error);
  }
}

// 5. 删除成果
async function removeAchievement(id) {
  try {
    await deleteAchievement(id);
    console.log('删除成功');
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 6. 获取统计信息
async function loadStats() {
  try {
    const stats = await getAchievementStats();
    console.log('统计信息:', stats);
  } catch (error) {
    console.error('获取统计失败:', error);
  }
}
```

---

## 注意事项

1. **认证要求**: 所有接口都需要用户登录后才能调用，需要在请求头中携带有效的认证令牌。

2. **图片上传**: 
   - 图片大小限制：单张最大 5MB
   - 支持格式：jpg、png、gif
   - 每个成果最多上传 3 张图片

3. **数据验证**:
   - title 长度：1-50 字符
   - description 长度：1-200 字符
   - importance 范围：1-5 的整数
   - achievedDate 格式：YYYY-MM-DD

4. **分页支持**: 目前接口返回所有数据，如需分页请联系后端添加支持。

5. **权限控制**: 用户只能操作自己的成果记录，无法访问或修改其他用户的数据。

---

## 更新日志

### v1.0.0 (2024-10-18)
- 初始版本发布
- 实现成果的增删改查功能
- 支持图片上传
- 提供统计信息接口

---

## 联系方式

如有疑问或需要技术支持，请联系：
- 项目仓库：[GitHub 链接]
- 技术支持邮箱：support@example.com

