import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
export const baseURL = 'http://big-event-vue-api-t.itheima.net'
const myAxios = axios.create({
  baseURL
})
myAxios.interceptors.request.use(config => {
  if (store.state.token) {
    config.headers.Authorization = store.state.token
  }
  return config
}, error => {
  Promise.reject(error)
})
myAxios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response.status === 401) {
    // 清空vuex并跳转到登录页
    store.commit('updateToken', '')
    store.commit('updateUserInfo', {})
    router.push('/login')
    Message.error('登录状态已失效!!!!')
  }
  return Promise.reject(error)
})
export default myAxios
