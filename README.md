# scpsync
Node application that syncs a file tree using scp over ssh.

# installation
Clone the module and install it global manually.

```bash
$ git clone https://github.com/Doodle3D/scpsync.git
$ cd scpsync
$ npm install -g .
```

Or install through npm with the global option.

```bash
$ npm install scpsync -g
```

Run the following to see the scpsync help and verify the global install worked.

```bash
$ scpsync -h
```

# setup
Copy the Gruntfile.js to the root folder of your node project.

Adjust the settings variable to your situation. These settings are the arguments that are passed to scpsync.

Create an ssh key on your host machine and apply this ssh command:
```bash
cat ~/.ssh/id_rsa.pub | ssh wifibox 'cat >> /etc/dropbear/authorized_keys'
```

# usage
In your project rool folder call grunt and the scpsync module keeps syncing.

```bash
$ grunt
```
