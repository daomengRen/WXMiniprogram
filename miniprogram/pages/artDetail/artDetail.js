const DataManager = require('../../utils/dataManager');
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    art: null,
    stats: {
      totalTrainings: 0,
      levelStats: {}
    },
    expandedLevels: {} // 记录每个级别的展开状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const artId = parseInt(options.id);
    
    // 获取动作信息
    const art = app.globalData.arts.find(a => a.id === artId);
    if (!art) {
      wx.showToast({
        title: '动作不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 初始化展开状态，所有动作默认折叠
    const expandedLevels = {};
    art.levels.forEach(level => {
      expandedLevels[level.id] = false;
    });
    
    this.setData({ 
      art,
      expandedLevels
    });
    
    // 获取动作统计数据
    const stats = DataManager.getArtStats(artId);
    this.setData({ stats });
  },

  /**
   * 切换级别的展开/折叠状态
   */
  toggleLevel(e) {
    const levelId = e.currentTarget.dataset.levelId;
    const expandedLevels = { ...this.data.expandedLevels };
    expandedLevels[levelId] = !expandedLevels[levelId];
    this.setData({ expandedLevels });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  }
}) 