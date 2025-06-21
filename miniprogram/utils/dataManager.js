/**
 * 数据管理模块 - 负责所有数据的持久化操作
 * 使用本地文件系统存储数据
 */
const DataManager = {
  // 基础路径 - 确保在实际使用时获取
  get basePath() {
    return wx.env.USER_DATA_PATH;
  },
  
  // 初始化存储目录
  init() {
    // console.log('初始化数据管理模块，用户数据路径:', this.basePath);
    
    // 确保目录结构存在
    this.ensureDirectoryExists(`${this.basePath}/app_data`);
    this.ensureDirectoryExists(`${this.basePath}/training_records`);
    this.ensureDirectoryExists(`${this.basePath}/difficulty_configs`);
    
    // console.log('数据管理模块初始化完成');
  },
  
  // 确保目录存在
  ensureDirectoryExists(dirPath) {
    const fs = wx.getFileSystemManager();
    try {
      fs.accessSync(dirPath);
      // console.log(`目录已存在: ${dirPath}`);
    } catch (e) {
      try {
        fs.mkdirSync(dirPath, true);
        // console.log(`创建目录成功: ${dirPath}`);
      } catch (err) {
       console.error(`创建目录失败: ${dirPath}`, err);
        // 尝试使用递归方式创建
        const parts = dirPath.split('/');
        let current = '';
        for (const part of parts) {
          if (!part) continue;
          current += '/' + part;
          try {
            fs.accessSync(current);
          } catch (e) {
            try {
              fs.mkdirSync(current);
            } catch (e) {
             console.error(`创建子目录失败: ${current}`, e);
            }
          }
        }
      }
    }
  },
  
  // ===== 动作数据相关操作 =====
  
  // 保存动作数据
  saveArts(arts) {
    const fs = wx.getFileSystemManager();
    try {
      // 确保目录存在
      this.ensureDirectoryExists(`${this.basePath}/app_data`);
      
      const filePath = `${this.basePath}/app_data/arts.json`;
      // console.log('准备保存动作数据到:', filePath);
      
      // 确保每个动作的级别都有难度配置
      arts.forEach(art => {
        if (art.levels) {
          art.levels.forEach(level => {
            // 如果级别没有难度配置，尝试从本地存储加载
            if (!level.difficulties || level.difficulties.length === 0) {
              const configKey = `baseDifficultyConfig_${art.id}_${level.id}`;
              try {
                const savedConfig = wx.getStorageSync(configKey);
                if (savedConfig) {
                  // 从基础配置中创建难度数据
                  const difficultyTypes = ['primary', 'intermediate', 'advanced', 'free'];
                  const difficultyNames = ['初级', '中级', '高级', '自由'];
                  
                  level.difficulties = difficultyTypes.map((type, index) => {
                    if (savedConfig[type]) {
                      return {
                        id: index + 1,
                        name: difficultyNames[index],
                        ...savedConfig[type]
                      };
                    } else {
                      // 使用默认配置
                      return {
                        id: index + 1,
                        name: difficultyNames[index],
                        sets: 3,
                        reps: 10,
                        interval: 30,
                        rest: 60,
                        voiceType: 'system'
                      };
                    }
                  });
                  
                  // console.log(`从本地存储加载动作 ${art.name} 的级别 ${level.name} 的难度配置`);
                }
              } catch (e) {
               console.error(`加载难度配置失败: ${configKey}`, e);
              }
            }
          });
        }
      });
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(arts, null, 2),
        'utf-8'
      );
      // console.log('动作数据保存成功');
      return true;
    } catch (e) {
     console.error('保存动作数据失败:', e);
      return false;
    }
  },
  
  // 读取动作数据
  loadArts() {
    const fs = wx.getFileSystemManager();
    try {
      const filePath = `${this.basePath}/app_data/arts.json`;
      // console.log('准备读取动作数据从:', filePath);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const arts = JSON.parse(content);
      
      // 检查动作数据的完整性
      // console.log(`读取到 ${arts.length} 个动作`);
      let hasIssue = false;
      
      arts.forEach(art => {
        // console.log(`动作 ${art.name} (ID: ${art.id})`);
        
        // 检查级别数据
        if (!art.levels || art.levels.length === 0) {
          hasIssue = true;
        } else {
          // console.log(`  包含 ${art.levels.length} 个级别`);
          
          // 检查每个级别的完整性
          art.levels.forEach(level => {
            if (!level.id || !level.name) {
             console.error(`  警告: 级别数据不完整 - ID: ${level.id}, 名称: ${level.name}`);
              hasIssue = true;
            }
            
            // 检查难度配置
            if (level.difficulties) {
              // console.log(`    级别 ${level.name} 包含 ${level.difficulties.length} 个难度配置`);
            } else {
              // console.log(`    级别 ${level.name} 没有难度配置`);
            }
          });
        }
      });
      
      if (hasIssue) {
        // console.warn('动作数据存在问题，可能需要修复');
      } else {
        // console.log('动作数据检查完成，未发现问题');
      }
      
      return arts;
    } catch (e) {
      // console.log('没有找到动作数据或解析失败:', e);
      return null;
    }
  },
  
  // 保存难度配置
  saveDifficultyConfig(artId, levelId, difficulties) {
    const fs = wx.getFileSystemManager();
    try {
      // 确保目录存在
      this.ensureDirectoryExists(`${this.basePath}/difficulty_configs`);
      
      const filePath = `${this.basePath}/difficulty_configs/config_${artId}_${levelId}.json`;
      // console.log('准备保存难度配置到:', filePath);
      // console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
      
      // 检查文件路径是否有效
      if (!filePath.startsWith(wx.env.USER_DATA_PATH)) {
       console.error('文件路径无效，应该以USER_DATA_PATH开头:', filePath);
       console.error('当前USER_DATA_PATH:', wx.env.USER_DATA_PATH);
       console.error('basePath:', this.basePath);
      }
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(difficulties, null, 2),
        'utf-8'
      );
      
      // console.log(`难度配置保存成功: 动作ID ${artId}, 级别ID ${levelId}`);
      return true;
    } catch (e) {
     console.error('保存难度配置失败:', e);
     console.error('文件路径:', `${this.basePath}/difficulty_configs/config_${artId}_${levelId}.json`);
     console.error('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
     console.error('basePath:', this.basePath);
      return false;
    }
  },
  
  // 读取难度配置
  loadDifficultyConfig(artId, levelId) {
    const fs = wx.getFileSystemManager();
    try {
      const filePath = `${this.basePath}/difficulty_configs/config_${artId}_${levelId}.json`;
      // console.log('准备读取难度配置从:', filePath);
      // console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
      
      // 检查文件路径是否有效
      if (!filePath.startsWith(wx.env.USER_DATA_PATH)) {
       console.error('文件路径无效，应该以USER_DATA_PATH开头:', filePath);
       console.error('当前USER_DATA_PATH:', wx.env.USER_DATA_PATH);
       console.error('basePath:', this.basePath);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const difficulties = JSON.parse(content);
      
      // console.log(`成功读取难度配置: 动作ID ${artId}, 级别ID ${levelId}`);
      return difficulties;
    } catch (e) {
      // console.log(`没有找到难度配置: 动作ID ${artId}, 级别ID ${levelId}`, e);
      // console.log('文件路径:', `${this.basePath}/difficulty_configs/config_${artId}_${levelId}.json`);
      // console.log('USER_DATA_PATH:', wx.env.USER_DATA_PATH);
      // console.log('basePath:', this.basePath);
      return null;
    }
  },
  
  // ===== 训练记录相关操作 =====
  
  // 保存训练记录
  saveTrainingRecord(record) {
    const date = new Date(record.startTime);
    const monthKey = `${date.getFullYear()}_${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const filePath = `${this.basePath}/training_records/${monthKey}.json`;
    
    const fs = wx.getFileSystemManager();
    try {
      // 确保目录存在
      this.ensureDirectoryExists(`${this.basePath}/training_records`);
      
      // console.log('准备保存训练记录到:', filePath);
      
      let monthRecords = [];
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        monthRecords = JSON.parse(content);
      } catch (e) {
        // 文件不存在，使用空数组
        // console.log(`创建新的月度记录文件: ${monthKey}.json`);
      }
      
      monthRecords.unshift(record);
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(monthRecords, null, 2),
        'utf-8'
      );
      
      // console.log(`训练记录已保存到: ${monthKey}.json`);
      return true;
    } catch (e) {
     console.error('保存训练记录失败:', e);
      return false;
    }
  },
  
  // 读取指定月份的训练记录
  loadMonthRecords(year, month) {
    const fs = wx.getFileSystemManager();
    const fileName = `${year}_${month.toString().padStart(2, '0')}.json`;
    const filePath = `${this.basePath}/training_records/${fileName}`;
    
    try {
      // console.log('准备读取月度训练记录从:', filePath);
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (e) {
      // console.log('没有找到指定月份的记录:', e);
      return [];
    }
  },
  
  // 读取所有训练记录
  loadAllTrainingRecords() {
    const fs = wx.getFileSystemManager();
    const recordsPath = `${this.basePath}/training_records`;
    
    try {
      // console.log('准备读取所有训练记录从目录:', recordsPath);
      
      // 确保目录存在
      this.ensureDirectoryExists(recordsPath);
      
      const files = fs.readdirSync(recordsPath);
      let allRecords = [];
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = `${recordsPath}/${file}`;
          try {
            // console.log(`读取文件: ${file}`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const records = JSON.parse(content);
            allRecords = allRecords.concat(records);
          } catch (e) {
           console.error(`读取文件失败: ${file}`, e);
          }
        }
      });
      
      // 按时间排序
      allRecords.sort((a, b) => b.startTime - a.startTime);
      
      // console.log(`成功读取 ${allRecords.length} 条训练记录`);
      return allRecords;
    } catch (e) {
     console.error('读取训练记录失败:', e);
      return [];
    }
  },
  
  // ===== 数据导入导出相关操作 =====
  
  // 导出所有数据
  exportAllData() {
    try {
      // 确保数据已加载
      const arts = this.loadArts() || [];
      const records = this.loadAllTrainingRecords() || [];
      const difficultyConfigs = {};
      
      // 加载所有难度配置
      arts.forEach(art => {
        if (art.levels) {
          art.levels.forEach(level => {
            const config = this.loadDifficultyConfig(art.id, level.id);
            if (config) {
              difficultyConfigs[`${art.id}_${level.id}`] = config;
            }
          });
        }
      });

      const data = {
        arts: arts,
        records: records,
        difficultyConfigs: difficultyConfigs
      };
      
      const jsonStr = JSON.stringify(data, null, 2);
      const now = new Date();
      const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const fileName = `app_data_${beijingTime.toISOString().split('.')[0].replace(/[:]/g, '-')}.pdf`;
      
      // 创建临时文件
      const fs = wx.getFileSystemManager();
      const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      
      // 确保目录存在
      this.ensureDirectoryExists(wx.env.USER_DATA_PATH);
      
      // 写入临时文件
      fs.writeFileSync(tempFilePath, jsonStr, 'utf8');
      
      // 检查是否在开发者工具中
      const isDevTools = wx.getSystemInfoSync().platform === 'devtools';
       
      if (isDevTools) {
        wx.showModal({
          title: '开发者工具提示',
          content: '文件已保存，但预览功能需要在真机中测试。文件路径：' + tempFilePath,
          showCancel: false
        });
      } else {
        // 在真机环境中使用 openDocument
        wx.openDocument({
          filePath: tempFilePath,
          fileType: 'pdf',
          success: (res) => {
            console.log(res);
            console.log('文件打开成功'); 
          },
          fail: (err) => {
            console.error('打开文件失败:', err);
            wx.showToast({
              title: '打开文件失败',
              icon: 'none'
            });
          }
        });
      }

      return tempFilePath;
    } catch (e) {
      console.error('导出数据失败，错误详情:', e);
      wx.showToast({
        title: '导出数据失败',
        icon: 'none'
      });
      throw e;
    }
  },
  
  // 导入所有数据
  importAllData(filePath) {
    const fs = wx.getFileSystemManager();
    const app = getApp();
    
    try {
      // 1. 备份当前数据
      const backupData = this.createBackup();
      if (!backupData) {
        wx.showToast({
          title: '备份失败，无法导入',
          icon: 'none'
        });
        return false;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const importedData = JSON.parse(content);
      
      // 验证数据格式
      if (!this.validateImportData(importedData)) {
        wx.showToast({
          title: '数据格式不正确',
          icon: 'none'
        });
        return false;
      }
      
      // 2. 尝试导入数据
      try {
      // 导入动作数据
      if (importedData.arts) {
        this.saveArts(importedData.arts);
        // 更新全局数据
        app.globalData.arts = importedData.arts;
      }
      
      // 导入训练记录
      if (importedData.records && importedData.records.length > 0) {
        // 确保目录存在
        this.ensureDirectoryExists(`${this.basePath}/training_records`);
        
        // 按月份分组
        const recordsByMonth = {};
        importedData.records.forEach(record => {
          const date = new Date(record.startTime);
          const monthKey = `${date.getFullYear()}_${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!recordsByMonth[monthKey]) {
            recordsByMonth[monthKey] = [];
          }
          recordsByMonth[monthKey].push(record);
        });
        
        // 写入各月份文件
        Object.keys(recordsByMonth).forEach(monthKey => {
          fs.writeFileSync(
            `${this.basePath}/training_records/${monthKey}.json`,
            JSON.stringify(recordsByMonth[monthKey], null, 2),
            'utf-8'
          );
        });
      }
      
      // 导入难度配置
      if (importedData.difficultyConfigs) {
        Object.entries(importedData.difficultyConfigs).forEach(([key, difficulties]) => {
          const [artId, levelId] = key.split('_');
          this.saveDifficultyConfig(parseInt(artId), parseInt(levelId), difficulties);
        });
      }
        
        // 3. 导入成功，删除备份
        this.deleteBackup(backupData);
      
      return true;
        
      } catch (importError) {
        // 4. 导入失败，回退到备份数据
        console.error('导入过程中出错，开始回退:', importError);
        this.restoreFromBackup(backupData);
        
        wx.showToast({
          title: '导入失败，已回退到原数据',
          icon: 'none'
        });
        return false;
      }
      
    } catch (e) {
      console.error('导入数据失败:', e);
      wx.showToast({
        title: '导入失败：文件格式错误',
        icon: 'none'
      });
      return false;
    }
  },
  
  // 验证导入数据格式
  validateImportData(data) {
    // 检查是否为对象
    if (!data || typeof data !== 'object') {
      console.error('导入数据不是有效的对象');
      return false;
    }

    // 检查动作数据
    if (data.arts) {
      if (!Array.isArray(data.arts)) {
        console.error('动作数据不是数组格式');
        return false;
      }
      
      // 检查每个动作的基本结构
      for (let i = 0; i < data.arts.length; i++) {
        const art = data.arts[i];
        if (!art.id || !art.name) {
          console.error(`动作数据第${i + 1}项缺少必要字段`);
          return false;
        }
      }
    }

    // 检查训练记录
    if (data.records) {
      if (!Array.isArray(data.records)) {
        console.error('训练记录不是数组格式');
        return false;
      }
      
      // 检查每条记录的基本结构
      for (let i = 0; i < data.records.length; i++) {
        const record = data.records[i];
        if (!record.artId || !record.artName || !record.startTime) {
          console.error(`训练记录第${i + 1}项缺少必要字段`);
          return false;
        }
      }
    }

    // 检查难度配置
    if (data.difficultyConfigs) {
      if (typeof data.difficultyConfigs !== 'object') {
        console.error('难度配置不是对象格式');
        return false;
      }
      
      // 检查每个难度配置是否为数组
      for (const [key, difficulties] of Object.entries(data.difficultyConfigs)) {
        if (!Array.isArray(difficulties)) {
          console.error(`难度配置 ${key} 不是数组格式`);
          return false;
        }
      }
    }

    return true;
  },
  
  // ===== 成就系统相关操作 =====
  
  // 获取训练日期列表（用于日历显示）
  getTrainingDates() {
    const allRecords = this.loadAllTrainingRecords();
    // 提取不重复的日期
    const trainingDates = [...new Set(allRecords.map(record => record.date))];
    return trainingDates;
  },
  
  // 获取训练统计数据
  getTrainingStats() {
    const allRecords = this.loadAllTrainingRecords();
    // 按日期分组
    const dateGroups = {};
    allRecords.forEach(record => {
      if (!dateGroups[record.date]) {
        dateGroups[record.date] = [];
      }
      dateGroups[record.date].push(record);
    });

    // console.log("totalDays", Object.keys(dateGroups).length);
    // console.log("totalTrainings", allRecords);
    
    return {
      totalDays: Object.keys(dateGroups).length,
      totalTrainings: allRecords.length
    };
  },
  
  // 获取特定动作的统计数据
  getArtStats(artId) {
    const allRecords = this.loadAllTrainingRecords();
    const artRecords = allRecords.filter(record => record.artId === artId);
    
    // 按级别分组统计
    const levelStats = {};
    // 按难度分组统计
    const difficultyStats = {};
    
    artRecords.forEach(record => {
      // 级别统计
      if (!levelStats[record.levelId]) {
        levelStats[record.levelId] = {
          count: 0,
          name: record.levelName
        };
      }
      levelStats[record.levelId].count++;
      
      // // 难度统计
      // if (record.difficultyId) {
      //   if (!difficultyStats[record.levelId]) {
      //     difficultyStats[record.levelId] = {};
      //   }
      //   if (!difficultyStats[record.levelId][record.difficultyId]) {
      //     difficultyStats[record.levelId][record.difficultyId] = {
      //       count: 0
      //     };
      //   }
      //   difficultyStats[record.levelId][record.difficultyId].count++;
      // }
    });

    // console.log("levelStats", levelStats);
    // console.log("difficultyStats", difficultyStats);
    // console.log("artRecords", artRecords);
    
    return {
      totalTrainings: artRecords.length,
      levelStats: levelStats,
      difficultyStats: difficultyStats
    };
  },
  
  // ===== 调试功能 =====
  
  // 检查文件系统状态
  checkFileSystem() {
    try {
      const fs = wx.getFileSystemManager();
      const result = {
        userDataPath: this.basePath,
        appDataExists: false,
        trainingRecordsExists: false,
        artsFileExists: false,
        artsFileSize: 0,
        trainingRecordFiles: [],
        error: null
      };
      
      // 检查 app_data 目录
      try {
        fs.accessSync(`${this.basePath}/app_data`);
        result.appDataExists = true;
        
        // 检查 arts.json 文件
        try {
          const stats = fs.statSync(`${this.basePath}/app_data/arts.json`);
          result.artsFileExists = true;
          result.artsFileSize = stats.size;
        } catch (e) {
          // console.log('arts.json 文件不存在');
        }
      } catch (e) {
        // console.log('app_data 目录不存在');
      }
      
      // 检查 training_records 目录
      try {
        fs.accessSync(`${this.basePath}/training_records`);
        result.trainingRecordsExists = true;
        
        // 列出训练记录文件
        try {
          const files = fs.readdirSync(`${this.basePath}/training_records`);
          result.trainingRecordFiles = files.filter(file => file.endsWith('.json'));
        } catch (e) {
          // console.log('无法读取训练记录目录');
        }
      } catch (e) {
        // console.log('training_records 目录不存在');
      }
      
      // console.log('文件系统状态:', result);
      return result;
    } catch (e) {
     console.error('检查文件系统失败:', e);
      return {
        error: e.message || '未知错误'
      };
    }
  },

  // 创建备份
  createBackup() {
    const fs = wx.getFileSystemManager();
    try {
      const backupData = {
        arts: this.loadArts() || [],
        records: this.loadAllTrainingRecords() || [],
        difficultyConfigs: {}
      };
      
      // 备份难度配置
      backupData.arts.forEach(art => {
        if (art.levels) {
          art.levels.forEach(level => {
            const config = this.loadDifficultyConfig(art.id, level.id);
            if (config) {
              backupData.difficultyConfigs[`${art.id}_${level.id}`] = config;
            }
          });
        }
      });
      
      // 生成备份文件名
      const now = new Date();
      const backupFileName = `backup_${now.getTime()}.json`;
      const backupPath = `${this.basePath}/${backupFileName}`;
      
      // 保存备份文件
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
      
      console.log('备份创建成功:', backupPath);
      return backupPath;
      
    } catch (e) {
      console.error('创建备份失败:', e);
      return null;
    }
  },

  // 从备份恢复数据
  restoreFromBackup(backupPath) {
    const fs = wx.getFileSystemManager();
    const app = getApp();
    
    try {
      // 读取备份数据
      const content = fs.readFileSync(backupPath, 'utf-8');
      const backupData = JSON.parse(content);
      
      // 恢复动作数据
      if (backupData.arts) {
        this.saveArts(backupData.arts);
        app.globalData.arts = backupData.arts;
      }
      
      // 恢复训练记录
      if (backupData.records && backupData.records.length > 0) {
        // 清空现有训练记录
        try {
          const files = fs.readdirSync(`${this.basePath}/training_records`);
          files.forEach(file => {
            if (file.endsWith('.json')) {
              fs.unlinkSync(`${this.basePath}/training_records/${file}`);
            }
          });
        } catch (e) {
          console.log('清空训练记录目录失败:', e);
        }
        
        // 按月份恢复训练记录
        const recordsByMonth = {};
        backupData.records.forEach(record => {
          const date = new Date(record.startTime);
          const monthKey = `${date.getFullYear()}_${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!recordsByMonth[monthKey]) {
            recordsByMonth[monthKey] = [];
          }
          recordsByMonth[monthKey].push(record);
        });
        
        Object.keys(recordsByMonth).forEach(monthKey => {
          fs.writeFileSync(
            `${this.basePath}/training_records/${monthKey}.json`,
            JSON.stringify(recordsByMonth[monthKey], null, 2),
            'utf-8'
          );
        });
      }
      
      // 恢复难度配置
      if (backupData.difficultyConfigs) {
        Object.entries(backupData.difficultyConfigs).forEach(([key, difficulties]) => {
          const [artId, levelId] = key.split('_');
          this.saveDifficultyConfig(parseInt(artId), parseInt(levelId), difficulties);
        });
      }
      
      console.log('数据恢复成功');
      
    } catch (e) {
      console.error('从备份恢复数据失败:', e);
    }
  },

  // 删除备份文件
  deleteBackup(backupPath) {
    const fs = wx.getFileSystemManager();
    try {
      fs.unlinkSync(backupPath);
      console.log('备份文件已删除:', backupPath);
    } catch (e) {
      console.error('删除备份文件失败:', e);
    }
  }
};

module.exports = DataManager; 