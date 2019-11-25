
export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      radius: 0, // 300m
      excel: new Map(), // excel数据
      list: [], // 数组数据
      obj: [], // 数组数据
      // keyword: ['商场', '超市', '快餐店', '交叉路口'], // 个数或距离，面积
      filename: '',
      autoWidth: true,
      bookType: 'xlsx',
      // 动态关键字
      keyword: ['超市', '公园', '公交站', '地铁站', '中餐', '酒店'],
      inputVisible: false,
      inputValue: '',
      header: ['地址', '关键字', '最近距离(米)', '密度(个/平方公里)', '数量'],
      filter: ['center', 'keyword', 'min', 'density', 'number']
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
      this.downloadLoading = true
      this.list = [] // 清空
      // for循环执行时不会等待异步函数执行
      var kLen = this.keyword.length > 0 ? this.keyword.length : 0
      var aLen = this.options.size > 0 ? this.options.size : 0
      for (let item of this.options.values()) {
        // 异步
        this.searchNearby(item, (res) => {
          this.list.push(res)
          // todo终止条件
          if (this.list.length === kLen * aLen) {
            let excel = []
            // 遍历异步结果，组织成excel数据
            // console.log('raw', this.list)
            for (let el of this.list.values()) {
              let center = el.center
              let keyword = el.key
              let min = Number.MAX_SAFE_INTEGER
              let number = 0
              for (let e of el.value.values()) {
                // 找最小距离
                if (min > Number(e.distance)) min = e.distance
                number = Number(e.total)
              }
              let den = number / (Math.pow(this.radius / 1000, 2) * 3.14) // 半径单位米
              excel.push({
                center: center,
                keyword: keyword,
                min: min === Number.MAX_SAFE_INTEGER ? 0 : min,
                density: den.toFixed(5), // 保留5位小数
                number: number
              })
            }
            // console.log('excel', excel)
            this.handleDownload(excel)
            this.downloadLoading = false
          }
        })
      }
    },
    // todo:搜索一个地址的多个关键字
    searchNearby(item, cb = null) {
      var that = this
      var center = item.value
      var point = item.point
      // 定位地点
      this.map.centerAndZoom(new this.BMap.Point(point.lng, point.lat), this.mapZoom)
      var options = {
        // todo:异步回调函数
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            var s = []
            // 遍历一个地址的一个关键字的结果
            // console.log('总页数', results.getNumPages())
            // console.log('当前页', results.getPageIndex())
            // console.log('总结果数', results.getNumPois())
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              // 计算中心点到结果点的距离
              var distance = that.map.getDistance(new that.BMap.Point(point.lng, point.lat), new that.BMap.Point(x.point.lng, x.point.lat))
              distance = distance.toFixed(2) // 保留2位小数
              var tmp = {
                value: x.address + x.title,
                point: x.point,
                distance: distance,
                keyword: results.keyword,
                total: results.getNumPois() // 总结果数
              }
              s.push(tmp)
            }
            let m = {
              center: center,
              key: results.keyword,
              value: s
            }
            // todo:异步回调
            if (cb) cb(m)
          } else {
            let m = {
              center: center,
              key: results.keyword,
              value: []
            }
            // todo:异步回调
            if (cb) cb(m)
          }
        },
        pageCapacity: 100 // 每页最大100
      }
      var local = new this.BMap.LocalSearch(this.map, options)
      for (let kw of this.keyword.values()) {
        // 对每一个地址都要搜多个关键字。第一个参数：关键字 第二个参数：搜索的中心点 第三个参数：半径 第四各参数：自定义检索数据
        local.searchNearby(kw, new this.BMap.Point(point.lng, point.lat), this.radius)
      }
    },
    // 矩形搜索
    searchInBounds() {
      // ....
    },
    handleDownload(data) {
      this.downloadLoading = true
      var res = data
      import('../vendor/Export2Excel').then(excel => {
        const tHeader = this.header
        const filterVal = this.filter
        const data = this.formatJson(filterVal, res)
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