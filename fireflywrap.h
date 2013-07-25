#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include "FlyCapture2.h"

using namespace std;
using namespace FlyCapture2;

class FireFlyWrap : public node::ObjectWrap {
public:
    static void Init(v8::Handle<v8::Object> target);

private:
    FireFlyWrap();
    ~FireFlyWrap();

    static v8::Handle<v8::Value> New(const v8::Arguments& args);
    static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
    static v8::Handle<v8::Value> hello(const v8::Arguments& args);
    static v8::Handle<v8::Value> getNumCameras(const v8::Arguments& args);
    static v8::Handle<v8::Value> startCamera(const v8::Arguments& args);
    static v8::Handle<v8::Value> getCamInfo(const v8::Arguments& args);
    static v8::Handle<v8::Value> takePhoto(const v8::Arguments& args);
    static v8::Handle<v8::Value> getWidth(const v8::Arguments& args);
    static v8::Handle<v8::Value> getHeight(const v8::Arguments& args);
    static v8::Handle<v8::Value> autoGain(const v8::Arguments& args);
    static v8::Handle<v8::Value> autoExposure(const v8::Arguments& args);
    static v8::Handle<v8::Value> autoWhiteBalance(const v8::Arguments& args);
    static v8::Handle<v8::Value> frameRate(const v8::Arguments& args);
    static v8::Handle<v8::Value> gain(const v8::Arguments& args);
    static v8::Handle<v8::Value> exposure(const v8::Arguments& args);
    static v8::Handle<v8::Value> getExposure(const v8::Arguments& args);
    static v8::Handle<v8::Value> triggerOff(const v8::Arguments& args);
    static v8::Handle<v8::Value> triggerDelay(const v8::Arguments& args);
    static v8::Handle<v8::Value> setTriggerMode14(const v8::Arguments& args);
    


};

#endif
