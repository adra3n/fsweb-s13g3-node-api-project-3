const { json } = require('express')
const userModel = require('../users/users-model')

function logger(req, res, next) {
  // SİHRİNİZİ GÖRELİM
  const method = req.method
  const url = req.originalUrl
  const timestamp = new Date().toLocaleString()
  console.log(`${method}--${url}--${timestamp}`)
  next()
}

async function validateUserId(req, res, next) {
  // SİHRİNİZİ GÖRELİM
  try {
    const user = await userModel.getById(req.params.id)
    if (!user) {
      req.status(404).json({ message: 'kullanıcı bulunamadı' })
    } else {
      req.currentUser = user
      next()
    }
  } catch (error) {
    next(error)
  }
}

function validateUser(req, res, next) {
  // SİHRİNİZİ GÖRELİM
  try {
    const { name } = req.body
    if (!name) {
      req.status(400).json({ mesaj: 'gerekli name alanı eksik' })
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}

function validatePost(req, res, next) {
  // SİHRİNİZİ GÖRELİM
  try {
    const { text } = req.body
    if (!text) {
      req.status(400).json({ mesaj: 'gerekli text alanı eksik' })
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}

// bu işlevleri diğer modüllere değdirmeyi unutmayın

module.exports = { logger, validateUserId, validateUser, validatePost }
