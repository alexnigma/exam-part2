import {faker} from "@faker-js/faker";

describe('JSON server test suite', () => {

  it('Get all posts', () => {
    cy.request(`GET`, `/posts`).then(response => {
      expect(response.status).to.be.equal(200);
    })
  });

  it('Get first 10 posts', () => {
    cy.request(`GET`, `/posts?_start=0&_end=10`).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.lengthOf(10);

      let posts = response.body;

      expect((Object.entries(posts[0])[1])).to.contain(1);
      expect((Object.entries(posts[1])[1])).to.contain(2);
      expect((Object.entries(posts[2])[1])).to.contain(3);
      expect((Object.entries(posts[3])[1])).to.contain(4);
      expect((Object.entries(posts[4])[1])).to.contain(5);
      expect((Object.entries(posts[5])[1])).to.contain(6);
      expect((Object.entries(posts[6])[1])).to.contain(7);
      expect((Object.entries(posts[7])[1])).to.contain(8);
      expect((Object.entries(posts[8])[1])).to.contain(9);
      expect((Object.entries(posts[9])[1])).to.contain(10);
    })
  });

  it('Get posts with ID=55 & ID=60', () => {
    cy.request(`GET`, `/posts?id=55&id=60`).then(response => {
      expect(response.status).to.be.equal(200);

      let posts = response.body;

      expect((Object.entries(posts[0])[1])).to.contain(55);
      expect((Object.entries(posts[1])[1])).to.contain(60);
    })
  });

  it(`Create a post (Unauthorized)`, () => {
    cy.request({
      method: `POST`,
      url: `/664/posts`,
      body: {text: faker.lorem.words()},
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.equal(401);
    })
  });

  it(`Create a post with access token in header`, () => {
    cy.log(`Register user`);

    let user = {
      "email": faker.internet.email(),
      "password": faker.internet.password(),
      "accessToken": ""
    };

    cy.request({
      method: `POST`,
      url: `/register`,
      body: {
        "email": user.email,
        "password": user.password
      }
    }).then(response => {
      expect(response.status).to.be.equal(201);

      user.accessToken = response.body.accessToken;

      cy.log(`Creating a post`);

      let postTitle = faker.lorem.words({min:2, max: 5});

      cy.request({
        method: `POST`,
        url: `/664/posts`,
        auth: {
          bearer: user.accessToken
        },
        headers: {
          accessToken: user.accessToken
        },
        body: {text: postTitle}
      }).then(response => {
        expect(response.status).to.be.equal(201);

        cy.request({
          method: `GET`,
          url: `/664/posts`,
        }).then( response => {

          let posts = response.body;

          expect(Object.values(posts[posts.length-1])).to.contain(`${postTitle}`)
        })
      })
    })
  });

  it('Create post', () => {

    let postID = faker.number.int();
    let postTitle = faker.lorem.words({min:1, max:5});

    cy.request({
      method: `POST`,
      url: `/posts`,
      body: {
        id: postID,
        title: postTitle,
      }
    }).then(response => {
      expect(response.status).to.be.equal(201);
      expect(response.body.id).to.be.equal(postID);
      expect(response.body.title).to.be.equal(postTitle);
    })
  });

  it('Update non-existing entity', () => {
    cy.request({
      method: `PUT`,
      url: `/posts`,
      body: {
        userid: faker.lorem.words()
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.equal(404);
    })
  });

  it('Create entity, update entity', () => {
    let postID = faker.number.int();
    let postTitle = faker.lorem.words({min:1, max:5});

    cy.request({
      method: `POST`,
      url: `/posts`,
      body: {
        id: postID,
        title: postTitle,
      }
    }).then(response => {

      let newPostTitle = faker.lorem.words({min:1, max:5});

      cy.request({
        method: `PUT`,
        url: `/posts/${postID}`,
        body: {
          title: newPostTitle
        }
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(postID);
        expect(response.body.title).to.be.equal(newPostTitle);
      })
    })
  });

  it('Delete non-existing entity', () => {
    cy.request({
      method: `DELETE`,
      url: `/posts`,
      body: {
        userid: faker.lorem.words()
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.equal(404);
    })
  });

  it('Create entity, update entity, delete entity', () => {
    let postID = faker.number.int();
    let postTitle = faker.lorem.words({min:1, max:5});

    cy.request({
      method: `POST`,
      url: `/posts`,
      body: {
        id: postID,
        title: postTitle,
      }
    }).then(response => {

      let newPostTitle = faker.lorem.words({min:1, max:5});

      cy.request({
        method: `PUT`,
        url: `/posts/${postID}`,
        body: {
          title: newPostTitle
        }
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(postID);
        expect(response.body.title).to.be.equal(newPostTitle);

        cy.request({
          method: `DELETE`,
          url: `/posts/${postID}`,
        }).then( response => {
          expect(response.status).to.be.equal(200);

          cy.request({
            method: `GET`,
            url: `/posts/${postID}`,
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.be.equal(404);
          })
        })
      })
    })
  });
})