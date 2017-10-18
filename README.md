# Java-the-Hutts 

<a href="https://zenhub.com"><img src="https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png"></a>
[![Build Status](https://travis-ci.org/javaTheHutts/Java-the-Hutts.svg?branch=Develop)](https://travis-ci.org/javaTheHutts/Java-the-Hutts)
![](https://reposs.herokuapp.com/?path=javaTheHutts/Java-the-Hutts&style=flat)
[![PyPI](https://img.shields.io/pypi/l/Django.svg)]()

Repository for the Java the Hutts team for COS301.

<i>Our website, containing a tutorial video, a link to the live demo and our documentation, can be found at
 <a href="https://javathehutts.github.io/Java-the-Hutts/">https://javathehutts.github.io/Java-the-Hutts/</a>
</i>

## Setup of development environment
You will need to install the following pacakges:

- `virtualenv`
- `pip3.5`
- `python3.5`

To set up the development environment and be able to use `pybuilder`, execute the following commands:

1. `cd` into this repository.
2. `virtualenv -p python3.5 venv` (this creates a virtual environment to work in)
3. `source venv/bin/activate` (this activates the virtual environment in order to use the commands available to it, specifically **PyBuilder**)
4. `pip3.5 install pybuilder` (installs `pybuilder`).
5. `pyb install_dependencies` (installs the necessary dependencies for pybuilder)
6. `pyb` (builds the python project)

When you are finished developing in this environment, simply call `deactivate` in order to exit the virtual environment.

## Building and installing the project
1. Execute `source venv/bin/activate` (you need only do this once in order to enter your virtual environment).
2. Execute `make` in the root folder (the folder where `build.py` and `makefile` is located). This builds the project, runs the unit tests, runs the integration tests, lints the files and creates a portable distribution of the project ready for installation, and installs it in the Python environment.

### Extra tasks
- If you only want to lint the project, run `make lint`.
- If you only want to run the unit tests, run `make utest`.
- For only integration testing, run `make itest`.
- To run both sets of tests only, run `make test`.
- To skip the linting, run `make build`. This will build and run the tests without linting the files.

Once you are finished, execute the command `deactivate` in order to exit your virtual environment.

## Starting the server
1. After building and installing the project, run the script `run.py` in the scripts directory to start the server hosting the API.
2. Requests can then be sent to `http://127.0.0.1:5000/` to use the API.
3. Refer to the User Manual under `documentation/user-manual` for detailed instructions regarding requests, parameters and return types.

## Directory structure
```
.
├── documentation
├── src
│   ├── integrationtest
│   │   └── python
│   ├── main
│   │   ├── python
│   │   └── scripts
│   └── unittest
│       └── python
├── target
│   ├── dist
│   └── reports
└── venv
```

- All the Python packages and commands necessary for the system can be found in `venv`. This directory and its contents is generated when you create your virtual environment. It should not be necessary for you to edit anything within this directory.
- `documentation` contains the documentation of the system. This includes all the LateX and PDF files.
- `target` is generated each time the `pyb` command executed. This directory contains all the generated source code in a structure that is generally used to distribute and install Python applications. Any changes you make here will not be saved when you rebuild the project.
    - `dist` contains the portable distribution and generated source code of the application.
    - `reports` contains all the different reports generated by the unit testing, integration testing and code coverage modules.
- `src` is where all the source code and resources for the application is stored. This includes runnable scripts, classes, unit tests, integration tests, images, etc.
    - `integrationtest/python` is where all the integration tests can be found. Each file should start with the prefix `itest_` followed by the rest of the filename.
    - `unittest/python` is where all the unit tests can be found. Each file should start with the prefix `test_` followed by the rest of the filename.
    - `main/python` is where all the main source code for the application can be found, such as class and function definitions.
    - `main/scripts` contains all the runnable scripts for the application. This is where you will typically find the entry-point into the application.

## Important files
- `build.py` contains the configuration used by PyBuilder to build the project. Any plugins and customized build settings are contained in this file.
- `README.md`. This file explains how the entire system should be built and used. Refer to it before asking any questions about the build process.

## Examples:
# Extraction of a South African ID card.

Hutts Verification allows for easy extraction of identification details from either a South African ID book or card.

When a South African Identification document is provided to Hutts Verification a profile picture with all the necessary text is extracted from the card provided.

![alt text](documentation/media/ExtractAll.gif "Extract All Example ID Card")

# Verify Details.

Hutts Verification focuses on two main verification attributes:
1. Verify face details.
2. Verify text details.

When details are being verified a South African ID book or card should be sent to Hutts Verification. Additionally, a clear and well-lit photo of the individual that should be verified must be provided, with the additional text details that must be verified with that of the card.

After Hutts Verification has finished verification, three scores representing the text verification score, face verification score, and the overall weighted score is returned.

![alt text](documentation/media/Verify.gif "Verify Details")
