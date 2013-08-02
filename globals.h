#ifndef GLOBALS_H
#define GLOBALS_H
#include "FlyCapture2.h"
#include "cam_FireFly2.h"

using namespace FlyCapture2;
using namespace v8;

//BusManager busMgr2;
Handle<Value>
ErrorException(const char *msg)
{
    HandleScope scope;
    return Exception::Error(String::New(msg));
}

Handle<Value>
VException(const char *msg) {
    HandleScope scope;
    return ThrowException(ErrorException(msg));
}
bool str_eq(const char *s1, const char *s2)
{
    return strcmp(s1, s2) == 0;
}

#endif // GLOBALS_H
