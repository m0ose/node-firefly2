cd  C:\Users\dood\Documents\node-firefly2\examples\
Set-ExecutionPolicy RemoteSigned
Stop-Process -Name anysurface
Stop-Process -Name java
Stop-Process -Name node
Start-Process node .\laserServer3.js
Start-Process chrome http://localhost/simtable_2/
#Start-Process node  C:\Users\dood\Documents\node-firefly2\examples\laserServer3.js 