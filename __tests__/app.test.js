require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns authors', async() => {

      const expectation = [
        {
          author_name: 'Audre Lord',
          published_books: 18,
          living: false,
          born: 'New York, NY'
        },
        {
          author_name: 'Assata Shakur',
          published_books: 4,
          living: true,
          born: 'New York, NY'
        },
        {
          author_name: 'Alice Walker',
          published_books: 36,
          living: true,
          born: 'Eatonton, GA'
        },
      ];

      const data = await fakeRequest(app)
        .get('/authors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
