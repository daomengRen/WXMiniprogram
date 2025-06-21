// pages/achievements/achievements.js
const DataManager = require('../../utils/dataManager');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stats: {
      totalDays: 0,
      totalTrainings: 0
    },
    artStats: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadStats();
  },

  /**
   * 加载统计数据
   */
  loadStats() {
    // 获取训练统计数据
    const stats = DataManager.getTrainingStats();
    this.setData({ stats });
    
    // 获取各个动作的统计数据
    const arts = app.globalData.arts;
    const artStats = [];
    
    arts.forEach(art => {
      const stats = DataManager.getArtStats(art.id);
      artStats.push({
        id: art.id,
        name: art.name,
        icon: art.icon,
        totalTrainings: stats.totalTrainings,
        levelStats: stats.levelStats
      });
    });
    
    this.setData({ artStats });
  },

  /**
   * 查看动作详情
   */
  viewArtDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/artDetail/artDetail?id=${id}`
    });
  },

  /**
   * 导出所有数据
   */
  exportData() {
    DataManager.exportAllData();
  },

  /**
   * 导入数据
   */
  importData() {
    wx.showModal({
      title: '导入数据',
      content: '导入数据时，请确保文件来自微信聊天记录中的文件。\n\n注意：导入新数据将覆盖当前所有数据，请谨慎操作。',
      confirmText: '继续导入',
      confirmColor: '#1677ff',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.chooseMessageFile({
            count: 1,
            type: 'file',
            extension: ['json', 'txt'],
            success: (res) => {
              const tempFilePath = res.tempFiles[0].path;
              const success = DataManager.importAllData(tempFilePath);
              
              if (success) {
                // 更新全局数据
                const arts = DataManager.loadArts();
                if (arts) {
                  app.globalData.arts = arts;
                }
                
                // 重新加载统计数据
                this.loadStats();
                
                wx.showToast({
                  title: '导入成功',
                  icon: 'success'
                });
                
                // 延迟一下再刷新所有相关页面，确保数据已更新
                setTimeout(() => {
                  this.refreshAllPages();
                }, 500);
              } else {
                wx.showToast({
                  title: '导入失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
  },

  /**
   * 刷新所有相关页面
   */
  refreshAllPages() {
    const pages = getCurrentPages();
    
    pages.forEach(page => {
      const route = page.route;
      
      // 根据页面路由决定刷新方式
      switch (route) {
        case 'pages/achievements/achievements':
          // 当前页面，重新加载统计数据
          page.loadStats();
          break;
          
        case 'pages/arts/arts':
          // 六艺页面，重新加载动作数据
          if (page.loadArts) {
            page.loadArts();
          } else if (page.onLoad) {
            page.onLoad();
          }
          break;
          
        case 'pages/dailyTraining/dailyTraining':
          // 训练记录页面，重新加载训练数据
          if (page.loadDailyTrainings) {
            page.loadDailyTrainings(page.data.selectedDate);
          } else if (page.onLoad) {
            page.onLoad();
          }
          break;
          
        case 'pages/index/index':
          // 首页，如果有相关数据需要刷新
          if (page.onShow) {
            page.onShow();
          }
          break;
          
        default:
          // 其他页面，尝试调用onShow方法
          if (page.onShow) {
            page.onShow();
          }
          break;
      }
    });
    
    console.log('所有相关页面已刷新');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadStats();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})