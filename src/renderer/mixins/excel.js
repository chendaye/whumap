export const excel = {
  data() {
    return {
      isCircle: true, // 默认搜索圆
      excel: [], // excel数据
      keyword: ['商场', '超市', '快餐店', '交叉路口'] // 个数或距离，面积
    }
  },
  methods: {
    // 重新设置地图中心点
    makerCenter(point) {
      if (this.map) {
        // 清除地图上的覆盖物
        this.map.clearOverlays()
        // 添加地图标注
        this.map.addOverlay(new this.BMap.Marker(point))
        this.mapCenter.lng = point.lng
        this.mapCenter.lat = point.lat
        this.mapZoom = 15
      }
    },
    // 根据查询地址解析经纬度，设置地图中心
    reLocation(queryString) {
      var that = this
      var myGeo = new this.BMap.Geocoder()
      // 过Geocoder.getPoint()方法来将一段地址描述转换为一个坐标
      myGeo.getPoint(queryString, function (point) {
        if (point) {
          that.mapLocation.coordinate = point
          that.makerCenter(point)
        } else {
          that.mapLocation.coordinate = null
        }
      }, this.locationCity)
    },
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
        this.reLocation(item[1].value)
        // 搜索结果的回调
        var options = {
          onSearchComplete: function (results) {
            console.log('$$$$$$$$$$$', results)
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
        // 搜索
        var local = new this.BMap.LocalSearch(this.map, options)
        local.search('商场')
      }
    },
    // 矩形搜索
    searchInBounds() {
      // console.log('******矩形*****', this.options)
    }
  }
}