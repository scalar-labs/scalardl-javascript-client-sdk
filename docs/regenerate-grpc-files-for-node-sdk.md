We need to regenerate `scalar_grpc_web_pb.js` and `scalar_pb.js` when ScalarDL Protocol Buffers is updated.

Make sure you have installed [grpc-tools](https://www.npmjs.com/package/grpc-tools) (global installation recommended). Then, go to the folder containing scalar.proto and execute the command:

```
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:. --grpc_out=grpc_js:. --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` scalar.proto
```

*Note: If you install grpc-tools locally, you will need to modify the above command to manually include the path of the grpc tools in the node_modules folder.
