const request = require('supertest');
const app = require('../app');

describe('Loading Express', function () {
  it('Responds to /', function testSlash(done) {
  request(app.server)
    .get('/')
    .expect(200, done);
  });
  it('Responds to 404', function testPath(done) {
    request(app.server)
      .get('/foo/bar')
      .expect(404, done);
  });
});


app.server.close();