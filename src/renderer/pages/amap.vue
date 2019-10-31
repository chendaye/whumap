<template>
  <div>
    <el-row :gutter="20">
      <el-col :xs="22" :sm="22" :md="22">
        <el-autocomplete
        v-model="mapLocation.address"
        :fetch-suggestions="querySearch"
        placeholder="请输入详细地址"
        style="width: 100%"
        :trigger-on-focus="false"
        @select="handleSelect"
      />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AMap from '../utils/AMap'
export default {
  name: 'AMap',
  data () {
    return {
      mapZoom: 15,
      mapCenter: { lng: 0, lat: 0 },
      mapLocation: {
        address: undefined,
        coordinate: undefined
      },
      map: null,
      resMap: null
    }
  },
  created() {
    //
  },
  mounted() {
    this.initAMap()
  },
  methods: {
    async initAMap() {
      try {
        // 修改
        this.resMap = await AMap()
        this.map = new this.resMap.Map('container', {
          resizeEnable: true, // 是否监控地图容器尺寸变化
          zooms: [3, 19], // 设置地图级别范围
          zoom: 14, // 初始化地图层级
          zoomEnable: true, // 是否缩放
          scrollWheel: true, // 是否支持滚轮缩放
          dragEnable: true, // 是否支持鼠标拖拽平移
          jogEnable: true, // 是否支持缓动效果
          buildingAnimation: true, // 模块消失是否有动画效果
          center: [this.mapCenter.lng, this.mapCenter.lat] // 初始化地图中心点
        })

        this.addMarker()
      } catch (err) {
        console.error(err)
      }
    },
    // 创建点标记
    addMarker() {
      this.marker = new this.resMap.Marker({
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        position: [this.mapCenter.lng, this.mapCenter.lat],
        offset: new this.resMap.Pixel(-13, -30)
      })

      // 记的在data里添加circle
      this.circle = this.addCircle()
      this.map.add([this.marker, this.circle])
      this.map.setFitView()
    },

    // 构建矢量圆形
    addCircle() {
      return new this.resMap.Circle({
        center: new this.resMap.LngLat(`${this.lng}`, `${this.lat}`), // 圆心位置
        radius: 500, // 半径，米
        strokeColor: '#F33', // 线颜色
        strokeOpacity: 1, // 线透明度
        strokeWeight: 3, // 线粗细度
        fillColor: '#ee2200', // 填充颜色
        fillOpacity: 0.35 // 填充透明度
      })
    },

    // 获取当前位置信息
    getCityInfo() {
      this.map.plugin('AMap.Geolocation', () => {
        var geolocation = new this.resMap.Geolocation({
        // 是否使用高精度定位，默认：true
          enableHighAccuracy: true,
          // 设置定位超时时间，默认：无穷大
          timeout: 10000,
          // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
          buttonOffset: new this.resMap.Pixel(10, 20),
          //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          zoomToAccuracy: true,
          //  定位按钮的排放位置,  RB表示右下
          buttonPosition: 'RB'
        })

        geolocation.getCurrentPosition()
        this.resMap.event.addListener(geolocation, 'complete', this.onComplete)
        this.resMap.event.addListener(geolocation, 'error', this.onError)
      })
    },

    // 获取定位结果
    onComplete(res) {
      // data中添加distance
      this.distance = this.calculatingDistance(res.position)
    },

    // 定位出错
    onError(err) {
      console.error(err, '--定位出错--')
    },

    // 计算两点之间的距离
    calculatingDistance(position) {
      const p1 = [this.mapCenter.lng, this.mapCenter.lat]
      // data中添加myPosition
      this.myPosition = [this.mapCenter.lng, this.mapCenter.lat]
      return this.resMap.GeometryUtil.distance(p1, this.myPosition)
    },

    // 根据搜索结果重新定位点
    querySearch (queryString, cb) {
      var that = this
      var myGeo = new this.BMap.Geocoder()
      myGeo.getPoint(queryString, function (point) {
        if (point) {
          that.mapLocation.coordinate = point
          that.makerCenter(point)
        } else {
          that.mapLocation.coordinate = null
        }
      }, this.locationCity)
      var options = {
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            // 判断状态是否正确
            var s = []
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              var item = { value: x.address + x.title, point: x.point }
              s.push(item)
              cb(s)
            }
          } else {
            cb()
          }
        }
      }
      var local = new this.BMap.LocalSearch(this.map, options)
      local.search(queryString)
    },
    handleSelect (item) {
      var { point } = item
      this.mapLocation.coordinate = point
      this.makerCenter(point)
    }
  }
}
</script>

<style>

</style>