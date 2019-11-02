/**
 * 作用类似于
 * < script src = "https://webapi.amap.com/maps?v=1.4.15&key=您申请的key值" > < /script>
 */
export default function MapLoader() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      // 检查当前有无 AMao对象
      resolve(window.AMap)
    } else {
      // 没有加载脚本
      var script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=307bb2c7ba00ddac33f7fdacc861ba26&plugin=AMap.Geocoder&callback=initAMap'
      script.onerror = reject
      document.head.appendChild(script)
    }
    // 添加 initAMap函数
    window.initAMap = () => {
      resolve(window.AMap)
    }
  })
}
