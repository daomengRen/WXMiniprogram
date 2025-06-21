const app = getApp()
const DataManager = require('../../utils/dataManager')

Page({
  data: {
    art: null,
    level: null,
    difficulties: [],
    showModal: false,
    editIndex: -1,
    editDifficulty: null,
    isBaseArt: false,
    showAddModal: false,
    hasSelectedDifficulty: false,
    newDifficulty: {
      name: '',
      sets: 0,
      reps: 0,
      rest: 60,
      interval: 2,
      voiceType: 'system',
      time: 0
    }
  },

  onLoad(options) {
    const { artId, levelId } = options
    
    // 使用全局数据
    const arts = app.globalData.arts || []
    const art = arts.find(a => a.id === parseInt(artId))
    
    if (!art) {
     console.error(`未找到ID为 ${artId} 的动作`);
      wx.showToast({
        title: '加载动作失败',
        icon: 'none'
      });
      return;
    }
    
    const level = art.levels.find(l => l.id === parseInt(levelId))
    
    if (!level) {
     console.error(`未找到ID为 ${levelId} 的级别`);
      wx.showToast({
        title: '加载级别失败',
        icon: 'none'
      });
      return;
    }
    
    // console.log(`加载动作: ${art.name}, 级别: ${level.name}`);
    
      // 检查是否是基础动作（id 1-6 是基础动作）
      const isBaseArt = art.id >= 1 && art.id <= 6
      
      // 根据动作类型和关卡设置不同的难度数据
      let difficulties = []
    
    // 对于基础动作，始终使用内置配置，确保参数一致
      if (isBaseArt) {
        // 基础动作从配置中获取
      difficulties = this.getDifficultyData(art.id, level.id);
      // console.log(`使用基础动作内置配置，共 ${difficulties.length} 个难度`);
      
      // 检查是否有保存的用户自定义配置
      try {
        // 使用本地存储获取难度配置
        const configKey = `baseDifficultyConfig_${art.id}_${level.id}`;
        const savedConfig = wx.getStorageSync(configKey);
        if (savedConfig) {
          // console.log(`发现本地存储的配置，合并到内置配置`);
          // 使用保存的配置更新难度数据，但保留内置配置的基本参数
          difficulties = difficulties.map((diff, index) => {
            const type = ['primary', 'intermediate', 'advanced', 'free'][index]
            if (savedConfig[type]) {
              // 只合并用户可以自定义的参数
              return {
                ...diff,
                interval: savedConfig[type].interval || diff.interval,
                rest: savedConfig[type].rest || diff.rest,
                voiceType: savedConfig[type].voiceType || diff.voiceType,
                // 自由难度可以修改组数和次数
                ...(index === 3 ? {
                  sets: savedConfig[type].sets || diff.sets,
                  reps: savedConfig[type].reps || diff.reps
                } : {})
              }
            }
            return diff
          })
        }
      } catch (e) {
       console.error('读取本地存储配置失败:', e);
      }
      
      // 检查是否需要更新数据
      let needUpdate = false;
      
      // 检查level对象中是否已有difficulties，并比较是否有变化
      if (!level.difficulties || level.difficulties.length !== difficulties.length) {
        needUpdate = true;
      } else {
        // 深度比较两个难度数组是否有差异
        for (let i = 0; i < difficulties.length; i++) {
          const newDiff = difficulties[i];
          const oldDiff = level.difficulties[i];
          
          if (newDiff.sets !== oldDiff.sets || 
              newDiff.reps !== oldDiff.reps ||
              newDiff.interval !== oldDiff.interval ||
              newDiff.rest !== oldDiff.rest ||
              newDiff.voiceType !== oldDiff.voiceType) {
            needUpdate = true;
            break;
          }
        }
      }
      
      // 只有在配置有变化时才保存
      if (needUpdate) {
        // console.log('难度配置有变化，正在更新...');
        // 更新level对象中的难度配置
        level.difficulties = difficulties;
        // 更新全局数据
        DataManager.saveArts(arts);
        // 同时单独保存难度配置
        DataManager.saveDifficultyConfig(art.id, level.id, difficulties);
        // console.log(`将基础动作 ${art.name} 的级别 ${level.name} 的难度配置保存到文件`);
      } else {
        // console.log('难度配置无变化，无需更新');
      }
    }
    // 非基础动作，尝试从不同来源加载
    else {
      // 首先尝试从 level 对象中获取难度配置
      if (level.difficulties && level.difficulties.length > 0) {
        // console.log(`从级别对象中加载难度配置，共 ${level.difficulties.length} 个难度`);
        difficulties = level.difficulties;
      } 
      // 其次尝试从文件系统加载难度配置
      else {
        const loadedDifficulties = DataManager.loadDifficultyConfig(art.id, level.id);
        if (loadedDifficulties && loadedDifficulties.length > 0) {
          // console.log(`从文件系统加载难度配置，共 ${loadedDifficulties.length} 个难度`);
          difficulties = loadedDifficulties;
          
          // 更新 level 对象中的难度配置
          level.difficulties = loadedDifficulties;
          DataManager.saveArts(arts);
        } else {
          // 新添加的动作使用空数组
          difficulties = [];
          // console.log(`没有找到难度配置，使用空数组`);
      }
      }
    }
    
    // console.log(`最终加载难度数据: ${difficulties.length} 个难度`);
      
      this.setData({
        art,
        level,
        difficulties,
        isBaseArt
      })
  },

  // 获取难度数据
  getDifficultyData(artId, levelId) {
    // 如果是基础动作（id 1-6）
    if (artId >= 1 && artId <= 6) {
      // 使用app.js中的getDefaultDifficultyConfig方法获取默认难度配置
      return app.getDefaultDifficultyConfig(artId, levelId);
    }

    // 如果不是基础动作，返回空数组
    return []
  },

  navigateToDetail(e) {
    const difficulty = e.currentTarget.dataset.difficulty
    wx.navigateTo({
      url: `/pages/detail/detail?artId=${this.data.art.id}&levelId=${this.data.level.id}&difficultyId=${difficulty.id}`
    })
  },

  showEditModal(e) {
    const index = e.currentTarget.dataset.index
    const difficulty = this.data.difficulties[index]
    
    if (!difficulty) {
      return
    }
    
    
    this.setData({
      showModal: true,
      editIndex: index,
      editDifficulty: { ...difficulty }
    }, () => {
    })
  },

  hideModal() {
    this.setData({
      showModal: false
    })
  },

  onSetsInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'editDifficulty.sets': value
    });
    
    // 如果组数为1，组间休息设为0
    if (value === 1) {
      this.setData({
        'editDifficulty.rest': 0
      });
    }
    
    // 如果组数或次数有值，清空时间
    if (value > 0 || this.data.editDifficulty.reps > 0) {
      this.setData({
        'editDifficulty.time': 0
      });
    }
  },

  onRepsInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'editDifficulty.reps': value
    });
    
    // 如果组数或次数有值，清空时间
    if (value > 0 || this.data.editDifficulty.sets > 0) {
      this.setData({
        'editDifficulty.time': 0
      });
    }
  },

  onIntervalInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'editDifficulty.interval': value
    });
    
    // 如果次数间隔有值，清空时间
    if (value > 0) {
      this.setData({
        'editDifficulty.time': 0
      });
    }
  },

  onTimeInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'editDifficulty.time': value
    });
    
    // 如果时间有值，清空其他参数
    if (value > 0) {
      this.setData({
        'editDifficulty.sets': 0,
        'editDifficulty.reps': 0,
        'editDifficulty.interval': 0,
        'editDifficulty.rest': 0
      });
    }
  },

  onRestInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'editDifficulty.rest': value
    });
    
    // 如果组数为1，不允许设置组间休息
    if (this.data.editDifficulty.sets === 1) {
      this.setData({
        'editDifficulty.rest': 0
      });
    }
  },

  onVoiceTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    const { editDifficulty } = this.data
    
    // 检查时间或次数是否超过100
    const timeOrCount = editDifficulty.time > 0 ? editDifficulty.time : editDifficulty.reps;
    if (timeOrCount > 100 && type === 'human') {
      wx.showToast({
        title: '时间或次数超过100时只能使用系统音',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      'editDifficulty.voiceType': type
    })
  },

  deleteDifficulty(e) {
    const index = e.currentTarget.dataset.index
    const difficulty = this.data.difficulties[index]
    
    wx.showModal({
      title: '删除确认',
      content: `确定要删除"${difficulty.name}"难度吗？\n\n删除后将无法恢复，请谨慎操作。`,
      confirmText: '确认删除',
      confirmColor: '#1677ff',
      cancelText: '我再想想',
      cancelColor: '#262626',
      success: (res) => {
        if (res.confirm) {
          const newDifficulties = this.data.difficulties.filter((_, i) => i !== index)
          this.setData({
            difficulties: newDifficulties
          })
          
          // 更新存储
          this.updateStorage(newDifficulties)
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  saveSettings() {
    const { editDifficulty, editIndex, difficulties, isBaseArt, art, level } = this.data
    
    // 检查是否是倒立撑的特殊动作
    const isSpecialHandstand = art.id === 6 && (level.id === 1 || level.id === 2 || level.id === 3);
    
    // 检查时间或次数是否超过100
    const timeOrCount = editDifficulty.time > 0 ? editDifficulty.time : editDifficulty.reps;
    if (timeOrCount > 100 && editDifficulty.voiceType === 'human') {
      wx.showToast({
        title: '时间或次数超过100时只能使用系统音',
        icon: 'none'
      })
      return
    }
    
    // 如果不是倒立撑的特殊动作，才检查时间参数
    if (!isSpecialHandstand) {
      if (editDifficulty.interval <= 0 || editDifficulty.rest < 0) {
        wx.showToast({
          title: '请输入有效的时间',
          icon: 'none'
        })
        return
      }
    }

    // 检查组数和次数（自由难度或非基础动作）
    const isFreeDifficulty = editIndex === 3 // 自由难度是第4个（索引为3）
    if ((!isBaseArt || isFreeDifficulty) && (editDifficulty.sets <= 0 || editDifficulty.reps <= 0)) {
      wx.showToast({
        title: '请输入有效的组数和次数',
        icon: 'none'
      })
      return
    }
    
    // 更新难度设置
    const newDifficulties = [...difficulties]
    newDifficulties[editIndex] = {
      ...newDifficulties[editIndex],
      // 基础动作的自由难度或非基础动作可以修改所有参数
      ...((!isBaseArt || isFreeDifficulty) ? {
        sets: editDifficulty.sets,
        reps: editDifficulty.reps,
        interval: editDifficulty.interval,
        rest: editDifficulty.rest,
        voiceType: editDifficulty.voiceType
      } : {
        // 基础动作的其他难度只更新时间和语音类型
        interval: editDifficulty.interval,
        rest: editDifficulty.rest,
        voiceType: editDifficulty.voiceType
      })
    }
    
    this.setData({
      difficulties: newDifficulties,
      showModal: false
    })
    
    // 更新存储
    if (isBaseArt) {
      // 保存基础动作配置到本地存储
      try {
        // 使用本地存储获取难度配置
        const configKey = `baseDifficultyConfig_${art.id}_${level.id}`;
        const savedConfig = wx.getStorageSync(configKey) || {};
        const difficultyType = ['primary', 'intermediate', 'advanced', 'free'][editIndex];
        
        if (difficultyType) {
          // 更新配置
          savedConfig[difficultyType] = {
            ...savedConfig[difficultyType],
            ...(isFreeDifficulty ? {
              sets: editDifficulty.sets,
              reps: editDifficulty.reps,
              interval: editDifficulty.interval,
              rest: editDifficulty.rest,
              voiceType: editDifficulty.voiceType
            } : {
              interval: editDifficulty.interval,
              rest: editDifficulty.rest,
              voiceType: editDifficulty.voiceType
            })
          };
          
          wx.setStorageSync(configKey, savedConfig);
          // console.log(`保存基础动作 ${art.name} 的级别 ${level.name} 的 ${difficultyType} 难度配置`);
        }
      } catch (e) {
       console.error('保存难度配置失败:', e);
        wx.showToast({
          title: '保存配置失败',
          icon: 'none'
        });
      }
    }
    
    // 更新存储 - 同时保存到文件系统
    this.updateStorage(newDifficulties)
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    })
  },

  showAddDifficultyModal() {
    this.setData({
      showAddModal: true,
      newDifficulty: {
        name: '',
        sets: 0,
        reps: 0,
        rest: 60,
        interval: 2,
        voiceType: 'system',
        time: 0
      }
    });
  },

  hideAddModal() {
    this.setData({
      showAddModal: false
    });
  },

  onNewNameInput(e) {
    this.setData({
      'newDifficulty.name': e.detail.value
    });
  },

  onNewSetsInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'newDifficulty.sets': value
    });
    
    // 如果组数或次数有值，清空时间
    if (value > 0 || this.data.newDifficulty.reps > 0) {
      this.setData({
        'newDifficulty.time': 0
      });
    }
  },

  onNewSetsBlur(e) {
    const value = parseInt(e.detail.value) || 0;
    // 在输入完成后再判断组数是否为1
    if (value === 1) {
      this.setData({
        'newDifficulty.rest': 0
      });
    }
  },

  onNewRepsInput(e) {
    this.setData({
      'newDifficulty.reps': parseInt(e.detail.value) || 0
    });
  },

  onNewIntervalInput(e) {
    this.setData({
      'newDifficulty.interval': parseInt(e.detail.value) || 0
    });
  },

  onNewRestInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'newDifficulty.rest': value
    });
    
    // 如果组数为1，不允许设置组间休息
    if (this.data.newDifficulty.sets === 1) {
      this.setData({
        'newDifficulty.rest': 0
      });
    }
  },

  onNewTimeInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'newDifficulty.time': value
    });
    
    // 如果时间有值，清空其他参数
    if (value > 0) {
      this.setData({
        'newDifficulty.sets': 0,
        'newDifficulty.reps': 0,
        'newDifficulty.interval': 0,
        'newDifficulty.rest': 0
      });
    }
  },

  onNewVoiceTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    const { newDifficulty } = this.data
    
    // 检查时间或次数是否超过100
    const timeOrCount = newDifficulty.time > 0 ? newDifficulty.time : newDifficulty.reps;
    if (timeOrCount > 100 && type === 'human') {
      wx.showToast({
        title: '时间或次数超过100时只能使用系统音',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      'newDifficulty.voiceType': type
    })
  },

  saveNewDifficulty() {
    const { newDifficulty, difficulties, art, level } = this.data
    
    // 检查必填项
    if (!newDifficulty.name) {
      wx.showToast({
        title: '请输入难度名称',
        icon: 'none'
      })
      return
    }

    // 检查参数设置
    const hasTime = newDifficulty.time > 0;
    const hasSetsAndReps = newDifficulty.sets > 0 && newDifficulty.reps > 0;
    
    if (!hasTime && !hasSetsAndReps) {
      wx.showToast({
        title: '请设置时间或组数和次数',
        icon: 'none'
      })
      return
    }

    // 检查时间参数
    if (newDifficulty.interval < 0 || newDifficulty.rest < 0) {
      wx.showToast({
        title: '请输入有效的时间',
        icon: 'none'
      })
      return
    }

    // 生成新难度ID
    const newId = difficulties.length > 0 ? Math.max(...difficulties.map(d => d.id)) + 1 : 1

    // 添加新难度
    const updatedDifficulties = [...difficulties, {
      id: newId,
      ...newDifficulty
    }]

    this.setData({
      difficulties: updatedDifficulties,
      showAddModal: false
    })

    // 更新存储
    this.updateStorage(updatedDifficulties)

    wx.showToast({
      title: '新增成功',
      icon: 'success'
    })
  },

  // 新增更新存储的公共方法
  updateStorage(newDifficulties) {
    // 使用全局数据
    const arts = app.globalData.arts || []
    const artIndex = arts.findIndex(a => a.id === this.data.art.id)
    if (artIndex !== -1) {
      const levelIndex = arts[artIndex].levels.findIndex(l => l.id === this.data.level.id)
      if (levelIndex !== -1) {
        // 更新级别的难度配置
        arts[artIndex].levels[levelIndex].difficulties = newDifficulties
        
        // 使用 DataManager 保存数据
        DataManager.saveArts(arts);
        
        // 同时单独保存难度配置，确保数据一致性
        DataManager.saveDifficultyConfig(this.data.art.id, this.data.level.id, newDifficulties);
        
        // 更新全局数据
        app.globalData.arts = arts
        
        // console.log(`更新动作 ${arts[artIndex].name} 的级别 ${arts[artIndex].levels[levelIndex].name} 的难度设置，共 ${newDifficulties.length} 个难度`);
      }
    }
  },

  toggleCheck(e) {
    const index = e.currentTarget.dataset.index;
    const difficulties = this.data.difficulties;
    
    // 如果当前项已经选中，则取消选中
    if (difficulties[index].checked) {
      difficulties[index].checked = false;
      this.setData({
        difficulties: difficulties,
        hasSelectedDifficulty: false
      });
      return;
    }
    
    // 先将所有项设置为未选中
    difficulties.forEach(item => {
      item.checked = false;
    });
    
    // 设置当前项为选中状态
    difficulties[index].checked = true;
    
    this.setData({
      difficulties: difficulties,
      hasSelectedDifficulty: true
    });
  },

  startTraining() {
    if (!this.data.hasSelectedDifficulty) {
      return;
    }

    const selectedDifficulty = this.data.difficulties.find(d => d.checked);
    if (!selectedDifficulty) {
      return;
    }

    // 直接使用选中的难度配置
    const trainingParams = selectedDifficulty;
  
    
    // 跳转到训练页面，并传递训练参数
    wx.navigateTo({
      url: `/pages/training/training?artId=${this.data.art.id}&levelId=${this.data.level.id}&difficultyId=${selectedDifficulty.id}&sets=${trainingParams.sets}&count=${trainingParams.reps}&interval=${trainingParams.interval}&rest=${trainingParams.rest}&soundType=${trainingParams.voiceType}`
    });
  }
}) 