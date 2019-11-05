
export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      radius: 0.3, // 300m
      excel: new Map(), // excel数据
      list: [], // 数组数据
      obj: [], // 数组数据
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
    // map 转 对象
    strMapToObj(strMap) {
      let obj = Object.create(null)
      for (let [k, v] of strMap) {
        obj[k] = v
      }
      return obj
    },
    // map 转 数组
    strMapToArr(strMap) {
      let arr = []
      for (let v of strMap) {
        arr.push(v[1])
      }
      return arr
    },
    // 搜索结果
    result() {
      // for循环执行时不会等待异步函数执行
      for (let item of this.options.values()) {
        // 异步
        this.searchNearby(item, (res) => {
          this.list.push(res)
          console.log(item.value, this.list)
        })
      }
    },
    // todo:搜索一个地址的多个关键字
    searchNearby(item, cb = null) {
      var that = this
      var center = item.value
      var point = item.point
      var data = []
      // 定位地点
      this.map.centerAndZoom(new this.BMap.Point(point.lng, point.lat), this.mapZoom)
      var options = {
        // todo:异步回调函数
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            var s = []
            // 遍历一个地址的一个关键字的结果
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              // 计算中心点到结果点的距离
              var distance = that.map.getDistance(new that.BMap.Point(point.lng, point.lat), new that.BMap.Point(x.point.lng, x.point.lat))
              distance = distance.toFixed(2) // 保留2位小数
              var tmp = {
                value: x.address + x.title,
                point: x.point,
                distance: distance,
                keyword: results.keyword
              }
              s.push(tmp)
            }
            let m = {
              center: center,
              key: results.keyword,
              value: s
            }
            // todo:异步回调
            data.push(m)
            cb(m)
          }
        }
      }
      var local = new this.BMap.LocalSearch(this.map, options)
      for (let kw of this.keyword.values()) {
        // 对每一个地址都要搜多个关键字。第一个参数：关键字 第二个参数：搜索的中心点 第三个参数：半径 第四各参数：自定义检索数据
        local.searchNearby(kw, new this.BMap.Point(point.lng, point.lat), this.radius * 1000)
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