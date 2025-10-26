<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    
    // 检查用户是否已登录
    const token = uni.getStorageSync('token');
    
    if (token) {
      // 用户已登录，检查是否完成过问卷
      const questionnaireCompleted = uni.getStorageSync('questionnaireCompleted');
      const questionnaireSkipped = uni.getStorageSync('questionnaireSkipped');
      
      // 如果用户既没有完成问卷，也没有跳过问卷，则跳转到问卷页面
      if (!questionnaireCompleted && !questionnaireSkipped) {
        // 使用 setTimeout 确保在应用初始化完成后再跳转
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/questionnaire'
          });
        }, 100);
      }
    }
    // 用户未登录，正常进入登录流程，登录后再检查问卷状态
  },
  
  onShow: function () {
    console.log('App Show')
  },
  
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
