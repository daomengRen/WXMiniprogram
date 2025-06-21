const app = getApp()
const DataManager = require('../../utils/dataManager')

Page({
  data: {
    status: 'idle', // idle, preparing, training, resting, finished
    timerText: 'GO',
    statusText: '准备开始',
    currentSet: 0,
    totalSets: 3,
    currentCount: 0,
    totalCount: 10,
    countInterval: 3, // 次数间隔（秒）
    restTime: 60, // 组间休息时间（秒）
    timer: null,
    prepareTimer: null, // 添加准备阶段的定时器
    restTimer: null,   // 添加休息阶段的定时器
    countdownTimer: null,  // 添加倒计时定时器引用
    delayTimer: null,      // 添加延迟定时器引用
    soundType: 'system', // system 或 human
    art: null,
    level: null,
    startTime: null, // 添加训练开始时间
    difficultyId: null,
    selectedDifficulty: null, // 添加选定的难度
    isBaseArt: false, // 添加是否为基础动作的标志
  },

  onLoad: function(options) {
    const app = getApp();
    // 获取动作和级别信息
    const art = app.globalData.arts.find(a => a.id === parseInt(options.artId));
    const level = art.levels.find(l => l.id === parseInt(options.levelId));
    
    // 从上一个页面获取训练参数
    if (options) {
      // 特别处理rest参数，确保0值被正确处理
      const restTime = options.rest === "0" ? 0 : (parseInt(options.rest) || 60);
      
      // 获取选定的难度
      let selectedDifficulty = null;
      // 检查是否是基础动作（id 1-6 是基础动作）
      const isBaseArt = art.id >= 1 && art.id <= 6;
      
      if (options.difficultyId) {
        selectedDifficulty = level.difficulties.find(d => d.id === parseInt(options.difficultyId));
      }
      
      this.setData({
        art,
        level,
        totalSets: selectedDifficulty ? selectedDifficulty.sets : 3,
        totalCount: selectedDifficulty ? selectedDifficulty.reps : 10,
        countInterval: selectedDifficulty ? selectedDifficulty.interval : (parseInt(options.interval) || 3),
        restTime: selectedDifficulty ? selectedDifficulty.rest : restTime,
        soundType: selectedDifficulty ? selectedDifficulty.voiceType : (options.soundType || 'system'),
        difficultyId: options.difficultyId || null,
        selectedDifficulty: selectedDifficulty || { name: `${art.name} - ${level.name}` },
        isBaseArt: isBaseArt // 使用动作ID判断是否为基础动作
      })
    }
    
    // 预加载音频文件
    this.prepareAudioFiles()
  },

  // 页面准备就绪后自动开始训练
  onReady: function() {
    // 短暂延迟确保音频文件加载完成
    setTimeout(() => {
      this.startTraining()
    }, 500)
  },

  prepareAudioFiles: function() {
    // 创建音频实例
    this.startAudio = wx.createInnerAudioContext()
    this.completeAudio = wx.createInnerAudioContext()
    this.numberAudio = wx.createInnerAudioContext() // 用于播放数字
    this.nextSetAudio = wx.createInnerAudioContext() // 用于播放下一组提示
    this.tickAudio = wx.createInnerAudioContext() // 用于系统模式的滴答声
    this.allCompleteAudio = wx.createInnerAudioContext() // 全部完成音频实例
    this.countdownAudios = [null, null, null] // 存放3,2,1倒计时音频实例
    this.countdownStartAudio = wx.createInnerAudioContext() // 倒计时开始语音
    
    // 设置音频文件路径
    this.startAudio.src = '/assets/sounds/voice/start.mp3' // 开始语音
    this.completeAudio.src = '/assets/sounds/voice/complete.mp3' // 完成语音
    this.nextSetAudio.src = '/assets/sounds/voice/next_set.mp3' // "准备开始下一组"语音
    this.tickAudio.src = '/assets/sounds/system/tick.mp3' // 系统滴答声
    this.allCompleteAudio.src = '/assets/sounds/voice/all_complete.mp3' // 全部完成音频路径
    this.countdownStartAudio.src = '/assets/sounds/voice/countdown.mp3' // 倒计时开始语音

    // 创建倒计时音频实例
    for (let i = 0; i < 3; i++) {
      this.countdownAudios[i] = wx.createInnerAudioContext()
      this.countdownAudios[i].src = `/assets/sounds/voice/numbers/${3-i}.mp3`
    }
  },

  // 播放数字音频
  playNumberAudio: function(number) {
    if (this.data.soundType === 'human') {
      this.numberAudio.src = `/assets/sounds/voice/numbers/${number}.mp3`
      this.numberAudio.play()
    } else {
      this.tickAudio.play()
    }
  },

  startTraining: function() {
    // 获取当前页面实例
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    
    // 确保使用原始的休息时间，特别处理0值
    const originalRestTime = options.rest === "0" ? 0 : (parseInt(options.rest) || 60);
    
    // 记录训练开始时间
    this.setData({
      status: 'preparing',
      statusText: '准备开始',
      currentSet: 0,
      startTime: new Date().getTime(), // 记录训练开始时间
      restTime: originalRestTime // 确保使用原始的休息时间
    })
    
    // 先播放countdown语音
    this.countdownStartAudio.play()
    
    // 延迟1秒后开始321倒计时
    const delayTimer = setTimeout(() => {
    // 开始3秒倒计时
    let countdown = 3
    this.setData({ timerText: countdown.toString() })
    
      const countdownTimer = setInterval(() => {
        // 播放对应数字的音频（3,2,1）
        if (countdown > 0) {
          this.countdownAudios[3-countdown].play()
        }
      this.setData({ timerText: countdown.toString() })
      countdown--
      
      if (countdown === -1) {
          clearInterval(countdownTimer)
        this.startAudio.play()
        this.startExercise()
      }
    }, 1000)

      // 保存倒计时定时器引用
      this.setData({ countdownTimer })
    }, 1000)

    // 保存延迟定时器引用
    this.setData({ delayTimer })
  },

  startExercise: function() {
    this.setData({
      status: 'training',
      statusText: '训练中',
      currentCount: 0
    })
    
    // 判断是否需要时间倒计时
    const isTimeMode = this.shouldUseTimeMode();
    
    if (isTimeMode) {
      this.startTimeCountdown();
    } else {
      this.startCountdown();
    }
  },

  // 判断是否应该使用时间倒计时模式
  shouldUseTimeMode: function() {
    const { art, level, selectedDifficulty, isBaseArt } = this.data;
    
    // 如果是基础动作
    if (isBaseArt) {
      // 倒立撑（id为6）下的顶墙倒立、乌鸦式、靠墙倒立（level.id为1、2、3）
      if (art.id === 6 && (level.id === 1 || level.id === 2 || level.id === 3)) {
        return true;
      }
      return false;
    }
    
    // 如果是自定义难度
    return selectedDifficulty && selectedDifficulty.time > 0;
  },

  // 时间倒计时模式
  startTimeCountdown: function() {
    const time = this.data.selectedDifficulty.time;
    let remainingTime = time;
    
    this.setData({ timerText: remainingTime.toString() });
    
    this.data.timer = setInterval(() => {
      if (remainingTime <= 0) {
        // 完成训练
        clearInterval(this.data.timer);
        this.finishTraining();
        return;
      }
      
      remainingTime--;
      this.setData({ timerText: remainingTime.toString() });
      
      // 播放提示音
      if (this.data.soundType === 'human') {
        // 人声模式：播放当前秒数
        this.playNumberAudio(remainingTime);
      } else {
        // 系统声音模式：每秒播放滴答声
        this.tickAudio.play();
      }
    }, 1000);
  },

  // 次数计数模式
  startCountdown: function() {
    let remainingTime = this.data.countInterval;
    
    this.data.timer = setInterval(() => {
      if (this.data.currentCount >= this.data.totalCount) {
        // 完成一组
        clearInterval(this.data.timer);
        
        // 完成一组后增加组数
        this.setData({
          currentSet: this.data.currentSet + 1
        });
        
        if (this.data.currentSet >= this.data.totalSets) {
          this.finishTraining();
        } else {
          // 只有在不是最后一组时才播放完成一组的提示音
          this.completeAudio.play();
          this.startRest();
        }
        return;
      }
      
      if (remainingTime === 0) {
        // 完成一次
        const newCount = this.data.currentCount + 1;
        this.setData({
          currentCount: newCount,
          timerText: newCount.toString() // 只显示当前次数
        });
        this.playNumberAudio(newCount); // 播放当前计数
        remainingTime = this.data.countInterval;
      }
      
      remainingTime--;
    }, 1000);
  },

  startRest: function() {
    // 获取当前页面实例
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    
    // 确保使用原始的休息时间，特别处理0值
    const originalRestTime = options.rest === "0" ? 0 : (parseInt(options.rest) || 60);
    
    // 如果休息时间为0，添加短暂延迟再开始下一组，避免语音提示重叠
    if (originalRestTime === 0) {
      this.setData({
        status: 'resting',
        statusText: '准备下一组',
        timerText: '0'
      });
      
      // 延迟1.5秒后开始下一组，避免语音重叠
      setTimeout(() => {
        this.startAudio.play();
        this.startExercise();
      }, 1500);
      return;
    }
    
    this.setData({
      status: 'resting',
      statusText: '休息时间',
      // 重置为原始的休息时间
      restTime: originalRestTime
    });
    
    let remainingRestTime = originalRestTime;
    this.setData({ timerText: remainingRestTime.toString() });
    
    const restTimer = setInterval(() => {
      // 根据组间休息时间的长度决定播放哪些语音提示
      if (originalRestTime <= 3) {
        // 如果总休息时间小于等于3秒
        if (originalRestTime === 1) {
          // 休息时间为1秒时，不播放"准备开始下一组"，避免语音重叠
        } else if (originalRestTime >= 2 && originalRestTime <= 3 && remainingRestTime === 2) {
          // 休息时间为2-3秒时，在最后2秒播放"准备开始下一组"
          this.nextSetAudio.play();
        }
      } else {
        // 休息时间大于3秒的正常逻辑
        if (remainingRestTime === 10 && originalRestTime > 10) {
          // 只有当总休息时间大于10秒时，才播放"准备开始下一组"
          this.nextSetAudio.play();
        } else if (remainingRestTime === 4 && originalRestTime >= 4) {
          // 只有当总休息时间大于等于4秒时，才播放"倒计时开始"
          this.countdownStartAudio.play();
        } else if (remainingRestTime <= 3 && remainingRestTime > 0) {
          // 播放3、2、1倒计时声音
          this.countdownAudios[3-remainingRestTime].play();
        }
      }
      
      remainingRestTime--;
      
      // 避免显示-1，当倒计时结束时显示"GO"
      if (remainingRestTime >= 0) {
        this.setData({ timerText: remainingRestTime.toString() });
      } else {
        this.setData({ timerText: "GO" });
        clearInterval(restTimer);
        this.startAudio.play();
        this.startExercise();
      }
    }, 1000);

    // 保存restTimer的引用
    this.setData({ restTimer: restTimer });
  },

  stopTraining: function() {
    // 清理所有可能的定时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    if (this.data.prepareTimer) {
      clearInterval(this.data.prepareTimer)
    }
    if (this.data.restTimer) {
      clearInterval(this.data.restTimer)
    }
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
    if (this.data.delayTimer) {
      clearTimeout(this.data.delayTimer)
    }
    
    // 停止所有正在播放的音频
    this.stopAllAudio()
    
    // 获取当前页面实例
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    // 确保使用原始的休息时间，特别处理0值
    const originalRestTime = options.rest === "0" ? 0 : (parseInt(options.rest) || 60);
    
    this.setData({
      status: 'idle',
      statusText: '已停止',
      timerText: 'GO',
      // 重置为URL参数中的原始值
      restTime: originalRestTime,
      timer: null,
      prepareTimer: null,
      restTimer: null,
      countdownTimer: null,
      delayTimer: null,
      startTime: null
    })
  },

  // 停止所有音频播放
  stopAllAudio: function() {
    // 停止倒计时开始语音
    if (this.countdownStartAudio) {
      this.countdownStartAudio.stop()
    }
    
    // 停止开始语音
    if (this.startAudio) {
      this.startAudio.stop()
    }
    
    // 停止倒计时数字语音
    if (this.countdownAudios) {
      this.countdownAudios.forEach(audio => {
        if (audio) audio.stop()
      })
    }
  },

  resetTraining: function() {
    // 清理所有可能的定时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    if (this.data.prepareTimer) {
      clearInterval(this.data.prepareTimer)
    }
    if (this.data.restTimer) {
      clearInterval(this.data.restTimer)
    }
    
    // 获取当前页面实例
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    // 确保使用原始的休息时间，特别处理0值
    const originalRestTime = options.rest === "0" ? 0 : (parseInt(options.rest) || 60);
    
    this.setData({
      status: 'idle',
      timerText: 'GO',
      statusText: '准备开始',
      currentSet: 0,
      currentCount: 0,
      // 重置为URL参数中的原始值
      restTime: originalRestTime,
      timer: null,
      prepareTimer: null,
      restTimer: null
    })
  },

  // 保存训练记录到本地文件
  saveTrainingRecord: function() {
    const endTime = new Date().getTime()
    const trainingRecord = {
      artId: this.data.art.id,
      artName: this.data.art.name,
      levelId: this.data.level.id,
      levelName: this.data.level.name,
      difficultyId: this.data.difficultyId,
      difficultyName: this.data.selectedDifficulty ? this.data.selectedDifficulty.name : null,
      totalSets: this.data.totalSets,
      totalCount: this.data.totalCount,
      countInterval: this.data.countInterval,
      restTime: this.data.restTime,
      soundType: this.data.soundType,
      startTime: this.data.startTime,
      endTime: endTime,
      duration: endTime - this.data.startTime,
      date: new Date().toISOString().split('T')[0],
      time: this.data.selectedDifficulty ? this.data.selectedDifficulty.time : 0
    }

    // 使用 DataManager 保存训练记录
    DataManager.saveTrainingRecord(trainingRecord);
    // console.log('训练记录已保存');
  },

  // 读取指定月份的训练记录
  readMonthRecords: function(year, month) {
    return DataManager.loadMonthRecords(year, month);
  },

  // 读取所有训练记录
  readAllRecords: function() {
    return DataManager.loadAllTrainingRecords();
  },

  finishTraining: function() {
    this.setData({
      status: 'finished',
      statusText: '训练完成！',
      timerText: 'GO'
    })
    
    // 保存训练记录
    this.saveTrainingRecord()
    
    // 播放全部完成的语音提示
    setTimeout(() => {
      this.allCompleteAudio.play()
    }, 500)
  },

  onUnload: function() {
    // 清理所有定时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    if (this.data.prepareTimer) {
      clearInterval(this.data.prepareTimer)
    }
    if (this.data.restTimer) {
      clearInterval(this.data.restTimer)
    }
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
    if (this.data.delayTimer) {
      clearTimeout(this.data.delayTimer)
    }
    
    // 安全地销毁音频实例
    const destroyAudioContext = (audio) => {
      if (audio) {
        try {
          audio.destroy()
        } catch (e) {
          console.log('销毁音频实例失败:', e)
        }
      }
    }

    // 销毁所有音频实例
    destroyAudioContext(this.startAudio)
    destroyAudioContext(this.completeAudio)
    destroyAudioContext(this.numberAudio)
    destroyAudioContext(this.nextSetAudio)
    destroyAudioContext(this.tickAudio)
    destroyAudioContext(this.allCompleteAudio)
    destroyAudioContext(this.countdownStartAudio)
    
    // 销毁倒计时音频实例
    if (this.countdownAudios) {
      this.countdownAudios.forEach(audio => {
        destroyAudioContext(audio)
      })
    }
  }
}) 