#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <node_buffer.h>
#include "fireflywrap.h"
#include "FlyCapture2.h"
#include "globals.h"
#include <stdio.h>
#include <cstring>
#include <cstdlib>

using namespace v8;
using namespace std;
using namespace FlyCapture2;

FireFlyWrap::FireFlyWrap() {};
FireFlyWrap::~FireFlyWrap() {
  g_camera.Disconnect();
};

extern "C" {
void FireFlyWrap::Init(Handle<Object> target) {
    // Prepare constructor template
    Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
    tpl->SetClassName(String::NewSymbol("FireFlyWrap"));
    tpl->InstanceTemplate()->SetInternalFieldCount(2);        //this is the number of prototypes.
    // Prototype


    tpl->PrototypeTemplate()->Set(String::NewSymbol("getNumCameras"),
                                  FunctionTemplate::New(getNumCameras)->GetFunction());

    tpl->PrototypeTemplate()->Set(String::NewSymbol("startCamera"),
                                  FunctionTemplate::New(startCamera)->GetFunction());

    tpl->PrototypeTemplate()->Set(String::NewSymbol("getCamInfo"),
                                  FunctionTemplate::New(getCamInfo)->GetFunction());

    tpl->PrototypeTemplate()->Set(String::NewSymbol("takePhoto"),
                                  FunctionTemplate::New(takePhoto)->GetFunction());

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

tpl->PrototypeTemplate()->Set(String::NewSymbol("setTriggerMode14"),
                                  FunctionTemplate::New(setTriggerMode14)->GetFunction());


    Persistent<Function> constructor = Persistent<Function>::New(tpl->GetFunction());
    target->Set(String::NewSymbol("FireFlyWrap"), constructor);

}
}
Handle<Value> FireFlyWrap::New(const Arguments& args) {
    HandleScope scope;

    FireFlyWrap* obj = new FireFlyWrap();
    obj->Wrap(args.This());

    return args.This();
}



Handle<Value> FireFlyWrap::getNumCameras(const Arguments& args) {
    HandleScope scope;
    //BusManager busMgr;
    //Error error;

    unsigned int numCameras;
    g_Error = busMgr2.GetNumOfCameras(&numCameras);
    if (g_Error !=  PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }
    
    return scope.Close(Number::New(numCameras));

}

Handle<Value> FireFlyWrap::startCamera(const Arguments& args) {
    HandleScope scope;
    //BusManager busMgr;
    //Error error;
    double i = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    PGRGuid guid;
    g_Error = busMgr2.GetCameraFromIndex(i, &guid);

    if (g_Error !=  PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    // Connect to a camera
    g_Error = g_camera.Connect(&guid);
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    // Get the camera information
    CameraInfo camInfo;
    g_Error = g_camera.GetCameraInfo(&camInfo);
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    //PrintCameraInfo(&camInfo);

    // Start capturing images
    g_Error = g_camera.StartCapture();
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    autoOnOff(GAIN, false);                               //turn off autogain
    autoOnOff(SHUTTER, false);                            //turn off autoexposure

    return scope.Close(Number::New(1));

}



Handle<Value> FireFlyWrap::getCamInfo(const Arguments& args) {
    HandleScope scope;

    CameraInfo pCamInfo;
    g_Error = g_camera.GetCameraInfo(&pCamInfo);
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(String::New("Error getting Camera Info"));
    }

    char s[400];                                            //should be enough space
    sprintf( s,  "\n*** CAMERA INFORMATION ***\n"
             "Serial number - %u\n"
             "Camera model - %s\n"
             "Camera vendor - %s\n"
             "Sensor - %s\n"
             "Resolution - %s\n"
             "Firmware version - %s\n",
             pCamInfo.serialNumber,
             pCamInfo.modelName,
             pCamInfo.vendorName,
             pCamInfo.sensorInfo,
             pCamInfo.sensorResolution,
             pCamInfo.firmwareVersion
             );


    return scope.Close(String::New(s));
}


