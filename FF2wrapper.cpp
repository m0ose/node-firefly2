#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <node_buffer.h>

#include "FF2wrapper.h"
#include "globals.h"
#include "cam_FireFly2.h"
#include <iostream>
using namespace v8;
using namespace std;

FF2wrapper::FF2wrapper() {};
FF2wrapper::~FF2wrapper() {};

Persistent<Function> FF2wrapper::constructor;

void FF2wrapper::Init() {
  
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("FF2wrapper"));
  tpl->InstanceTemplate()->SetInternalFieldCount(2);
  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("plusOne"),
				FunctionTemplate::New(PlusOne)->GetFunction());
  
  
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("getNumCameras"),
						  FunctionTemplate::New(getNumCameras)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("takePhoto"),
				FunctionTemplate::New(takePhoto)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("startCamera"),
						  FunctionTemplate::New(startCamera)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("getWidth"),
						  FunctionTemplate::New(getWidth)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("getHeight"),
						  FunctionTemplate::New(getHeight)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("autoGain"),
						  FunctionTemplate::New(autoGain)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("autoExposure"),
						  FunctionTemplate::New(autoExposure)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("frameRate"),
						  FunctionTemplate::New(frameRate)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("gain"),
						  FunctionTemplate::New(gain)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("autoWhiteBalance"),
						  FunctionTemplate::New(autoWhiteBalance)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("exposure"),
						  FunctionTemplate::New(exposure)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("getExposure"),
						  FunctionTemplate::New(getExposure)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("triggerOff"),
						  FunctionTemplate::New(triggerOff)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("triggerDelay"),
				FunctionTemplate::New(triggerDelay)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("getCamInfo"),
				FunctionTemplate::New(getCamInfo)->GetFunction());
  
  tpl->PrototypeTemplate()->Set(String::NewSymbol("verbose"),
				FunctionTemplate::New(verbose)->GetFunction());
  
  constructor = Persistent<Function>::New(tpl->GetFunction());
}

Handle<Value> FF2wrapper::New(const Arguments& args) {
  HandleScope scope;
  FireFly2::getInstance();
  if( FireFly2::getInstance().verbose == true){
    cout <<  " # cameras: "<< FireFly2::getInstance().getNumberOfCameras() << std::endl;
  }
  FF2wrapper* obj = new FF2wrapper();
  obj->counter_ = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
  obj->Wrap(args.This());
  
  return args.This();
}

Handle<Value> FF2wrapper::NewInstance(const Arguments& args) {
  HandleScope scope;
  
  const unsigned argc = 1;
  Handle<Value> argv[argc] = { args[0] };
  Local<Object> instance = constructor->NewInstance(argc, argv);
  
  return scope.Close(instance);
}

Handle<Value> FF2wrapper::PlusOne(const Arguments& args) {
  HandleScope scope;
  
  FF2wrapper* obj = ObjectWrap::Unwrap<FF2wrapper>(args.This());
  obj->counter_ += 1;
  
  return scope.Close(Number::New(obj->counter_));
}

Handle<Value> FF2wrapper::takePhoto(const Arguments& args) {
  HandleScope scope;
  Image convertedImage;
  
  PixelFormat buf_type = PIXEL_FORMAT_RGB8;
  if (args.Length() >= 1 ) {
    if (!args[0]->IsString())
      return VException("first argument must be 'rgb', 'bgr', or 'rgba' .");
    
    String::AsciiValue bts(args[0]->ToString());
    if (!(str_eq(*bts, "rgb") || str_eq(*bts, "bgr") ||
      str_eq(*bts, "rgba") || str_eq(*bts, "gray")))
      {
	return VException("first argument must be 'rgb', 'bgr', or 'rgba' .");
      }
      
      if (str_eq(*bts, "rgb"))
	buf_type = PIXEL_FORMAT_RGB8 ;
      else if (str_eq(*bts, "bgr"))
	buf_type = PIXEL_FORMAT_BGR;
      else if (str_eq(*bts, "rgba"))
	buf_type = PIXEL_FORMAT_RGBU;
      
      else
	return VException("first argument must be 'rgb', 'bgr', or 'rgba' .");
  }
  //set buffer type
  FireFly2::getInstance().pixf = buf_type;
  
  FireFly2::getInstance().getFrame( convertedImage);
  
  unsigned int datsize = convertedImage.GetDataSize();
  unsigned char* data = convertedImage.GetData();
  
  node::Buffer *slowBuffer = node::Buffer::New(datsize);
  memcpy(node::Buffer::Data(slowBuffer), data, datsize);
  
  Local<Object> globalObj = Context::GetCurrent()->Global();
  Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
  Handle<Value> constructorArgs[3] = { slowBuffer->handle_, v8::Integer::New(datsize), v8::Integer::New(0) };
  Local<Object> actualBuffer = bufferConstructor->NewInstance(3, constructorArgs);
  
  convertedImage.ReleaseBuffer();
  
  return scope.Close(actualBuffer);
  //return scope.Close(Number::New(datsize));//success
}


