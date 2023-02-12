<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix header-box">
        <span>文章分类</span>
        <el-button type="primary" size="small" @click="addFn">添加分类</el-button>
      </div>
      <el-table style="width: 100%" border stripe :data="cateList">
        <el-table-column label="序号" width="100" type="index"></el-table-column>
        <el-table-column label="分类名称" prop="cate_name"></el-table-column>
        <el-table-column label="分类别名" prop="cate_alias"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="editFn(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteFn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  </el-card>
  <!-- 添加分类的对话框 -->
  <el-dialog :title="isEdit ? '编辑文章分类' : '添加文章分类'" :visible.sync="dialogVisible" width="35%" @close="resetForm">
    <el-form :model="form" :label-width="formLabelWidth" :rules="addRules" ref="addRef">
      <el-form-item label="分类名称" prop="cate_name">
        <el-input v-model="form.cate_name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="分类别名" prop="cate_alias">
        <el-input v-model="form.cate_alias" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancleFn">取 消</el-button>
      <el-button size="small" type="primary" @click="confirmFn">确 认</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import { getArtCate, addArtCate, updateArtCate, deleteArtCate } from '@/api'
export default {
  name: 'artCate',
  data () {
    return {
      cateList: [],
      dialogVisible: false,
      editId: '',
      isEdit: false,
      form: {
        cate_name: '',
        cate_alias: ''
      },
      formLabelWidth: '80px',
      addRules: {
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { pattern: /^\S{1,10}$/, message: '分类名必须是1-10位的非空字符', trigger: 'blur' }
        ],
        cate_alias: [
          { required: true, message: '请输入分类别名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{1,15}$/, message: '分类别名必须是1-15位的字母数字', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getArtCate()
  },
  methods: {
    async getArtCate () {
      const { data: res } = await getArtCate()
      this.cateList = res.data
    },
    addFn () {
      this.dialogVisible = true
      this.editId = '' // 编辑的文章分类id设置无
      this.isEdit = false // 编辑的状态关闭
    },
    cancleFn () {
      this.dialogVisible = false
    },
    confirmFn () {
      // this.dialogVisible = false
      this.$refs.addRef.validate(async valid => {
        if (valid) {
          if (this.isEdit) {
            // 编辑状态
            // 调用接口传递数据给后台
            const { data: res } = await updateArtCate({ id: this.editId, ...this.form })
            if (res.code !== 0) return this.$message.error(res.error)
            this.$message.success('更新分类成功！')
          } else {
            // 新增状态
            // 调用接口传递数据给后台
            const { data: res } = await addArtCate(this.form)
            if (res.code !== 0) return this.$message.error(res.message)
            this.$message.success('添加分类成功！')
          }
          // 重新请求列表数据
          this.getArtCate()
          // 关闭对话框
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    resetForm () {
      this.$refs.addRef.resetFields()
    },
    editFn (row) {
      // console.log(row)
      this.editId = row.id // 保存要编辑的文章分类ID
      this.isEdit = true // 设置编辑状态
      this.dialogVisible = true // 让对话框显示
      // 设置数据回显
      this.$nextTick(() => {
        this.form.cate_name = row.cate_name
        this.form.cate_alias = row.cate_alias
      })
    },
    deleteFn (row) {
      this.$confirm('是否删除该分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 删除分类
        const { data: res } = await deleteArtCate(row.id)
        if (res.code !== 0) return this.$message.error(res.message)
        this.$message.success(res.message)
        this.getArtCate()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }

}
</script>

<style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
