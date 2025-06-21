const DataManager = require('./utils/dataManager')

App({
  globalData: {
    arts: [
      {
        id: 1,
        name: '俯卧撑',
        icon: '/images/record/push-up.png',
        levels: [
          { id: 1, name: '墙壁俯卧撑' },
          { id: 2, name: '上斜俯卧撑' },
          { id: 3, name: '膝盖俯卧撑' },
          { id: 4, name: '半俯卧撑' },
          { id: 5, name: '俯卧撑' },
          { id: 6, name: '窄距俯卧撑' },
          { id: 7, name: '偏重俯卧撑' },
          { id: 8, name: '单肩半俯卧撑' },
          { id: 9, name: '杠杆俯卧撑' },
          { id: 10, name: '单臂俯卧撑' }
        ]
      },
      {
        id: 2,
        name: '深蹲',
        icon: '/images/record/squat.png',
        levels: [
          { id: 1, name: '肩倒立深蹲' },
          { id: 2, name: '折刀深蹲' },
          { id: 3, name: '支撑深蹲' },
          { id: 4, name: '半深蹲' },
          { id: 5, name: '深蹲' },
          { id: 6, name: '窄距深蹲' },
          { id: 7, name: '偏重深蹲' },
          { id: 8, name: '单腿半深蹲' },
          { id: 9, name: '单腿辅助深蹲' },
          { id: 10, name: '单腿深蹲' }
        ]
      },
      {
        id: 3,
        name: '引体向上',
        icon: '/images/record/pull-up.png',
        levels: [
          { id: 1, name: '垂直引体' },
          { id: 2, name: '水平引体向上' },
          { id: 3, name: '折刀引体向上' },
          { id: 4, name: '半引体向上' },
          { id: 5, name: '引体向上' },
          { id: 6, name: '窄距引体向上' },
          { id: 7, name: '偏重引体向上' },
          { id: 8, name: '单臂半引体向上' },
          { id: 9, name: '单臂辅助引体向上' },
          { id: 10, name: '单臂引体向上' }
        ]
      },
      {
        id: 4,
        name: '举腿',
        icon: '/images/record/leg-raise.png',
        levels: [
          { id: 1, name: '坐姿屈膝' },
          { id: 2, name: '平卧抬膝' },
          { id: 3, name: '平卧屈举腿' },
          { id: 4, name: '平卧蛙举腿' },
          { id: 5, name: '平卧直举腿' },
          { id: 6, name: '悬垂屈膝' },
          { id: 7, name: '悬垂屈举腿' },
          { id: 8, name: '悬垂蛙举腿' },
          { id: 9, name: '悬垂半举腿' },
          { id: 10, name: '悬垂直举腿' }
        ]
      },
      {
        id: 5,
        name: '桥',
        icon: '/images/record/bridge.png',
        levels: [
          { id: 1, name: '短桥' },
          { id: 2, name: '直桥' },
          { id: 3, name: '高低桥' },
          { id: 4, name: '顶桥' },
          { id: 5, name: '半桥' },
          { id: 6, name: '桥' },
          { id: 7, name: '下行桥' },
          { id: 8, name: '上行桥' },
          { id: 9, name: '合桥' },
          { id: 10, name: '铁板桥' }
        ]
      },
      {
        id: 6,
        name: '倒立撑',
        icon: '/images/record/handstand.png',
        levels: [
          { id: 1, name: '顶墙倒立' },
          { id: 2, name: '乌鸦式' },
          { id: 3, name: '靠墙倒立' },
          { id: 4, name: '半倒立撑' },
          { id: 5, name: '倒立撑' },
          { id: 6, name: '窄距倒立撑' },
          { id: 7, name: '偏重倒立撑' },
          { id: 8, name: '单臂半倒立撑' },
          { id: 9, name: '杠杆倒立撑' },
          { id: 10, name: '单臂倒立撑' }
        ]
      }
    ]
  },
  onLaunch() {
    // console.log('小程序启动，开始初始化数据...');
    // console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
    
    try {
      // 初始化数据管理模块
      // console.log('初始化数据管理模块...');
      DataManager.init();
      
      // 检查文件系统状态
      // console.log('检查文件系统状态...');
      const fsStatus = DataManager.checkFileSystem();
      
      // 从本地文件读取动作数据
      // console.log('尝试读取本地动作数据...');
      const savedArts = DataManager.loadArts();
      
      if (savedArts && savedArts.length > 0) {
        // console.log(`成功读取到 ${savedArts.length} 个本地动作数据`);
        
        // 确保基础动作数据的完整性
        const defaultArts = this.globalData.arts;
        // console.log(`默认动作数据: ${defaultArts.length} 个`);
        
        // 检查每个基础动作是否存在且完整
        const updatedArts = savedArts.map(savedArt => {
          // 查找对应的默认动作
          const defaultArt = defaultArts.find(art => art.id === savedArt.id);
          if (defaultArt) {
            // 确保动作有完整的级别列表
            if (!savedArt.levels || savedArt.levels.length === 0) {
              // console.log(`修复动作 ${savedArt.name} 的级别列表`);
              return {
                ...savedArt,
                levels: defaultArt.levels
              };
            } else if (savedArt.levels.length !== 10) {
              // console.log(`修复动作 ${savedArt.name} 的不完整级别列表，当前有 ${savedArt.levels.length} 个级别`);
              // 确保每个动作都有10个级别
              return {
                ...savedArt,
                levels: defaultArt.levels
              };
            }
            
            // 检查每个级别是否有id和name
            const hasInvalidLevel = savedArt.levels.some(level => !level.id || !level.name);
            if (hasInvalidLevel) {
              // console.log(`修复动作 ${savedArt.name} 的无效级别数据`);
              return {
                ...savedArt,
                levels: defaultArt.levels
              };
            }
          }
          return savedArt;
        });
        
        // 检查是否有默认动作未包含在已保存数据中
        defaultArts.forEach(defaultArt => {
          const exists = updatedArts.some(art => art.id === defaultArt.id);
          if (!exists) {
            // console.log(`添加缺失的默认动作: ${defaultArt.name}`);
            updatedArts.push(defaultArt);
          }
        });
        
        // 打印每个动作的级别数量，确认数据完整性
        updatedArts.forEach(art => {
          // console.log(`动作 ${art.name} 有 ${art.levels ? art.levels.length : 0} 个级别`);
          
          // 确保基础动作的每个级别都有默认难度配置
          if (art.id >= 1 && art.id <= 6) {
            art.levels.forEach(level => {
              if (!level.difficulties || level.difficulties.length === 0) {
                // console.log(`为基础动作 ${art.name} 的级别 ${level.name} 创建默认难度配置`);
                // 创建默认难度配置并保存
                const difficultyConfig = this.getDefaultDifficultyConfig(art.id, level.id);
                if (difficultyConfig && difficultyConfig.length > 0) {
                  level.difficulties = difficultyConfig;
                  // 保存到文件
                  DataManager.saveDifficultyConfig(art.id, level.id, difficultyConfig);
                }
              }
            });
          }
        });
        
        // 更新全局数据和本地存储
        this.globalData.arts = updatedArts;
        // console.log('保存更新后的动作数据到本地...');
        DataManager.saveArts(updatedArts);
    } else {
      // 如果没有本地存储的数据，则保存默认数据
        // console.log('未找到本地动作数据，保存默认数据...');
        
        // 确保默认数据完整
        const defaultArts = this.globalData.arts;
        defaultArts.forEach(art => {
          // console.log(`默认动作 ${art.name} 有 ${art.levels ? art.levels.length : 0} 个级别`);
          
          // 为基础动作的每个级别创建默认难度配置
          if (art.id >= 1 && art.id <= 6) {
            art.levels.forEach(level => {
              if (!level.difficulties || level.difficulties.length === 0) {
                // console.log(`为基础动作 ${art.name} 的级别 ${level.name} 创建默认难度配置`);
                // 创建默认难度配置并保存
                const difficultyConfig = this.getDefaultDifficultyConfig(art.id, level.id);
                if (difficultyConfig && difficultyConfig.length > 0) {
                  level.difficulties = difficultyConfig;
                  // 保存到文件
                  DataManager.saveDifficultyConfig(art.id, level.id, difficultyConfig);
                }
              }
            });
          }
        });
        
        DataManager.saveArts(this.globalData.arts);
      }
      
      // 最后再次检查文件系统状态
      // console.log('完成后再次检查文件系统状态...');
      const finalFsStatus = DataManager.checkFileSystem();
      
      // console.log('数据初始化完成');
    } catch (e) {
     console.error('数据初始化失败:', e);
      // 确保至少有默认数据可用
      // console.log('使用默认数据...');
      this.globalData.arts = this.globalData.arts;
    }
  },
  
  // 获取默认难度配置
  getDefaultDifficultyConfig(artId, levelId) {
    // 基础动作的难度数据配置
    const baseDifficultyConfig = {
      1: { // 俯卧撑
        1: { // 墙壁俯卧撑
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        2: { // 上斜俯卧撑
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        3: { // 膝盖俯卧撑
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        4: { // 半俯卧撑
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 12, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 窄距俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 偏重俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 单肩半俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 杠杆俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 单臂俯卧撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 6, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 1, reps: 100, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 1, reps: 100, rest: 0, interval: 2, time: 0, voiceType: 'system' }
        }
      },
      2: { // 深蹲
        1: { // 肩倒立深蹲
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        2: { // 折刀深蹲
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        3: { // 支撑深蹲
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        4: { // 半深蹲
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 35, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 窄距深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 偏重深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 单腿半深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 单腿辅助深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 单腿深蹲
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        }
      },
      3: { // 引体向上
        1: { // 垂直引体
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        2: { // 水平引体向上
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        3: { // 折刀引体向上
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        4: { // 半引体向上
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 11, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 引体向上
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 窄距引体向上
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 偏重引体向上
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 7, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 单臂半引体向上
          primary: { sets: 1, reps: 4, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 11, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 单臂辅助引体向上
          primary: { sets: 1, reps: 3, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 5, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 7, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 7, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 单臂引体向上
          primary: { sets: 1, reps: 1, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 3, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        }
      },
      4: { // 举腿
        1: { // 坐姿屈膝
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 40, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        2: { // 平卧抬膝
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 35, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 35, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        3: { // 平卧屈举腿
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        4: { // 平卧蛙举腿
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 平卧直举腿
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 悬垂屈膝
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 悬垂屈举腿
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 悬垂蛙举腿
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 悬垂半举腿
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 悬垂直举腿
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        }
      },
      5: { // 桥
        1: { // 短桥
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 50, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        2: { // 直桥
          primary: { sets: 1, reps: 10, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        3: { // 高低桥
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        4: { // 顶桥
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 半桥
          primary: { sets: 1, reps: 8, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 20, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 桥
          primary: { sets: 1, reps: 6, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 下行桥
          primary: { sets: 1, reps: 3, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 上行桥
          primary: { sets: 1, reps: 2, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 4, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 合桥
          primary: { sets: 1, reps: 1, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 3, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 铁板桥
          primary: { sets: 1, reps: 1, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 3, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 30, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        }
      },
      6: { // 倒立撑
        1: { // 顶墙倒立
          primary: { sets: 0, reps: 0, rest: 0, interval: 0, time: 30, voiceType: 'system' },
          intermediate: { sets: 0, reps: 0, rest: 0, interval: 0, time: 60, voiceType: 'system' },
          advanced: { sets: 0, reps: 0, rest: 0, interval: 0, time: 120, voiceType: 'system' },
          free: { sets: 0, reps: 0, rest: 0, interval: 0, time: 120, voiceType: 'system' }
        },
        2: { // 乌鸦式
          primary: { sets: 0, reps: 0, rest: 0, interval: 0, time: 10, voiceType: 'system' },
          intermediate: { sets: 0, reps: 0, rest: 0, interval: 0, time: 30, voiceType: 'system' },
          advanced: { sets: 0, reps: 0, rest: 0, interval: 0, time: 60, voiceType: 'system' },
          free: { sets: 0, reps: 0, rest: 0, interval: 0, time: 60, voiceType: 'system' }
        },
        3: { // 靠墙倒立
          primary: { sets: 0, reps: 0, rest: 0, interval: 0, time: 30, voiceType: 'system' },
          intermediate: { sets: 0, reps: 0, rest: 0, interval: 0, time: 60, voiceType: 'system' },
          advanced: { sets: 0, reps: 0, rest: 0, interval: 0, time: 120, voiceType: 'system' },
          free: { sets: 0, reps: 0, rest: 0, interval: 0, time: 120, voiceType: 'system' }
        },
        4: { // 半倒立撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 25, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        5: { // 倒立撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 3, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 3, reps: 15, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        6: { // 窄距倒立撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 9, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 12, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 12, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        7: { // 偏重倒立撑
          primary: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 10, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        8: { // 单臂半倒立撑
          primary: { sets: 1, reps: 4, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 8, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        9: { // 杠杆倒立撑
          primary: { sets: 1, reps: 3, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 4, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 2, reps: 6, rest: 60, interval: 2, time: 0, voiceType: 'system' }
        },
        10: { // 单臂倒立撑
          primary: { sets: 1, reps: 1, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          intermediate: { sets: 2, reps: 2, rest: 60, interval: 2, time: 0, voiceType: 'system' },
          advanced: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' },
          free: { sets: 1, reps: 5, rest: 0, interval: 2, time: 0, voiceType: 'system' }
        }
      }
    };
    
    // 如果有对应的配置
    if (baseDifficultyConfig[artId] && baseDifficultyConfig[artId][levelId]) {
      const config = baseDifficultyConfig[artId][levelId];
      return [
        { id: 1, name: '初级', ...config.primary },
        { id: 2, name: '中级', ...config.intermediate },
        { id: 3, name: '高级', ...config.advanced },
        { id: 4, name: '自由', ...config.free }
      ];
    }
    
    // 如果没有找到对应配置，返回空数组
    // console.warn(`未找到动作ID ${artId} 级别ID ${levelId} 的难度配置`);
    return [];
  }
}) 