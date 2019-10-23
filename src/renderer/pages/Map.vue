<template>
<div>
  <!-- <baidu-map :center="center" :zoom="zoom" @ready="handler"></baidu-map> -->
</div>
</template>
<script>
export default {
//   data () {
//     return {
//       center: {lng: 0, lat: 0},
//       zoom: 3
//     }
//   },
//   methods: {
//     handler ({BMap, map}) {
//       console.log(BMap, map)
//       this.center.lng = 116.404
//       this.center.lat = 39.915
//       this.zoom = 15
//     }
//   }
}
</script>
<style lang='stylus'>
.view-title
  color #eee
  font-size 20px
  text-align center
  margin 10px auto
#upload-view
  .view-title
    margin 20px auto
  #upload-area
    height 220px
    border 2px dashed #dddddd
    border-radius 8px
    text-align center
    width 450px
    margin 0 auto
    color #dddddd
    cursor pointer
    transition all .2s ease-in-out
    #upload-dragger
      height 100%
    &.is-dragover,
    &:hover
      border 2px dashed #A4D8FA
      background-color rgba(164, 216, 250, 0.3)
      color #fff
    i
      font-size 66px
      margin 50px 0 16px
      line-height 66px
    span
      color #409EFF
  #file-uploader
    display none
  .upload-progress
    opacity 0
    transition all .2s ease-in-out
    width 450px
    margin 20px auto 0
    &.show
      opacity 1
    .el-progress-bar__inner
      transition all .2s ease-in-out
  .paste-style
    text-align center
    margin-top 16px
    &__text
      font-size 12px
      color #eeeeee
      margin-bottom 4px
  .el-radio-button:first-child
    .el-radio-button__inner
      border-left none
  .el-radio-button:first-child
    .el-radio-button__inner
      border-left none
      border-radius 14px 0 0 14px
  .el-radio-button:last-child
    .el-radio-button__inner
      border-left none
      border-radius 0 14px 14px 0
  .paste-upload
    width 100%
</style>