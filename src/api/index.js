import request from '@/utils/request'

export const registerAPI = () => {
  return request({
    url: '/api/reg',
    method: 'post',
    data: {
      username: 'luckyboy',
      password: '123456',
      repassword: '123456'
    }
  })
}
