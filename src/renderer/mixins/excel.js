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
        this.searchNearby()
      } else {
        this.searchInBounds()
      }
    },
    // 圆形搜索
    searchNearby() {
      var _this = this
      // var ret = {}
      for (let item of this.options.entries()) {
        var _item = item
        // var m = new Map()
        // 定位地点
        this.map.centerAndZoom(new this.BMap.Point(item[1].point.lng, item[1].point.lat), this.mapZoom)
        var options = {
          onSearchComplete: function (results) {
            if (local.getStatus() === 0) {
              var s = []
              // 遍历一个地址的一个关键字的结果
              for (var i = 0; i < results.getCurrentNumPois(); i++) {
                var x = results.getPoi(i)
                // 计算中心点到结果点的距离
                var distance = _this.map.getDistance(new _this.BMap.Point(_item[1].point.lng, _item[1].point.lat), new _this.BMap.Point(x.point.lng, x.point.lat))
                var item = {
                  value: x.address + x.title,
                  point: x.point,
                  distance: distance,
                  keyword: results.keyword
                }
                s.push(item)
              }
              // m.set(results.keyword, s)
              _this.excel.set(_item[1].value + '/' + results.keyword, s)
            }
          }
        }
        var local = new this.BMap.LocalSearch(this.map, options)
        // 对每一个地址都要搜多个关键字
        for (let kw of this.keyword.values()) {
          // 第一个参数：关键字 第二个参数：搜索的中心点 第三个参数：半径 第四各参数：自定义检索数据
          local.searchNearby(kw, new this.BMap.Point(item[1].point.lng, item[1].point.lat), 300)
        }
        // this.excel.set(item[1].value, m)
        console.log(item[1], this.excel)
      }
    },
    // 矩形搜索
    searchInBounds() {
      // console.log('******矩形*****', this.options)
    }
  }
}