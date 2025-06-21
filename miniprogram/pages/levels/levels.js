const app = getApp()
const DataManager = require('../../utils/dataManager')

Page({
  data: {
    art: null,
    // 基础动作的难度名称
    difficultyNames: ['初级', '中级', '高级', '自由'],
    isBaseArt: false,
    showModal: false,
    newLevelName: '',
    editLevelId: null
  },

  onLoad(options) {
    const { artId } = options
    
    // 从全局变量获取动作数据，确保使用最新的数据
    const arts = app.globalData.arts || []
    const art = arts.find(a => a.id === parseInt(artId))
    
    if (art) {
      // 检查是否是基础动作（id 1-6 是基础动作）
      const isBaseArt = art.id >= 1 && art.id <= 6
      
      // console.log(`加载动作: ${art.name}, 级别数量: ${art.levels ? art.levels.length : 0}`);
      
      this.setData({
        art,
        isBaseArt
      })
    } else {
     console.error(`未找到ID为 ${artId} 的动作`);
      wx.showToast({
        title: '加载动作失败',
        icon: 'none'
      })
    }
  },

  navigateToDetail(e) {
    const level = e.currentTarget.dataset.level
    const difficulty = e.currentTarget.dataset.difficulty
    wx.navigateTo({
      url: `/pages/difficulty/difficulty?artId=${this.data.art.id}&levelId=${level.id}&difficulty=${difficulty}`
    })
  },

  showAddLevelModal() {
    this.setData({
      showModal: true,
      newLevelName: '',
      editLevelId: null
    })
  },

  hideModal() {
    this.setData({
      showModal: false
    })
  },

  onLevelNameInput(e) {
    this.setData({
      newLevelName: e.detail.value
    })
  },

  confirmAddLevel() {
    if (!this.data.newLevelName.trim()) {
      wx.showToast({
        title: '请输入关卡名称',
        icon: 'none'
      })
      return
    }

    // 使用全局数据
    const arts = app.globalData.arts || []
    const artIndex = arts.findIndex(a => a.id === this.data.art.id)
    
    if (artIndex === -1) return

    // 如果是基础动作，需要保留原有的难度配置
    if (this.data.isBaseArt) {
      const levelIndex = arts[artIndex].levels.findIndex(l => l.id === this.data.editLevelId)
      if (levelIndex !== -1) {
        // 编辑现有关卡
        const originalLevel = arts[artIndex].levels[levelIndex];
        arts[artIndex].levels[levelIndex] = {
          ...originalLevel,
          name: this.data.newLevelName
        }
      } else {
        // 添加新关卡
        const newLevel = {
          id: (this.data.art.levels.length + 1),
          name: this.data.newLevelName
        }
        arts[artIndex].levels.push(newLevel)
      }
    } else {
      // 非基础动作
      if (this.data.editLevelId) {
        // 编辑模式
        const levelIndex = arts[artIndex].levels.findIndex(l => l.id === this.data.editLevelId)
        if (levelIndex !== -1) {
          const originalLevel = arts[artIndex].levels[levelIndex];
          arts[artIndex].levels[levelIndex] = {
            ...originalLevel,
            name: this.data.newLevelName
          }
        }
      } else {
        // 添加新关卡
        const newLevel = {
          id: (this.data.art.levels.length + 1),
          name: this.data.newLevelName
        }
        arts[artIndex].levels.push(newLevel)
      }
    }
    
    this.setData({
      art: arts[artIndex],
      showModal: false,
      newLevelName: '',
      editLevelId: null
    })

    // 使用 DataManager 保存数据
    DataManager.saveArts(arts);
    app.globalData.arts = arts

    wx.showToast({
      title: this.data.editLevelId ? '修改成功' : '添加成功',
      icon: 'success'
    })
  },

  showEditLevelModal(e) {
    const level = e.currentTarget.dataset.level
    this.setData({
      showModal: true,
      newLevelName: level.name,
      editLevelId: level.id
    })
  },

  deleteLevel(e) {
    const level = e.currentTarget.dataset.level
    
    wx.showModal({
      title: '删除确认',
      content: `您确定要删除关卡"${level.name}"吗？\n\n删除后将无法恢复，请谨慎操作。`,
      confirmText: '确认删除',
      confirmColor: '#1677ff',
      cancelText: '我再想想',
      cancelColor: '#262626',
      success: (res) => {
        if (res.confirm) {
          // 使用全局数据
          const arts = app.globalData.arts || []
          const artIndex = arts.findIndex(a => a.id === this.data.art.id)
          
          if (artIndex === -1) return
          
          // 删除关卡
          arts[artIndex].levels = arts[artIndex].levels.filter(l => l.id !== level.id)
          
          this.setData({
            art: arts[artIndex]
          })
          
          // 使用 DataManager 保存数据
          DataManager.saveArts(arts);
          app.globalData.arts = arts
          
          wx.showToast({
            title: '已成功删除',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  }
}) 