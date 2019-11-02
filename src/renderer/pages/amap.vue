<template>
  <div>
    <!-- 上传Excel -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24">
         <upExcel @getInfo='getInfo'></upExcel>
      </el-col>
    </el-row>
    <!-- 下载Excel -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24">
        <el-button style="margin-left:16px;" size="mini" type="primary" plain @click="download()" :loading="downloadLoading">Download</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AMap from '../utils/AMap'
import { excel } from '../mixins/aexcel'
import upExcel from '../components/upExcel/excelData'
export default {
  name: 'AMap',
  components: { upExcel },
  mixins: [excel],
  data () {
    return {
      downloadLoading: false,
      mapZoom: 15,
      mapCenter: { lng: 30.598604, lat: 114.311754 },
      mapLocation: {
        address: undefined,
        coordinate: undefined
      },
      map: null,
      resMap: null,
      uploadData: {}
    }
  },
  created() {
    //
  },
  mounted() {
    this.initAMap()
  },
  methods: {
    getInfo(data) {
      // 获取上传的excel信息
      this.uploadData = data
      console.log('上传的信息', this.uploadData)
    },
    async initAMap() {
      try {
        // 初始化地图
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
    }
  }
}
</script>

<style>

</style>