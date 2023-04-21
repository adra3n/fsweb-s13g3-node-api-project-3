const express = require('express')

const middleware = require('../middleware/middleware')
const userModel = require('./users-model')
const postModel = require('../posts/posts-model')

// `users-model.js` ve `posts-model.js` sayfalarına ihtiyacınız var
// ara yazılım fonksiyonları da gereklidir

const router = express.Router()

router.get('/', async (req, res, next) => {
  // TÜM KULLANICILARI İÇEREN DİZİYİ DÖNDÜRÜN
  try {
    const users = await userModel.get()
    res.json(users)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', middleware.validateUserId, (req, res, next) => {
  // USER NESNESİNİ DÖNDÜRÜN
  // user id yi getirmek için bir ara yazılım gereklidir
  try {
    res.json(req.currentUser)
  } catch (error) {
    next(error)
  }
})

router.post('/', middleware.validateUser, async (req, res, next) => {
  // YENİ OLUŞTURULAN USER NESNESİNİ DÖNDÜRÜN
  // istek gövdesini doğrulamak için ara yazılım gereklidir.
  try {
    let { name } = req.body
    const insertedUser = await userModel.insert({ name: name })
    res.json(insertedUser)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:id',
  middleware.validateUser,
  middleware.validateUserId,
  async (req, res, next) => {
    // YENİ GÜNCELLENEN USER NESNESİNİ DÖNDÜRÜN
    // user id yi doğrulayan ara yazılım gereklidir
    // ve istek gövdesini doğrulayan bir ara yazılım gereklidir.
    try {
      let { name } = req.body
      const updatedUser = await userModel.update(req.params.id, { name: name })
      res.json(updatedUser)
    } catch (error) {
      next(error)
    }
  }
)

router.delete('/:id', middleware.validateUserId, async (req, res, next) => {
  // SON SİLİNEN USER NESNESİ DÖNDÜRÜN
  // user id yi doğrulayan bir ara yazılım gereklidir.
  try {
    await userModel.remove(req.params.id)
    res.json(req.currentUser)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/posts', middleware.validateUserId, async (req, res, next) => {
  // USER POSTLARINI İÇEREN BİR DİZİ DÖNDÜRÜN
  // user id yi doğrulayan bir ara yazılım gereklidir.
  try {
    const userPosts = await userModel.getUserPosts(req.params.id)
    res.json(userPosts)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/:id/posts',
  middleware.validateUserId,
  middleware.validatePost,
  async (req, res, next) => {
    // YENİ OLUŞTURULAN KULLANICI NESNESİNİ DÖNDÜRÜN
    // user id yi doğrulayan bir ara yazılım gereklidir.
    // ve istek gövdesini doğrulayan bir ara yazılım gereklidir.
    try {
      const { text } = req.body
      const insertedPost = await postModel.insert({
        user_id: req.params.id,
        text: text,
      })
      res.status(201).json(insertedPost)
    } catch (error) {
      next(error)
    }
  }
)

// routerı dışa aktarmayı unutmayın
module.exports = router
