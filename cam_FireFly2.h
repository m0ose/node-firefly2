
#ifndef AP_CAM_WIN_FF2_H
# define AP_CAM_WIN_FF2_H

//#include "CLEyeMulticam.h"
# include "FlyCapture2.h"



/*******************************************************************************
Copied from PS3 to add FirleFly 2 from Point Grey research.
Should be subclasses.

JKG 9/27/2010
------------------------------------------------------------------------------*/
class FireFly2
{
private:
  FireFly2();
  ~FireFly2();

//FireFly2(FireFly2 const&);              // Don't Implement
//void operator=(FireFly2 const&); // Don't implement
public:
  //singleton. didn't know how else to late start the camera
  //
  // usage   FireFly2::getInstance()->start(); 
  //   or  cout << "gain:" << FireFly2::getInstance()->gain(20); 

  static FireFly2& getInstance()
  {
    static FireFly2 instance;                              // Guaranteed to be destroyed.
    // Instantiated on first use.
    return instance;
  }

  int width;
  int height;
  FlyCapture2::PixelFormat pixf;
  bool verbose;
  float myTriggerDelay;

  void start(void);
  void stop(void);
  bool getFrame( FlyCapture2::Image &convertedImage);
  bool autoOnOff(FlyCapture2::PropertyType propType, bool on_off);
  bool autoGain(bool on_off);
  bool autoExposure(bool on_off);
  bool autoWhiteBalance(bool on_off);
  void frameRate();
  float gain(float value);
  bool triggerOnOff(bool onOff);
  float triggerDelay(float milliseconds);
  float exposure(float value);
  float getExposure(void);
  unsigned int getNumberOfCameras();

protected:
  FlyCapture2::Camera m_pCamera;  
  FlyCapture2::BusManager busMgr;
  FlyCapture2::PGRGuid Guid;

};

#endif                                                      // AP_CAM_WIN_FF2_H