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
  it('Responds to about.json', function testPath(done) {
    request(app.server)
      .get('/about.json')
      .expect(200, done);
  });
});


app.server.close();