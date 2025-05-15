import { loggerService } from '../../services/logger.service.js'
import { userService } from './user.service.js'

export async function getUser(req, res) {
  try {
    const user = await userService.getById(req.params.id)
    res.send(user)
  } catch (error) {
    logger.error('Failed to get user', error)
    res.status(500).send({ error: 'Failed to get user' })
  }
}
export async function getUsers(req, res) {
  //some filter by of users
  try {
    const users = await userService.query()
    res.send(users)
  } catch (error) {
    logger.error('Failed to get users', err)
    res.status(500).send({ err: 'Failed to get users' })
  }
}
export async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send({ msg: 'User Deleted' })
  } catch (error) {
    logger.error('Failed to delete user', error)
    res.status(500).send({ error: 'Failed to delete user' })
  }
}
export async function updateUser(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.update(user)
    res.send(savedUser)
  } catch (error) {
    logger.error('Failed to update user', error)
    res.status(500).send({ error: 'Failed to update user' })
  }
}
