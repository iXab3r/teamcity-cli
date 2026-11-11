// Synthetic baseline captured before implementation.
type Request = {method: string; path: string; query: Record<string,string>; body: string};
type Case = Request & {name: string; argv: string[]; baselineResponse: Record<string, unknown>; baselineResult: unknown; human: string; stderr: string; collection: string; permission: string; preflight: Request | null};
export const cases: Case[] = [
  {
    "name": "cloud images list",
    "argv": [
      "cloud",
      "images",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/images",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,cloudImage(id,name,profile(id),agentPoolId,operatingSystemName)"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "cloudImage",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud images show",
    "argv": [
      "cloud",
      "images",
      "show",
      "--cloud-profile",
      "profile",
      "--image",
      "image"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/images/id:($base64:cHJvZmlsZUlkOnByb2ZpbGUsaWQ6aW1hZ2U)",
    "query": {
      "fields": "id,name,profile(id),agentPoolId,operatingSystemName"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud instances list",
    "argv": [
      "cloud",
      "instances",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/instances",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,cloudInstance(id,name,state,startDate,image(id),agent(id))"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "cloudInstance",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud instances show",
    "argv": [
      "cloud",
      "instances",
      "show",
      "--cloud-profile",
      "profile",
      "--image",
      "image",
      "--instance",
      "instance"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/instances/id:($base64:cHJvZmlsZUlkOnByb2ZpbGUsaW1hZ2VJZDppbWFnZSxpZDppbnN0YW5jZQ)",
    "query": {
      "fields": "id,name,state,startDate,image(id),agent(id)"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud profiles list",
    "argv": [
      "cloud",
      "profiles",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/profiles",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,cloudProfile(id,name,cloudProviderId,project(id))"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "cloudProfile",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud profiles show",
    "argv": [
      "cloud",
      "profiles",
      "show",
      "profile"
    ],
    "method": "GET",
    "path": "/app/rest/cloud/profiles/id:profile",
    "query": {
      "fields": "id,name,cloudProviderId,project(id)"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "cloud instances start",
    "argv": [
      "cloud",
      "instances",
      "start",
      "--cloud-profile",
      "profile",
      "--image",
      "image"
    ],
    "method": "POST",
    "path": "/app/rest/cloud/instances",
    "query": {},
    "body": "{\"image\":{\"id\":\"profileId:profile,id:image\"}}",
    "baselineResponse": {},
    "baselineResult": {
      "imageId": "profileId:profile,id:image",
      "startRequested": true
    },
    "human": "imageId: profileId:profile,id:image\nstartRequested: true\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
