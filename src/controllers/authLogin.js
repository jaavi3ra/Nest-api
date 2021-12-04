import bcrypt from 'bcryptjs'
import * as yup from 'yup'
import User from '../Model/users.js'
import { jwtSign } from '../lib/jwt.js'
import moongose from 'mongoose'

const { ObjectId } = moongose.Types

const getAuthControllers = () => {

  const login = async ctx => {
    const payload = ctx.request.body

    const yupSchema = yup.object().shape({
      rut: yup.string().required(),
      password: yup.string().min(6).required(),
    })

    if (!yupSchema.isValidSync(payload)) {
      ctx.status = 400
      ctx.body = 'invalid credetial'
    }

    const user = await User.findOne({ rut: payload.rut })
    if (!user || !bcrypt.compareSync(payload.password, user.password)) {
      ctx.status = 400
      ctx.body = 'invalid credetial'
      return
    }

    const accessToken = jwtSign({
      sub: user._id,
      cid: user._id
    })

    ctx.body = {
      accessToken
    }
    ctx.status = 200
  }

  const changePassword = async ctx => {
    // opcion de cambiar contraseña
    const { id } = ctx.request.params

    if (!ObjectId.isValid(id)) {
      ctx.status = 404
      ctx.body = 'Invalid Credential'
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
    }
    //hashear pass
    if (payload?.password) {
      const salt = bcrypt.genSaltSync(10)
      const hashed = bcrypt.hashSync(payload.password, salt)
      await User.updateOne({ _id: new ObjectId(id) }, { ...payload, password: hashed })
    } else {
      await User.updateOne({ _id: new ObjectId(id) }, payload)
    }

    ctx.status = 204
    ctx.body = 'password saved successful'
  }
  return {
    login,
    changePassword
  }
}
export default getAuthControllers