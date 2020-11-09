@echo off

cd C:\Users\Administrator\Documents\GitHub\vmc-sensetime
git checkout stg
git pull origin stg
call yarn install
call yarn build
call yarn run stage

pause
rem exit