export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      excel: new Map(), // excel数据
      keyword: ['商场', '超市', '快餐店', '交叉路口'] // 个数或距离，面积
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
        console.log('fuck', this.excel)
      } else {
        this.searchInBounds()
      }
    },
    // todo:搜索一个地址的多个关键字
    searchNearby(item) {
      var data = new Map()
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
              var item = {
                value: x.address + x.title,
                point: x.point,
                distance: distance,
                keyword: results.keyword
              }
              s.push(item)
            }
            data.set(results.keyword, s)
          }
        }
      }
      var local = new this.BMap.LocalSearch(this.map, options)
      for (let kw of this.keyword.values()) {
        // 对每一个地址都要搜多个关键字。第一个参数：关键字 第二个参数：搜索的中心点 第三个参数：半径 第四各参数：自定义检索数据
        local.searchNearby(kw, new this.BMap.Point(item[1].point.lng, item[1].point.lat), 300)
      }
      return data
    },
    // 矩形搜索
    searchInBounds() {
      // ....
    }
    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['Id', 'Title', 'Author', 'Readings', 'Date']
    //     const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
    //     const list = this.list
    //     const data = this.formatJson(filterVal, list)
    //     excel.export_json_to_excel({
    //       header: tHeader,
    //       data,
    //       filename: this.filename,
    //       autoWidth: this.autoWidth,
    //       bookType: this.bookType
    //     })
    //     this.downloadLoading = false
    //   })
    // },
  }
}