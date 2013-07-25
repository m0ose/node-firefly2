#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <stdio.h>
#include "fireflywrap.h"
using namespace v8;


void InitAll(Handle<Object> exports) {
    FireFlyWrap::Init(exports);
}

NODE_MODULE(addon, InitAll)
