export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      excel: [], // excel数据
      keyword: ['商场', '超市', '快餐店', '交叉路口'] // 个数或距离，面积
    }
  },
  methods: {
    // 搜索结果
    result() {
      // excel数据
      if (this.isCircle) {
        this.searchNearby()
      } else {
        this.searchInBounds()
      }
    },
    // 圆形搜索
    searchNearby() {
      var _this = this
      for (let item of this.options.entries()) {
        // 定位地点
        this.map.centerAndZoom(new this.BMap.Point(item[1].point.lng, item[1].point.lat), this.mapZoom)
        var options = {
          onSearchComplete: function (results) {
            console.log('fuck-lan', results)
            if (local.getStatus() === 0) {
              for (var i = 0; i < results.getCurrentNumPois(); i++) {
                var x = results.getPoi(i)
                var item = {
                  value: x.address + x.title,
                  point: x.point
                }
                _this.excel.push(item)
              }
            }
          }
        }
        var local = new this.BMap.LocalSearch(this.map, options)
        local.searchNearby('超市', new this.BMap.Point(item[1].point.lng, item[1].point.lat), 3000)
        console.log('%%%%%%%%%%%%', this.excel)
      }
    },
    // 矩形搜索
    searchInBounds() {
      // console.log('******矩形*****', this.options)
    }
  }
}