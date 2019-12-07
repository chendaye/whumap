<template>
  <div>
    <!-- 第一列 -->
    <el-row :gutter="20">
      <el-col :xs="10" :sm="10" :md="10">
        <el-autocomplete
        v-model="mapLocation.address"
        :fetch-suggestions="querySearch"
        placeholder="请输入详细地址"
        style="width: 100%"
        :trigger-on-focus="false"
        @select="handleSelect"
        @focus="clearAddress"
      />
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" >
          <el-input placeholder="半径(1000以内)" v-model="radius" type="NUmber" :max="1000" :min="0" @input.native="changeNumber" @focus="clearRadius">
            <template slot="append">m</template>
          </el-input>
      </el-col>
       <el-col :xs="4" :sm="4" :md="4">
         <upExcel @getInfo='getInfo'></upExcel>
      </el-col>
      <el-col :xs="4" :sm="4" :md="4">
        <el-button type="primary" plain @click="result()" :loading="downloadLoading">下载Excel</el-button>
      </el-col>
    </el-row>
    <!-- 第二列 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24">
        <el-tag
          :key="tag"
          v-for="tag in keyword"
          closable
          :disable-transitions="false"
          @close="closeTag(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="inputVisible"
          v-model="inputValue"
          ref="saveTagInput"
          size="small"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"
        >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ Keywordd</el-button>
      <el-button class="button-new-tag" size="small"  @click="clearResult()" >clear</el-button>
      </el-col>
    </el-row>
    <!-- 第三列 -->
    <el-row :gutter="10">
      <el-col :xs="14" :sm="14" :md="14">
          <el-card class="box-card" style="height: auto; min-height:420px">
            <div slot="header" class="clearfix">
              <span>地址列表</span>
            </div>
            <div v-for="(val, key) in options_arr" :key="key"  class="text item">
              <el-tag type="success" closable @close="handleClose(val[0])" >{{ val[0] }}</el-tag>
            </div>
          </el-card>
       </el-col>
      <el-col :xs="10" :sm="10" :md="10">
        <baidu-map class="bm-view" :center="mapCenter" :zoom="mapZoom" :scroll-wheel-zoom="true" ak="baidu-ak" @ready="handlerBMap" />
      </el-col>  
    </el-row>
  </div>
</template>

<script>
import { excel } from '../mixins/excel'
import upExcel from '../components/upExcel/excelData'
export default {
  name: 'BaiduMapDemo',
  mixins: [excel],
  components: { upExcel },
  data () {
    return {
      downloadLoading: false,
      map: null, // 图
      BMap: null, // 点
      mapZoom: 15,
      mapCenter: { lng: 0, lat: 0 }, // 武汉市江岸区
      mapLocation: {
        address: '武汉市市政府',
        coordinate: { lat: 30.598604, lng: 114.311754 }
      },
      options: new Map(), // 地址选项
      options_arr: [],
      options_err_arr: [],
      uploadData: []
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
      item.value = `${item.value}[lng:${item.point.lng}, lat:${item.point.lat}]`
      if (!this.options.has(item.value) && this.options.size < 11) {
        this.options.set(item.value, item)
        this.options_arr = [...this.options]
        this.clearSearch() // 清除搜索结果
      }
    },
    getInfo(data) {
      var that = this
      var myGeo = new this.BMap.Geocoder()
      // 获取上传的excel信息
      this.uploadData = data
      for (let elem of this.uploadData.values()) {
        if (elem['地址'] === undefined || !elem['地址']) {
          continue
        }
        let queryString = elem['地址']
        myGeo.getPoint(queryString, function (point) {
          if (point) {
            let item = { value: `${elem['地址']}[lng:${point.lng}, lat:${point.lat}]`, point: point }
            if (!that.options.has(item.value)) {
              that.options.set(item.value, item)
              that.options_arr.push([item.value, point])
              that.mapLocation.coordinate = point
              that.makerCenter(point)
            }
          } else {
            that.options_err_arr.push(`${elem['地址']}[lng:${point.lng}, lat:${point.lat}]`)
            that.$message({
              message: '地址：' + elem['地址'] + '解析失败！请输入详细省市信息！',
              type: 'warning'
            })
          }
        }, this.locationCity)
      }
    },
    // 关闭标签
    handleClose(key) {
      this.options.delete(key)
      this.options_arr = [...this.options]
      this.clearSearch() // 清除搜索结果
    },
    // 清除搜索结果
    clearResult() {
      this.options = new Map()
      this.options_arr = []
      this.options_err_arr = []
      this.radius = 0
      this.keyword = this.keyword
      this.clearSearch()
    },
    // 聚焦清除地址
    clearAddress() {
      this.mapLocation = {
        address: '',
        coordinate: { lat: undefined, lng: undefined }
      }
    },
    clearRadius() {
      this.radius = null
    },
    // 清除搜索结果
    clearSearch() {
      this.excel = new Map()
    },
    changeNumber() {
      if (this.radius < 0) {
        this.radius = 0
      } else if (this.radius > 1000) {
        this.radius = 1000
      }
      this.radius = this.radius.replace('-', '')
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

  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
</style>