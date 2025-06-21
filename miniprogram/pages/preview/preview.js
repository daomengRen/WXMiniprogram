Page({

  data: {
    htmlContent: '',
    decodeContent:''
  },
  
  onLoad(options) {
    const content = decodeURIComponent(options.content)
    console.log(content);
    this.setData({
      htmlContent: `data:text/html;charset=utf-8,${encodeURIComponent(
        `<pre style="font-size:16px;padding:20px">${content}</pre>`
      )}`,
      decodeContent: content
    })
  }
})