Handle<Value> FF2wrapper::getNumCameras(const Arguments& args) {
  if( FireFly2::getInstance().verbose == true){
    cout << "getNumCameras called" << endl;
  }
  
  HandleScope scope; 
  unsigned int numCams = FireFly2::getInstance().getNumberOfCameras();
  return scope.Close(Number::New(numCams));
  
}


Handle<Value> FF2wrapper::startCamera(const Arguments& args) {
  HandleScope scope;
  if( FireFly2::getInstance().verbose == true){
    cout << "startCamera called" << endl;
  }
  FireFly2::getInstance().start();
  return scope.Close(True());
}



Handle<Value> FF2wrapper::getWidth(const Arguments& args) {
  HandleScope scope;
  return scope.Close(Number::New( FireFly2::getInstance().width ));
}
Handle<Value> FF2wrapper::getHeight(const Arguments& args) {
  HandleScope scope;
  return scope.Close(Number::New( FireFly2::getInstance().height ));
}

/*******************************************************************************
 *    Turns the camera auto-gain on or off. The previous value is returned.
 * 
 *    on_off - new state flag.
 * 
 *    03/25/10 (August) - Initial version.
 *    ------------------------------------------------------------------------------*/
Handle<Value> FF2wrapper::autoGain(const Arguments& args)
{
  HandleScope scope;
  // Convert first argument to V8 bool takes a lot
  bool on_off = false;
  if( args[0] == True()){
    on_off = true;
  }
  
  return scope.Close(Boolean::New(FireFly2::getInstance().autoGain(on_off)  ));
}

/*******************************************************************************
 *    Turns the camera auto-gain on or off. The previous value is returned.
 * 
 *    on_off - new state flag.
 * 
 *    03/25/10 (August) - Initial version.
 *    ------------------------------------------------------------------------------*/
Handle<Value> FF2wrapper::autoExposure(const Arguments& args)
{
  HandleScope scope;
  // Convert first argument to V8 bool. UGGH takes a lot
  bool on_off = false;
  if( args[0] == True()){
    on_off = true;
  }
  
  return scope.Close(Boolean::New(FireFly2::getInstance().autoExposure(on_off)  ));
}

Handle<Value>   FF2wrapper::autoWhiteBalance(const Arguments& args)
{
  HandleScope scope;
  bool on_off = false;
  if( args[0] == True()){
    on_off = true;
  }
  return scope.Close(Boolean::New(FireFly2::getInstance().autoWhiteBalance(on_off)  ));
}

Handle<Value> FF2wrapper::frameRate(const Arguments& args) //)
  {
    HandleScope scope;
    FireFly2::getInstance().frameRate();  
    return scope.Close(True());
  }
  
  // set the gain 0 to 255
  Handle<Value> FF2wrapper::gain(const Arguments& args)      
  {
    HandleScope scope;
    float val=128;
    if( args.Length() > 0){
      val = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }
    
    float val2 = FireFly2::getInstance().gain(val); 
    return scope.Close( Number::New(val2));
  }
  
  
  //set exposure in milliseconds
  Handle<Value> FF2wrapper::exposure(const Arguments& args)  
  {
    HandleScope scope;
    float val=128;
    
    if( args.Length() > 0){
      val = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }
    
    float val2 = FireFly2::getInstance().exposure(val); 
    return scope.Close( Number::New(val2));                
  }
  
  //JKG Return shutter in milliseconds
  //void)
  Handle<Value> FF2wrapper::getExposure(const Arguments& args)
  {
    return Number::New( FireFly2::getInstance().getExposure() ); 
  }
  
  //bool onOff)//True is off
  Handle<Value> FF2wrapper::triggerOff(const Arguments& args)
  {
    HandleScope scope;
    bool on_off = false;
    if( args[0] == True()){
      on_off = true;
    }
    return scope.Close(Boolean::New(FireFly2::getInstance().triggerOnOff(on_off)  ));
  }
  
  //float milli seconds
  Handle<Value> FF2wrapper::triggerDelay(const Arguments& args)
  {
    HandleScope scope;
    float mseconds=128;
    if( args.Length() > 0){
      mseconds = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }
    return scope.Close( Boolean::New(FireFly2::getInstance().triggerDelay(mseconds) ));
  }
  
  Handle<Value> FF2wrapper::getCamInfo(const Arguments& args)
  {
    HandleScope scope;
    return scope.Close( String::New( "TODO: implement getCaminfo" ));
  }
  
  //Verobse. true prints stuff to the standard output
  Handle<Value>   FF2wrapper::verbose(const Arguments& args)
  {
    bool on_off = false;
    if( args[0] == True()){
      on_off = true;
    }
    FireFly2::getInstance().verbose = on_off;
    cout << "verbose is " << on_off<<endl;
    return args[0];
  }
  
  
  
  