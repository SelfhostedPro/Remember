var Docker = require('dockerode');
const yargs = require('yargs');

// Argument parsing
const argv = yargs
    .option('host', {
        alias: 'H',
        description: 'Docker host to connect to',
        type: 'string'
    })
    .option('containers', {
        alias: 'c',
        description: 'Container/list of containers to remember',
        type: 'array',
    })
    .option('ports', {
        alias: 'p',
        description: 'Include ports',
        type: 'boolean',
    })
    .option('volumes', {
        alias: 'v',
        description: 'Include volumes/mounts',
        type: 'boolean',
    })
    .option('env', {
        alias: 'e',
        description: 'Include environment variables',
        type: 'boolean',
    })
    .usage('$0 -c <ContainerNames/IDs> (-pve)')
    .demandOption('containers', 'Please provide the container/list of containers you would like to remember.')
    .help()
    .alias('help', 'h')
    .argv;

/// Future remote host functionality goes here
function getDocker() {
    if (argv.host){
        console.log("Remote host support isn't included yet.")
        return
    } else {
        return new Docker({socketPath: '/var/run/docker.sock'})
    }
}

/// Get container object here and give pass it through the filter to return selected options
async function getContainer(container) {
    var containerObject = await docker.getContainer(container)
    containerObject.inspect(async function (err,data) {
        data.name = container
        var containerData = filterContainerOptions(data)
        return await containerData
    })
}

/// Grab information from container based on flags
async function filterContainerOptions(container) {
    // Empty object for us to add information to
    var filteredContainer = {}
    filteredContainer.name = container.name
    // Add the image that's in use
    filteredContainer.image = container['Config']['Image']

    // Grab ports if requested
    if (argv.ports){
        // Empty array for ports to be pushed to
        var formattedPorts = []
        // Format the ports to be easier to use
        for (port in container.HostConfig.PortBindings){
            let _formattedPort = {}
            _formattedPort.hostPort = container.HostConfig.PortBindings[port][0].HostPort
            _formattedPort.containerPort = port
            // Push port to empty array above
            formattedPorts.push(_formattedPort)
        }
        // Once all ports have been pushed add that to the filteredContainer Objects
        filteredContainer.ports = formattedPorts
    }
    if (argv.volumes){
        // Empty Array for volumes to be added to 
        var formattedVolumes = []
        // Format the mounts to be easier to use
        for (volume in container.Mounts){
            let _volume = {}
            if (container.Mounts[volume].Name){
                // If there is a volume used instead of a bind, use the name instead of the path
                _volume.dest=container.Mounts[volume].Destination
                _volume.source=container.Mounts[volume].Name
                formattedVolumes.push(_volume)
            }else if (container.Mounts[volume].Type='bind'){
                _volume.dest=container.Mounts[volume].Destination
                _volume.source=container.Mounts[volume].Source
                formattedVolumes.push(_volume)
            }  
        }
        filteredContainer.volumes = formattedVolumes
    }
    if (argv.env){
        var formattedEnvs = []
        for (env in container.Config.Env){
            formattedEnvs.push(container.Config.Env[env])
        }
        filteredContainer.envs = formattedEnvs
    }
    buildResponse(filteredContainer)
}

async function buildResponse(container) {
    var baseString = ["docker run -d "]

    // Format ports into a string
    let port_list = []
    let port_flag = '-p '
    if (container.ports){
        for (let port in container.ports){
            // Check to see if the host port is defined, if not then ignore it
            if (container.ports[port].hostPort != '0'){
                port_list.push(port_flag+container.ports[port].hostPort+':'+container.ports[port].containerPort)
            } else {
                port_list.push(port_flag+container.ports[port].containerPort)
            }
        }
        let port_section = port_list.join(' ')
        baseString += port_section + ' '
    }
    if (container.volumes){
        let volume_list = []
        let volume_flag = '-v '
        for (let volume in container.volumes){
            volume_list.push(volume_flag+container.volumes[volume].source+':'+container.volumes[volume].dest)
        }
        let volume_section = volume_list.join(' ')
        baseString += volume_section + ' '
    }
    if (container.envs) {
        let env_list = []
        let env_flag = '-e '
        for (let env in container.envs){
            env_list.push(env_flag + container.envs[env])
        }
        let env_section = env_list.join(' ')
        baseString += env_section + ' '
    }


    let finalstring = container.name + ' Configuration: ' + baseString + '--name '+container.name+' '+ container.image + '\n'
    console.log(finalstring)

}

docker = getDocker()
if (argv.containers) {
    var containerObjects = []
    for (var container in argv.containers) {
        let _container = getContainer(argv.containers[container])
        containerObjects.push(_container)
    }
}



// ListContainers()