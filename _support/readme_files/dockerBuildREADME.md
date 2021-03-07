# Docker built notes
# ------------------------------------------------------------------------------

## List Docker CLI commands
docker
docker container --help

## Display Docker version and info
docker --version
docker version
docker info

## Execute Docker image
docker run hello-world

## List Docker images
docker image ls

## List Docker containers (running, all, all in quiet mode)
docker container ls
docker container ls --all
docker container ls -aq


# Docker admin notes
# ------------------------------------------------------------------------------

## Start|Stop docker

CentOS: systemctl start|stop docker

## Docker logs

CentOS: journalctl -u docker

== Configure Docker to start on boot

See: https://docs.docker.com/install/linux/linux-postinstall//#configure-docker-to-start-on-boot

Most current Linux distributions (RHEL, CentOS, Fedora, Ubuntu 16.04 and 
higher) use systemd to manage which services start when the system boots. 
Ubuntu 14.10 and below use upstart.

=== systemd

$ sudo systemctl enable docker

To disable this behavior, use disable instead.

$ sudo systemctl disable docker

=== upstart

Docker is automatically configured to start on boot using upstart. To 
disable this behavior, use the following command:

$ echo manual | sudo tee /etc/init/docker.override

=== chkconfig

$ sudo chkconfig docker on

## Restart containers on reboot or Stop

See: https://askubuntu.com/questions/620930/how-do-i-autostart-docker-container-at-system-reboot

A tricky solution is to use restart policy

  sudo docker run --restart=always -d your_image

This means whenever you shut down this will exit your container so as you 
start your host then this lead to restart the docker.

docker run --restart=always -d \
  --name starter_web --volume=$PWD:/j1/data  \
  --publish=4000:4000 \
  -it jekyllone/j1 \
  j1 app




