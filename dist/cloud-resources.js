if (window.ag == null) {
  window.ag = {};
}
window.ag.data = {
  "options": {
    "baseUrl": "https://rest-api.appgyver.com/v2",
    "headers": {
      "steroidsApiKey": "b3dd5e0c3b26302e1cb7f2a51d1f31235e262e83674c32eb52831a6a22169940",
      "steroidsAppId": 85323
    }
  },
  "resources": {
    "User": {
      "schema": {
        "fields": {
          "createdAt": {
            "type": "string"
          },
          "objectId": {
            "type": "string",
            "identity": true
          },
          "updatedAt": {
            "type": "string"
          },
          "username": {
            "type": "string"
          }
        },
        "identifier": "objectId"
      }
    },
    "Event": {
      "schema": {
        "fields": {
          "createdAt": {
            "type": "string"
          },
          "objectId": {
            "type": "string",
            "identity": true
          },
          "title": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          }
        },
        "identifier": "objectId"
      }
    },
    "Itenary": {
      "schema": {
        "fields": {
          "objectId": {
            "type": "string",
            "identity": true
          }
        },
        "identifier": "objectId"
      }
    },
    "Suggestion": {
      "schema": {
        "fields": {
          "objectId": {
            "type": "string",
            "identity": true
          }
        },
        "identifier": "objectId"
      }
    }
  }
};