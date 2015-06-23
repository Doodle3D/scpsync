# scpsync
Node application that syncscp a file tree using scp over ssh. Useful in scenario's where a remote machine does not support sshfs, ftp, rsync or other remote file sync methods. Such as an OpenWrt distribution on a router.

# disclaimer
This module is currently in early development stage and not production ready. Use this module at your own risk!

# installation
Clone the module and install it global manually.

```bash
$ git clone https://github.com/Doodle3D/scpsync.git
$ cd scpsync
$ npm install -g .
```

Or install through npm with the global option -g.

```bash
$ npm install scpsync -g
```

Run the following command anywhere on your host machine to see the scpsync help and verify the global install worked.

```bash
$ scpsync -h
```

# setup

## grunt
Initite npm with the following command, this creates the `package.json` file:
```bash
$ npm init
```

Install grunt to the local project directory:
```bash
$ npm install grunt --save-dev
$ npm install grunt-shell --save-dev
```

Copy the Gruntfile.js from this repository to the root folder of your project. Adjust the settings variable in the Gruntfile to your situation. These settings are the arguments that are passed to the scpsync executable node program.

To use the current working directory of the project root as sourcepath, use:
```bash
source: '.',
```
Note that this also copies the Gruntfile.js, package.json and node_mudoles.

## ssh

Add the ssh configuration to access your remote machine in the ~/.ssh/config file. Here is an example:
```bash
Host wifibox
	Hostname 192.168.5.1
	User root
	StrictHostKeyChecking no
	UserKnownHostsFile=/dev/null
```

Create an ssh key on your host machine and apply this ssh command (OpenWrt example):
```bash
cat ~/.ssh/id_rsa.pub | ssh wifibox 'cat >> /etc/dropbear/authorized_keys'
```
More info see [how to setup ssh keys](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2).

# usage
In your project root folder call ```grunt``` and the scpsync module keeps syncing the destinationpath when changes occur in the sourcepath.

```bash
$ grunt
```
