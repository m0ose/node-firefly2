#define BUILDING_NODE_EXTENSION
#ifndef FF2WRAPPER_H
#define FF2WRAPPER_H

#include <node.h>
#include "FlyCapture2.h"

class FF2wrapper : public node::ObjectWrap {
 public:
  static void Init();
  static v8::Handle<v8::Value> NewInstance(const v8::Arguments& args);

 private:
  FF2wrapper();
  ~FF2wrapper();

  static v8::Persistent<v8::Function> constructor;
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
  static v8::Handle<v8::Value>   getNumCameras(const v8::Arguments& args);

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
  
  double counter_;

};

#endif
