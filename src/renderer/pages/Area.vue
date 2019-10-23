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
export default {
  name: 'Area',
  data () {
    return {
      // 缩放比例
      mapZoom: 15,
      // 经纬度
      mapCenter: { lng: 0, lat: 0 },
      // 详细地址信息
      mapLocation: {
        address: undefined,
        coordinate: undefined
      },
      // 所选信息
      area: [],
      // excel信息
      excelData: []
    }
  },
  methods: {
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
    },
    makerCenter (point) {
      if (this.map) {
        this.map.clearOverlays()
        this.map.addOverlay(new this.BMap.Marker(point))
        this.mapCenter.lng = point.lng
        this.mapCenter.lat = point.lat
        this.mapZoom = 15
      }
    }
  }
}
</script>

<style>

</style>