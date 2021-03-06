import bcrypt from 'bcryptjs'
import * as yup from 'yup'
import moongose from 'mongoose'
import User from '../Model/users.js'
import { jwtSign } from '../lib/jwt.js'

const { ObjectId } = moongose.Types

const getAuthControllers = () => {

  const changePasswordByRut = async ctx =>{
    const payload = ctx.request.body
    const yupSchema = yup.object().shape({
      rut: yup.string().required(),
      password: yup.string().required(),
    })
    if (!yupSchema.isValidSync(payload)) {
      ctx.status = 400
      ctx.body = 'Invalid Credetial (1)'
    }
    const id = await User.findOne({ rut: payload.rut })
    
    if (!id) {
      ctx.status = 400
      ctx.body = 'Invalid Credetial (2)'
      return
    }
    if (payload?.password) {
      const salt = bcrypt.genSaltSync(10)
      const hashed = bcrypt.hashSync(payload.password, salt)
      await User.updateOne({ _id: new ObjectId(id._id) }, { ...payload, password: hashed })
    } else {
      await User.updateOne({ _id: new ObjectId(id._id) }, payload)
    }
    ctx.status = 200
    ctx.body = 'password saved successful'
    
  }

  const login = async ctx => {
    const payload = ctx.request.body

    const yupSchema = yup.object().shape({
      rut: yup.string().required(),
      password: yup.string().min(6).required(),
    })

    if (!yupSchema.isValidSync(payload)) {
      ctx.status = 400
      ctx.body = 'Invalid Credetial (1)'
    }

    const user = await User.findOne({ rut: payload.rut })
    if (!user || !bcrypt.compareSync(payload.password, user.password)) {
      ctx.status = 400
      ctx.body = 'Invalid Credetial (2)'
      return
    }

    const accessToken = jwtSign({
      sub: user._id,
      cid: user.rut
    })

    ctx.body = {
      accessToken
    }
    ctx.status = 200
  }

  const changePassword = async ctx => {
    const { id } = ctx.request.params

    if (!ObjectId.isValid(id)) {
      ctx.status = 404
      ctx.body = 'Invalid Credetial (1)'
      return
    }
    const payload = ctx.request.body

    const yupSchema = yup.object().shape({
      password: yup.string().min(6).required()
    })
    try {
      yupSchema.validateSync(payload)
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
      return
    }

    if (payload?.password) {
      const salt = bcrypt.genSaltSync(10)
      const hashed = bcrypt.hashSync(payload.password, salt)
      await User.updateOne({ _id: new ObjectId(id) }, { ...payload, password: hashed })
    } else {
      await User.updateOne({ _id: new ObjectId(id) }, payload)
    }
    ctx.status = 200
    ctx.body = 'password saved successful'
  }

  return {
    login,
    changePassword,
    changePasswordByRut
  }
}
export default getAuthControllers