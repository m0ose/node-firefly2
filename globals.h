#ifndef GLOBALS_H
#define GLOBALS_H
#include "FlyCapture2.h"
//#include "cam_FireFly2.h"
using namespace FlyCapture2;
using namespace v8;

BusManager busMgr2;
Error g_Error;
Camera g_camera;

unsigned int g_cam_width=0;
unsigned int g_cam_height=0;

/*******************************************************************************
    Turns autoManualMode properties on and off, gain etc

    JKG 9/29/2010
-------------------------------------------------------------------------------*/
bool autoOnOff(PropertyType propType, bool on_off)
{
    Property prop;
    bool previous;

    prop = FlyCapture2::Property(propType);

    g_Error = g_camera.GetProperty(&prop);
    prop.autoManualMode = on_off;
    g_Error = g_camera.SetProperty(&prop);
    previous = prop.autoManualMode;
     return previous;
}


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
