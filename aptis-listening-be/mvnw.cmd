@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - Location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to enable pausing at the end of the script
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM     set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM ----------------------------------------------------------------------------

@echo off
@rem set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%USERPROFILE%")

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

@rem Add default JVM options here. You can also use JAVA_OPTS and MAVEN_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=

@rem Only toggle echoing if MAVEN_BATCH_ECHO is not set
if not "%MAVEN_BATCH_ECHO%" == "on"  echo off

@rem set command name
set CMD_LINE_ARGS=%*

@rem Detect JVM
if not "%JAVA_HOME%" == "" goto valUseJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
goto fail

:valUseJavaHome
set "JAVA_HOME=%JAVA_HOME:"=%"
set JAVA_EXE=%JAVA_HOME%\bin\java.exe

if exist "%JAVA_EXE%" goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
goto fail

:init
@rem Find the project base dir, i.e. the directory that contains the folder ".mvn".
@rem Fallback to current directory if not found.

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if not "%MAVEN_PROJECTBASEDIR%" == "" goto gotBaseDir

set MAVEN_PROJECTBASEDIR=%~dp0
if not "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

:findBaseDir
if exist "%MAVEN_PROJECTBASEDIR%\.mvn" goto gotBaseDir
set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%\.."
if exist "%MAVEN_PROJECTBASEDIR%\.mvn" goto gotBaseDir
goto defaultBaseDir

:defaultBaseDir
set MAVEN_PROJECTBASEDIR=%~dp0
if not "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

:gotBaseDir

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@rem Extension to allow automatic download of the maven-wrapper.jar from the web
if exist %WRAPPER_JAR% goto run

echo Downloading Maven Wrapper JAR...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', %WRAPPER_JAR%)"
if not "%ERRORLEVEL%" == "0" (
    echo.
    echo ERROR: Failed to download Maven Wrapper JAR.
    echo.
    goto fail
)

:run
@rem Setup the command line
set CLASSPATH=%WRAPPER_JAR%

@rem Start Maven Wrapper
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %MAVEN_OPTS% -classpath %CLASSPATH% %WRAPPER_LAUNCHER% %CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:fail
exit /b 1

:error
exit /b %ERRORLEVEL%

:end
@rem update the task status if necessary
if "%OS%"=="Windows_NT" endlocal
if "%MAVEN_BATCH_PAUSE%" == "on" pause
