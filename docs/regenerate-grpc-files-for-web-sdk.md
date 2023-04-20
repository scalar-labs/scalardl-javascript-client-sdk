We need to regenerate `scalar_grpc_web_pb.js` and `scalar_pb.js` when ScalarDL Protocol Buffers is updated.

Make sure you have installed the [proto buffer compiler](http://google.github.io/proto-lens/installing-protoc.html) and [protoc-gen-grpc-web](https://github.com/grpc/grpc-web/releases) plugins. Then go to the folder containing scalar.proto and execute the command:

```
protoc --js_out=import_style=commonjs:. --grpc-web_out=import_style=commonjs,mode=grpcwebtext:. scalar.proto
```
