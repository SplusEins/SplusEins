# CONCOURSE (CI/CD)

This directory contains files for the concourse pipeline.

More information about the usage of this directory in [the documentation](https://concourse-ci.org/docs.html).


## Basic commands

First download the [fly cli](https://concourse-ci.org/download.html).

```bash
# fly login (if you haven't created a target yet)
$ fly -t <new targetname> login --concourse-url https://ci.spluseins.de

# fly login (with target)
$ fly -t <targetname> login

# fly set pipeline
$ fly -t <targetname> set-pipeline -p spluseins -c pipeline.yml -l credentials.yml

# fly destroy pipeline
$ fly -t <targetname> destroy-pipeline -p spluseins
```