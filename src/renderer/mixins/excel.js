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
    result() {
      // excel数据
      if (this.isCircle) {
        for (let item of this.options.entries()) {
          this.excel.set(item[0], this.searchNearby(item))
        }
        // 重组excel数据
        this.toExcel()
        // 下载excel
        // this.handleDownload()
      } else {
        this.searchInBounds()
      }
    },
    // todo:重组excel数据
    toExcel() {
      for (let value of this.excel.entries()) {
        // let centerPoint = value[0]
        let centerInfo = value[1]
        centerInfo.push([123, 456])
        console.log('data', centerInfo)
        console.log('size', centerInfo.length)
        console.log('size', centerInfo[1])
        // 关键字地址个数
        for (let elem of centerInfo.values()) {
          console.log(elem)
        }
      }
    },
    // todo:搜索一个地址的多个关键字
    searchNearby(item) {
      var data = []
      var that = this
      var _item = item
      // 定位地点
      this.map.centerAndZoom(new this.BMap.Point(_item[1].point.lng, _item[1].point.lat), this.mapZoom)
      var options = {
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            var s = []
            // 遍历一个地址的一个关键字的结果
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              // 计算中心点到结果点的距离
              var distance = that.map.getDistance(new that.BMap.Point(_item[1].point.lng, _item[1].point.lat), new that.BMap.Point(x.point.lng, x.point.lat))
              distance = distance.toFixed(2) // 保留2位小数
              var item = {
                value: x.address + x.title,
                point: x.point,
                distance: distance,
                keyword: results.keyword
              }
              s.push(item)
            }
            let m = {
              key: results.keyword,
              value: s
            }
            data.push(m)
          }
        }
      }
      var local = new this.BMap.LocalSearch(this.map, options)
      for (let kw of this.keyword.values()) {
        // 对每一个地址都要搜多个关键字。第一个参数：关键字 第二个参数：搜索的中心点 第三个参数：半径 第四各参数：自定义检索数据
        local.searchNearby(kw, new this.BMap.Point(item[1].point.lng, item[1].point.lat), this.radius * 1000)
      }
      return data
    },
    // 矩形搜索
    searchInBounds() {
      // ....
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