# Remember
Remember is a script/container to help you remember the docker command you used to start that container that's been running forever but you can't find the tutorial you originally followed to get it up and running in the first place. You can either run it as a node script or run it as a docker container and it will print out the docker run command you used to initially create the container. By default it will just print the image but you can add various flags to get more information if you want it.

## Node Usage
Install the requirements by cloning the repository and running `npm install` inside of it.

```bash
node ./remember.js -c <ContainerName> -pve

Options:
      --version     Show version number                                [boolean]
  -c, --containers  Container/list of containers to remember  [array] [required]
  -p, --ports       Include ports in the output                        [boolean]
  -v, --volumes     Include volumes/mounts in the output               [boolean]
  -e, --env         Include environment variables in the output        [boolean]
  -h, --help        Show help                                          [boolean]
```

## Docker Usage

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock selfhostedpro/remember -c <ContainerName> (-pve)

Options:
      --version     Show version number                                [boolean]
  -c, --containers  Container/list of containers to remember  [array] [required]
  -p, --ports       Include ports in the output                        [boolean]
  -v, --volumes     Include volumes/mounts in the output               [boolean]
  -e, --env         Include environment variables in the output        [boolean]
  -h, --help        Show help                                          [boolean]
```

## Limitations
Currently remember is limited to just grabbing the names, ports, volumes, and environment variables. It also will grab volumes/env variables that weren't manually set such as automatically named volumes or automatically set environment variables. This ensures you'll get exactly the same container.

In the future I'll look into adding labels, restart options, and a docker-compose export option.