Handle<Value> FireFlyWrap::takePhoto(const Arguments& args) {
    HandleScope scope;
    Image rawImage;
    
    PixelFormat buf_type = PIXEL_FORMAT_RGB8;
  /*  if (args.Length() >= 1 ) {
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
    */
    // Retrieve an image
    g_Error = g_camera.RetrieveBuffer( &rawImage );
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    // Create a converted image
    Image convertedImage;

    // Convert the raw image
    g_Error = rawImage.Convert(buf_type , &convertedImage );
    if (g_Error != PGRERROR_OK)
    {
        return scope.Close(Number::New(-1));
    }

    unsigned int widt = convertedImage.GetCols();
    unsigned int heigt = convertedImage.GetRows();
    g_cam_height=heigt;
    g_cam_width=widt;
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

Handle<Value> FireFlyWrap::getWidth(const Arguments& args) {
    HandleScope scope;
    return scope.Close(Number::New( g_cam_width));
}
Handle<Value> FireFlyWrap::getHeight(const Arguments& args) {
    HandleScope scope;
    return scope.Close(Number::New( g_cam_height));
}

/*******************************************************************************
    Turns the camera auto-gain on or off. The previous value is returned.

    on_off - new state flag.

    03/25/10 (August) - Initial version.
    ------------------------------------------------------------------------------*/
Handle<Value> FireFlyWrap::autoGain(const Arguments& args)
{
    HandleScope scope;
    // Convert first argument to V8 bool takes a lot
    bool on_off = false;
    if( args[0] == True()){
        on_off = true;
    }

    return scope.Close(Boolean::New(autoOnOff(GAIN, on_off)));
}

/*******************************************************************************
    Turns the camera auto-gain on or off. The previous value is returned.

    on_off - new state flag.

    03/25/10 (August) - Initial version.
    ------------------------------------------------------------------------------*/
Handle<Value> FireFlyWrap::autoExposure(const Arguments& args)
{
    HandleScope scope;
    // Convert first argument to V8 bool. UGGH takes a lot
    bool on_off = false;
    if( args[0] == True()){
        on_off = true;
    }

    return scope.Close( Boolean::New(autoOnOff(SHUTTER, on_off)));
}




/*******************************************************************************
    Turns the camera auto-whitebalance on or off. The previous value is returned.

    on_off - new state flag.

    03/25/10 (August) - Initial version.
    ------------------------------------------------------------------------------*/
//bool on_off)
Handle<Value>   FireFlyWrap::autoWhiteBalance(const Arguments& args)
{
    HandleScope scope;
    // Convert first argument to V8 bool. UGGH takes a lot
    bool on_off = false;
    if( args[0] == True()){
        on_off = true;
    }

    return scope.Close( Boolean::New(autoOnOff(WHITE_BALANCE, on_off)));
}

Handle<Value> FireFlyWrap::frameRate(const Arguments& args) //)
{
   HandleScope scope;
    g_Error = g_camera.SetVideoModeAndFrameRate( VIDEOMODE_640x480Y8 , FRAMERATE_60 );
    if (g_Error != PGRERROR_OK){
        return scope.Close(False());
    }
    return scope.Close(True());

}

/*******************************************************************************
Set the gain.

normalized_value - a camera independent 0.0 to 1.0 gain value.

03/25/10 (August) - Initial version.

Changed by cody to use values from 0 to 255
------------------------------------------------------------------------------*/
Handle<Value> FireFlyWrap::gain(const Arguments& args)      
{
     HandleScope scope;
    float val=0.5;
    Property prop;

    if( args.Length() > 0){
        val = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }

    prop = FlyCapture2::Property(GAIN);
    g_Error = g_camera.GetProperty(&prop);
    prop.valueA = int(val);
    g_Error = g_camera.SetProperty(&prop);

    return scope.Close( Number::New(prop.valueA));
}


/*******************************************************************************
Set the exposure.

parameter - description

03/25/10 (August) - Initial version.
------------------------------------------------------------------------------*/
Handle<Value> FireFlyWrap::exposure(const Arguments& args)  
{
    /* int ranged_value = mix(1, 2047, normalized_value);//JKG 0 bounces between 0 and 511 - with the hardware trigger only ??
  //Documentation says 511, there seem to actually be 2048

  Property prop;
  Error error;

  prop = FlyCapture2::Property(SHUTTER);

  error = m_pCamera->GetProperty(&prop);
  float previousShutter = prop.absValue;
  prop.valueA = ranged_value;
  error = m_pCamera->SetProperty(&prop);
  */
     HandleScope scope;
    Property prop = Property(SHUTTER);
    float val=128;

    if( args.Length() > 0){
        val = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }

    g_Error = g_camera.GetProperty(&prop);
    prop.valueA = int(val);
    g_Error = g_camera.SetProperty(&prop);

    return scope.Close( Number::New(prop.valueA ));                       //previousShutter; //In milliseconds
}

//JKG Return shutter in milliseconds
//void)
Handle<Value> FireFlyWrap::getExposure(const Arguments& args)
{
    Property prop = Property(SHUTTER);
   HandleScope scope;

    g_Error = g_camera.GetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }

    return Number::New(prop.absValue);
}

//bool onOff)//True is off
Handle<Value> FireFlyWrap::triggerOff(const Arguments& args)
{
   HandleScope scope;
    Property prop = Property( TRIGGER_MODE);

    bool on_off = false;
    if( args[0] == True()){
        on_off = true;
    }

    g_Error = g_camera.GetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }

    prop.onOff = on_off;
    g_Error = g_camera.SetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }

    return scope.Close( Boolean::New(prop.onOff));
}

//float seconds)
Handle<Value> FireFlyWrap::triggerDelay(const Arguments& args)
{
     HandleScope scope;
    Property prop = FlyCapture2::Property(TRIGGER_DELAY);
    float seconds=128;

    if( args.Length() > 0){
        seconds = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    }
    g_Error = g_camera.GetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }
    prop.absControl = true;
    prop.autoManualMode = false;
    prop.onOff = true;
    g_Error = g_camera.SetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }
    prop.absValue = seconds;
    g_Error = g_camera.SetProperty(&prop);
    if (g_Error != PGRERROR_OK){   return scope.Close(False()); }

    return scope.Close( Number::New(prop.absValue));
}

//)
Handle<Value> FireFlyWrap::setTriggerMode14(const Arguments& args)
{
     HandleScope scope;
    TriggerMode trigMode;
    g_Error = g_camera.GetTriggerMode(&trigMode);
    if (g_Error != PGRERROR_OK){ 
      return scope.Close(False());
    }

    trigMode.mode = MODE_14;
    g_camera.SetTriggerMode(&trigMode);
    if (g_Error != PGRERROR_OK){ 
      return scope.Close( False()); 
    }
    return scope.Close( True());
}

