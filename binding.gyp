{
  'targets': [
    {
      'target_name': 'addon',
      'sources': [
        'addon.cc',
        'fireflywrap.cc'
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

      ]
    }
  ]
}


