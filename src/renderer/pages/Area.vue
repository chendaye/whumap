<template>
  <div>
    <el-row :gutter="20">
      <el-col :xs="10" :sm="10" :md="10">
        <el-autocomplete
        v-model="mapLocation.address"
        :fetch-suggestions="querySearch"
        placeholder="请输入详细地址"
        style="width: 100%"
        :trigger-on-focus="false"
        @select="handleSelect"
      />
      </el-col>
      <el-col :xs="6" :sm="6" :md="6">
          <el-radio-group v-model="isCircle">
            <el-radio-button :label="true">圆形</el-radio-button>
            <el-radio-button :label="false">矩形</el-radio-button>
          </el-radio-group>
      </el-col>
      <el-col :xs="2" :sm="2" :md="2">
        <el-button type="primary" plain @click="result()">Excel</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="15" :sm="15" :md="15">
        <baidu-map class="bm-view" :center="mapCenter" :zoom="mapZoom" :scroll-wheel-zoom="true" ak="baidu-ak" @ready="handlerBMap" />
      </el-col>
       <el-col :xs="8" :sm="8" :md="8">
        <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>已选地址列表</span>
        </div>
        <div v-for="(val, key) in options_arr" :key="key"  class="text item">
          <el-tag type="success" closable @close="handleClose(val[0])" >{{ val[0] }}</el-tag>
        </div>
      </el-card>
       </el-col>
    </el-row>
  </div>
</template>

<script>
import { excel } from '../mixins/excel'
export default {
  name: 'BaiduMapDemo',
  mixins: [excel],
  data () {
    return {
      map: null, // 图
      BMap: null, // 点
      mapZoom: 15,
      mapCenter: { lng: 0, lat: 0 }, // 武汉市江岸区
      mapLocation: {
        address: '武汉市市政府',
        coordinate: { lat: 30.598604, lng: 114.311754 }
      },
      options: new Map(), // 地址选项
      options_arr: []
    }
  },
  methods: {
    // 初始化地图中心
    handlerBMap ({ BMap, map }) {
      // 初始化地图类
      this.BMap = BMap // 点
      this.map = map // 图
      if (this.mapLocation.coordinate && this.mapLocation.coordinate.lng) {
        this.mapCenter.lng = this.mapLocation.coordinate.lng
        this.mapCenter.lat = this.mapLocation.coordinate.lat
        this.mapZoom = 15
        // 添加定位
        map.addOverlay(new this.BMap.Marker(this.mapLocation.coordinate))
      } else {
        this.mapCenter.lng = 113.271429
        this.mapCenter.lat = 23.135336
        this.mapZoom = 10
      }
    },
    // 根据搜索结果重新定位点
    querySearch (queryString, cb) {
      // 根据查询地址解析经纬度，设置地图中心
      this.reLocation(queryString)
      // 搜索结果的回调
      var options = {
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            // 判断状态是否正确
            var s = []
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              // var item = { value: x.address + x.title, point: x.point }
              var item = { value: x.address + x.title, point: x.point }
              s.push(item)
              cb(s)
            }
          } else {
            cb()
          }
        }
      }
      // 搜索
      var local = new this.BMap.LocalSearch(this.map, options)
      local.search(queryString)
    },
    // 重新设置地图中心点
    makerCenter (point) {
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
    reLocation (queryString) {
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
    // 地址选择
    handleSelect (item) {
      var { point } = item
      this.mapLocation.coordinate = point
      this.makerCenter(point)
      // 添加搜索地址
      if (!this.options.has(item.value) && this.options.size < 11) {
        this.options.set(item.value, item)
        this.options_arr = [...this.options]
      }
    },
    // 关闭标签
    handleClose(key) {
      this.options.delete(key)
      this.options_arr = [...this.options]
    }
  }
}
</script>

<style>
.bm-view {
  width: 100%;
  height: 500px;
}
 .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

.box-card {
    width: 100%;
    min-height:500px
  }
</style>