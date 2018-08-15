<div align="center">
  <img src="https://raw.githubusercontent.com/enKryptIO/ethvm/master/.github/assets/logo.png" alt="ethvm-logo">
  <p>:zap::zap::zap: EthVM Project: An open source blockchain explorer for Ethereum (and related networks) :zap::zap::zap:</p>
  <p>Powered by <a href="https://www.typescriptlang.org/">TypeScript</a> / <a href="https://github.com/socketio/socket.io">Socket.io</a> / <a href="https://github.com/ethereum/go-ethereum">go-ethereum</a> / <a href="https://github.com/rethinkdb/rethinkdb">RethinkDB</a> / <a href="https://redis.io/topics/quickstart">Redis</a></p>
</div>

# EthVM: Ethereum Blockchain Explorer

## Philosophy

We have strong foundations on how an Open Source explorer should be:

- **Empower the people**: Give people the ability to inspect the Ethereum blockchain easily, pretty much like [etherscan](https://etherscan.io/) does.
- **Open source & audit-able**: Having an open source foundation, will guarantee free access to inspect, audit and modify whatever you want or need, without any vendor lock-in.
- **People are the Priority**: People are the most important & their experience trumps all else. If monetization worsens the experience, we don't do it. (e.g. ads)
- **A learning experience, too**: We want to educate about Ethereum, security, privacy, the importance of controlling your own keys, how the blockchain works, and how Ethereum and blockchain technologies enable a better world.
- **Private**: No tracking!!! No emails. No ads. No demographics. We don't even know how many wallets have been generated, let alone who / what / where you are.

## Architecture Overview

To be written...

## Project Structure

To be written...

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing puposes.

## Perequisites

There are two ways to develop on EthVM:

1.  Using `docker`. This will provide the complete experience to develop the whole EthVM project (i.e: backend and frontend at the same time).
2.  Manual method.

So, choose your own path depending on which experience you want to have (keep in mind that using `docker` and `docker-compose` will streamline a lot the different dependencies you need in order to have a proper setup, so, if you want to start developing ASAP, using `docker` will be a better choice. Also, we don't provide support for manual method, so you have to figure out yourself how to connect things properly).

### Setup a local DNS (or edit hosts file)

Internally, this `docker-compose.yaml` uses the great and the mighty [`traefik`](https://traefik.io/) as a frontend proxy. By default, all of the services are exposed under the local domain `.lan`.

So, we recommend you to have a local DNS service like `DNSmasq` (instructions for [OSX](https://gist.github.com/ogrrd/5831371), [Linux](https://wiki.archlinux.org/index.php/dnsmasq) or [Windows](http://www.orbitale.io/2017/12/05/setup-a-dnsmasq-equivalent-on-windows-with-acrylic.html)) to resolve custom domains and to have access directly to the services with the specified domain (alternatively, you can open ports just like a regular `docker-compose` and access those with `localhost`).

Or you can take the classical approach to edit and add these entries in `/etc/hosts` file, just like this:

```sh
127.0.0.1       geth.ethvm.lan
127.0.0.1       rethink.ethvm.lan
127.0.0.1       rethink.dashboard.ethvm.lan
127.0.0.1       ws.ethvm.lan
127.0.0.1       redis.ethvm.lan
127.0.0.1       ethvm.lan
```

### Windows 10

Windows 10 is becoming a very sexy operating system to develop, even with classical *nix applications. 

Although, there are some caveats we need to take care of, for now we have detected the following issues:

* **go-ethereum**: Docker doesn't build properly the image [(reason here)](https://github.com/ethereum/go-ethereum/issues/16828). To solve it, for now, is to use the uploaded version on Docker Hub (so point to the following image: `enkryptio/go-ethereum:latest`)
* **traefik**: The image uses a shared mounted volume, depending on the installed version you have of docker, it may not init properly. [In this thread here's the solution](https://github.com/docker/for-win/issues/1829) (basically, if you use PowerShell, set the environment variable `$Env:COMPOSE_CONVERT_WINDOWS_PATHS=1`).

## Developing

Now that you have done sucessfully the prerequisites steps (yay!), it's time to get your hands dirty. Just make sure you have installed `docker` and `docker-compose` (the more recent, the better).

In order to bring up the project you can issue the following command in the terminal:

```sh
$ docker-compose up -d
```

The very first time you fire this command, it will start building the whole docker images (so the boot time will take several minutes and CPU will start doing heavy work!).

To stop:

```sh
$ docker-compose stop
```

To delete built docker images:

```sh
$ docker-compose rm -s
```

And to check the logs:

```sh
$ docker-compose logs -f # ethvm (you can specify the service name to gather specific logs also)
```

These are just regular `docker-compose` commands, so if you have more questions related to this, the very best you can do is to navigate to the [official documentation](https://docs.docker.com/compose/).

## Contributing

We welcome every kind of contribution, so, please see [CONTRIBUTING](.github/CONTRIBUTING.md) for more details on how to proceed.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

<div align="center">
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="built with love by enKryptIO team" />
</div>
