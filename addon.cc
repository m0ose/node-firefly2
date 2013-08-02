#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "FF2wrapper.h"

using namespace v8;

Handle<Value> CreateObject(const Arguments& args) {
  HandleScope scope;
  return scope.Close(FF2wrapper::NewInstance(args));
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
  FF2wrapper::Init();

  module->Set(String::NewSymbol("exports"),
      FunctionTemplate::New(CreateObject)->GetFunction());
}

NODE_MODULE(addon, InitAll)
