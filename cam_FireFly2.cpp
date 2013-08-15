
#include "cam_FireFly2.h"
#include <iostream>
#include "FlyCapture2.h"

using namespace FlyCapture2;
using namespace std;
/*******************************************************************************
 *    CTOR
 * 
 *    03/22/10 (August) - Initial version.
 * 
 *  Modified for PGR FireFly 2
 *  9/27/2010 JKG
 * ------------------------------------------------------------------------------*/
FireFly2::FireFly2()
{
  BusManager busMgr;
  CameraInfo cameraInfo;
  Error error;
  pixf = PIXEL_FORMAT_RGB8;
  myTriggerDelay = 0.0;
  verbose = false;

  if( verbose == true){
    cout << "making camera"<<endl;
  }

  unsigned int count;
  
  busMgr.GetNumOfCameras(&count);
  if (count == 0)
  {
    //m_pCamera = NULL;
    return;
  }
  
  busMgr.GetCameraFromIndex(0, &Guid);
  
  error = m_pCamera.Connect( &Guid );
  if( error != FlyCapture2::PGRERROR_OK )
  {
    //m_pCamera = NULL;
    return;
  }
  
  //This is the name, serial number etc.
  error = m_pCamera.GetCameraInfo(&cameraInfo);
  
  Image image;
  start();
  error = m_pCamera.RetrieveBuffer(&image);
  stop();
  
  //TODO look for errors above, if this is not 640 by 480 there will be problems.
  width = image.GetCols();
  height = image.GetRows();

  if( verbose == true){
    cout << "camera made"<<endl;
  }
}

/*******************************************************************************
 *    DTOR
 * 
 *    03/22/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
FireFly2::~FireFly2()
{
  // if (m_pCamera)
  {
    m_pCamera.Disconnect();
    //delete m_pCamera;
    //m_pCamera = NULL;
  }
}

/*******************************************************************************
 *    Start the camera.
 * 
 *    03/23/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
void FireFly2::start(void)
{
  if( verbose == true){
    cout << "camera starting" <<endl;
  }
  m_pCamera.StartCapture();
}

/*******************************************************************************
 *    Stop the camera.
 * 
 *    03/23/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
void FireFly2::stop(void)
{
  if( verbose == true){
    cout << "camera stopping" << endl;
  }
  m_pCamera.StopCapture();
}

//
//  take a photo and put it into raw image
//
bool FireFly2::getFrame( Image &convertedImage){
  Image rawImage;
  Error error;
  
  PixelFormat buf_type = pixf;
  
  // Retrieve an image
  error = m_pCamera.RetrieveBuffer( &rawImage );
  if (error != PGRERROR_OK)
  {
    return false;
  }
  
  // Convert the raw image
  error = rawImage.Convert(buf_type , &convertedImage );
  if (error != PGRERROR_OK)
  {
    return false;
  }
  
  width = convertedImage.GetCols();
  height = convertedImage.GetRows();
  
  return true;			
}

/*******************************************************************************
 *    Turns the camera auto-gain on or off. The previous value is returned.
 * 
 *        on_off - new state flag.
 * 
 *    03/25/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
bool FireFly2::autoGain(bool on_off)
{
  return autoOnOff(GAIN, on_off);
}

/*******************************************************************************
 *    Turns the camera auto-gain on or off. The previous value is returned.
 * 
 *        on_off - new state flag.
 * 
 *    03/25/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
bool FireFly2::autoExposure(bool on_off)
{
  return autoOnOff(SHUTTER, on_off);
}

/*******************************************************************************
 *  Turns autoManualMode properties on and off, gain etc
 * 
 *  JKG 9/29/2010
 * -------------------------------------------------------------------------------*/
bool FireFly2::autoOnOff(PropertyType propType, bool on_off)
{
  Property prop;
  Error error;
  bool previous;
  
  prop = Property(propType);
  
  error = m_pCamera.GetProperty(&prop);
  previous = prop.autoManualMode;
  prop.autoManualMode = on_off;
  error = m_pCamera.SetProperty(&prop);
  
  return previous;
}

/*******************************************************************************
 *    Turns the camera auto-whitebalance on or off. The previous value is returned.
 * 
 *        on_off - new state flag.
 * 
 *    03/25/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
bool FireFly2::autoWhiteBalance(bool on_off)
{
  return autoOnOff(FlyCapture2::WHITE_BALANCE, on_off);
}

void FireFly2::frameRate()
{
  Error error;
  
  error = m_pCamera.SetVideoModeAndFrameRate( VIDEOMODE_640x480Y8 , FRAMERATE_60 );
  
}

/*******************************************************************************
 *    Set the gain.
 * 
 *		value 0 to 255. usually
 * 
 *    03/25/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
float FireFly2::gain(float value)
{
  
  Property prop;
  Error error;
  
  prop = FlyCapture2::Property(GAIN);
  error = m_pCamera.GetProperty(&prop);
  prop.valueA = value;
  error = m_pCamera.SetProperty(&prop);
  
  return value;
}

float FireFly2::triggerDelay(float seconds)
{
  Property prop;
  Error error;
  //only set if different from old value, because it takes a frame to set.
  if( myTriggerDelay == seconds ){
    if(verbose){cout << "not setting trigger" << endl;}
    return myTriggerDelay;
  }
  if(verbose){ cout << "c++ setting trigger:  "<< myTriggerDelay<< " to " <<seconds << endl;}
  myTriggerDelay = seconds;
  prop = FlyCapture2::Property(TRIGGER_DELAY);
  
  error = m_pCamera.GetProperty(&prop);
  prop.absControl = true;
  prop.autoManualMode = false;
  prop.onOff = true;
  prop.absValue = seconds;
  error = m_pCamera.SetProperty(&prop);
  
  return seconds;
}


/*******************************************************************************
 *    Set the exposure.
 * 
 *        parameter - description
 * 
 *    03/25/10 (August) - Initial version.
 * ------------------------------------------------------------------------------*/
float FireFly2::exposure(float value)
{
  //int ranged_value = mix(1, 2047, normalized_value);//JKG 0 bounces between 0 and 511 - with the hardware trigger only ??  
  //Documentation says 511, there seem to actually be 2048
  
  Property prop;
  Error error;
  
  prop = FlyCapture2::Property(SHUTTER);
  
  error = m_pCamera.GetProperty(&prop);
  prop.valueA = value;
  error = m_pCamera.SetProperty(&prop);
  
  return prop.valueA; //In milliseconds
}

//JKG Return shutter in milliseconds
float FireFly2::getExposure(void)
{
  Property prop;
  Error error;
  
  prop = FlyCapture2::Property(SHUTTER);
  error = m_pCamera.GetProperty(&prop);
  return prop.absValue;
}

bool FireFly2::triggerOnOff(bool onOff)//True is off
{
  Property prop;
  Error error;
  
  prop = FlyCapture2::Property(FlyCapture2::TRIGGER_MODE);
  
  error = m_pCamera.GetProperty(&prop);
  prop.onOff = onOff;
  error = m_pCamera.SetProperty(&prop);
  
  return prop.onOff;
  
}

unsigned int FireFly2::getNumberOfCameras()//True is off
{
  unsigned int numCameras;
  Error error;
  
  error = busMgr.GetNumOfCameras(&numCameras);
  if (error !=  PGRERROR_OK)
  {
    return 0;
  }
  
  return numCameras;
}

