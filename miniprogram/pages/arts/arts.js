const app = getApp()
const DataManager = require('../../utils/dataManager')

Page({
  data: {
    arts: [],
    showModal: false,
    newArtName: '',
    selectedEmoji: '/images/record/default.png',
    isEdit: false,
    editIndex: -1,
    // 基础动作列表及其对应的图片路径
    baseArts: {
      '俯卧撑': '/images/record/push-up.png',
      '深蹲': '/images/record/squat.png',
      '引体向上': '/images/record/pull-up.png',
      '举腿': '/images/record/leg-raise.png',
      '桥': '/images/record/bridge.png',
      '倒立撑': '/images/record/handstand.png'
    }
  },

  onLoad() {
    this.loadArts();
  },

  onShow() {
    this.loadArts();
  },

  loadArts() {
    const colorMap = {
      '俯卧撑': 'pushup',
      '深蹲': 'squat',
      '引体向上': 'pullup',
      '举腿': 'legraise',
      '桥': 'bridge',
      '倒立撑': 'handstand'
    };
    
    // 使用全局数据
    const arts = (app.globalData.arts || []).map(art => ({
      ...art,
      colorClass: colorMap[art.name] || ''
    }));
    
    // console.log(`加载动作列表，共 ${arts.length} 个动作`);
    arts.forEach(art => {
      // console.log(`动作 ${art.name} 有 ${art.levels ? art.levels.length : 0} 个级别`);
    });
    
    this.setData({
      arts
    });
  },

  navigateToLevels(e) {
    const art = e.currentTarget.dataset.art
    // 使用自定义动画效果
    wx.navigateTo({
      url: `/pages/levels/levels?artId=${art.id}&artName=${art.name}`,
      animationType: 'slide-in-right',
      duration: 200,
      success: () => {
        // 预加载下一个页面的数据
        const pages = getCurrentPages()
        const nextPage = pages[pages.length - 1]
        if (nextPage) {
          nextPage.setData({
            artId: parseInt(art.id),
            artName: art.name,
            levels: art.levels
          })
        }
      }
    })
  },

  showAddModal() {
    this.setData({
      showModal: true,
      newArtName: '',
      selectedEmoji: '/images/record/default.png',
      isEdit: false,
      editIndex: -1
    })
  },

  showEditModal(e) {
    const index = e.currentTarget.dataset.index
    const art = this.data.arts[index]
    
    // 如果是基础动作，不允许编辑
    if (this.isBaseArt(art.name)) {
      wx.showToast({
        title: '基础动作不可编辑',
        icon: 'none'
      })
      return
    }

    this.setData({
      showModal: true,
      newArtName: art.name,
      selectedEmoji: art.icon,
      isEdit: true,
      editIndex: index
    })
  },

  hideModal() {
    this.setData({
      showModal: false
    })
  },

  onNameInput(e) {
    this.setData({
      newArtName: e.detail.value
    })
  },

  confirmAdd() {
    if (!this.data.newArtName.trim()) {
      wx.showToast({
        title: '请输入动作名称',
        icon: 'none'
      })
      return
    }

    // 如果是编辑基础动作，不允许修改
    if (this.data.isEdit && this.isBaseArt(this.data.arts[this.data.editIndex].name)) {
      wx.showToast({
        title: '基础动作不可修改',
        icon: 'none'
      })
      return
    }

    let newArt;
    if (this.data.isEdit) {
      // 编辑时保留原有数据
      const originalArt = this.data.arts[this.data.editIndex];
      newArt = {
        id: originalArt.id,
        name: this.data.newArtName,
        icon: originalArt.icon,
        levels: originalArt.levels || []
      };
    } else {
      // 新增时创建新对象
      newArt = {
        id: this.data.arts.length + 1,
        name: this.data.newArtName,
        icon: '/images/record/default.png',
        levels: []
      };
    }
    
    // 更新数据
    var newArts = this.data.arts.slice();
    if (this.data.isEdit) {
      newArts[this.data.editIndex] = newArt;
    } else {
      newArts.push(newArt);
    }
    
    this.setData({
      arts: newArts,
      showModal: false
    })
    
    // 更新全局数据和本地存储
    app.globalData.arts = newArts
    DataManager.saveArts(newArts);
    // console.log("保存的数据", newArts)
    
    wx.showToast({
      title: this.data.isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
  },

  deleteArt(e) {
    const index = e.currentTarget.dataset.index
    const art = this.data.arts[index]
    
    // 如果是基础动作，不允许删除
    if (this.isBaseArt(art.name)) {
      wx.showToast({
        title: '基础动作不可删除',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    wx.showModal({
      title: '删除确认',
      content: `您确定要删除动作"${art.name}"吗？\n\n删除后将无法恢复，请谨慎操作。`,
      confirmText: '确认删除',
      confirmColor: '#1677ff',
      cancelText: '我再想想',
      cancelColor: '#262626',
      success: (res) => {
        if (res.confirm) {
          var newArts = this.data.arts.filter(function(_, i) {
            return i !== index;
          });
          this.setData({
            arts: newArts
          })
          // 更新全局数据和本地存储
          app.globalData.arts = newArts
          DataManager.saveArts(newArts);
          wx.showToast({
            title: '已成功删除',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },

  isBaseArt(name) {
    return name in this.data.baseArts
  }
}) 