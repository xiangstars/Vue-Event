<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文章列表</span>
      </div>
      <div class="search-box">
        <el-form :inline="true" :model="q">
          <el-form-item label="文章分类">
            <el-select v-model="q.cate_id" placeholder="请选择分类" size="small">
              <el-option :label="item.cate_name" :value="item.id" v-for="item in cateList" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态" style="margin-left: 15px;">
            <el-select v-model="q.state" placeholder="请选择状态" size="small">
              <el-option label="已发布" value="已发布" ></el-option>
              <el-option label="草稿" value="草稿" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="chooseFn">筛选</el-button>
            <el-button type="info" size="small" @click="resetFn">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 发表文章的按钮 -->
        <el-button type="primary" size="small" class="btn-pub" @click="showPubDialogFn">发表文章</el-button>
      </div>
      <!-- 文章表格区域 -->
      <el-table :data="artList" style="width: 100%;" border stripe>
        <el-table-column label="文章标题" prop="title">
          <template v-slot="scope">
            <el-link type="primary" @click="showDetail(scope.row.id)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="cate_name"></el-table-column>
        <el-table-column label="发表时间" prop="pub_date">
          <template v-slot="scope">
            {{ $formatDate(scope.row.pub_date) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="state"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button type="primary" size="mini" @click="editArticle(row.id)">编辑</el-button>
            <el-button type="danger" size="mini" @click="removeFn(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChangeFn"
        @current-change="handleCurrentChangeFn"
        :current-page.sync="q.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size.sync="q.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 发表文章的 Dialog 对话框 -->
    <el-dialog title="发表文章" :visible.sync="pubDialogVisible" fullscreen :before-close="handleClose" @close="onDialogCloseFn">
      <!-- 发布文章的对话框 -->
      <el-form :model="pubForm" :rules="pubFormRules" ref="pubFormRef" label-width="100px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="pubForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="cate_id">
          <el-select v-model="pubForm.cate_id" placeholder="请选择分类" style="width: 100%;">
            <el-option :label="item.cate_name" :value="item.id" v-for="item in cateList" :key="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <!-- 使用 v-model 进行双向的数据绑定 -->
          <quill-editor v-model="pubForm.content" @blur="contentBlur"></quill-editor>
        </el-form-item>
        <el-form-item label="文章封面" prop="cover_img">
          <!-- 用来显示封面的图片 -->
          <img src="../../assets/images/cover.jpg" v-if="!pubForm.cover_img||typeof pubForm.cover_img == 'object'" alt="" class="cover-img" ref="imgRef" />
          <img :src="baseURLR + pubForm.cover_img" v-else alt="" class="cover-img" ref="imgRef" />
          <br />
          <!-- 文件选择框，默认被隐藏 -->
          <input type="file" style="display: none;" accept="image/*" ref="iptFileRef" @change="onCoverChangeFn"/>
          <!-- 选择封面的按钮 -->
          <el-button type="text" @click="chooseImgFn">+ 选择封面</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="pubArticleFn('已发布')">发布</el-button>
          <el-button type="info" @click="pubArticleFn('草稿')">存为草稿</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 查看文章详情的对话框 -->
    <el-dialog title="文章预览" :visible.sync="detailVisible" width="80%">
      <h1 class="title">{{ artDetail.title }}</h1>
      <div class="info">
        <span>作者：{{ artDetail.nickname || artDetail.username }}</span>
        <span>发布时间：{{ $formatDate(artDetail.pub_date) }}</span>
        <span>所属分类：{{ artDetail.cate_name }}</span>
        <span>状态：{{ artDetail.state }}</span>
      </div>
      <!-- 分割线 -->
      <el-divider></el-divider>
      <!-- 文章的封面 -->
      <img :src="baseURLR + artDetail.cover_img" alt="" />
      <!-- 文章的详情 -->
      <div v-html="artDetail.content" class="detail-box"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getArtCate, uploadArticleAPI, getArticleListAPI, getArticleInfoAPI, deleteArticleAPI } from '@/api'
import defaultImg from '@/assets/images/cover.jpg'
import { baseURL } from '@/utils/request'
import { imageToBase64, base64ToFile } from '@/utils/imageTransform'
export default {
  name: 'artList',
  data () {
    return {
      q: {
        pagenum: 1,
        pagesize: 5,
        cate_id: '',
        state: ''
      },
      artList: [],
      total: 0,
      baseURLR: baseURL,
      detailVisible: false,
      artDetail: {},
      cateList: [],
      pubDialogVisible: false,
      pubForm: {
        cate_id: '',
        title: '',
        content: '',
        cover_img: '',
        state: ''
      },
      pubFormRules: { // 表单的验证规则对象
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 1, max: 30, message: '文章标题的长度为1-30个字符', trigger: 'blur' }
        ],
        cate_id: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'change' }
        ],
        cover_img: [
          { required: true, message: '请选择文章封面', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.getArtCateList()
    this.getArticleList()
  },
  methods: {
    showPubDialogFn () {
      this.pubDialogVisible = true
    },
    // 对话框关闭前的回调
    async handleClose (done) {
    // 询问用户是否确认关闭对话框
      this.$confirm('是否离开页面？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'confirmButton'
      })
        .then(() => {
          done()
        }).catch(err => {
          return err
        })
    },
    async getArtCateList () {
      const { data: res } = await getArtCate()
      if (res.code === 0) {
        this.cateList = res.data
      }
    },
    async getArticleList () {
      const { data: res } = await getArticleListAPI(this.q)
      if (res.code !== 0) return this.$message.error(res.message)
      this.artList = res.data
      this.total = res.total
    },
    async showDetail (id) {
      const { data: res } = await getArticleInfoAPI(id)
      if (res.code !== 0) return this.$message.error(res.message)
      this.artDetail = res.data
      this.detailVisible = true
    },
    async removeFn (id) {
      // 1. 询问用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 2. 取消了删除
      if (confirmResult === 'cancel') return

      // 执行删除的操作
      const { data: res } = await deleteArticleAPI(id)

      if (res.code !== 0) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')
      if (this.artList.length === 1) {
        if (this.q.pagenum > 1) {
          this.q.pagenum--
        }
      }
      this.getArticleList()
    },
    async editArticle (id) {
      // 有问题:第一次打开网页，先点击修改按钮-〉虽然dialog变量为true了但是同步代码把addForm对象里赋值了(默认值)
      // ->DOM更新异步-> dialog出现-el-form组件第一次挂载(使用addForm内置做回显然后第一次el-form内绑定了初始值(有值))
      // ->以后做重置,它就用绑定的带值的做重置
      const { data: res } = await getArticleInfoAPI(id)
      if (res.code !== 0) return this.$message.error(res.message)
      this.pubDialogVisible = true
      this.$nextTick(() => {
        this.pubForm = {
          title: res.data.title,
          cate_id: res.data.cate_id,
          content: res.data.content,
          cover_img: res.data.cover_img,
          id: res.data.id
        }
      })
    },
    async handleImgTransForm (url) {
      const image = new Image()
      image.crossOrigin = ''
      image.src = url
      const getimg = () => {
        return new Promise(resolve => {
          image.onload = function () {
            const base64 = imageToBase64(image) // 图片转base64
            const file = base64ToFile(base64, 'file') // base64转File
            resolve(file)
          }
        })
      }
      const result = await getimg()
      return result
    },
    // pageSize 发生了变化
    handleSizeChangeFn (newSize) {
      this.pagenum = 1
      // 重新发起请求
      this.getArticleList()
    },
    // 页码值发生了变化
    handleCurrentChangeFn (newPage) {
      // 重新发起请求
      this.q.pagenum = newPage
      this.getArticleList()
    },
    chooseFn () {
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.getArticleList()
    },
    resetFn () {
      this.q = {
        pagenum: 1,
        pagesize: 5,
        cate_id: '',
        state: ''
      }
      this.getArticleList()
    },
    chooseImgFn () {
      this.$refs.iptFileRef.click()
    },
    contentBlur () {
      this.$refs.pubFormRef.validateField('content')
    },
    // 封面选择改变的事件
    onCoverChangeFn (e) {
    // 获取用户选择的文件列表
      const files = e.target.files
      if (files.length === 0) {
        // 用户没有选择封面
        this.pubForm.cover_img = null
      } else {
        // 用户选择了封面
        this.pubForm.cover_img = files[0]
        const url = URL.createObjectURL(files[0])
        this.$refs.imgRef.setAttribute('src', url)
      }
      this.$refs.pubFormRef.validateField('cover_img')
    },
    pubArticleFn (state) {
      // 1. 表单预校验
      this.$refs.pubFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请完善文章信息！')
        // 2. 设置发布状态
        this.pubForm.state = state
        // 3. TODO：发布文章
        // 创建 FormData 对象
        const fd = new FormData()
        // 向 FormData 中追加数据
        Object.keys(this.pubForm).forEach((key) => {
          fd.append(key, this.pubForm[key])
        })
        if (typeof this.pubForm.cover_img !== 'object') {
          const file = await this.handleImgTransForm(this.baseURLR + this.pubForm.cover_img)
          fd.append('cover_img', file)
        }
        // 发起请求
        console.log(fd)
        const { data: res } = await uploadArticleAPI(fd)
        if (res.code !== 0) return this.$message.error('发布文章失败！')
        this.$message.success('发布文章成功！')
        console.log(res)
        // 关闭对话框
        this.pubDialogVisible = false
        if (this.pubForm.id) {
          await deleteArticleAPI(this.pubForm.id)
        }
        this.getArticleList()
      })
    },
    onDialogCloseFn () {
      console.log('off')
      this.$refs.pubFormRef.resetFields()
      this.pubForm.state = ''
      // 因为这2个变量对应的标签不是表单绑定的, 所以需要单独控制
      this.pubForm.content = ''
      this.$refs.imgRef.setAttribute('src', defaultImg)
    }
  }
}
</script>

<style lang="less">
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .btn-pub {
    margin-top: 5px;
  }
}
.ql-editor {
  min-height: 300px;
}
// 设置图片封面的宽高
.cover-img {
  width: 400px;
  height: 280px;
  object-fit: cover;
}
.el-pagination {
  margin-top: 15px;
}
.title {
  font-size: 24px;
  text-align: center;
  font-weight: normal;
  color: #000;
  margin: 0 0 10px 0;
}

.info {
  font-size: 12px;
  span {
    margin-right: 20px;
  }
}

// 修改 dialog 内部元素的样式，需要添加样式穿透
.detail-box {
  img {
    width: 500px;
  }
}
.confirmButton{
  background-color: rgb(221, 41, 41)!important;
  border-color: rgb(221, 41, 41)!important;
}
</style>
