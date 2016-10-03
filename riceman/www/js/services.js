angular.module('starter.services', [])

.factory('RiceMan', function($http) {
  return {
    fetch: function() {
      return $http.get("http://agtech.mybluemix.net/api/sensors")
    },
    background_mode: function() {
      return $http.get("http://riceman.mybluemix.net/api/crontask")
    }
  };
})
.factory('UserService', function($q, $http){
  var LOCAL_TOKEN_KEY = 'localTokenKey';
  var LOCAL_USERNAME_KEY = 'localUsernameKey';
  var LOCAL_UID = 'localUid';
  var LOCAL_ROLE = 'localRole';
  var LOCAL_COOKIE = 'localCookie';
  var LOCAL_CSRF_TOKEN = 'localCsrfToken';
  var isAuthenticated = false;

  // Get/Store local token.
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }
  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  // Store/Get local username.
  function storeUsername(name) {
    window.localStorage.setItem(LOCAL_USERNAME_KEY, name);
  }
  function getUsername() {
    var username = window.localStorage.getItem(LOCAL_USERNAME_KEY);
    return username;
  }

  // Store/Get local uid.
  function storeUid(uid) {
    window.localStorage.setItem(LOCAL_UID, uid);
  }
  function getUid() {
    var uid = window.localStorage.getItem(LOCAL_UID);
    return uid;
  }

  // Store/Get Local Role.
  function storeRole(roles){
    window.localStorage.setItem(LOCAL_ROLE, roles);
  }
  function getRoles(){
    var role = window.localStorage.getItem(LOCAL_ROLE);
    return role;
  }

  // Store CSRF Token.
  function storeCsrfToken(token){
    window.localStorage.setItem(LOCAL_CSRF_TOKEN, token);
  }
  function getCsrfToken() {
    var token = window.localStorage.getItem(LOCAL_CSRF_TOKEN);
    return token;
  }

  // Store/Get local cookie
  function storeCookie(cookie) {
    window.localStorage.setItem(LOCAL_COOKIE, cookie);
  }
  function getCookie(){
    var uid = window.localStorage.getItem(LOCAL_COOKIE);
    return uid;
  }

  // Using credential.
  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
    $http.defaults.headers.common['X-CSRF-Token'] = token;
  }

  // Destroy User Credential.
  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(LOCAL_USERNAME_KEY);
    window.localStorage.removeItem(LOCAL_UID);
    window.localStorage.removeItem(LOCAL_ROLE);
  }

  var initialize = function(){
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/user/token';
    var req = {
      method: 'POST',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      data: {}
    }
    $http(req).then(function(res) {
      storeCsrfToken(res.data.token);
    });
  }

  var login = function(username, pw) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/user/login';
    var token = getCsrfToken();
    var req = {
      method: 'POST',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': token,
      },
      data: {
        username: username,
        password: pw
      }
    }

    return $q(function(resolve, reject) {
      $http(req).then(function(authenticated) {
        var data = authenticated.data;
        // Store userdata.
        storeUserCredentials(data.token);
        storeUsername(data.user.name);
        storeUid(data.user.uid);
        storeCookie(data.session_name + "=" + data.sessid);
        var roles = [];
        angular.forEach(data.user.roles, function(value, key) {
          this.push(value);
        }, roles);
        storeRole(roles);
        resolve(data.user);
      }, function(err) {
        reject('Login Failed.');
      });
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var signup = function(email, pw) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/user';
    var req = {
      method: 'POST',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      data: {
        account: {
          mail: email,
          pass: pw
        }
      }
    }
    return $q(function(resolve, reject) {
      $http(req).then(function(authenticated) {
        resolve('Register success.');
      }, function(err) {
        reject('Register failed.');
      });
    });
  }

  return {
    initialize: initialize,
    login: login,
    logout: logout,
    signup: signup,
    // isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: getUsername,
    getUid: getUid,
    roles: getRoles,
  };
})

.factory('ProjectService', function($q, $http){

  function getProjects(uid, roles) {
    if (roles.indexOf('expert') == -1) {
      var endpoint = 'http://ricedata.hackanoi.com/api/v1/node';
      var params = {
        'parameters[type]': 'project',
        'parameters[uid]': uid,
      };
    } else {
      var endpoint = 'http://ricedata.hackanoi.com/api/v1/projects';
      var params = {
        'expert': uid,
      };
    }
    var req = {
      method: 'GET',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      params: params,
    }
    return $http(req);
  };

  function createProject(uid, title) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/node';
    var token = window.localStorage.getItem('localTokenKey');
    var cookie = window.localStorage.getItem('localCookie');
    var req = {
      method: 'POST',
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Authentication': cookie
      },
      data: {
        'node': {
          'type': 'project',
          'title': title,
          'name': 'admin',
        }
      },
    }
    return $q(function(resolve, reject) {
      $http(req).then(function(res) {
        console.log(res);
        resolve('Create success.');
      }, function(err) {
        reject('Create failed.');
      });
    });
  }

  function getImages(pid) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/images';
    var req = {
      method: 'GET',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      params: {
        'project': pid,
      },
    }
    return $http(req);
  };

  function getProjectDetail(pid) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/node/' + pid;
    var req = {
      method: 'GET',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      params: {},
    }
    return $http(req);
  };

  return {
    getProjectDetail: getProjectDetail,
    getProjects: getProjects,
    createProject: createProject,
    getImages: getImages,
  }
})

.factory('ImageService', function($q, $http){
  function getImage(nid) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/image?nid=' + nid;
    var req = {
      method: 'GET',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      params: {},
    }
    return $http(req);
  }

  function postComment(nid, comment) {
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/comment';
    var token = window.localStorage.getItem('localTokenKey');
    var cookie = window.localStorage.getItem('localCookie');
    var uid = window.localStorage.getItem('localUid');
    var req = {
      method: 'POST',
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Authentication': cookie
      },
      data: {
        "nid": nid,
        "uid": uid,
        "subject": "",
        "comment_body":{
          "und":[{
            "value":comment
          }]
        }
      },
    }
    return $q(function(resolve, reject) {
      $http(req).then(function(res) {
        console.log(res);
        resolve('Comment success.');
      }, function(err) {
        reject('Comment failed.');
      });
    });
  }

  function getComments(nid){
    var endpoint = 'http://ricedata.hackanoi.com/api/v1/comments';
    var req = {
      method: 'GET',
      url: endpoint,
      headers: {
       'Content-Type': 'application/json'
      },
      params: {
        'nid': nid,
      },
    }
    return $http(req);
  }

  return {
    getImage: getImage,
    postComment: postComment,
    getComments: getComments,
  }
});
