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

      const expectation = [{ 'id':1, 'author_name':'Audre Lord', 'published_books':18, 'living':false, 'born':'New York, NY', 'owner_id':1 }, { 'id':2, 'author_name':'Assata Shakur', 'published_books':4, 'living':true, 'born':'New York, NY', 'owner_id':1 }, { 'id':3, 'author_name':'Alice Walker', 'published_books':36, 'living':true, 'born':'Eatonton, GA', 'owner_id':1 }, { 'id':4, 'author_name':'Bell Hooks', 'published_books':32, 'living':true, 'born':'Hopkinsville, KY', 'owner_id':1 }, { 'id':5, 'author_name':'Angela Davis', 'published_books':21, 'living':true, 'born':'Birmingham, AL', 'owner_id':1 }, { 'id':6, 'author_name':'Kimberlé Crenshaw', 'published_books':7, 'living':true, 'born':'Canton, OH', 'owner_id':1 }, { 'id':7, 'author_name':'Octavia Estelle Butler ', 'published_books':23, 'living':false, 'born':'Pasadena, CA', 'owner_id':1 }, { 'id':8, 'author_name':'Roxane Gay', 'published_books':9, 'living':true, 'born':'Omaha, NE', 'owner_id':1 }, { 'id':9, 'author_name':'Toni Morrison', 'published_books':34, 'living':false, 'born':'Lorain, OH', 'owner_id':1 }, { 'id':10, 'author_name':'Chimamanda Ngozi Adichie', 'published_books':22, 'living':true, 'born':'Enugu, Nigeria', 'owner_id':1 }, { 'id':11, 'author_name':'Charlene Carruthers', 'published_books':3, 'living':true, 'born':'Chicago, IL', 'owner_id':1 }, { 'id':12, 'author_name':'Mikki Kendall', 'published_books':2, 'living':true, 'born':'Chicago, IL', 'owner_id':1 }];

      const data = await fakeRequest(app)
        .get('/authors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
