import { loggerService } from '../../services/logger.service.js'
import { authService } from './auth.service.js'

export async function login(req, res) {
  const { username, password } = req.body
  try {
    const user = await authService.login(username, password)
    const loginToken = await authService.getLoginToken(user)

    res.cookie('loginToken', loginToken)
    res.send(user)
  } catch (error) {
    loggerService.error('Failed to Login ' + error)
    res.status(401).send({ error: 'Failed to Login' })
  }
}

export async function signup(req, res) {
  try {
    const { username, password, fullname } = req.body
    const account = await authService.signup(username, password, fullname)

    const user = await authService.login(username, password)
    const loginToken = await authService.getLoginToken(user)

    res.cookie('loginToken', loginToken)
    res.send(user)
  } catch (error) {
    loggerService.error('Failed to Signup ' + error)
    res.status(500).send({ error: 'Failed to Signup' })
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie('loginToken')
    res.send({ msg: 'logged out succesfully' })
  } catch (error) {
    res.status(500).send({ err: 'Failed to logout' })
  }
}
