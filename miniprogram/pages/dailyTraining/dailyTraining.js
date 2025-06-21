const DataManager = require('../../utils/dataManager');
const app = getApp();

Page({
  data: {
    currentDate: '',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    days: [],
    selectedDate: new Date().toISOString().split('T')[0],
    dailyTrainings: []
  },

  onLoad() {
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ currentDate });
    this.generateCalendar();
    this.loadDailyTrainings(this.data.selectedDate);
  },

  onDateChange(e) {
    const date = e.detail.value;
    const [year, month] = date.split('-').map(Number);
    this.setData({
      currentDate: date,
      currentYear: year,
      currentMonth: month
    });
    this.generateCalendar();
  },

  generateCalendar() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const trainingDates = DataManager.getTrainingDates();
    
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    const days = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = `${year}-${String(month-1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        hasTraining: trainingDates.includes(date)
      });
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && 
                     today.getMonth() + 1 === month && 
                     today.getDate() === i;
      
      days.push({
        day: i,
        date,
        isCurrentMonth: true,
        isToday,
        hasTraining: trainingDates.includes(date)
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date,
        isCurrentMonth: false,
        isToday: false,
        hasTraining: trainingDates.includes(date)
      });
    }
    
    this.setData({ days });
  },

  onDayTap(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
    this.loadDailyTrainings(date);
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  loadDailyTrainings(date) {
    const allRecords = DataManager.loadAllTrainingRecords();
    const dailyTrainings = allRecords
      .filter(record => record.date === date)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(record => ({
        ...record,
        startTime: this.formatTime(record.startTime)
      }));
    
    this.setData({ dailyTrainings });
  },

  onShow() {
    this.generateCalendar();
    this.loadDailyTrainings(this.data.selectedDate);
  }
}); 