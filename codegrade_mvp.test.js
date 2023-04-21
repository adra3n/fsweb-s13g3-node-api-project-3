const request = require('supertest')
const server = require('./api/server')
const db = require('./data/db-config')

const { users: initialUsers } = require('./data/seeds/02-users')
const { posts: initialPosts } = require('./data/seeds/03-posts')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db.seed.run()
})
afterAll(async () => {
  await db.destroy()
})

test('[0] sağlık', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  describe('[GET] /api/users', () => {
    test('[1] doğru kullanıcı sayısı', async () => {
      let res = await request(server).get('/api/users')
      expect(res.body).toHaveLength(initialUsers.length)
    }, 750)
    test('[2] tüm kullanıcıları alıyor', async () => {
      let res = await request(server).get('/api/users')
      expect(res.body).toMatchObject(initialUsers)
    }, 750)
  })
  describe('[GET] /api/users/:id', () => {
    test('[3] kullanıcıyı alıyor', async () => {
      let res = await request(server).get('/api/users/1')
      expect(res.body).toMatchObject(initialUsers[0])
      expect(res.body).toHaveProperty('id')
      res = await request(server).get('/api/users/2')
      expect(res.body).toMatchObject(initialUsers[1])
      expect(res.body).toHaveProperty('id')
    }, 750)
    test('[4] id yoksa 404 döndürüyor', async () => {
      let res = await request(server).get('/api/users/111')
      expect(res.status).toBe(404)
    }, 750)
    test('[5] id yoksa doğru hata mesajı', async () => {
      let res = await request(server).get('/api/users/111')
      expect(res.body.message).toMatch(/bulunamadı/i)
    }, 750)
  })
  describe('[POST] /api/users', () => {
    test('[6] veritabanında kullanıcı oluşturuyor', async () => {
      await request(server).post('/api/users').send({ name: 'foo' })
      let users = await db('users')
      expect(users).toHaveLength(initialUsers.length + 1)
      await request(server).post('/api/users').send({ name: 'bar' })
      users = await db('users')
      expect(users).toHaveLength(initialUsers.length + 2)
    }, 750)
    test('[7] yeni oluşturulan kullanıcıyı döndürüyor', async () => {
      let res = await request(server).post('/api/users').send({ name: 'foo' })
      expect(res.body).toMatchObject({ id: 10, name: 'foo' })
      res = await request(server).post('/api/users').send({ name: 'bar' })
      expect(res.body).toMatchObject({ id: 11, name: 'bar' })
    }, 750)
    test('[8] name yoksa 400 yanıtlıyor', async () => {
      let res = await request(server)
        .post('/api/users')
        .send({ random: 'thing' })
      expect(res.status).toBe(400)
    }, 750)
    test('[9] name yoksa doğru doğrulama mesajı', async () => {
      let res = await request(server)
        .post('/api/users')
        .send({ random: 'thing' })
      expect(res.body.message).toMatch(/eksik/i)
    }, 750)
  })
  describe('[PUT] /api/users/:id', () => {
    test('[10] veritabanını güncelliyor', async () => {
      await request(server).put('/api/users/1').send({ name: 'FRODO BAGGINS' })
      let users = await db('users')
      expect(users[0]).toMatchObject({ id: 1, name: 'FRODO BAGGINS' })
    }, 750)
    test('[11] yeni kullanıcıyı yanıtlıyor', async () => {
      let res = await request(server)
        .put('/api/users/1')
        .send({ name: 'FRODO BAGGINS' })
      expect(res.body).toMatchObject({ id: 1, name: 'FRODO BAGGINS' })
    }, 750)
    test('[12] id yoksa 404 yanıtlıyor', async () => {
      let res = await request(server)
        .put('/api/users/111')
        .send({ name: 'FRODO BAGGINS' })
      expect(res.status).toBe(404)
    }, 750)
    test('[13] name eksikse 400 yanıtlıyor', async () => {
      let res = await request(server)
        .put('/api/users/1')
        .send({ no: 'FRODO BAGGINS' })
      expect(res.status).toBe(400)
    }, 750)
    test('[14] name yoksa doğru mesaj', async () => {
      let res = await request(server)
        .put('/api/users/1')
        .send({ no: 'FRODO BAGGINS' })
      expect(res.body.message).toMatch(/eksik/i)
    }, 750)
  })
  describe('[DELETE] /api/users/:id', () => {
    test('[15] kullanıcıyı veritabanından siliyor', async () => {
      await request(server).delete('/api/users/1')
      let users = await db('users')
      expect(users[0]).toMatchObject({ name: 'Samwise Gamgee' })
    }, 750)
    test('[16] yeni silinen üyeyi dönderiyor', async () => {
      let res = await request(server).delete('/api/users/1')
      expect(res.body).toMatchObject({ id: 1, name: 'Frodo Baggins' })
    }, 750)
    test('[17] user id yoksa 404 yanıtlıyor', async () => {
      let res = await request(server).delete('/api/users/111')
      expect(res.status).toBe(404)
    }, 750)
  })
  describe('[GET] /api/users/:id/posts', () => {
    test('[18] user post sayısı doğru', async () => {
      const res = await request(server).get('/api/users/1/posts')
      expect(res.body).toHaveLength(
        initialPosts.filter((p) => p.user_id == 1).length
      )
    }, 750)
    test('[19] user id yoksa 404 yanıtlıyor', async () => {
      const res = await request(server).get('/api/users/111/posts')
      expect(res.status).toBe(404)
    }, 750)
  })
  describe('[POST] /api/users/:id/posts', () => {
    test('[20] veritabanında yeni kullanıcı oluşturuyor', async () => {
      await request(server).post('/api/users/1/posts').send({ text: 'foo' })
      let posts = await db('posts').where('user_id', 1)
      expect(posts).toHaveLength(
        initialPosts.filter((p) => p.user_id == 1).length + 1
      )
      await request(server).post('/api/users/1/posts').send({ text: 'bar' })
      posts = await db('posts').where('user_id', 1)
      expect(posts).toHaveLength(
        initialPosts.filter((p) => p.user_id == 1).length + 2
      )
    }, 750)
    test('[21] yeni oluşturulan üyeyi dönderiyor', async () => {
      let res = await request(server)
        .post('/api/users/1/posts')
        .send({ text: 'foo' })
      expect(res.body).toHaveProperty('id')
      expect(res.body).toMatchObject({ text: 'foo' })
    }, 750)
    test('[22] user id yoksa 404 yanıtlıyor', async () => {
      let res = await request(server)
        .post('/api/users/111/posts')
        .send({ text: 'foo' })
      expect(res.status).toBe(404)
    }, 750)
    test('[23] text yoksa 400 yanıtlıyor', async () => {
      let res = await request(server)
        .post('/api/users/1/posts')
        .send({ no: 'foo' })
      expect(res.status).toBe(400)
    }, 750)
    test('[24] text yoksa doğrulama mesajı', async () => {
      let res = await request(server)
        .post('/api/users/1/posts')
        .send({ no: 'foo' })
      expect(res.body.message).toMatch(/eksik/i)
    }, 750)
  })
})
