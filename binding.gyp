{
  "targets": [
    {
      "target_name": "node_shared_memory",
      "sources": [ "addons/node_shared_memory.cpp" ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_maybe",
      ]
    }
  ]
}
