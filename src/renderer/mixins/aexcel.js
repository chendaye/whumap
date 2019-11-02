export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      radius: 0.3, // 300m
      excel: new Map(), // excel数据
      list: [], // 数组数据
      // keyword: ['商场', '超市', '快餐店', '交叉路口'], // 个数或距离，面积
      filename: '',
      autoWidth: true,
      bookType: 'xlsx',
      // 动态关键字
      keyword: ['篮球场', '足球场', '羽毛球场'],
      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    // 搜索结果
    download() {
      // 下载excel
      this.handleDownload()
    },
    // todo:重组excel数据
    toExcel() {
      let tmp = [...this.excel]
      for (let value of tmp.entries()) {
        // let t = [...value[1]]
        console.log(value[1])
        // for (let [k, v] of value[1].entries()) {
        //   console.log(k, v)
        // }
      }
    },
    handleDownload() {
      this.downloadLoading = true
      import('../vendor/Export2Excel').then(excel => {
        const tHeader = ['Id', 'Title', 'Author', 'Readings']
        const filterVal = ['id', 'title', 'author', 'pageviews']
        const list = [
          { id: 10, 'title': 'lengo', 'author': 'long', 'pageviews': 10 },
          // eslint-disable-next-line standard/object-curly-even-spacing
          { id: 110, 'title': 'lengo', 'author': 'long', 'pageviews': 10}
        ]
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    // 动态关键字
    closeTag(tag) {
      this.keyword.splice(this.keyword.indexOf(tag), 1)
    },

    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.keyword.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
}