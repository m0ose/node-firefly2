{
  'targets': [
    {
      'target_name': 'addon',
      'sources': [
        'addon.cc',
        'FF2wrapper.cpp',
		'cam_FireFly2.cpp'
      ],
      'conditions': [
        ['OS=="linux"', {
          'cflags': [
            '-I/usr/include/flycapture'
          ],
          'ldflags': [
            '-L../../lib -lflycapture'
          ],
          'libraries': [
            '-lflycapture'
          ]
        }],
		  [
                    'OS=="win"', {
					 'defines': [
            'PLATFORM="win32"',
            '_WINDOWS',
            '__WINDOWS__', # ltdl
            'BUILDING_NODE_EXTENSION'
          ],
		  
					    "include_dirs" : [ "C:\Program Files\Point Grey Research\FlyCapture2\include",
											"C:\Program Files\Point Grey Research\FlyCapture2\lib64"	
											],
                        "libraries" : [
                            'C:\Program Files\Point Grey Research\FlyCapture2\lib64\FlyCapture2.lib'
                        ]
                    }
                ]

      ]
    }
  ]
}



