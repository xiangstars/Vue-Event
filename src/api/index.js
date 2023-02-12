import request from '@/utils/request'
export const registerAPI = ({ username, password, repassword }) => {
  return request({
    url: '/api/reg',
    method: 'post',
    data: {
      username,
      password,
      repassword
    }
  })
}
export const loginAPI = ({ username, password }) => {
  return request({
    url: '/api/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}
export const getUserInfoAPI = () => {
  return request({
    url: '/my/userinfo'
  })
}

export const getMenusAPI = () => {
  return request({
    url: '/my/menus'
  })
}

export const updateUserInfo = ({ id, nickname, email }) => {
  return request({
    url: '/my/userinfo',
    method: 'put',
    data: {
      id,
      nickname,
      email
    }
  })
}

export const updateUserAvatar = (avatar) => {
  return request({
    url: '/my/update/avatar',
    method: 'patch',
    data: {
      avatar
    }
  })
}

export const updatePwdAPI = ({ old_pwd, new_pwd, re_pwd }) => {
  return request({
    url: '/my/updatepwd',
    method: 'PATCH',
    data: {
      old_pwd,
      new_pwd,
      re_pwd
    }
  })
}

export const getArtCate = () => {
  return request({
    url: '/my/cate/list'
  })
}

export const addArtCate = ({ cate_name, cate_alias }) => {
  return request({
    url: '/my/cate/add',
    method: 'post',
    data: {
      cate_name,
      cate_alias
    }
  })
}

export const updateArtCate = ({ id, cate_name, cate_alias }) => {
  return request({
    url: '/my/cate/info',
    method: 'put',
    data: {
      id,
      cate_name,
      cate_alias
    }
  })
}

export const deleteArtCate = (id) => {
  return request({
    url: '/my/cate/del',
    method: 'delete',
    params: {
      id
    }
  })
}
export const uploadArticleAPI = (fd) => {
  return request({
    url: '/my/article/add',
    method: 'POST',
    data: fd // 参数要的是表单对象, 不能写普通对象, axios内部会判断, 如果是表单对象, 传递的请求体会设置Content-Type: form-data与后端对应
  })
}
export const getArticleListAPI = ({ pagenum, pagesize, cate_id, state }) => {
  return request({
    url: '/my/article/list',
    params: {
      pagenum,
      pagesize,
      cate_id,
      state
    }
  })
}
export const getArticleInfoAPI = (id) => {
  return request({
    url: '/my/article/info',
    params: {
      id
    }
  })
}
export const deleteArticleAPI = (id) => {
  return request({
    url: '/my/article/info',
    method: 'delete',
    params: {
      id
    }
  })
}
