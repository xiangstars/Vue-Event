const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 使用publicPath可以影响index.html引入其他打包后的资源的前缀相对路径
  publicPath: process.env.NODE_ENV === 'development' ? '/' : './'
})
