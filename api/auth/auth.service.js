import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { loggerService } from '../../services/logger.service.js'
export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken,
}

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(username, password) {
  const user = await userService.getByUsername(username)
  if (!user) throw new Error('Invalid username or password')

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error('Invalid username or password')

  delete user.password
  return user
}

async function signup(username, password, fullname) {
  const saltRounds = 10
  if (!username || !password || !fullname) throw new Error('Missing fields')
  const hash = await bcrypt.hash(password, saltRounds)

  return userService.add({ username, password: hash, fullname })
}

function getLoginToken(user) {
  const userInfo = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken)
    const loggedInUser = JSON.parse(json)
    return loggedInUser
  } catch (error) {
    console.log('Invalid login token')
  }
  return null
}
